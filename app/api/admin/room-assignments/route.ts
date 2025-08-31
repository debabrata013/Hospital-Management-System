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
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const roomId = searchParams.get('roomId');
    
    let query = `
      SELECT 
        ra.id,
        ra.room_id,
        ra.patient_id,
        ra.admission_date,
        ra.expected_discharge_date,
        ra.actual_discharge_date,
        ra.diagnosis,
        ra.notes,
        ra.status,
        ra.created_at,
        ra.updated_at,
        r.room_number,
        r.room_type,
        p.name as patient_name,
        p.contact_number as patient_phone
      FROM room_assignments ra
      JOIN rooms r ON ra.room_id = r.id
      JOIN patients p ON ra.patient_id = p.id
    `;
    
    const whereConditions = [];
    const queryParams = [];
    
    if (status && status !== 'all') {
      whereConditions.push('ra.status = ?');
      queryParams.push(status);
    }
    
    if (roomId) {
      whereConditions.push('ra.room_id = ?');
      queryParams.push(roomId);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY ra.admission_date DESC';
    
    const [assignments] = await connection.execute(query, queryParams);
    
    return NextResponse.json(assignments);
    
  } catch (error) {
    console.error('Error fetching room assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room assignments' },
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
    connection = await mysql.createConnection(dbConfig);
    
    const body = await request.json();
    const {
      roomId,
      patientId,
      admissionDate,
      expectedDischargeDate,
      diagnosis,
      notes
    } = body;
    
    // Validate required fields
    if (!roomId || !patientId || !admissionDate) {
      return NextResponse.json(
        { error: 'Room ID, patient ID, and admission date are required' },
        { status: 400 }
      );
    }
    
    // Check if room is available
    const [roomCheck] = await connection.execute(
      'SELECT id, status, current_occupancy, capacity FROM rooms WHERE id = ?',
      [roomId]
    );
    
    if ((roomCheck as any).length === 0) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }
    
    const room = (roomCheck as any)[0];
    
    if (room.status !== 'Available') {
      return NextResponse.json(
        { error: 'Room is not available' },
        { status: 400 }
      );
    }
    
    if (room.current_occupancy >= room.capacity) {
      return NextResponse.json(
        { error: 'Room is at full capacity' },
        { status: 400 }
      );
    }
    
    // Check if patient exists
    const [patientCheck] = await connection.execute(
      'SELECT id FROM patients WHERE id = ?',
      [patientId]
    );
    
    if ((patientCheck as any).length === 0) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Check if patient is already admitted
    const [existingAssignment] = await connection.execute(
      'SELECT id FROM room_assignments WHERE patient_id = ? AND status = "Active"',
      [patientId]
    );
    
    if ((existingAssignment as any).length > 0) {
      return NextResponse.json(
        { error: 'Patient is already admitted to another room' },
        { status: 400 }
      );
    }
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Create room assignment
      const [result] = await connection.execute(`
        INSERT INTO room_assignments (
          room_id, patient_id, admission_date, expected_discharge_date,
          diagnosis, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'Active')
      `, [
        roomId, patientId, admissionDate, expectedDischargeDate || null,
        diagnosis || null, notes || null
      ]);
      
      // Update room occupancy
      await connection.execute(`
        UPDATE rooms 
        SET current_occupancy = current_occupancy + 1,
            status = CASE 
              WHEN current_occupancy + 1 >= capacity THEN 'Occupied'
              ELSE 'Occupied'
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [roomId]);
      
      await connection.commit();
      
      const assignmentId = (result as any).insertId;
      
      // Fetch the created assignment
      const [newAssignment] = await connection.execute(`
        SELECT 
          ra.*,
          r.room_number,
          p.name as patient_name
        FROM room_assignments ra
        JOIN rooms r ON ra.room_id = r.id
        JOIN patients p ON ra.patient_id = p.id
        WHERE ra.id = ?
      `, [assignmentId]);
      
      return NextResponse.json((newAssignment as any)[0], { status: 201 });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error creating room assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create room assignment' },
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
    connection = await mysql.createConnection(dbConfig);
    
    const body = await request.json();
    const {
      id,
      actualDischargeDate,
      diagnosis,
      notes,
      status
    } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }
    
    // Check if assignment exists
    const [existingAssignment] = await connection.execute(
      'SELECT id, room_id, status FROM room_assignments WHERE id = ?',
      [id]
    );
    
    if ((existingAssignment as any).length === 0) {
      return NextResponse.json(
        { error: 'Room assignment not found' },
        { status: 404 }
      );
    }
    
    const assignment = (existingAssignment as any)[0];
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Update assignment
      const updateFields = [];
      const updateParams = [];
      
      if (actualDischargeDate) {
        updateFields.push('actual_discharge_date = ?');
        updateParams.push(actualDischargeDate);
      }
      if (diagnosis !== undefined) {
        updateFields.push('diagnosis = ?');
        updateParams.push(diagnosis);
      }
      if (notes !== undefined) {
        updateFields.push('notes = ?');
        updateParams.push(notes);
      }
      if (status) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }
      
      if (updateFields.length === 0) {
        return NextResponse.json(
          { error: 'No fields to update' },
          { status: 400 }
        );
      }
      
      updateParams.push(id);
      
      await connection.execute(`
        UPDATE room_assignments 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, updateParams);
      
      // If discharging, update room status
      if (status === 'Discharged' && assignment.status === 'Active') {
        await connection.execute(`
          UPDATE rooms 
          SET current_occupancy = GREATEST(0, current_occupancy - 1),
              status = CASE 
                WHEN current_occupancy - 1 <= 0 THEN 'Cleaning Required'
                ELSE 'Occupied'
              END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [assignment.room_id]);
      }
      
      await connection.commit();
      
      // Fetch updated assignment
      const [updatedAssignment] = await connection.execute(`
        SELECT 
          ra.*,
          r.room_number,
          p.name as patient_name
        FROM room_assignments ra
        JOIN rooms r ON ra.room_id = r.id
        JOIN patients p ON ra.patient_id = p.id
        WHERE ra.id = ?
      `, [id]);
      
      return NextResponse.json((updatedAssignment as any)[0]);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error updating room assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update room assignment' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
