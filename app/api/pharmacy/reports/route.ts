/**
 * Pharmacy Reports API Route
 * 
 * This API provides comprehensive reporting capabilities for the pharmacy module.
 * It generates various types of reports including financial summaries, inventory status,
 * prescription analytics, dispensing activity, and system alerts.
 * 
 * Report Types Available:
 * - overview: Dashboard summary with key metrics and statistics
 * - prescriptions: Detailed prescription analytics and trends
 * - dispensing: Medication dispensing activity and patterns
 * - inventory: Stock levels, expiry alerts, and inventory management
 * - financial: Revenue analysis, payment tracking, and financial summaries
 * - alerts: System notifications, stock alerts, and critical updates
 * 
 * Features:
 * - Flexible date range filtering for time-based analysis
 * - Multiple report formats with detailed breakdowns
 * - Real-time data aggregation from multiple database tables
 * - Performance optimized queries with proper indexing
 * - Comprehensive error handling and validation
 * 
 * Query Parameters:
 * - type: Report type (overview, prescriptions, dispensing, inventory, financial, alerts)
 * - startDate: Start date for date-range reports (YYYY-MM-DD format)
 * - endDate: End date for date-range reports (YYYY-MM-DD format)
 * - period: Aggregation period for financial reports (day, week, month, year)
 * 
 * Database Tables Used:
 * - prescriptions: Main prescription records and metadata
 * - prescription_medications: Individual medication items and pricing
 * - prescription_dispensing_log: Dispensing history and audit trail
 * - medicines: Medicine inventory and stock information
 * - patients: Patient demographics for analytics
 * - users: Doctor and pharmacist information
 * 
 * @author Hospital Management System
 * @version 1.0
 * @since 2024-08-26
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-connection';

// Force dynamic rendering to ensure fresh data on each request
// This prevents caching of report data which should always be current
export const dynamic = 'force-dynamic';

/**
 * GET /api/pharmacy/reports - Generate pharmacy reports based on type and parameters
 * 
 * Main endpoint that routes to specific report generation functions based on the
 * requested report type. Handles parameter validation, date range setup, and
 * error management for all report types.
 * 
 * @param request - NextRequest object containing query parameters
 * @returns JSON response with report data or error message
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'overview';        // Default to overview report
    const startDate = searchParams.get('startDate');                  // Optional start date filter
    const endDate = searchParams.get('endDate');                      // Optional end date filter
    const period = searchParams.get('period') || 'month';             // Aggregation period for financial reports

    // Set default date range if not provided (last 30 days)
    // This ensures reports always have a reasonable time frame for analysis
    const dateFrom = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateTo = endDate || new Date().toISOString().split('T')[0];

    // Route to appropriate report generation function based on type
    // Each report type has specialized logic and database queries
    switch (reportType) {
      case 'overview':
        // Dashboard summary with key performance indicators
        return await getOverviewReport(dateFrom, dateTo);
      case 'prescriptions':
        // Detailed prescription analytics and prescription trends
        return await getPrescriptionReport(dateFrom, dateTo);
      case 'dispensing':
        // Medication dispensing activity and pharmacist performance
        return await getDispensingReport(dateFrom, dateTo);
      case 'inventory':
        // Current stock levels, expiry alerts, and inventory status
        return await getInventoryReport();
      case 'financial':
        // Revenue analysis, payment tracking, and financial summaries
        return await getFinancialReport(dateFrom, dateTo, period);
      case 'alerts':
        // System notifications, critical alerts, and action items
        return await getAlertsReport();
      default:
        // Handle invalid report type requests
        return NextResponse.json({
          success: false,
          error: 'Invalid report type'
        }, { status: 400 });
    }

  } catch (error) {
    // Log error for debugging while protecting sensitive information
    console.error('Error generating reports:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate reports'
    }, { status: 500 });
  }
}

/**
 * getOverviewReport - Generate comprehensive dashboard overview
 * 
 * Creates a high-level summary report with key metrics and statistics
 * for pharmacy operations. Includes prescription counts, revenue summaries,
 * stock alerts, and performance indicators.
 * 
 * @param dateFrom - Start date for the report period
 * @param dateTo - End date for the report period
 * @returns Promise<NextResponse> with overview report data
 */
