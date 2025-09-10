import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+05:30',
  connectTimeout: 20000
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    connection = await getConnection();
    
    const [appointments] = await connection.execute(
      `SELECT 
        a.id, a.appointment_id, a.patient_id, a.doctor_id,
        a.appointment_date, a.appointment_time, a.status, a.notes,
        p.name as patient_name,
        p.contact_number as patient_phone,
        u.name as doctor_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE DATE(a.appointment_date) >= CURDATE()
      ORDER BY a.appointment_date, a.appointment_time`
    );

    return NextResponse.json({ appointments });

  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch appointments' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { patientId, doctorId, appointmentDate, appointmentTime, notes } = await request.json();

    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Generate appointment ID
    const appointmentId = `APT${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
    
    // Insert appointment
    const [result] = await connection.execute(
      `INSERT INTO appointments (
        appointment_id, patient_id, doctor_id, appointment_date, 
        appointment_time, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'scheduled', ?, NOW(), NOW())`,
      [appointmentId, patientId, doctorId, appointmentDate, appointmentTime, notes || '']
    );

    return NextResponse.json({
      message: 'Appointment scheduled successfully',
      appointmentId,
      id: result.insertId
    }, { status: 201 });

  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { message: 'Failed to schedule appointment' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
