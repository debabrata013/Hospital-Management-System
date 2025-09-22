import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'

export const dynamic = 'force-dynamic'

async function getScheduleColumnInfo() {
  try {
    const columns = await executeQuery('DESCRIBE nurse_schedules') as any[]
    const names = new Set(columns.map(c => c.Field))
    return {
      hasWardAssignment: names.has('ward_assignment'),
      hasDepartment: names.has('department'),
      hasMaxPatients: names.has('max_patients'),
      hasCurrentPatients: names.has('current_patients'),
    }
  } catch (e) {
    // Fallback: assume older schema with department only
    return {
      hasWardAssignment: false,
      hasDepartment: true,
      hasMaxPatients: false,
      hasCurrentPatients: false,
    }
  }
}

// GET - Fetch all nurse schedules
export async function GET(request: NextRequest) {
  try {
    const cols = await getScheduleColumnInfo()
    const wardSelect = cols.hasWardAssignment
      ? 'ns.ward_assignment as ward_assignment'
      : (cols.hasDepartment ? 'ns.department as ward_assignment' : `"General Ward" as ward_assignment`)
    const maxPatientsSelect = cols.hasMaxPatients ? 'ns.max_patients as max_patients' : '8 as max_patients'
    const currentPatientsSelect = cols.hasCurrentPatients ? 'ns.current_patients as current_patients' : '0 as current_patients'

    const schedules = await executeQuery(
      `SELECT 
        ns.id,
        ns.nurse_id,
        u.name as nurse_name,
        ns.shift_date,
        ns.start_time,
        ns.end_time,
        ${wardSelect},
        ns.shift_type,
        ns.status,
        ${maxPatientsSelect},
        ${currentPatientsSelect},
        ns.created_at,
        ns.updated_at
      FROM nurse_schedules ns
      LEFT JOIN users u ON ns.nurse_id = u.id
      WHERE u.role = 'nurse'
      ORDER BY ns.shift_date DESC, ns.start_time ASC`,
      []
    ) as any[]

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
  const { nurseId, date, startDate, endDate, startTime, endTime, wardAssignment, shiftType, maxPatients } = body

    // Validation
    const effectiveStart = startDate || date;
    const effectiveEnd = endDate || date;

    if (!nurseId || !effectiveStart || !effectiveEnd || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: nurseId, startDate, endDate, startTime, endTime' },
        { status: 400 }
      )
    }

    if (effectiveStart > effectiveEnd) {
      return NextResponse.json(
        { error: 'End date must be on or after start date' },
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

    // Determine available columns
    const cols = await getScheduleColumnInfo()
    const wardColumn = cols.hasWardAssignment ? 'ward_assignment' : (cols.hasDepartment ? 'department' : null)
    const includeMaxPatients = cols.hasMaxPatients

    // Iterate date range and create per day
    const dates: string[] = [];
    const start = new Date(effectiveStart);
    const end = new Date(effectiveEnd);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    let createdCount = 0;
    let skippedCount = 0;
    const createdIds: number[] = [];
    const conflicts: Array<{ date: string; reason: string }> = [];

    for (const day of dates) {
      const conflictCheck = await executeQuery(
        `SELECT id, shift_type, start_time, end_time FROM nurse_schedules 
         WHERE nurse_id = ? AND shift_date = ? 
         AND LOWER(status) != 'cancelled'`,
        [nurseId, day]
      ) as any[]

      let hasOverlap = false;
      if (conflictCheck && conflictCheck.length > 0) {
        const overlap = conflictCheck.find(schedule => {
          const existingStart = schedule.start_time.slice(0, 5);
          const existingEnd = schedule.end_time.slice(0, 5);
          return (startTime < existingEnd && endTime > existingStart);
        });
        if (overlap) {
          hasOverlap = true;
          skippedCount++;
          conflicts.push({ date: day, reason: `Overlaps with ${overlap.shift_type} ${overlap.start_time}-${overlap.end_time}` });
          continue;
        }
      }

      // Build dynamic insert based on available columns
      const colsArr: string[] = ['nurse_id', 'shift_date', 'start_time', 'end_time', 'shift_type', 'status', 'created_at']
      const placeholders: string[] = ['?', '?', '?', '?', '?', `'scheduled'`, 'NOW()']
      const values: any[] = [nurseId, day, startTime, endTime, shiftType]
      if (wardColumn) {
        colsArr.splice(4, 0, wardColumn)
        placeholders.splice(4, 0, '?')
        values.splice(4, 0, wardAssignment)
      }
      if (includeMaxPatients) {
        colsArr.splice(colsArr.length - 2, 0, 'max_patients')
        placeholders.splice(placeholders.length - 2, 0, '?')
        values.splice(values.length, 0, maxPatients || 8)
      }

      const insertSQL = `INSERT INTO nurse_schedules (${colsArr.join(', ')}) VALUES (${placeholders.join(', ')})`
      const insertResult = await executeQuery(insertSQL, values) as any

      if (insertResult.insertId) {
        createdCount++;
        createdIds.push(insertResult.insertId);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdCount} schedule(s)${skippedCount ? `, skipped ${skippedCount} due to conflicts` : ''}`,
      createdCount,
      skippedCount,
      createdIds,
      conflicts
    })

  } catch (error: any) {
    console.error('Error creating nurse schedule:', error)
    
    // Handle specific database constraint errors
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage && error.sqlMessage.includes('unique_nurse_shift')) {
        return NextResponse.json(
          { 
            error: 'Database constraint prevents double shifts. To fix this:\n\n1. Go to your database (phpMyAdmin/MySQL Workbench)\n2. Run: ALTER TABLE nurse_schedules DROP INDEX unique_nurse_shift;\n3. Then try creating the schedule again.\n\nOR create a schedule with different shift type (Evening/Night instead of Morning)' 
          },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create nurse schedule. Please try again.' },
      { status: 500 }
    )
  }
}