import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
};

export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Fetch all nurses from users table only
    const [nurses] = await connection.execute(`
      SELECT 
        id,
        name,
        email,
        role,
        contact_number as mobile,
        created_at,
        updated_at,
        1 as is_active
      FROM users 
      WHERE role = 'nurse'
      ORDER BY name ASC
    `);

    await connection.end();

    return NextResponse.json({
      nurses: nurses,
      count: Array.isArray(nurses) ? nurses.length : 0
    });
  } catch (error) {
    console.error('Error fetching nurses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nurses' },
      { status: 500 }
    );
  }
}
