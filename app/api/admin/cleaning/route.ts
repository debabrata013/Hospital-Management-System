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

// GET - Fetch cleaning tasks and staff
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'super-admin', 'hr_manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied. Only admin and super-admin can manage cleaning.' }, { status: 403 })
    }

    const connection = await mysql.createConnection(dbConfig)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    try {
      if (action === 'tasks') {
        const status = searchParams.get('status')
        const priority = searchParams.get('priority')
        
        let query = `
          SELECT 
            ct.id,
            ct.room_id as roomId,
            r.room_number as roomNumber,
            ct.assigned_to as assignedTo,
            ct.scheduled_date as assignedDate,
            ct.completed_date as completedDate,
            ct.status,
            ct.priority,
            ct.cleaning_type as cleaningType,
            ct.notes,
            ct.estimated_duration as estimatedDuration,
            ct.created_at as createdAt,
            ct.updated_at as updatedAt
          FROM room_cleaning ct
          JOIN rooms r ON ct.room_id = r.id
          WHERE 1=1
        `
        const params: any[] = []
        
        if (status && status !== 'all') {
          query += ' AND ct.status = ?'
          params.push(status)
        }
        
        if (priority && priority !== 'all') {
          query += ' AND ct.priority = ?'
          params.push(priority)
        }
        
        query += ' ORDER BY ct.scheduled_date DESC'
        
        const [tasks] = await connection.execute(query, params)
        
        return NextResponse.json({
          success: true,
          data: tasks,
          message: 'Cleaning tasks retrieved successfully'
        })

      } else if (action === 'staff') {
        const status = searchParams.get('status')
        
        let query = `
          SELECT 
            id,
            name,
            email,
            phone,
            status,
            current_tasks as currentTasks,
            max_tasks as maxTasks,
            specialization,
            shift,
            created_at as createdAt
          FROM cleaning_staff
          WHERE 1=1
        `
        const params: any[] = []
        
        if (status && status !== 'all') {
          query += ' AND status = ?'
          params.push(status)
        }
        
        const [staff] = await connection.execute(query, params)
        
        return NextResponse.json({
          success: true,
          data: staff,
          message: 'Cleaning staff retrieved successfully'
        })

      } else {
        // Return both tasks and staff with schema-aware selection
        // Detect room_cleaning columns
        const [taskCols] = await connection.execute(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'room_cleaning'
        `, [process.env.DB_NAME || 'u153229971_Hospital'])
        const taskAvailable = new Set((taskCols as any[]).map((c: any) => c.COLUMN_NAME))

        // Build dynamic select for tasks
        const fields: string[] = [
          'ct.id',
          'ct.room_id as roomId',
          'r.room_number as roomNumber',
          'ct.assigned_to as assignedTo'
        ]
        if (taskAvailable.has('scheduled_date')) fields.push('ct.scheduled_date as assignedDate')
        if (taskAvailable.has('completed_date')) fields.push('ct.completed_date as completedDate')
        if (taskAvailable.has('status')) fields.push('ct.status')
        if (taskAvailable.has('priority')) fields.push('ct.priority')
        if (taskAvailable.has('cleaning_type')) fields.push('ct.cleaning_type as cleaningType')
        if (taskAvailable.has('notes')) fields.push('ct.notes')
        if (taskAvailable.has('estimated_duration')) fields.push('ct.estimated_duration as estimatedDuration')
        if (taskAvailable.has('created_at')) fields.push('ct.created_at as createdAt')
        if (taskAvailable.has('updated_at')) fields.push('ct.updated_at as updatedAt')

        const taskSelect = `SELECT ${fields.join(', ')} FROM room_cleaning ct JOIN rooms r ON ct.room_id = r.id ORDER BY ${taskAvailable.has('scheduled_date') ? 'ct.scheduled_date' : 'ct.id'} DESC`

        const [rawTasks] = await connection.execute(taskSelect)

        // Normalize tasks with defaults
        const tasks = (rawTasks as any[]).map((t: any) => ({
          id: t.id,
          roomId: t.roomId,
          roomNumber: t.roomNumber,
          assignedTo: t.assignedTo || 'Unassigned',
          assignedDate: t.assignedDate || t.createdAt || null,
          completedDate: t.completedDate || null,
          status: t.status || 'Pending',
          priority: t.priority || 'Medium',
          cleaningType: t.cleaningType || 'Regular Clean',
          notes: t.notes || '',
          estimatedDuration: t.estimatedDuration || 30,
          createdAt: t.createdAt || null,
          updatedAt: t.updatedAt || null
        }))

        // Staff
        const [staffRows] = await connection.execute(`
          SELECT 
            id,
            name,
            email,
            phone,
            status,
            current_tasks as currentTasks,
            max_tasks as maxTasks,
            specialization,
            shift,
            created_at as createdAt
          FROM cleaning_staff
        `)

        const staff = (staffRows as any[]).map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email || '',
          phone: s.phone || '',
          status: s.status || ((s.currentTasks || 0) >= (s.maxTasks || 0) ? 'Busy' : 'Available'),
          currentTasks: Number(s.currentTasks || 0),
          maxTasks: Number(s.maxTasks || 0),
          specialization: (() => {
            try {
              if (!s.specialization) return []
              const val = typeof s.specialization === 'string' ? s.specialization : JSON.stringify(s.specialization)
              const parsed = JSON.parse(val)
              return Array.isArray(parsed) ? parsed : []
            } catch {
              return []
            }
          })(),
          shift: s.shift || 'Morning',
          createdAt: s.createdAt || null
        }))

        return NextResponse.json({
          success: true,
          data: { tasks, staff },
          message: 'Cleaning data retrieved successfully'
        })
      }
    } finally {
      await connection.end()
    }

  } catch (error) {
    console.error('Error fetching cleaning data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create cleaning task or assign cleaning
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'super-admin', 'hr_manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied. Only admin and super-admin can manage cleaning.' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...data } = body
    const connection = await mysql.createConnection(dbConfig)

    try {
      await connection.beginTransaction()

      if (action === 'createTask') {
        // Create new cleaning task
        const [result] = await connection.execute(`
          INSERT INTO room_cleaning 
          (room_id, assigned_to, cleaning_type, priority, notes, estimated_duration, status, scheduled_date)
          VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', NOW())
        `, [
          data.roomId,
          data.assignedTo,
          data.cleaningType,
          data.priority,
          data.notes || '',
          data.estimatedDuration || 30
        ])

        const taskId = (result as any).insertId

        // Update staff workload
        await connection.execute(`
          UPDATE cleaning_staff 
          SET current_tasks = current_tasks + 1,
              status = CASE WHEN current_tasks + 1 >= max_tasks THEN 'Busy' ELSE 'Available' END
          WHERE name = ?
        `, [data.assignedTo])

        // Get the created task
        const [tasks] = await connection.execute(`
          SELECT 
            ct.id,
            ct.room_id as roomId,
            r.room_number as roomNumber,
            ct.assigned_to as assignedTo,
            ct.scheduled_date as assignedDate,
            ct.completed_date as completedDate,
            ct.status,
            ct.priority,
            ct.cleaning_type as cleaningType,
            ct.notes,
            ct.estimated_duration as estimatedDuration,
            ct.created_at as createdAt,
            ct.updated_at as updatedAt
          FROM room_cleaning ct
          JOIN rooms r ON ct.room_id = r.id
          WHERE ct.id = ?
        `, [taskId])

        await connection.commit()

        return NextResponse.json({
          success: true,
          data: tasks[0],
          message: 'Cleaning task created successfully'
        }, { status: 201 })

      } else if (action === 'assignCleaning') {
        // Assign cleaning to available staff
        const { roomId, roomNumber, priority, cleaningType, notes } = data

        // Find available staff
        const [availableStaff] = await connection.execute(`
          SELECT * FROM cleaning_staff 
          WHERE status = 'Available' 
          AND current_tasks < max_tasks
          AND JSON_CONTAINS(specialization, ?)
        `, [JSON.stringify(cleaningType)])

        if (!Array.isArray(availableStaff) || availableStaff.length === 0) {
          await connection.rollback()
          return NextResponse.json({ 
            error: 'No available staff for this cleaning type' 
          }, { status: 400 })
        }

        // Assign to first available staff
        const assignedStaff = availableStaff[0] as any
        
        const [result] = await connection.execute(`
          INSERT INTO room_cleaning 
          (room_id, assigned_to, cleaning_type, priority, notes, estimated_duration, status, scheduled_date)
          VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', NOW())
        `, [
          roomId,
          assignedStaff.name,
          cleaningType,
          priority,
          notes || '',
          cleaningType === 'Deep Clean' ? 60 : 30
        ])

        const taskId = (result as any).insertId

        // Update staff workload
        await connection.execute(`
          UPDATE cleaning_staff 
          SET current_tasks = current_tasks + 1,
              status = CASE WHEN current_tasks + 1 >= max_tasks THEN 'Busy' ELSE 'Available' END
          WHERE id = ?
        `, [assignedStaff.id])

        // Get the created task
        const [tasks] = await connection.execute(`
          SELECT 
            ct.id,
            ct.room_id as roomId,
            r.room_number as roomNumber,
            ct.assigned_to as assignedTo,
            ct.scheduled_date as assignedDate,
            ct.completed_date as completedDate,
            ct.status,
            ct.priority,
            ct.cleaning_type as cleaningType,
            ct.notes,
            ct.estimated_duration as estimatedDuration,
            ct.created_at as createdAt,
            ct.updated_at as updatedAt
          FROM room_cleaning ct
          JOIN rooms r ON ct.room_id = r.id
          WHERE ct.id = ?
        `, [taskId])

        await connection.commit()

        return NextResponse.json({
          success: true,
          data: tasks[0],
          message: 'Cleaning assigned successfully'
        }, { status: 201 })

      } else if (action === 'createStaff') {
        // Create new cleaning staff (schema-aware)
        const { name, email, phone, shift, specialization, maxTasks } = data

        if (!name || !phone) {
          await connection.rollback()
          return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
        }

        // Detect available columns on cleaning_staff
        const [cols] = await connection.execute(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'cleaning_staff'
        `, [process.env.DB_NAME || 'u153229971_Hospital'])
        const available = new Set((cols as any[]).map(c => c.COLUMN_NAME))

        // If table does not exist, create a minimal one
        if (!Array.isArray(cols) || (cols as any[]).length === 0) {
          await connection.execute(`
            CREATE TABLE IF NOT EXISTS cleaning_staff (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) NULL,
              phone VARCHAR(50) NOT NULL,
              status VARCHAR(50) DEFAULT 'Available',
              current_tasks INT DEFAULT 0,
              max_tasks INT DEFAULT 3,
              specialization JSON NULL,
              shift VARCHAR(50) DEFAULT 'Morning',
              created_at DATETIME DEFAULT NOW()
            )
          `)
          // refresh columns
          const [cols2] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'cleaning_staff'
          `, [process.env.DB_NAME || 'u153229971_Hospital'])
          ;(cols as any[]) = cols2 as any
        }

        // Build safe email (avoid null and duplicate empty string)
        const providedEmail = typeof email === 'string' ? email.trim() : ''
        const safeEmail = providedEmail || `${String(phone).trim() || 'staff'}-${Date.now()}@clean.local`

        const insertData: Record<string, any> = {}
        if (available.has('name')) insertData['name'] = name
        if (available.has('email')) insertData['email'] = safeEmail
        if (available.has('phone')) insertData['phone'] = phone
        if (available.has('status')) insertData['status'] = 'Available'
        if (available.has('current_tasks')) insertData['current_tasks'] = 0
        if (available.has('max_tasks')) insertData['max_tasks'] = Number(maxTasks) || 3
        if (available.has('specialization')) insertData['specialization'] = Array.isArray(specialization) ? JSON.stringify(specialization) : JSON.stringify([])
        if (available.has('shift')) insertData['shift'] = shift || 'Morning'
        if (available.has('created_at')) insertData['created_at'] = new Date()

        const keys = Object.keys(insertData)
        if (keys.length === 0) {
          await connection.rollback()
          return NextResponse.json({ error: 'cleaning_staff has no expected columns' }, { status: 500 })
        }

        const placeholders = keys.map(() => '?').join(', ')
        const values = keys.map(k => insertData[k])
        const sql = `INSERT INTO cleaning_staff (${keys.join(', ')}) VALUES (${placeholders})`
        const [result] = await connection.execute(sql, values)

        const staffId = (result as any).insertId

        await connection.commit()

        return NextResponse.json({
          success: true,
          data: { id: staffId },
          message: 'Cleaning staff created successfully'
        }, { status: 201 })

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
    console.error('Error in cleaning management:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update cleaning task status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'super-admin', 'hr_manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied. Only admin and super-admin can manage cleaning.' }, { status: 403 })
    }

    const body = await request.json()
    const { taskId, status, notes } = body
    const connection = await mysql.createConnection(dbConfig)

    try {
      await connection.beginTransaction()

      // Get current task details
      const [tasks] = await connection.execute(`
        SELECT * FROM room_cleaning WHERE id = ?
      `, [taskId])

      if (!Array.isArray(tasks) || tasks.length === 0) {
        await connection.rollback()
        return NextResponse.json({ error: 'Cleaning task not found' }, { status: 404 })
      }

      const task = tasks[0] as any
      const oldStatus = task.status

      // Update task status
      await connection.execute(`
        UPDATE room_cleaning 
        SET status = ?, updated_at = NOW()
        ${status === 'Completed' ? ', completed_date = NOW()' : ''}
        ${notes ? ', notes = ?' : ''}
        WHERE id = ?
      `, [
        status,
        ...(notes ? [notes] : []),
        taskId
      ])

      if (status === 'Completed') {
        // Update staff workload
        await connection.execute(`
          UPDATE cleaning_staff 
          SET current_tasks = GREATEST(0, current_tasks - 1),
              status = CASE WHEN GREATEST(0, current_tasks - 1) = 0 THEN 'Available' ELSE 'Busy' END
          WHERE name = ?
        `, [task.assigned_to])

        // Update room status to Available
        await connection.execute(`
          UPDATE rooms 
          SET status = 'Available', updated_at = NOW()
          WHERE id = ?
        `, [task.room_id])
      }

      await connection.commit()

      // Get updated task
      const [updatedTasks] = await connection.execute(`
        SELECT 
          ct.id,
          ct.room_id as roomId,
          r.room_number as roomNumber,
          ct.assigned_to as assignedTo,
          ct.scheduled_date as assignedDate,
          ct.completed_date as completedDate,
          ct.status,
          ct.priority,
          ct.cleaning_type as cleaningType,
          ct.notes,
          ct.estimated_duration as estimatedDuration,
          ct.created_at as createdAt,
          ct.updated_at as updatedAt
        FROM room_cleaning ct
        JOIN rooms r ON ct.room_id = r.id
        WHERE ct.id = ?
      `, [taskId])

      return NextResponse.json({
        success: true,
        data: updatedTasks[0],
        message: 'Cleaning task updated successfully'
      })

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      await connection.end()
    }

  } catch (error) {
    console.error('Error updating cleaning task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete cleaning task
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'super-admin', 'hr_manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied. Only admin and super-admin can manage cleaning.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const connection = await mysql.createConnection(dbConfig)

    if (!taskId) {
      await connection.end()
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }

    try {
      await connection.beginTransaction()

      // Get task details before deletion
      const [tasks] = await connection.execute(`
        SELECT * FROM room_cleaning WHERE id = ?
      `, [taskId])

      if (!Array.isArray(tasks) || tasks.length === 0) {
        await connection.rollback()
        await connection.end()
        return NextResponse.json({ error: 'Cleaning task not found' }, { status: 404 })
      }

      const task = tasks[0] as any
      
      // Update staff workload if task was not completed
      if (task.status !== 'Completed') {
        await connection.execute(`
          UPDATE cleaning_staff 
          SET current_tasks = GREATEST(0, current_tasks - 1),
              status = CASE WHEN GREATEST(0, current_tasks - 1) = 0 THEN 'Available' ELSE 'Busy' END
          WHERE name = ?
        `, [task.assigned_to])
      }

      // Delete the task
      await connection.execute(`
        DELETE FROM room_cleaning WHERE id = ?
      `, [taskId])

      await connection.commit()

      return NextResponse.json({
        success: true,
        message: 'Cleaning task deleted successfully'
      })

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      await connection.end()
    }

  } catch (error) {
    console.error('Error deleting cleaning task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
