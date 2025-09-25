import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { executeQuery } from '@/lib/db/connection';
import { OkPacket, RowDataPacket } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value || request.cookies.get('auth-backup')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Helper function to generate unique record ID
function generateRecordId(): string {
  const prefix = 'NB';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

// GET - Fetch all newborn records
export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a nurse
    if (decoded.role !== 'nurse') {
      return NextResponse.json({ error: 'Access denied. Nurse role required.' }, { status: 403 });
    }

    const query = `
      SELECT 
        id,
        record_id,
        birth_date,
        gender,
        status,
        weight_grams,
        mother_name,
        notes,
        created_at,
        updated_at
      FROM newborn_records 
      ORDER BY created_at DESC
    `;

    const records = (await executeQuery(query)) as RowDataPacket[];

    return NextResponse.json({
      success: true,
      data: records,
      count: records.length
    });

  } catch (error) {
    console.error('Error fetching newborn records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newborn records' },
      { status: 500 }
    );
  }
}

// POST - Create new newborn record
export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a nurse
    if (decoded.role !== 'nurse') {
      return NextResponse.json({ error: 'Access denied. Nurse role required.' }, { status: 403 });
    }

    const body = await request.json();
    const { birth_date, gender, status, weight_grams, mother_name, notes } = body;

    // Validate required fields
    if (!birth_date || !gender || !status || !weight_grams) {
      return NextResponse.json(
        { error: 'Missing required fields: birth_date, gender, status, weight_grams' },
        { status: 400 }
      );
    }

    // Validate weight
    const weight = parseInt(weight_grams);
    if (isNaN(weight) || weight < 500 || weight > 10000) {
      return NextResponse.json(
        { error: 'Weight must be between 500g and 10000g' },
        { status: 400 }
      );
    }

    // Validate gender
    if (!['male', 'female', 'ambiguous'].includes(gender)) {
      return NextResponse.json(
        { error: 'Invalid gender. Must be male, female, or ambiguous' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['healthy', 'under_observation', 'critical', 'deceased'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be healthy, under_observation, critical, or deceased' },
        { status: 400 }
      );
    }

    // Generate unique record ID
    const recordId = generateRecordId();
    const nurseId = decoded.userId || decoded.id;

    const insertQuery = `
      INSERT INTO newborn_records (
        record_id,
        birth_date,
        gender,
        status,
        weight_grams,
        mother_name,
        notes,
        doctor_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      recordId,
      birth_date,
      gender,
      status,
      weight,
      mother_name || null,
      notes || null,
      nurseId
    ];

    const result = (await executeQuery(insertQuery, values)) as OkPacket;

    // Fetch the created record
    const fetchQuery = `
      SELECT 
        id,
        record_id,
        birth_date,
        gender,
        status,
        weight_grams,
        mother_name,
        notes,
        created_at,
        updated_at
      FROM newborn_records 
      WHERE id = ?
    `;

    const [newRecord] = (await executeQuery(fetchQuery, [result.insertId])) as RowDataPacket[];

    return NextResponse.json({
      success: true,
      message: 'Newborn record created successfully',
      data: newRecord,
      recordId: recordId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating newborn record:', error);
    return NextResponse.json(
      { error: 'Failed to create newborn record' },
      { status: 500 }
    );
  }
}
