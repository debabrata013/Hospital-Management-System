import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db/connection';
import { getLoggedInUserId } from '../../../../lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const userId = await getLoggedInUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get doctor's department first
    const doctorQuery = `SELECT department FROM users WHERE id = ? AND role = 'doctor'`;
    const doctorData: any = await executeQuery(doctorQuery, [userId]);
    
    if (!doctorData || doctorData.length === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }
    
    const doctorDepartment = doctorData[0].department;
    console.log('Doctor department:', doctorDepartment);

    const query = `
      SELECT 
        a.id, 
        a.appointment_id,
        a.appointment_date as appointmentDate,
        a.appointment_time as appointmentTime,
        a.department,
        COALESCE(a.notes, a.chief_complaint, a.reason_for_visit, 'General Consultation') as reason, 
        a.status,
        a.appointment_type,
        a.consultation_fee,
        a.created_at,
        p.id as patientId,
        p.name,
        p.contact_number,
        p.age,
        p.gender,
        creator.name as createdByName,
        creator.role as createdByRole
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users creator ON a.created_by = creator.id
      WHERE (a.doctor_id = ? OR a.department = ?) 
        AND a.status NOT IN ('cancelled', 'completed')
      ORDER BY a.appointment_date DESC, a.appointment_time ASC
      LIMIT 50
    `;

    const appointmentsData: any = await executeQuery(query, [userId, doctorDepartment]);
    console.log('Raw appointments data:', appointmentsData); // Debug log
    console.log('Doctor ID:', userId); // Debug log

    // If no appointments for today, return empty array
    if (!appointmentsData || appointmentsData.length === 0) {
      console.log('No appointments found for today');
      return NextResponse.json([]);
    }

    const appointments = appointmentsData.map((appt: any) => {
      const [firstName, ...lastNameParts] = appt.name.split(' ');
      const lastName = lastNameParts.join(' ');
      return {
        id: appt.id,
        appointmentId: appt.appointment_id,
        appointmentDate: appt.appointmentDate,
        appointmentTime: appt.appointmentTime,
        department: appt.department,
        reason: appt.reason,
        status: appt.status,
        appointmentType: appt.appointment_type,
        consultationFee: appt.consultation_fee,
        createdAt: appt.created_at,
        createdBy: {
          name: appt.createdByName,
          role: appt.createdByRole
        },
        Patient: {
          id: appt.patientId,
          firstName: firstName || '',
          lastName: lastName || '',
          contactNumber: appt.contact_number,
          age: appt.age,
          gender: appt.gender
        },
      }
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
