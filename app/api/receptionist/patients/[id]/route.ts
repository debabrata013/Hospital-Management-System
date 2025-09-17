import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import type { RowDataPacket, OkPacket } from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306'),
  charset: 'utf8mb4',
  timezone: '+05:30',
  connectTimeout: 20000
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  let connection;
  try {
    const id = params.id;
    const body = await request.json();
    const { name, age, gender, contact_number, address, emergency_contact_name } = body;
    connection = await getConnection();
    const [result] = await connection.execute<OkPacket>(
      `UPDATE patients SET name=?, age=?, gender=?, contact_number=?, address=?, emergency_contact_name=?, updated_at=NOW() WHERE id=?`,
      [name, age, gender, contact_number, address || '', emergency_contact_name || '', id]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Update patient error:', error);
    return NextResponse.json({ message: 'Failed to update patient' }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
