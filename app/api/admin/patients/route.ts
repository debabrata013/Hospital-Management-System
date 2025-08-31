import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Mock patients data
    const patients = [
      {
        id: '1',
        name: 'राम शर्मा',
        age: 45,
        phone: '9876543210',
        status: 'Active'
      },
      {
        id: '2',
        name: 'सीता देवी',
        age: 32,
        phone: '9876543211',
        status: 'Active'
      }
    ];

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Mock patient creation
    const newPatient = {
      id: Date.now().toString(),
      ...body,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
