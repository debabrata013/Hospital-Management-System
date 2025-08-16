import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-simple'

// Mock data - replace with database operations
let rooms = [
  {
    id: '1',
    roomNumber: '101',
    type: 'General',
    floor: 1,
    capacity: 2,
    currentOccupancy: 1,
    status: 'Occupied',
    lastCleaned: '2024-01-10',
    nextCleaningDue: '2024-01-12',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10'
  },
  {
    id: '2',
    roomNumber: '102',
    type: 'Private',
    floor: 1,
    capacity: 1,
    currentOccupancy: 0,
    status: 'Available',
    lastCleaned: '2024-01-11',
    nextCleaningDue: '2024-01-13',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-11'
  },
  {
    id: '3',
    roomNumber: '201',
    type: 'ICU',
    floor: 2,
    capacity: 1,
    currentOccupancy: 1,
    status: 'Occupied',
    lastCleaned: '2024-01-09',
    nextCleaningDue: '2024-01-11',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-09'
  },
  {
    id: '4',
    roomNumber: '202',
    type: 'Semi-Private',
    floor: 2,
    capacity: 2,
    currentOccupancy: 0,
    status: 'Cleaning Required',
    lastCleaned: '2024-01-08',
    nextCleaningDue: '2024-01-10',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-08'
  }
]

let patients = [
  {
    id: '1',
    name: 'John Doe',
    admissionDate: '2024-01-08',
    expectedDischargeDate: '2024-01-15',
    roomId: '1',
    diagnosis: 'Pneumonia',
    medications: ['Amoxicillin', 'Paracetamol'],
    notes: 'Patient responding well to treatment',
    status: 'Admitted',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08',
    actualDischargeDate: undefined as string | undefined
  },
  {
    id: '2',
    name: 'Jane Smith',
    admissionDate: '2024-01-09',
    expectedDischargeDate: '2024-01-16',
    roomId: '3',
    diagnosis: 'Heart Attack',
    medications: ['Aspirin', 'Nitroglycerin'],
    notes: 'Critical condition, monitoring required',
    status: 'Admitted',
    createdAt: '2024-01-09',
    updatedAt: '2024-01-09',
    actualDischargeDate: undefined
  }
]

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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const floor = searchParams.get('floor')
    const search = searchParams.get('search')

    let filteredRooms = [...rooms]

    if (status && status !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.status === status)
    }

    if (type && type !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.type === type)
    }

    if (floor) {
      filteredRooms = filteredRooms.filter(room => room.floor === parseInt(floor))
    }

    if (search) {
      filteredRooms = filteredRooms.filter(room => 
        room.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
        room.type.toLowerCase().includes(search.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredRooms,
      total: filteredRooms.length
    })

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

    if (action === 'createRoom') {
      // Create new room
      const newRoom = {
        id: Date.now().toString(),
        ...data,
        currentOccupancy: 0,
        status: 'Available',
        lastCleaned: new Date().toISOString().split('T')[0],
        nextCleaningDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      rooms.push(newRoom)

      return NextResponse.json({
        success: true,
        data: newRoom,
        message: 'Room created successfully'
      }, { status: 201 })

    } else if (action === 'admitPatient') {
      // Admit patient to room
      const { patientData, roomId } = data

      // Check if room is available
      const room = rooms.find(r => r.id === roomId)
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }

      if (room.status !== 'Available') {
        return NextResponse.json({ error: 'Room is not available' }, { status: 400 })
      }

      if (room.currentOccupancy >= room.capacity) {
        return NextResponse.json({ error: 'Room is at full capacity' }, { status: 400 })
      }

      // Create patient record
      const newPatient = {
        id: Date.now().toString(),
        ...patientData,
        roomId,
        status: 'Admitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      patients.push(newPatient)

      // Update room status
      room.currentOccupancy += 1
      room.status = room.currentOccupancy >= room.capacity ? 'Occupied' : 'Occupied'
      room.updatedAt = new Date().toISOString()

      return NextResponse.json({
        success: true,
        data: { patient: newPatient, room },
        message: 'Patient admitted successfully'
      }, { status: 201 })

    } else if (action === 'dischargePatient') {
      // Discharge patient from room
      const { patientId } = data

      const patient = patients.find(p => p.id === patientId)
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }

      if (patient.status === 'Discharged') {
        return NextResponse.json({ error: 'Patient already discharged' }, { status: 400 })
      }

      // Update patient status
      patient.status = 'Discharged'
      patient.actualDischargeDate = new Date().toISOString().split('T')[0]
      patient.updatedAt = new Date().toISOString()

      // Update room status
      const room = rooms.find(r => r.id === patient.roomId)
      if (room) {
        room.currentOccupancy = Math.max(0, room.currentOccupancy - 1)
        room.status = room.currentOccupancy === 0 ? 'Cleaning Required' : 'Occupied'
        room.updatedAt = new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: { patient, room },
        message: 'Patient discharged successfully'
      })

    } else if (action === 'updateRoomStatus') {
      // Update room status (e.g., after cleaning completion)
      const { roomId, status } = data
      
      const room = rooms.find(r => r.id === roomId)
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }

      room.status = status
      room.updatedAt = new Date().toISOString()

      if (status === 'Available') {
        room.lastCleaned = new Date().toISOString().split('T')[0]
        room.nextCleaningDue = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      return NextResponse.json({
        success: true,
        data: room,
        message: 'Room status updated successfully'
      })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
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

    if (action === 'updateRoom') {
      const { roomId, ...updateData } = data
      const roomIndex = rooms.findIndex(r => r.id === roomId)

      if (roomIndex === -1) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }

      rooms[roomIndex] = {
        ...rooms[roomIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: rooms[roomIndex],
        message: 'Room updated successfully'
      })

    } else if (action === 'updatePatient') {
      const { patientId, ...updateData } = data
      const patientIndex = patients.findIndex(p => p.id === patientId)

      if (patientIndex === -1) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }

      patients[patientIndex] = {
        ...patients[patientIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: patients[patientIndex],
        message: 'Patient updated successfully'
      })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
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

    if (roomId) {
      // Check if room has patients
      const hasPatients = patients.some(p => p.roomId === roomId && p.status === 'Admitted')
      if (hasPatients) {
        return NextResponse.json({ error: 'Cannot delete room with admitted patients' }, { status: 400 })
      }

      const roomIndex = rooms.findIndex(r => r.id === roomId)
      if (roomIndex === -1) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }

      rooms.splice(roomIndex, 1)

      return NextResponse.json({
        success: true,
        message: 'Room deleted successfully'
      })

    } else if (patientId) {
      const patientIndex = patients.findIndex(p => p.id === patientId)
      if (patientIndex === -1) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }

      // Update room occupancy if patient was admitted
      const patient = patients[patientIndex]
      if (patient.status === 'Admitted') {
        const room = rooms.find(r => r.id === patient.roomId)
        if (room) {
          room.currentOccupancy = Math.max(0, room.currentOccupancy - 1)
          room.status = room.currentOccupancy === 0 ? 'Cleaning Required' : 'Occupied'
          room.updatedAt = new Date().toISOString()
        }
      }

      patients.splice(patientIndex, 1)

      return NextResponse.json({
        success: true,
        message: 'Patient deleted successfully'
      })

    } else {
      return NextResponse.json({ error: 'Room ID or Patient ID required' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error deleting room/patient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
