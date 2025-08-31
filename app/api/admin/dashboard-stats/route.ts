import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Mock dashboard statistics
    const stats = {
      totalAppointments: 24,
      completedAppointments: 18,
      admittedPatients: 12,
      availableBeds: 8,
      criticalAlerts: 3,
      todayRevenue: 45000
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
