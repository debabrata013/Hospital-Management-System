// Pharmacy API - Reports and Analytics
// GET /api/pharmacy/reports - Get pharmacy reports and analytics

import { NextRequest, NextResponse } from 'next/server';
const { executeQuery, dbUtils } = require('@/lib/mysql-connection');

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const reportType = searchParams.get('type') || 'overview';
    const dateFrom = searchParams.get('dateFrom') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateTo = searchParams.get('dateTo') || new Date().toISOString().split('T')[0];
    const category = searchParams.get('category');
    const doctorId = searchParams.get('doctorId');
    
    switch (reportType) {
      case 'overview':
        return await getOverviewReport(dateFrom, dateTo);
      case 'sales':
        return await getSalesReport(dateFrom, dateTo, category, doctorId);
      case 'inventory':
        return await getInventoryReport();
      case 'prescriptions':
        return await getPrescriptionReport(dateFrom, dateTo, doctorId);
      case 'expiry':
        return await getExpiryReport();
      case 'financial':
        return await getFinancialReport(dateFrom, dateTo);
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid report type'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error generating pharmacy reports:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate reports'
    }, { status: 500 });
  }
}

// Overview Report
async function getOverviewReport(dateFrom: string, dateTo: string) {
  // Key metrics
  const metricsQuery = `
    SELECT 
      COUNT(DISTINCT p.id) as total_prescriptions,
      COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_prescriptions,
      COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_prescriptions,
      SUM(p.total_amount) as total_prescription_value,
      SUM(CASE WHEN p.status = 'completed' THEN p.total_amount ELSE 0 END) as completed_value,
      COUNT(DISTINCT p.patient_id) as unique_patients,
      COUNT(DISTINCT p.doctor_id) as prescribing_doctors,
      AVG(p.total_amount) as avg_prescription_value
    FROM prescriptions p
    WHERE p.prescription_date BETWEEN ? AND ?
  `;
  
  const metrics = await executeQuery(metricsQuery, [dateFrom, dateTo]);
  
  // Stock metrics
  const stockMetricsQuery = `
    SELECT 
      COUNT(*) as total_medicines,
      SUM(current_stock * unit_price) as total_stock_value,
      COUNT(CASE WHEN current_stock <= minimum_stock THEN 1 END) as low_stock_items,
      COUNT(CASE WHEN expiry_date <= CURDATE() THEN 1 END) as expired_items,
      COUNT(CASE WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND expiry_date > CURDATE() THEN 1 END) as expiring_soon_items
    FROM medicines
    WHERE is_active = 1
  `;
  
  const stockMetrics = await executeQuery(stockMetricsQuery);
  
  // Daily prescription trend
  const trendQuery = `
    SELECT 
      DATE(p.prescription_date) as date,
      COUNT(*) as prescription_count,
      SUM(p.total_amount) as daily_value,
      COUNT(DISTINCT p.patient_id) as unique_patients
    FROM prescriptions p
    WHERE p.prescription_date BETWEEN ? AND ?
    GROUP BY DATE(p.prescription_date)
    ORDER BY date DESC
    LIMIT 30
  `;
  
  const trend = await executeQuery(trendQuery, [dateFrom, dateTo]);
  
  // Top medicines by prescription frequency
  const topMedicinesQuery = `
    SELECT 
      m.name,
      m.generic_name,
      m.category,
      COUNT(pm.id) as prescription_count,
      SUM(pm.quantity) as total_quantity,
      SUM(pm.total_price) as total_value,
      m.current_stock
    FROM prescription_medications pm
    JOIN medicines m ON pm.medicine_id = m.id
    JOIN prescriptions p ON pm.prescription_id = p.id
    WHERE p.prescription_date BETWEEN ? AND ?
    GROUP BY m.id
    ORDER BY prescription_count DESC
    LIMIT 10
  `;
  
  const topMedicines = await executeQuery(topMedicinesQuery, [dateFrom, dateTo]);
  
  // Category-wise analysis
  const categoryAnalysisQuery = `
    SELECT 
      m.category,
      COUNT(DISTINCT m.id) as medicine_count,
      COUNT(pm.id) as prescription_count,
      SUM(pm.total_price) as total_value,
      AVG(pm.total_price) as avg_value,
      SUM(m.current_stock * m.unit_price) as stock_value
    FROM medicines m
    LEFT JOIN prescription_medications pm ON m.id = pm.medicine_id
    LEFT JOIN prescriptions p ON pm.prescription_id = p.id AND p.prescription_date BETWEEN ? AND ?
    WHERE m.is_active = 1 AND m.category IS NOT NULL
    GROUP BY m.category
    ORDER BY total_value DESC
  `;
  
  const categoryAnalysis = await executeQuery(categoryAnalysisQuery, [dateFrom, dateTo]);
  
  return NextResponse.json({
    success: true,
    data: {
      metrics: metrics[0],
      stock_metrics: stockMetrics[0],
      daily_trend: trend,
      top_medicines: topMedicines,
      category_analysis: categoryAnalysis,
      report_period: { from: dateFrom, to: dateTo }
    }
  });
}

