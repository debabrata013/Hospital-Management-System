import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-simple';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    console.log('[BREAK-START] Session:', session ? `User ID: ${session.user.userId}, Name: ${session.user.name}` : 'No session');

    if (!session || !session.user?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Check if there is an active break already
    const [existingBreaks] = await connection.execute(
      'SELECT id FROM breaks WHERE user_id = ? AND end_time IS NULL',
      [session.user.userId]
    );

    if ((existingBreaks as any[]).length > 0) {
      await connection.end();
      return NextResponse.json({ success: false, error: 'You are already on a break.' }, { status: 400 });
    }

    // Start new break
    const [result] = await connection.execute(
      'INSERT INTO breaks (user_id, start_time) VALUES (?, NOW())',
      [session.user.userId]
    );

    // Get the created break
    const [newBreak] = await connection.execute(
      'SELECT id, user_id, start_time, end_time, duration FROM breaks WHERE id = ?',
      [(result as any).insertId]
    );

    await connection.end();

    console.log('[BREAK-START] Break started successfully for user:', session.user.userId);
    return NextResponse.json({ success: true, break: (newBreak as any[])[0] }, { status: 201 });
  } catch (error) {
    console.error('[BREAK-START] Error starting break:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
