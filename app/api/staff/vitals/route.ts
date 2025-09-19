import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../../../../lib/db/connection'
import jwt from 'jsonwebtoken'

// Function to extract staff name from JWT token
function getStaffNameFromToken(request: NextRequest): string {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('auth-backup')?.value
    if (!token) {
      return 'Staff Nurse'
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded && decoded.name) {
      return decoded.name
    }
    
    return 'Staff Nurse'
  } catch (error) {
    console.error('Error extracting staff name from token:', error)
    return 'Staff Nurse'
  }
}

// GET - Fetch vitals history
export async function GET(req: NextRequest) {
  try {
    // Simplified authentication - just check if token exists
    const token = req.cookies.get('auth-token')?.value || req.cookies.get('auth-backup')?.value
    if (!token) {
      return NextResponse.json({ success: false, vitals: [] })
    }

    // Get patientId from query parameters
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')

    // First, ensure the vitals table exists
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

    await executeQuery(createTableQuery)

    // Build query based on whether patientId is provided
    let query = `
      SELECT 
        v.id,
        v.patient_id as patientId,
        v.patient_name as patientName,
        v.blood_pressure,
        v.heart_rate,
        v.pulse,
        v.temperature,
        v.oxygen_saturation,
        v.respiratory_rate,
        v.weight,
        v.height,
        v.bmi,
        v.status,
        v.notes,
        v.recorded_by as recordedBy,
        v.recorded_by_name,
        v.recorded_at
      FROM vitals v
    `
    
    let queryParams = []
    if (patientId) {
      query += ` WHERE v.patient_id = ?`
      queryParams.push(patientId)
    }
    
    query += ` ORDER BY v.recorded_at DESC`

    const vitals = await executeQuery(query, queryParams) as any[]

    // Return data in the format expected by the doctor dashboard
    return NextResponse.json({
      success: true,
      vitals: vitals || []
    })

  } catch (error) {
    console.error('Error fetching vitals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Save new vitals
export async function POST(req: NextRequest) {
  try {
    // Simplified authentication - just check if token exists
    const token = req.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      patientId,
      patientName,
      bloodPressure,
      pulse,
      temperature,
      oxygenSaturation,
      respiratoryRate,
      weight,
      status,
      notes
    } = body

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    // First, create the vitals table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS vitals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        blood_pressure VARCHAR(20),
        pulse VARCHAR(10),
        temperature VARCHAR(10),
        oxygen_saturation VARCHAR(10),
        respiratory_rate VARCHAR(10),
        weight VARCHAR(10),
        height VARCHAR(10),
        status VARCHAR(20) DEFAULT 'Normal',
        notes TEXT,
        recorded_by VARCHAR(255) DEFAULT 'Staff Nurse',
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_patient_id (patient_id),
        INDEX idx_recorded_at (recorded_at)
      )
    `

    await executeQuery(createTableQuery)

    // Insert the new vitals record
    const insertQuery = `
      INSERT INTO vitals (
        patient_id, patient_name, blood_pressure, pulse, temperature,
        oxygen_saturation, respiratory_rate, weight, status, notes, recorded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    // Get the actual patient name from the database to ensure accuracy
    const patientQuery = `SELECT name FROM patients WHERE id = ?`
    const patientResult = await executeQuery(patientQuery, [patientId]) as any[]
    const actualPatientName = patientResult.length > 0 ? patientResult[0].name : patientName

    console.log("Patient lookup - ID:", patientId, "Name from frontend:", patientName, "Name from DB:", actualPatientName)

    // Get the actual staff name from the JWT token
    const staffName = getStaffNameFromToken(req)
    console.log("Recording vitals by staff:", staffName)

    const result = await executeQuery(insertQuery, [
      patientId,
      actualPatientName,
      bloodPressure || null,
      pulse || null,
      temperature || null,
      oxygenSaturation || null,
      respiratoryRate || null,
      weight || null,
      status || 'Normal',
      notes || null,
      staffName
    ])

    // Return the created vital record
    const newVital = {
      id: (result as any).insertId.toString(),
      patientId: patientId.toString(),
      patientName: actualPatientName,
      recordedAt: new Date().toISOString(),
      recordedBy: staffName,
      vitals: {
        bloodPressure: bloodPressure || '',
        pulse: pulse || '',
        temperature: temperature || '',
        oxygenSaturation: oxygenSaturation || '',
        respiratoryRate: respiratoryRate || '',
        weight: weight || '',
        height: '170'
      },
      status: status || 'Normal',
      notes: notes || ''
    }

    return NextResponse.json(newVital, { status: 201 })

  } catch (error) {
    console.error('Error saving vitals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
