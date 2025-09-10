import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'
import { authenticateAdmin } from '@/lib/auth-middleware'

// PUT - Approve or reject a leave request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult
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
    const existingQuery = 'SELECT * FROM leave_requests WHERE id = ?'
    const existingResult = await executeQuery(existingQuery, [params.id])
    
    if (!Array.isArray(existingResult) || existingResult.length === 0) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    const existingRequest = existingResult[0] as any
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

    await executeQuery(updateQuery, [
      newStatus,
      user.id,
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
    const updatedResult = await executeQuery(updatedQuery, [params.id])

    return NextResponse.json({
      message: `Leave request ${action}d successfully`,
      leaveRequest: Array.isArray(updatedResult) ? updatedResult[0] : updatedResult
    })

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
  try {
    const authResult = await authenticateAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
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

    const result = await executeQuery(query, [params.id])
    
    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])

  } catch (error) {
    console.error('Error fetching leave request details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
