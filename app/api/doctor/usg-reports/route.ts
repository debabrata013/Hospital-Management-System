import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { executeQuery } from '@/lib/db/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('auth-backup')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const doctorId = decoded.userId || decoded.id;

    if (!doctorId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if doctor is from Gynecology department
    const doctorQuery = `SELECT department FROM users WHERE id = ?`;
    const doctorResult = await executeQuery(doctorQuery, [doctorId]) as any[];
    
    if (!doctorResult || doctorResult.length === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }
    
    const doctorDepartment = doctorResult[0].department?.toLowerCase() || '';
    const isGynecologyDoctor = doctorDepartment.includes('gynecology') || 
                              doctorDepartment.includes('gynaecology') ||
                              doctorDepartment.includes('obstetrics');
    
    if (!isGynecologyDoctor) {
      return NextResponse.json({ 
        error: 'Access denied. USG Reports are only available for Gynecology department doctors.',
        department: doctorResult[0].department 
      }, { status: 403 });
    }

    // Fetch USG reports created by this doctor
    const query = `
      SELECT 
        ur.id,
        ur.report_id,
        ur.patient_id,
        ur.report_type,
        ur.report_data,
        ur.created_at,
        p.name as patient_name,
        p.patient_id as patient_code
      FROM usg_reports ur
      LEFT JOIN patients p ON ur.patient_id = p.id
      WHERE ur.doctor_id = ?
      ORDER BY ur.created_at DESC
    `;

    const reports = await executeQuery(query, [doctorId]);

    return NextResponse.json({
      success: true,
      reports: reports || []
    });

  } catch (error) {
    console.error('Error fetching USG reports:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch USG reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('auth-backup')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const doctorId = decoded.userId || decoded.id;

    if (!doctorId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if doctor is from Gynecology department
    const doctorQuery = `SELECT department FROM users WHERE id = ?`;
    const doctorResult = await executeQuery(doctorQuery, [doctorId]) as any[];
    
    if (!doctorResult || doctorResult.length === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }
    
    const doctorDepartment = doctorResult[0].department?.toLowerCase() || '';
    const isGynecologyDoctor = doctorDepartment.includes('gynecology') || 
                              doctorDepartment.includes('gynaecology') ||
                              doctorDepartment.includes('obstetrics');
    
    if (!isGynecologyDoctor) {
      return NextResponse.json({ 
        error: 'Access denied. USG Reports are only available for Gynecology department doctors.',
        department: doctorResult[0].department 
      }, { status: 403 });
    }

    const body = await request.json();
    const { patientId, reportData } = body;

    if (!patientId || !reportData) {
      return NextResponse.json({ error: 'Patient ID and report data are required' }, { status: 400 });
    }

    // Generate a unique report ID for NT/NB reports
    const reportId = `NTNB${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Insert the USG report into the database
    const insertQuery = `
      INSERT INTO usg_reports (
        report_id, 
        patient_id, 
        doctor_id, 
        report_type, 
        report_data, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `;

    const result = await executeQuery(insertQuery, [
      reportId,
      patientId,
      doctorId,
      reportData.reportType,
      JSON.stringify(reportData)
    ]);

    return NextResponse.json({
      success: true,
      reportId: reportId,
      message: 'USG report generated successfully'
    });

  } catch (error) {
    console.error('Error creating USG report:', error);
    return NextResponse.json({ 
      error: 'Failed to create USG report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
