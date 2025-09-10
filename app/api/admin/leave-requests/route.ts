import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'
import { authenticateAdmin } from '@/lib/auth-middleware'

// GET - Fetch all leave requests for admin review
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
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
    const leaveRequests = await executeQuery(query, params)

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM leave_requests lr 
      WHERE ${whereClause.replace(/LIMIT.*/, '')}
    `
    const countParams = params.slice(0, -2) // Remove limit and offset
    const countResult = await executeQuery(countQuery, countParams)
    const total = Array.isArray(countResult) ? (countResult[0] as any).total : 0

    return NextResponse.json({
      leaveRequests: Array.isArray(leaveRequests) ? leaveRequests : [],
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Error fetching leave requests for admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
