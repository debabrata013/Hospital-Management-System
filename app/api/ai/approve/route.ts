import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection
async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_management'
  });
}

export async function POST(req: NextRequest) {
  let connection;
  
  try {
    const { 
      type, 
      patientId, 
      patientName, 
      content, 
      doctorId, 
      doctorName, 
      originalNotes 
    } = await req.json();

    if (!type || !patientId || !content || !doctorId) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    connection = await getConnection();

    // Create AI approvals table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ai_approvals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('patient_summary', 'diet_plan') NOT NULL,
        patient_id VARCHAR(50) NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        original_notes TEXT NOT NULL,
        ai_generated_content TEXT NOT NULL,
        doctor_id VARCHAR(50) NOT NULL,
        doctor_name VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert the approved AI content
    const [result] = await connection.execute(`
      INSERT INTO ai_approvals 
      (type, patient_id, patient_name, original_notes, ai_generated_content, doctor_id, doctor_name, status, approved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', NOW())
    `, [type, patientId, patientName, originalNotes, content, doctorId, doctorName]);

    // Also save to patient records based on type
    if (type === 'patient_summary') {
      // Save to patient consultations or medical records
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS patient_consultations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          patient_id VARCHAR(50) NOT NULL,
          doctor_id VARCHAR(50) NOT NULL,
          consultation_notes TEXT,
          ai_summary TEXT,
          consultation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await connection.execute(`
        INSERT INTO patient_consultations (patient_id, doctor_id, consultation_notes, ai_summary)
        VALUES (?, ?, ?, ?)
      `, [patientId, doctorId, originalNotes, content]);

    } else if (type === 'diet_plan') {
      // Save to patient diet plans
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS patient_diet_plans (
          id INT AUTO_INCREMENT PRIMARY KEY,
          patient_id VARCHAR(50) NOT NULL,
          doctor_id VARCHAR(50) NOT NULL,
          medical_notes TEXT,
          diet_plan TEXT,
          created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT TRUE
        )
      `);

      // Deactivate previous diet plans
      await connection.execute(`
        UPDATE patient_diet_plans SET is_active = FALSE WHERE patient_id = ?
      `, [patientId]);

      // Insert new diet plan
      await connection.execute(`
        INSERT INTO patient_diet_plans (patient_id, doctor_id, medical_notes, diet_plan)
        VALUES (?, ?, ?, ?)
      `, [patientId, doctorId, originalNotes, content]);
    }

    return NextResponse.json({ 
      success: true, 
      message: `${type.replace('_', ' ')} approved and saved to patient record`,
      approvalId: (result as any).insertId
    });

  } catch (error) {
    console.error('Error saving approval:', error);
    return NextResponse.json({ 
      error: 'Failed to save approval' 
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function GET(req: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const type = searchParams.get('type');

    connection = await getConnection();

    let query = `
      SELECT * FROM ai_approvals 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (doctorId) {
      query += ` AND doctor_id = ?`;
      params.push(doctorId);
    }

    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const [rows] = await connection.execute(query, params);

    return NextResponse.json({ approvals: rows });

  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch approvals' 
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