// Sales Report
async function getSalesReport(dateFrom: string, dateTo: string, category?: string, doctorId?: string) {
  let whereConditions = ['p.prescription_date BETWEEN ? AND ?'];
  let queryParams = [dateFrom, dateTo];
  
  if (category) {
    whereConditions.push('m.category = ?');
    queryParams.push(category);
  }
  
  if (doctorId) {
    whereConditions.push('p.doctor_id = ?');
    queryParams.push(doctorId);
  }
  
  const whereClause = whereConditions.join(' AND ');
  
  // Sales summary
  const salesSummaryQuery = `
    SELECT 
      COUNT(DISTINCT p.id) as total_prescriptions,
      COUNT(pm.id) as total_items_sold,
      SUM(pm.quantity) as total_quantity,
      SUM(pm.total_price) as total_sales_value,
      AVG(pm.total_price) as avg_item_value,
      COUNT(DISTINCT p.patient_id) as unique_customers,
      COUNT(DISTINCT p.doctor_id) as prescribing_doctors
    FROM prescriptions p
    JOIN prescription_medications pm ON p.id = pm.prescription_id
    JOIN medicines m ON pm.medicine_id = m.id
    WHERE ${whereClause} AND pm.is_dispensed = 1
  `;
  
  const salesSummary = await executeQuery(salesSummaryQuery, queryParams);
  
  // Daily sales trend
  const dailySalesQuery = `
    SELECT 
      DATE(p.prescription_date) as date,
      COUNT(DISTINCT p.id) as prescriptions,
      COUNT(pm.id) as items_sold,
      SUM(pm.quantity) as quantity_sold,
      SUM(pm.total_price) as daily_sales
    FROM prescriptions p
    JOIN prescription_medications pm ON p.id = pm.prescription_id
    JOIN medicines m ON pm.medicine_id = m.id
    WHERE ${whereClause} AND pm.is_dispensed = 1
    GROUP BY DATE(p.prescription_date)
    ORDER BY date DESC
  `;
  
  const dailySales = await executeQuery(dailySalesQuery, queryParams);
  
  // Top selling medicines
  const topSellingQuery = `
    SELECT 
      m.name,
      m.generic_name,
      m.category,
      COUNT(pm.id) as times_prescribed,
      SUM(pm.quantity) as total_quantity_sold,
      SUM(pm.total_price) as total_sales_value,
      AVG(pm.unit_price) as avg_selling_price,
      m.unit_price as current_price
    FROM prescriptions p
    JOIN prescription_medications pm ON p.id = pm.prescription_id
    JOIN medicines m ON pm.medicine_id = m.id
    WHERE ${whereClause} AND pm.is_dispensed = 1
    GROUP BY m.id
    ORDER BY total_sales_value DESC
    LIMIT 20
  `;
  
  const topSelling = await executeQuery(topSellingQuery, queryParams);
  
  // Doctor-wise prescription analysis
  const doctorAnalysisQuery = `
    SELECT 
      u.name as doctor_name,
      u.specialization,
      COUNT(DISTINCT p.id) as prescriptions_count,
      COUNT(pm.id) as items_prescribed,
      SUM(pm.total_price) as total_value,
      AVG(p.total_amount) as avg_prescription_value
    FROM prescriptions p
    JOIN prescription_medications pm ON p.id = pm.prescription_id
    JOIN medicines m ON pm.medicine_id = m.id
    JOIN users u ON p.doctor_id = u.id
    WHERE ${whereClause}
    GROUP BY p.doctor_id
    ORDER BY total_value DESC
    LIMIT 15
  `;
  
  const doctorAnalysis = await executeQuery(doctorAnalysisQuery, queryParams);
  
  return NextResponse.json({
    success: true,
    data: {
      sales_summary: salesSummary[0],
      daily_sales: dailySales,
      top_selling_medicines: topSelling,
      doctor_analysis: doctorAnalysis,
      filters: { category, doctorId },
      report_period: { from: dateFrom, to: dateTo }
    }
  });
}

