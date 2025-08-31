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
  try {
    const connection = await mysql.createConnection(dbConfig);
    const { searchParams } = new URL(request.url);
    
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Fetch appointment statistics
    const [
      todayAppointmentsResult,
      confirmedResult,
      pendingResult,
      completedResult,
      typeStatsResult,
      weeklyStatsResult
    ] = await Promise.all([
      // Today's total appointments
      connection.execute(`
        SELECT COUNT(*) as count
        FROM appointments
        WHERE DATE(appointment_date) = ?
      `, [date]),

      // Confirmed appointments today
      connection.execute(`
        SELECT COUNT(*) as count
        FROM appointments
        WHERE DATE(appointment_date) = ? AND status = 'confirmed'
      `, [date]),

      // Pending appointments today
      connection.execute(`
        SELECT COUNT(*) as count
        FROM appointments
        WHERE DATE(appointment_date) = ? AND status = 'scheduled'
      `, [date]),

      // Completed appointments today
      connection.execute(`
        SELECT COUNT(*) as count
        FROM appointments
        WHERE DATE(appointment_date) = ? AND status = 'completed'
      `, [date]),

      // Appointment type statistics
      connection.execute(`
        SELECT 
          appointment_type,
          COUNT(*) as count
        FROM appointments
        WHERE DATE(appointment_date) = ?
        GROUP BY appointment_type
        ORDER BY count DESC
      `, [date]),

      // Weekly appointment trends
      connection.execute(`
        SELECT 
          DATE(appointment_date) as date,
          COUNT(*) as count,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM appointments
        WHERE appointment_date >= DATE_SUB(?, INTERVAL 7 DAY)
        GROUP BY DATE(appointment_date)
        ORDER BY date DESC
      `, [date])
    ]);

    const stats = {
      todayAppointments: (todayAppointmentsResult as any)[0][0]?.count || 0,
      confirmed: (confirmedResult as any)[0][0]?.count || 0,
      pending: (pendingResult as any)[0][0]?.count || 0,
      completed: (completedResult as any)[0][0]?.count || 0,
      typeStats: (typeStatsResult as any)[0].map((row: any) => ({
        type: row.appointment_type,
        count: row.count
      })),
      weeklyTrends: (weeklyStatsResult as any)[0].map((row: any) => ({
        date: row.date,
        total: row.count,
        completed: row.completed
      }))
    };

    await connection.end();

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Appointment stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment statistics' },
      { status: 500 }
    );
  }
}
