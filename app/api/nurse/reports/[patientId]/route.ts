import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth-middleware';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306'),
};

export async function GET(request: NextRequest, { params }: { params: { patientId: string } }) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const authResult = await authenticateUser(request, connection);
    if (authResult instanceof NextResponse) {
      return authResult; // Not authenticated
    }

    const { patientId } = params;

    const [reports] = await connection.execute(
      `SELECT tr.id, tr.report_name, tr.file_path, tr.upload_date, u.name as nurse_name 
       FROM test_reports tr 
       JOIN users u ON tr.nurse_id = u.id 
       WHERE tr.patient_id = ? 
       ORDER BY tr.upload_date DESC`,
      [patientId]
    );

    return NextResponse.json({ success: true, reports });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
