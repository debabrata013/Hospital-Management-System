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
    
    const { searchParams } = new URL(request.url);
    
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (date) {
      whereClause += ' AND DATE(a.appointment_date) = ?';
      params.push(date);
    }

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    if (type) {
      whereClause += ' AND a.appointment_type = ?';
      params.push(type);
    }

    if (doctorId) {
      whereClause += ' AND a.doctor_id = ?';
      params.push(doctorId);
    }

    if (patientId) {
      whereClause += ' AND a.patient_id = ?';
      params.push(patientId);
    }

    // Get total count for pagination
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM appointments a
      ${whereClause}
    `, params);

    const total = (countResult as any)[0].total;

    // Fetch appointments with patient and doctor details
    const [appointmentsResult] = await connection.execute(`
      SELECT 
        a.id,
        a.appointment_id,
        a.appointment_date,
        a.appointment_time,
        a.appointment_type,
        a.visit_type,
        a.priority,
        a.reason_for_visit,
        a.symptoms,
        a.chief_complaint,
        a.consultation_fee,
        a.room_number,
        a.status,
        a.notes,
        a.created_at,
        a.updated_at,
        p.id as patient_id,
        p.name as patient_name,
        p.contact_number as patient_phone,
        p.date_of_birth as patient_dob,
        p.gender as patient_gender,
        s.id as doctor_id,
        u.name as doctor_name,
        u.department as doctor_department,
        u.specialization as doctor_specialization
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN staff_profiles s ON a.doctor_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.appointment_time ASC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const appointments = appointmentsResult.map((apt: any) => ({
      id: apt.id,
      appointmentId: apt.appointment_id,
      appointmentDate: apt.appointment_date,
      appointmentTime: apt.appointment_time,
      appointmentType: apt.appointment_type,
      visitType: apt.visit_type,
      priority: apt.priority,
      reasonForVisit: apt.reason_for_visit,
      symptoms: apt.symptoms,
      chiefComplaint: apt.chief_complaint,
      consultationFee: apt.consultation_fee,
      roomNumber: apt.room_number,
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.created_at,
      updatedAt: apt.updated_at,
      patient: {
        id: apt.patient_id,
        name: apt.patient_name,
        phone: apt.patient_phone,
        dateOfBirth: apt.patient_dob,
        gender: apt.patient_gender
      },
      doctor: {
        id: apt.doctor_id,
        name: apt.doctor_name || 'Unassigned',
        department: apt.doctor_department || 'General',
        specialization: apt.doctor_specialization
      }
    }));

    await connection.end();

    return NextResponse.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Appointments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      patientId, 
      doctorId, 
      appointmentDate, 
      appointmentTime, 
      appointmentType, 
      reasonForVisit,
      notes,
      visitType = 'first-visit',
      priority = 'medium'
    } = body;

    // Validate required fields
    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Generate unique appointment ID
    const appointmentId = `APT${Date.now().toString().slice(-6)}`;

    // Check for scheduling conflicts
    const [conflictCheck] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM appointments 
      WHERE doctor_id = ? 
      AND appointment_date = ? 
      AND appointment_time = ? 
      AND status IN ('scheduled', 'confirmed')
    `, [doctorId, appointmentDate, appointmentTime]);

    if ((conflictCheck as any)[0].count > 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'Time slot already booked for this doctor' },
        { status: 409 }
      );
    }

    // Insert new appointment
    const [result] = await connection.execute(`
      INSERT INTO appointments (
        appointment_id,
        patient_id, 
        doctor_id, 
        appointment_date, 
        appointment_time, 
        appointment_type,
        visit_type,
        priority,
        reason_for_visit,
        notes,
        status, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())
    `, [
      appointmentId, patientId, doctorId, appointmentDate, appointmentTime, 
      appointmentType || 'consultation', visitType, priority, reasonForVisit, notes
    ]);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Appointment scheduled successfully',
      appointmentId: (result as any).insertId,
      appointmentIdGenerated: appointmentId
    });

  } catch (error) {
    console.error('Appointment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      appointmentDate, 
      appointmentTime, 
      appointmentType, 
      reasonForVisit,
      status,
      notes,
      visitType,
      priority
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Update appointment
    const [result] = await connection.execute(`
      UPDATE appointments 
      SET 
        appointment_date = COALESCE(?, appointment_date),
        appointment_time = COALESCE(?, appointment_time),
        appointment_type = COALESCE(?, appointment_type),
        visit_type = COALESCE(?, visit_type),
        priority = COALESCE(?, priority),
        reason_for_visit = COALESCE(?, reason_for_visit),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = NOW()
      WHERE id = ?
    `, [appointmentDate, appointmentTime, appointmentType, visitType, priority, reasonForVisit, status, notes, id]);

    if ((result as any).affectedRows === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully'
    });

  } catch (error) {
    console.error('Appointment update error:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Delete appointment
    const [result] = await connection.execute(`
      DELETE FROM appointments WHERE id = ?
    `, [id]);

    if ((result as any).affectedRows === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Appointment deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
