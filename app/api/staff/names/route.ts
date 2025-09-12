import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

// GET /api/staff/names
// Returns a unified list of staff and doctors for selects
export async function GET(_request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig)

    // Doctors
    const [doctors] = await connection.execute(
      `SELECT id, user_id, name, department, specialization
       FROM users
       WHERE role = 'doctor'
       ORDER BY name ASC`
    )

    // General staff (pharmacy, receptionist, staff)
    const [staffRows] = await connection.execute(
      `SELECT id, user_id, name, department, specialization, role
       FROM users
       WHERE role IN ('pharmacy', 'receptionist', 'staff')
       ORDER BY name ASC`
    )

    // Cleaning staff table
    const [cleaningRows] = await connection.execute(
      `SELECT id, name
       FROM cleaning_staff
       ORDER BY name ASC`
    )

    await connection.end()

    const mapDoctor = (d: any) => ({
      id: String(d.id),
      userId: String(d.user_id || d.id),
      name: d.name,
      role: 'doctor',
      department: d.department || d.specialization || null
    })

    const mapStaff = (s: any) => ({
      id: String(s.id),
      userId: String(s.user_id || s.id),
      name: s.name,
      role: s.role || 'staff',
      department: s.department || s.specialization || null
    })

    const mapCleaning = (c: any) => ({
      id: `CS${String(c.id)}`,
      userId: `CS${String(c.id).padStart(3, '0')}`,
      name: c.name,
      role: 'cleaning',
      department: 'Housekeeping'
    })

    const list = [
      ...(doctors as any[]).map(mapDoctor),
      ...(staffRows as any[]).map(mapStaff),
      ...(cleaningRows as any[]).map(mapCleaning)
    ]

    return NextResponse.json({ success: true, data: list })
  } catch (error) {
    console.error('Error fetching staff names:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch staff names' }, { status: 500 })
  }
}


