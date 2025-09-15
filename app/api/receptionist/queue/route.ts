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

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    connection = await getConnection();
    
    // Get today's queue with comprehensive patient and appointment data
    const [queue] = await connection.execute(
      `SELECT 
        a.id, a.appointment_id, a.patient_id, a.appointment_time, a.appointment_date, a.status, a.notes,
        p.name, p.age, p.gender, p.contact_number as phone,
        u.name as doctor_name,
        CASE 
          WHEN a.status = 'completed' THEN 3
          WHEN a.status = 'in-progress' THEN 1
          WHEN a.status = 'scheduled' THEN 2
          ELSE 4
        END as priority_order,
        CASE
          WHEN a.appointment_time IS NULL THEN 'walk-in'
          WHEN a.notes LIKE '%emergency%' THEN 'emergency'
          ELSE 'scheduled'
        END as appointment_type,
        TIMESTAMPDIFF(MINUTE, a.created_at, NOW()) as waiting_time
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE DATE(a.appointment_date) = CURDATE()
      ORDER BY 
        CASE WHEN a.status = 'emergency' THEN 1 ELSE 2 END,
        priority_order, 
        a.appointment_time`
    );

    // Get doctor availability status
    const [doctors] = await connection.execute(
      `SELECT 
        u.id, u.name,
        COUNT(CASE WHEN a.status = 'in-progress' THEN 1 END) as active_consultations,
        CASE 
          WHEN COUNT(CASE WHEN a.status = 'in-progress' THEN 1 END) > 0 THEN 'busy'
          ELSE 'available'
        END as status
      FROM users u
      LEFT JOIN appointments a ON u.id = a.doctor_id AND DATE(a.appointment_date) = CURDATE()
      WHERE u.role = 'doctor'
      GROUP BY u.id, u.name`
    );

    return NextResponse.json({ 
      queue: queue || [], 
      doctors: doctors || [],
      stats: {
        total: queue?.length || 0,
        waiting: queue?.filter(q => q.status === 'scheduled').length || 0,
        inConsultation: queue?.filter(q => q.status === 'in-progress').length || 0,
        completed: queue?.filter(q => q.status === 'completed').length || 0
      }
    });

  } catch (error) {
    console.error('Get queue error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch queue' },
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

    connection = await getConnection();
    
    // Update appointment status - use only existing columns
    const updateQuery = 'UPDATE appointments SET status = ?, notes = ?, updated_at = NOW() WHERE appointment_id = ?';
    
    await connection.execute(updateQuery, [status, notes || '', appointmentId]);

    return NextResponse.json({
      message: 'Queue status updated successfully'
    });

  } catch (error) {
    console.error('Update queue error:', error);
    return NextResponse.json(
      { message: 'Failed to update queue status' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Add new patient to queue (walk-in)
export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { patientId, doctorId, priority, notes } = await request.json();

    if (!patientId || !doctorId) {
      return NextResponse.json(
        { message: 'Missing patientId or doctorId' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Generate appointment ID for walk-in
    const appointmentId = `WLK${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
    
    // Insert walk-in appointment
    await connection.execute(
      `INSERT INTO appointments (
        appointment_id, patient_id, doctor_id, appointment_date, 
        status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, CURDATE(), 'scheduled', ?, NOW(), NOW())`,
      [appointmentId, patientId, doctorId, notes || 'Walk-in patient']
    );

    return NextResponse.json({
      message: 'Patient added to queue successfully',
      appointmentId
    }, { status: 201 });

  } catch (error) {
    console.error('Add to queue error:', error);
    return NextResponse.json(
      { message: 'Failed to add patient to queue' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
