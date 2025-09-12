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

// GET - Search patients for billing
export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const patientId = searchParams.get('patientId');
    
    connection = await getConnection();
    
    if (patientId) {
      // Get specific patient with billing history
      const [patients] = await connection.execute(
        `SELECT 
          p.id, p.patient_id, p.name, p.age, p.gender, p.contact_number, 
          p.address, p.registration_date,
          COUNT(b.id) as total_bills,
          SUM(CASE WHEN b.payment_status = 'pending' THEN b.final_amount ELSE 0 END) as pending_amount,
          SUM(CASE WHEN b.payment_status = 'paid' THEN b.final_amount ELSE 0 END) as paid_amount
        FROM patients p
        LEFT JOIN bills b ON p.id = b.patient_id
        WHERE p.id = ? AND p.is_active = 1
        GROUP BY p.id`,
        [patientId]
      );
      
      if (patients.length === 0) {
        return NextResponse.json(
          { message: 'Patient not found' },
          { status: 404 }
        );
      }
      
      // Get recent bills for this patient
      const [recentBills] = await connection.execute(
        `SELECT 
          bill_id, bill_type, final_amount, payment_status, created_at
        FROM bills 
        WHERE patient_id = ? 
        ORDER BY created_at DESC 
        LIMIT 5`,
        [patientId]
      );
      
      return NextResponse.json({
        patient: {
          ...patients[0],
          recentBills
        }
      });
    }
    
    if (!query || query.length < 2) {
      return NextResponse.json({ patients: [] });
    }

    // Search patients with billing summary
    const searchQuery = `
      SELECT 
        p.id, p.patient_id, p.name, p.age, p.gender, p.contact_number, 
        p.address, p.registration_date,
        COUNT(b.id) as total_bills,
        SUM(CASE WHEN b.payment_status = 'pending' THEN b.final_amount ELSE 0 END) as pending_amount,
        MAX(b.created_at) as last_bill_date
      FROM patients p
      LEFT JOIN bills b ON p.id = b.patient_id
      WHERE p.is_active = 1 
      AND (
        p.name LIKE ? OR 
        p.contact_number LIKE ? OR 
        p.patient_id LIKE ?
      )
      GROUP BY p.id
      ORDER BY 
        CASE 
          WHEN p.contact_number = ? THEN 1
          WHEN p.contact_number LIKE ? THEN 2
          WHEN p.name LIKE ? THEN 3
          WHEN p.patient_id LIKE ? THEN 4
          ELSE 5
        END,
        p.name
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
