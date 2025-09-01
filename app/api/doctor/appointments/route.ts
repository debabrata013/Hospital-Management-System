import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db/connection';
import { getLoggedInUserId } from '../../../../lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const userId = await getLoggedInUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const query = `
      SELECT 
        a.id, 
        a.appointment_date as appointmentDate, 
        a.chief_complaint as reason, 
        a.status,
        p.id as patientId,
        p.name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ? AND DATE(a.appointment_date) = CURDATE()
      ORDER BY a.appointment_date ASC
    `;

    const appointmentsData: any = await executeQuery(query, [userId]);

    const appointments = appointmentsData.map((appt: any) => {
      const [firstName, ...lastNameParts] = appt.name.split(' ');
      const lastName = lastNameParts.join(' ');
      return {
        id: appt.id,
        appointmentDate: appt.appointmentDate,
        reason: appt.reason,
        status: appt.status,
        Patient: {
          id: appt.patientId,
          firstName: firstName || '',
          lastName: lastName || '',
        },
      }
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
