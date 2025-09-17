import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-simple';
import Break from '@/models/Break';
import { Op } from 'sequelize';
import { startOfDay, endOfDay } from 'date-fns';
import { isStaticBuild } from '@/lib/api-utils';

// Force dynamic for development
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Handle static builds
  if (isStaticBuild()) {
    return NextResponse.json({ 
      success: true, 
      breaks: [
        {
          id: 1,
          user_id: 1,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 15 * 60000).toISOString(),
          duration: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    });
  }

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
