import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { createInvoiceSchema } from '@/lib/validations/billing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const billingService = new BillingService();

// Bulk operations schema
const bulkInvoiceSchema = z.object({
  invoices: z.array(createInvoiceSchema).min(1).max(100), // Limit to 100 invoices per batch
  validateOnly: z.boolean().optional().default(false)
});

const bulkPaymentSchema = z.object({
  payments: z.array(z.object({
    invoiceId: z.string(),
    amount: z.number().positive(),
    paymentMethod: z.enum(['cash', 'card', 'upi', 'net_banking', 'insurance']),
    notes: z.string().optional()
  })).min(1).max(50), // Limit to 50 payments per batch
  validateOnly: z.boolean().optional().default(false)
});

// POST /api/billing/bulk - Bulk operations (invoices, payments, etc.)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!['admin', 'billing_manager', 'billing_staff'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions for bulk operations' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { operation } = body;

    if (!operation) {
      return NextResponse.json(
        { success: false, error: 'Operation type is required' },
        { status: 400 }
      );
    }

    let result;
    switch (operation) {
      case 'create_invoices':
        result = await handleBulkInvoiceCreation(body, session.user.id);
        break;
      case 'process_payments':
        result = await handleBulkPaymentProcessing(body, session.user.id);
        break;
      case 'update_statuses':
        result = await handleBulkStatusUpdate(body, session.user.id);
        break;
      case 'send_reminders':
        result = await handleBulkReminderSending(body, session.user.id);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Bulk ${operation} completed successfully`
    });

  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { success: false, error: 'Bulk operation failed' },
      { status: 500 }
    );
  }
}

// Helper function for bulk invoice creation
async function handleBulkInvoiceCreation(body: any, userId: string) {
  const validation = bulkInvoiceSchema.safeParse(body);
  if (!validation.success) {
    throw new Error(`Invalid bulk invoice data: ${validation.error.message}`);
  }

  const { invoices, validateOnly } = validation.data;
  
  if (validateOnly) {
    // Just validate without creating
    const validationResults = invoices.map((invoice, index) => ({
      index,
      valid: createInvoiceSchema.safeParse(invoice).success,
      errors: createInvoiceSchema.safeParse(invoice).error?.errors || []
    }));

    return {
      operation: 'validate_invoices',
      totalInvoices: invoices.length,
      validInvoices: validationResults.filter(r => r.valid).length,
      invalidInvoices: validationResults.filter(r => !r.valid).length,
      validationResults
    };
  }

  // Create invoices in batches
  const results = [];
  const batchSize = 10;
  
  for (let i = 0; i < invoices.length; i += batchSize) {
    const batch = invoices.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(invoice => billingService.createInvoice({
        ...invoice,
        createdBy: userId
      }))
    );

    results.push(...batchResults);
  }

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return {
    operation: 'create_invoices',
    totalInvoices: invoices.length,
    successful,
    failed,
    results: results.map((result, index) => ({
      index,
      status: result.status,
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }))
  };
}

// Helper function for bulk payment processing
async function handleBulkPaymentProcessing(body: any, userId: string) {
  const validation = bulkPaymentSchema.safeParse(body);
  if (!validation.success) {
    throw new Error(`Invalid bulk payment data: ${validation.error.message}`);
  }

  const { payments, validateOnly } = validation.data;

  if (validateOnly) {
    // Validate payments without processing
    const validationResults = await Promise.all(
      payments.map(async (payment, index) => {
        try {
          const invoice = await billingService.getInvoiceById(payment.invoiceId);
          const canPay = invoice && invoice.status !== 'paid' && invoice.outstandingAmount >= payment.amount;
          
          return {
            index,
            valid: canPay,
            errors: canPay ? [] : ['Invoice not found, already paid, or insufficient outstanding amount']
          };
        } catch (error) {
          return {
            index,
            valid: false,
            errors: [error.message]
          };
        }
      })
    );

    return {
      operation: 'validate_payments',
      totalPayments: payments.length,
      validPayments: validationResults.filter(r => r.valid).length,
      invalidPayments: validationResults.filter(r => !r.valid).length,
      validationResults
    };
  }

  // Process payments in batches
  const results = [];
  const batchSize = 5; // Smaller batch size for payments
  
  for (let i = 0; i < payments.length; i += batchSize) {
    const batch = payments.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(payment => billingService.processPayment({
        ...payment,
        processedBy: userId
      }))
    );

    results.push(...batchResults);
  }

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return {
    operation: 'process_payments',
    totalPayments: payments.length,
    successful,
    failed,
    results: results.map((result, index) => ({
      index,
      status: result.status,
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }))
  };
}

// Helper function for bulk status updates
async function handleBulkStatusUpdate(body: any, userId: string) {
  const { invoiceIds, status, notes } = body;

  if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
    throw new Error('Invoice IDs are required');
  }

  if (!status) {
    throw new Error('Status is required');
  }

  const validStatuses = ['draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  const results = await Promise.allSettled(
    invoiceIds.map(invoiceId => 
      billingService.updateInvoiceStatus(invoiceId, status, userId, notes)
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return {
    operation: 'update_statuses',
    totalInvoices: invoiceIds.length,
    successful,
    failed,
    newStatus: status,
    results: results.map((result, index) => ({
      invoiceId: invoiceIds[index],
      status: result.status,
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }))
  };
}

// Helper function for bulk reminder sending
async function handleBulkReminderSending(body: any, userId: string) {
  const { invoiceIds, reminderType, customMessage } = body;

  if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
    throw new Error('Invoice IDs are required');
  }

  const validReminderTypes = ['email', 'sms', 'both'];
  if (!reminderType || !validReminderTypes.includes(reminderType)) {
    throw new Error('Valid reminder type is required');
  }

  const result = await billingService.sendPaymentReminders({
    invoiceIds,
    reminderType,
    customMessage,
    sentBy: userId
  });

  return {
    operation: 'send_reminders',
    totalInvoices: invoiceIds.length,
    successful: result.successCount,
    failed: result.failureCount,
    reminderType,
    details: result.details
  };
}
