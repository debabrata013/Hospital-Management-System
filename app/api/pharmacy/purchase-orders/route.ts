import { NextRequest, NextResponse } from 'next/server';
import { PharmacyExtendedService } from '@/lib/services/pharmacy-extended';
import { 
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema 
} from '@/lib/validations/pharmacy';
import { getServerSession } from '@/lib/auth';

const pharmacyService = new PharmacyExtendedService();

// GET /api/pharmacy/purchase-orders - Get purchase orders
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
      limit: parseInt(searchParams.get('limit') || '20'),
      vendorId: searchParams.get('vendorId'),
      status: searchParams.get('status'),
      urgency: searchParams.get('urgency'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      sortBy: searchParams.get('sortBy') || 'orderDate',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    };

    // Mock response for now
    const mockResult = {
      purchaseOrders: [],
      pagination: {
        page: queryParams.page,
        limit: queryParams.limit,
        total: 0,
        totalPages: 0
      }
    };

    return NextResponse.json({
      success: true,
      data: mockResult.purchaseOrders,
      pagination: mockResult.pagination
    });

  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pharmacy/purchase-orders - Create new purchase order
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
    if (!['admin', 'pharmacy_manager', 'procurement_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createPurchaseOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid purchase order data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const purchaseOrder = await pharmacyService.createPurchaseOrder(
      validation.data,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: purchaseOrder,
      message: 'Purchase order created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating purchase order:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}

// PUT /api/pharmacy/purchase-orders - Update purchase order
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!['admin', 'pharmacy_manager', 'procurement_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updatePurchaseOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid update data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    // Mock response for now
    const mockPurchaseOrder = {
      purchaseOrderId: validation.data.purchaseOrderId,
      status: validation.data.status,
      notes: validation.data.notes,
      lastUpdatedBy: session.user.id,
      lastUpdated: Date.now()
    };

    return NextResponse.json({
      success: true,
      data: mockPurchaseOrder,
      message: 'Purchase order updated successfully'
    });

  } catch (error) {
    console.error('Error updating purchase order:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update purchase order' },
      { status: 500 }
    );
  }
}
