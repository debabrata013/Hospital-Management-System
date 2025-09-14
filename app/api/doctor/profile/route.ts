import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import mysql from 'mysql2/promise'
import { isStaticBuild, getCookies } from '@/lib/api-utils'

// Force dynamic for development
export const dynamic = 'force-dynamic'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET(request: NextRequest) {
  // Handle static builds
  if (isStaticBuild()) {
    return NextResponse.json({
      message: 'Doctor profile retrieved successfully',
      profile: {
        id: 1,
        user_id: 'DOCTOR-001',
        name: 'Dr. Sample Doctor',
        email: 'sample.doctor@hospital.com',
        contact_number: '9876543210',
        role: 'doctor',
        department: 'General Medicine',
        specialization: 'Internal Medicine',
        qualification: 'MBBS, MD',
        joining_date: '2023-01-01',
        is_active: true,
        is_verified: true,
        address: '123 Medical Center',
        employee_type: 'full-time',
        salary: null,
        emergency_contact: '9876543211',
        emergency_contact_name: 'Emergency Contact',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  }

  let connection;
  try {
    // Use safe method to get cookies
    const cookies = getCookies(request);
    const token = cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId

    console.log('Fetching profile for userId:', userId);

    connection = await mysql.createConnection(dbConfig)

    // Get doctor's basic information from users table
    const [userRows] = await connection.execute(
      `SELECT 
        id, user_id, name, email, contact_number, role, department, 
        specialization, qualification, joining_date, is_active, is_verified,
        created_at, updated_at
      FROM users 
      WHERE id = ?`,
      [userId]
    )

    console.log('User query result:', userRows);

    if (!Array.isArray(userRows) || userRows.length === 0) {
      await connection.end()
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    const doctor = userRows[0] as any

    // Use only users table data since staff_profiles has different schema
    const doctorProfile = {
      id: doctor.id,
      user_id: doctor.user_id,
      name: doctor.name,
      email: doctor.email,
      contact_number: doctor.contact_number,
      role: doctor.role,
      department: doctor.department,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      joining_date: doctor.joining_date,
      is_active: doctor.is_active,
      is_verified: doctor.is_verified,
      address: '', // Not available in users table
      employee_type: 'full-time', // Default value
      salary: null, // Not available in users table
      emergency_contact: '', // Not available in users table
      emergency_contact_name: '', // Not available in users table
      created_at: doctor.created_at,
      updated_at: doctor.updated_at
    }

    console.log('Final doctor profile:', doctorProfile);

    return NextResponse.json({
      message: 'Doctor profile retrieved successfully',
      profile: doctorProfile
    })

  } catch (error) {
    console.error('Error fetching doctor profile:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

export async function PUT(request: NextRequest) {
  // Handle static builds
  if (isStaticBuild()) {
    return NextResponse.json({
      message: 'Profile updated successfully'
    });
  }

  try {
    // Use safe method to get cookies
    const cookies = getCookies(request);
    const token = cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId

    const body = await request.json()
    const { 
      name, 
      contact_number, 
      department, 
      specialization, 
      qualification,
      address,
      emergency_contact,
      emergency_contact_name
    } = body

    const connection = await mysql.createConnection(dbConfig)

    // Update users table only (staff_profiles has schema issues)
    await connection.execute(
      `UPDATE users 
       SET name = ?, contact_number = ?, department = ?, specialization = ?, 
           qualification = ?, updated_at = NOW()
       WHERE id = ? AND role = 'doctor'`,
      [name, contact_number, department, specialization, qualification, userId]
    )

    console.log('Profile updated successfully for userId:', userId)

    await connection.end()

    return NextResponse.json({
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating doctor profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
