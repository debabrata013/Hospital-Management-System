import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization token
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const doctorId = decoded.id;

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Fetch nurses assigned to this doctor
    const result = await executeQuery(`
      SELECT 
        na.id as assignment_id,
        na.department,
        na.assigned_date,
        u.id as nurse_id,
        u.name as nurse_name,
        u.email as nurse_email,
        u.phone_number as nurse_mobile
      FROM nurse_assignments na
      JOIN users u ON na.nurse_id = u.id
      WHERE na.doctor_id = ? AND na.is_active = 1
      ORDER BY na.department, u.name ASC
    `, [doctorId]);

    // Ensure result is an array
    const assignedNurses = Array.isArray(result) ? result : [];

    // Separate nurses by department
    const opdNurses = assignedNurses.filter((nurse: any) => nurse.department === 'opd');
    const wardNurses = assignedNurses.filter((nurse: any) => nurse.department === 'ward');

    return NextResponse.json({
      success: true,
      total: assignedNurses.length,
      opd: {
        count: opdNurses.length,
        nurses: opdNurses
      },
      ward: {
        count: wardNurses.length,
        nurses: wardNurses
      },
      all_nurses: assignedNurses
    });

  } catch (error) {
    console.error('Error fetching assigned nurses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned nurses' },
      { status: 500 }
    );
  }
}
