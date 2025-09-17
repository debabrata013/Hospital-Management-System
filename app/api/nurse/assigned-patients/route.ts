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
    const nurseId = decoded.userId || decoded.id;

    if (!nurseId) {
      return NextResponse.json(
        { error: 'Invalid token - no userId or id found' },
        { status: 401 }
      );
    }

    // Fetch patients assigned to this nurse
    const result = await executeQuery(`
      SELECT 
        pna.id as assignment_id,
        pna.assigned_date,
        pna.notes,
        p.id as patient_id,
        p.patient_id as patient_code,
        p.name as patient_name,
        p.contact_number as patient_phone,
        p.email as patient_email,
        p.gender,
        p.date_of_birth,
        p.blood_group,
        p.address,
        p.city,
        p.state,
        d.name as doctor_name,
        d.department as doctor_department
      FROM patient_nurse_assignments pna
      JOIN patients p ON pna.patient_id = p.id
      JOIN users d ON pna.doctor_id = d.id
      WHERE pna.nurse_id = ? AND pna.is_active = 1
      ORDER BY pna.assigned_date DESC
    `, [nurseId]);

    // Ensure result is an array
    const assignedPatients = Array.isArray(result) ? result : [];

    return NextResponse.json({
      success: true,
      total: assignedPatients.length,
      patients: assignedPatients
    });

  } catch (error) {
    console.error('Error fetching assigned patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned patients' },
      { status: 500 }
    );
  }
}
