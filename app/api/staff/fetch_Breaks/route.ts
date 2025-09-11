import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-simple';
import Break from '@/models/Break';
import { Op } from 'sequelize';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  const session = await getServerSession(req);

  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const breaks = await Break.findAll({
      where: {
        user_id: session.user.id,
        start_time: {
          [Op.between]: [startOfDay(today), endOfDay(today)],
        },
      },
      order: [['start_time', 'DESC']],
    });

    return NextResponse.json({ success: true, breaks });
  } catch (error) {
    console.error('Error fetching breaks:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
