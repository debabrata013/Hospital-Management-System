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
    
    // Get total admissions today (new appointments)
    let todayAdmissions = 0
    try {
      const [admissionsResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM appointments WHERE DATE(appointment_date) = ? AND status IN ("scheduled", "confirmed", "in-progress")',
        [today]
      )
      todayAdmissions = (admissionsResult as any)[0].total
    } catch (error) {
      console.error('Error fetching today admissions:', error)
      todayAdmissions = 0
    }
    
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
    
    // Get admission data for last 7 days
    const admissionData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      
      try {
        // Get new appointments (admissions) for this day
        const [admissions] = await connection.execute(
          'SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = ? AND status IN ("scheduled", "confirmed")',
          [dateStr]
        )
        // Get completed appointments (discharges) for this day
        const [discharges] = await connection.execute(
          'SELECT COUNT(*) as count FROM appointments WHERE DATE(updated_at) = ? AND status = "completed"',
          [dateStr]
        )
        
        admissionData.push({
          date: dayName,
          admissions: (admissions as any)[0].count,
          discharges: (discharges as any)[0].count
        })
      } catch (error) {
        console.error('Error fetching admission data for', dateStr, error)
        // Use zero data instead of mock data
        admissionData.push({
          date: dayName,
          admissions: 0,
          discharges: 0
        })
      }
    }
    
    // Get appointment data for today - Total OPD vs Admitted
    let appointmentData = []
    
    try {
      // Get total OPD appointments today (scheduled/confirmed appointments)
      const [opdTotal] = await connection.execute(
        'SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = ? AND status IN ("scheduled", "confirmed", "in-progress")',
        [today]
      )
      
      // Get total admitted patients today
      const [admittedTotal] = await connection.execute(
        'SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = ? AND status = "completed"',
        [today]
      )
      
      appointmentData = [
        { name: 'OPD Patients', value: (opdTotal as any)[0].count },
        { name: 'Admitted Patients', value: (admittedTotal as any)[0].count }
      ]
    } catch (error) {
      console.error('Error fetching appointment data:', error)
      // Fallback to empty data instead of mock data
      appointmentData = [
        { name: 'OPD Patients', value: 0 },
        { name: 'Admitted Patients', value: 0 }
      ]
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
        todayAdmissions,
        systemHealth
      },
      monthlyData,
      admissionData,
      appointmentData,
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
