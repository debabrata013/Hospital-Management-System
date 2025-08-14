import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import models from '@/models'
const { User, AuditLog } = models

// Mock data - replace with database operations
let cleaningTasks = [
  {
    id: '1',
    roomId: '4',
    roomNumber: '202',
    assignedTo: 'Cleaning Staff A',
    assignedDate: '2024-01-10',
    status: 'Pending',
    notes: 'Room needs deep cleaning after discharge',
    priority: 'High',
    estimatedDuration: '2 hours',
    cleaningType: 'Deep Clean',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    completedBy: '',
    startedDate: ''
  },
  {
    id: '2',
    roomId: '2',
    roomNumber: '102',
    assignedTo: 'Cleaning Staff B',
    assignedDate: '2024-01-11',
    status: 'Completed',
    completedDate: '2024-01-11',
    notes: 'Regular maintenance cleaning completed',
    priority: 'Medium',
    estimatedDuration: '1 hour',
    cleaningType: 'Regular Clean',
    createdAt: '2024-01-11',
    updatedAt: '2024-01-11',
    completedBy: '',
    startedDate: ''
  }
]

let cleaningStaff = [
  {
    id: '1',
    name: 'Cleaning Staff A',
    email: 'staffa@hospital.com',
    phone: '+1234567890',
    specialization: 'Deep Cleaning',
    isAvailable: true,
    currentTasks: 1
  },
  {
    id: '2',
    name: 'Cleaning Staff B',
    email: 'staffb@hospital.com',
    phone: '+1234567891',
    specialization: 'Regular Cleaning',
    isAvailable: true,
    currentTasks: 0
  }
]

