import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { PaymentGatewayService } from '@/lib/services/payment-gateway';
import { 
  processPaymentSchema, 
  refundPaymentSchema,
  paymentQuerySchema 
} from '@/lib/validations/billing';
import { getServerSession } from '@/lib/auth';

const billingService = new BillingService();
const paymentGateway = new PaymentGatewayService();

// GET /api/billing/payments - Get payment history
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
      invoiceId: searchParams.get('invoiceId'),
      patientId: searchParams.get('patientId'),
      paymentMethod: searchParams.get('paymentMethod'),
      status: searchParams.get('status'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo')
    };

    const validation = paymentQuerySchema.safeParse(queryParams);
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

    const result = await billingService.getPaymentHistory(validation.data);

    return NextResponse.json({
      success: true,
      data: result.payments,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/billing/payments - Process payment
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
    if (!['admin', 'billing_staff', 'cashier'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = processPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid payment data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const paymentData = {
      ...validation.data,
      processedBy: session.user.id
    };

    // Process payment through gateway (if not cash)
    let gatewayResponse = null;
    if (paymentData.paymentMethod !== 'cash') {
      gatewayResponse = await paymentGateway.processPayment({
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        currency: 'INR',
        orderId: `INV-${paymentData.invoiceId}-${Date.now()}`,
        customerInfo: {
          name: paymentData.customerName || 'Hospital Patient',
          email: paymentData.customerEmail,
          phone: paymentData.customerPhone
        },
        metadata: {
          invoiceId: paymentData.invoiceId,
          hospitalId: session.user.hospitalId
        }
      });

      if (!gatewayResponse.success) {
        return NextResponse.json({
          success: false,
          error: 'Payment processing failed',
          details: gatewayResponse.error
        }, { status: 400 });
      }
    }

    // Record payment in billing system
    const payment = await billingService.processPayment({
      ...paymentData,
      gatewayTransactionId: gatewayResponse?.transactionId,
      gatewayResponse: gatewayResponse
    });

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    
    if (error.message.includes('Invoice not found')) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('already paid')) {
      return NextResponse.json(
        { success: false, error: 'Invoice already paid' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

// PUT /api/billing/payments - Refund payment
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin and billing managers can process refunds
    if (!['admin', 'billing_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions for refunds' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = refundPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid refund data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const refundData = {
      ...validation.data,
      processedBy: session.user.id
    };

    // Process refund through gateway if original payment was not cash
    let gatewayRefund = null;
    const originalPayment = await billingService.getPaymentById(refundData.paymentId);
    
    if (originalPayment.paymentMethod !== 'cash' && originalPayment.gatewayTransactionId) {
      gatewayRefund = await paymentGateway.refundPayment({
        transactionId: originalPayment.gatewayTransactionId,
        amount: refundData.amount,
        reason: refundData.reason
      });

      if (!gatewayRefund.success) {
        return NextResponse.json({
          success: false,
          error: 'Gateway refund failed',
          details: gatewayRefund.error
        }, { status: 400 });
      }
    }

    // Record refund in billing system
    const refund = await billingService.processRefund({
      ...refundData,
      gatewayRefundId: gatewayRefund?.refundId,
      gatewayResponse: gatewayRefund
    });

    return NextResponse.json({
      success: true,
      data: refund,
      message: 'Refund processed successfully'
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    
    if (error.message.includes('Payment not found')) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('already refunded')) {
      return NextResponse.json(
        { success: false, error: 'Payment already refunded' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Refund processing failed' },
      { status: 500 }
    );
  }
}
