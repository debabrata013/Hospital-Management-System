import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-simple'

// Mock data - replace with database operations
let cleaningTasks = [
  {
    id: '1',
    roomId: '4',
    roomNumber: '202',
    assignedTo: 'Sarah Johnson',
    assignedDate: '2024-01-12',
    completedDate: null,
    status: 'Pending',
    priority: 'High',
    cleaningType: 'Deep Clean',
    notes: 'Patient discharged, requires thorough cleaning',
    estimatedDuration: 60,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z'
  },
  {
    id: '2',
    roomId: '2',
    roomNumber: '102',
    assignedTo: 'Mike Chen',
    assignedDate: '2024-01-11',
    completedDate: '2024-01-11T14:30:00Z',
    status: 'Completed',
    priority: 'Medium',
    cleaningType: 'Regular Clean',
    notes: 'Routine cleaning completed',
    estimatedDuration: 30,
    createdAt: '2024-01-11T09:00:00Z',
    updatedAt: '2024-01-11T14:30:00Z'
  }
]

let cleaningStaff = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@hospital.com',
    phone: '+1-555-0101',
    status: 'Available',
    currentTasks: 1,
    maxTasks: 3,
    specialization: ['Deep Clean', 'Sanitization'],
    shift: 'Morning',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@hospital.com',
    phone: '+1-555-0102',
    status: 'Available',
    currentTasks: 0,
    maxTasks: 3,
    specialization: ['Regular Clean', 'Maintenance'],
    shift: 'Afternoon',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@hospital.com',
    phone: '+1-555-0103',
    status: 'Busy',
    currentTasks: 2,
    maxTasks: 3,
    specialization: ['Deep Clean', 'Emergency Clean'],
    shift: 'Evening',
    createdAt: '2024-01-01T00:00:00Z'
  }
]

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

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'tasks') {
      const status = searchParams.get('status')
      const priority = searchParams.get('priority')
      
      let filteredTasks = cleaningTasks
      
      if (status && status !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === status)
      }
      
      if (priority && priority !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === priority)
      }

      return NextResponse.json({
        success: true,
        data: filteredTasks,
        message: 'Cleaning tasks retrieved successfully'
      })

    } else if (action === 'staff') {
      const status = searchParams.get('status')
      
      let filteredStaff = cleaningStaff
      
      if (status && status !== 'all') {
        filteredStaff = filteredStaff.filter(staff => staff.status === status)
      }

      return NextResponse.json({
        success: true,
        data: filteredStaff,
        message: 'Cleaning staff retrieved successfully'
      })

    } else {
      // Return both tasks and staff
      return NextResponse.json({
        success: true,
        data: {
          tasks: cleaningTasks,
          staff: cleaningStaff
        },
        message: 'Cleaning data retrieved successfully'
      })
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

    if (action === 'createTask') {
      // Create new cleaning task
      const newTask = {
        id: Date.now().toString(),
        ...data,
        status: 'Pending',
        assignedDate: new Date().toISOString().split('T')[0],
        completedDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      cleaningTasks.push(newTask)

      // Update staff workload
      const staff = cleaningStaff.find(s => s.name === data.assignedTo)
      if (staff) {
        staff.currentTasks += 1
        staff.status = staff.currentTasks >= staff.maxTasks ? 'Busy' : 'Available'
      }

      return NextResponse.json({
        success: true,
        data: newTask,
        message: 'Cleaning task created successfully'
      }, { status: 201 })

    } else if (action === 'assignCleaning') {
      // Assign cleaning to available staff
      const { roomId, roomNumber, priority, cleaningType, notes } = data

      // Find available staff
      const availableStaff = cleaningStaff.filter(s => 
        s.status === 'Available' && 
        s.currentTasks < s.maxTasks &&
        s.specialization.includes(cleaningType)
      )

      if (availableStaff.length === 0) {
        return NextResponse.json({ 
          error: 'No available staff for this cleaning type' 
        }, { status: 400 })
      }

      // Assign to first available staff
      const assignedStaff = availableStaff[0]
      
      const newTask = {
        id: Date.now().toString(),
        roomId,
        roomNumber,
        assignedTo: assignedStaff.name,
        assignedDate: new Date().toISOString().split('T')[0],
        completedDate: null,
        status: 'Pending',
        priority,
        cleaningType,
        notes,
        estimatedDuration: cleaningType === 'Deep Clean' ? 60 : 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      cleaningTasks.push(newTask)

      // Update staff workload
      assignedStaff.currentTasks += 1
      assignedStaff.status = assignedStaff.currentTasks >= assignedStaff.maxTasks ? 'Busy' : 'Available'

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

    if (!['admin', 'super-admin', 'hr_manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied. Only admin and super-admin can manage cleaning.' }, { status: 403 })
    }

    const body = await request.json()
    const { taskId, status, notes } = body

    const task = cleaningTasks.find(t => t.id === taskId)
    if (!task) {
      return NextResponse.json({ error: 'Cleaning task not found' }, { status: 404 })
    }

    const oldStatus = task.status
    task.status = status
    task.updatedAt = new Date().toISOString()

    if (status === 'Completed') {
      task.completedDate = new Date().toISOString()
      
      // Update staff workload
      const staff = cleaningStaff.find(s => s.name === task.assignedTo)
      if (staff) {
        staff.currentTasks = Math.max(0, staff.currentTasks - 1)
        staff.status = staff.currentTasks === 0 ? 'Available' : 'Busy'
      }

      // Update room status to Available
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateRoomStatus',
            roomId: task.roomId,
            status: 'Available'
          })
        })
      } catch (error) {
        console.error('Error updating room status:', error)
      }
    }

    if (notes) {
      task.notes = notes
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Cleaning task updated successfully'
    })

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

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }

    const taskIndex = cleaningTasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Cleaning task not found' }, { status: 404 })
    }

    const task = cleaningTasks[taskIndex]
    
    // Update staff workload if task was assigned
    if (task.status !== 'Completed') {
      const staff = cleaningStaff.find(s => s.name === task.assignedTo)
      if (staff) {
        staff.currentTasks = Math.max(0, staff.currentTasks - 1)
        staff.status = staff.currentTasks === 0 ? 'Available' : 'Busy'
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
