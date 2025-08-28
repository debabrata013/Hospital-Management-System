import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for appointment booking
const AppointmentBookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  department: z.string().min(1, 'Please select a department'),
  doctor: z.string().min(1, 'Please select a doctor'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date'),
  time: z.string().min(1, 'Please select a time slot'),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request data
    const validationResult = AppointmentBookingSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors
      }, { status: 400 });
    }
    
    const appointmentData = validationResult.data;
    
    // Check if the selected date is not in the past
    const selectedDate = new Date(appointmentData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return NextResponse.json({
        success: false,
        message: 'Cannot book appointment for past dates'
      }, { status: 400 });
    }
    
    // Generate appointment ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    const appointmentId = `APT${timestamp}${random}`;
    
    // In a real application, you would:
    // 1. Check doctor availability for the selected date/time
    // 2. Save the appointment to the database
    // 3. Send confirmation SMS/Email
    // 4. Create calendar entries
    
    // For now, we'll simulate the booking process
    const appointmentDetails = {
      appointmentId,
      ...appointmentData,
      status: 'scheduled',
      bookedAt: new Date().toISOString(),
      confirmationSent: false
    };
    
    // Simulate database save
    console.log('Appointment booked:', appointmentDetails);
    
    // Simulate sending confirmation (in real app, this would be actual SMS/Email)
    const confirmationMessage = `Dear ${appointmentData.name}, your appointment has been booked successfully!
    
Appointment Details:
- ID: ${appointmentId}
- Doctor: ${appointmentData.doctor}
- Department: ${appointmentData.department}
- Date: ${new Date(appointmentData.date).toLocaleDateString('en-IN')}
- Time: ${appointmentData.time}

Please arrive 15 minutes early. For any changes, call +91 98765 43210.

Thank you for choosing Arogya Hospital!`;
    
    // In production, you would send actual SMS/Email here
    console.log('Confirmation message:', confirmationMessage);
    
    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully!',
      data: {
        appointmentId,
        confirmationMessage: 'Confirmation sent to your phone and email',
        appointmentDetails: {
          id: appointmentId,
          doctor: appointmentData.doctor,
          department: appointmentData.department,
          date: appointmentData.date,
          time: appointmentData.time,
          status: 'scheduled'
        }
      }
    });
    
  } catch (error) {
    console.error('Appointment booking error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to book appointment. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method to retrieve available time slots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const doctor = searchParams.get('doctor');
    
    if (!date || !doctor) {
      return NextResponse.json({
        success: false,
        message: 'Date and doctor parameters are required'
      }, { status: 400 });
    }
    
    // In a real application, you would query the database for existing appointments
    // and return only available time slots
    
    const allTimeSlots = [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
      "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"
    ];
    
    // Simulate some booked slots (in real app, this would come from database)
    const bookedSlots = ["10:00 AM", "02:30 PM", "04:00 PM"];
    
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
    
    return NextResponse.json({
      success: true,
      data: {
        date,
        doctor,
        availableSlots,
        bookedSlots
      }
    });
    
  } catch (error) {
    console.error('Error fetching available slots:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch available time slots'
    }, { status: 500 });
  }
}
