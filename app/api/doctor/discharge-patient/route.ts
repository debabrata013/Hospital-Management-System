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
    const jwtDoctorId = decoded.userId || decoded.id;

    if (!jwtDoctorId) {
      return NextResponse.json(
        { error: 'Invalid token - no userId or id found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { admissionId, admissionCode, patientId, dischargeSummary, dischargedBy, doctorId } = body;

    if (!admissionId || !patientId || !dischargeSummary) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the doctorId from the patient data, fallback to JWT doctorId
    const actualDoctorId = doctorId || jwtDoctorId;

    // Validate required discharge summary fields
    const requiredFields = [
      'dischargeDiagnoses',
      'hospitalCourse', 
      'dischargeTo',
      'dischargeCondition',
      'dischargeMedications',
      'dischargeInstructions',
      'followUp'
    ];

    const missingFields = requiredFields.filter(field => !dischargeSummary[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Start transaction
    await executeQuery('START TRANSACTION');

    try {
      // 1. Insert discharge summary
      const dischargeSummaryResult = await executeQuery(`
        INSERT INTO discharge_summaries (
          admission_id,
          patient_id,
          doctor_id,
          admission_diagnoses,
          discharge_diagnoses,
          consults,
          procedures,
          hospital_course,
          discharge_to,
          discharge_condition,
          discharge_medications,
          discharge_instructions,
          pending_labs,
          follow_up,
          copy_to,
          created_at,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
      `, [
        admissionCode || admissionId,
        patientId,
        actualDoctorId,
        '', // admission_diagnoses will be fetched from admission record
        dischargeSummary.dischargeDiagnoses,
        dischargeSummary.consults || '',
        dischargeSummary.procedures || '',
        dischargeSummary.hospitalCourse,
        dischargeSummary.dischargeTo,
        dischargeSummary.dischargeCondition,
        dischargeSummary.dischargeMedications,
        dischargeSummary.dischargeInstructions,
        dischargeSummary.pendingLabs || '',
        dischargeSummary.followUp,
        dischargeSummary.copyTo || '',
        dischargedBy || actualDoctorId
      ]);

      const dischargeSummaryId = (dischargeSummaryResult as any).insertId;

      // 2. Update admission status to discharged
      console.log('Updating admission status:', { admissionId, actualDoctorId, dischargedBy });
      const updateResult = await executeQuery(`
        UPDATE admissions 
        SET 
          status = 'discharged',
          discharge_date = NOW(),
          discharged_by = ?
        WHERE id = ? AND doctor_id = ?
      `, [dischargedBy || actualDoctorId, admissionId, actualDoctorId]);
      console.log('Update result:', updateResult);

      // 3. Update room availability (make room available again)
      await executeQuery(`
        UPDATE rooms r
        JOIN admissions a ON r.id = a.room_id
        SET r.current_occupancy = r.current_occupancy - 1,
            r.status = CASE 
              WHEN r.current_occupancy - 1 = 0 THEN 'available'
              ELSE r.status
            END
        WHERE a.id = ?
      `, [admissionId]);

      // 4. Skip billing for now - focus on core discharge functionality
      let billId = null;

      // Commit transaction
      await executeQuery('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Patient discharged successfully',
        dischargeSummaryId: dischargeSummaryId,
        billId: billId
      });

    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error discharging patient:', error);
    return NextResponse.json(
      { error: 'Failed to discharge patient' },
      { status: 500 }
    );
  }
}
