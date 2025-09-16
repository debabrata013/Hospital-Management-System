import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management'
}

// Simple token extraction and verification
function extractAndVerifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      const tokenCookie = request.cookies.get('auth-token') || request.cookies.get('auth-backup')
      if (tokenCookie) {
        token = tokenCookie.value
      }
    }

    if (!token) {
      return { success: false, error: 'No token provided' }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (!decoded || !decoded.userId) {
      return { success: false, error: 'Invalid token' }
    }

    return { success: true, userId: decoded.userId }
  } catch (error) {
    return { success: false, error: 'Token verification failed' }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Token verification
    const tokenResult = extractAndVerifyToken(request)
    if (!tokenResult.success) {
      return NextResponse.json({ success: false, vitals: [] })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Patient ID is required',
        vitals: [] 
      })
    }

    const connection = await mysql.createConnection(dbConfig)

    try {
      // First ensure the vitals table exists
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS vitals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          patient_id INT NOT NULL,
          patient_name VARCHAR(255) NOT NULL,
          blood_pressure VARCHAR(20),
          heart_rate VARCHAR(10),
          pulse VARCHAR(10),
          temperature VARCHAR(10),
          oxygen_saturation VARCHAR(10),
          respiratory_rate VARCHAR(10),
          weight VARCHAR(10),
          height VARCHAR(10),
          bmi VARCHAR(10),
          status VARCHAR(20) DEFAULT 'Normal',
          notes TEXT,
          recorded_by VARCHAR(255) DEFAULT 'Staff Nurse',
          recorded_by_name VARCHAR(255) DEFAULT 'Staff',
          recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_patient_id (patient_id),
          INDEX idx_recorded_at (recorded_at)
        )
      `

      await connection.execute(createTableQuery)

      // First check what columns actually exist in the vitals table
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vitals'
      `) as any[]

      console.log('Available columns in vitals table:', columns.map((c: any) => c.COLUMN_NAME))

      // Query vitals for the specific patient using only existing columns
      const query = `
        SELECT 
          v.id,
          v.patient_id,
          v.patient_name,
          v.blood_pressure,
          v.pulse,
          v.temperature,
          v.oxygen_saturation,
          v.respiratory_rate,
          v.weight,
          v.height,
          v.status,
          v.notes,
          v.recorded_by,
          v.recorded_at
        FROM vitals v
        WHERE v.patient_id = ?
        ORDER BY v.recorded_at DESC
      `

      console.log('Fetching vitals for patient ID:', patientId)
      const [vitals] = await connection.execute(query, [patientId]) as any[]
      console.log('Found vitals:', vitals.length)

      return NextResponse.json({
        success: true,
        vitals: vitals || []
      })

    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error fetching vitals:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch vitals',
      vitals: []
    })
  }
}
