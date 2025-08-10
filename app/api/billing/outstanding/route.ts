import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { getServerSession } from '@/lib/auth';

const billingService = new BillingService();

// GET /api/billing/outstanding - Get outstanding payments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!['admin', 'billing_staff', 'billing_manager', 'finance_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      patientId: searchParams.get('patientId'),
      department: searchParams.get('department'),
      overdueDays: parseInt(searchParams.get('overdueDays') || '0'),
      minAmount: parseFloat(searchParams.get('minAmount') || '0'),
      maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')) : undefined,
      sortBy: searchParams.get('sortBy') || 'dueDate',
      sortOrder: searchParams.get('sortOrder') || 'asc'
    };

    const result = await billingService.getOutstandingPayments(queryParams);

    // Calculate summary statistics
    const summary = {
      totalOutstanding: result.outstanding.reduce((sum, invoice) => sum + invoice.outstandingAmount, 0),
      totalInvoices: result.total,
      overdueInvoices: result.outstanding.filter(inv => inv.isOverdue).length,
      averageOutstanding: result.total > 0 ? 
        result.outstanding.reduce((sum, invoice) => sum + invoice.outstandingAmount, 0) / result.total : 0
    };

    return NextResponse.json({
      success: true,
      data: result.outstanding,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      },
      summary
    });

  } catch (error) {
    console.error('Error fetching outstanding payments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/billing/outstanding - Send payment reminders
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
    if (!['admin', 'billing_staff', 'billing_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { invoiceIds, reminderType, customMessage } = body;

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice IDs are required' },
        { status: 400 }
      );
    }

    const validReminderTypes = ['email', 'sms', 'both'];
    if (!reminderType || !validReminderTypes.includes(reminderType)) {
      return NextResponse.json(
        { success: false, error: 'Valid reminder type is required (email, sms, both)' },
        { status: 400 }
      );
    }

    const result = await billingService.sendPaymentReminders({
      invoiceIds,
      reminderType,
      customMessage,
      sentBy: session.user.id
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Payment reminders sent successfully to ${result.successCount} recipients`
    });

  } catch (error) {
    console.error('Error sending payment reminders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send payment reminders' },
      { status: 500 }
    );
  }
}

// PUT /api/billing/outstanding - Mark invoices as overdue
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
    if (!['admin', 'billing_manager', 'finance_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, invoiceIds, notes } = body;

    if (!action || !['mark_overdue', 'write_off', 'payment_plan'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Valid action is required (mark_overdue, write_off, payment_plan)' },
        { status: 400 }
      );
    }

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice IDs are required' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'mark_overdue':
        result = await billingService.markInvoicesOverdue(invoiceIds, session.user.id, notes);
        break;
      case 'write_off':
        result = await billingService.writeOffInvoices(invoiceIds, session.user.id, notes);
        break;
      case 'payment_plan':
        result = await billingService.createPaymentPlan(invoiceIds, session.user.id, notes);
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Action ${action} completed successfully for ${result.processedCount} invoices`
    });

  } catch (error) {
    console.error('Error processing outstanding invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process outstanding invoices' },
      { status: 500 }
    );
  }
}
