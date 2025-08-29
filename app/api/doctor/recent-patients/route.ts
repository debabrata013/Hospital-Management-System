import { NextRequest, NextResponse } from 'next/server';
import { Appointment, Patient } from '@/backend/models';
import sequelize from '@/backend/config/database';
import { authenticateUser } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    if (user.role !== 'doctor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const doctorId = user.id;

    const recentPatients = await Patient.findAll({
      attributes: [
        'id',
        'firstName',
        'lastName',
        'age',
        'gender',
        'status',
        [sequelize.fn('MAX', sequelize.col('Appointments.appointmentDate')), 'lastVisit'],
      ],
      include: [{
        model: Appointment,
        attributes: [],
        where: { doctorId: doctorId },
        required: true,
      }],
      group: ['Patient.id'],
      order: [[sequelize.fn('MAX', sequelize.col('Appointments.appointmentDate')), 'DESC']],
      limit: 5,
      subQuery: false, // Important for MAX function in order clause
    });

    return NextResponse.json(recentPatients);
  } catch (error) {
    console.error('Error fetching recent patients:', error);
    return NextResponse.json({ error: 'Failed to fetch recent patients' }, { status: 500 });
  }
}
