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

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    connection = await getConnection();
    
    // Get all doctors with their current status and details
    const [doctors] = await connection.execute(
      `SELECT 
        u.id, u.name, u.email, u.contact_number, u.department, 
        u.specialization, u.qualification, u.experience_years,
        COUNT(CASE WHEN a.status = 'in-progress' AND DATE(a.appointment_date) = CURDATE() THEN 1 END) as active_consultations,
        COUNT(CASE WHEN a.status = 'scheduled' AND DATE(a.appointment_date) = CURDATE() THEN 1 END) as pending_appointments,
        CASE 
          WHEN COUNT(CASE WHEN a.status = 'in-progress' AND DATE(a.appointment_date) = CURDATE() THEN 1 END) > 0 THEN 'busy'
          ELSE 'available'
        END as status
      FROM users u
      LEFT JOIN appointments a ON u.id = a.doctor_id
      WHERE u.role = 'doctor' AND u.is_active = 1
      GROUP BY u.id, u.name, u.email, u.contact_number, u.department, u.specialization, u.qualification, u.experience_years
      ORDER BY u.name`
    );

    return NextResponse.json({ doctors });

  } catch (error) {
    console.error('Get doctors error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch doctors' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