async function getOverviewReport(dateFrom: string, dateTo: string) {
  // Array of parallel queries for efficient data retrieval
  const queries = [
    // Prescription statistics
    `SELECT 
      COUNT(*) as total_prescriptions,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_prescriptions,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_prescriptions,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_prescriptions,
      SUM(total_amount) as total_prescription_value,
      COUNT(DISTINCT patient_id) as unique_patients,
      COUNT(DISTINCT doctor_id) as prescribing_doctors,
      AVG(total_amount) as avg_prescription_value
    FROM prescriptions 
    WHERE prescription_date BETWEEN ? AND ?`,

    // Stock statistics
    `SELECT 
      COUNT(*) as total_medicines,
      SUM(current_stock) as total_stock_quantity,
      SUM(current_stock * unit_price) as total_stock_value,
      SUM(CASE WHEN current_stock <= minimum_stock THEN 1 ELSE 0 END) as low_stock_count,
      SUM(CASE WHEN expiry_date <= CURDATE() THEN 1 ELSE 0 END) as expired_count,
      SUM(CASE WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND expiry_date > CURDATE() THEN 1 ELSE 0 END) as expiring_soon_count
    FROM medicines 
    WHERE is_active = 1`,

    // Top medicines by prescription
    `SELECT 
      m.name as medicine_name,
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
    GROUP BY m.id, m.name, m.generic_name, m.category, m.current_stock
    ORDER BY prescription_count DESC
    LIMIT 10`,

    // Category analysis
    `SELECT 
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
    ORDER BY COALESCE(total_value, 0) DESC`
  ];

  const [prescriptionStats, stockStats, topMedicines, categoryAnalysis] = await Promise.all([
    executeQuery(queries[0], [dateFrom, dateTo]),
    executeQuery(queries[1], []),
    executeQuery(queries[2], [dateFrom, dateTo]),
    executeQuery(queries[3], [dateFrom, dateTo])
  ]);

  return NextResponse.json({
    success: true,
    data: {
      prescription_statistics: prescriptionStats[0],
      stock_statistics: stockStats[0],
      top_dispensed_medicines: topMedicines,
      category_analysis: categoryAnalysis,
      report_period: { from: dateFrom, to: dateTo }
    }
  });
}

// Prescription Report
async function getPrescriptionReport(dateFrom: string, dateTo: string) {
  const queries = [
    // Prescription summary
    `SELECT 
      COUNT(*) as total_prescriptions,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_prescriptions,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_prescriptions,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_prescriptions,
      AVG(total_amount) as average_value,
      SUM(total_amount) as total_value,
      COUNT(DISTINCT patient_id) as unique_patients,
      COUNT(DISTINCT doctor_id) as unique_doctors
    FROM prescriptions 
    WHERE prescription_date BETWEEN ? AND ?`,

    // Detailed prescriptions
    `SELECT 
      p.prescription_id,
      p.prescription_date,
      p.status,
      p.total_amount,
      pt.name as patient_name,
      pt.patient_id as patient_code,
      YEAR(CURDATE()) - YEAR(pt.date_of_birth) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(pt.date_of_birth, '%m%d')) as patient_age,
      pt.gender as patient_gender,
      d.name as doctor_name,
      d.specialization,
      COUNT(pm.id) as total_medications,
      SUM(CASE WHEN pm.is_dispensed = 1 THEN 1 ELSE 0 END) as dispensed_medications,
      CASE 
        WHEN COUNT(pm.id) = SUM(CASE WHEN pm.is_dispensed = 1 THEN 1 ELSE 0 END) THEN 'fully_dispensed'
        WHEN SUM(CASE WHEN pm.is_dispensed = 1 THEN 1 ELSE 0 END) > 0 THEN 'partially_dispensed'
        ELSE 'pending'
      END as dispensing_status,
      p.created_at
    FROM prescriptions p
    JOIN patients pt ON p.patient_id = pt.id
    JOIN users d ON p.doctor_id = d.id
    LEFT JOIN prescription_medications pm ON p.id = pm.prescription_id
    WHERE p.prescription_date BETWEEN ? AND ?
    GROUP BY p.id
    ORDER BY p.created_at DESC`
  ];

  const [summary, prescriptions] = await Promise.all([
    executeQuery(queries[0], [dateFrom, dateTo]),
    executeQuery(queries[1], [dateFrom, dateTo])
  ]);

  return NextResponse.json({
    success: true,
    data: {
      summary: summary[0],
      prescriptions: prescriptions,
      report_period: { from: dateFrom, to: dateTo }
    }
  });
}

