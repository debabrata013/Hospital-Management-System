import { NextRequest, NextResponse } from 'next/server';

// GET /api/billing/payments - Get payment history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock payment history data
    const payments = [
      {
        id: '1',
        invoiceId: 'INV-001',
        amount: 5000,
        paymentMethod: 'cash',
        status: 'completed',
        date: new Date().toISOString(),
        customerName: 'राम शर्मा'
      },
      {
        id: '2',
        invoiceId: 'INV-002',
        amount: 3500,
        paymentMethod: 'upi',
        status: 'completed',
        date: new Date().toISOString(),
        customerName: 'सीता देवी'
      }
    ];

    return NextResponse.json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total: payments.length,
        totalPages: Math.ceil(payments.length / limit)
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
    const body = await request.json();

    // Mock payment processing
    const payment = {
      id: Date.now().toString(),
      invoiceId: body.invoiceId || 'INV-' + Date.now(),
      amount: body.amount || 0,
      paymentMethod: body.paymentMode || 'cash',
      status: 'completed',
      transactionId: 'TXN-' + Date.now(),
      processedAt: new Date().toISOString(),
      processedBy: 'admin'
    };

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

// PUT /api/billing/payments - Refund payment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock refund processing
    const refund = {
      id: Date.now().toString(),
      paymentId: body.paymentId || 'PAY-' + Date.now(),
      amount: body.amount || 0,
      reason: body.reason || 'Customer request',
      status: 'completed',
      processedAt: new Date().toISOString(),
      processedBy: 'admin'
    };

    return NextResponse.json({
      success: true,
      data: refund,
      message: 'Refund processed successfully'
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { success: false, error: 'Refund processing failed' },
      { status: 500 }
    );
  }
}
