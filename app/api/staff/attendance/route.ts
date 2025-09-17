import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { getServerSession } from '@/lib/auth-simple'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

// This enables dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET - Fetch staff attendance data
export async function GET(request: NextRequest) {
  let connection;
  try {
    const session = await getServerSession(request)
    if (!session?.user?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    connection = await mysql.createConnection(dbConfig)
    
    const [rows] = await connection.execute(
      'SELECT id, user_id, date, status, check_in, check_out FROM attendance WHERE user_id = ? ORDER BY date DESC',
      [session.user.userId]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      attendance: rows
    })

  } catch (error) {
    console.error('Error fetching attendance data:', error)
    if (connection) {
      await connection.end();
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance data' },
      { status: 500 }
    )
  }
}
