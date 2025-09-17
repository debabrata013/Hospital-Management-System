import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
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
    const doctorId = decoded.userId || decoded.id;

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Invalid token - no userId or id found' },
        { status: 401 }
      );
    }

    // Get request body
    const { nurseId, patientId } = await request.json();

    if (!nurseId || !patientId) {
      return NextResponse.json(
        { error: 'Nurse ID and Patient ID are required' },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await executeQuery(`
      SELECT id FROM patient_nurse_assignments 
      WHERE nurse_id = ? AND patient_id = ? AND is_active = 1
    `, [nurseId, patientId]);

    if (Array.isArray(existingAssignment) && existingAssignment.length > 0) {
      return NextResponse.json(
        { error: 'Patient is already assigned to this nurse' },
        { status: 400 }
      );
    }

    // Create the assignment
    await executeQuery(`
      INSERT INTO patient_nurse_assignments (
        nurse_id, 
        patient_id, 
        doctor_id, 
        assigned_date, 
        is_active
      ) VALUES (?, ?, ?, NOW(), 1)
    `, [nurseId, patientId, doctorId]);

    return NextResponse.json({
      success: true,
      message: 'Patient assigned to nurse successfully'
    });

  } catch (error) {
    console.error('Error assigning patient to nurse:', error);
    return NextResponse.json(
      { error: 'Failed to assign patient to nurse' },
      { status: 500 }
    );
  }
}
