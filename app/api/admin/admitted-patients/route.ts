import { NextRequest, NextResponse } from 'next/server';
import { Patient, User } from '@/backend/models';
import { authenticateUser } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admittedPatients = await Patient.findAll({
      where: { status: 'Admitted' },
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['name'],
        },
      ],
    });

    return NextResponse.json(admittedPatients);
  } catch (error) {
    console.error('Error fetching admitted patients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
