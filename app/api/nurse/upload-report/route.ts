import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth-middleware';
import path from 'path';
import { writeFile } from 'fs/promises';
import mysql from 'mysql2/promise';

// Define the database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306'),
};

export async function POST(request: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const authResult = await authenticateUser(request, connection);
    if (authResult instanceof NextResponse) {
      return authResult; // Not authenticated
    }

    const { user } = authResult;
    if (user.role !== 'nurse') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const patientId = formData.get('patientId') as string;

    if (!file || !patientId) {
      return NextResponse.json({ success: false, error: 'File and patient ID are required.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads/reports');
    const filePath = path.join(uploadDir, filename);

    // Ensure the upload directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await writeFile(filePath, buffer);

    const reportName = file.name;
    const dbFilePath = `/uploads/reports/${filename}`;
    const fileType = file.type;

    const [result] = await connection.execute(
      'INSERT INTO test_reports (patient_id, nurse_id, report_name, file_path, file_type) VALUES (?, ?, ?, ?, ?)',
      [patientId, user.id, reportName, dbFilePath, fileType]
    );

    return NextResponse.json({ success: true, message: 'Report uploaded successfully.', filePath: dbFilePath });

  } catch (error) {
    console.error('Error uploading report:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
