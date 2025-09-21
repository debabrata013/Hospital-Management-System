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
    const doctorId = decoded.userId || decoded.id;

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Invalid token - no userId or id found' },
        { status: 401 }
      );
    }

    // Get discharge summary ID from query params
    const { searchParams } = new URL(request.url);
    const dischargeSummaryId = searchParams.get('id');

    if (!dischargeSummaryId) {
      return NextResponse.json(
        { error: 'Discharge summary ID is required' },
        { status: 400 }
      );
    }

    // Fetch discharge summary with patient and admission details
    const result = await executeQuery(`
      SELECT 
        ds.*,
        p.name as patient_name,
        p.patient_id as patient_code,
        p.gender,
        p.age,
        a.admission_date,
        a.admission_type,
        a.diagnosis as admission_diagnosis,
        u.name as doctor_name
      FROM discharge_summaries ds
      JOIN admissions a ON ds.admission_id COLLATE utf8mb4_unicode_ci = a.admission_id COLLATE utf8mb4_unicode_ci
      JOIN patients p ON ds.patient_id = p.id
      JOIN users u ON ds.doctor_id = u.id
      WHERE ds.id = ? AND ds.doctor_id = ?
    `, [dischargeSummaryId, doctorId]);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json(
        { error: 'Discharge summary not found' },
        { status: 404 }
      );
    }

    const dischargeSummary = Array.isArray(result) ? result[0] : result;

    return NextResponse.json({
      success: true,
      dischargeSummary
    });

  } catch (error) {
    console.error('Error fetching discharge summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discharge summary' },
      { status: 500 }
    );
  }
}
