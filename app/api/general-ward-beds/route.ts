import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

// GET - Get beds for a specific room
export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    
    if (!roomId) {
      return NextResponse.json(
        { message: 'Room ID is required' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Get bed information for the room
    const [beds] = await connection.execute(`
      SELECT 
        b.id,
        b.bed_number,
        b.bed_label,
        b.status,
        b.patient_id,
        b.patient_name,
        b.admission_date,
        b.notes,
        r.room_number,
        r.room_name,
        r.room_type
      FROM general_ward_beds b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.room_id = ?
      ORDER BY b.bed_number
    `, [roomId]);

    return NextResponse.json({
      success: true,
      data: beds
    });

  } catch (error) {
    console.error('Error fetching beds:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Assign patient to a bed
export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { bedId, patientName, admissionDate, notes } = body;

    if (!bedId || !patientName) {
      return NextResponse.json(
        { message: 'Bed ID and patient name are required' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Check if bed is available
    const [bedCheck] = await connection.execute(
      'SELECT status FROM general_ward_beds WHERE id = ?',
      [bedId]
    );

    if (bedCheck.length === 0) {
      return NextResponse.json(
        { message: 'Bed not found' },
        { status: 404 }
      );
    }

    if (bedCheck[0].status !== 'Available') {
      return NextResponse.json(
        { message: 'Bed is not available' },
        { status: 400 }
      );
    }

    // Assign patient to bed
    await connection.execute(`
      UPDATE general_ward_beds 
      SET status = 'Occupied', 
          patient_name = ?, 
          admission_date = ?, 
          notes = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [patientName, admissionDate || new Date().toISOString().split('T')[0], notes || '', bedId]);

    return NextResponse.json({
      success: true,
      message: 'Patient assigned to bed successfully'
    });

  } catch (error) {
    console.error('Error assigning patient to bed:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT - Update bed status or discharge patient
export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { bedId, action, status } = body;

    if (!bedId || !action) {
      return NextResponse.json(
        { message: 'Bed ID and action are required' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    if (action === 'discharge') {
      // Discharge patient from bed
      await connection.execute(`
        UPDATE general_ward_beds 
        SET status = 'Available', 
            patient_name = NULL, 
            patient_id = NULL,
            admission_date = NULL, 
            notes = NULL,
            updated_at = NOW()
        WHERE id = ?
      `, [bedId]);
    } else if (action === 'update_status' && status) {
      // Update bed status
      await connection.execute(`
        UPDATE general_ward_beds 
        SET status = ?,
            updated_at = NOW()
        WHERE id = ?
      `, [status, bedId]);
    }

    return NextResponse.json({
      success: true,
      message: 'Bed updated successfully'
    });

  } catch (error) {
    console.error('Error updating bed:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}