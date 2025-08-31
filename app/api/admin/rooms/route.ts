import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-simple'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
}

// GET - Fetch all rooms with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'super-admin', 'hr_manager', 'department_head'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const connection = await mysql.createConnection(dbConfig)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const floor = searchParams.get('floor')
    const search = searchParams.get('search')

    try {
      let query = `
        SELECT 
          id,
          room_number,
          room_name,
          room_type,
          floor,
          capacity,
          current_occupancy,
          status,
          daily_rate,
          description,
          created_at,
          updated_at
        FROM rooms
        WHERE 1=1
      `
      const params: any[] = []

      if (status && status !== 'all') {
        query += ' AND status = ?'
        params.push(status)
      }

      if (type && type !== 'all') {
        query += ' AND room_type = ?'
        params.push(type)
      }

      if (floor) {
        query += ' AND floor = ?'
        params.push(parseInt(floor))
      }

      if (search) {
        query += ' AND (room_number LIKE ? OR room_name LIKE ? OR room_type LIKE ?)'
        const searchTerm = `%${search}%`
        params.push(searchTerm, searchTerm, searchTerm)
      }

      query += ' ORDER BY room_number'

      const [rooms] = await connection.execute(query, params)

      return NextResponse.json({
        success: true,
        data: rooms,
        total: Array.isArray(rooms) ? rooms.length : 0
      })

    } finally {
      await connection.end()
    }

  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new room or admit patient
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'super-admin', 'hr_manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied. Only admin and super-admin can manage rooms.' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...data } = body
    const connection = await mysql.createConnection(dbConfig)

    try {
      await connection.beginTransaction()

      if (action === 'createRoom') {
        // Create new room
        const [result] = await connection.execute(`
          INSERT INTO rooms 
          (room_number, room_name, room_type, floor, capacity, current_occupancy, status, daily_rate, description)
          VALUES (?, ?, ?, ?, ?, 0, 'Available', ?, ?)
        `, [
          data.roomNumber,
          data.roomName || '',
          data.roomType,
          data.floor,
          data.capacity,
          data.dailyRate || 0,
          data.description || ''
        ])

        const roomId = (result as any).insertId

        // Get the created room
        const [rooms] = await connection.execute(`
          SELECT * FROM rooms WHERE id = ?
        `, [roomId])

        await connection.commit()

        return NextResponse.json({
          success: true,
          data: rooms[0],
          message: 'Room created successfully'
        }, { status: 201 })

      } else if (action === 'admitPatient') {
        // Admit patient to room
        const { patientData, roomId } = data

        // Check if room exists and is available
        const [roomRows] = await connection.execute(`
          SELECT * FROM rooms WHERE id = ? AND status = 'Available'
        `, [roomId])

        if (!Array.isArray(roomRows) || roomRows.length === 0) {
          await connection.rollback()
          return NextResponse.json({ error: 'Room not found or not available' }, { status: 400 })
        }

        const room = roomRows[0] as any

        if (room.current_occupancy >= room.capacity) {
          await connection.rollback()
          return NextResponse.json({ error: 'Room is at full capacity' }, { status: 400 })
        }

        // Create patient record
        const [patientResult] = await connection.execute(`
          INSERT INTO patients 
          (name, contact_number, gender, date_of_birth, address, emergency_contact, medical_history)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          patientData.name,
          patientData.contactNumber || '',
          patientData.gender || 'Unknown',
          patientData.dateOfBirth || null,
          patientData.address || '',
          patientData.emergencyContact || '',
          patientData.medicalHistory || ''
        ])

        const patientId = (patientResult as any).insertId

        // Create room assignment
        const [assignmentResult] = await connection.execute(`
          INSERT INTO room_assignments 
          (room_id, patient_id, admission_date, expected_discharge_date, diagnosis, notes, status)
          VALUES (?, ?, NOW(), ?, ?, ?, 'Active')
        `, [
          roomId,
          patientId,
          patientData.expectedDischargeDate,
          patientData.diagnosis || '',
          patientData.notes || ''
        ])

        // Update room status
        const newOccupancy = room.current_occupancy + 1
        const newStatus = newOccupancy >= room.capacity ? 'Occupied' : 'Available'

        await connection.execute(`
          UPDATE rooms 
          SET current_occupancy = ?, status = ?, updated_at = NOW()
          WHERE id = ?
        `, [newOccupancy, newStatus, roomId])

        await connection.commit()

        return NextResponse.json({
          success: true,
          data: { 
            patientId, 
            assignmentId: (assignmentResult as any).insertId,
            room: { ...room, current_occupancy: newOccupancy, status: newStatus }
          },
          message: 'Patient admitted successfully'
        }, { status: 201 })

      } else if (action === 'dischargePatient') {
        // Discharge patient from room
        const { patientId } = data

        // Get patient assignment
        const [assignments] = await connection.execute(`
          SELECT * FROM room_assignments WHERE patient_id = ? AND status = 'Active'
        `, [patientId])

        if (!Array.isArray(assignments) || assignments.length === 0) {
          await connection.rollback()
          return NextResponse.json({ error: 'Patient not found or not admitted' }, { status: 404 })
        }

        const assignment = assignments[0] as any

        // Update assignment status
        await connection.execute(`
          UPDATE room_assignments 
          SET status = 'Discharged', actual_discharge_date = NOW(), updated_at = NOW()
          WHERE id = ?
        `, [assignment.id])

        // Update room occupancy
        const [roomRows] = await connection.execute(`
          SELECT * FROM rooms WHERE id = ?
        `, [assignment.room_id])

        if (Array.isArray(roomRows) && roomRows.length > 0) {
          const room = roomRows[0] as any
          const newOccupancy = Math.max(0, room.current_occupancy - 1)
          const newStatus = newOccupancy === 0 ? 'Cleaning Required' : 'Available'

          await connection.execute(`
            UPDATE rooms 
            SET current_occupancy = ?, status = ?, updated_at = NOW()
            WHERE id = ?
          `, [newOccupancy, newStatus, assignment.room_id])
        }

        await connection.commit()

        return NextResponse.json({
          success: true,
          message: 'Patient discharged successfully'
        })

      } else if (action === 'updateRoomStatus') {
        // Update room status (e.g., after cleaning completion)
        const { roomId, status } = data
        
        const [roomRows] = await connection.execute(`
          SELECT * FROM rooms WHERE id = ?
        `, [roomId])

        if (!Array.isArray(roomRows) || roomRows.length === 0) {
          await connection.rollback()
          return NextResponse.json({ error: 'Room not found' }, { status: 404 })
        }

        await connection.execute(`
          UPDATE rooms 
          SET status = ?, updated_at = NOW()
          WHERE id = ?
        `, [status, roomId])

        await connection.commit()

        return NextResponse.json({
          success: true,
          message: 'Room status updated successfully'
        })

      } else {
        await connection.rollback()
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      await connection.end()
    }

  } catch (error) {
    console.error('Error in room management:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update room or patient information
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'super-admin', 'hr_manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied. Only admin and super-admin can update rooms.' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...data } = body
    const connection = await mysql.createConnection(dbConfig)

    try {
      await connection.beginTransaction()

      if (action === 'updateRoom') {
        const { roomId, ...updateData } = data
        
        const [roomRows] = await connection.execute(`
          SELECT * FROM rooms WHERE id = ?
        `, [roomId])

        if (!Array.isArray(roomRows) || roomRows.length === 0) {
          await connection.rollback()
          return NextResponse.json({ error: 'Room not found' }, { status: 404 })
        }

        // Build update query dynamically
        const updateFields = []
        const updateValues = []
        
        Object.entries(updateData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updateFields.push(`${key} = ?`)
            updateValues.push(value)
          }
        })

        if (updateFields.length === 0) {
          await connection.rollback()
          return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
        }

        updateValues.push(roomId)
        await connection.execute(`
          UPDATE rooms 
          SET ${updateFields.join(', ')}, updated_at = NOW()
          WHERE id = ?
        `, updateValues)

        // Get updated room
        const [updatedRooms] = await connection.execute(`
          SELECT * FROM rooms WHERE id = ?
        `, [roomId])

        await connection.commit()

        return NextResponse.json({
          success: true,
          data: updatedRooms[0],
          message: 'Room updated successfully'
        })

      } else if (action === 'updatePatient') {
        const { patientId, ...updateData } = data
        
        const [patientRows] = await connection.execute(`
          SELECT * FROM patients WHERE id = ?
        `, [patientId])

        if (!Array.isArray(patientRows) || patientRows.length === 0) {
          await connection.rollback()
          return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        // Build update query dynamically
        const updateFields = []
        const updateValues = []
        
        Object.entries(updateData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updateFields.push(`${key} = ?`)
            updateValues.push(value)
          }
        })

        if (updateFields.length === 0) {
          await connection.rollback()
          return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
        }

        updateValues.push(patientId)
        await connection.execute(`
          UPDATE patients 
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `, updateValues)

        // Get updated patient
        const [updatedPatients] = await connection.execute(`
          SELECT * FROM patients WHERE id = ?
        `, [patientId])

        await connection.commit()

        return NextResponse.json({
          success: true,
          data: updatedPatients[0],
          message: 'Patient updated successfully'
        })

      } else {
        await connection.rollback()
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      await connection.end()
    }

  } catch (error) {
    console.error('Error updating room/patient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete room or patient
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'super-admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied. Only admin and super-admin can delete rooms.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const patientId = searchParams.get('patientId')
    const connection = await mysql.createConnection(dbConfig)

    try {
      await connection.beginTransaction()

      if (roomId) {
        // Check if room has patients
        const [assignments] = await connection.execute(`
          SELECT COUNT(*) as count FROM room_assignments 
          WHERE room_id = ? AND status = 'Active'
        `, [roomId])

        if (assignments[0].count > 0) {
          await connection.rollback()
          return NextResponse.json({ error: 'Cannot delete room with admitted patients' }, { status: 400 })
        }

        const [roomRows] = await connection.execute(`
          SELECT * FROM rooms WHERE id = ?
        `, [roomId])

        if (!Array.isArray(roomRows) || roomRows.length === 0) {
          await connection.rollback()
          return NextResponse.json({ error: 'Room not found' }, { status: 404 })
        }

        await connection.execute(`
          DELETE FROM rooms WHERE id = ?
        `, [roomId])

        await connection.commit()

        return NextResponse.json({
          success: true,
          message: 'Room deleted successfully'
        })

      } else if (patientId) {
        const [patientRows] = await connection.execute(`
          SELECT * FROM patients WHERE id = ?
        `, [patientId])

        if (!Array.isArray(patientRows) || patientRows.length === 0) {
          await connection.rollback()
          return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        // Update room occupancy if patient was admitted
        const [assignments] = await connection.execute(`
          SELECT * FROM room_assignments 
          WHERE patient_id = ? AND status = 'Active'
        `, [patientId])

        if (Array.isArray(assignments) && assignments.length > 0) {
          const assignment = assignments[0] as any
          const [roomRows] = await connection.execute(`
            SELECT * FROM rooms WHERE id = ?
          `, [assignment.room_id])

          if (Array.isArray(roomRows) && roomRows.length > 0) {
            const room = roomRows[0] as any
            const newOccupancy = Math.max(0, room.current_occupancy - 1)
            const newStatus = newOccupancy === 0 ? 'Cleaning Required' : 'Available'

            await connection.execute(`
              UPDATE rooms 
              SET current_occupancy = ?, status = ?, updated_at = NOW()
              WHERE id = ?
            `, [newOccupancy, newStatus, assignment.room_id])
          }
        }

        // Delete patient assignments first
        await connection.execute(`
          DELETE FROM room_assignments WHERE patient_id = ?
        `, [patientId])

        // Delete patient
        await connection.execute(`
          DELETE FROM patients WHERE id = ?
        `, [patientId])

        await connection.commit()

        return NextResponse.json({
          success: true,
          message: 'Patient deleted successfully'
        })

      } else {
        await connection.rollback()
        return NextResponse.json({ error: 'Room ID or Patient ID required' }, { status: 400 })
      }

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      await connection.end()
    }

  } catch (error) {
    console.error('Error deleting room/patient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
