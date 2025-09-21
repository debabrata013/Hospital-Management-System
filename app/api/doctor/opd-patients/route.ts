import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db/connection';
import { getLoggedInUserId } from '../../../../lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const userId = await getLoggedInUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[OPD-PATIENTS] Received request URL: ${req.url}`);
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    console.log(`[OPD-PATIENTS] Parsed date from URL: ${date}`);
    const status = searchParams.get('status');

    // First, get the logged-in doctor's department
    const [doctorDetails]: any = await executeQuery(`SELECT department FROM users WHERE id = ?`, [userId]);
    if (!doctorDetails || !doctorDetails.department) {
      console.error(`[OPD-PATIENTS] Could not find department for doctor ID: ${userId}`);
      return NextResponse.json({ error: 'Doctor department not found' }, { status: 404 });
    }
    const doctorDepartment = doctorDetails.department;

    // Query for all appointments in the doctor's department for the given date
    let query = `
      SELECT 
        a.id, 
        a.appointment_id,
        a.appointment_date as appointmentDate,
        a.appointment_time as appointmentTime,
        COALESCE(a.notes, a.chief_complaint, a.reason_for_visit, 'General Consultation') as reason, 
        a.status,
        a.appointment_type,
        a.consultation_fee,
        a.created_at,
        a.created_by,
        p.id as patientId,
        p.name,
        p.contact_number,
        p.age,
        p.gender,
        creator.name as createdByName,
        creator.role as createdByRole,
        assigned_doctor.name as doctorName
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users creator ON a.created_by = creator.id
      LEFT JOIN users assigned_doctor ON a.doctor_id = assigned_doctor.id
      WHERE a.department = ? AND DATE(a.appointment_date) = ?
    `;

    const params: (string | number)[] = [doctorDepartment, date];

    // Add status filter if provided
    if (status && status !== 'all') {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.appointment_time ASC, a.created_at ASC';

    console.log('OPD Patients API - About to execute query');
    console.log('OPD Patients API - Doctor ID:', userId);
    console.log('OPD Patients API - Date filter:', date);
    console.log('OPD Patients API - Query:', query);
    console.log('OPD Patients API - Params:', params);
    
    const appointmentsData: any = await executeQuery(query, params);
    console.log('OPD Patients API - Raw appointments data:', appointmentsData);
    console.log('OPD Patients API - Data type:', typeof appointmentsData);
    console.log('OPD Patients API - Is array:', Array.isArray(appointmentsData));
    console.log('OPD Patients API - Length:', appointmentsData?.length);

    // Return empty array if no appointments found
    if (!appointmentsData || appointmentsData.length === 0) {
      console.log('No OPD appointments found for date:', date);
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
        reason: appt.reason,
        status: appt.status,
        appointmentType: appt.appointment_type,
        consultationFee: appt.consultation_fee,
        createdAt: appt.created_at,
        doctorName: appt.doctorName, // Add assigned doctor's name
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

    console.log('OPD Patients API - Processed appointments:', appointments.length);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching OPD patients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
