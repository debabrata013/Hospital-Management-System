import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

// GET - Fetch available rooms for admissions
export async function GET(request: NextRequest) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Get available rooms from the admin rooms table
    const [rooms] = await connection.execute(`
      SELECT 
        id,
        room_number,
        room_name,
        room_type,
        floor,
        capacity,
        current_occupancy,
        status,
        daily_rate,
        description
      FROM rooms 
      WHERE status IN ('Available', 'Cleaning Required') 
        OR (status = 'Occupied' AND current_occupancy < capacity)
      ORDER BY floor, room_number
    `);
    
    return NextResponse.json({ 
      success: true,
      rooms: rooms || [] 
    });

  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch rooms' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
