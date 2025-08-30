import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const appointments = [
      {
        id: '1',
        appointmentDate: new Date().toISOString(),
        patient: { name: 'राज कुमार' },
        status: 'confirmed'
      }
    ];
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
