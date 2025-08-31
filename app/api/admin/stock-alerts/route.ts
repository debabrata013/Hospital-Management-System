import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Mock stock alerts data
    const stockAlerts = [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        quantity: 15,
        lowStockThreshold: 50,
        category: 'Pain Relief'
      },
      {
        id: '2',
        name: 'Insulin Injection',
        quantity: 8,
        lowStockThreshold: 25,
        category: 'Diabetes'
      },
      {
        id: '3',
        name: 'Surgical Gloves',
        quantity: 20,
        lowStockThreshold: 100,
        category: 'Medical Supplies'
      }
    ];

    return NextResponse.json(stockAlerts);
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
