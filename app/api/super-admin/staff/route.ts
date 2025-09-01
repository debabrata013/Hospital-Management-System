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
    const status = searchParams.get('status') || 'all'
    const role = searchParams.get('role') || ''
    
    const offset = (page - 1) * limit
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Build query conditions
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
        last_login,
        joining_date,
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
