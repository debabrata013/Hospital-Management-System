import { NextRequest, NextResponse } from 'next/server'
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

// GET - Fetch all leave requests for admin review
export async function GET(request: NextRequest) {
  try {
    const tokenResult = extractAndVerifyToken(request)
    if (!tokenResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connection = await mysql.createConnection(dbConfig)

    try {
      // Get user info and verify admin role
      const [userRows] = await connection.execute(
        'SELECT id, user_id, name, role FROM users WHERE id = ?',
        [tokenResult.userId]
      ) as any[]

      if (userRows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 })
      }

      const user = userRows[0]
      if (!['admin', 'super-admin'].includes(user.role)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }

      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status') || 'all'
      const doctorId = searchParams.get('doctorId')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')

      let whereClause = '1=1'
      const params: any[] = []

      if (status !== 'all') {
        whereClause += ' AND lr.status = ?'
        params.push(status)
      }

      if (doctorId) {
        whereClause += ' AND lr.doctor_id = ?'
        params.push(doctorId)
      }

      const query = `
        SELECT 
          lr.*,
          approver.name as approved_by_name,
          replacement.name as replacement_doctor_name
        FROM leave_requests lr
        LEFT JOIN users approver ON lr.approved_by = approver.user_id
        LEFT JOIN users replacement ON lr.replacement_doctor = replacement.user_id
        WHERE ${whereClause}
        ORDER BY 
          CASE lr.status 
            WHEN 'pending' THEN 1 
            WHEN 'approved' THEN 2 
            WHEN 'rejected' THEN 3 
            WHEN 'cancelled' THEN 4 
          END,
          lr.created_at DESC
        LIMIT ? OFFSET ?
      `

      params.push(limit, offset)
      const [leaveRequests] = await connection.execute(query, params) as any[]

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM leave_requests lr 
        WHERE ${whereClause}
      `
      const countParams = params.slice(0, -2) // Remove limit and offset
      const [countResult] = await connection.execute(countQuery, countParams) as any[]
      const total = Array.isArray(countResult) && countResult.length > 0 ? countResult[0].total : 0

      return NextResponse.json({
        leaveRequests: Array.isArray(leaveRequests) ? leaveRequests : [],
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      })

    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error fetching leave requests for admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
