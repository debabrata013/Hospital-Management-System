// Complete Inventory Management API
// app/api/admin/inventory/route.js

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

// GET - Fetch inventory data with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const criticalOnly = searchParams.get('critical') === 'true';
    const expiringOnly = searchParams.get('expiring') === 'true';
    
    const connection = await mysql.createConnection(dbConfig);
    
    let totalItems = 0;
    let criticalStock = 0;
    let expiringSoon = 0;
    let totalValue = 0;
    let inventory = [];

    // Build query with filters
    let query = 'SELECT * FROM medicines WHERE is_active = 1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR category LIKE ? OR supplier LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (criticalOnly) {
      query += ' AND current_stock <= minimum_stock';
    }
    
    if (expiringOnly) {
      query += ' AND expiry_date IS NOT NULL AND expiry_date <= DATE_ADD(NOW(), INTERVAL 30 DAY)';
    }
    
    query += ' ORDER BY name ASC';
    
    const [medicines] = await connection.execute(query, params);
    
    medicines.forEach(med => {
      const qty = parseInt(med.current_stock || 0);
      const price = parseFloat(med.unit_price || 0);
      const value = qty * price;
      
      totalItems += qty;
      totalValue += value;
      
      // Check for critical stock
      if (med.minimum_stock && qty <= med.minimum_stock) {
        criticalStock += qty;
      }
      
      // Check for expiring items (within 30 days)
      if (med.expiry_date) {
        const expiryDate = new Date(med.expiry_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
          expiringSoon += qty;
        }
      }
      
      inventory.push({
        id: med.id,
        medicine_id: med.medicine_id,
        name: med.name,
        generic_name: med.generic_name,
        brand_name: med.brand_name,
        category: med.category,
        strength: med.strength,
        dosage_form: med.dosage_form,
        current_stock: qty,
        minimum_stock: med.minimum_stock,
        maximum_stock: med.maximum_stock,
        unit_price: price,
        mrp: parseFloat(med.mrp || 0),
        total_value: value,
        expiry_date: med.expiry_date,
        batch_number: med.batch_number,
        supplier: med.supplier,
        manufacturer: med.manufacturer,
        is_critical: med.minimum_stock && qty <= med.minimum_stock,
        is_expiring: med.expiry_date ? (() => {
          const expiryDate = new Date(med.expiry_date);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
        })() : false,
        created_at: med.created_at,
        updated_at: med.updated_at
      });
    });

    // Get categories for filter dropdown
    const [categories] = await connection.execute('SELECT DISTINCT category FROM medicines WHERE is_active = 1 AND category IS NOT NULL ORDER BY category');

    await connection.end();

    return NextResponse.json({
      success: true,
      data: {
        totalItems,
        criticalStock,
        expiringSoon,
        totalValue,
        inventory,
        categories: categories.map(cat => cat.category),
        summary: {
          totalItems: totalItems.toLocaleString(),
          criticalStock: criticalStock.toLocaleString(),
          expiringSoon: expiringSoon.toLocaleString(),
          totalValue: `₹${(totalValue / 100000).toFixed(1)}L`
        }
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

// POST - Add new medicine
export async function POST(request) {
  try {
    const body = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    // Generate unique medicine ID
    const medicineId = `MED${Date.now().toString().slice(-8)}`;

    // Insert new medicine
    const [result] = await connection.execute(`
      INSERT INTO medicines (
        medicine_id, name, generic_name, brand_name, category, manufacturer,
        composition, strength, dosage_form, pack_size, unit_price, mrp,
        current_stock, minimum_stock, maximum_stock, expiry_date, batch_number,
        supplier, storage_conditions, side_effects, contraindications,
        drug_interactions, pregnancy_category, prescription_required, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      medicineId,
      body.name || '',
      body.generic_name || '',
      body.brand_name || '',
      body.category || '',
      body.manufacturer || '',
      body.composition || '',
      body.strength || '',
      body.dosage_form || 'tablet',
      body.pack_size || '',
      parseFloat(body.unit_price || 0),
      parseFloat(body.mrp || 0),
      parseInt(body.current_stock || 0),
      parseInt(body.minimum_stock || 10),
      parseInt(body.maximum_stock || 1000),
      body.expiry_date || null,
      body.batch_number || '',
      body.supplier || '',
      body.storage_conditions || '',
      body.side_effects || '',
      body.contraindications || '',
      body.drug_interactions || '',
      body.pregnancy_category || 'Unknown',
      body.prescription_required !== false ? 1 : 0,
      1
    ]);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Medicine added successfully',
      data: {
        id: result.insertId,
        medicine_id: medicineId
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

// PUT - Update medicine
export async function PUT(request) {
  try {
    const body = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(`
      UPDATE medicines SET 
        name = ?, generic_name = ?, brand_name = ?, category = ?, manufacturer = ?,
        composition = ?, strength = ?, dosage_form = ?, pack_size = ?, unit_price = ?, mrp = ?,
        current_stock = ?, minimum_stock = ?, maximum_stock = ?, expiry_date = ?, batch_number = ?,
        supplier = ?, storage_conditions = ?, side_effects = ?, contraindications = ?,
        drug_interactions = ?, pregnancy_category = ?, prescription_required = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      body.name || '',
      body.generic_name || '',
      body.brand_name || '',
      body.category || '',
      body.manufacturer || '',
      body.composition || '',
      body.strength || '',
      body.dosage_form || 'tablet',
      body.pack_size || '',
      parseFloat(body.unit_price || 0),
      parseFloat(body.mrp || 0),
      parseInt(body.current_stock || 0),
      parseInt(body.minimum_stock || 10),
      parseInt(body.maximum_stock || 1000),
      body.expiry_date || null,
      body.batch_number || '',
      body.supplier || '',
      body.storage_conditions || '',
      body.side_effects || '',
      body.contraindications || '',
      body.drug_interactions || '',
      body.pregnancy_category || 'Unknown',
      body.prescription_required !== false ? 1 : 0,
      body.id
    ]);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Medicine updated successfully'
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete medicine
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Medicine ID is required'
      }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Soft delete by setting is_active to 0
    await connection.execute(
      'UPDATE medicines SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Medicine deleted successfully'
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}