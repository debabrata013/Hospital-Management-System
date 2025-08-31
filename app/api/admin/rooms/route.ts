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
    const type = searchParams.get('type');
    const floor = searchParams.get('floor');
    
    let query = `
      SELECT 
        r.id,
        r.room_number,
        r.room_name,
        r.room_type,
        r.floor,
        r.capacity,
        r.current_occupancy,
        r.status,
        r.daily_rate,
        r.description,
        r.created_at,
        r.updated_at,
        COUNT(ra.id) as active_assignments
      FROM rooms r
      LEFT JOIN room_assignments ra ON r.id = ra.room_id AND ra.status = 'Active'
    `;
    
    const whereConditions = [];
    const queryParams = [];

    if (status && status !== 'all') {
      whereConditions.push('r.status = ?');
      queryParams.push(status);
    }

    if (type && type !== 'all') {
      whereConditions.push('r.room_type = ?');
      queryParams.push(type);
    }
    
    if (floor && floor !== 'all') {
      whereConditions.push('r.floor = ?');
      queryParams.push(floor);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' GROUP BY r.id ORDER BY r.room_number';
    
    const [rooms] = await connection.execute(query, queryParams);
    
    return NextResponse.json(rooms);

  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
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
      roomNumber,
      roomName,
      roomType,
      floor,
      capacity,
      dailyRate,
      description
    } = body;
    
    // Validate required fields
    if (!roomNumber || !roomType || !floor || !capacity) {
      return NextResponse.json(
        { error: 'Room number, type, floor, and capacity are required' },
        { status: 400 }
      );
    }
    
    // Check if room number already exists
    const [existingRooms] = await connection.execute(
      'SELECT id FROM rooms WHERE room_number = ?',
      [roomNumber]
    );
    
    if ((existingRooms as any).length > 0) {
      return NextResponse.json(
        { error: 'Room number already exists' },
        { status: 409 }
      );
    }
    
    // Insert new room
    const [result] = await connection.execute(`
      INSERT INTO rooms (
        room_number, room_name, room_type, floor, capacity, 
        daily_rate, description, status, current_occupancy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Available', 0)
    `, [
      roomNumber, roomName || null, roomType, floor, capacity,
      dailyRate || 0, description || null
    ]);
    
    const newRoomId = (result as any).insertId;
    
    // Fetch the created room
    const [newRoom] = await connection.execute(
      'SELECT * FROM rooms WHERE id = ?',
      [newRoomId]
    );
    
    return NextResponse.json((newRoom as any)[0], { status: 201 });
    
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
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
      roomNumber,
      roomName,
      roomType,
      floor,
      capacity,
      dailyRate,
      description,
      status
    } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }
    
    // Check if room exists
    const [existingRoom] = await connection.execute(
      'SELECT id FROM rooms WHERE id = ?',
      [id]
    );
    
    if ((existingRoom as any).length === 0) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }
    
    // Check if room number is being changed and if it already exists
    if (roomNumber) {
      const [duplicateRooms] = await connection.execute(
        'SELECT id FROM rooms WHERE room_number = ? AND id != ?',
        [roomNumber, id]
      );
      
      if ((duplicateRooms as any).length > 0) {
        return NextResponse.json(
          { error: 'Room number already exists' },
          { status: 409 }
        );
      }
    }
    
    // Update room
    const updateFields = [];
    const updateParams = [];
    
    if (roomNumber) {
      updateFields.push('room_number = ?');
      updateParams.push(roomNumber);
    }
    if (roomName !== undefined) {
      updateFields.push('room_name = ?');
      updateParams.push(roomName);
    }
    if (roomType) {
      updateFields.push('room_type = ?');
      updateParams.push(roomType);
    }
    if (floor) {
      updateFields.push('floor = ?');
      updateParams.push(floor);
    }
    if (capacity) {
      updateFields.push('capacity = ?');
      updateParams.push(capacity);
    }
    if (dailyRate !== undefined) {
      updateFields.push('daily_rate = ?');
      updateParams.push(dailyRate);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateParams.push(description);
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
      UPDATE rooms SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, updateParams);
    
    // Fetch updated room
    const [updatedRoom] = await connection.execute(
      'SELECT * FROM rooms WHERE id = ?',
      [id]
    );
    
    return NextResponse.json((updatedRoom as any)[0]);

  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function DELETE(request: NextRequest) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }
    
    // Check if room has active assignments
    const [activeAssignments] = await connection.execute(
      'SELECT COUNT(*) as count FROM room_assignments WHERE room_id = ? AND status = "Active"',
      [id]
    );
    
    if ((activeAssignments as any)[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete room with active patient assignments' },
        { status: 400 }
      );
    }
    
    // Delete room
    await connection.execute('DELETE FROM rooms WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Room deleted successfully' });

  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
