import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const shifts = [
      {
        id: '1',
        staffId: 'STAFF001',
        staffName: 'Dr. अमित गुप्ता',
        date: new Date().toISOString(),
        startTime: '09:00',
        endTime: '17:00',
        status: 'scheduled'
      }
    ];

    return NextResponse.json({
      success: true,
      data: shifts
    });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const shift = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: shift
    });
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
