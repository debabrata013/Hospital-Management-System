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
    const specialization = searchParams.get('specialization') || ''
    
    const offset = (page - 1) * limit
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Build query conditions
    let whereConditions = ['role = "doctor"']
    let queryParams: any[] = []
    
    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ? OR user_id LIKE ? OR license_number LIKE ?)')
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status !== 'all') {
      whereConditions.push('is_active = ?')
      queryParams.push(status === 'active' ? 1 : 0)
    }
    
    if (specialization) {
      whereConditions.push('specialization = ?')
      queryParams.push(specialization)
    }
    
    const whereClause = whereConditions.join(' AND ')
    
    // Get total count
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
      queryParams
    )
    const total = (countResult as any)[0].total
    
    // Get doctors with pagination
    const [doctors] = await connection.execute(`
      SELECT 
        id,
        user_id,
        name,
        email,
        contact_number,
        specialization,
        qualification,
        experience_years,
        license_number,
        department,
        address,
        date_of_birth,
        gender,
        joining_date,
        salary,
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
      doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
    
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctors' },
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
      contact_number, 
      specialization,
      qualification,
      experience_years,
      license_number,
      department,
      address,
      date_of_birth,
      gender,
      joining_date,
      salary
    } = body
    
    // Validation
    if (!name || !email || !password || !contact_number || !specialization || !license_number) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, email, password, contact_number, specialization, license_number' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    try {
      // Check if email already exists
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      )
      
      if ((existingUser as any[]).length > 0) {
        await connection.end()
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        )
      }
      
      // Check if license number already exists
      const [existingLicense] = await connection.execute(
        'SELECT id FROM users WHERE license_number = ?',
        [license_number]
      )
      
      if ((existingLicense as any[]).length > 0) {
        await connection.end()
        return NextResponse.json(
          { success: false, error: 'License number already exists' },
          { status: 400 }
        )
      }
      
      // Generate user_id
      const [lastUser] = await connection.execute(
        'SELECT user_id FROM users WHERE role = "doctor" ORDER BY id DESC LIMIT 1'
      )
      
      let nextNumber = 1
      if ((lastUser as any[]).length > 0) {
        const lastUserId = (lastUser as any)[0].user_id
        const match = lastUserId.match(/DOC(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1]) + 1
        }
      }
      
      const userId = `DOC${nextNumber.toString().padStart(3, '0')}`
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)
      
      // Insert new doctor
      const [result] = await connection.execute(`
        INSERT INTO users (
          user_id, name, email, password_hash, role, contact_number, 
          specialization, qualification, experience_years, license_number,
          department, address, date_of_birth, gender, joining_date, salary,
          is_active, is_verified, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'doctor', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, NOW(), NOW())
      `, [
        userId, name, email, passwordHash, contact_number,
        specialization, qualification || null, experience_years || 0, license_number,
        department || null, address || null, date_of_birth || null, gender || null,
        joining_date || null, salary || null
      ])
      
      await connection.end()
      
      return NextResponse.json({
        success: true,
        message: 'Doctor created successfully',
        data: {
          userId,
          doctorId: (result as any).insertId,
          name,
          email,
          specialization
        }
      })
      
    } catch (dbError) {
      await connection.end()
      throw dbError
    }
    
  } catch (error) {
    console.error('Error creating doctor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create doctor' },
      { status: 500 }
    )
  }
}
