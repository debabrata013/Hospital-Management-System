import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth-middleware';
import db from '@/backend/models';

export async function GET(request: Request) {
  const authResult = await authenticateUser(request as any);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { Patient } = await db();
    const patients = await Patient.findAll({
      attributes: ['id', 'firstName', 'lastName'],
      order: [['firstName', 'ASC']],
    });
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
