import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'
import { authenticateUser } from '@/lib/auth-middleware'

// GET - Check doctor availability for scheduling
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 })
    }

    // If no date range provided, check for next 30 days
    const start = startDate || new Date().toISOString().split('T')[0]
    const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Check for approved leave requests that overlap with the requested period
    const leaveQuery = `
      SELECT 
        id, leave_type, start_date, end_date, start_time, end_time, 
        is_full_day, reason, status
      FROM leave_requests 
      WHERE doctor_id = ? 
      AND status = 'approved'
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
      ORDER BY start_date ASC
    `

    const leaveRequests = await executeQuery(leaveQuery, [
      doctorId,
      end, start,
      start, end,
      start, end
    ])

    // Get doctor information
    const doctorQuery = 'SELECT user_id, name, specialization, available_schedule FROM users WHERE user_id = ? AND role = "doctor"'
    const doctorResult = await executeQuery(doctorQuery, [doctorId])

    if (!Array.isArray(doctorResult) || doctorResult.length === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    const doctor = doctorResult[0] as any

    // Process leave requests to create unavailable periods
    const unavailablePeriods = Array.isArray(leaveRequests) ? leaveRequests.map((leave: any) => ({
      id: leave.id,
      type: leave.leave_type,
      startDate: leave.start_date,
      endDate: leave.end_date,
      startTime: leave.start_time,
      endTime: leave.end_time,
      isFullDay: leave.is_full_day,
      reason: leave.reason,
      status: leave.status
    })) : []

    return NextResponse.json({
      doctor: {
        id: doctor.user_id,
        name: doctor.name,
        specialization: doctor.specialization,
        availableSchedule: doctor.available_schedule
      },
      unavailablePeriods,
      dateRange: {
        start,
        end
      },
      isAvailable: unavailablePeriods.length === 0
    })

  } catch (error) {
    console.error('Error checking doctor availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Check availability for specific date/time
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { doctorId, appointmentDate, appointmentTime, duration = 30 } = body

    if (!doctorId || !appointmentDate) {
      return NextResponse.json({ 
        error: 'Doctor ID and appointment date are required' 
      }, { status: 400 })
    }

    // Check for approved leave requests on the specific date
    const leaveQuery = `
      SELECT 
        id, leave_type, start_date, end_date, start_time, end_time, 
        is_full_day, reason
      FROM leave_requests 
      WHERE doctor_id = ? 
      AND status = 'approved'
      AND start_date <= ? 
      AND end_date >= ?
    `

    const leaveRequests = await executeQuery(leaveQuery, [
      doctorId,
      appointmentDate,
      appointmentDate
    ])

    let isAvailable = true
    let conflictReason = null

    if (Array.isArray(leaveRequests) && leaveRequests.length > 0) {
      for (const leave of leaveRequests) {
        const leaveData = leave as any
        
        if (leaveData.is_full_day) {
          isAvailable = false
          conflictReason = `Doctor is on ${leaveData.leave_type.replace('_', ' ')} (Full day)`
          break
        } else if (appointmentTime && leaveData.start_time && leaveData.end_time) {
          // Check if appointment time conflicts with partial day leave
          const appointmentStart = new Date(`${appointmentDate}T${appointmentTime}`)
          const appointmentEnd = new Date(appointmentStart.getTime() + duration * 60000)
          const leaveStart = new Date(`${appointmentDate}T${leaveData.start_time}`)
          const leaveEnd = new Date(`${appointmentDate}T${leaveData.end_time}`)

          if (
            (appointmentStart >= leaveStart && appointmentStart < leaveEnd) ||
            (appointmentEnd > leaveStart && appointmentEnd <= leaveEnd) ||
            (appointmentStart <= leaveStart && appointmentEnd >= leaveEnd)
          ) {
            isAvailable = false
            conflictReason = `Doctor is on ${leaveData.leave_type.replace('_', ' ')} from ${leaveData.start_time} to ${leaveData.end_time}`
            break
          }
        }
      }
    }

    return NextResponse.json({
      doctorId,
      appointmentDate,
      appointmentTime,
      duration,
      isAvailable,
      conflictReason,
      leaveRequests: Array.isArray(leaveRequests) ? leaveRequests : []
    })

  } catch (error) {
    console.error('Error checking specific availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
