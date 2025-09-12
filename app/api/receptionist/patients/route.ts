import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306'),
  charset: 'utf8mb4',
  timezone: '+05:30',
  connectTimeout: 20000
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// Generate unique patient ID
function generatePatientId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `PAT${timestamp}${random}`.toUpperCase();
}

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { firstName, lastName, age, gender, phone, address, emergencyContact } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !age || !gender || !phone) {
      return NextResponse.json(
        { message: 'Missing required fields: firstName, lastName, age, gender, phone' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Check if patient with phone already exists
    const [existingPatient] = await connection.execute(
      'SELECT id FROM patients WHERE contact_number = ?',
      [phone]
    );

    if (existingPatient.length > 0) {
      return NextResponse.json(
        { message: 'Patient with this phone number already exists' },
        { status: 409 }
      );
    }

    const patientId = generatePatientId();
    
    // Insert new patient
    const [result] = await connection.execute(
      `INSERT INTO patients (
        patient_id, name, age, gender, 
        contact_number, address, emergency_contact_name, 
        registration_date, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1, NOW(), NOW())`,
      [patientId, `${firstName} ${lastName}`, age, gender, phone, address || '', emergencyContact || '']
    );

    const newPatient = {
      id: result.insertId,
      patientId,
      name: `${firstName} ${lastName}`,
      age: parseInt(age),
      gender,
      contact_number: phone,
      address: address || '',
      emergency_contact_name: emergencyContact || '',
      registrationDate: new Date().toISOString(),
      isActive: true
    };

    return NextResponse.json({
      message: 'Patient registered successfully',
      patient: newPatient
    }, { status: 201 });

  } catch (error) {
    console.error('Patient registration error:', error);
    return NextResponse.json(
      { message: 'Failed to register patient' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    connection = await getConnection();
    
    const [patients] = await connection.execute(
      `SELECT 
        id, patient_id, name, age, gender,
        contact_number, address, emergency_contact_name, registration_date, is_active
      FROM patients 
      WHERE is_active = 1 
      ORDER BY registration_date DESC 
      LIMIT 50`
    );

    return NextResponse.json({ patients });

  } catch (error) {
    console.error('Get patients error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch patients' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
