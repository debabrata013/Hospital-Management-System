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
    console.log('[BREAK-END] Session:', session ? `User ID: ${session.user.userId}, Name: ${session.user.name}` : 'No session');

    if (!session || !session.user?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { break_id } = await req.json();

    if (!break_id) {
      return NextResponse.json({ success: false, error: 'Break ID is required' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Find the active break
    const [currentBreaks] = await connection.execute(
      'SELECT id, user_id, start_time FROM breaks WHERE id = ? AND user_id = ? AND end_time IS NULL',
      [break_id, session.user.userId]
    );

    if ((currentBreaks as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ success: false, error: 'No active break found to end.' }, { status: 404 });
    }

    const currentBreak = (currentBreaks as any[])[0];
    const endTime = new Date();
    const startTime = new Date(currentBreak.start_time);
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // in seconds

    // Update the break with end time and duration
    await connection.execute(
      'UPDATE breaks SET end_time = ?, duration = ? WHERE id = ?',
      [endTime, duration, break_id]
    );

    // Get the updated break
    const [updatedBreak] = await connection.execute(
      'SELECT id, user_id, start_time, end_time, duration FROM breaks WHERE id = ?',
      [break_id]
    );

    await connection.end();

    console.log('[BREAK-END] Break ended successfully for user:', session.user.userId, 'Duration:', duration, 'seconds');
    return NextResponse.json({ success: true, break: (updatedBreak as any[])[0] });
  } catch (error) {
    console.error('[BREAK-END] Error ending break:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
