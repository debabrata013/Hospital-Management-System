import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const stats = {
      todayAppointments: 8,
      completedConsultations: 5,
      pendingTasks: 3,
      totalPatients: 45
    };
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
