import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth-middleware';
import db from '@/backend/models';

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

    const { Task, Patient } = await db();

    const pendingTasks = await Task.findAll({
      where: {
        assignedTo: doctorId,
        status: ['pending', 'in_progress'], // Assuming these are the statuses for pending tasks
      },
      include: [{
        model: Patient,
        attributes: ['firstName', 'lastName'],
        required: true,
      }],
      order: [['dueDate', 'ASC']],
      limit: 10,
    });

    return NextResponse.json(pendingTasks);
  } catch (error: any) {
    console.error('Error fetching pending tasks:', error);
    // A Task model might not exist. If so, this will fail.
    if (error.name === 'SequelizeDatabaseError') { 
        return NextResponse.json({ error: 'Task model might not exist or database schema is incorrect.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch pending tasks' }, { status: 500 });
  }
}
