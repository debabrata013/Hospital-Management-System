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

    // First, let's debug what's in the database
    console.log('Doctor ID:', doctorId);
    
    // Fetch both admitted and recently discharged patients for this doctor
    const result = await executeQuery(`
      SELECT 
        a.id as admission_id,
        a.admission_id as admission_code,
        a.patient_id,
        a.doctor_id,
        a.room_id,
        a.admission_date,
        a.discharge_date,
        a.admission_type,
        a.status,
        p.name as patient_name,
        p.patient_id as patient_code,
        p.contact_number as patient_phone,
        p.email as patient_email,
        p.gender,
        p.age,
        p.address,
        r.room_number,
        r.room_type,
        r.floor,
        a.diagnosis,
        a.chief_complaint,
        ds.id as discharge_summary_id
      FROM admissions a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN rooms r ON a.room_id = r.id
      LEFT JOIN (
        SELECT ds1.* 
        FROM discharge_summaries ds1
        WHERE ds1.id = (
          SELECT MAX(ds2.id) 
          FROM discharge_summaries ds2 
          WHERE ds2.admission_id COLLATE utf8mb4_unicode_ci = ds1.admission_id COLLATE utf8mb4_unicode_ci
        )
      ) ds ON a.admission_id COLLATE utf8mb4_unicode_ci = ds.admission_id COLLATE utf8mb4_unicode_ci
      WHERE a.doctor_id = ? AND (a.status = 'active' OR a.status = 'discharged')
      GROUP BY a.id
      ORDER BY a.status ASC, a.admission_date DESC
    `, [doctorId]);
    
    console.log('Query result:', result);

    // Ensure result is an array
    const admittedPatients = Array.isArray(result) ? result : [];

    // For each patient, fetch their latest vitals
    const patientsWithVitals = await Promise.all(
      admittedPatients.map(async (patient: any) => {
        try {
          const vitalsResult = await executeQuery(`
            SELECT 
              id,
              blood_pressure,
              pulse as heart_rate, -- Corrected column name from screenshot
              temperature,
              respiratory_rate,
              oxygen_saturation,
              weight,
              height,
              recorded_at,
              recorded_by
            FROM vitals 
            WHERE patient_id = ? 
            ORDER BY recorded_at DESC 
            LIMIT 3
          `, [patient.patient_id]);

          const vitals = Array.isArray(vitalsResult) ? vitalsResult : [];
          
          return {
            ...patient,
            vitals: vitals
          };
        } catch (error) {
          console.error(`Error fetching vitals for patient ${patient.patient_id}:`, error);
          return {
            ...patient,
            vitals: []
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      total: patientsWithVitals.length,
      patients: patientsWithVitals
    });

  } catch (error) {
    console.error('Error fetching admitted patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admitted patients' },
      { status: 500 }
    );
  }
}
