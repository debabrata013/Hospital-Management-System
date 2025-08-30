import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Mock data for today's appointments
    const appointments = [
      {
        id: '1',
        appointmentDate: new Date().toISOString(),
        service: 'General Consultation',
        status: 'confirmed',
        patient: { name: 'राज कुमार' },
        doctor: { name: 'Dr. अमित गुप्ता', department: 'Cardiology' }
      },
      {
        id: '2',
        appointmentDate: new Date(Date.now() + 3600000).toISOString(),
        service: 'Follow-up',
        status: 'pending',
        patient: { name: 'सुनीता देवी' },
        doctor: { name: 'Dr. प्रिया शर्मा', department: 'Internal Medicine' }
      }
    ];

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