// Inventory Report
async function getInventoryReport() {
  // Stock overview
  const stockOverviewQuery = `
    SELECT 
      COUNT(*) as total_medicines,
      SUM(current_stock * unit_price) as total_stock_value,
      COUNT(CASE WHEN current_stock <= minimum_stock THEN 1 END) as low_stock_count,
      COUNT(CASE WHEN current_stock = 0 THEN 1 END) as out_of_stock_count,
      COUNT(CASE WHEN current_stock > maximum_stock THEN 1 END) as overstock_count,
      AVG(current_stock) as avg_stock_level
    FROM medicines
    WHERE is_active = 1
  `;
  
  const stockOverview = await executeQuery(stockOverviewQuery);
  
  // Category-wise stock analysis
  const categoryStockQuery = `
    SELECT 
      category,
      COUNT(*) as medicine_count,
      SUM(current_stock) as total_stock,
      SUM(current_stock * unit_price) as stock_value,
      COUNT(CASE WHEN current_stock <= minimum_stock THEN 1 END) as low_stock_items,
      AVG(current_stock) as avg_stock
    FROM medicines
    WHERE is_active = 1 AND category IS NOT NULL
    GROUP BY category
    ORDER BY stock_value DESC
  `;
  
  const categoryStock = await executeQuery(categoryStockQuery);
  
  // Low stock alerts
  const lowStockQuery = `
    SELECT 
      medicine_id,
      name,
      generic_name,
      category,
      current_stock,
      minimum_stock,
      maximum_stock,
      unit_price,
      (current_stock * unit_price) as current_value,
      ((minimum_stock * 2) - current_stock) as suggested_order_quantity,
      (((minimum_stock * 2) - current_stock) * unit_price) as suggested_order_value
    FROM medicines
    WHERE is_active = 1 AND current_stock <= minimum_stock
    ORDER BY 
      CASE WHEN current_stock = 0 THEN 1 ELSE 2 END,
      (minimum_stock - current_stock) DESC
  `;
  
  const lowStock = await executeQuery(lowStockQuery);
  
  // Fast moving items (based on last 30 days)
  const fastMovingQuery = `
    SELECT 
      m.name,
      m.generic_name,
      m.category,
      m.current_stock,
      m.minimum_stock,
      COUNT(pm.id) as prescription_frequency,
      SUM(pm.quantity) as total_dispensed,
      AVG(pm.quantity) as avg_quantity_per_prescription,
      (SUM(pm.quantity) / 30) as daily_consumption_rate,
      CASE 
        WHEN m.current_stock / (SUM(pm.quantity) / 30) < 7 THEN 'Critical'
        WHEN m.current_stock / (SUM(pm.quantity) / 30) < 15 THEN 'Low'
        ELSE 'Good'
      END as stock_status_prediction
    FROM medicines m
    JOIN prescription_medications pm ON m.id = pm.medicine_id
    JOIN prescriptions p ON pm.prescription_id = p.id
    WHERE p.prescription_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      AND pm.is_dispensed = 1
      AND m.is_active = 1
    GROUP BY m.id
    HAVING total_dispensed > 0
    ORDER BY daily_consumption_rate DESC
    LIMIT 20
  `;
  
  const fastMoving = await executeQuery(fastMovingQuery);
  
  // Slow moving items
  const slowMovingQuery = `
    SELECT 
      m.name,
      m.generic_name,
      m.category,
      m.current_stock,
      m.unit_price,
      (m.current_stock * m.unit_price) as stock_value,
      COALESCE(SUM(pm.quantity), 0) as total_dispensed_30_days,
      m.expiry_date,
      DATEDIFF(m.expiry_date, CURDATE()) as days_to_expiry
    FROM medicines m
    LEFT JOIN prescription_medications pm ON m.id = pm.medicine_id
    LEFT JOIN prescriptions p ON pm.prescription_id = p.id 
      AND p.prescription_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      AND pm.is_dispensed = 1
    WHERE m.is_active = 1 AND m.current_stock > 0
    GROUP BY m.id
    HAVING total_dispensed_30_days <= 2
    ORDER BY stock_value DESC, days_to_expiry ASC
    LIMIT 20
  `;
  
  const slowMoving = await executeQuery(slowMovingQuery);
  
  return NextResponse.json({
    success: true,
    data: {
      stock_overview: stockOverview[0],
      category_analysis: categoryStock,
      low_stock_alerts: lowStock,
      fast_moving_items: fastMoving,
      slow_moving_items: slowMoving
    }
  });
}

