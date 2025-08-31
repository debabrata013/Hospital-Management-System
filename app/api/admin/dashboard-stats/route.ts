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
    
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch all statistics in parallel
    const [
      appointmentsResult,
      admittedPatientsResult,
      stockAlertsResult,
      revenueResult
    ] = await Promise.all([
      // Today's appointments
      connection.execute(`
        SELECT 
          COUNT(*) as totalAppointments,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedAppointments
        FROM appointments 
        WHERE DATE(appointment_date) = ?
      `, [today]),
      
      // Admitted patients (using Admissions table)
      connection.execute(`
        SELECT 
          COUNT(*) as admittedPatients,
          0 as availableBeds
        FROM Admissions 
        WHERE status = 'admitted'
      `),
      
      // Stock alerts (using medicines table)
      connection.execute(`
        SELECT COUNT(*) as criticalAlerts
        FROM medicines 
        WHERE current_stock <= minimum_stock AND is_active = 1
      `),
      
      // Today's revenue (using billing table)
      connection.execute(`
        SELECT COALESCE(SUM(total_amount), 0) as todayRevenue
        FROM billing 
        WHERE DATE(bill_date) = ? AND payment_status = 'paid'
      `, [today])
    ]);

    const stats = {
      totalAppointments: (appointmentsResult[0] as any)[0]?.totalAppointments || 0,
      completedAppointments: (appointmentsResult[0] as any)[0]?.completedAppointments || 0,
      admittedPatients: (admittedPatientsResult[0] as any)[0]?.admittedPatients || 0,
      availableBeds: (admittedPatientsResult[0] as any)[0]?.availableBeds || 0,
      criticalAlerts: (stockAlertsResult[0] as any)[0]?.criticalAlerts || 0,
      todayRevenue: parseFloat((revenueResult[0] as any)[0]?.todayRevenue || 0)
    };

    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
