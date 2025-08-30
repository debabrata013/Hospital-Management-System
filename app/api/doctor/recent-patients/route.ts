import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const patients = [
      { id: '1', name: 'राम शर्मा', lastVisit: new Date().toISOString(), condition: 'Hypertension' },
      { id: '2', name: 'सीता देवी', lastVisit: new Date().toISOString(), condition: 'Diabetes' }
    ];
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
