import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { Appointment, Patient, User } from '@/backend/models';
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

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const appointments = await Appointment.findAll({
      where: {
        appointmentDate: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['name'],
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['name', 'department'], // Assuming 'department' is in the User model
        },
      ],
      order: [['appointmentDate', 'ASC']],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
