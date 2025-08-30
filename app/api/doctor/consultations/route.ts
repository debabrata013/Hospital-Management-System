import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const consultations = [
      { id: '1', patient: { name: 'राम शर्मा' }, date: new Date().toISOString(), status: 'completed' }
    ];
    return NextResponse.json(consultations);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const consultation = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
    return NextResponse.json(consultation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
