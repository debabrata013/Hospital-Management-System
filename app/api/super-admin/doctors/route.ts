import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

// GET - Fetch all doctors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    const connection = await mysql.createConnection(dbConfig)
    const [rows] = await connection.execute(
      `SELECT id, user_id, name, email, contact_number, department, specialization
       FROM users
       WHERE role = 'doctor'
       ORDER BY name ASC
       LIMIT ?`,
      [limit]
    )
    await connection.end()

    const doctors = (rows as any[]).map(d => ({
      id: d.id,
      user_id: d.user_id,
      name: d.name,
      email: d.email,
      contact_number: d.contact_number,
      department: d.department,
      specialization: d.specialization,
    }))

    return NextResponse.json({ success: true, doctors })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new doctor
export async function POST(request: NextRequest) {
  try {
    const { name, mobile, password, department, experience, patientsTreated, description, available, languages } = await request.json()
    
    // Validate input
    if (!name || !mobile || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, mobile, and password are required' },
        { status: 400 }
      )
    }
    
    // Validate mobile number (10 digits starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      )
    }
    
    // Validate password (6 digits)
    if (!/^\d{6}$/.test(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must be exactly 6 digits' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Check if mobile already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE contact_number = ?',
      [mobile]
    )
    
    if ((existingUsers as any[]).length > 0) {
      await connection.end()
      return NextResponse.json(
        { success: false, error: 'Mobile number already exists' },
        { status: 400 }
      )
    }
    
    // Generate new doctor ID
    const [lastDoctor] = await connection.execute(
      'SELECT user_id FROM users WHERE role = "doctor" ORDER BY id DESC LIMIT 1'
    )
    
    let nextNumber = 1
    if ((lastDoctor as any[]).length > 0) {
      const lastUserId = (lastDoctor as any)[0].user_id
      const match = lastUserId.match(/DR(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }
    
    const userId = `DR${nextNumber.toString().padStart(3, '0')}`
    const email = `${userId.toLowerCase()}@hospital.com`
    
    // Parse experience years
    let experienceYears = 0
    if (experience) {
      const match = experience.match(/(\d+)/)
      if (match) {
        experienceYears = parseInt(match[1])
      }
    }
    
    // Insert new doctor
    const [result] = await connection.execute(`
      INSERT INTO users (
        user_id, name, email, contact_number, password_hash, role, 
        department, specialization, is_active, is_verified, 
        experience_years, qualification, created_at
      ) VALUES (?, ?, ?, ?, ?, 'doctor', ?, ?, 1, 1, ?, ?, NOW())
    `, [
      userId, name, email, mobile, password,
      department || 'General Medicine', department || 'General Medicine',
      experienceYears, description || ''
    ])
    
    await connection.end()
    
    return NextResponse.json({
      success: true,
      message: 'Doctor created successfully',
      doctor: {
        id: (result as any).insertId,
        user_id: userId,
        name: name,
        email: email,
        mobile: mobile,
        department: department || 'General Medicine',
        experience: experience || '',
        patientsTreated: patientsTreated || '',
        description: description || '',
        available: available || '',
        languages: languages || ''
      }
    })
  } catch (error) {
    console.error('Error creating doctor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create doctor' },
      { status: 500 }
    )
  }
}

// PUT - Update doctor
export async function PUT(request: NextRequest) {
  try {
    const { id, name, mobile, password, department, experience, patientsTreated, description, available, languages } = await request.json()
    
    // Debug logging
    console.log('Doctor update request received:')
    console.log('ID:', id, 'Type:', typeof id)
    console.log('Name:', name)
    console.log('Mobile:', mobile, 'Type:', typeof mobile, 'Length:', mobile?.length)
    console.log('Password:', password, 'Type:', typeof password, 'Length:', password?.length)
    
    if (!id) {
      console.log('Validation failed: Missing ID')
      return NextResponse.json(
        { success: false, error: 'Doctor ID is required' },
        { status: 400 }
      )
    }
    
    // Validate mobile number if provided
    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
      console.log('Validation failed: Invalid mobile format')
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      )
    }
    
    // Validate password if provided
    if (password && !/^\d{6}$/.test(password)) {
      console.log('Validation failed: Invalid password format')
      return NextResponse.json(
        { success: false, error: 'Password must be exactly 6 digits' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Check if mobile already exists for other users
    if (mobile) {
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE contact_number = ? AND id != ?',
        [mobile, id]
      )
      
      if ((existingUsers as any[]).length > 0) {
        await connection.end()
        return NextResponse.json(
          { success: false, error: 'Mobile number already exists' },
          { status: 400 }
        )
      }
    }
    
    // Build update query
    let updateFields = []
    let updateValues = []
    
    if (name) {
      updateFields.push('name = ?')
      updateValues.push(name)
    }
    if (mobile) {
      updateFields.push('contact_number = ?')
      updateValues.push(mobile)
    }
    if (password) {
      updateFields.push('password_hash = ?')
      updateValues.push(password)
    }
    if (department) {
      updateFields.push('department = ?, specialization = ?')
      updateValues.push(department, department)
    }
    if (experience !== undefined) {
      // Parse experience years
      let experienceYears = 0
      if (experience) {
        const match = experience.match(/(\d+)/)
        if (match) {
          experienceYears = parseInt(match[1])
        }
      }
      updateFields.push('experience_years = ?')
      updateValues.push(experienceYears)
    }
    if (description !== undefined) {
      updateFields.push('qualification = ?')
      updateValues.push(description)
    }
    
    updateValues.push(id)
    
    // Update doctor
    await connection.execute(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND role = 'doctor'
    `, updateValues)
    
    // Get updated doctor data
    const [updatedDoctor] = await connection.execute(`
      SELECT id, user_id, name, email, contact_number, department, specialization,
             experience_years, qualification
      FROM users WHERE id = ?
    `, [id])
    
    await connection.end()
    
    const doctor = (updatedDoctor as any[])[0]
    
    return NextResponse.json({
      success: true,
      message: 'Doctor updated successfully',
      doctor: {
        id: doctor.id,
        user_id: doctor.user_id,
        name: doctor.name,
        email: doctor.email,
        mobile: doctor.contact_number,
        department: doctor.department || doctor.specialization,
        experience: doctor.experience_years ? `${doctor.experience_years} years` : '',
        patientsTreated: patientsTreated || '',
        description: doctor.qualification || '',
        available: available || '',
        languages: languages || ''
      }
    })
  } catch (error) {
    console.error('Error updating doctor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update doctor' },
      { status: 500 }
    )
  }
}

// DELETE - Delete doctor
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Doctor ID is required' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Delete doctor from database
    await connection.execute(
      'DELETE FROM users WHERE id = ? AND role = "doctor"',
      [id]
    )
    
    await connection.end()
    
    return NextResponse.json({
      success: true,
      message: 'Doctor deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting doctor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete doctor' },
      { status: 500 }
    )
  }
}
