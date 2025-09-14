import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'
import { isStaticBuild, getMockData } from '@/lib/api-utils'

// Force dynamic for development server
export const dynamic = 'force-dynamic';

// Generate static parameters for build
export async function generateStaticParams() {
  // During static build, we provide a list of IDs to pre-render
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

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

// PUT - Approve or reject a leave request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // During static build, return mock data
  if (isStaticBuild()) {
    return NextResponse.json({
      message: "Leave request processed successfully",
      leaveRequest: {
        id: params.id,
        staff_id: "STAFF-001",
        leave_type: "Medical",
        status: "approved",
        approved_by: "ADMIN-001",
        approved_by_name: "Admin User"
      }
    });
  }
  
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

      const body = await request.json()
      const { action, rejectionReason } = body

      if (!action || !['approve', 'reject'].includes(action)) {
        return NextResponse.json({ 
          error: 'Invalid action. Must be "approve" or "reject"' 
        }, { status: 400 })
      }

      if (action === 'reject' && !rejectionReason) {
        return NextResponse.json({ 
          error: 'Rejection reason is required when rejecting a leave request' 
        }, { status: 400 })
      }

      // Check if leave request exists and is pending
      const [existingResult] = await connection.execute(
        'SELECT * FROM leave_requests WHERE id = ?',
        [params.id]
      ) as any[]
      
      if (existingResult.length === 0) {
        return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
      }

      const existingRequest = existingResult[0]
      if (existingRequest.status !== 'pending') {
        return NextResponse.json({ 
          error: `Cannot ${action} leave request. Only pending requests can be processed.` 
        }, { status: 400 })
      }

      // Update leave request status
      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      const updateQuery = `
        UPDATE leave_requests SET
          status = ?,
          approved_by = ?,
          approved_at = CURRENT_TIMESTAMP,
          rejection_reason = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `

      await connection.execute(updateQuery, [
        newStatus,
        user.user_id,
        action === 'reject' ? rejectionReason : null,
        params.id
      ])

      // Get updated leave request with admin details
      const updatedQuery = `
        SELECT 
          lr.*,
          approver.name as approved_by_name
        FROM leave_requests lr
        LEFT JOIN users approver ON lr.approved_by = approver.user_id
        WHERE lr.id = ?
      `
      const [updatedResult] = await connection.execute(updatedQuery, [params.id]) as any[]

      return NextResponse.json({
        message: `Leave request ${action}d successfully`,
        leaveRequest: updatedResult.length > 0 ? updatedResult[0] : null
      })

    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error updating leave request status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get specific leave request details for admin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // During static build, return mock data
  if (isStaticBuild()) {
    return NextResponse.json({
      id: params.id,
      staff_id: "STAFF-001",
      name: "Sample Staff Member",
      leave_type: "Medical",
      from_date: "2025-09-20",
      to_date: "2025-09-22",
      reason: "Medical procedure",
      status: "pending",
      approved_by_name: null,
      replacement_doctor_name: "Dr. Backup"
    });
  }
  
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

      const query = `
        SELECT 
          lr.*,
          approver.name as approved_by_name,
          replacement.name as replacement_doctor_name
        FROM leave_requests lr
        LEFT JOIN users approver ON lr.approved_by = approver.user_id
        LEFT JOIN users replacement ON lr.replacement_doctor = replacement.user_id
        WHERE lr.id = ?
      `

      const [result] = await connection.execute(query, [params.id]) as any[]
      
      if (result.length === 0) {
        return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
      }

      return NextResponse.json(result[0])

    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error fetching leave request details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
