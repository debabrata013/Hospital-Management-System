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
    
    let query = `
      SELECT 
        rc.id,
        rc.room_id,
        rc.cleaning_type,
        rc.assigned_to,
        rc.scheduled_date,
        rc.completed_date,
        rc.status,
        rc.notes,
        rc.created_at,
        r.room_number,
        r.room_type
      FROM room_cleaning rc
      JOIN rooms r ON rc.room_id = r.id
    `;
    
    const whereConditions = [];
    const queryParams = [];
    
    if (status && status !== 'all') {
      whereConditions.push('rc.status = ?');
      queryParams.push(status);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY rc.scheduled_date DESC';
    
    const [cleanings] = await connection.execute(query, queryParams);
    
    return NextResponse.json(cleanings);
    
  } catch (error) {
    console.error('Error fetching room cleanings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room cleanings' },
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
      cleaningType,
      assignedTo,
      scheduledDate,
      notes
    } = body;
    
    // Validate required fields
    if (!roomId || !cleaningType || !scheduledDate) {
      return NextResponse.json(
        { error: 'Room ID, cleaning type, and scheduled date are required' },
        { status: 400 }
      );
    }
    
    // Check if room exists
    const [roomCheck] = await connection.execute(
      'SELECT id FROM rooms WHERE id = ?',
      [roomId]
    );
    
    if ((roomCheck as any).length === 0) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Create cleaning record
      const [result] = await connection.execute(`
        INSERT INTO room_cleaning (
          room_id, cleaning_type, assigned_to, scheduled_date, notes, status
        ) VALUES (?, ?, ?, ?, ?, 'Scheduled')
      `, [
        roomId, cleaningType, assignedTo || null, scheduledDate, notes || null
      ]);
      
      // Update room status to Under Maintenance if it's a deep clean
      if (cleaningType === 'Deep Clean') {
        await connection.execute(`
          UPDATE rooms 
          SET status = 'Under Maintenance', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [roomId]);
      }
      
      await connection.commit();
      
      const cleaningId = (result as any).insertId;
      
      // Fetch the created cleaning record
      const [newCleaning] = await connection.execute(`
        SELECT 
          rc.*,
          r.room_number,
          r.room_type
        FROM room_cleaning rc
        JOIN rooms r ON rc.room_id = r.id
        WHERE rc.id = ?
      `, [cleaningId]);
      
      return NextResponse.json((newCleaning as any)[0], { status: 201 });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error creating room cleaning:', error);
    return NextResponse.json(
      { error: 'Failed to create room cleaning' },
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
      status,
      completedDate,
      notes
    } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Cleaning ID is required' },
        { status: 400 }
      );
    }
    
    // Check if cleaning exists
    const [existingCleaning] = await connection.execute(
      'SELECT id, room_id, cleaning_type FROM room_cleaning WHERE id = ?',
      [id]
    );
    
    if ((existingCleaning as any).length === 0) {
      return NextResponse.json(
        { error: 'Room cleaning not found' },
        { status: 404 }
      );
    }
    
    const cleaning = (existingCleaning as any)[0];
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Update cleaning record
      const updateFields = [];
      const updateParams = [];
      
      if (status) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }
      if (completedDate) {
        updateFields.push('completed_date = ?');
        updateParams.push(completedDate);
      }
      if (notes !== undefined) {
        updateFields.push('notes = ?');
        updateParams.push(notes);
      }
      
      if (updateFields.length === 0) {
        return NextResponse.json(
          { error: 'No fields to update' },
          { status: 400 }
        );
      }
      
      updateParams.push(id);
      
      await connection.execute(`
        UPDATE room_cleaning 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, updateParams);
      
      // If cleaning is completed, update room status
      if (status === 'Completed') {
        await connection.execute(`
          UPDATE rooms 
          SET status = 'Available', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [cleaning.room_id]);
      }
      
      await connection.commit();
      
      // Fetch updated cleaning record
      const [updatedCleaning] = await connection.execute(`
        SELECT 
          rc.*,
          r.room_number,
          r.room_type
        FROM room_cleaning rc
        JOIN rooms r ON rc.room_id = r.id
        WHERE rc.id = ?
      `, [id]);
      
      return NextResponse.json((updatedCleaning as any)[0]);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error updating room cleaning:', error);
    return NextResponse.json(
      { error: 'Failed to update room cleaning' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