// Dispensing Report
async function getDispensingReport(dateFrom: string, dateTo: string) {
  const queries = [
    // Dispensing records
    `SELECT 
      pdl.log_id,
      pdl.action,
      pdl.quantity,
      pdl.total_amount,
      pdl.created_at as dispensed_at,
      p.prescription_id,
      pt.name as patient_name,
      pt.patient_id as patient_code,
      pm.medicine_name,
      pm.generic_name,
      pm.strength,
      pm.dosage_form,
      u.name as pharmacist_name,
      pdl.batch_number,
      pdl.expiry_date
    FROM prescription_dispensing_log pdl
    JOIN prescriptions p ON pdl.prescription_id = p.id
    JOIN patients pt ON p.patient_id = pt.id
    JOIN prescription_medications pm ON pdl.prescription_medication_id = pm.id
    JOIN users u ON pdl.dispensed_by = u.id
    WHERE pdl.action IN ('DISPENSED', 'PARTIAL_DISPENSED') 
      AND DATE(pdl.created_at) BETWEEN ? AND ?
    ORDER BY pdl.created_at DESC`,

    // Pharmacist summary
    `SELECT 
      u.name as pharmacist_name,
      COUNT(*) as total_dispensings,
      SUM(pdl.quantity) as total_quantity,
      SUM(pdl.total_amount) as total_value,
      COUNT(DISTINCT pdl.prescription_id) as unique_prescriptions
    FROM prescription_dispensing_log pdl
    JOIN users u ON pdl.dispensed_by = u.id
    WHERE pdl.action IN ('DISPENSED', 'PARTIAL_DISPENSED') 
      AND DATE(pdl.created_at) BETWEEN ? AND ?
    GROUP BY u.id, u.name
    ORDER BY total_value DESC`
  ];

  const [dispensingRecords, pharmacistSummary] = await Promise.all([
    executeQuery(queries[0], [dateFrom, dateTo]),
    executeQuery(queries[1], [dateFrom, dateTo])
  ]);

  return NextResponse.json({
    success: true,
    data: {
      dispensing_records: dispensingRecords,
      pharmacist_summary: pharmacistSummary,
      total_records: dispensingRecords.length,
      report_period: { from: dateFrom, to: dateTo }
    }
  });
}

// Inventory Report
async function getInventoryReport() {
  const queries = [
    // Stock overview
    `SELECT 
      COUNT(*) as total_medicines,
      SUM(current_stock * unit_price) as total_stock_value,
      COUNT(CASE WHEN current_stock <= minimum_stock THEN 1 END) as low_stock_count,
      COUNT(CASE WHEN current_stock = 0 THEN 1 END) as out_of_stock_count,
      COUNT(CASE WHEN expiry_date <= CURDATE() THEN 1 END) as expired_count,
      COUNT(CASE WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND expiry_date > CURDATE() THEN 1 END) as expiring_soon_count
    FROM medicines
    WHERE is_active = 1`,

    // Stock status details
    `SELECT 
      m.medicine_id,
      m.name,
      m.generic_name,
      m.category,
      m.strength,
      m.dosage_form,
      m.current_stock,
      m.minimum_stock,
      m.maximum_stock,
      m.unit_price,
      m.mrp,
      m.current_stock * m.unit_price as stock_value,
      CASE 
        WHEN m.current_stock <= m.minimum_stock THEN 'low'
        WHEN m.current_stock <= (m.minimum_stock * 1.5) THEN 'medium'
        ELSE 'good'
      END as stock_status,
      CASE 
        WHEN m.expiry_date <= CURDATE() THEN 'expired'
        WHEN m.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expiring_soon'
        WHEN m.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY) THEN 'expiring_later'
        ELSE 'good'
      END as expiry_status,
      m.expiry_date
    FROM medicines m
    WHERE m.is_active = 1
    ORDER BY m.name`
  ];

  const [summary, stockStatus] = await Promise.all([
    executeQuery(queries[0], []),
    executeQuery(queries[1], [])
  ]);

  return NextResponse.json({
    success: true,
    data: {
      summary: summary[0],
      stock_status: stockStatus
    }
  });
}

