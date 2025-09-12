import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { getServerSession } from '@/lib/auth-simple'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

// GET - Fetch staff profile data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)
    
    // Fetch staff profile from users table
    const [users] = await connection.execute(
      `SELECT 
        id, user_id, name, email, contact_number, role, department, 
        specialization, shift_preference, is_active, created_at, last_login
      FROM users 
      WHERE id = ? AND role IN ('staff', 'nurse', 'receptionist', 'pharmacy')`,
      [session.user.userId]
    )

    await connection.end()

    const userArray = users as any[]
    if (userArray.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Staff profile not found' },
        { status: 404 }
      )
    }

    const staff = userArray[0]
    
    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        user_id: staff.user_id,
        name: staff.name,
        email: staff.email,
        mobile: staff.contact_number,
        role: staff.role,
        department: staff.department,
        specialization: staff.specialization,
        shift: staff.shift_preference,
        isActive: staff.is_active === 1,
        createdAt: staff.created_at,
        lastLogin: staff.last_login
      }
    })
  } catch (error) {
    console.error('Error fetching staff profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff profile' },
      { status: 500 }
    )
  }
}
