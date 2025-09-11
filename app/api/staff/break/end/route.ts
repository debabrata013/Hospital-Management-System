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
    const { break_id } = await req.json();

    if (!break_id) {
      return NextResponse.json({ success: false, error: 'Break ID is required' }, { status: 400 });
    }

    const currentBreak = await Break.findOne({
      where: {
        id: break_id,
        user_id: session.user.id,
        end_time: { [Op.is]: null },
      },
    });

    if (!currentBreak) {
      return NextResponse.json({ success: false, error: 'No active break found to end.' }, { status: 404 });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - new Date(currentBreak.start_time).getTime()) / 1000); // in seconds

    await currentBreak.update({
      end_time: endTime,
      duration: duration,
    });
    await currentBreak.reload();
    return NextResponse.json({ success: true, break: currentBreak });
  } catch (error) {
    console.error('Error ending break:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
