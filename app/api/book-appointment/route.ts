import { NextRequest, NextResponse } from 'next/server'

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
      reason
    } = body

    // Validate required fields
    if (!name || !phone || !department || !doctor || !date || !time) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Here you would typically save to database
    // For now, we'll just simulate success
    const appointmentData = {
      id: `SA${Date.now()}`,
      name,
      phone,
      email: email || null,
      department,
      doctor,
      date,
      time,
      surgeryType: reason || '',
      status: 'pending',
      isNewPatient: true, // Assume new patient from website
      createdAt: new Date().toISOString(),
      source: 'website'
    }

    // In a real app, you would:
    // 1. Save to database
    // 2. Send confirmation SMS/email
    // 3. Notify receptionist
    
    console.log('New surgery appointment request:', appointmentData)

    return NextResponse.json({
      success: true,
      message: 'Surgery appointment request submitted successfully! Our receptionist will contact you soon.',
      appointmentId: appointmentData.id
    })

  } catch (error) {
    console.error('Error processing appointment request:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process appointment request. Please try again.' },
      { status: 500 }
    )
  }
}
