import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET() {
  try {
    const conn = await mysql.createConnection(dbConfig)
    // Ensure tables exist (idempotent)
    await conn.execute(`CREATE TABLE IF NOT EXISTS cleaning_staff (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      status VARCHAR(20) DEFAULT 'Available',
      current_tasks INT DEFAULT 0,
      max_tasks INT DEFAULT 3,
      shift VARCHAR(20) DEFAULT 'Morning',
      specialization TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)

    await conn.execute(`CREATE TABLE IF NOT EXISTS cleaning_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_id INT NOT NULL,
      room_number VARCHAR(50),
      assigned_to VARCHAR(255),
      assigned_date DATE DEFAULT (CURRENT_DATE),
      completed_date DATE NULL,
      status VARCHAR(20) DEFAULT 'Pending',
      priority VARCHAR(20) DEFAULT 'Medium',
      cleaning_type VARCHAR(50) DEFAULT 'Regular Clean',
      notes TEXT,
      estimated_duration INT DEFAULT 30,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)

    const [staffRows] = await conn.execute(`SELECT id, name, email, phone, status, current_tasks, max_tasks, shift, specialization, created_at FROM cleaning_staff`)
    const [taskRows] = await conn.execute(`SELECT * FROM cleaning_tasks ORDER BY created_at DESC`)
    await conn.end()

    const staff = (staffRows as any[]).map(s => ({
      id: String(s.id), name: s.name, email: s.email, phone: s.phone,
      status: s.status || 'Available', currentTasks: s.current_tasks || 0,
      maxTasks: s.max_tasks || 3, shift: s.shift || 'Morning',
      specialization: s.specialization ? String(s.specialization).split(',').filter(Boolean) : [],
      createdAt: s.created_at
    }))

    const tasks = (taskRows as any[]).map(t => ({
      id: String(t.id), roomId: String(t.room_id), roomNumber: t.room_number,
      assignedTo: t.assigned_to, assignedDate: t.assigned_date?.toISOString?.().slice(0,10) || t.assigned_date,
      completedDate: t.completed_date ? (t.completed_date.toISOString?.().slice(0,10) || t.completed_date) : undefined,
      status: t.status, priority: t.priority, cleaningType: t.cleaning_type,
      notes: t.notes || '', estimatedDuration: t.estimated_duration || 30,
      createdAt: t.created_at, updatedAt: t.updated_at
    }))

    return NextResponse.json({ success: true, data: { staff, tasks } })
  } catch (e) {
    console.error('Cleaning GET failed:', e)
    return NextResponse.json({ success: false, data: { staff: [], tasks: [] } })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    const conn = await mysql.createConnection(dbConfig)
    if (action === 'createStaff') {
      const { name, email, phone, shift, specialization, maxTasks } = body
      await conn.execute(`INSERT INTO cleaning_staff (name, email, phone, shift, specialization, max_tasks) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email || null, phone || null, shift || 'Morning', (specialization || []).join(','), maxTasks || 3])
      await conn.end()
      return NextResponse.json({ success: true })
    }
    if (action === 'createTask') {
      const { roomId, assignedTo, priority, cleaningType, notes } = body
      // room number optional; leave null
      await conn.execute(`INSERT INTO cleaning_tasks (room_id, assigned_to, priority, cleaning_type, notes) VALUES (?, ?, ?, ?, ?)`,
        [roomId, assignedTo || null, priority || 'Medium', cleaningType || 'Regular Clean', notes || ''])
      await conn.end()
      return NextResponse.json({ success: true })
    }
    if (action === 'assignCleaning') {
      const { roomId, roomNumber, priority, cleaningType, notes } = body
      await conn.execute(`INSERT INTO cleaning_tasks (room_id, room_number, priority, cleaning_type, notes) VALUES (?, ?, ?, ?, ?)`,
        [roomId, roomNumber || null, priority || 'Medium', cleaningType || 'Regular Clean', notes || ''])
      await conn.end()
      return NextResponse.json({ success: true })
    }
    await conn.end()
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    console.error('Cleaning POST failed:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, status } = body
    const conn = await mysql.createConnection(dbConfig)
    await conn.execute(`UPDATE cleaning_tasks SET status = ?, completed_date = CASE WHEN ? = 'Completed' THEN CURRENT_DATE ELSE completed_date END WHERE id = ?`,
      [status, status, taskId])
    await conn.end()
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Cleaning PUT failed:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    const conn = await mysql.createConnection(dbConfig)
    await conn.execute(`DELETE FROM cleaning_tasks WHERE id = ?`, [taskId])
    await conn.end()
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Cleaning DELETE failed:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
