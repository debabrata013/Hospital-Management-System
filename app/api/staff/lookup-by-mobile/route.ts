import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

// GET /api/staff/lookup-by-mobile?mobile=9876543210
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mobile = (searchParams.get('mobile') || '').trim()
    if (!/^[0-9]{8,15}$/.test(mobile)) {
      return NextResponse.json({ success: false, error: 'Invalid mobile format' }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)
    const [rows] = await connection.execute(
      `SELECT id, user_id, name, email, contact_number as mobile, role, department
       FROM users
       WHERE contact_number = ?
       LIMIT 1`,
      [mobile]
    )
    await connection.end()

    const list = rows as any[]
    if (!list || list.length === 0) {
      return NextResponse.json({ success: false, error: 'No user found for mobile' }, { status: 404 })
    }

    const u = list[0]
    return NextResponse.json({
      success: true,
      data: {
        id: String(u.id),
        userId: String(u.user_id || u.id),
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        role: u.role,
        department: u.department,
      }
    })

  } catch (error: any) {
    console.error('lookup-by-mobile error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}


