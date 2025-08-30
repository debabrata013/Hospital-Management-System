import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const tasks = [
      { id: '1', title: 'Review Lab Results', priority: 'high', dueDate: new Date().toISOString() }
    ];
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
