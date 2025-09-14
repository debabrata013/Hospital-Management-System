import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { isStaticBuild } from '@/lib/api-utils';

// Add the dynamic directive
export const dynamic = 'force-dynamic';

// Generate static parameters for build
export async function generateStaticParams() {
  // During static build, we provide a list of IDs to pre-render
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

// Database connection
async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_management'
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // During static build, return mock data
  if (isStaticBuild()) {
    return NextResponse.json({
      id: params.id,
      type: "summary",
      patientId: "PATIENT-001",
      patientName: "Test Patient",
      originalNotes: "Patient presented with symptoms of...",
      aiGeneratedContent: "Summary: The patient has symptoms consistent with...",
      doctorId: "DOC-001",
      doctorName: "Dr. Test Doctor",
      status: "pending",
      createdAt: new Date().toISOString(),
      approvedAt: null
    });
  }

  let connection;
  
  try {
    const approvalId = params.id;

    if (!approvalId) {
      return NextResponse.json({ error: 'Approval ID is required' }, { status: 400 });
    }

    connection = await getConnection();

    // Get the specific approval details
    const [rows] = await connection.execute(`
      SELECT 
        id,
        type,
        patient_id,
        patient_name,
        original_notes,
        ai_generated_content,
        doctor_id,
        doctor_name,
        status,
        created_at,
        approved_at
      FROM ai_approvals 
      WHERE id = ?
    `, [approvalId]);

    const approvals = rows as any[];

    if (approvals.length === 0) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
    }

    const approval = approvals[0];

    return NextResponse.json({
      id: approval.id,
      type: approval.type,
      patientId: approval.patient_id,
      patientName: approval.patient_name,
      originalNotes: approval.original_notes,
      aiGeneratedContent: approval.ai_generated_content,
      doctorId: approval.doctor_id,
      doctorName: approval.doctor_name,
      status: approval.status,
      createdAt: approval.created_at,
      approvedAt: approval.approved_at
    });

  } catch (error) {
    console.error('Error fetching approval details:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch approval details' 
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
