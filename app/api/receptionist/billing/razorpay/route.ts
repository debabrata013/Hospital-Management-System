import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

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

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'your_key_secret';

// POST - Create Razorpay order
export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { billId, amount, currency = 'INR' } = await request.json();

    if (!billId || !amount) {
      return NextResponse.json(
        { message: 'Bill ID and amount are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Get bill details
    const [bills] = await connection.execute(
      `SELECT b.*, p.name as patient_name, p.contact_number as patient_phone
       FROM bills b
       LEFT JOIN patients p ON b.patient_id = p.id
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
    
    // Create Razorpay order
    const orderData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: billId,
      notes: {
        bill_id: billId,
        patient_name: bill.patient_name,
        hospital: 'Arogya Hospital'
      }
    };
    
    // Mock Razorpay order creation (replace with actual Razorpay API call)
    const razorpayOrder = {
      id: `order_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      entity: 'order',
      amount: orderData.amount,
      amount_paid: 0,
      amount_due: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000)
    };
    
    // Update bill with Razorpay order ID
    await connection.execute(
      `UPDATE bills SET razorpay_order_id = ?, updated_at = NOW() WHERE bill_id = ?`,
      [razorpayOrder.id, billId]
    );
    
    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      key: RAZORPAY_KEY_ID,
      bill: {
        id: bill.bill_id,
        amount: bill.final_amount,
        patient_name: bill.patient_name,
        patient_phone: bill.patient_phone
      }
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create payment order' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT - Verify Razorpay payment
export async function PUT(request: NextRequest) {
  let connection;
  
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      billId 
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !billId) {
      return NextResponse.json(
        { message: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    connection = await getConnection();
    await connection.beginTransaction();
    
    if (isAuthentic) {
      // Update bill status to paid
      await connection.execute(
        `UPDATE bills 
         SET payment_status = 'paid', payment_method = 'razorpay', 
             razorpay_payment_id = ?, updated_at = NOW()
         WHERE bill_id = ?`,
        [razorpay_payment_id, billId]
      );
      
      // Create payment record
      const paymentId = `PAY${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
      
      const [billData] = await connection.execute(
        `SELECT id, final_amount FROM bills WHERE bill_id = ?`,
        [billId]
      );
      
      if (billData.length > 0) {
        await connection.execute(
          `INSERT INTO payments (
            payment_id, bill_id, amount, payment_method, payment_status,
            razorpay_order_id, razorpay_payment_id, razorpay_signature,
            payment_date, created_by
          ) VALUES (?, ?, ?, 'razorpay', 'success', ?, ?, ?, NOW(), 1)`,
          [
            paymentId, billData[0].id, billData[0].final_amount,
            razorpay_order_id, razorpay_payment_id, razorpay_signature
          ]
        );
      }
      
      await connection.commit();
      
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId
      });
    } else {
      await connection.rollback();
      return NextResponse.json(
        { message: 'Payment verification failed' },
        { status: 400 }
      );
    }

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { message: 'Payment verification failed' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
