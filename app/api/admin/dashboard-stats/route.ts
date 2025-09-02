import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig)
    
    // Get total patients
    const [patientsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM patients WHERE is_active = 1'
    )
    const totalPatients = (patientsResult as any)[0].total
    
    // Get total appointments for today
    const today = new Date().toISOString().split('T')[0]
    const [todayAppointmentsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE DATE(appointment_date) = ?',
      [today]
    )
    const todayAppointments = (todayAppointmentsResult as any)[0].total
    
    // Get total appointments
    const [totalAppointmentsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM appointments'
    )
    const totalAppointments = (totalAppointmentsResult as any)[0].total
    
    // Get pending appointments
    const [pendingAppointmentsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE status = "scheduled"'
    )
    const pendingAppointments = (pendingAppointmentsResult as any)[0].total
    
    // Get completed appointments
    const [completedAppointmentsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE status = "completed"'
    )
    const completedAppointments = (completedAppointmentsResult as any)[0].total
    
    // Get total doctors - check the actual role values in users table
    const [doctorsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM users WHERE role LIKE "%doctor%" AND is_active = 1'
    )
    const totalDoctors = (doctorsResult as any)[0].total
    
    // Get total revenue (if billing table exists)
    let totalRevenue = 0
    try {
      const [revenueResult] = await connection.execute(
        'SELECT COALESCE(SUM(total_amount), 0) as total FROM billing WHERE payment_status = "Paid"'
      )
      totalRevenue = (revenueResult as any)[0].total
    } catch (error) {
      // Billing table might not exist, use 0
      totalRevenue = 0
    }
    
    // Get recent appointments for dashboard
    const [recentAppointments] = await connection.execute(
      `SELECT 
        a.appointment_id, a.appointment_date, a.appointment_time, a.appointment_type, a.status,
        p.name as patient_name, p.patient_id as patient_number,
        u.name as doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u ON a.doctor_id = u.id
       WHERE DATE(a.appointment_date) >= ?
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT 5`,
      [today]
    )
    
    // Get stock alerts count
    let criticalAlerts = 0
    try {
      const [alertsResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM medicines WHERE current_stock <= minimum_stock OR current_stock <= 10'
      )
      criticalAlerts = (alertsResult as any)[0].total
    } catch (error) {
      criticalAlerts = 0
    }
    
    // Get admitted patients count
    let admittedPatients = 0
    try {
      const [admittedResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM room_assignments WHERE status = "Active"'
      )
      admittedPatients = (admittedResult as any)[0].total
    } catch (error) {
      admittedPatients = 0
    }
    
    await connection.end()
    
    return NextResponse.json({
      totalPatients,
      totalAppointments: todayAppointments,
      completedAppointments,
      admittedPatients,
      availableBeds: Math.max(0, 50 - admittedPatients), // Assuming 50 total beds
      criticalAlerts,
      todayRevenue: totalRevenue || 0,
      recentAppointments: recentAppointments || []
    })
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
