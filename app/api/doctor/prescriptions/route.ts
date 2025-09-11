import { NextRequest, NextResponse } from 'next/server'
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
      const tokenCookie = request.cookies.get('auth-token')
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
    // Simple token verification
    const tokenResult = extractAndVerifyToken(request)
    if (!tokenResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patient_id')

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    try {
      // First check what columns exist in users table
      const [userColumns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
      `) as any[]

      console.log('Available columns in users table:', userColumns)

      // First, try to find the patient name from the patient ID and get the actual patient ID
      let actualPatientId = patientId;
      try {
        const [patientRows] = await connection.execute(
          'SELECT id, name FROM patients WHERE patient_id = ? OR id = ?', 
          [patientId, patientId]
        ) as any[]
        if (patientRows.length > 0) {
          actualPatientId = patientRows[0].id;
          console.log('Found patient ID:', actualPatientId, 'for patient:', patientRows[0].name);
        }
      } catch (e) {
        console.log('Could not find patient, using provided ID as fallback');
      }

      // Query prescriptions for the specific patient
      const query = `
        SELECT 
          p.*
        FROM prescriptions p
        WHERE p.patient_id = ?
        ORDER BY p.prescription_date DESC, p.created_at DESC
      `

      console.log('Fetching prescriptions for patient ID:', actualPatientId)
      const [prescriptions] = await connection.execute(query, [actualPatientId]) as any[]
      console.log('Found prescriptions:', prescriptions)

      return NextResponse.json({
        success: true,
        prescriptions: prescriptions || []
      })

    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const tokenResult = extractAndVerifyToken(request)
    if (!tokenResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { patient_id, medications, dosage, instructions, duration } = body

    if (!patient_id || !medications || !dosage || !instructions) {
      return NextResponse.json(
        { error: 'Patient ID, medications, dosage, and instructions are required' },
        { status: 400 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)

    try {
      // Insert new prescription
      const insertQuery = `
        INSERT INTO prescriptions (
          patient_id, doctor_id, medications, dosage, instructions, duration, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `

      const [result] = await connection.execute(insertQuery, [
        patient_id,
        tokenResult.userId,
        medications,
        dosage,
        instructions,
        duration || null
      ]) as any[]

      return NextResponse.json({
        success: true,
        message: 'Prescription created successfully',
        prescriptionId: result.insertId
      })

    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json(
      { error: 'Failed to create prescription' },
      { status: 500 }
    )
  }
}
