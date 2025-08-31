import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const roomId = searchParams.get('roomId')

    const connection = await mysql.createConnection(dbConfig)

    let query = `
      SELECT 
        ra.id,
        ra.room_id,
        ra.patient_id,
        ra.admission_date,
        ra.expected_discharge_date,
        ra.actual_discharge_date,
        ra.diagnosis,
        ra.notes,
        ra.status,
        r.room_number,
        r.room_type,
        r.floor,
        p.name as patient_name,
        p.patient_id as patient_code,
        p.contact_number,
        p.gender
      FROM room_assignments ra
      JOIN rooms r ON ra.room_id = r.id
      JOIN patients p ON ra.patient_id = p.id
      WHERE 1=1
    `
    const params: any[] = []

    if (status) {
      query += ' AND ra.status = ?'
      params.push(status)
    }

    if (roomId) {
      query += ' AND ra.room_id = ?'
      params.push(roomId)
    }

    query += ' ORDER BY ra.admission_date DESC'

    const [rows] = await connection.execute(query, params)
    await connection.end()

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching room assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room assignments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, patientId, admissionDate, expectedDischargeDate, diagnosis, notes } = body

    // Validate required fields
    if (!roomId || !patientId || !admissionDate || !expectedDischargeDate || !diagnosis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)

    // Start transaction
    await connection.beginTransaction()

    try {
      // Check if room exists and is available
      const [roomRows] = await connection.execute(
        'SELECT * FROM rooms WHERE id = ? AND status = "Available"',
        [roomId]
      )

      if (!Array.isArray(roomRows) || roomRows.length === 0) {
        throw new Error('Room not found or not available')
      }

      const room = roomRows[0] as any

      // Check if patient is already admitted
      const [existingAssignment] = await connection.execute(
        'SELECT * FROM room_assignments WHERE patient_id = ? AND status = "Active"',
        [patientId]
      )

      if (Array.isArray(existingAssignment) && existingAssignment.length > 0) {
        throw new Error('Patient is already admitted to another room')
      }

      // Check room capacity
      if (room.current_occupancy >= room.capacity) {
        throw new Error('Room is at full capacity')
      }

      // Create room assignment
      const [assignmentResult] = await connection.execute(
        `INSERT INTO room_assignments 
         (room_id, patient_id, admission_date, expected_discharge_date, diagnosis, notes, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
        [roomId, patientId, admissionDate, expectedDischargeDate, diagnosis, notes || '']
      )

      // Update room occupancy and status
      const newOccupancy = room.current_occupancy + 1
      const newStatus = newOccupancy >= room.capacity ? 'Occupied' : 'Available'

      await connection.execute(
        'UPDATE rooms SET current_occupancy = ?, status = ? WHERE id = ?',
        [newOccupancy, newStatus, roomId]
      )

      await connection.commit()
      await connection.end()

      return NextResponse.json({ 
        message: 'Patient admitted successfully',
        assignmentId: (assignmentResult as any).insertId 
      })

    } catch (error) {
      await connection.rollback()
      await connection.end()
      throw error
    }

  } catch (error) {
    console.error('Error admitting patient:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to admit patient' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, actualDischargeDate, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)

    // Start transaction
    await connection.beginTransaction()

    try {
      // Get current assignment details
      const [assignmentRows] = await connection.execute(
        'SELECT * FROM room_assignments WHERE id = ?',
        [id]
      )

      if (!Array.isArray(assignmentRows) || assignmentRows.length === 0) {
        throw new Error('Assignment not found')
      }

      const assignment = assignmentRows[0] as any

      // Update assignment
      const updateFields = []
      const updateValues = []

      if (status) {
        updateFields.push('status = ?')
        updateValues.push(status)
      }

      if (actualDischargeDate) {
        updateFields.push('actual_discharge_date = ?')
        updateValues.push(actualDischargeDate)
      }

      if (notes !== undefined) {
        updateFields.push('notes = ?')
        updateValues.push(notes)
      }

      if (updateFields.length > 0) {
        updateValues.push(id)
        await connection.execute(
          `UPDATE room_assignments SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        )
      }

      // If discharging, update room occupancy
      if (status === 'Discharged') {
        const [roomRows] = await connection.execute(
          'SELECT * FROM rooms WHERE id = ?',
          [assignment.room_id]
        )

        if (Array.isArray(roomRows) && roomRows.length > 0) {
          const room = roomRows[0] as any
          const newOccupancy = Math.max(0, room.current_occupancy - 1)
          const newStatus = newOccupancy === 0 ? 'Cleaning Required' : 'Available'

          await connection.execute(
            'UPDATE rooms SET current_occupancy = ?, status = ? WHERE id = ?',
            [newOccupancy, newStatus, assignment.room_id]
          )
        }
      }

      await connection.commit()
      await connection.end()

      return NextResponse.json({ message: 'Assignment updated successfully' })

    } catch (error) {
      await connection.rollback()
      await connection.end()
      throw error
    }

  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update assignment' },
      { status: 500 }
    )
  }
}