// Financial Report
async function getFinancialReport(dateFrom: string, dateTo: string, period: string) {
  let groupBy = '';
  let dateFormat = '';

  switch (period) {
    case 'day':
      groupBy = 'DATE(created_at)';
      dateFormat = 'DATE(created_at) as period';
      break;
    case 'week':
      groupBy = 'YEARWEEK(created_at)';
      dateFormat = 'CONCAT(YEAR(created_at), "-W", WEEK(created_at)) as period';
      break;
    case 'month':
      groupBy = 'YEAR(created_at), MONTH(created_at)';
      dateFormat = 'CONCAT(YEAR(created_at), "-", LPAD(MONTH(created_at), 2, "0")) as period';
      break;
    case 'year':
      groupBy = 'YEAR(created_at)';
      dateFormat = 'YEAR(created_at) as period';
      break;
  }

  const queries = [
    // Revenue by period
    `SELECT 
      ${dateFormat},
      SUM(total_amount) as revenue,
      COUNT(*) as transaction_count,
      AVG(total_amount) as average_transaction
    FROM prescription_dispensing_log
    WHERE action IN ('DISPENSED', 'PARTIAL_DISPENSED') 
      AND DATE(created_at) BETWEEN ? AND ?
    GROUP BY ${groupBy}
    ORDER BY period DESC`,

    // Revenue summary
    `SELECT 
      SUM(total_amount) as total_revenue,
      COUNT(*) as total_transactions,
      AVG(total_amount) as average_transaction,
      COUNT(DISTINCT prescription_id) as unique_prescriptions
    FROM prescription_dispensing_log
    WHERE action IN ('DISPENSED', 'PARTIAL_DISPENSED') 
      AND DATE(created_at) BETWEEN ? AND ?`
  ];

  const [revenueByPeriod, summary] = await Promise.all([
    executeQuery(queries[0], [dateFrom, dateTo]),
    executeQuery(queries[1], [dateFrom, dateTo])
  ]);

  return NextResponse.json({
    success: true,
    data: {
      revenue_by_period: revenueByPeriod,
      summary: summary[0],
      report_period: { from: dateFrom, to: dateTo, period }
    }
  });
}

// Alerts Report
async function getAlertsReport() {
  const queries = [
    // Low stock alerts
    `SELECT 
      'low_stock' as alert_type,
      medicine_id,
      name as medicine_name,
      current_stock,
      minimum_stock,
      'Stock below minimum level' as message,
      'high' as priority
    FROM medicines
    WHERE current_stock <= minimum_stock AND is_active = 1`,

    // Expiry alerts
    `SELECT 
      'expiring_soon' as alert_type,
      medicine_id,
      name as medicine_name,
      expiry_date,
      DATEDIFF(expiry_date, CURDATE()) as days_to_expiry,
      CONCAT('Expires in ', DATEDIFF(expiry_date, CURDATE()), ' days') as message,
      CASE 
        WHEN expiry_date <= CURDATE() THEN 'critical'
        WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'high'
        WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'medium'
        ELSE 'low'
      END as priority
    FROM medicines
    WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY) AND is_active = 1`,

    // Pending prescriptions
    `SELECT 
      'pending_prescription' as alert_type,
      p.prescription_id,
      p.prescription_date,
      pt.name as patient_name,
      DATEDIFF(CURDATE(), p.prescription_date) as days_pending,
      CONCAT('Prescription pending for ', DATEDIFF(CURDATE(), p.prescription_date), ' days') as message,
      CASE 
        WHEN DATEDIFF(CURDATE(), p.prescription_date) > 7 THEN 'high'
        WHEN DATEDIFF(CURDATE(), p.prescription_date) > 3 THEN 'medium'
        ELSE 'low'
      END as priority
    FROM prescriptions p
    JOIN patients pt ON p.patient_id = pt.id
    WHERE p.status = 'active' 
    AND EXISTS (
      SELECT 1 FROM prescription_medications pm 
      WHERE pm.prescription_id = p.id AND pm.is_dispensed = 0
    )`
  ];

  const [lowStockAlerts, expiryAlerts, pendingPrescriptions] = await Promise.all([
    executeQuery(queries[0], []),
    executeQuery(queries[1], []),
    executeQuery(queries[2], [])
  ]);

  const allAlerts = [
    ...lowStockAlerts,
    ...expiryAlerts,
    ...pendingPrescriptions
  ].sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return NextResponse.json({
    success: true,
    data: {
      alerts: allAlerts,
      summary: {
        total_alerts: allAlerts.length,
        critical_alerts: allAlerts.filter(a => a.priority === 'critical').length,
        high_priority_alerts: allAlerts.filter(a => a.priority === 'high').length,
        medium_priority_alerts: allAlerts.filter(a => a.priority === 'medium').length,
        low_priority_alerts: allAlerts.filter(a => a.priority === 'low').length
      },
      categories: {
        low_stock: lowStockAlerts.length,
        expiring_medicines: expiryAlerts.length,
        pending_prescriptions: pendingPrescriptions.length
      }
    }
  });
}
