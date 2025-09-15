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
    const date = searchParams.get('date') || ''
    const dashboard = searchParams.get('dashboard') || ''
    
    const offset = (page - 1) * limit
    
    const connection = await mysql.createConnection(dbConfig)
    
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    
    if (search) {
      whereClause += ' AND (p.name LIKE ? OR u.name LIKE ? OR a.appointment_type LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status) {
      whereClause += ' AND a.status = ?'
      params.push(status)
    }
    
    if (date) {
      whereClause += ' AND DATE(a.appointment_date) = ?'
      params.push(date)
    }
    
    // If dashboard mode, only get today's appointments
    if (dashboard === 'true') {
      const today = new Date().toISOString().split('T')[0]
      whereClause += ' AND DATE(a.appointment_date) = ?'
      params.push(today)
    }
    
    // Get total count
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total 
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u ON a.doctor_id = u.id
       ${whereClause}`,
      params
    )
    const total = (countResult as any)[0].total
    
    // Get appointments with pagination
    const [appointments] = await connection.execute(
      `SELECT 
        a.appointment_id, a.appointment_date, a.appointment_time, a.appointment_type,
        a.status, a.notes, a.created_at, a.updated_at,
        p.id as patient_id, p.name as patient_name, p.patient_id as patient_number,
        p.contact_number as patient_phone, p.date_of_birth as patient_dob,
        u.id as doctor_id, u.name as doctor_name, u.email as doctor_email
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u ON a.doctor_id = u.id
       ${whereClause}
       ORDER BY a.appointment_date DESC, a.appointment_time ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )
    
    await connection.end()
    
    // Transform data for frontend
    const transformedAppointments = (appointments as any[]).map(apt => ({
      id: apt.appointment_id,
      appointmentDate: apt.appointment_date,
      appointmentTime: apt.appointment_time,
      appointmentType: apt.appointment_type,
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.created_at,
      updatedAt: apt.updated_at,
      patient: {
        id: apt.patient_id,
        name: apt.patient_name,
        patientId: apt.patient_number,
        contactNumber: apt.patient_phone,
        dateOfBirth: apt.patient_dob
      },
      doctor: {
        id: apt.doctor_id,
        name: apt.doctor_name,
        email: apt.doctor_email,
        department: 'General Medicine' // Removed staff_profiles join, so department is hardcoded
      }
    }))
    
    return NextResponse.json({
      appointments: transformedAppointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      appointment_type,
      notes
    } = body
    
    // Validation
    if (!patient_id || !doctor_id || !appointment_date || !appointment_time || !appointment_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Check if patient exists and is active
    const [patientCheck] = await connection.execute(
      'SELECT id FROM patients WHERE id = ? AND is_active = 1',
      [patient_id]
    )
    
    if ((patientCheck as any[]).length === 0) {
      await connection.end()
      return NextResponse.json(
        { error: 'Patient not found or inactive' },
        { status: 400 }
      )
    }
    
    // Check if doctor exists and is active
    const [doctorCheck] = await connection.execute(
      'SELECT id FROM users WHERE id = ? AND role = "doctor" AND is_active = 1',
      [doctor_id]
    )
    
    if ((doctorCheck as any[]).length === 0) {
      await connection.end()
      return NextResponse.json(
        { error: 'Doctor not found or inactive' },
        { status: 400 }
      )
    }
    
    // Check for conflicting appointments
    const [conflictCheck] = await connection.execute(
      `SELECT id FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'Cancelled'`,
      [doctor_id, appointment_date, appointment_time]
    )
    
    if ((conflictCheck as any[]).length > 0) {
      await connection.end()
      return NextResponse.json(
        { error: 'Doctor has a conflicting appointment at this time' },
        { status: 400 }
      )
    }
    
    // Generate unique appointment_id using MAX on existing records to avoid duplicates
    const [maxRows] = await connection.execute(
      `SELECT MAX(CAST(SUBSTRING(appointment_id, 2) AS UNSIGNED)) AS maxNum FROM appointments`
    )
    let nextNum = ((maxRows as any[])[0]?.maxNum || 0) + 1
    let nextAppointmentId = `A${nextNum.toString().padStart(3, '0')}`

    // Try insert; if duplicate (race condition), increment and retry a few times
    let result: any
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const [res] = await connection.execute(
          `INSERT INTO appointments (
            appointment_id, patient_id, doctor_id, appointment_date, appointment_time, 
            appointment_type, status, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', ?, NOW(), NOW())`,
          [nextAppointmentId, patient_id, doctor_id, appointment_date, appointment_time, appointment_type, notes || null]
        )
        result = res
        break
      } catch (e: any) {
        if (e?.code === 'ER_DUP_ENTRY') {
          nextNum += 1
          nextAppointmentId = `A${nextNum.toString().padStart(3, '0')}`
          continue
        }
        throw e
      }
    }
    if (!result) {
      throw new Error('Failed to generate unique appointment id')
    }

    await connection.end()

    return NextResponse.json({
      message: 'Appointment created successfully',
      appointmentId: nextAppointmentId,
      id: (result as any).insertId
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
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
        { error: 'Appointment ID is required' },
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
      `UPDATE appointments SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      [...updateValues, id]
    )
    
    await connection.end()
    
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Appointment updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
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
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Soft delete - set status to Cancelled
    const [result] = await connection.execute(
      'UPDATE appointments SET status = "Cancelled", updated_at = NOW() WHERE id = ?',
      [id]
    )
    
    await connection.end()
    
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Appointment cancelled successfully'
    })
    
  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    )
  }
}