// Prescription Report
async function getPrescriptionReport(dateFrom: string, dateTo: string, doctorId?: string) {
  let whereConditions = ['p.prescription_date BETWEEN ? AND ?'];
  let queryParams = [dateFrom, dateTo];
  
  if (doctorId) {
    whereConditions.push('p.doctor_id = ?');
    queryParams.push(doctorId);
  }
  
  const whereClause = whereConditions.join(' AND ');
  
  // Prescription summary
  const summaryQuery = `
    SELECT 
      COUNT(*) as total_prescriptions,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_prescriptions,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_prescriptions,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_prescriptions,
      AVG(total_amount) as avg_prescription_value,
      SUM(total_amount) as total_prescription_value,
      COUNT(DISTINCT patient_id) as unique_patients,
      COUNT(DISTINCT doctor_id) as prescribing_doctors
    FROM prescriptions p
    WHERE ${whereClause}
  `;
  
  const summary = await executeQuery(summaryQuery, queryParams);
  
  // Most prescribed medicines
  const mostPrescribedQuery = `
    SELECT 
      m.name,
      m.generic_name,
      m.category,
      COUNT(pm.id) as prescription_count,
      SUM(pm.quantity) as total_quantity,
      COUNT(DISTINCT p.patient_id) as unique_patients,
      COUNT(DISTINCT p.doctor_id) as prescribing_doctors,
      AVG(pm.quantity) as avg_quantity_per_prescription
    FROM prescriptions p
    JOIN prescription_medications pm ON p.id = pm.prescription_id
    JOIN medicines m ON pm.medicine_id = m.id
    WHERE ${whereClause}
    GROUP BY m.id
    ORDER BY prescription_count DESC
    LIMIT 15
  `;
  
  const mostPrescribed = await executeQuery(mostPrescribedQuery, queryParams);
  
  // Prescription patterns by day of week
  const dayPatternQuery = `
    SELECT 
      DAYNAME(prescription_date) as day_name,
      DAYOFWEEK(prescription_date) as day_number,
      COUNT(*) as prescription_count,
      AVG(total_amount) as avg_value
    FROM prescriptions p
    WHERE ${whereClause}
    GROUP BY DAYOFWEEK(prescription_date), DAYNAME(prescription_date)
    ORDER BY day_number
  `;
  
  const dayPattern = await executeQuery(dayPatternQuery, queryParams);
  
  return NextResponse.json({
    success: true,
    data: {
      summary: summary[0],
      most_prescribed_medicines: mostPrescribed,
      day_wise_pattern: dayPattern,
      filters: { doctorId },
      report_period: { from: dateFrom, to: dateTo }
    }
  });
}

