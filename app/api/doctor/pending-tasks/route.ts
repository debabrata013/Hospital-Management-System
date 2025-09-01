import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db/connection';
import { getLoggedInUserId } from '../../../../lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const userId = await getLoggedInUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending prescription reviews
    const prescriptionQuery = `
      SELECT 
        CONCAT('PRESC_', pr.id) as id,
        'prescription_review' as type,
        CONCAT('Review prescription for ', p.name) as description,
        'medium' as priority,
        DATE_ADD(pr.created_at, INTERVAL 7 DAY) as dueDate,
        p.id as patientId,
        p.name
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      WHERE pr.doctor_id = ? 
        AND pr.status = 'active'
        AND pr.created_at < DATE_SUB(NOW(), INTERVAL 5 DAY)
      LIMIT 5
    `;

    // Get upcoming appointments that need preparation
    const appointmentQuery = `
      SELECT 
        CONCAT('APPT_', a.id) as id,
        'appointment_prep' as type,
        CONCAT('Prepare for appointment with ', p.name) as description,
        'high' as priority,
        a.appointment_date as dueDate,
        p.id as patientId,
        p.name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ? 
        AND a.status = 'scheduled'
        AND DATE(a.appointment_date) = CURDATE()
      LIMIT 3
    `;

    const [prescriptionTasks, appointmentTasks] = await Promise.all([
      executeQuery(prescriptionQuery, [userId]),
      executeQuery(appointmentQuery, [userId])
    ]);

    const allTasks = [...(prescriptionTasks as any[]), ...(appointmentTasks as any[])];

    const tasks = allTasks.map((task: any) => {
      const [firstName, ...lastNameParts] = task.name.split(' ');
      const lastName = lastNameParts.join(' ');
      return {
        id: task.id,
        type: task.type,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        Patient: {
          id: task.patientId,
          firstName: firstName || '',
          lastName: lastName || '',
        },
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
