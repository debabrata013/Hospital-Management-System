import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Use the same defaults as rooms API so both hit the same database
const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig)

    const [rows] = await connection.execute(`
      SELECT 
        ra.id AS id,
        p.id AS patientId,
        p.name AS name,
        TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) AS age,
        COALESCE(ra.diagnosis, '') AS cond,
        r.room_number AS roomNumber,
        ra.admission_date AS admissionDate,
        COALESCE(ra.status, 'Active') AS status
      FROM room_assignments ra
      JOIN patients p ON ra.patient_id = p.id
      JOIN rooms r ON ra.room_id = r.id
      WHERE ra.status = 'Active'
      ORDER BY ra.admission_date DESC
    `)

    await connection.end()

    const list = (rows as any[]).map(r => ({
      id: r.id,
      patientId: r.patientId,
      name: r.name,
      age: r.age ?? null,
      condition: r.cond,
      roomNumber: r.roomNumber,
      admissionDate: r.admissionDate,
      status: r.status,
      doctor: undefined
    }))

    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching admitted patients:', error)
    return NextResponse.json([])
  }
}
