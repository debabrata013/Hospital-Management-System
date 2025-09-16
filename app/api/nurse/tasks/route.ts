
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    // Simplified authentication - just check if token exists
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('auth-backup')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, tasks: [] });
    }

    const query = `
      SELECT 
        t.id,
        p.id as patientId,
        p.name as patientName,
        r.room_number as roomNumber,
        t.task,
        t.description,
        t.priority,
        t.due_time as dueTime,
        t.due_date as dueDate,
        t.status,
        t.category,
        t.estimated_duration as estimatedDuration,
        u.name as assignedBy
      FROM staff_tasks t
      JOIN patients p ON t.patient_id = p.id
      JOIN users u ON t.assigned_by = u.id
      LEFT JOIN room_assignments ra ON p.id = ra.patient_id AND ra.status = 'Active'
      LEFT JOIN rooms r ON ra.room_id = r.id
      ORDER BY t.due_date, t.due_time;
    `;

    const tasks = await executeQuery(query);

    return NextResponse.json(tasks);

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
