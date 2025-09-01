import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

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
    const status = searchParams.get('status') || 'all'
    
    const offset = (page - 1) * limit
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Build query conditions
    let whereConditions = ['role IN ("admin", "super-admin")']
    let queryParams: any[] = []
    
    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ? OR user_id LIKE ?)')
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status !== 'all') {
      whereConditions.push('is_active = ?')
      queryParams.push(status === 'active' ? 1 : 0)
    }
    
    const whereClause = whereConditions.join(' AND ')
    
    // Get total count
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
      queryParams
    )
    const total = (countResult as any)[0].total
    
    // Get admins with pagination
    const [admins] = await connection.execute(`
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
        last_login,
        created_at,
        updated_at
      FROM users 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset])
    
    await connection.end()
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      admins,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
    
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      email, 
      password, 
      role, 
      contact_number, 
      department,
      address,
      date_of_birth,
      gender
    } = body
    
    if (!name || !email || !password || !role || !contact_number) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    if (!['admin', 'super-admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or super-admin' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Check if email already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )
    
    if ((existingUser as any[]).length > 0) {
      await connection.end()
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }
    
    // Generate user_id
    const [lastUser] = await connection.execute(
      'SELECT user_id FROM users WHERE role IN ("admin", "super-admin") ORDER BY id DESC LIMIT 1'
    )
    
    let nextNumber = 1
    if ((lastUser as any[]).length > 0) {
      const lastUserId = (lastUser as any)[0].user_id
      const match = lastUserId.match(/ADM(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }
    
    const userId = `ADM${nextNumber.toString().padStart(3, '0')}`
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Insert new admin
    const [result] = await connection.execute(`
      INSERT INTO users (
        user_id, name, email, password_hash, role, contact_number, 
        department, address, date_of_birth, gender, is_active, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    `, [
      userId, name, email, passwordHash, role, contact_number,
      department || null, address || null, date_of_birth || null, gender || null
    ])
    
    await connection.end()
    
    return NextResponse.json({
      message: 'Admin created successfully',
      userId,
      adminId: (result as any).insertId
    })
    
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id, 
      name, 
      email, 
      role, 
      contact_number, 
      department,
      address,
      date_of_birth,
      gender,
      is_active
    } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
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
    
    // Update admin
    await connection.execute(`
      UPDATE users 
      SET name = ?, email = ?, role = ?, contact_number = ?, department = ?,
          address = ?, date_of_birth = ?, gender = ?, is_active = ?
      WHERE id = ? AND role IN ("admin", "super-admin")
    `, [
      name, email, role, contact_number, department,
      address, date_of_birth, gender, is_active, id
    ])
    
    await connection.end()
    
    return NextResponse.json({ message: 'Admin updated successfully' })
    
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json(
      { error: 'Failed to update admin' },
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
        { error: 'Admin ID is required' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Soft delete by setting is_active to 0
    await connection.execute(
      'UPDATE users SET is_active = 0 WHERE id = ? AND role IN ("admin", "super-admin")',
      [id]
    )
    
    await connection.end()
    
    return NextResponse.json({ message: 'Admin deactivated successfully' })
    
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json(
      { error: 'Failed to delete admin' },
      { status: 500 }
    )
  }
}
