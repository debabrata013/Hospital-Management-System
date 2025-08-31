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

    // Fetch currently admitted patients with their details
    // Join with users table to get doctor names
    const [patientsResult] = await connection.execute(`
      SELECT 
        a.id,
        a.admissionDate,
        a.estimatedDischarge,
        a.diagnosis as condition_notes,
        a.status,
        a.condition,
        a.ward,
        a.roomNumber,
        a.bedNumber,
        p.name as patient_name,
        p.date_of_birth,
        p.gender,
        u.name as doctor_name,
        'General' as department
      FROM Admissions a
      LEFT JOIN patients p ON a.patientId = p.id
      LEFT JOIN staff_profiles s ON a.doctorId = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE a.status = 'admitted'
      ORDER BY a.admissionDate DESC
      LIMIT 10
    `);

    const admittedPatients = patientsResult.map((patient: any) => {
      // Calculate age from date of birth
      const birthDate = new Date(patient.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

      return {
        id: patient.id,
        name: patient.patient_name || 'Unknown Patient',
        age: actualAge,
        condition: patient.condition_notes || 'N/A',
        roomNumber: patient.roomNumber || patient.bedNumber || 'N/A',
        admissionDate: patient.admissionDate,
        status: patient.condition || patient.status || 'admitted',
        doctor: {
          name: patient.doctor_name || 'Unassigned'
        },
        roomType: patient.ward || 'General'
      };
    });

    await connection.end();

    return NextResponse.json(admittedPatients);

  } catch (error) {
    console.error('Admitted patients fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admitted patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, doctorId, conditionNotes, admissionDate } = body;

    const connection = await mysql.createConnection(dbConfig);

    // Insert admission record using existing table structure
    const [admissionResult] = await connection.execute(`
      INSERT INTO Admissions (
        admissionId,
        patientId, 
        doctorId, 
        admissionDate, 
        diagnosis, 
        status, 
        condition,
        createdAt
      ) VALUES (?, ?, ?, ?, ?, 'admitted', 'Stable', NOW())
    `, [
      `ADM${Date.now().toString().slice(-6)}`,
      patientId, 
      doctorId, 
      admissionDate, 
      conditionNotes
    ]);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Patient admitted successfully',
      admissionId: (admissionResult as any).insertId
    });

  } catch (error) {
    console.error('Patient admission error:', error);
    return NextResponse.json(
      { error: 'Failed to admit patient' },
      { status: 500 }
    );
  }
}
