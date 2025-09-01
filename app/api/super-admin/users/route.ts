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
    const role = searchParams.get('role') || ''
    
    const offset = (page - 1) * limit
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Build query conditions
    let whereConditions = ['1=1']
    let queryParams: any[] = []
    
    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ? OR user_id LIKE ?)')
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (role) {
      whereConditions.push('role = ?')
      queryParams.push(role)
    }
    
    const whereClause = whereConditions.join(' AND ')
    
    // Get total count
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
      queryParams
    )
    const total = (countResult as any)[0].total
    
    // Get users with pagination
    const [users] = await connection.execute(`
      SELECT 
        id,
        user_id,
        name,
        email,
        role,
        contact_number,
        department,
        specialization,
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
      success: true,
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages
      }
    })
    
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      firstName,
      lastName,
      email, 
      contactNumber,
      role, 
      department,
      specialization
    } = body
    
    const name = `${firstName} ${lastName}`.trim()
    
    if (!name || !email || !contactNumber || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    
    // Generate user_id based on role
    let prefix = 'USR'
    switch (role) {
      case 'admin':
      case 'super-admin':
        prefix = 'ADM'
        break
      case 'doctor':
        prefix = 'DOC'
        break
      case 'staff':
      case 'receptionist':
      case 'pharmacy':
        prefix = 'STF'
        break
    }
    
    const [lastUser] = await connection.execute(
      'SELECT user_id FROM users WHERE user_id LIKE ? ORDER BY id DESC LIMIT 1',
      [`${prefix}%`]
    )
    
    let nextNumber = 1
    if ((lastUser as any[]).length > 0) {
      const lastUserId = (lastUser as any)[0].user_id
      const match = lastUserId.match(new RegExp(`${prefix}(\\d+)`))
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }
    
    const userId = `${prefix}${nextNumber.toString().padStart(3, '0')}`
    
    // Generate default password (user can change later)
    const defaultPassword = 'password123'
    const passwordHash = await bcrypt.hash(defaultPassword, 10)
    
    // Insert new user
    const [result] = await connection.execute(`
      INSERT INTO users (
        user_id, name, email, password_hash, role, contact_number, 
        department, specialization, is_active, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    `, [
      userId, name, email, passwordHash, role, contactNumber,
      department || null, specialization || null
    ])
    
    await connection.end()
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        userId,
        defaultPassword,
        id: (result as any).insertId
      }
    })
    
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
