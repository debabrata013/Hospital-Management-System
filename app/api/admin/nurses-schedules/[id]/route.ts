import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'

export const dynamic = 'force-dynamic'

// PUT - Update nurse schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { date, startTime, endTime, wardAssignment, shiftType, maxPatients } = body

    // Validation
    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: date, startTime, endTime' },
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

    // Check for conflicts with other schedules (excluding current one)
    const conflictCheck = await executeQuery(
      `SELECT id FROM nurse_schedules 
       WHERE nurse_id = ? AND shift_date = ? AND id != ?
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
       AND status != 'Cancelled'`,
      [nurseId, date, id, startTime, startTime, endTime, endTime]
    ) as any[]

    if (conflictCheck && conflictCheck.length > 0) {
      return NextResponse.json(
        { error: 'Schedule conflicts with existing schedule' },
        { status: 409 }
      )
    }

    // Update the schedule
    const updateResult = await executeQuery(
      `UPDATE nurse_schedules SET 
        shift_date = ?,
        start_time = ?,
        end_time = ?,
        department = ?,
        shift_type = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        date,
        startTime,
        endTime,
        wardAssignment,
        shiftType,
        id
      ]
    ) as any

    if (updateResult.affectedRows === 0) {
      throw new Error('No schedule was updated')
    }

    return NextResponse.json({
      success: true,
      message: 'Nurse schedule updated successfully',
      scheduleId: id
    })

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