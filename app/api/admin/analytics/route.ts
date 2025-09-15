import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export const dynamic = 'force-dynamic'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const connection = await mysql.createConnection(dbConfig)

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const end = endDate || new Date().toISOString().split('T')[0]

    // Daily patient registrations within range
    const [dailyRegs] = await connection.execute(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM patients
       WHERE DATE(created_at) BETWEEN ? AND ?
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at)` as any,
      [start, end]
    )

    // Patient load by department (appointments grouped by doctor's department)
    const [deptLoad] = await connection.execute(
      `SELECT 
         COALESCE(u.department, 'Unassigned') as department,
         COUNT(a.id) as count
       FROM appointments a
       LEFT JOIN users u ON a.doctor_id = u.id
       WHERE DATE(a.appointment_date) BETWEEN ? AND ?
       GROUP BY u.department
       ORDER BY count DESC` as any,
      [start, end]
    )

    // Department performance: completed vs scheduled within range
    const [deptPerf] = await connection.execute(
      `SELECT 
         COALESCE(u.department, 'Unassigned') as department,
         SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN a.status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
         COUNT(*) as total
       FROM appointments a
       LEFT JOIN users u ON a.doctor_id = u.id
       WHERE DATE(a.appointment_date) BETWEEN ? AND ?
       GROUP BY u.department
       ORDER BY total DESC` as any,
      [start, end]
    )

    await connection.end()

    return NextResponse.json({
      startDate: start,
      endDate: end,
      dailyRegistrations: dailyRegs,
      departmentLoad: deptLoad,
      departmentPerformance: deptPerf
    })
  } catch (error: any) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}


