import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../../../../lib/db/connection'
import jwt from 'jsonwebtoken'

// Function to extract nurse name from JWT token
function getNurseNameFromToken(request: NextRequest): string {
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
    console.error('Error extracting nurse name from token:', error)
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

    // Build query based on whether patientId is provided
    let query = `
      SELECT 
        v.id,
        v.patient_id as patientId,
        v.patient_name as patientName,
        v.blood_pressure,
        v.pulse,
        v.temperature,
        v.oxygen_saturation,
        v.respiratory_rate,
        v.weight,
        v.height,
        v.status,
        v.notes,
        v.recorded_by as recordedBy,
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

    // Transform data to match the expected format
    const transformedVitals = vitals.map(vital => ({
      id: vital.id.toString(),
      patientId: vital.patientId.toString(),
      patientName: vital.patientName,
      recordedAt: vital.recorded_at,
      recordedBy: vital.recordedBy || 'Staff Nurse',
      vitals: {
        bloodPressure: vital.blood_pressure || '',
        pulse: vital.pulse || '',
        temperature: vital.temperature || '',
        oxygenSaturation: vital.oxygen_saturation || '',
        respiratoryRate: vital.respiratory_rate || '',
        weight: vital.weight || '',
        height: vital.height || '170'
      },
      status: vital.status || 'Normal',
      notes: vital.notes || ''
    }))

    return NextResponse.json(transformedVitals)

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

    // Get the actual nurse name from the JWT token
    const nurseName = getNurseNameFromToken(req)
    console.log("Recording vitals by nurse:", nurseName)

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
      nurseName
    ])

    // Return the created vital record
    const newVital = {
      id: (result as any).insertId.toString(),
      patientId: patientId.toString(),
      patientName: actualPatientName,
      recordedAt: new Date().toISOString(),
      recordedBy: nurseName,
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
