import { NextRequest, NextResponse } from 'next/server'
const { executeQuery } = require('@/lib/mysql-connection')

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'sales'
    const dateRange = searchParams.get('range') || 'today'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let dateCondition = ''
    const params: any[] = []

    // Build date condition
    switch (dateRange) {
      case 'today':
        dateCondition = 'DATE(created_at) = CURDATE()'
        break
      case 'yesterday':
        dateCondition = 'DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)'
        break
      case 'this-week':
        dateCondition = 'YEARWEEK(created_at) = YEARWEEK(CURDATE())'
        break
      case 'last-week':
        dateCondition = 'YEARWEEK(created_at) = YEARWEEK(CURDATE()) - 1'
        break
      case 'this-month':
        dateCondition = 'YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())'
        break
      case 'last-month':
        dateCondition = 'YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) - 1'
        break
      case 'this-year':
        dateCondition = 'YEAR(created_at) = YEAR(CURDATE())'
        break
      case 'custom':
        if (startDate && endDate) {
          dateCondition = 'DATE(created_at) BETWEEN ? AND ?'
          params.push(startDate, endDate)
        } else {
          dateCondition = 'DATE(created_at) = CURDATE()'
        }
        break
      default:
        dateCondition = 'DATE(created_at) = CURDATE()'
    }

    let reportData: any = {}

    switch (reportType) {
      case 'sales':
        reportData = await generateSalesReport(dateCondition, params)
        break
      case 'inventory':
        reportData = await generateInventoryReport()
        break
      case 'prescriptions':
        reportData = await generatePrescriptionReport(dateCondition, params)
        break
      case 'vendors':
        reportData = await generateVendorReport()
        break
      case 'expiry':
        reportData = await generateExpiryReport()
        break
      case 'stock-movement':
        reportData = await generateStockMovementReport(dateCondition, params)
        break
      default:
        reportData = await generateSalesReport(dateCondition, params)
    }

    return NextResponse.json({ success: true, data: reportData })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

async function generateSalesReport(dateCondition: string, params: any[]) {
  try {
    // Total sales
    const [totalSales] = await executeQuery(`
      SELECT 
        COUNT(*) as total_prescriptions,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_sale_value
      FROM prescriptions 
      WHERE status = 'completed' AND ${dateCondition}
    `, params) as any[]

    // Top selling medicines
    const topMedicines = await executeQuery(`
      SELECT 
        pm.medicine_name,
        SUM(pm.quantity) as total_quantity,
        SUM(pm.total_price) as total_revenue,
        COUNT(DISTINCT pm.prescription_id) as prescription_count
      FROM prescription_medications pm
      JOIN prescriptions p ON pm.prescription_id = p.id
      WHERE p.status = 'completed' AND ${dateCondition}
      GROUP BY pm.medicine_id, pm.medicine_name
      ORDER BY total_revenue DESC
      LIMIT 10
    `, params)

    // Daily sales trend (last 7 days)
    const salesTrend = await executeQuery(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as prescriptions,
        SUM(total_amount) as revenue
      FROM prescriptions 
      WHERE status = 'completed' 
        AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [])

    return {
      summary: totalSales,
      topMedicines,
      salesTrend
    }
  } catch (error) {
    console.error('Error generating sales report:', error)
    return { summary: {}, topMedicines: [], salesTrend: [] }
  }
}

async function generateInventoryReport() {
  try {
    // Inventory summary
    const [summary] = await executeQuery(`
      SELECT 
        COUNT(*) as total_medicines,
        SUM(current_stock) as total_stock,
        SUM(current_stock * unit_price) as total_value,
        COUNT(CASE WHEN current_stock <= minimum_stock THEN 1 END) as low_stock_items,
        COUNT(CASE WHEN current_stock = 0 THEN 1 END) as out_of_stock_items
      FROM medicines 
      WHERE is_active = 1
    `, []) as any[]

    // Category-wise breakdown
    const categoryBreakdown = await executeQuery(`
      SELECT 
        category,
        COUNT(*) as medicine_count,
        SUM(current_stock) as total_stock,
        SUM(current_stock * unit_price) as total_value
      FROM medicines 
      WHERE is_active = 1 AND category IS NOT NULL
      GROUP BY category
      ORDER BY total_value DESC
    `, [])

    // Low stock medicines
    const lowStockMedicines = await executeQuery(`
      SELECT 
        name,
        current_stock,
        minimum_stock,
        unit_price,
        category
      FROM medicines 
      WHERE current_stock <= minimum_stock AND is_active = 1
      ORDER BY (current_stock / minimum_stock), name
      LIMIT 20
    `, [])

    return {
      summary,
      categoryBreakdown,
      lowStockMedicines
    }
  } catch (error) {
    console.error('Error generating inventory report:', error)
    return { summary: {}, categoryBreakdown: [], lowStockMedicines: [] }
  }
}

