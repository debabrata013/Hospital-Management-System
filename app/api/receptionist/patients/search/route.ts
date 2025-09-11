import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: process.env.DB_PORT || 3306,
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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ patients: [] });
    }

    connection = await getConnection();
    
    // Search by name, phone, or patient ID
    const searchQuery = `
      SELECT 
        id, patient_id, name, age, gender, contact_number, 
        address, emergency_contact_name, registration_date
      FROM patients 
      WHERE is_active = 1 
      AND (
        name LIKE ? OR 
        contact_number LIKE ? OR 
        patient_id LIKE ?
      )
      ORDER BY 
        CASE 
          WHEN contact_number = ? THEN 1
          WHEN contact_number LIKE ? THEN 2
          WHEN name LIKE ? THEN 3
          WHEN patient_id LIKE ? THEN 4
          ELSE 5
        END,
        name
      LIMIT 10
    `;
    
    const searchTerm = `%${query}%`;
    const exactPhone = query;
    const phoneStart = `${query}%`;
    const nameStart = `${query}%`;
    const idStart = `${query}%`;
    
    const [patients] = await connection.execute(searchQuery, [
      searchTerm, searchTerm, searchTerm,
      exactPhone, phoneStart, nameStart, idStart
    ]);

    return NextResponse.json({ patients });

  } catch (error) {
    console.error('Patient search error:', error);
    return NextResponse.json(
      { message: 'Failed to search patients' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
