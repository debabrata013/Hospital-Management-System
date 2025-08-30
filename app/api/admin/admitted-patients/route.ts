import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Mock data for admitted patients
    const admittedPatients = [
      {
        id: '1',
        name: 'राम शर्मा',
        age: 45,
        condition: 'Heart Surgery Recovery',
        roomNumber: '101',
        admissionDate: '2024-01-15',
        status: 'stable',
        doctor: { name: 'Dr. अमित गुप्ता' }
      },
      {
        id: '2',
        name: 'सीता देवी',
        age: 32,
        condition: 'Post-operative Care',
        roomNumber: '205',
        admissionDate: '2024-01-16',
        status: 'improving',
        doctor: { name: 'Dr. प्रिया शर्मा' }
      }
    ];

    return NextResponse.json(admittedPatients);
  } catch (error) {
    console.error('Error fetching admitted patients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
