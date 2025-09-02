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
    const role = searchParams.get('role') || ''
    
    const offset = (page - 1) * limit
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Build query conditions - exclude admin, super-admin, and doctor roles
    let whereConditions = ['role NOT IN ("super-admin", "admin", "doctor")']
    let queryParams: any[] = []
    
    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ? OR user_id LIKE ?)')
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status !== 'all') {
      whereConditions.push('is_active = ?')
      queryParams.push(status === 'active' ? 1 : 0)
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
    
    // Get staff with pagination
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
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset])
    
    await connection.end()
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      staff,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
    
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
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
      joining_date
    } = body
    
    if (!name || !email || !password || !role || !contact_number) {
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
    let prefix = 'STF'
    switch (role) {
      case 'receptionist':
        prefix = 'REC'
        break
      case 'pharmacy':
        prefix = 'PHR'
        break
      case 'nurse':
        prefix = 'NUR'
        break
      case 'technician':
        prefix = 'TEC'
        break
      default:
        prefix = 'STF'
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
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Insert new staff member
    const [result] = await connection.execute(`
      INSERT INTO users (
        user_id, name, email, password_hash, role, contact_number, 
        department, joining_date, is_active, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    `, [
      userId, name, email, passwordHash, role, contact_number,
      department || null, joining_date || null
    ])
    
    await connection.end()
    
    return NextResponse.json({
      message: 'Staff member created successfully',
      userId,
      staffId: (result as any).insertId
    })
    
  } catch (error) {
    console.error('Error creating staff member:', error)
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    )
  }
}
