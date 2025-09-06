import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection
async function getConnection() {
  try {
    return await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management',
      port: parseInt(process.env.DB_PORT || '3306')
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  console.log('Patients API called');
  let connection;
  
  try {
    // Try database connection first
    console.log('Attempting database connection...');
    connection = await getConnection();
    console.log('Database connected successfully');

    // Create patients table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT,
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        medical_history TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if we have any patients, if not add sample data
    const [existingPatients] = await connection.execute('SELECT COUNT(*) as count FROM patients');
    const count = (existingPatients as any[])[0].count;

    if (count === 0) {
      // Insert sample patients
      await connection.execute(`
        INSERT INTO patients (id, name, age, phone, email, address) VALUES
        ('P001', 'राम शर्मा', 45, '9876543210', 'ram.sharma@email.com', 'नई दिल्ली'),
        ('P002', 'सीता देवी', 32, '9876543211', 'sita.devi@email.com', 'मुंबई'),
        ('P003', 'अमित कुमार', 28, '9876543212', 'amit.kumar@email.com', 'बैंगलोर'),
        ('P004', 'प्रिया गुप्ता', 35, '9876543213', 'priya.gupta@email.com', 'चेन्नई'),
        ('P005', 'राज पटेल', 52, '9876543214', 'raj.patel@email.com', 'अहमदाबाद')
      `);
    }

    // Fetch all patients
    const [rows] = await connection.execute(`
      SELECT id, name, age, phone, email, address, created_at
      FROM patients 
      ORDER BY name
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error, falling back to sample data:', error);
    console.log('Using fallback sample data');
    
    // Fallback to sample data if database fails
    const patients = [
      {
        id: 'P001',
        name: 'राम शर्मा',
        age: 45,
        phone: '9876543210',
        email: 'ram.sharma@email.com',
        address: 'नई दिल्ली',
        created_at: new Date().toISOString()
      },
      {
        id: 'P002',
        name: 'सीता देवी',
        age: 32,
        phone: '9876543211',
        email: 'sita.devi@email.com',
        address: 'मुंबई',
        created_at: new Date().toISOString()
      },
      {
        id: 'P003',
        name: 'अमित कुमार',
        age: 28,
        phone: '9876543212',
        email: 'amit.kumar@email.com',
        address: 'बैंगलोर',
        created_at: new Date().toISOString()
      },
      {
        id: 'P004',
        name: 'प्रिया गुप्ता',
        age: 35,
        phone: '9876543213',
        email: 'priya.gupta@email.com',
        address: 'चेन्नई',
        created_at: new Date().toISOString()
      },
      {
        id: 'P005',
        name: 'राज पटेल',
        age: 52,
        phone: '9876543214',
        email: 'raj.patel@email.com',
        address: 'अहमदाबाद',
        created_at: new Date().toISOString()
      }
    ];

    return NextResponse.json(patients);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
