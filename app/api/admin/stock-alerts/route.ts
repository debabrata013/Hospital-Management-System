import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Fetch medicines with low stock
    const [stockAlertsResult] = await connection.execute(`
      SELECT 
        id,
        medicine_id,
        name,
        generic_name,
        category,
        current_stock,
        minimum_stock,
        maximum_stock,
        unit_price,
        expiry_date,
        supplier
      FROM medicines 
      WHERE current_stock <= minimum_stock 
        AND is_active = 1
      ORDER BY (minimum_stock - current_stock) DESC
      LIMIT 10
    `);

    const stockAlerts = stockAlertsResult.map((item: any) => ({
      id: item.id,
      name: item.name || item.generic_name || 'Unknown Medicine',
      quantity: item.current_stock || 0,
      lowStockThreshold: item.minimum_stock || 10,
      category: item.category || 'General',
      unitPrice: item.unit_price || 0,
      expiryDate: item.expiry_date,
      supplier: item.supplier,
      urgency: item.current_stock === 0 ? 'critical' : 
               item.current_stock <= (item.minimum_stock * 0.5) ? 'high' : 'medium'
    }));

    await connection.end();

    return NextResponse.json(stockAlerts);

  } catch (error) {
    console.error('Stock alerts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { medicineId, quantity, supplier, batchNumber, expiryDate, unitPrice } = body;

    const connection = await mysql.createConnection(dbConfig);

    // Start transaction
    await connection.beginTransaction();

    try {
      // Add stock to existing medicine
      const [updateResult] = await connection.execute(`
        UPDATE medicines 
        SET current_stock = current_stock + ?,
            updated_at = NOW()
        WHERE id = ?
      `, [quantity, medicineId]);

      if (updateResult.affectedRows === 0) {
        throw new Error('Medicine not found');
      }

      // Log the stock addition
      await connection.execute(`
        INSERT INTO stock_movements (
          medicine_id,
          movement_type,
          quantity,
          supplier,
          batch_number,
          expiry_date,
          unit_price,
          created_at
        ) VALUES (?, 'restock', ?, ?, ?, ?, ?, NOW())
      `, [medicineId, quantity, supplier, batchNumber, expiryDate, unitPrice]);

      await connection.commit();
      await connection.end();

      return NextResponse.json({
        success: true,
        message: 'Stock updated successfully',
        newQuantity: quantity
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Stock update error:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}
