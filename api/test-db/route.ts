import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock database test
    const dbStatus = {
      connected: true,
      database: 'hospital_management',
      collections: ['users', 'patients', 'appointments'],
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: dbStatus,
      message: 'Database connection test successful'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    );
  }
}
