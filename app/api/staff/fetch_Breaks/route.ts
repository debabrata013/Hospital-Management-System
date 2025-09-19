import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-simple';
import mysql from 'mysql2/promise';
import { isStaticBuild } from '@/lib/api-utils';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // During static build, return mock data
  if (isStaticBuild()) {
    return NextResponse.json({ 
      success: true, 
      breaks: [
        {
          id: 1,
          user_id: 1,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          duration: 900 // 15 minutes in seconds
        }
      ]
    });
  }

  try {
    const session = await getServerSession(req);
    console.log('[FETCH-BREAKS] Session:', session ? `User ID: ${session.user.userId}, Name: ${session.user.name}` : 'No session');

    if (!session || !session.user?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // First, check for and clean up orphaned active breaks (older than 12 hours)
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    
    const [orphanedBreaks] = await connection.execute(
      `SELECT id, start_time FROM breaks 
       WHERE user_id = ? AND end_time IS NULL AND start_time < ?`,
      [session.user.userId, twelveHoursAgo]
    );

    if ((orphanedBreaks as any[]).length > 0) {
      console.log('[FETCH-BREAKS] Found', (orphanedBreaks as any[]).length, 'orphaned breaks, cleaning up...');
      
      // Auto-end orphaned breaks with a reasonable duration (assume 30 minutes)
      for (const orphanedBreak of (orphanedBreaks as any[])) {
        const endTime = new Date(new Date(orphanedBreak.start_time).getTime() + 30 * 60 * 1000); // 30 minutes after start
        const duration = 30 * 60; // 30 minutes in seconds
        
        await connection.execute(
          'UPDATE breaks SET end_time = ?, duration = ? WHERE id = ?',
          [endTime, duration, orphanedBreak.id]
        );
        
        console.log('[FETCH-BREAKS] Auto-ended orphaned break:', orphanedBreak.id);
      }
    }

    // Get today's breaks for the user
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [breaks] = await connection.execute(
      `SELECT id, user_id, start_time, end_time, duration 
       FROM breaks 
       WHERE user_id = ? AND start_time >= ? AND start_time < ?
       ORDER BY start_time DESC`,
      [session.user.userId, startOfDay, endOfDay]
    );

    await connection.end();

    console.log('[FETCH-BREAKS] Found', (breaks as any[]).length, 'breaks for user:', session.user.userId);
    return NextResponse.json({ success: true, breaks });
  } catch (error) {
    console.error('[FETCH-BREAKS] Error fetching breaks:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