// GET - Fetch cleaning tasks and staff
export async function GET(request: NextRequest) {
  try {
    // BYPASS AUTH FOR LOCAL DEVELOPMENT
    // const session = await getServerSession(request)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    // if (!['admin', 'super-admin', 'hr_manager', 'department_head'].includes(session.user.role)) {
    //   return NextResponse.json({ error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    // }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const roomId = searchParams.get('roomId')

    let filteredTasks = [...cleaningTasks]

    if (status && status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === status)
    }

    if (priority && priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === priority)
    }

    if (assignedTo && assignedTo !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.assignedTo === assignedTo)
    }

    if (roomId) {
      filteredTasks = filteredTasks.filter(task => task.roomId === roomId)
    }

    return NextResponse.json({
      success: true,
      data: {
        tasks: filteredTasks,
        staff: cleaningStaff
      },
      total: filteredTasks.length
    })

  } catch (error) {
    console.error('Error fetching cleaning data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new cleaning task or assign cleaning
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

    if (action === 'createTask') {
      // Create new cleaning task
      const newTask = {
        id: Date.now().toString(),
        ...data,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedBy: '',
        startedDate: '',
        completedDate: ''
      }

      cleaningTasks.push(newTask)

      // Update staff task count
      const staff = cleaningStaff.find(s => s.name === newTask.assignedTo)
      if (staff) {
        staff.currentTasks += 1
        staff.isAvailable = staff.currentTasks < 3 // Max 3 tasks per staff
      }

      return NextResponse.json({
        success: true,
        data: newTask,
        message: 'Cleaning task created successfully'
      }, { status: 201 })

    } else if (action === 'assignCleaning') {
      // Assign cleaning to specific room
      const { roomId, roomNumber, assignedTo, priority, notes, cleaningType } = data

      // Check if room already has pending cleaning
      const existingTask = cleaningTasks.find(t => t.roomId === roomId && t.status === 'Pending')
      if (existingTask) {
        return NextResponse.json({ error: 'Room already has pending cleaning task' }, { status: 400 })
      }

      // Check if staff is available
      const staff = cleaningStaff.find(s => s.name === assignedTo)
      if (!staff) {
        return NextResponse.json({ error: 'Cleaning staff not found' }, { status: 404 })
      }

      if (!staff.isAvailable) {
        return NextResponse.json({ error: 'Staff member is not available' }, { status: 400 })
      }

      const newTask = {
        id: Date.now().toString(),
        roomId,
        roomNumber,
        assignedTo,
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        notes: notes || 'Room cleaning required',
        priority: priority || 'Medium',
        estimatedDuration: cleaningType === 'Deep Clean' ? '2 hours' : '1 hour',
        cleaningType: cleaningType || 'Regular Clean',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedBy: '',
        startedDate: '',
        completedDate: ''
      }

      cleaningTasks.push(newTask)

      // Update staff task count
      staff.currentTasks += 1
      staff.isAvailable = staff.currentTasks < 3

      return NextResponse.json({
        success: true,
        data: newTask,
        message: 'Cleaning assigned successfully'
      }, { status: 201 })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
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

    if (!['admin', 'super-admin', 'hr_manager', 'department_head'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'updateTaskStatus') {
      const { taskId, status, notes, completedBy } = data
      const taskIndex = cleaningTasks.findIndex(t => t.id === taskId)

      if (taskIndex === -1) {
        return NextResponse.json({ error: 'Cleaning task not found' }, { status: 404 })
      }

      const task = cleaningTasks[taskIndex]
      const oldStatus = task.status

      // Update task status
      task.status = status
      task.updatedAt = new Date().toISOString()

      if (status === 'Completed') {
        task.completedDate = new Date().toISOString().split('T')[0]
        if (notes) task.notes = notes
        if (completedBy) task.completedBy = completedBy
      } else if (status === 'In Progress') {
        task.startedDate = new Date().toISOString().split('T')[0]
      }

      // Update staff availability if task is completed
      if (status === 'Completed' && oldStatus !== 'Completed') {
        const staff = cleaningStaff.find(s => s.name === task.assignedTo)
        if (staff) {
          staff.currentTasks = Math.max(0, staff.currentTasks - 1)
          staff.isAvailable = staff.currentTasks < 3
        }
      }

      return NextResponse.json({
        success: true,
        data: task,
        message: 'Cleaning task status updated successfully'
      })

    } else if (action === 'reassignTask') {
      const { taskId, newAssignedTo } = data
      const taskIndex = cleaningTasks.findIndex(t => t.id === taskId)

      if (taskIndex === -1) {
        return NextResponse.json({ error: 'Cleaning task not found' }, { status: 404 })
      }

      const task = cleaningTasks[taskIndex]
      const oldAssignedTo = task.assignedTo

      // Check if new staff is available
      const newStaff = cleaningStaff.find(s => s.name === newAssignedTo)
      if (!newStaff) {
        return NextResponse.json({ error: 'New cleaning staff not found' }, { status: 404 })
      }

      if (!newStaff.isAvailable) {
        return NextResponse.json({ error: 'New staff member is not available' }, { status: 400 })
      }

      // Update old staff task count
      const oldStaff = cleaningStaff.find(s => s.name === oldAssignedTo)
      if (oldStaff) {
        oldStaff.currentTasks = Math.max(0, oldStaff.currentTasks - 1)
        oldStaff.isAvailable = oldStaff.currentTasks < 3
      }

      // Update new staff task count
      newStaff.currentTasks += 1
      newStaff.isAvailable = newStaff.currentTasks < 3

      // Update task assignment
      task.assignedTo = newAssignedTo
      task.assignedDate = new Date().toISOString().split('T')[0]
      task.updatedAt = new Date().toISOString()

      return NextResponse.json({
        success: true,
        data: task,
        message: 'Cleaning task reassigned successfully'
      })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
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

    if (!['admin', 'super-admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied. Only admin and super-admin can delete cleaning tasks.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }

    const taskIndex = cleaningTasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Cleaning task not found' }, { status: 404 })
    }

    const task = cleaningTasks[taskIndex]

    // Update staff task count if task was active
    if (['Pending', 'In Progress'].includes(task.status)) {
      const staff = cleaningStaff.find(s => s.name === task.assignedTo)
      if (staff) {
        staff.currentTasks = Math.max(0, staff.currentTasks - 1)
        staff.isAvailable = staff.currentTasks < 3
      }
    }

    cleaningTasks.splice(taskIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Cleaning task deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting cleaning task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
