import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { getServerSession } from '@/lib/auth';

const billingService = new BillingService();

// GET /api/billing/invoices/[id] - Get specific invoice details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const invoiceId = params.id;
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    const invoice = await billingService.getInvoiceById(invoiceId);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view this invoice
    const canView = await billingService.checkInvoiceAccess(
      invoiceId,
      session.user.id,
      session.user.role
    );

    if (!canView) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this invoice' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/billing/invoices/[id] - Update invoice status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!['admin', 'billing_staff', 'billing_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const invoiceId = params.id;
    const body = await request.json();
    const { status, notes } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updatedInvoice = await billingService.updateInvoiceStatus(
      invoiceId,
      status,
      session.user.id,
      notes
    );

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: `Invoice status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating invoice status:', error);
    
    if (error.message.includes('Invoice not found')) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('Invalid status transition')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update invoice status' },
      { status: 500 }
    );
  }
}

// DELETE /api/billing/invoices/[id] - Cancel/Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins and billing managers can delete invoices
    if (!['admin', 'billing_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions for invoice deletion' },
        { status: 403 }
      );
    }

    const invoiceId = params.id;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason');

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    const result = await billingService.cancelInvoice(
      invoiceId,
      session.user.id,
      reason || 'Invoice cancelled by administrator'
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Invoice cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling invoice:', error);
    
    if (error.message.includes('Invoice not found')) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('cannot be cancelled')) {
      return NextResponse.json(
        { success: false, error: 'Paid invoices cannot be cancelled' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to cancel invoice' },
      { status: 500 }
    );
  }
}
