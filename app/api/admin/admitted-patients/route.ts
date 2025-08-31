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
        ra.id,
        p.name,
        p.date_of_birth,
        ra.diagnosis,
        r.room_number,
        ra.admission_date,
        ra.status,
        u.name as assigned_by_name
      FROM room_assignments ra
      JOIN patients p ON ra.patient_id = p.id
      JOIN rooms r ON ra.room_id = r.id
      LEFT JOIN users u ON ra.assigned_by = u.id
      WHERE ra.status = 'Active'
      ORDER BY ra.admission_date DESC
      LIMIT 10
    `)

    await connection.end()

    // Transform the data to match the expected format
    const admittedPatients = (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      age: new Date().getFullYear() - new Date(row.date_of_birth).getFullYear(),
      condition: row.diagnosis,
      roomNumber: row.room_number,
      admissionDate: row.admission_date,
      status: row.status,
      doctor: { name: row.assigned_by_name || 'Not Assigned' }
    }))

    return NextResponse.json(admittedPatients)
  } catch (error) {
    console.error('Error fetching admitted patients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admitted patients' },
      { status: 500 }
    )
  }
}
