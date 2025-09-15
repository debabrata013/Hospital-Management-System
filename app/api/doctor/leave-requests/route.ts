import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { executeQuery } from '@/lib/db/connection'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'

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

// GET - Fetch leave requests for the logged-in doctor
export async function GET(request: NextRequest) {
  try {
    const tokenResult = extractAndVerifyToken(request)
    if (!tokenResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connection = await mysql.createConnection(dbConfig)

    try {
      // Get user info first - need user_id for foreign key constraint
      const [userRows] = await connection.execute(
        'SELECT id, user_id, name, role FROM users WHERE id = ?',
        [tokenResult.userId]
      ) as any[]

      if (userRows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 })
      }

      const user = userRows[0]
      if (user.role !== 'doctor') {
        return NextResponse.json({ error: 'Doctor access required' }, { status: 403 })
      }

      const query = `
        SELECT 
          lr.*,
          approver.name as approved_by_name,
          replacement.name as replacement_doctor_name
        FROM leave_requests lr
        LEFT JOIN users approver ON lr.approved_by = approver.user_id
        LEFT JOIN users replacement ON lr.replacement_doctor = replacement.user_id
        WHERE lr.doctor_id = ?
        ORDER BY lr.created_at DESC
      `

      const [leaveRequests] = await connection.execute(query, [user.user_id]) as any[]

      return NextResponse.json(leaveRequests || [])
    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new leave request
export async function POST(request: NextRequest) {
  try {
    const tokenResult = extractAndVerifyToken(request)
    if (!tokenResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connection = await mysql.createConnection(dbConfig)

    try {
      // Get user info first - need user_id for foreign key constraint
      const [userRows] = await connection.execute(
        'SELECT id, user_id, name, role FROM users WHERE id = ?',
        [tokenResult.userId]
      ) as any[]

      if (userRows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 })
      }

      const user = userRows[0]
      if (user.role !== 'doctor') {
        return NextResponse.json({ error: 'Doctor access required' }, { status: 403 })
      }

      const body = await request.json()
      const {
        leave_type,
        start_date,
        end_date,
        start_time,
        end_time,
        is_full_day,
        reason,
        emergency_contact,
        replacement_doctor
      } = body

      // Validate required fields
      if (!leave_type || !start_date || !end_date || !reason) {
        return NextResponse.json({ 
          error: 'Missing required fields: leave_type, start_date, end_date, reason' 
        }, { status: 400 })
      }

      // Validate date range
      if (new Date(start_date) > new Date(end_date)) {
        return NextResponse.json({ 
          error: 'End date must be after or equal to start date' 
        }, { status: 400 })
      }

      // Check for overlapping leave requests
      const overlapQuery = `
        SELECT id FROM leave_requests 
        WHERE doctor_id = ? 
        AND status IN ('pending', 'approved')
        AND (
          (start_date <= ? AND end_date >= ?) OR
          (start_date <= ? AND end_date >= ?) OR
          (start_date >= ? AND end_date <= ?)
        )
      `
      
      const [overlappingRequests] = await connection.execute(overlapQuery, [
        user.user_id,
        start_date, start_date,
        end_date, end_date,
        start_date, end_date
      ]) as any[]

      if (Array.isArray(overlappingRequests) && overlappingRequests.length > 0) {
        return NextResponse.json({ 
          error: 'You already have a leave request for overlapping dates' 
        }, { status: 400 })
      }

      // Get replacement doctor name if provided
      let replacementDoctorName = null
      if (replacement_doctor) {
        const [replacementResult] = await connection.execute(
          'SELECT name FROM users WHERE user_id = ? AND role = "doctor"',
          [replacement_doctor]
        ) as any[]
        if (Array.isArray(replacementResult) && replacementResult.length > 0) {
          replacementDoctorName = replacementResult[0].name
        }
      }

      // Insert new leave request
      const insertQuery = `
        INSERT INTO leave_requests (
          doctor_id, doctor_name, leave_type, start_date, end_date,
          start_time, end_time, is_full_day, reason, emergency_contact,
          replacement_doctor, replacement_doctor_name, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `

      const [result] = await connection.execute(insertQuery, [
        user.user_id,
        user.name,
        leave_type,
        start_date,
        end_date,
        start_time || null,
        end_time || null,
        is_full_day,
        reason,
        emergency_contact || null,
        replacement_doctor || null,
        replacementDoctorName
      ]) as any[]

      // Get the created leave request
      const [createdRequest] = await connection.execute(
        'SELECT * FROM leave_requests WHERE id = ?',
        [(result as any).insertId]
      ) as any[]

      return NextResponse.json({
        message: 'Leave request created successfully',
        leaveRequest: Array.isArray(createdRequest) ? createdRequest[0] : createdRequest
      }, { status: 201 })

    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error creating leave request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