// Expiry Report
async function getExpiryReport() {
  // Expiry overview
  const expiryOverviewQuery = `
    SELECT 
      COUNT(CASE WHEN expiry_date <= CURDATE() THEN 1 END) as expired_count,
      COUNT(CASE WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND expiry_date > CURDATE() THEN 1 END) as expiring_30_days,
      COUNT(CASE WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY) AND expiry_date > DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as expiring_90_days,
      SUM(CASE WHEN expiry_date <= CURDATE() THEN current_stock * unit_price ELSE 0 END) as expired_value,
      SUM(CASE WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND expiry_date > CURDATE() THEN current_stock * unit_price ELSE 0 END) as expiring_30_days_value
    FROM medicines
    WHERE is_active = 1
  `;
  
  const expiryOverview = await executeQuery(expiryOverviewQuery);
  
  // Detailed expiry list
  const expiryDetailsQuery = `
    SELECT 
      medicine_id,
      name,
      generic_name,
      category,
      batch_number,
      expiry_date,
      current_stock,
      unit_price,
      (current_stock * unit_price) as stock_value,
      DATEDIFF(expiry_date, CURDATE()) as days_to_expiry,
      CASE 
        WHEN expiry_date <= CURDATE() THEN 'Expired'
        WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expiring Soon'
        WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY) THEN 'Expiring Later'
        ELSE 'Good'
      END as expiry_status
    FROM medicines
    WHERE is_active = 1 
      AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)
      AND current_stock > 0
    ORDER BY expiry_date ASC
  `;
  
  const expiryDetails = await executeQuery(expiryDetailsQuery);
  
  return NextResponse.json({
    success: true,
    data: {
      expiry_overview: expiryOverview[0],
      expiry_details: expiryDetails
    }
  });
}

// Financial Report
async function getFinancialReport(dateFrom: string, dateTo: string) {
  // Revenue analysis
  const revenueQuery = `
    SELECT 
      SUM(pm.total_price) as total_revenue,
      COUNT(DISTINCT p.id) as total_prescriptions,
      COUNT(pm.id) as total_items_sold,
      AVG(p.total_amount) as avg_prescription_value,
      SUM(pm.quantity * m.unit_price) as cost_of_goods_sold,
      (SUM(pm.total_price) - SUM(pm.quantity * m.unit_price)) as gross_profit,
      ((SUM(pm.total_price) - SUM(pm.quantity * m.unit_price)) / SUM(pm.total_price) * 100) as gross_profit_margin
    FROM prescriptions p
    JOIN prescription_medications pm ON p.id = pm.prescription_id
    JOIN medicines m ON pm.medicine_id = m.id
    WHERE p.prescription_date BETWEEN ? AND ?
      AND pm.is_dispensed = 1
  `;
  
  const revenue = await executeQuery(revenueQuery, [dateFrom, dateTo]);
  
  // Monthly trend
  const monthlyTrendQuery = `
    SELECT 
      DATE_FORMAT(p.prescription_date, '%Y-%m') as month,
      COUNT(DISTINCT p.id) as prescriptions,
      SUM(pm.total_price) as revenue,
      COUNT(pm.id) as items_sold,
      AVG(p.total_amount) as avg_prescription_value
    FROM prescriptions p
    JOIN prescription_medications pm ON p.id = pm.prescription_id
    WHERE p.prescription_date BETWEEN ? AND ?
      AND pm.is_dispensed = 1
    GROUP BY DATE_FORMAT(p.prescription_date, '%Y-%m')
    ORDER BY month DESC
  `;
  
  const monthlyTrend = await executeQuery(monthlyTrendQuery, [dateFrom, dateTo]);
  
  return NextResponse.json({
    success: true,
    data: {
      revenue_analysis: revenue[0],
      monthly_trend: monthlyTrend,
      report_period: { from: dateFrom, to: dateTo }
    }
  });
}
