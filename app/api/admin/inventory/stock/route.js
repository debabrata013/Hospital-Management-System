// Stock Management API
// app/api/admin/inventory/stock/route.js

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

// GET - Get stock transactions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const medicineId = searchParams.get('medicine_id');
    const type = searchParams.get('type');
    
    const connection = await mysql.createConnection(dbConfig);
    
    let query = `
      SELECT st.*, m.name as medicine_name, m.category 
      FROM medicine_stock_transactions st
      LEFT JOIN medicines m ON st.medicine_id = m.id
      WHERE 1=1
    `;
    const params = [];
    
    if (medicineId) {
      query += ' AND st.medicine_id = ?';
      params.push(medicineId);
    }
    
    if (type) {
      query += ' AND st.transaction_type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY st.created_at DESC';
    
    const [transactions] = await connection.execute(query, params);
    
    await connection.end();

    return NextResponse.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Add stock transaction (IN/OUT/ADJUSTMENT)
export async function POST(request) {
  try {
    const body = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    // Generate transaction ID
    const transactionId = `TXN${Date.now().toString().slice(-8)}`;

    // Start transaction
    await connection.beginTransaction();

    try {
      // Insert stock transaction
      const [result] = await connection.execute(`
        INSERT INTO medicine_stock_transactions (
          transaction_id, medicine_id, transaction_type, quantity, unit_price, 
          total_amount, batch_number, expiry_date, supplier, reference_number, 
          notes, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        transactionId,
        body.medicine_id,
        body.transaction_type,
        parseInt(body.quantity),
        parseFloat(body.unit_price || 0),
        parseFloat(body.total_amount || 0),
        body.batch_number || '',
        body.expiry_date || null,
        body.supplier || '',
        body.reference_number || '',
        body.notes || '',
        body.created_by || 1
      ]);

      // Update medicine stock
      let stockUpdateQuery = '';
      if (body.transaction_type === 'IN') {
        stockUpdateQuery = 'UPDATE medicines SET current_stock = current_stock + ? WHERE id = ?';
      } else if (body.transaction_type === 'OUT') {
        stockUpdateQuery = 'UPDATE medicines SET current_stock = current_stock - ? WHERE id = ?';
      } else if (body.transaction_type === 'ADJUSTMENT') {
        stockUpdateQuery = 'UPDATE medicines SET current_stock = ? WHERE id = ?';
      }

      if (stockUpdateQuery) {
        await connection.execute(stockUpdateQuery, [
          body.transaction_type === 'ADJUSTMENT' ? parseInt(body.quantity) : parseInt(body.quantity),
          body.medicine_id
        ]);
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Stock transaction recorded successfully',
        data: {
          transaction_id: transactionId,
          id: result.insertId
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
