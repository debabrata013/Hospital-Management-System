import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db/connection';
import { getLoggedInUserId } from '../../../../lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const userId = await getLoggedInUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's appointments count
    const todayAppointmentsQuery = `
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE doctor_id = ? AND DATE(appointment_date) = CURDATE()
    `;

    // Get total patients under this doctor's care
    const totalPatientsQuery = `
      SELECT COUNT(DISTINCT patient_id) as count 
      FROM appointments 
      WHERE doctor_id = ?
    `;

    // Get emergency calls (appointments with high priority or emergency status)
    const emergencyCallsQuery = `
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE doctor_id = ? 
        AND DATE(appointment_date) = CURDATE()
        AND (status = 'emergency' OR chief_complaint LIKE '%emergency%' OR chief_complaint LIKE '%urgent%')
    `;

    // Get surgeries today (if you have a surgeries table, otherwise use appointments)
    const surgeriesTodayQuery = `
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE doctor_id = ? 
        AND DATE(appointment_date) = CURDATE()
        AND (chief_complaint LIKE '%surgery%' OR chief_complaint LIKE '%operation%')
    `;

    const [
      todayAppointmentsResult,
      totalPatientsResult,
      emergencyCallsResult,
      surgeriesTodayResult
    ] = await Promise.all([
      executeQuery(todayAppointmentsQuery, [userId]),
      executeQuery(totalPatientsQuery, [userId]),
      executeQuery(emergencyCallsQuery, [userId]),
      executeQuery(surgeriesTodayQuery, [userId])
    ]);

    const stats = {
      todaysAppointments: (todayAppointmentsResult as any[])[0]?.count || 0,
      totalPatients: (totalPatientsResult as any[])[0]?.count || 0,
      emergencyCalls: (emergencyCallsResult as any[])[0]?.count || 0,
      surgeriesToday: (surgeriesTodayResult as any[])[0]?.count || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
