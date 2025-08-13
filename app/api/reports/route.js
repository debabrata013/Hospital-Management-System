// Reports & Analytics API Routes - MySQL Implementation
// Hospital Management System - Arogya Hospital

import { NextResponse } from 'next/server';
import { executeQuery, dbUtils } from '../../../lib/mysql-connection.js';
import { verifyToken } from '../../../lib/auth-middleware.js';

// GET - Generate various reports
export async function GET(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const departmentId = searchParams.get('departmentId');
    const doctorId = searchParams.get('doctorId');

    // Set default date range if not provided
    const fromDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = dateTo || new Date().toISOString().split('T')[0];

    let reportData = {};

    switch (reportType) {
      case 'dashboard':
        reportData = await generateDashboardReport(fromDate, toDate, authResult.user);
        break;
      case 'appointments':
        reportData = await generateAppointmentsReport(fromDate, toDate, doctorId);
        break;
      case 'financial':
        reportData = await generateFinancialReport(fromDate, toDate);
        break;
      case 'patients':
        reportData = await generatePatientsReport(fromDate, toDate);
        break;
      case 'inventory':
        reportData = await generateInventoryReport();
        break;
      case 'staff':
        reportData = await generateStaffReport(fromDate, toDate, departmentId);
        break;
      case 'medical':
        reportData = await generateMedicalReport(fromDate, toDate, doctorId);
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid report type' },
          { status: 400 }
        );
    }

    // Log report generation
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, additional_info, created_at) 
       VALUES (?, ?, 'READ', 'reports', ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        JSON.stringify({ 
          report_type: reportType, 
          date_from: fromDate, 
          date_to: toDate 
        })
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        reportType,
        dateRange: { from: fromDate, to: toDate },
        generatedAt: new Date().toISOString(),
        generatedBy: authResult.user.name,
        ...reportData
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Dashboard Report - Overview statistics
async function generateDashboardReport(fromDate, toDate, user) {
  const today = new Date().toISOString().split('T')[0];
  
  // Basic counts
  const [
    totalPatients,
    totalAppointments,
    todayAppointments,
    totalRevenue,
    activeStaff,
    lowStockMedicines,
    pendingBills
  ] = await Promise.all([
    executeQuery('SELECT COUNT(*) as count FROM patients WHERE is_active = TRUE'),
    executeQuery('SELECT COUNT(*) as count FROM appointments WHERE appointment_date BETWEEN ? AND ?', [fromDate, toDate]),
    executeQuery('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?', [today]),
    executeQuery('SELECT COALESCE(SUM(total_amount), 0) as total FROM billing WHERE bill_date BETWEEN ? AND ?', [fromDate, toDate]),
    executeQuery('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE AND role != "patient"'),
    executeQuery('SELECT COUNT(*) as count FROM medicines WHERE current_stock <= minimum_stock AND is_active = TRUE'),
    executeQuery('SELECT COUNT(*) as count FROM billing WHERE payment_status IN ("pending", "partial")')
  ]);

  // Appointment status breakdown
  const appointmentsByStatus = await executeQuery(`
    SELECT 
      status,
      COUNT(*) as count
    FROM appointments 
    WHERE appointment_date BETWEEN ? AND ?
    GROUP BY status
  `, [fromDate, toDate]);

  // Revenue by bill type
  const revenueByType = await executeQuery(`
    SELECT 
      bill_type,
      COUNT(*) as bill_count,
      SUM(total_amount) as total_revenue,
      SUM(paid_amount) as paid_amount
    FROM billing 
    WHERE bill_date BETWEEN ? AND ?
    GROUP BY bill_type
  `, [fromDate, toDate]);

  // Daily appointment trends
  const appointmentTrends = await executeQuery(`
    SELECT 
      appointment_date,
      COUNT(*) as appointment_count
    FROM appointments 
    WHERE appointment_date BETWEEN ? AND ?
    GROUP BY appointment_date
    ORDER BY appointment_date
  `, [fromDate, toDate]);

  // Top doctors by appointments
  const topDoctors = await executeQuery(`
    SELECT 
      u.name as doctor_name,
      u.specialization,
      COUNT(a.id) as appointment_count,
      AVG(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) * 100 as completion_rate
    FROM users u
    LEFT JOIN appointments a ON u.id = a.doctor_id AND a.appointment_date BETWEEN ? AND ?
    WHERE u.role = 'doctor' AND u.is_active = TRUE
    GROUP BY u.id, u.name, u.specialization
    ORDER BY appointment_count DESC
    LIMIT 10
  `, [fromDate, toDate]);

  return {
    summary: {
      totalPatients: totalPatients[0].count,
      totalAppointments: totalAppointments[0].count,
      todayAppointments: todayAppointments[0].count,
      totalRevenue: parseFloat(totalRevenue[0].total),
      activeStaff: activeStaff[0].count,
      lowStockMedicines: lowStockMedicines[0].count,
      pendingBills: pendingBills[0].count
    },
    appointmentsByStatus,
    revenueByType,
    appointmentTrends,
    topDoctors
  };
}

// Appointments Report
async function generateAppointmentsReport(fromDate, toDate, doctorId) {
  let doctorFilter = '';
  let params = [fromDate, toDate];
  
  if (doctorId) {
    doctorFilter = 'AND a.doctor_id = ?';
    params.push(doctorId);
  }

  // Appointment statistics
  const appointmentStats = await executeQuery(`
    SELECT 
      COUNT(*) as total_appointments,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN status = 'no-show' THEN 1 ELSE 0 END) as no_shows,
      AVG(consultation_fee) as avg_consultation_fee
    FROM appointments a
    WHERE a.appointment_date BETWEEN ? AND ? ${doctorFilter}
  `, params);

  // Appointments by type
  const appointmentsByType = await executeQuery(`
    SELECT 
      appointment_type,
      COUNT(*) as count,
      AVG(consultation_fee) as avg_fee
    FROM appointments a
    WHERE a.appointment_date BETWEEN ? AND ? ${doctorFilter}
    GROUP BY appointment_type
  `, params);

  // Appointments by time slots
  const appointmentsByTimeSlot = await executeQuery(`
    SELECT 
      HOUR(appointment_time) as hour_slot,
      COUNT(*) as count
    FROM appointments a
    WHERE a.appointment_date BETWEEN ? AND ? ${doctorFilter}
    GROUP BY HOUR(appointment_time)
    ORDER BY hour_slot
  `, params);

  // Patient demographics
  const patientDemographics = await executeQuery(`
    SELECT 
      p.gender,
      CASE 
        WHEN TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) < 18 THEN 'Under 18'
        WHEN TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) BETWEEN 18 AND 35 THEN '18-35'
        WHEN TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) BETWEEN 36 AND 60 THEN '36-60'
        ELSE 'Over 60'
      END as age_group,
      COUNT(*) as count
    FROM appointments a
    INNER JOIN patients p ON a.patient_id = p.id
    WHERE a.appointment_date BETWEEN ? AND ? ${doctorFilter}
    GROUP BY p.gender, age_group
  `, params);

  return {
    statistics: appointmentStats[0],
    appointmentsByType,
    appointmentsByTimeSlot,
    patientDemographics
  };
}

// Financial Report
async function generateFinancialReport(fromDate, toDate) {
  // Revenue summary
  const revenueSummary = await executeQuery(`
    SELECT 
      COUNT(*) as total_bills,
      SUM(total_amount) as total_billed,
      SUM(paid_amount) as total_collected,
      SUM(balance_amount) as total_outstanding,
      AVG(total_amount) as avg_bill_amount
    FROM billing
    WHERE bill_date BETWEEN ? AND ?
  `, [fromDate, toDate]);

  // Payment method breakdown
  const paymentMethods = await executeQuery(`
    SELECT 
      payment_method,
      COUNT(*) as transaction_count,
      SUM(amount) as total_amount
    FROM payment_transactions pt
    INNER JOIN billing b ON pt.billing_id = b.id
    WHERE pt.payment_date BETWEEN ? AND ?
    GROUP BY payment_method
  `, [fromDate, toDate]);

  // Daily revenue trends
  const dailyRevenue = await executeQuery(`
    SELECT 
      bill_date,
      COUNT(*) as bill_count,
      SUM(total_amount) as total_billed,
      SUM(paid_amount) as total_collected
    FROM billing
    WHERE bill_date BETWEEN ? AND ?
    GROUP BY bill_date
    ORDER BY bill_date
  `, [fromDate, toDate]);

  // Outstanding bills by age
  const outstandingBills = await executeQuery(`
    SELECT 
      CASE 
        WHEN DATEDIFF(CURDATE(), bill_date) <= 30 THEN '0-30 days'
        WHEN DATEDIFF(CURDATE(), bill_date) <= 60 THEN '31-60 days'
        WHEN DATEDIFF(CURDATE(), bill_date) <= 90 THEN '61-90 days'
        ELSE 'Over 90 days'
      END as age_group,
      COUNT(*) as bill_count,
      SUM(balance_amount) as total_outstanding
    FROM billing
    WHERE balance_amount > 0
    GROUP BY age_group
  `);

  return {
    summary: revenueSummary[0],
    paymentMethods,
    dailyRevenue,
    outstandingBills
  };
}

// Patients Report
async function generatePatientsReport(fromDate, toDate) {
  // Patient registration trends
  const registrationTrends = await executeQuery(`
    SELECT 
      registration_date,
      COUNT(*) as new_registrations
    FROM patients
    WHERE registration_date BETWEEN ? AND ?
    GROUP BY registration_date
    ORDER BY registration_date
  `, [fromDate, toDate]);

  // Patient demographics
  const demographics = await executeQuery(`
    SELECT 
      gender,
      CASE 
        WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 18 THEN 'Under 18'
        WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 18 AND 35 THEN '18-35'
        WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 36 AND 60 THEN '36-60'
        ELSE 'Over 60'
      END as age_group,
      COUNT(*) as count
    FROM patients
    WHERE is_active = TRUE
    GROUP BY gender, age_group
  `);

  // Top cities
  const topCities = await executeQuery(`
    SELECT 
      city,
      COUNT(*) as patient_count
    FROM patients
    WHERE is_active = TRUE AND city IS NOT NULL
    GROUP BY city
    ORDER BY patient_count DESC
    LIMIT 10
  `);

  // Blood group distribution
  const bloodGroups = await executeQuery(`
    SELECT 
      blood_group,
      COUNT(*) as count
    FROM patients
    WHERE is_active = TRUE
    GROUP BY blood_group
    ORDER BY count DESC
  `);

  return {
    registrationTrends,
    demographics,
    topCities,
    bloodGroups
  };
}

// Inventory Report
async function generateInventoryReport() {
  // Stock status summary
  const stockSummary = await executeQuery(`
    SELECT 
      COUNT(*) as total_medicines,
      SUM(CASE WHEN current_stock <= 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN current_stock <= minimum_stock THEN 1 ELSE 0 END) as low_stock,
      SUM(CASE WHEN expiry_date <= CURDATE() THEN 1 ELSE 0 END) as expired,
      SUM(CASE WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiring_soon,
      SUM(current_stock * unit_price) as total_inventory_value
    FROM medicines
    WHERE is_active = TRUE
  `);

  // Low stock medicines
  const lowStockMedicines = await executeQuery(`
    SELECT 
      name,
      generic_name,
      current_stock,
      minimum_stock,
      unit_price,
      expiry_date
    FROM medicines
    WHERE current_stock <= minimum_stock AND is_active = TRUE
    ORDER BY current_stock ASC
    LIMIT 20
  `);

  // Expiring medicines
  const expiringMedicines = await executeQuery(`
    SELECT 
      name,
      generic_name,
      current_stock,
      expiry_date,
      DATEDIFF(expiry_date, CURDATE()) as days_to_expiry
    FROM medicines
    WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 60 DAY) AND is_active = TRUE
    ORDER BY expiry_date ASC
    LIMIT 20
  `);

  // Category-wise stock
  const categoryStock = await executeQuery(`
    SELECT 
      category,
      COUNT(*) as medicine_count,
      SUM(current_stock) as total_stock,
      SUM(current_stock * unit_price) as category_value
    FROM medicines
    WHERE is_active = TRUE
    GROUP BY category
    ORDER BY category_value DESC
  `);

  return {
    summary: stockSummary[0],
    lowStockMedicines,
    expiringMedicines,
    categoryStock
  };
}

// Staff Report
async function generateStaffReport(fromDate, toDate, departmentId) {
  let departmentFilter = '';
  let params = [];
  
  if (departmentId) {
    departmentFilter = 'WHERE u.department = ?';
    params.push(departmentId);
  }

  // Staff summary
  const staffSummary = await executeQuery(`
    SELECT 
      COUNT(*) as total_staff,
      SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_staff,
      SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified_staff
    FROM users u
    ${departmentFilter}
  `, params);

  // Staff by role
  const staffByRole = await executeQuery(`
    SELECT 
      role,
      COUNT(*) as count,
      SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_count
    FROM users u
    ${departmentFilter}
    GROUP BY role
  `, params);

  // Staff by department
  const staffByDepartment = await executeQuery(`
    SELECT 
      department,
      COUNT(*) as count,
      SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_count
    FROM users u
    WHERE department IS NOT NULL
    GROUP BY department
  `);

  // Recent joinings
  const recentJoinings = await executeQuery(`
    SELECT 
      name,
      role,
      department,
      joining_date
    FROM users u
    WHERE joining_date BETWEEN ? AND ?
    ORDER BY joining_date DESC
    LIMIT 10
  `, [fromDate, toDate]);

  return {
    summary: staffSummary[0],
    staffByRole,
    staffByDepartment,
    recentJoinings
  };
}

// Medical Report
async function generateMedicalReport(fromDate, toDate, doctorId) {
  let doctorFilter = '';
  let params = [fromDate, toDate];
  
  if (doctorId) {
    doctorFilter = 'AND mr.doctor_id = ?';
    params.push(doctorId);
  }

  // Medical records summary
  const medicalSummary = await executeQuery(`
    SELECT 
      COUNT(*) as total_records,
      COUNT(DISTINCT mr.patient_id) as unique_patients
    FROM medical_records mr
    WHERE mr.visit_date BETWEEN ? AND ? ${doctorFilter}
  `, params);

  // Common diagnoses
  const commonDiagnoses = await executeQuery(`
    SELECT 
      diagnosis,
      COUNT(*) as frequency
    FROM medical_records mr
    WHERE mr.visit_date BETWEEN ? AND ? ${doctorFilter}
      AND diagnosis IS NOT NULL AND diagnosis != ''
    GROUP BY diagnosis
    ORDER BY frequency DESC
    LIMIT 10
  `, params);

  // Prescription statistics
  const prescriptionStats = await executeQuery(`
    SELECT 
      COUNT(*) as total_prescriptions,
      AVG(total_amount) as avg_prescription_value,
      COUNT(DISTINCT patient_id) as unique_patients
    FROM prescriptions p
    WHERE p.prescription_date BETWEEN ? AND ? ${doctorFilter}
  `, params);

  // Most prescribed medicines
  const topMedicines = await executeQuery(`
    SELECT 
      pm.medicine_name,
      COUNT(*) as prescription_count,
      SUM(pm.quantity) as total_quantity
    FROM prescription_medications pm
    INNER JOIN prescriptions p ON pm.prescription_id = p.id
    WHERE p.prescription_date BETWEEN ? AND ? ${doctorFilter}
    GROUP BY pm.medicine_name
    ORDER BY prescription_count DESC
    LIMIT 10
  `, params);

  return {
    summary: medicalSummary[0],
    commonDiagnoses,
    prescriptionStats: prescriptionStats[0],
    topMedicines
  };
}

// POST - Export report (future implementation for PDF/Excel export)
export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { reportType, format, dateFrom, dateTo } = await request.json();

    // This would implement PDF/Excel export functionality
    // For now, return a placeholder response

    return NextResponse.json({
      success: true,
      message: 'Report export functionality will be implemented',
      data: {
        reportType,
        format,
        dateRange: { from: dateFrom, to: dateTo },
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export report' },
      { status: 500 }
    );
  }
}
