import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const patients = [
      { id: '1', name: 'राम शर्मा', age: 45, phone: '9876543210' },
      { id: '2', name: 'सीता देवी', age: 32, phone: '9876543211' }
    ];
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
