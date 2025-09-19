import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json()
    console.log('[SCHEDULE-VALIDATION] Checking schedule for user:', userId, 'role:', role)

    // Only validate schedule for nurses
    if (role !== 'nurse') {
      return NextResponse.json({
        success: true,
        canLogin: true,
        message: 'Schedule validation not required for this role'
      })
    }

    const connection = await mysql.createConnection(dbConfig)
    
    // Get current date and time
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0] // HH:MM:SS format
    
    console.log('[SCHEDULE-VALIDATION] Current date:', currentDate, 'time:', currentTime)
    console.log('[SCHEDULE-VALIDATION] Looking for nurse_id:', userId)

    // Check if nurse has an active schedule for today
    const [schedules] = await connection.execute(
      `SELECT 
        id, nurse_id, shift_date, start_time, end_time, shift_type, 
        department as ward_assignment, status, notes
      FROM nurse_schedules 
      WHERE nurse_id = ? 
        AND shift_date = ? 
        AND status IN ('scheduled', 'active', 'Scheduled', 'Active')
        AND start_time <= ? 
        AND end_time >= ?
      ORDER BY start_time ASC`,
      [userId, currentDate, currentTime, currentTime]
    )

    await connection.end()

    const activeSchedules = schedules as any[]
    console.log('[SCHEDULE-VALIDATION] Found schedules:', activeSchedules.length)
    console.log('[SCHEDULE-VALIDATION] Schedule details:', activeSchedules.map(s => ({
      id: s.id,
      date: s.shift_date,
      start: s.start_time,
      end: s.end_time,
      type: s.shift_type,
      status: s.status,
      dept: s.ward_assignment
    })))

    if (activeSchedules.length === 0) {
      // Check if nurse has any schedule for today (but not active now)
      const connection2 = await mysql.createConnection(dbConfig)
      const [todaySchedules] = await connection2.execute(
        `SELECT shift_date, start_time, end_time, shift_type, status, department as ward_assignment
        FROM nurse_schedules 
        WHERE nurse_id = ? AND shift_date = ?`,
        [userId, currentDate]
      )
      await connection2.end()

      const todayScheduleList = todaySchedules as any[]
      
      if (todayScheduleList.length === 0) {
        return NextResponse.json({
          success: false,
          canLogin: false,
          message: 'No schedule assigned for today. Please contact your supervisor.',
          errorType: 'NO_SCHEDULE'
        })
      } else {
        // Has schedule but not in active time
        const nextSchedule = todayScheduleList[0]
        return NextResponse.json({
          success: false,
          canLogin: false,
          message: `Your shift is from ${nextSchedule.start_time} to ${nextSchedule.end_time}. Please login during your scheduled time.`,
          errorType: 'OUTSIDE_SCHEDULE',
          schedule: {
            date: nextSchedule.shift_date,
            startTime: nextSchedule.start_time,
            endTime: nextSchedule.end_time,
            shiftType: nextSchedule.shift_type
          }
        })
      }
    }

    // Nurse has active schedule, allow login
    const currentSchedule = activeSchedules[0]
    console.log('[SCHEDULE-VALIDATION] Active schedule found:', currentSchedule.id)

    return NextResponse.json({
      success: true,
      canLogin: true,
      message: 'Login allowed - active shift detected',
      schedule: {
        id: currentSchedule.id,
        date: currentSchedule.shift_date,
        startTime: currentSchedule.start_time,
        endTime: currentSchedule.end_time,
        shiftType: currentSchedule.shift_type,
        wardAssignment: currentSchedule.ward_assignment,
        status: currentSchedule.status,
        notes: currentSchedule.notes
      }
    })

  } catch (error) {
    console.error('[SCHEDULE-VALIDATION] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        canLogin: false,
        message: 'Unable to validate schedule. Please try again.',
        errorType: 'SYSTEM_ERROR'
      },
      { status: 500 }
    )
  }
}
