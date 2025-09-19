import { NextRequest, NextResponse } from 'next/server';
import mysql, { ResultSetHeader } from 'mysql2/promise';

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

function generateBillId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `BILL${timestamp}${random}`.toUpperCase();
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { parentBillId, items, discount, tax, notes, createdBy } = await request.json();
    if (!parentBillId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'parentBillId and items are required' }, { status: 400 });
    }

    connection = await getConnection();
    await connection.beginTransaction();

    const [pRows] = await connection.execute(`SELECT id, patient_id FROM bills WHERE bill_id = ?`, [parentBillId]);
    const parents = pRows as any[];
    if (!parents.length) {
      await connection.rollback();
      return NextResponse.json({ message: 'Parent bill not found' }, { status: 404 });
    }
    const patientId = parents[0].patient_id;
    const parentDbId = parents[0].id;

    const totalAmount = items.reduce((sum: number, it: any) => sum + (Number(it.quantity || 1) * Number(it.unitPrice || 0)), 0);
    const discountAmount = Number(discount || 0);
    const taxAmount = Number(tax || 0);
    const finalAmount = totalAmount - discountAmount + taxAmount;

    const billId = generateBillId();

    const [billResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO bills (
        bill_id, patient_id, bill_type, total_amount, discount_amount, tax_amount, final_amount,
        payment_status, is_offline, notes, created_by, created_at, parent_bill_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 1, ?, ?, NOW(), ?)` ,
      [billId, patientId, 'follow_up', totalAmount, discountAmount, taxAmount, finalAmount, notes || null, createdBy || 1, parentDbId]
    );
    const billDbId = (billResult as ResultSetHeader).insertId;

    for (const it of items) {
      const itemTotal = (Number(it.quantity || 1) * Number(it.unitPrice || 0));
      const itemDiscount = (Number(it.discountPercent || 0) * itemTotal) / 100;
      await connection.execute(
        `INSERT INTO bill_items (
          bill_id, item_type, item_name, item_description, quantity,
          unit_price, total_price, discount_percent, discount_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [billDbId, it.itemType || 'other', it.itemName || 'Item', it.description || null, Number(it.quantity || 1), Number(it.unitPrice || 0), itemTotal, Number(it.discountPercent || 0), itemDiscount]
      );
    }

    await connection.commit();
    return NextResponse.json({ message: 'Follow-up bill created', billId }, { status: 201 });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Create follow-up bill error:', error);
    return NextResponse.json({ message: 'Failed to create follow-up bill' }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
