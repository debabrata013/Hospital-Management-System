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
    
    // Get total doctors count
    const [totalResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM users WHERE role = "doctor"'
    )
    const totalDoctors = (totalResult as any)[0].total
    
    // Get active doctors count
    const [activeResult] = await connection.execute(
      'SELECT COUNT(*) as active FROM users WHERE role = "doctor" AND is_active = 1'
    )
    const activeDoctors = (activeResult as any)[0].active
    
    // Get specializations count
    const [specializationsResult] = await connection.execute(
      'SELECT COUNT(DISTINCT specialization) as count FROM users WHERE role = "doctor" AND specialization IS NOT NULL'
    )
    const specializationsCount = (specializationsResult as any)[0].count
    
    // Get departments count
    const [departmentsResult] = await connection.execute(
      'SELECT COUNT(DISTINCT department) as count FROM users WHERE role = "doctor" AND department IS NOT NULL'
    )
    const departmentsCount = (departmentsResult as any)[0].count
    
    // Get doctors by specialization
    const [specializationBreakdown] = await connection.execute(`
      SELECT specialization, COUNT(*) as count 
      FROM users 
      WHERE role = "doctor" AND specialization IS NOT NULL 
      GROUP BY specialization 
      ORDER BY count DESC
    `)
    
    // Get recent doctors (last 30 days)
    const [recentResult] = await connection.execute(
      'SELECT COUNT(*) as recent FROM users WHERE role = "doctor" AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    )
    const recentDoctors = (recentResult as any)[0].recent
    
    await connection.end()
    
    return NextResponse.json({
      totalDoctors,
      activeDoctors,
      inactiveDoctors: totalDoctors - activeDoctors,
      specializationsCount,
      departmentsCount,
      recentDoctors,
      specializationBreakdown
    })
    
  } catch (error) {
    console.error('Error fetching doctor stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctor statistics' },
      { status: 500 }
    )
  }
}
