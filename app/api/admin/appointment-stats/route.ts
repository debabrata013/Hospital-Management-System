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

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Total appointments
    const [totalResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM appointments'
    )
    const totalAppointments = (totalResult as any)[0].total

    // Today's appointments
    const [todayResult] = await connection.execute(
      'SELECT COUNT(*) as today FROM appointments WHERE DATE(appointment_date) = ?',
      [today]
    )
    const todayAppointments = (todayResult as any)[0].today

    // Pending appointments
    const [pendingResult] = await connection.execute(
      'SELECT COUNT(*) as pending FROM appointments WHERE status = "Scheduled"'
    )
    const pendingAppointments = (pendingResult as any)[0].pending

    // Completed appointments
    const [completedResult] = await connection.execute(
      'SELECT COUNT(*) as completed FROM appointments WHERE status = "Completed"'
    )
    const completedAppointments = (completedResult as any)[0].completed

    // Cancelled appointments
    const [cancelledResult] = await connection.execute(
      'SELECT COUNT(*) as cancelled FROM appointments WHERE status = "Cancelled"'
    )
    const cancelledAppointments = (cancelledResult as any)[0].cancelled

    // Appointments by type
    const [typeResult] = await connection.execute(`
      SELECT appointment_type, COUNT(*) as count
      FROM appointments
      GROUP BY appointment_type
      ORDER BY count DESC
    `)

    // Recent appointments
    const [recentResult] = await connection.execute(`
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.appointment_type,
        p.name as patient_name,
        p.patient_id,
        u.name as doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON a.doctor_id = u.id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT 10
    `)

    await connection.end()

    return NextResponse.json({
      total: totalAppointments,
      today: todayAppointments,
      pending: pendingAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      byType: typeResult,
      recent: recentResult
    })
  } catch (error) {
    console.error('Error fetching appointment stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment statistics' },
      { status: 500 }
    )
  }
}
