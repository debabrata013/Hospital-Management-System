import { isStaticBuild } from '@/lib/api-utils';

// Force dynamic for development server
// Generate static parameters for build
export async function generateStaticParams() {
  // During static build, we provide a list of IDs to pre-render
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'
import { authenticateDoctor } from '@/lib/auth-middleware'

// GET - Fetch a specific leave request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateDoctor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    const query = `
      SELECT 
        lr.*,
        approver.name as approved_by_name,
        replacement.name as replacement_doctor_name
      FROM leave_requests lr
      LEFT JOIN users approver ON lr.approved_by = approver.user_id
      LEFT JOIN users replacement ON lr.replacement_doctor = replacement.user_id
      WHERE lr.id = ? AND lr.doctor_id = ?
    `

    const result = await executeQuery(query, [params.id, user.id])
    
    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error fetching leave request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a leave request (only if pending)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateDoctor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    // Check if leave request exists and belongs to the doctor
    const existingQuery = 'SELECT * FROM leave_requests WHERE id = ? AND doctor_id = ?'
    const existingResult = await executeQuery(existingQuery, [params.id, user.id])
    
    if (!Array.isArray(existingResult) || existingResult.length === 0) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    const existingRequest = existingResult[0] as any
    if (existingRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Cannot update leave request. Only pending requests can be modified.' 
      }, { status: 400 })
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

    // Get replacement doctor name if provided
    let replacementDoctorName = null
    if (replacement_doctor) {
      const replacementQuery = 'SELECT name FROM users WHERE user_id = ? AND role = "doctor"'
      const replacementResult = await executeQuery(replacementQuery, [replacement_doctor])
      if (Array.isArray(replacementResult) && replacementResult.length > 0) {
        replacementDoctorName = (replacementResult[0] as any).name
      }
    }

    // Update leave request
    const updateQuery = `
      UPDATE leave_requests SET
        leave_type = ?, start_date = ?, end_date = ?,
        start_time = ?, end_time = ?, is_full_day = ?,
        reason = ?, emergency_contact = ?,
        replacement_doctor = ?, replacement_doctor_name = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND doctor_id = ?
    `

    await executeQuery(updateQuery, [
      leave_type,
      start_date,
      end_date,
      start_time || null,
      end_time || null,
      is_full_day,
      reason,
      emergency_contact || null,
      replacement_doctor || null,
      replacementDoctorName,
      params.id,
      user.id
    ])

    // Get updated leave request
    const updatedResult = await executeQuery(existingQuery, [params.id, user.id])

    return NextResponse.json({
      message: 'Leave request updated successfully',
      leaveRequest: Array.isArray(updatedResult) ? updatedResult[0] : updatedResult
    })

  } catch (error) {
    console.error('Error updating leave request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Cancel a leave request (only if pending)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateDoctor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    // Check if leave request exists and belongs to the doctor
    const existingQuery = 'SELECT * FROM leave_requests WHERE id = ? AND doctor_id = ?'
    const existingResult = await executeQuery(existingQuery, [params.id, user.id])
    
    if (!Array.isArray(existingResult) || existingResult.length === 0) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    const existingRequest = existingResult[0] as any
    if (existingRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Cannot cancel leave request. Only pending requests can be cancelled.' 
      }, { status: 400 })
    }

    // Update status to cancelled instead of deleting
    const updateQuery = `
      UPDATE leave_requests SET
        status = 'cancelled',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND doctor_id = ?
    `

    await executeQuery(updateQuery, [params.id, user.id])

    return NextResponse.json({
      message: 'Leave request cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling leave request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
