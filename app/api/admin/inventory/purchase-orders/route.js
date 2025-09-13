// Purchase Order Management API
// app/api/admin/inventory/purchase-orders/route.js

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

// GET - Get purchase orders
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const connection = await mysql.createConnection(dbConfig);
    
    let query = `
      SELECT po.*, 
             COUNT(poi.id) as item_count,
             SUM(poi.total_price) as total_amount,
             GROUP_CONCAT(m.name SEPARATOR ', ') as medicines
      FROM purchase_orders po
      LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
      LEFT JOIN medicines m ON poi.medicine_id = m.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND po.status = ?';
      params.push(status);
    }
    
    query += ' GROUP BY po.id ORDER BY po.created_at DESC';
    
    const [orders] = await connection.execute(query, params);
    
    await connection.end();

    return NextResponse.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Create purchase order
export async function POST(request) {
  try {
    const body = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    // Generate order ID
    const orderId = `PO${Date.now().toString().slice(-8)}`;

    // Start transaction
    await connection.beginTransaction();

    try {
      // Insert purchase order
      const [orderResult] = await connection.execute(`
        INSERT INTO purchase_orders (
          order_id, supplier_id, order_date, expected_delivery_date, 
          status, total_amount, notes, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        orderId,
        body.supplier_id,
        body.order_date || new Date().toISOString().split('T')[0],
        body.expected_delivery_date || null,
        'pending',
        parseFloat(body.total_amount || 0),
        body.notes || '',
        body.created_by || 1
      ]);

      const orderInsertId = orderResult.insertId;

      // Insert purchase order items
      if (body.items && body.items.length > 0) {
        for (const item of body.items) {
          await connection.execute(`
            INSERT INTO purchase_order_items (
              purchase_order_id, medicine_id, quantity, unit_price, 
              total_price, batch_number, expiry_date, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `, [
            orderInsertId,
            item.medicine_id,
            parseInt(item.quantity),
            parseFloat(item.unit_price),
            parseFloat(item.total_price),
            item.batch_number || '',
            item.expiry_date || null
          ]);
        }
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Purchase order created successfully',
        data: {
          order_id: orderId,
          id: orderInsertId
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update purchase order status
export async function PUT(request) {
  try {
    const body = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(`
      UPDATE purchase_orders SET 
        status = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      body.status,
      body.id
    ]);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Purchase order updated successfully'
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
