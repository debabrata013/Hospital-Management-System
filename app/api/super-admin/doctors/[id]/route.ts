import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const connection = await mysql.createConnection(dbConfig)
    
    const [doctors] = await connection.execute(`
      SELECT 
        id, user_id, name, email, contact_number, specialization,
        qualification, experience_years, license_number, department,
        address, date_of_birth, gender, joining_date, salary,
        is_active, is_verified, last_login, created_at, updated_at
      FROM users 
      WHERE id = ? AND role = "doctor"
    `, [params.id])
    
    await connection.end()
    
    if ((doctors as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ doctor: (doctors as any[])[0] })
    
  } catch (error) {
    console.error('Error fetching doctor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { 
      name, email, contact_number, specialization, qualification,
      experience_years, license_number, department, address,
      date_of_birth, gender, joining_date, salary, is_active
    } = body
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Check if email exists for other users
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, params.id]
    )
    
    if ((existingUser as any[]).length > 0) {
      await connection.end()
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }
    
    // Update doctor
    await connection.execute(`
      UPDATE users 
      SET name = ?, email = ?, contact_number = ?, specialization = ?,
          qualification = ?, experience_years = ?, license_number = ?,
          department = ?, address = ?, date_of_birth = ?, gender = ?,
          joining_date = ?, salary = ?, is_active = ?, updated_at = NOW()
      WHERE id = ? AND role = "doctor"
    `, [
      name, email, contact_number, specialization, qualification,
      experience_years, license_number, department, address,
      date_of_birth, gender, joining_date, salary, is_active, params.id
    ])
    
    await connection.end()
    
    return NextResponse.json({ message: 'Doctor updated successfully' })
    
  } catch (error) {
    console.error('Error updating doctor:', error)
    return NextResponse.json(
      { error: 'Failed to update doctor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const connection = await mysql.createConnection(dbConfig)
    
    // Soft delete by setting is_active to 0
    await connection.execute(
      'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ? AND role = "doctor"',
      [params.id]
    )
    
    await connection.end()
    
    return NextResponse.json({ message: 'Doctor deactivated successfully' })
    
  } catch (error) {
    console.error('Error deleting doctor:', error)
    return NextResponse.json(
      { error: 'Failed to delete doctor' },
      { status: 500 }
    )
  }
}
