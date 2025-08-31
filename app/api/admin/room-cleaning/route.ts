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

    const connection = await mysql.createConnection(dbConfig)

    let query = `
      SELECT 
        rc.id,
        rc.room_id,
        rc.cleaning_type,
        rc.assigned_to,
        rc.scheduled_date,
        rc.completed_date,
        rc.status,
        rc.notes,
        r.room_number,
        r.room_type,
        r.floor
      FROM room_cleaning rc
      JOIN rooms r ON rc.room_id = r.id
      WHERE 1=1
    `
    const params: any[] = []

    if (status) {
      query += ' AND rc.status = ?'
      params.push(status)
    }

    query += ' ORDER BY rc.scheduled_date DESC'

    const [rows] = await connection.execute(query, params)
    await connection.end()

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching room cleaning records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room cleaning records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, cleaningType, assignedTo, scheduledDate, notes } = body

    // Validate required fields
    if (!roomId || !cleaningType || !scheduledDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)

    // Start transaction
    await connection.beginTransaction()

    try {
      // Check if room exists
      const [roomRows] = await connection.execute(
        'SELECT * FROM rooms WHERE id = ?',
        [roomId]
      )

      if (!Array.isArray(roomRows) || roomRows.length === 0) {
        throw new Error('Room not found')
      }

      // Create cleaning record
      const [cleaningResult] = await connection.execute(
        `INSERT INTO room_cleaning 
         (room_id, cleaning_type, assigned_to, scheduled_date, status, notes) 
         VALUES (?, ?, ?, ?, 'Scheduled', ?)`,
        [roomId, cleaningType, assignedTo || null, scheduledDate, notes || '']
      )

      // If deep cleaning, update room status
      if (cleaningType === 'Deep Clean') {
        await connection.execute(
          'UPDATE rooms SET status = "Under Maintenance" WHERE id = ?',
          [roomId]
        )
      }

      await connection.commit()
      await connection.end()

      return NextResponse.json({ 
        message: 'Cleaning scheduled successfully',
        cleaningId: (cleaningResult as any).insertId 
      })

    } catch (error) {
      await connection.rollback()
      await connection.end()
      throw error
    }

  } catch (error) {
    console.error('Error scheduling cleaning:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to schedule cleaning' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, completedDate, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Cleaning ID is required' },
        { status: 400 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)

    // Start transaction
    await connection.beginTransaction()

    try {
      // Get current cleaning record
      const [cleaningRows] = await connection.execute(
        'SELECT * FROM room_cleaning WHERE id = ?',
        [id]
      )

      if (!Array.isArray(cleaningRows) || cleaningRows.length === 0) {
        throw new Error('Cleaning record not found')
      }

      const cleaning = cleaningRows[0] as any

      // Update cleaning record
      const updateFields = []
      const updateValues = []

      if (status) {
        updateFields.push('status = ?')
        updateValues.push(status)
      }

      if (completedDate) {
        updateFields.push('completed_date = ?')
        updateValues.push(completedDate)
      }

      if (notes !== undefined) {
        updateFields.push('notes = ?')
        updateValues.push(notes)
      }

      if (updateFields.length > 0) {
        updateValues.push(id)
        await connection.execute(
          `UPDATE room_cleaning SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        )
      }

      // If completed, update room status
      if (status === 'Completed') {
        await connection.execute(
          'UPDATE rooms SET status = "Available" WHERE id = ?',
          [cleaning.room_id]
        )
      }

      await connection.commit()
      await connection.end()

      return NextResponse.json({ message: 'Cleaning record updated successfully' })

    } catch (error) {
      await connection.rollback()
      await connection.end()
      throw error
    }

  } catch (error) {
    console.error('Error updating cleaning record:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update cleaning record' },
      { status: 500 }
    )
  }
}
