import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { authenticateUser } from '@/lib/auth-middleware';
import db from '@/backend/models';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);

    if (authResult instanceof NextResponse) {
      return authResult; // Return error response if authentication fails
    }

    const { user } = authResult;

    if (user.role !== 'doctor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const doctorId = user.id;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const { Appointment, sequelize } = await db();

    // Fetch stats
    const todaysAppointments = await Appointment.count({
      where: {
        doctorId,
        appointmentDate: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    const distinctPatientIds = await Appointment.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('patientId')), 'patientId']],
      where: {
        doctorId,
      },
      raw: true,
    });

    const totalPatients = distinctPatientIds.length;

    // Placeholders for stats not yet modeled
    const emergencyCalls = 0; // Placeholder
    const surgeriesToday = 0; // Placeholder

    return NextResponse.json({
      todaysAppointments,
      totalPatients,
      emergencyCalls,
      surgeriesToday,
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
