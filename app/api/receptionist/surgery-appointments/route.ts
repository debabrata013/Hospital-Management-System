import { NextRequest, NextResponse } from 'next/server'

// Mock data - in a real app, this would come from a database
const mockSurgeryAppointments = [
  {
    id: "SA001",
    patientId: "P001",
    name: "Ram Sharma",
    phone: "+91 98765 43210",
    email: "ram@example.com",
    department: "Orthopedics",
    doctor: "Dr G K Nayak",
    date: "2024-09-20",
    time: "10:00 AM",
    surgeryType: "Knee Replacement Surgery",
    status: "pending",
    isNewPatient: false,
    createdAt: "2024-09-15T10:30:00Z",
    source: "website"
  },
  {
    id: "SA002",
    name: "Sunita Devi",
    phone: "+91 98765 43211",
    email: "sunita@example.com",
    department: "Gynecology",
    doctor: "Dr Niharika Nayak",
    date: "2024-09-22",
    time: "02:00 PM",
    surgeryType: "Laparoscopic Surgery",
    status: "confirmed",
    isNewPatient: true,
    createdAt: "2024-09-15T11:15:00Z",
    source: "website"
  }
]

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would fetch from database
    // const appointments = await db.surgeryAppointments.findMany()
    
    return NextResponse.json({
      success: true,
      appointments: mockSurgeryAppointments
    })
  } catch (error) {
    console.error('Error fetching surgery appointments:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch surgery appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      phone,
      email,
      department,
      doctor,
      date,
      time,
      surgeryType,
      isNewPatient
    } = body

    // Validate required fields
    if (!name || !phone || !department || !doctor || !date || !time) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new appointment
    const newAppointment = {
      id: `SA${Date.now()}`,
      name,
      phone,
      email: email || null,
      department,
      doctor,
      date,
      time,
      surgeryType: surgeryType || '',
      status: 'pending',
      isNewPatient: isNewPatient || false,
      createdAt: new Date().toISOString(),
      source: 'receptionist'
    }

    // In a real app, you would save to database
    // await db.surgeryAppointments.create({ data: newAppointment })
    
    mockSurgeryAppointments.push(newAppointment)

    return NextResponse.json({
      success: true,
      message: 'Surgery appointment created successfully',
      appointment: newAppointment
    })

  } catch (error) {
    console.error('Error creating surgery appointment:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create surgery appointment' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing appointment ID or status' },
        { status: 400 }
      )
    }

    // In a real app, you would update in database
    // await db.surgeryAppointments.update({ where: { id }, data: { status } })
    
    const appointmentIndex = mockSurgeryAppointments.findIndex(apt => apt.id === id)
    if (appointmentIndex !== -1) {
      mockSurgeryAppointments[appointmentIndex].status = status
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment status updated successfully'
    })

  } catch (error) {
    console.error('Error updating surgery appointment:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update surgery appointment' },
      { status: 500 }
    )
  }
}
