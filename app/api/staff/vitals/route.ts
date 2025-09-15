import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../../../../lib/db/connection'

// GET - Fetch vitals history
export async function GET(req: NextRequest) {
  try {
    // Simplified authentication - just check if token exists
    const token = req.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json([]) // Return empty array instead of error for now
    }

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

    const query = `
      SELECT 
        v.id,
        v.patient_id as patientId,
        v.patient_name as patientName,
        v.blood_pressure as bloodPressure,
        v.pulse,
        v.temperature,
        v.oxygen_saturation as oxygenSaturation,
        v.respiratory_rate as respiratoryRate,
        v.weight,
        v.height,
        v.status,
        v.notes,
        v.recorded_by as recordedBy,
        v.recorded_at as recordedAt
      FROM vitals v
      ORDER BY v.recorded_at DESC
    `

    const vitals = await executeQuery(query) as any[]

    // Format the data to match the frontend structure
    const formattedVitals = (vitals || []).map((vital: any) => ({
      id: vital.id.toString(),
      patientId: vital.patientId.toString(),
      patientName: vital.patientName,
      recordedAt: vital.recordedAt,
      recordedBy: vital.recordedBy,
      vitals: {
        bloodPressure: vital.bloodPressure || '',
        pulse: vital.pulse || '',
        temperature: vital.temperature || '',
        oxygenSaturation: vital.oxygenSaturation || '',
        respiratoryRate: vital.respiratoryRate || '',
        weight: vital.weight || '',
        height: vital.height || ''
      },
      status: vital.status || 'Normal',
      notes: vital.notes || ''
    }))

    return NextResponse.json(formattedVitals)

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

    const result = await executeQuery(insertQuery, [
      patientId,
      patientName,
      bloodPressure || null,
      pulse || null,
      temperature || null,
      oxygenSaturation || null,
      respiratoryRate || null,
      weight || null,
      status || 'Normal',
      notes || null,
      'Staff Nurse'
    ])

    // Return the created vital record
    const newVital = {
      id: (result as any).insertId.toString(),
      patientId: patientId.toString(),
      patientName: patientName,
      recordedAt: new Date().toISOString(),
      recordedBy: 'Staff Nurse',
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
