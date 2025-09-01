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
        p.id,
        p.name,
        p.date_of_birth as dateOfBirth,
        MAX(a.appointment_date) as lastVisit,
        a.status
      FROM patients p
      JOIN appointments a ON p.id = a.patient_id
      WHERE a.doctor_id = ?
      GROUP BY p.id, p.name, p.date_of_birth, a.status
      ORDER BY lastVisit DESC
      LIMIT 5
    `;

    const patientsData: any = await executeQuery(query, [userId]);

    const patients = patientsData.map((p: any) => {
      const [firstName, ...lastNameParts] = p.name.split(' ');
      const lastName = lastNameParts.join(' ');
      return {
        id: p.id,
        firstName: firstName || '',
        lastName: lastName || '',
        age: p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : null,
        lastVisit: p.lastVisit,
        status: p.status,
      }
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching recent patients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
