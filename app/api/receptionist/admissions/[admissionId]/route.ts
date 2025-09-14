import { isStaticBuild } from '@/lib/api-utils';

// Force dynamic for development server
// Generate static parameters for build
export async function generateStaticParams() {
  // During static build, we provide a list of IDs to pre-render
  return [
    { admissionId: '1' },
    { admissionId: '2' },
    { admissionId: '3' }
  ];
}

export const dynamic = 'force-dynamic';

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

// GET - Get admission details
export async function GET(
  request: NextRequest,
  { params }: { params: { admissionId: string } }
) {
  let connection;
  
  try {
    const { admissionId } = params;
    
    connection = await getConnection();
    
    // Get admission details
    const [admissions] = await connection.execute(`
      SELECT 
        a.*,
        p.name as patient_name, p.age, p.gender, p.contact_number as patient_phone,
        p.address, p.blood_group, p.emergency_contact_name as patient_emergency_name,
        p.emergency_contact_number as patient_emergency_phone,
        r.room_number, r.floor_number, r.capacity,
        rt.type_name as room_type, rt.base_rate, rt.description as room_description,
        d.name as doctor_name, d.specialization,
        ab.name as admitted_by_name,
        db.name as discharged_by_name
      FROM admissions a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN rooms r ON a.room_id = r.id
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN users d ON a.doctor_id = d.id
      LEFT JOIN users ab ON a.admitted_by = ab.id
      LEFT JOIN users db ON a.discharged_by = db.id
      WHERE a.admission_id = ?
    `, [admissionId]);
    
    if (admissions.length === 0) {
      return NextResponse.json(
        { message: 'Admission not found' },
        { status: 404 }
      );
    }
    
    const admission = admissions[0];
    
    // Get admission charges
    const [charges] = await connection.execute(`
      SELECT 
        ac.*,
        u.name as created_by_name
      FROM admission_charges ac
      LEFT JOIN users u ON ac.created_by = u.id
      WHERE ac.admission_id = ?
      ORDER BY ac.charge_date DESC, ac.created_at DESC
    `, [admission.id]);
    
    // Get bed assignment history
    const [bedHistory] = await connection.execute(`
      SELECT 
        ba.*,
        r.room_number, r.floor_number,
        rt.type_name as room_type,
        u.name as assigned_by_name
      FROM bed_assignments ba
      LEFT JOIN rooms r ON ba.room_id = r.id
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN users u ON ba.assigned_by = u.id
      WHERE ba.admission_id = ?
      ORDER BY ba.assigned_date DESC
    `, [admission.id]);
    
    return NextResponse.json({
      admission: {
        ...admission,
        charges,
        bedHistory
      }
    });

  } catch (error) {
    console.error('Get admission details error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch admission details' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Add charges to admission
export async function POST(
  request: NextRequest,
  { params }: { params: { admissionId: string } }
) {
  let connection;
  
  try {
    const { admissionId } = params;
    const { chargeType, description, amount, quantity, chargeDate, notes, createdBy } = await request.json();

    if (!chargeType || !description || !amount) {
      return NextResponse.json(
        { message: 'Charge type, description, and amount are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();
    
    // Get admission database ID
    const [admissions] = await connection.execute(
      `SELECT id FROM admissions WHERE admission_id = ?`,
      [admissionId]
    );
    
    if (admissions.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { message: 'Admission not found' },
        { status: 404 }
      );
    }
    
    const admissionDbId = admissions[0].id;
    const totalAmount = (quantity || 1) * amount;
    
    // Add charge
    await connection.execute(
      `INSERT INTO admission_charges (
        admission_id, charge_type, description, amount, quantity,
        charge_date, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        admissionDbId, chargeType, description, amount, quantity || 1,
        chargeDate || new Date().toISOString().split('T')[0], notes || null, createdBy || 1
      ]
    );
    
    // Update total charges in admission
    await connection.execute(
      `UPDATE admissions 
       SET total_charges = total_charges + ?, updated_at = NOW()
       WHERE id = ?`,
      [totalAmount, admissionDbId]
    );
    
    await connection.commit();
    
    return NextResponse.json({
      message: 'Charge added successfully'
    }, { status: 201 });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Add admission charge error:', error);
    return NextResponse.json(
      { message: 'Failed to add charge' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
