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

    const [rows] = await connection.execute(`
      SELECT 
        u.id,
        u.name,
        sp.department,
        sp.employee_type as status,
        sp.work_location
      FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'doctor' AND u.is_active = 1
      ORDER BY u.name ASC
      LIMIT 10
    `)

    await connection.end()

    // Transform the data to match the expected format
    const doctorSchedules = (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      department: row.department || 'General Medicine',
      status: row.status || 'full-time',
      shifts: [
        { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00' }
      ]
    }))

    return NextResponse.json(doctorSchedules)
  } catch (error) {
    console.error('Error fetching doctor schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctor schedules' },
      { status: 500 }
    )
  }
}
