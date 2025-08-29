import { NextRequest, NextResponse } from 'next/server';
import { Op, literal } from 'sequelize';
import { Appointment, Patient, Room, Medicine, Billing } from '@/backend/models';
import authenticateUser from '@/lib/auth-middleware';

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

    const totalAppointments = await Appointment.count({
      where: {
        appointmentDate: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    const completedAppointments = await Appointment.count({
      where: {
        appointmentDate: {
          [Op.between]: [startOfDay, endOfDay],
        },
        status: 'Completed',
      },
    });

    const admittedPatients = await Patient.count({ where: { status: 'Admitted' } });

    const totalBeds = await Room.count();
    const availableBeds = totalBeds - admittedPatients;

    const criticalAlerts = await Medicine.count({
      where: {
        quantity: {
          [Op.lte]: literal('lowStockThreshold'),
        },
      },
    });

    const todayRevenue = await Billing.sum('amount', {
      where: {
        status: 'paid',
        paymentDate: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    return NextResponse.json({
      totalAppointments,
      completedAppointments,
      admittedPatients,
      availableBeds,
      criticalAlerts,
      todayRevenue: todayRevenue || 0,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
