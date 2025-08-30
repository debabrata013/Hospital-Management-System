import { NextRequest, NextResponse } from 'next/server';

// GET /api/billing - Get invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const invoices = [
      {
        id: 'INV-001',
        patientId: 'PAT-001',
        patientName: 'राम शर्मा',
        amount: 5000,
        status: 'paid',
        date: new Date().toISOString()
      },
      {
        id: 'INV-002',
        patientId: 'PAT-002',
        patientName: 'सीता देवी',
        amount: 3500,
        status: 'pending',
        date: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total: invoices.length,
        totalPages: Math.ceil(invoices.length / limit)
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

// POST /api/billing - Create invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const invoice = {
      id: 'INV-' + Date.now(),
      patientId: body.patientId,
      items: body.items || [],
      amount: body.amount || 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/billing - Update invoice
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const updatedInvoice = {
      id: body.invoiceId || 'INV-' + Date.now(),
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedInvoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
