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

// GET - Get bill details with items
export async function GET(
  request: NextRequest,
  { params }: { params: { billId: string } }
) {
  let connection;
  
  try {
    const { billId } = params;
    
    connection = await getConnection();
    
    // Get bill details
    const [bills] = await connection.execute(
      `SELECT 
        b.*, 
        p.name as patient_name, p.contact_number as patient_phone,
        p.patient_id as patient_code, p.age, p.gender, p.address,
        u.name as created_by_name,
        a.appointment_id, a.doctor_id,
        doc.name as doctor_name
      FROM bills b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN appointments a ON b.appointment_id = a.id
      LEFT JOIN users doc ON a.doctor_id = doc.id
      WHERE b.bill_id = ?`,
      [billId]
    );
    
    if (bills.length === 0) {
      return NextResponse.json(
        { message: 'Bill not found' },
        { status: 404 }
      );
    }
    
    const bill = bills[0];
    
    // Get bill items
    const [items] = await connection.execute(
      `SELECT * FROM bill_items WHERE bill_id = ? ORDER BY id`,
      [bill.id]
    );
    
    // Get payment history
    const [payments] = await connection.execute(
      `SELECT * FROM payments WHERE bill_id = ? ORDER BY created_at DESC`,
      [bill.id]
    );
    
    return NextResponse.json({
      bill: {
        ...bill,
        items,
        payments
      }
    });

  } catch (error) {
    console.error('Get bill details error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch bill details' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// DELETE - Cancel/void bill
export async function DELETE(
  request: NextRequest,
  { params }: { params: { billId: string } }
) {
  let connection;
  
  try {
    const { billId } = params;
    
    connection = await getConnection();
    
    // Check if bill can be cancelled (not paid)
    const [bills] = await connection.execute(
      `SELECT payment_status FROM bills WHERE bill_id = ?`,
      [billId]
    );
    
    if (bills.length === 0) {
      return NextResponse.json(
        { message: 'Bill not found' },
        { status: 404 }
      );
    }
    
    if (bills[0].payment_status === 'paid') {
      return NextResponse.json(
        { message: 'Cannot cancel paid bill' },
        { status: 400 }
      );
    }
    
    // Update bill status to cancelled
    await connection.execute(
      `UPDATE bills SET payment_status = 'cancelled', updated_at = NOW() WHERE bill_id = ?`,
      [billId]
    );
    
    return NextResponse.json({
      message: 'Bill cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel bill error:', error);
    return NextResponse.json(
      { message: 'Failed to cancel bill' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
