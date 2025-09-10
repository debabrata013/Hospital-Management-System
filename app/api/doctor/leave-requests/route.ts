import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'
import { authenticateDoctor } from '@/lib/auth-middleware'

// GET - Fetch leave requests for the logged-in doctor
export async function GET(request: NextRequest) {
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
      WHERE lr.doctor_id = ?
      ORDER BY lr.created_at DESC
    `

    const leaveRequests = await executeQuery(query, [user.id])

    return NextResponse.json(leaveRequests)
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new leave request
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateDoctor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

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
    
    const overlappingRequests = await executeQuery(overlapQuery, [
      user.id,
      start_date, start_date,
      end_date, end_date,
      start_date, end_date
    ])

    if (Array.isArray(overlappingRequests) && overlappingRequests.length > 0) {
      return NextResponse.json({ 
        error: 'You already have a leave request for overlapping dates' 
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

    // Insert new leave request
    const insertQuery = `
      INSERT INTO leave_requests (
        doctor_id, doctor_name, leave_type, start_date, end_date,
        start_time, end_time, is_full_day, reason, emergency_contact,
        replacement_doctor, replacement_doctor_name, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `

    const result = await executeQuery(insertQuery, [
      user.id,
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
    ])

    // Get the created leave request
    const createdRequest = await executeQuery(
      'SELECT * FROM leave_requests WHERE id = ?',
      [(result as any).insertId]
    )

    return NextResponse.json({
      message: 'Leave request created successfully',
      leaveRequest: Array.isArray(createdRequest) ? createdRequest[0] : createdRequest
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating leave request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
