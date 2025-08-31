import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Fetch patients and doctors in parallel
    const [patientsResult, doctorsResult] = await Promise.all([
      // Get active patients
      connection.execute(`
        SELECT 
          id,
          name,
          patient_id as patientId,
          contact_number as phone,
          date_of_birth as dateOfBirth,
          gender
        FROM patients 
        WHERE is_active = 1
        ORDER BY name ASC
      `),

      // Get doctors from staff profiles
      connection.execute(`
        SELECT 
          s.id,
          u.name as doctorName,
          u.department,
          u.specialization,
          u.role
        FROM staff_profiles s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE u.role = 'doctor' AND u.is_active = 1
        ORDER BY u.name ASC
      `)
    ]);

    // Define appointment types based on the existing enum values
    const appointmentTypes = [
      { name: 'consultation', duration: 30, color: '#3B82F6' },
      { name: 'follow-up', duration: 20, color: '#8B5CF6' },
      { name: 'emergency', duration: 15, color: '#F59E0B' },
      { name: 'routine-checkup', duration: 45, color: '#10B981' },
      { name: 'procedure', duration: 60, color: '#EF4444' },
      { name: 'vaccination', duration: 15, color: '#06B6D4' },
      { name: 'counseling', duration: 45, color: '#EC4899' }
    ];

    const data = {
      patients: (patientsResult as any)[0].map((patient: any) => ({
        id: patient.id,
        name: patient.name,
        patientId: patient.patientId,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender
      })),
      doctors: (doctorsResult as any)[0].map((doctor: any) => ({
        id: doctor.id,
        name: doctor.doctorName || 'Unassigned',
        department: doctor.department || 'General',
        specialization: doctor.specialization
      })),
      appointmentTypes
    };

    await connection.end();

    return NextResponse.json(data);

  } catch (error) {
    console.error('Appointment data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment data' },
      { status: 500 }
    );
  }
}
