import { NextRequest, NextResponse } from 'next/server';
import { User, StaffShift } from '@/backend/models';
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

    const doctors = await User.findAll({
      where: { role: 'doctor' },
      include: [
        {
          model: StaffShift,
          as: 'shifts',
          // You might want to filter for current or upcoming shifts
        },
      ],
      attributes: ['id', 'name', 'department', 'status'],
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error fetching doctor schedules:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
