import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { getServerSession } from '@/lib/auth-simple'
import { isStaticBuild } from '@/lib/api-utils'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

// This enables dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET - Fetch staff profile data
export async function GET(request: NextRequest) {
  try {
    // For static generation compatibility, provide mock data during build
    if (isStaticBuild()) {
      return NextResponse.json({
        success: true,
        staff: {
          id: 1,
          user_id: 'STAFF-001',
          name: 'Staff Member',
          email: 'staff@hospital.com',
          mobile: '9876543210',
          role: 'nurse',
          department: 'Nursing',
          specialization: 'General Care',
          shift: 'morning',
          assignment: 'ward', // Add assignment for mock data
          isActive: true,
          createdAt: '2023-01-01',
          lastLogin: '2023-09-14'
        }
      });
    }

    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)
    
    // Fetch staff profile from users table with assignment information
    const [users] = await connection.execute(
      `SELECT 
        u.id, u.user_id, u.name, u.email, u.contact_number, u.role, u.department, 
        u.specialization, u.shift_preference, u.is_active, u.created_at, u.last_login,
        na.department as assignment_department
      FROM users u
      LEFT JOIN nurse_assignments na ON u.id = na.nurse_id AND na.is_active = 1
      WHERE u.id = ? AND u.role IN ('staff', 'nurse', 'receptionist', 'pharmacy')`,
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
        assignment: staff.assignment_department, // Add assignment from nurse_assignments table
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
