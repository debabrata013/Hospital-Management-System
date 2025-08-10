import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { 
  createInvoiceSchema, 
  updateInvoiceSchema,
  invoiceQuerySchema 
} from '@/lib/validations/billing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const billingService = new BillingService();

// GET /api/billing - Get invoices with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
      patientId: searchParams.get('patientId'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      search: searchParams.get('search')
    };

    const validation = invoiceQuerySchema.safeParse(queryParams);
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

    const result = await billingService.getInvoices(validation.data);

    return NextResponse.json({
      success: true,
      data: result.invoices,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/billing - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has billing permissions
    if (!['admin', 'billing_staff', 'doctor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createInvoiceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid invoice data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const invoiceData = {
      ...validation.data,
      createdBy: session.user.id
    };

    const invoice = await billingService.createInvoice(invoiceData);

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating invoice:', error);
    
    if (error.message.includes('Patient not found')) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

// PUT /api/billing - Update invoice
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!['admin', 'billing_staff'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateInvoiceSchema.safeParse(body);

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

    const updatedInvoice = await billingService.updateInvoice(
      validation.data.invoiceId,
      validation.data.updates,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice updated successfully'
    });

  } catch (error) {
    console.error('Error updating invoice:', error);
    
    if (error.message.includes('Invoice not found')) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('Cannot modify')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}
