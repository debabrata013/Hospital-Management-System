import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Mock doctor schedules data
    const doctorSchedules = [
      {
        id: '1',
        name: 'Dr. अमित गुप्ता',
        department: 'Cardiology',
        status: 'available',
        shifts: [
          {
            dayOfWeek: 'Monday',
            startTime: '09:00',
            endTime: '17:00'
          }
        ]
      },
      {
        id: '2',
        name: 'Dr. प्रिया शर्मा',
        department: 'Internal Medicine',
        status: 'busy',
        shifts: [
          {
            dayOfWeek: 'Monday',
            startTime: '08:00',
            endTime: '16:00'
          }
        ]
      }
    ];

    return NextResponse.json(doctorSchedules);
  } catch (error) {
    console.error('Error fetching doctor schedules:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
