import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { doctorId, date, startTime, endTime, roomNumber, maxPatients } = body

    // Validation
    if (!doctorId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorId, date, startTime, endTime' },
        { status: 400 }
      )
    }

    // Validate doctor exists
    const doctorCheck = await executeQuery(
      'SELECT id, name FROM users WHERE id = ? AND role = "doctor" AND is_active = 1',
      [doctorId]
    ) as any[]

    if (!doctorCheck || doctorCheck.length === 0) {
      return NextResponse.json(
        { error: 'Doctor not found or inactive' },
        { status: 404 }
      )
    }

    // Check for existing schedule conflict
    const conflictCheck = await executeQuery(
      `SELECT id FROM staff_shifts 
       WHERE user_id = ? AND shift_date = ? 
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
      [doctorId, date, startTime, startTime, endTime, endTime]
    ) as any[]

    if (conflictCheck && conflictCheck.length > 0) {
      return NextResponse.json(
        { error: 'Doctor already has a conflicting schedule at this time' },
        { status: 409 }
      )
    }

    // Create the schedule in staff_shifts table
    const insertResult = await executeQuery(
      `INSERT INTO staff_shifts (user_id, shift_date, start_time, end_time, status) 
       VALUES (?, ?, ?, ?, 'active')`,
      [
        doctorId,
        date,
        startTime,
        endTime
      ]
    ) as any

    if (!insertResult.insertId) {
      throw new Error('Failed to create schedule')
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Schedule created successfully',
      scheduleId: insertResult.insertId,
      doctor: doctorCheck[0].name,
      date,
      time: `${startTime} - ${endTime}`,
      room: roomNumber || 'OPD',
      maxPatients: maxPatients || 12
    })

  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule. Please try again.' },
      { status: 500 }
    )
  }
}

// GET method to fetch existing schedules (optional - for future use)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const date = searchParams.get('date')

    let query = `
      SELECT 
        ss.id,
        ss.user_id as doctor_id,
        u.name as doctor_name,
        u.specialization,
        u.department,
        ss.shift_date as date,
        ss.start_time,
        ss.end_time,
        ss.status,
        ss.created_at,
        ss.updated_at
      FROM staff_shifts ss
      JOIN users u ON ss.user_id = u.id
      WHERE u.role = 'doctor'
    `
    const params: any[] = []

    if (doctorId) {
      query += ' AND ss.user_id = ?'
      params.push(doctorId)
    }

    if (date) {
      query += ' AND ss.shift_date = ?'
      params.push(date)
    }

    query += ' ORDER BY ss.shift_date DESC, ss.start_time ASC'

    const schedules = await executeQuery(query, params) as any[]

    return NextResponse.json({
      schedules: schedules || []
    })

  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}