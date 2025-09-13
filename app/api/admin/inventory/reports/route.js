// Inventory Reports API
// app/api/admin/inventory/reports/route.js

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

// GET - Generate inventory reports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    const connection = await mysql.createConnection(dbConfig);
    
    let reportData = {};

    switch (reportType) {
      case 'summary':
        reportData = await getSummaryReport(connection);
        break;
      case 'critical':
        reportData = await getCriticalStockReport(connection);
        break;
      case 'expiring':
        reportData = await getExpiringStockReport(connection);
        break;
      case 'transactions':
        reportData = await getTransactionReport(connection, startDate, endDate);
        break;
      case 'category':
        reportData = await getCategoryReport(connection);
        break;
      case 'vendor':
        reportData = await getVendorReport(connection);
        break;
      default:
        reportData = await getSummaryReport(connection);
    }
    
    await connection.end();

    return NextResponse.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

async function getSummaryReport(connection) {
  const [summary] = await connection.execute(`
    SELECT 
      COUNT(*) as total_medicines,
      SUM(current_stock) as total_stock,
      SUM(current_stock * unit_price) as total_value,
      COUNT(CASE WHEN current_stock <= minimum_stock THEN 1 END) as critical_count,
      COUNT(CASE WHEN expiry_date <= DATE_ADD(NOW(), INTERVAL 30 DAY) THEN 1 END) as expiring_count
    FROM medicines 
    WHERE is_active = 1
  `);

  const [categoryBreakdown] = await connection.execute(`
    SELECT 
      category,
      COUNT(*) as medicine_count,
      SUM(current_stock) as total_stock,
      SUM(current_stock * unit_price) as total_value
    FROM medicines 
    WHERE is_active = 1 AND category IS NOT NULL
    GROUP BY category
    ORDER BY total_value DESC
  `);

  return {
    summary: summary[0],
    categoryBreakdown
  };
}

async function getCriticalStockReport(connection) {
  const [critical] = await connection.execute(`
    SELECT 
      medicine_id, name, category, current_stock, minimum_stock, 
      unit_price, supplier, (current_stock * unit_price) as total_value
    FROM medicines 
    WHERE is_active = 1 AND current_stock <= minimum_stock
    ORDER BY (current_stock - minimum_stock) ASC
  `);

  return { critical };
}

async function getExpiringStockReport(connection) {
  const [expiring] = await connection.execute(`
    SELECT 
      medicine_id, name, category, current_stock, expiry_date,
      unit_price, supplier, (current_stock * unit_price) as total_value,
      DATEDIFF(expiry_date, NOW()) as days_until_expiry
    FROM medicines 
    WHERE is_active = 1 AND expiry_date IS NOT NULL 
    AND expiry_date <= DATE_ADD(NOW(), INTERVAL 90 DAY)
    ORDER BY expiry_date ASC
  `);

  return { expiring };
}

async function getTransactionReport(connection, startDate, endDate) {
  let query = `
    SELECT 
      st.transaction_id, st.transaction_type, st.quantity, st.unit_price, 
      st.total_amount, st.created_at, m.name as medicine_name, m.category
    FROM medicine_stock_transactions st
    LEFT JOIN medicines m ON st.medicine_id = m.id
    WHERE 1=1
  `;
  const params = [];

  if (startDate) {
    query += ' AND DATE(st.created_at) >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND DATE(st.created_at) <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY st.created_at DESC';

  const [transactions] = await connection.execute(query, params);

  const [summary] = await connection.execute(`
    SELECT 
      transaction_type,
      COUNT(*) as transaction_count,
      SUM(quantity) as total_quantity,
      SUM(total_amount) as total_amount
    FROM medicine_stock_transactions st
    WHERE 1=1 ${startDate ? 'AND DATE(st.created_at) >= ?' : ''} ${endDate ? 'AND DATE(st.created_at) <= ?' : ''}
    GROUP BY transaction_type
  `, params);

  return { transactions, summary };
}

async function getCategoryReport(connection) {
  const [categories] = await connection.execute(`
    SELECT 
      category,
      COUNT(*) as medicine_count,
      SUM(current_stock) as total_stock,
      AVG(unit_price) as avg_price,
      SUM(current_stock * unit_price) as total_value,
      COUNT(CASE WHEN current_stock <= minimum_stock THEN 1 END) as critical_count
    FROM medicines 
    WHERE is_active = 1 AND category IS NOT NULL
    GROUP BY category
    ORDER BY total_value DESC
  `);

  return { categories };
}

async function getVendorReport(connection) {
  const [vendors] = await connection.execute(`
    SELECT 
      vs.name as vendor_name,
      COUNT(DISTINCT m.id) as medicine_count,
      COUNT(st.id) as transaction_count,
      SUM(CASE WHEN st.transaction_type = 'IN' THEN st.total_amount ELSE 0 END) as total_purchases,
      AVG(CASE WHEN st.transaction_type = 'IN' THEN st.unit_price END) as avg_price
    FROM medicine_suppliers vs
    LEFT JOIN medicines m ON vs.name = m.supplier
    LEFT JOIN medicine_stock_transactions st ON vs.name = st.supplier
    WHERE vs.is_active = 1
    GROUP BY vs.id, vs.name
    ORDER BY total_purchases DESC
  `);

  return { vendors };
}
