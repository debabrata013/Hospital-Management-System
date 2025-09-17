import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    // Fetch all nurse assignments with joins to get names
    const assignments = await executeQuery(`
      SELECT 
        na.id as assignment_id,
        na.nurse_id,
        n.name as nurse_name,
        na.doctor_id,
        d.name as doctor_name,
        na.department,
        na.assigned_date,
        na.is_active
      FROM nurse_assignments na
      LEFT JOIN users n ON na.nurse_id = n.id
      LEFT JOIN users d ON na.doctor_id = d.id
      ORDER BY na.assigned_date DESC
    `, []);

    // Fetch all doctors and nurses for reference
    const doctors = await executeQuery(`SELECT id, name, role FROM users WHERE role = 'doctor'`, []);
    const nurses = await executeQuery(`SELECT id, name, role FROM users WHERE role = 'nurse'`, []);

    return NextResponse.json({
      success: true,
      assignments,
      doctors,
      nurses
    });

  } catch (error) {
    console.error('Error fetching debug nurse assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data' },
      { status: 500 }
    );
  }
}
