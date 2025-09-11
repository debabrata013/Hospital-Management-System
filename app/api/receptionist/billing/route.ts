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

// Generate unique bill ID
function generateBillId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `BILL${timestamp}${random}`.toUpperCase();
}

// Generate unique payment ID
function generatePaymentId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `PAY${timestamp}${random}`.toUpperCase();
}

// GET - Fetch bills with search and filters
export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const action = searchParams.get('action');
    
    connection = await getConnection();
    
    if (action === 'templates') {
      // Get bill templates
      const [templates] = await connection.execute(
        `SELECT * FROM bill_templates WHERE is_active = 1 ORDER BY item_type, item_name`
      );
      return NextResponse.json({ templates });
    }
    
    if (action === 'patient-bills' && patientId) {
      // Get all bills for a specific patient
      const [bills] = await connection.execute(
        `SELECT 
          b.id, b.bill_id, b.bill_type, b.total_amount, b.discount_amount, 
          b.tax_amount, b.final_amount, b.payment_status, b.payment_method,
          b.is_offline, b.notes, b.created_at,
          p.name as patient_name, p.contact_number as patient_phone,
          u.name as created_by_name
        FROM bills b
        LEFT JOIN patients p ON b.patient_id = p.id
        LEFT JOIN users u ON b.created_by = u.id
        WHERE b.patient_id = ?
        ORDER BY b.created_at DESC`,
        [patientId]
      );
      
      return NextResponse.json({ bills });
    }
    
    // Build dynamic query for bills search
    let query = `
      SELECT 
        b.id, b.bill_id, b.patient_id, b.bill_type, b.total_amount, 
        b.discount_amount, b.tax_amount, b.final_amount, b.payment_status, 
        b.payment_method, b.is_offline, b.notes, b.created_at,
        p.name as patient_name, p.contact_number as patient_phone, p.patient_id as patient_code,
        u.name as created_by_name
      FROM bills b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN users u ON b.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (p.name LIKE ? OR p.contact_number LIKE ? OR b.bill_id LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (status && status !== 'all') {
      query += ` AND b.payment_status = ?`;
      params.push(status);
    }
    
    if (dateFrom) {
      query += ` AND DATE(b.created_at) >= ?`;
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ` AND DATE(b.created_at) <= ?`;
      params.push(dateTo);
    }
    
    query += ` ORDER BY b.created_at DESC LIMIT 50`;
    
    const [bills] = await connection.execute(query, params);
    
    return NextResponse.json({ bills });

  } catch (error) {
    console.error('Get bills error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch bills' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Create new bill
export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { patientId, appointmentId, billType, items, discount, tax, paymentMethod, isOffline, notes, createdBy } = await request.json();

    if (!patientId || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Patient ID and items are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();
    
    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountAmount = discount || 0;
    const taxAmount = tax || 0;
    const finalAmount = totalAmount - discountAmount + taxAmount;
    
    const billId = generateBillId();
    
    // Insert bill
    const [billResult] = await connection.execute(
      `INSERT INTO bills (
        bill_id, patient_id, appointment_id, bill_type, total_amount, 
        discount_amount, tax_amount, final_amount, payment_status, 
        payment_method, is_offline, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        billId, patientId, appointmentId, billType, totalAmount,
        discountAmount, taxAmount, finalAmount, 'pending',
        paymentMethod, isOffline, notes, createdBy
      ]
    );
    
    const billDbId = billResult.insertId;
    
    // Insert bill items
    for (const item of items) {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = (item.discountPercent || 0) * itemTotal / 100;
      
      await connection.execute(
        `INSERT INTO bill_items (
          bill_id, item_type, item_name, item_description, quantity, 
          unit_price, total_price, discount_percent, discount_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          billDbId, item.itemType, item.itemName, item.description || '',
          item.quantity, item.unitPrice, itemTotal, item.discountPercent || 0, itemDiscount
        ]
      );
    }
    
    await connection.commit();
    
    return NextResponse.json({
      message: 'Bill created successfully',
      billId,
      billDbId,
      finalAmount
    }, { status: 201 });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Create bill error:', error);
    return NextResponse.json(
      { message: 'Failed to create bill' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT - Update bill or payment status
export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const { billId, paymentStatus, paymentMethod, razorpayOrderId, razorpayPaymentId, notes } = await request.json();

    if (!billId) {
      return NextResponse.json(
        { message: 'Bill ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    if (paymentStatus) {
      updateFields.push('payment_status = ?');
      updateValues.push(paymentStatus);
    }
    
    if (paymentMethod) {
      updateFields.push('payment_method = ?');
      updateValues.push(paymentMethod);
    }
    
    if (razorpayOrderId) {
      updateFields.push('razorpay_order_id = ?');
      updateValues.push(razorpayOrderId);
    }
    
    if (razorpayPaymentId) {
      updateFields.push('razorpay_payment_id = ?');
      updateValues.push(razorpayPaymentId);
    }
    
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes || '');
    }
    
    updateFields.push('updated_at = NOW()');
    updateValues.push(billId);
    
    if (updateFields.length === 1) { // Only updated_at
      return NextResponse.json(
        { message: 'No fields to update' },
        { status: 400 }
      );
    }
    
    const query = `UPDATE bills SET ${updateFields.join(', ')} WHERE bill_id = ?`;
    
    await connection.execute(query, updateValues);

    return NextResponse.json({
      message: 'Bill updated successfully'
    });

  } catch (error) {
    console.error('Update bill error:', error);
    return NextResponse.json(
      { message: 'Failed to update bill' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
