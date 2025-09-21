import { NextRequest, NextResponse } from 'next/server';
import mysql, { RowDataPacket, OkPacket } from 'mysql2/promise';

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

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const status = searchParams.get('status');
  const doctorId = searchParams.get('doctorId');
  const department = searchParams.get('department');
    
    connection = await getConnection();
    
    let query = `
      SELECT 
        a.id, a.appointment_id, a.patient_id, a.doctor_id,
        a.appointment_date, a.appointment_time, a.status, a.notes,
        a.appointment_type, a.consultation_fee,
        p.name as patient_name, p.contact_number as patient_phone,
        p.age, p.gender, p.patient_id as patient_code,
        u.name as doctor_name, u.department, u.specialization
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE DATE(a.appointment_date) = ?
    `;
    
    const params = [date];
    
    if (status && status !== 'all') {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    if (doctorId && doctorId !== 'all') {
      query += ' AND a.doctor_id = ?';
      params.push(doctorId);
    }
    if (department && department !== 'all') {
      query += ' AND u.department = ?';
      params.push(department);
    }
    
    query += ' ORDER BY a.appointment_time IS NULL, a.appointment_time, a.created_at';
    
  const [appointments] = await connection.execute<RowDataPacket[]>(query, params);

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
    const { patientId, doctorId, department, appointmentDate, appointmentTime, notes, appointmentType } = await request.json();

    // appointmentTime is now optional; doctorId can be auto-selected by department
    if (!patientId || !appointmentDate) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Generate appointment ID
    const appointmentId = `APT${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
    
    // Get patient's internal ID from patient_id (code)
    const [patientResult] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM patients WHERE patient_id = ?',
      [patientId]
    );
    
    if (patientResult.length === 0) {
      return NextResponse.json(
        { message: 'Patient not found' },
        { status: 404 }
      );
    }
    
    const internalPatientId = (patientResult[0] as RowDataPacket).id as number;

    // Prevent duplicate appointment for same patient on the same date
    const [existingForPatient] = await connection.execute<RowDataPacket[]>(
      `SELECT id FROM appointments 
       WHERE patient_id = ? 
         AND DATE(appointment_date) = DATE(?)
         AND status NOT IN ('cancelled', 'Cancelled')
       LIMIT 1`,
      [internalPatientId, appointmentDate]
    );
    if (existingForPatient.length > 0) {
      return NextResponse.json(
        { message: 'This patient already has an appointment on the selected date.' },
        { status: 409 }
      );
    }

    // If doctorId is not provided, select one from the specified department
    let resolvedDoctorId = doctorId as number | undefined;
    if (!resolvedDoctorId) {
      if (!department) {
        return NextResponse.json({ message: 'Either doctorId or department is required' }, { status: 400 });
      }
      // Pick least busy active doctor in the department for the date
      const [doctorRows] = await connection.execute<RowDataPacket[]>(
        `SELECT u.id, COALESCE(COUNT(a.id),0) AS todays_appointments
         FROM users u
         LEFT JOIN appointments a 
           ON a.doctor_id = u.id 
          AND DATE(a.appointment_date) = DATE(?)
          AND a.status NOT IN ('cancelled')
         WHERE u.role = 'doctor' 
           AND u.is_active = 1 
           AND u.department = ?
         GROUP BY u.id
         ORDER BY todays_appointments ASC, u.id ASC
         LIMIT 1`,
        [appointmentDate, department]
      );
      if (doctorRows.length === 0) {
        // Fallback: create or reuse a placeholder 'Unassigned' doctor for this department
        const deptSlug = String(department)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const placeholderEmail = `unassigned+${deptSlug}@hospital.local`;
        const placeholderName = `Unassigned - ${department}`;

        // Try to find existing placeholder
        const [placeholderRows] = await connection.execute<RowDataPacket[]>(
          `SELECT id FROM users 
           WHERE role = 'doctor' 
             AND department = ? 
             AND (email = ? OR name = ?) 
           LIMIT 1`,
          [department, placeholderEmail, placeholderName]
        );

        if (placeholderRows.length > 0) {
          resolvedDoctorId = (placeholderRows[0] as RowDataPacket).id as number;
        } else {
          // Create minimal placeholder doctor record (inactive)
          const userId = `USR${Date.now().toString(36).toUpperCase()}${Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()}`;
          const passwordHash = `UNASSIGNED-${userId}`; // dummy value; account is inactive
          const contact = '0000000000';

          const [insertResult] = await connection.execute<OkPacket>(
            `INSERT INTO users (user_id, name, email, password_hash, role, contact_number, department, is_active, is_verified, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'doctor', ?, ?, 0, 0, NOW(), NOW())`,
            [userId, placeholderName, placeholderEmail, passwordHash, contact, department]
          );
          resolvedDoctorId = insertResult.insertId as number;
        }
      } else {
        resolvedDoctorId = (doctorRows[0] as RowDataPacket).id as number;
      }
    }

    // Check for conflicting appointments AFTER resolving doctor
    if (appointmentTime && resolvedDoctorId) {
      const [conflicts] = await connection.execute<RowDataPacket[]>(
        `SELECT id FROM appointments 
         WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? 
         AND status NOT IN ('cancelled', 'completed')`,
        [resolvedDoctorId, appointmentDate, appointmentTime]
      );

      if (conflicts.length > 0) {
        return NextResponse.json(
          { message: 'Doctor is not available at this time' },
          { status: 409 }
        );
      }
    }
    
    // Insert appointment
    const [result] = await connection.execute<OkPacket>(
      `INSERT INTO appointments (
        appointment_id, patient_id, doctor_id, appointment_date, 
        appointment_time, status, notes, appointment_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'scheduled', ?, ?, NOW(), NOW())`,
      [appointmentId, internalPatientId, resolvedDoctorId, appointmentDate, appointmentTime || null, notes || '', appointmentType || 'consultation']
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

export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const { appointmentId, status, notes } = await request.json();

    if (!appointmentId || !status) {
      return NextResponse.json(
        { message: 'Missing appointmentId or status' },
        { status: 400 }
      );
    }

    const validStatuses = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    await connection.execute(
      `UPDATE appointments 
       SET status = ?, notes = ?, updated_at = NOW() 
       WHERE appointment_id = ?`,
      [status, notes || '', appointmentId]
    );

    return NextResponse.json({
      message: 'Appointment status updated successfully'
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json(
      { message: 'Failed to update appointment' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
