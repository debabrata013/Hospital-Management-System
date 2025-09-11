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

// Generate unique admission ID
function generateAdmissionId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `ADM${timestamp}${random}`.toUpperCase();
}

// GET - Fetch admissions with filters
export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const roomType = searchParams.get('roomType');
    const doctorId = searchParams.get('doctorId');
    const search = searchParams.get('search');
    const action = searchParams.get('action');
    
    connection = await getConnection();
    
    if (action === 'rooms') {
      // Get available rooms
      const [rooms] = await connection.execute(`
        SELECT 
          r.id, r.room_number, r.floor_number, r.capacity, r.status,
          rt.type_name, rt.base_rate, rt.description
        FROM rooms r
        JOIN room_types rt ON r.room_type_id = rt.id
        WHERE r.status = 'available'
        ORDER BY r.floor_number, r.room_number
      `);
      
      return NextResponse.json({ rooms });
    }
    
    if (action === 'room-types') {
      // Get room types
      const [roomTypes] = await connection.execute(`
        SELECT * FROM room_types ORDER BY base_rate
      `);
      
      return NextResponse.json({ roomTypes });
    }
    
    // Build dynamic query for admissions
    let query = `
      SELECT 
        a.id, a.admission_id, a.patient_id, a.room_id, a.doctor_id,
        a.admission_date, a.discharge_date, a.admission_type, a.status,
        a.diagnosis, a.chief_complaint, a.estimated_stay_days, a.total_charges,
        a.emergency_contact_name, a.emergency_contact_phone, a.emergency_contact_relation,
        p.name as patient_name, p.age, p.gender, p.contact_number as patient_phone,
        r.room_number, rt.type_name as room_type,
        d.name as doctor_name,
        ab.name as admitted_by_name,
        a.created_at
      FROM admissions a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN rooms r ON a.room_id = r.id
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN users d ON a.doctor_id = d.id
      LEFT JOIN users ab ON a.admitted_by = ab.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status && status !== 'all') {
      query += ` AND a.status = ?`;
      params.push(status);
    }
    
    if (doctorId && doctorId !== 'all') {
      query += ` AND a.doctor_id = ?`;
      params.push(doctorId);
    }
    
    if (roomType && roomType !== 'all') {
      query += ` AND rt.type_name = ?`;
      params.push(roomType);
    }
    
    if (search) {
      query += ` AND (p.name LIKE ? OR a.admission_id LIKE ? OR p.contact_number LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ` ORDER BY a.admission_date DESC LIMIT 50`;
    
    const [admissions] = await connection.execute(query, params);
    
    return NextResponse.json({ admissions });

  } catch (error) {
    console.error('Get admissions error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch admissions' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Create new admission
export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const {
      patientId, roomId, doctorId, admissionType, diagnosis, chiefComplaint,
      admissionNotes, estimatedStayDays, emergencyContactName, emergencyContactPhone,
      emergencyContactRelation, insuranceDetails, admittedBy
    } = await request.json();

    if (!patientId || !roomId || !doctorId) {
      return NextResponse.json(
        { message: 'Patient ID, Room ID, and Doctor ID are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();
    
    // Check if room is available
    const [roomCheck] = await connection.execute(
      `SELECT status FROM rooms WHERE id = ?`,
      [roomId]
    );
    
    if (roomCheck.length === 0 || roomCheck[0].status !== 'available') {
      await connection.rollback();
      return NextResponse.json(
        { message: 'Room is not available' },
        { status: 400 }
      );
    }
    
    const admissionId = generateAdmissionId();
    const admissionDate = new Date();
    
    // Insert admission
    const [admissionResult] = await connection.execute(
      `INSERT INTO admissions (
        admission_id, patient_id, room_id, doctor_id, admission_date,
        admission_type, status, diagnosis, chief_complaint, admission_notes,
        estimated_stay_days, emergency_contact_name, emergency_contact_phone,
        emergency_contact_relation, insurance_details, admitted_by
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        admissionId, patientId, roomId, doctorId, admissionDate,
        admissionType || 'planned', diagnosis || null, chiefComplaint || null,
        admissionNotes || null, estimatedStayDays || null, emergencyContactName || null,
        emergencyContactPhone || null, emergencyContactRelation || null,
        insuranceDetails ? JSON.stringify(insuranceDetails) : null, admittedBy || 1
      ]
    );
    
    const admissionDbId = admissionResult.insertId;
    
    // Update room status to occupied
    await connection.execute(
      `UPDATE rooms SET status = 'occupied', updated_at = NOW() WHERE id = ?`,
      [roomId]
    );
    
    // Create bed assignment record
    await connection.execute(
      `INSERT INTO bed_assignments (
        admission_id, room_id, assigned_date, assigned_by
      ) VALUES (?, ?, ?, ?)`,
      [admissionDbId, roomId, admissionDate, admittedBy || 1]
    );
    
    await connection.commit();
    
    return NextResponse.json({
      message: 'Patient admitted successfully',
      admissionId,
      admissionDbId
    }, { status: 201 });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Create admission error:', error);
    return NextResponse.json(
      { message: 'Failed to create admission' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT - Update admission (discharge, transfer, etc.)
export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const {
      admissionId, action, dischargeNotes, dischargeSummary, dischargeInstructions,
      newRoomId, transferReason, dischargedBy
    } = await request.json();

    if (!admissionId || !action) {
      return NextResponse.json(
        { message: 'Admission ID and action are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();
    
    if (action === 'discharge') {
      const dischargeDate = new Date();
      
      // Update admission status
      await connection.execute(
        `UPDATE admissions 
         SET status = 'discharged', discharge_date = ?, discharge_notes = ?,
             discharge_summary = ?, discharge_instructions = ?, discharged_by = ?,
             updated_at = NOW()
         WHERE admission_id = ?`,
        [dischargeDate, dischargeNotes || null, dischargeSummary || null,
         dischargeInstructions || null, dischargedBy || 1, admissionId]
      );
      
      // Get room ID and update room status
      const [admission] = await connection.execute(
        `SELECT room_id FROM admissions WHERE admission_id = ?`,
        [admissionId]
      );
      
      if (admission.length > 0) {
        await connection.execute(
          `UPDATE rooms SET status = 'cleaning', updated_at = NOW() WHERE id = ?`,
          [admission[0].room_id]
        );
        
        // Update bed assignment
        await connection.execute(
          `UPDATE bed_assignments 
           SET released_date = ?, reason = 'discharge'
           WHERE admission_id = (SELECT id FROM admissions WHERE admission_id = ?)
           AND released_date IS NULL`,
          [dischargeDate, admissionId]
        );
      }
      
    } else if (action === 'transfer' && newRoomId) {
      // Check if new room is available
      const [roomCheck] = await connection.execute(
        `SELECT status FROM rooms WHERE id = ?`,
        [newRoomId]
      );
      
      if (roomCheck.length === 0 || roomCheck[0].status !== 'available') {
        await connection.rollback();
        return NextResponse.json(
          { message: 'New room is not available' },
          { status: 400 }
        );
      }
      
      // Get current admission details
      const [currentAdmission] = await connection.execute(
        `SELECT id, room_id FROM admissions WHERE admission_id = ?`,
        [admissionId]
      );
      
      if (currentAdmission.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { message: 'Admission not found' },
          { status: 404 }
        );
      }
      
      const oldRoomId = currentAdmission[0].room_id;
      const admissionDbId = currentAdmission[0].id;
      
      // Update admission with new room
      await connection.execute(
        `UPDATE admissions SET room_id = ?, updated_at = NOW() WHERE admission_id = ?`,
        [newRoomId, admissionId]
      );
      
      // Update old room status
      await connection.execute(
        `UPDATE rooms SET status = 'cleaning', updated_at = NOW() WHERE id = ?`,
        [oldRoomId]
      );
      
      // Update new room status
      await connection.execute(
        `UPDATE rooms SET status = 'occupied', updated_at = NOW() WHERE id = ?`,
        [newRoomId]
      );
      
      // Close old bed assignment
      await connection.execute(
        `UPDATE bed_assignments 
         SET released_date = NOW(), reason = ?
         WHERE admission_id = ? AND released_date IS NULL`,
        [transferReason || 'transfer', admissionDbId]
      );
      
      // Create new bed assignment
      await connection.execute(
        `INSERT INTO bed_assignments (
          admission_id, room_id, assigned_date, assigned_by, reason
        ) VALUES (?, ?, NOW(), ?, ?)`,
        [admissionDbId, newRoomId, dischargedBy || 1, transferReason || 'transfer']
      );
    }
    
    await connection.commit();
    
    return NextResponse.json({
      message: `Admission ${action} completed successfully`
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Update admission error:', error);
    return NextResponse.json(
      { message: 'Failed to update admission' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
