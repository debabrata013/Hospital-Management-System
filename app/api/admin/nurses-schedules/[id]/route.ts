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
    }
  } catch (e) {
    return {
      hasWardAssignment: false,
      hasDepartment: true,
      hasMaxPatients: false,
    }
  }
}

// PUT - Update nurse schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
  const body = await request.json()
  const { date, startDate, endDate, startTime, endTime, wardAssignment, shiftType, maxPatients, applyToRange } = body

    // Validation
    const effectiveStart = startDate || date;
    const effectiveEnd = endDate || date;

    if (!effectiveStart || !effectiveEnd || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: startDate, endDate, startTime, endTime' },
        { status: 400 }
      )
    }

    if (effectiveStart > effectiveEnd) {
      return NextResponse.json(
        { error: 'End date must be on or after start date' },
        { status: 400 }
      )
    }

    // Check if schedule exists
    const scheduleCheck = await executeQuery(
      'SELECT id, nurse_id FROM nurse_schedules WHERE id = ?',
      [id]
    ) as any[]

    if (!scheduleCheck || scheduleCheck.length === 0) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    const nurseId = scheduleCheck[0].nurse_id

    // If applying to a range, update all existing schedules for nurse across range with the same shift_type (optional) or date match
    if (applyToRange && effectiveStart && effectiveEnd) {
      const colsInfo = await getScheduleColumnInfo()
      const wardCol = colsInfo.hasWardAssignment ? 'ward_assignment' : (colsInfo.hasDepartment ? 'department' : null)
      const includeMaxPatients = colsInfo.hasMaxPatients
      // Get all dates in range
      const dates: string[] = [];
      const start = new Date(effectiveStart);
      const end = new Date(effectiveEnd);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
      }

      // Update existing schedules in range for same nurse on those dates
      const setParts: string[] = [
        'start_time = ?',
        'end_time = ?',
        wardCol ? `${wardCol} = ?` : '',
        'shift_type = ?',
        includeMaxPatients ? 'max_patients = ?' : '',
        'updated_at = NOW()'
      ].filter(Boolean)
      const updateSQL = `UPDATE nurse_schedules SET ${setParts.join(', ')} WHERE nurse_id = ? AND shift_date IN (${dates.map(() => '?').join(',')})`
      const updateParams = [
        startTime,
        endTime,
        ...(wardCol ? [wardAssignment] : []),
        shiftType,
        ...(includeMaxPatients && typeof maxPatients === 'number' ? [maxPatients] : []),
        nurseId,
        ...dates
      ]
      const updateResult = await executeQuery(updateSQL, updateParams) as any

      // For dates without schedules, optionally create them to complete the series
      let createdCount = 0;
      for (const day of dates) {
        const exists = await executeQuery(
          `SELECT id FROM nurse_schedules WHERE nurse_id = ? AND shift_date = ?`,
          [nurseId, day]
        ) as any[]
        if (!exists || exists.length === 0) {
          const colsArr: string[] = ['nurse_id', 'shift_date', 'start_time', 'end_time', 'shift_type', 'status', 'created_at']
          const placeholders: string[] = ['?', '?', '?', '?', '?', `'scheduled'`, 'NOW()']
          const values: any[] = [nurseId, day, startTime, endTime, shiftType]
          if (wardCol) { colsArr.splice(4, 0, wardCol); placeholders.splice(4, 0, '?'); values.splice(4, 0, wardAssignment) }
          if (includeMaxPatients && typeof maxPatients === 'number') { colsArr.splice(colsArr.length - 2, 0, 'max_patients'); placeholders.splice(placeholders.length - 2, 0, '?'); values.push(maxPatients) }
          const insertSQL = `INSERT INTO nurse_schedules (${colsArr.join(', ')}) VALUES (${placeholders.join(', ')})`
          const insertRes = await executeQuery(insertSQL, values) as any
          if (insertRes.insertId) createdCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Nurse schedules updated successfully over range',
        updatedCount: updateResult.affectedRows || 0,
        createdCount
      })
    } else {
      // Single update (original behavior)
      // Check for conflicts with other schedules (excluding current one)
      const conflictCheck = await executeQuery(
        `SELECT id FROM nurse_schedules 
         WHERE nurse_id = ? AND shift_date = ? AND id != ?
         AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
         AND LOWER(status) != 'cancelled'`,
        [nurseId, effectiveStart, id, startTime, startTime, endTime, endTime]
      ) as any[]

      if (conflictCheck && conflictCheck.length > 0) {
        return NextResponse.json(
          { error: 'Schedule conflicts with existing schedule' },
          { status: 409 }
        )
      }

      const colsInfo2 = await getScheduleColumnInfo()
      const wardCol2 = colsInfo2.hasWardAssignment ? 'ward_assignment' : (colsInfo2.hasDepartment ? 'department' : null)
      const setParts2: string[] = [
        'shift_date = ?',
        'start_time = ?',
        'end_time = ?',
        wardCol2 ? `${wardCol2} = ?` : '',
        'shift_type = ?',
        'updated_at = NOW()'
      ].filter(Boolean)
      const updateSQL2 = `UPDATE nurse_schedules SET ${setParts2.join(', ')} WHERE id = ?`
      const updateParams2 = [
        effectiveStart,
        startTime,
        endTime,
        ...(wardCol2 ? [wardAssignment] : []),
        shiftType,
        id
      ]
      const updateResult = await executeQuery(updateSQL2, updateParams2) as any

      if (updateResult.affectedRows === 0) {
        throw new Error('No schedule was updated')
      }

      return NextResponse.json({
        success: true,
        message: 'Nurse schedule updated successfully',
        scheduleId: id
      })
    }

  } catch (error) {
    console.error('Error updating nurse schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update nurse schedule. Please try again.' },
      { status: 500 }
    )
  }
}

// DELETE - Delete nurse schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if schedule exists
    const scheduleCheck = await executeQuery(
      'SELECT id, status FROM nurse_schedules WHERE id = ?',
      [id]
    ) as any[]

    if (!scheduleCheck || scheduleCheck.length === 0) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // Check if schedule is already active (might want to prevent deletion)
    if (scheduleCheck[0].status === 'active') {
      return NextResponse.json(
        { error: 'Cannot delete an active schedule. Please cancel it first.' },
        { status: 400 }
      )
    }

    // Delete the schedule
    const deleteResult = await executeQuery(
      'DELETE FROM nurse_schedules WHERE id = ?',
      [id]
    ) as any

    if (deleteResult.affectedRows === 0) {
      throw new Error('No schedule was deleted')
    }

    return NextResponse.json({
      success: true,
      message: 'Nurse schedule deleted successfully',
      scheduleId: id
    })

  } catch (error) {
    console.error('Error deleting nurse schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete nurse schedule. Please try again.' },
      { status: 500 }
    )
  }
}