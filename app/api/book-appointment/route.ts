import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, department, doctor, date, time, reason } = body;

    // Validate required fields
    if (!name || !phone || !department || !doctor || !date || !time) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Please enter a valid email address' },
          { status: 400 }
        );
      }
    }

    // Validate date is not in the past
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      return NextResponse.json(
        { success: false, message: 'Surgery date cannot be in the past' },
        { status: 400 }
      );
    }

    // Here you would typically save to database
    // For now, we'll simulate a successful booking
    const appointmentData = {
      id: `SURG-${Date.now()}`, // Generate unique surgery appointment ID
      name,
      phone,
      email,
      department,
      doctor,
      date,
      time,
      reason,
      type: 'surgery',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // In a real application, you would:
    // 1. Save to database
    // 2. Send confirmation SMS/Email
    // 3. Notify the hospital staff
    // 4. Create calendar entries

    console.log('Surgery Appointment Booked:', appointmentData);

    return NextResponse.json({
      success: true,
      message: 'Surgery appointment booked successfully! You will receive a confirmation call within 24 hours.',
      appointmentId: appointmentData.id,
      data: appointmentData
    });

  } catch (error) {
    console.error('Surgery appointment booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Surgery appointment booking API is running' },
    { status: 200 }
  );
}
