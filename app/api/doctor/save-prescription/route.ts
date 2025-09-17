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
    const { 
      patientId, 
      admissionId,
      vitals, 
      medicines, 
      remarks 
    } = await request.json();

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Generate prescription ID
    const prescriptionId = `PRESC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Prepare medicines data
    const medicinesJson = JSON.stringify(medicines || []);
    const vitalsJson = JSON.stringify(vitals || {});

    // Insert prescription into database
    const result = await executeQuery(`
      INSERT INTO prescriptions (
        prescription_id,
        patient_id,
        doctor_id,
        admission_id,
        vitals,
        medicines,
        remarks,
        prescription_date,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
    `, [
      prescriptionId,
      patientId,
      doctorId,
      admissionId || null,
      vitalsJson,
      medicinesJson,
      remarks || '',
    ]);

    return NextResponse.json({
      success: true,
      message: 'Prescription saved successfully',
      prescriptionId: prescriptionId
    });

  } catch (error) {
    console.error('Error saving prescription:', error);
    return NextResponse.json(
      { error: 'Failed to save prescription' },
      { status: 500 }
    );
  }
}
