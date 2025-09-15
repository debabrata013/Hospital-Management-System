import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export const dynamic = 'force-dynamic'

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const type = searchParams.get('type') || 'overview'
    
    const connection = await mysql.createConnection(dbConfig)
    
    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)
    const startDateStr = startDate.toISOString().split('T')[0]
    
    let analyticsData: any = {}
    
    if (type === 'overview' || type === 'all') {
      // User growth analytics
      const [userGrowth] = await connection.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_users,
          role
        FROM users 
        WHERE created_at >= ?
        GROUP BY DATE(created_at), role
        ORDER BY date ASC
      `, [startDateStr])
      
      // Appointment trends
      const [appointmentTrends] = await connection.execute(`
        SELECT 
          DATE(appointment_date) as date,
          COUNT(*) as appointments,
          status
        FROM appointments 
        WHERE appointment_date >= ?
        GROUP BY DATE(appointment_date), status
        ORDER BY date ASC
      `, [startDateStr])
      
      // Patient registration trends
      const [patientTrends] = await connection.execute(`
        SELECT 
          DATE(registration_date) as date,
          COUNT(*) as new_patients
        FROM patients 
        WHERE registration_date >= ?
        GROUP BY DATE(registration_date)
        ORDER BY date ASC
      `, [startDateStr])
      
      analyticsData.userGrowth = userGrowth
      analyticsData.appointmentTrends = appointmentTrends
      analyticsData.patientTrends = patientTrends
    }
    
    if (type === 'performance' || type === 'all') {
      // System performance metrics
      const [systemMetrics] = await connection.execute(`
        SELECT 
          COUNT(CASE WHEN role = 'doctor' THEN 1 END) as active_doctors,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as active_admins,
          COUNT(CASE WHEN role = 'staff' THEN 1 END) as active_staff,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as total_active_users,
          COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_users
        FROM users
      `)
      
      // Appointment completion rates
      const [completionRates] = await connection.execute(`
        SELECT 
          status,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM appointments WHERE appointment_date >= ?), 2) as percentage
        FROM appointments 
        WHERE appointment_date >= ?
        GROUP BY status
      `, [startDateStr, startDateStr])
      
      analyticsData.systemMetrics = systemMetrics[0]
      analyticsData.completionRates = completionRates
    }
    
    if (type === 'revenue' || type === 'all') {
      // Revenue analytics (if billing table exists)
      try {
        const [revenueData] = await connection.execute(`
          SELECT 
            DATE(created_at) as date,
            SUM(total_amount) as revenue,
            COUNT(*) as transactions,
            payment_status
          FROM billing 
          WHERE created_at >= ?
          GROUP BY DATE(created_at), payment_status
          ORDER BY date ASC
        `, [startDateStr])
        
        analyticsData.revenueData = revenueData
      } catch (error) {
        // Billing table might not exist
        analyticsData.revenueData = []
      }
    }
    
    if (type === 'departments' || type === 'all') {
      // Department-wise analytics
      const [departmentStats] = await connection.execute(`
        SELECT 
          department,
          COUNT(*) as staff_count,
          role
        FROM users 
        WHERE department IS NOT NULL AND is_active = 1
        GROUP BY department, role
        ORDER BY staff_count DESC
      `)
      
      analyticsData.departmentStats = departmentStats
    }
    
    if (type === 'hospitals' || type === 'all') {
      // Hospital network analytics (if hospitals table exists)
      try {
        const [hospitalStats] = await connection.execute(`
          SELECT 
            type,
            COUNT(*) as count,
            SUM(beds) as total_beds,
            SUM(doctors) as total_doctors,
            SUM(staff) as total_staff,
            AVG(rating) as avg_rating
          FROM hospitals 
          GROUP BY type
        `)
        
        const [hospitalGrowth] = await connection.execute(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_hospitals
          FROM hospitals 
          WHERE created_at >= ?
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `, [startDateStr])
        
        analyticsData.hospitalStats = hospitalStats
        analyticsData.hospitalGrowth = hospitalGrowth
      } catch (error) {
        // Hospitals table might not exist
        analyticsData.hospitalStats = []
        analyticsData.hospitalGrowth = []
      }
    }
    
    // Summary statistics
    const [summaryStats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = 1) as total_active_users,
        (SELECT COUNT(*) FROM users WHERE role = 'doctor' AND is_active = 1) as total_doctors,
        (SELECT COUNT(*) FROM users WHERE role IN ('admin', 'super-admin') AND is_active = 1) as total_admins,
        (SELECT COUNT(*) FROM patients WHERE is_active = 1) as total_patients,
        (SELECT COUNT(*) FROM appointments WHERE appointment_date >= CURDATE()) as upcoming_appointments
    `)
    
    analyticsData.summary = summaryStats[0]
    
    await connection.end()
    
    return NextResponse.json({
      period: periodDays,
      type,
      data: analyticsData,
      generatedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
