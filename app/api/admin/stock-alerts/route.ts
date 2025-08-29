import { NextRequest, NextResponse } from 'next/server';
import { Op, literal } from 'sequelize';
import db from '@/backend/models';
import { authenticateUser } from '@/lib/auth-middleware';

const { Medicine } = db;

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

    const stockAlerts = await Medicine.findAll({
      where: {
        quantity: {
          [Op.lte]: literal('lowStockThreshold'),
        },
      },
    });

    return NextResponse.json(stockAlerts);
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
