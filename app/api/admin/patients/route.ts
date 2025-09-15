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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    
    const offset = (page - 1) * limit
    
    const connection = await mysql.createConnection(dbConfig)
    
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR patient_id LIKE ? OR contact_number LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status) {
      whereClause += ' AND is_active = ?'
      params.push(status === 'active' ? 1 : 0)
    }
    
    // Get total count
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM patients ${whereClause}`,
      params
    )
    const total = (countResult as any)[0].total
    
    // Get patients with pagination
    const [patients] = await connection.execute(
      `SELECT 
        id, patient_id, name, date_of_birth, gender, contact_number, 
        email, address, blood_group, emergency_contact_name, emergency_contact_number,
        emergency_contact_relation, city, state, pincode, marital_status, occupation,
        insurance_provider, insurance_policy_number, insurance_expiry_date,
        aadhar_number, profile_image, medical_history, allergies, current_medications,
        is_active, registration_date, created_by, created_at, updated_at
       FROM patients 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )
    
    await connection.end()
    
    // For vitals page, return simple array format
    if (searchParams.get('simple') === 'true') {
      return NextResponse.json(patients)
    }
    
    return NextResponse.json({
      patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      date_of_birth,
      gender,
      contact_number,
      email,
      address,
      blood_group,
      emergency_contact_name,
      emergency_contact_number,
      emergency_contact_relation,
      city,
      state,
      pincode,
      marital_status,
      occupation,
      insurance_provider,
      insurance_policy_number,
      insurance_expiry_date,
      aadhar_number
    } = body
    
    // Validation
    if (!name || !date_of_birth || !gender || !contact_number || !address || !emergency_contact_name || !emergency_contact_number) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Generate unique patient ID
    const [lastPatient] = await connection.execute(
      'SELECT patient_id FROM patients ORDER BY id DESC LIMIT 1'
    )
    
    let nextPatientId = 'P001';
    if ((lastPatient as any[]).length > 0) {
      const lastId = (lastPatient as any[])[0].patient_id;
      // Validate lastId format: starts with 'P' and followed by a number
      if (lastId && /^P\d+$/.test(lastId)) {
        const num = parseInt(lastId.substring(1));
        if (!isNaN(num)) {
          nextPatientId = `P${(num + 1).toString().padStart(3, '0')}`;
        }
      }
    }
    
    // Insert new patient
    const [result] = await connection.execute(
      `INSERT INTO patients (
        patient_id, name, date_of_birth, gender, contact_number, 
        email, address, blood_group, emergency_contact_name, emergency_contact_number,
        emergency_contact_relation, city, state, pincode, marital_status, occupation,
        insurance_provider, insurance_policy_number, insurance_expiry_date, aadhar_number,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        nextPatientId, name, date_of_birth, gender, contact_number,
        email || null, address, blood_group || null, emergency_contact_name, emergency_contact_number,
        emergency_contact_relation || null, city || null, state || null, pincode || null,
        marital_status || null, occupation || null, insurance_provider || null,
        insurance_policy_number || null, insurance_expiry_date || null, aadhar_number || null
      ]
    )
    
    await connection.end()
    
    return NextResponse.json({
      message: 'Patient created successfully',
      patientId: nextPatientId,
      id: (result as any).insertId
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Build update query dynamically
    const updateFields = Object.keys(updateData)
      .filter(key => updateData[key] !== undefined)
      .map(key => `${key} = ?`)
    
    if (updateFields.length === 0) {
      await connection.end()
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }
    
    const updateValues = Object.keys(updateData)
      .filter(key => updateData[key] !== undefined)
      .map(key => updateData[key])
    
    const [result] = await connection.execute(
      `UPDATE patients SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      [...updateValues, id]
    )
    
    await connection.end()
    
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Patient updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Soft delete - set is_active to 0
    const [result] = await connection.execute(
      'UPDATE patients SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    )
    
    await connection.end()
    
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Patient deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    )
  }
}
