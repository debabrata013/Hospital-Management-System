import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      name, 
      email, 
      role, 
      contact_number, 
      department,
      joining_date
    } = body
    
    const id = params.id
    
    if (!id || !name || !email || !role || !contact_number) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate role - only allow staff roles
    const allowedRoles = ['staff', 'receptionist', 'pharmacy', 'nurse', 'technician']
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: ' + allowedRoles.join(', ') },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Check if email exists for other users
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    )
    
    if ((existingUser as any[]).length > 0) {
      await connection.end()
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }
    
    // Update staff member
    await connection.execute(`
      UPDATE users 
      SET name = ?, email = ?, role = ?, contact_number = ?, 
          department = ?, joining_date = ?
      WHERE id = ? AND role NOT IN ("super-admin", "admin", "doctor")
    `, [
      name, email, role, contact_number, 
      department || null, joining_date || null, id
    ])
    
    await connection.end()
    
    return NextResponse.json({ message: 'Staff member updated successfully' })
    
  } catch (error) {
    console.error('Error updating staff member:', error)
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    if (!id) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Soft delete by setting is_active to 0 (only for staff roles)
    await connection.execute(
      'UPDATE users SET is_active = 0 WHERE id = ? AND role NOT IN ("super-admin", "admin", "doctor")',
      [id]
    )
    
    await connection.end()
    
    return NextResponse.json({ message: 'Staff member deactivated successfully' })
    
  } catch (error) {
    console.error('Error deleting staff member:', error)
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    if (!id) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Get staff member details
    const [staff] = await connection.execute(`
      SELECT 
        id,
        user_id,
        name,
        email,
        role,
        contact_number,
        department,
        is_active,
        is_verified,
        joining_date,
        last_login,
        created_at,
        updated_at
      FROM users 
      WHERE id = ? AND role NOT IN ("super-admin", "admin", "doctor")
    `, [id])
    
    await connection.end()
    
    if ((staff as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ staff: (staff as any[])[0] })
    
  } catch (error) {
    console.error('Error fetching staff member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff member' },
      { status: 500 }
    )
  }
}
