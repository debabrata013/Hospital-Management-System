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
    
    // Get total users
    const [usersResult] = await connection.execute('SELECT COUNT(*) as total FROM users WHERE is_active = 1')
    const totalUsers = (usersResult as any)[0].total
    
    // Get total doctors
    const [doctorsResult] = await connection.execute('SELECT COUNT(*) as total FROM users WHERE role = "doctor" AND is_active = 1')
    const totalDoctors = (doctorsResult as any)[0].total
    
    // Get total admins
    const [adminsResult] = await connection.execute('SELECT COUNT(*) as total FROM users WHERE role IN ("admin", "super-admin") AND is_active = 1')
    const totalAdmins = (adminsResult as any)[0].total
    
    // Get total patients
    const [patientsResult] = await connection.execute('SELECT COUNT(*) as total FROM patients WHERE is_active = 1')
    const totalPatients = (patientsResult as any)[0].total
    
    // Get total appointments today
    const today = new Date().toISOString().split('T')[0]
    const [appointmentsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE DATE(appointment_date) = ?',
      [today]
    )
    const todayAppointments = (appointmentsResult as any)[0].total
    
    // Get system health metrics (calculated based on system status)
    const systemHealth = 98.5 // Mock value for now, can be calculated based on various factors
    
    // Get recent activities (from audit_logs if exists)
    let recentActivities = []
    try {
      const [activitiesResult] = await connection.execute(`
        SELECT 
          action,
          table_name,
          user_id,
          created_at,
          details
        FROM audit_logs 
        ORDER BY created_at DESC 
        LIMIT 10
      `)
      recentActivities = activitiesResult
    } catch (error) {
      // audit_logs table doesn't exist, use empty array
      recentActivities = []
    }
    
    // Get monthly growth data (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]
      
      try {
        const [monthUsers] = await connection.execute(
          'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) BETWEEN ? AND ?',
          [monthStart, monthEnd]
        )
        const [monthDoctors] = await connection.execute(
          'SELECT COUNT(*) as count FROM users WHERE role = "doctor" AND DATE(created_at) BETWEEN ? AND ?',
          [monthStart, monthEnd]
        )
        
        monthlyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          users: (monthUsers as any)[0].count,
          doctors: (monthDoctors as any)[0].count
        })
      } catch (error) {
        monthlyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          users: 0,
          doctors: 0
        })
      }
    }
    
    await connection.end()
    
    return NextResponse.json({
      stats: {
        totalUsers,
        totalDoctors,
        totalAdmins,
        totalPatients,
        todayAppointments,
        systemHealth
      },
      monthlyData,
      recentActivities
    })
    
  } catch (error) {
    console.error('Error fetching super-admin dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
