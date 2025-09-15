import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management'
}

// Simple token extraction and verification
function extractAndVerifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      const tokenCookie = request.cookies.get('auth-token')
      if (tokenCookie) {
        token = tokenCookie.value
      }
    }

    if (!token) {
      return { success: false, error: 'No token provided' }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (!decoded || !decoded.userId) {
      return { success: false, error: 'Invalid token' }
    }

    return { success: true, userId: decoded.userId }
  } catch (error) {
    return { success: false, error: 'Token verification failed' }
  }
}

export async function GET(req: NextRequest) {
  try {
    // Simple token verification
    const tokenResult = extractAndVerifyToken(req)
    if (!tokenResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get search query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const connection = await mysql.createConnection(dbConfig)

    try {
      // Build the main query
      let baseQuery = `
        SELECT 
          p.id,
          p.patient_id,
          p.name,
          p.date_of_birth,
          p.gender,
          p.contact_number,
          p.email,
          p.address,
          p.city,
          p.state,
          p.pincode,
          p.emergency_contact_name,
          p.emergency_contact_number,
          p.blood_group,
          p.is_active,
          p.registration_date
        FROM patients p
      `

      let countQuery = `SELECT COUNT(*) as total FROM patients p`
      let whereClause = ''
      const queryParams: any[] = []

      // Add search functionality
      if (search) {
        whereClause = ` WHERE (
          p.name LIKE ? OR 
          p.patient_id LIKE ? OR 
          p.contact_number LIKE ?
        )`
        const searchTerm = `%${search}%`
        queryParams.push(searchTerm, searchTerm, searchTerm)
      }

      // Add WHERE clause to both queries
      baseQuery += whereClause
      countQuery += whereClause

      // Add pagination to main query
      baseQuery += ` ORDER BY p.name ASC LIMIT ? OFFSET ?`
      const mainQueryParams = [...queryParams, limit, offset]

      // Execute both queries
      const [patientsResult] = await connection.execute(baseQuery, mainQueryParams) as any[]
      const [countResult] = await connection.execute(countQuery, queryParams) as any[]

      const total = countResult[0]?.total || 0
      const totalPages = Math.ceil(total / limit)

      const patients = patientsResult.map((patient: any) => ({
        id: patient.id,
        patient_id: patient.patient_id,
        name: patient.name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        contact_number: patient.contact_number,
        email: patient.email,
        address: patient.address,
        city: patient.city,
        state: patient.state,
        pincode: patient.pincode,
        emergency_contact_name: patient.emergency_contact_name,
        emergency_contact_number: patient.emergency_contact_number,
        blood_group: patient.blood_group,
        is_active: patient.is_active,
        registration_date: patient.registration_date
      }))

      const response = {
        patients,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }

      return NextResponse.json(response)

    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

