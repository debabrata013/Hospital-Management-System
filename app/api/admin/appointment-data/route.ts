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

    // Fetch patients
    const [patients] = await connection.execute(`
      SELECT id, name, patient_id, contact_number
      FROM patients 
      WHERE is_active = 1
      ORDER BY name ASC
    `)

    // Fetch doctors (from users table directly)
    const [doctors] = await connection.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.specialization
      FROM users u
      WHERE u.role = 'doctor' AND u.is_active = 1
      ORDER BY u.name ASC
    `)

    // Appointment types (hardcoded for now)
    const appointmentTypes = [
      'General Consultation',
      'Follow-up',
      'Emergency',
      'Surgery',
      'Lab Test',
      'X-Ray',
      'Specialist Consultation'
    ]

    await connection.end()

    return NextResponse.json({
      patients,
      doctors,
      appointmentTypes
    })
  } catch (error) {
    console.error('Error fetching appointment data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment data' },
      { status: 500 }
    )
  }
}