async function generatePrescriptionReport(dateCondition: string, params: any[]) {
  try {
    // Prescription summary
    const [summary] = await executeQuery(`
      SELECT 
        COUNT(*) as total_prescriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_prescriptions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_prescriptions,
        AVG(total_amount) as avg_prescription_value
      FROM prescriptions 
      WHERE ${dateCondition}
    `, params) as any[]

    // Doctor-wise prescriptions
    const doctorStats = await executeQuery(`
      SELECT 
        u.name as doctor_name,
        COUNT(*) as prescription_count,
        SUM(p.total_amount) as total_value
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id
      WHERE ${dateCondition}
      GROUP BY p.doctor_id, u.name
      ORDER BY prescription_count DESC
      LIMIT 10
    `, params)

    return {
      summary,
      doctorStats
    }
  } catch (error) {
    console.error('Error generating prescription report:', error)
    return { summary: {}, doctorStats: [] }
  }
}

async function generateVendorReport() {
  try {
    const vendorStats = await executeQuery(`
      SELECT 
        v.vendor_name,
        v.vendor_type,
        v.contact_person,
        v.phone,
        v.rating,
        COALESCE(COUNT(po.id), 0) as total_orders,
        COALESCE(SUM(po.final_amount), 0) as total_amount
      FROM vendors v
      LEFT JOIN purchase_orders po ON v.id = po.vendor_id
      WHERE v.is_active = 1
      GROUP BY v.id
      ORDER BY total_amount DESC
    `, [])

    return { vendorStats }
  } catch (error) {
    console.error('Error generating vendor report:', error)
    return { vendorStats: [] }
  }
}

async function generateExpiryReport() {
  try {
    // Medicines expiring in next 30, 60, 90 days
    const expiryData = await executeQuery(`
      SELECT 
        m.name,
        m.category,
        mst.batch_number,
        mst.expiry_date,
        mst.quantity,
        DATEDIFF(mst.expiry_date, CURDATE()) as days_to_expiry,
        CASE 
          WHEN mst.expiry_date <= CURDATE() THEN 'Expired'
          WHEN mst.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expiring in 30 days'
          WHEN mst.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 60 DAY) THEN 'Expiring in 60 days'
          WHEN mst.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY) THEN 'Expiring in 90 days'
        END as expiry_category
      FROM medicines m
      JOIN medicine_stock_transactions mst ON m.id = mst.medicine_id
      WHERE mst.expiry_date IS NOT NULL 
        AND mst.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)
        AND mst.transaction_type = 'purchase'
        AND m.is_active = 1
      ORDER BY mst.expiry_date
    `, [])

    return { expiryData }
  } catch (error) {
    console.error('Error generating expiry report:', error)
    return { expiryData: [] }
  }
}

async function generateStockMovementReport(dateCondition: string, params: any[]) {
  try {
    const stockMovements = await executeQuery(`
      SELECT 
        m.name as medicine_name,
        mst.transaction_type,
        mst.quantity,
        mst.unit_price,
        mst.total_amount,
        mst.supplier,
        mst.created_at
      FROM medicine_stock_transactions mst
      JOIN medicines m ON mst.medicine_id = m.id
      WHERE ${dateCondition.replace('created_at', 'mst.created_at')}
      ORDER BY mst.created_at DESC
      LIMIT 100
    `, params)

    // Summary by transaction type
    const [movementSummary] = await executeQuery(`
      SELECT 
        SUM(CASE WHEN transaction_type = 'purchase' THEN quantity ELSE 0 END) as total_purchased,
        SUM(CASE WHEN transaction_type = 'sale' THEN quantity ELSE 0 END) as total_sold,
        SUM(CASE WHEN transaction_type = 'purchase' THEN total_amount ELSE 0 END) as purchase_value,
        SUM(CASE WHEN transaction_type = 'sale' THEN total_amount ELSE 0 END) as sales_value
      FROM medicine_stock_transactions mst
      WHERE ${dateCondition.replace('created_at', 'mst.created_at')}
    `, params) as any[]

    return {
      stockMovements,
      movementSummary
    }
  } catch (error) {
    console.error('Error generating stock movement report:', error)
    return { stockMovements: [], movementSummary: {} }
  }
}
