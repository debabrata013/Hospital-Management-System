import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'

export const dynamic = 'force-dynamic'

// GET - Fetch all nurse schedules
export async function GET(request: NextRequest) {
  try {
    const schedules = await executeQuery(`
      SELECT 
        ns.id,
        ns.nurse_id,
        u.name as nurse_name,
        ns.shift_date,
        ns.start_time,
        ns.end_time,
        ns.department as ward_assignment,
        ns.shift_type,
        ns.status,
        8 as max_patients,
        0 as current_patients,
        ns.created_at,
        ns.updated_at
      FROM nurse_schedules ns
      LEFT JOIN users u ON ns.nurse_id = u.id
      WHERE u.role = 'nurse'
      ORDER BY ns.shift_date DESC, ns.start_time ASC
    `, []) as any[]

    return NextResponse.json({
      success: true,
      count: schedules.length,
      schedules: schedules
    })

  } catch (error) {
    console.error('Error fetching nurse schedules:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch nurse schedules',
        schedules: [] 
      },
      { status: 500 }
    )
  }
}

// POST - Create new nurse schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nurseId, date, startTime, endTime, wardAssignment, shiftType, maxPatients } = body

    // Validation
    if (!nurseId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: nurseId, date, startTime, endTime' },
        { status: 400 }
      )
    }

    // Validate nurse exists and is active
    const nurseCheck = await executeQuery(
      'SELECT id, name FROM users WHERE id = ? AND role = "nurse"',
      [nurseId]
    ) as any[]

    if (!nurseCheck || nurseCheck.length === 0) {
      return NextResponse.json(
        { error: 'Nurse not found' },
        { status: 404 }
      )
    }

    // Check for existing schedule conflict
    const conflictCheck = await executeQuery(
      `SELECT id FROM nurse_schedules 
       WHERE nurse_id = ? AND shift_date = ? 
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
       AND status != 'Cancelled'`,
      [nurseId, date, startTime, startTime, endTime, endTime]
    ) as any[]

    if (conflictCheck && conflictCheck.length > 0) {
      return NextResponse.json(
        { error: 'Nurse already has a conflicting schedule at this time' },
        { status: 409 }
      )
    }

    // Create the schedule
    const insertResult = await executeQuery(
      `INSERT INTO nurse_schedules (
        nurse_id, 
        shift_date, 
        start_time, 
        end_time, 
        department, 
        shift_type, 
        status, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', NOW())`,
      [
        nurseId,
        date,
        startTime,
        endTime,
        wardAssignment,
        shiftType
      ]
    ) as any

    if (!insertResult.insertId) {
      throw new Error('Failed to create nurse schedule')
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Nurse schedule created successfully',
      scheduleId: insertResult.insertId,
      nurse: nurseCheck[0].name,
      date,
      time: `${startTime} - ${endTime}`,
      ward: wardAssignment,
      shiftType,
      maxPatients: maxPatients || 8
    })

  } catch (error) {
    console.error('Error creating nurse schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create nurse schedule. Please try again.' },
      { status: 500 }
    )
  }
}