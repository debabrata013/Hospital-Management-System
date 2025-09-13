// Vendor Management API
// app/api/admin/inventory/vendors/route.js

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

// GET - Get all vendors
export async function GET(request) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [vendors] = await connection.execute(`
      SELECT vs.*, 
             COUNT(DISTINCT m.id) as medicine_count,
             COUNT(DISTINCT st.id) as transaction_count,
             SUM(CASE WHEN st.transaction_type = 'IN' THEN st.total_amount ELSE 0 END) as total_purchases
      FROM medicine_suppliers vs
      LEFT JOIN medicines m ON vs.name = m.supplier
      LEFT JOIN medicine_stock_transactions st ON vs.name = st.supplier
      WHERE vs.is_active = 1
      GROUP BY vs.id
      ORDER BY vs.name ASC
    `);
    
    await connection.end();

    return NextResponse.json({
      success: true,
      data: vendors
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Add new vendor
export async function POST(request) {
  try {
    const body = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    // Generate supplier ID
    const supplierId = `SUP${Date.now().toString().slice(-8)}`;

    const [result] = await connection.execute(`
      INSERT INTO medicine_suppliers (
        supplier_id, name, contact_person, phone, email, address, city, state, 
        pincode, gst_number, license_number, payment_terms, credit_limit, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      supplierId,
      body.name || '',
      body.contact_person || '',
      body.phone || '',
      body.email || '',
      body.address || '',
      body.city || '',
      body.state || '',
      body.pincode || '',
      body.gst_number || '',
      body.license_number || '',
      body.payment_terms || '',
      parseFloat(body.credit_limit || 0)
    ]);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Vendor added successfully',
      data: {
        id: result.insertId,
        supplier_id: supplierId
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update vendor
export async function PUT(request) {
  try {
    const body = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(`
      UPDATE medicine_suppliers SET 
        name = ?, contact_person = ?, phone = ?, email = ?, address = ?, 
        city = ?, state = ?, pincode = ?, gst_number = ?, license_number = ?, 
        payment_terms = ?, credit_limit = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      body.name || '',
      body.contact_person || '',
      body.phone || '',
      body.email || '',
      body.address || '',
      body.city || '',
      body.state || '',
      body.pincode || '',
      body.gst_number || '',
      body.license_number || '',
      body.payment_terms || '',
      parseFloat(body.credit_limit || 0),
      body.id
    ]);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Vendor updated successfully'
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete vendor
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Vendor ID is required'
      }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Soft delete by setting is_active to 0
    await connection.execute(
      'UPDATE medicine_suppliers SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Vendor deleted successfully'
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
