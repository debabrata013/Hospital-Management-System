import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

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

export async function GET(_request: NextRequest) {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT DISTINCT department 
       FROM users 
       WHERE department IS NOT NULL AND department <> ''
       ORDER BY department`
    );

    const departments = (rows as any[])
      .map(r => r.department)
      .filter(Boolean);

    // Fallback defaults if DB has none
    const defaults = [
      'General Medicine','Cardiology','Neurology','Orthopedics','Pediatrics',
      'Gynecology','Dermatology','ENT','Ophthalmology','Psychiatry','Dentistry'
    ];

    return NextResponse.json({
      departments: departments.length ? departments : defaults
    });
  } catch (error) {
    console.error('Get departments error:', error);
    return NextResponse.json({
      departments: []
    }, { status: 200 });
  } finally {
    if (connection) await connection.end();
  }
}
