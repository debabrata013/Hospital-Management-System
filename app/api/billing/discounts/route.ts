import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { 
  applyDiscountSchema, 
  discountApprovalSchema,
  discountQuerySchema 
} from '@/lib/validations/billing';
import { getServerSession } from '@/lib/auth';

const billingService = new BillingService();

// GET /api/billing/discounts - Get discount history and pending approvals
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      status: searchParams.get('status'),
      invoiceId: searchParams.get('invoiceId'),
      requestedBy: searchParams.get('requestedBy'),
      approvedBy: searchParams.get('approvedBy'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      pendingOnly: searchParams.get('pendingOnly') === 'true'
    };

    const validation = discountQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const result = await billingService.getDiscountHistory(validation.data);

    return NextResponse.json({
      success: true,
      data: result.discounts,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching discount history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/billing/discounts - Apply discount to invoice
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!['admin', 'billing_staff', 'doctor', 'billing_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = applyDiscountSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid discount data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const discountData = {
      ...validation.data,
      requestedBy: session.user.id
    };

    // Check if discount requires approval based on amount/percentage
    const requiresApproval = await billingService.checkDiscountApprovalRequired(
      discountData.discountType,
      discountData.discountValue,
      session.user.role
    );

    let result;
    if (requiresApproval) {
      // Create discount request for approval
      result = await billingService.createDiscountRequest(discountData);
      
      return NextResponse.json({
        success: true,
        data: result,
        message: 'Discount request created and pending approval',
        requiresApproval: true
      });
    } else {
      // Apply discount directly
      result = await billingService.applyDiscount({
        ...discountData,
        approvedBy: session.user.id,
        approvedAt: new Date(),
        status: 'approved'
      });

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Discount applied successfully',
        requiresApproval: false
      });
    }

  } catch (error) {
    console.error('Error applying discount:', error);
    
    if (error.message.includes('Invoice not found')) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('already has discount')) {
      return NextResponse.json(
        { success: false, error: 'Invoice already has a discount applied' },
        { status: 400 }
      );
    }

    if (error.message.includes('exceeds maximum')) {
      return NextResponse.json(
        { success: false, error: 'Discount exceeds maximum allowed limit' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to apply discount' },
      { status: 500 }
    );
  }
}

// PUT /api/billing/discounts - Approve or reject discount request
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only managers and admins can approve discounts
    if (!['admin', 'billing_manager', 'finance_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions for discount approval' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = discountApprovalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid approval data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const approvalData = {
      ...validation.data,
      approvedBy: session.user.id,
      approvedAt: new Date()
    };

    const result = await billingService.processDiscountApproval(approvalData);

    const message = approvalData.status === 'approved' 
      ? 'Discount approved and applied successfully'
      : 'Discount request rejected';

    return NextResponse.json({
      success: true,
      data: result,
      message
    });

  } catch (error) {
    console.error('Error processing discount approval:', error);
    
    if (error.message.includes('Discount request not found')) {
      return NextResponse.json(
        { success: false, error: 'Discount request not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('already processed')) {
      return NextResponse.json(
        { success: false, error: 'Discount request already processed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process discount approval' },
      { status: 500 }
    );
  }
}

// DELETE /api/billing/discounts - Remove discount from invoice
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only managers and admins can remove discounts
    if (!['admin', 'billing_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions for discount removal' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const discountId = searchParams.get('discountId');
    const reason = searchParams.get('reason');

    if (!discountId) {
      return NextResponse.json(
        { success: false, error: 'Discount ID is required' },
        { status: 400 }
      );
    }

    const result = await billingService.removeDiscount(
      discountId,
      session.user.id,
      reason || 'Discount removed by administrator'
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Discount removed successfully'
    });

  } catch (error) {
    console.error('Error removing discount:', error);
    
    if (error.message.includes('Discount not found')) {
      return NextResponse.json(
        { success: false, error: 'Discount not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('cannot be removed')) {
      return NextResponse.json(
        { success: false, error: 'Discount cannot be removed after payment' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to remove discount' },
      { status: 500 }
    );
  }
}
