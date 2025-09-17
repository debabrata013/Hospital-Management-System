import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'

interface DoctorDetails {
  id: number;
  doctor_name: string;
  email: string;
  role: string;
  contact_number: string;
  specialization: string;
  qualifications: string;
  experience_years: number;
  license_number: string;
  department: string;
  employee_id: string;
  joining_date: string;
  address: string;
  date_of_birth: string;
  gender: string;
  is_active: number;
  status: string;
  admitted_patients: number;
  todays_appointments: number;
}

interface RecentPatient {
  patient_id: number;
  patient_name: string;
  admission_date: string;
  diagnosis: string;
  chief_complaint: string;
  room_number: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('Fetching doctor details for ID:', params.id);
  
  try {
    // First check if doctor exists
    const doctorCheck = await executeQuery(
      'SELECT id FROM users WHERE id = ? AND role = "doctor"',
      [params.id]
    ) as any[];

    if (!doctorCheck || doctorCheck.length === 0) {
      console.error('Doctor not found with ID:', params.id);
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    console.log('Found doctor, fetching full details...');

    // Get doctor details including patient count and availability
    const doctorDetailsResult = await executeQuery(`
      SELECT 
        u.id,
        u.name as doctor_name,
        u.email,
        u.role,
        u.contact_number,
        u.specialization,
        u.qualification as qualifications,
        u.experience_years,
        u.license_number,
        u.department,
        u.employee_id,
        u.joining_date,
        u.address,
        u.date_of_birth,
        u.gender,
        u.is_active,
        CASE 
          WHEN u.is_active = 0 THEN 'Inactive'
          ELSE 'Active'  
        END as status,
        (
          SELECT COUNT(*)
          FROM admissions a
          WHERE a.doctor_id = u.id
          AND a.status = 'active'
        ) as admitted_patients,
        (
          SELECT COUNT(*)
          FROM appointments a
          WHERE a.doctor_id = u.id
          AND DATE(a.appointment_date) = CURDATE()
          AND a.status != 'Cancelled'
        ) as todays_appointments
      FROM users u
      WHERE u.id = ?
      AND u.role = 'doctor'
      LIMIT 1
    `, [params.id], { allowDuringBuild: true }) as DoctorDetails[];

    if (!doctorDetailsResult || doctorDetailsResult.length === 0) {
      console.error('Failed to fetch doctor details for ID:', params.id);
      return NextResponse.json(
        { error: 'Failed to fetch doctor details' }, 
        { status: 500 }
      );
    }

    const doctorDetails = doctorDetailsResult[0];

    if (!doctorDetails) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Get recent patients
    const recentPatients = await executeQuery(`
      SELECT 
        p.id as patient_id,
        p.name as patient_name,
        a.admission_date,
        a.diagnosis,
        a.chief_complaint,
        r.room_number
      FROM patients p
      JOIN admissions a ON p.id = a.patient_id
      LEFT JOIN rooms r ON a.room_id = r.id
      WHERE a.doctor_id = ?
      AND a.status = 'active'
      AND p.is_active = 1
      ORDER BY a.admission_date DESC
      LIMIT 5
    `, [params.id], { allowDuringBuild: true }) as RecentPatient[];

    console.log('Doctor details:', doctorDetails);
    console.log('Recent patients:', recentPatients);

    return NextResponse.json({
      doctor: {
        ...doctorDetails,
        recentPatients: recentPatients || []
      }
    })

  } catch (error) {
    console.error('Error fetching doctor details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctor details' },
      { status: 500 }
    )
  }
}