import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-simple';
import Break from '@/models/Break';
import { Op } from 'sequelize';

export async function POST(req: NextRequest) {
  const session = await getServerSession(req);

  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if there is an active break already
    const existingBreak = await Break.findOne({
      where: {
        user_id: session.user.id,
        end_time: { [Op.is]: null },
      },
    });

    if (existingBreak) {
      return NextResponse.json({ success: false, error: 'You are already on a break.' }, { status: 400 });
    }

    const newBreak = await Break.create({
      user_id: session.user.id,
      start_time: new Date(),
    });

    return NextResponse.json({ success: true, break: newBreak }, { status: 201 });
  } catch (error) {
    console.error('Error starting break:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
