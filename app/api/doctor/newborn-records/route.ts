import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  let connection;

  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value ||
                  request.cookies.get('auth-backup')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const doctorId = decoded.userId || decoded.id;
    if (!doctorId) {
      return NextResponse.json(
        { success: false, message: 'Doctor ID not found in token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { birth_date, gender, status, weight_grams, mother_name, notes } = body;

    // Validation
    if (!birth_date || !gender || !status || !weight_grams) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: birth_date, gender, status, weight_grams' },
        { status: 400 }
      );
    }

    if (!['male', 'female', 'other'].includes(gender)) {
      return NextResponse.json(
        { success: false, message: 'Invalid gender value' },
        { status: 400 }
      );
    }

    if (!['healthy', 'under_observation', 'critical', 'deceased'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }

    if (weight_grams < 500 || weight_grams > 10000) {
      return NextResponse.json(
        { success: false, message: 'Weight must be between 500g and 10000g' },
        { status: 400 }
      );
    }

    // Create database connection
    connection = await mysql.createConnection(dbConfig);

    // Generate unique record ID
    const recordId = `NB${Date.now().toString().slice(-6)}`;

    // Insert newborn record
    const query = `
      INSERT INTO newborn_records
      (record_id, birth_date, gender, status, weight_grams, mother_name, doctor_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      recordId,
      new Date(birth_date),
      gender,
      status,
      weight_grams,
      mother_name || null,
      doctorId,
      notes || null
    ];

    const [result] = await connection.execute(query, values);

    // Get the inserted record
    const [rows] = await connection.execute(
      'SELECT * FROM newborn_records WHERE id = ?',
      [(result as any).insertId]
    ) as mysql.RowDataPacket[];

    return NextResponse.json({
      success: true,
      message: 'Newborn record created successfully',
      data: {
        record_id: recordId,
        id: (result as any).insertId,
        ...rows[0]
      }
    });

  } catch (error) {
    console.error('Error creating newborn record:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function GET(request: NextRequest) {
  let connection;

  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value ||
                  request.cookies.get('auth-backup')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const doctorId = decoded.userId || decoded.id;
    if (!doctorId) {
      return NextResponse.json(
        { success: false, message: 'Doctor ID not found in token' },
        { status: 401 }
      );
    }

    // Create database connection
    connection = await mysql.createConnection(dbConfig);

    // Get newborn records for this doctor
    const query = `
      SELECT * FROM newborn_records
      WHERE doctor_id = ?
      ORDER BY birth_date DESC
    `;

    const [rows] = await connection.execute(query, [doctorId]);

    return NextResponse.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error fetching newborn records:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
