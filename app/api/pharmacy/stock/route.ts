// Pharmacy API - Stock Management
// GET /api/pharmacy/stock - Get stock overview and alerts
// POST /api/pharmacy/stock - Add stock transaction

import { NextRequest, NextResponse } from 'next/server';
const { executeQuery, dbUtils } = require('@/lib/mysql-connection');

// GET - Stock overview and alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const alertType = searchParams.get('alertType'); // 'low', 'expiring', 'expired'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Stock overview query
    const overviewQuery = `
      SELECT 
        COUNT(*) as total_medicines,
        SUM(CASE WHEN current_stock <= minimum_stock THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN expiry_date <= CURDATE() THEN 1 ELSE 0 END) as expired_count,
        SUM(CASE WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND expiry_date > CURDATE() THEN 1 ELSE 0 END) as expiring_soon_count,
        SUM(current_stock * unit_price) as total_stock_value
      FROM medicines 
      WHERE is_active = 1
    `;
    
    const overview = await executeQuery(overviewQuery);
    
    // Build stock alerts query based on alert type
    let stockQuery = '';
    let whereCondition = 'WHERE m.is_active = 1';
    
    if (alertType === 'low') {
      whereCondition += ' AND m.current_stock <= m.minimum_stock';
    } else if (alertType === 'expiring') {
      whereCondition += ' AND m.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND m.expiry_date > CURDATE()';
    } else if (alertType === 'expired') {
      whereCondition += ' AND m.expiry_date <= CURDATE()';
    }
    
    stockQuery = `
      SELECT 
        m.id,
        m.medicine_id,
        m.name,
        m.generic_name,
        m.category,
        m.current_stock,
        m.minimum_stock,
        m.maximum_stock,
        m.unit_price,
        m.mrp,
        m.expiry_date,
        m.batch_number,
        m.supplier,
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
        (m.current_stock * m.unit_price) as stock_value,
        DATEDIFF(m.expiry_date, CURDATE()) as days_to_expiry
      FROM medicines m
      ${whereCondition}
      ORDER BY 
        CASE 
          WHEN m.expiry_date <= CURDATE() THEN 1
          WHEN m.current_stock <= m.minimum_stock THEN 2
          WHEN m.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 3
          ELSE 4
        END,
        m.expiry_date ASC,
        m.current_stock ASC
      LIMIT ? OFFSET ?
    `;
    
    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM medicines m
      ${whereCondition}
    `;
    
    const [stockData, countResult] = await Promise.all([
      executeQuery(stockQuery, [limit, offset]),
      executeQuery(countQuery)
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    // Recent stock transactions
    const recentTransactionsQuery = `
      SELECT 
        mst.*,
        m.name as medicine_name,
        m.medicine_id,
        u.name as created_by_name
      FROM medicine_stock_transactions mst
      JOIN medicines m ON mst.medicine_id = m.id
      LEFT JOIN users u ON mst.created_by = u.id
      ORDER BY mst.created_at DESC
      LIMIT 10
    `;
    
    const recentTransactions = await executeQuery(recentTransactionsQuery);
    
    return NextResponse.json({
      success: true,
      data: {
        overview: overview[0],
        stock_alerts: stockData,
        recent_transactions: recentTransactions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stock data'
    }, { status: 500 });
  }
}

// POST - Add stock transaction (purchase, sale, adjustment, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['medicine_id', 'transaction_type', 'quantity'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 });
      }
    }
    
    // Validate transaction type
    const validTypes = ['purchase', 'sale', 'return', 'adjustment', 'expired'];
    if (!validTypes.includes(body.transaction_type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid transaction type'
      }, { status: 400 });
    }
    
    // Get medicine details
    const medicine = await executeQuery(
      'SELECT * FROM medicines WHERE (id = ? OR medicine_id = ?) AND is_active = 1',
      [body.medicine_id, body.medicine_id]
    );
    
    if (medicine.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Medicine not found'
      }, { status: 404 });
    }
    
    const medicineData = medicine[0];
    const quantity = parseInt(body.quantity);
    
    // Calculate stock change based on transaction type
    let stockChange = 0;
    switch (body.transaction_type) {
      case 'purchase':
      case 'return':
        stockChange = quantity;
        break;
      case 'sale':
      case 'expired':
        stockChange = -quantity;
        break;
      case 'adjustment':
        stockChange = body.adjustment_type === 'increase' ? quantity : -quantity;
        break;
    }
    
    const newStock = medicineData.current_stock + stockChange;
    
    // Validate stock levels
    if (newStock < 0) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient stock for this transaction'
      }, { status: 400 });
    }
    
    // Prepare transaction data
    const transactionData = {
      medicine_id: medicineData.id,
      transaction_type: body.transaction_type,
      quantity: quantity,
      unit_price: body.unit_price ? parseFloat(body.unit_price) : medicineData.unit_price,
      total_amount: body.total_amount ? parseFloat(body.total_amount) : (quantity * medicineData.unit_price),
      batch_number: body.batch_number || medicineData.batch_number,
      expiry_date: body.expiry_date ? dbUtils.formatDate(body.expiry_date) : medicineData.expiry_date,
      supplier: body.supplier || medicineData.supplier,
      reference_id: body.reference_id || `TXN-${Date.now()}`,
      notes: body.notes || '',
      created_by: 1, // TODO: Get from auth
      created_at: new Date()
    };
    
    // Execute transaction in database transaction
    const queries = [
      // Insert stock transaction
      {
        query: `
          INSERT INTO medicine_stock_transactions (
            medicine_id, transaction_type, quantity, unit_price, total_amount,
            batch_number, expiry_date, supplier, reference_id, notes, created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        params: Object.values(transactionData)
      },
      // Update medicine stock
      {
        query: 'UPDATE medicines SET current_stock = ?, updated_at = ? WHERE id = ?',
        params: [newStock, new Date(), medicineData.id]
      }
    ];
    
    // Update batch and expiry if provided for purchase transactions
    if (body.transaction_type === 'purchase' && (body.batch_number || body.expiry_date)) {
      const updateFields = [];
      const updateParams = [];
      
      if (body.batch_number) {
        updateFields.push('batch_number = ?');
        updateParams.push(body.batch_number);
      }
      
      if (body.expiry_date) {
        updateFields.push('expiry_date = ?');
        updateParams.push(dbUtils.formatDate(body.expiry_date));
      }
      
      if (updateFields.length > 0) {
        updateFields.push('updated_at = ?');
        updateParams.push(new Date());
        updateParams.push(medicineData.id);
        
        queries.push({
          query: `UPDATE medicines SET ${updateFields.join(', ')} WHERE id = ?`,
          params: updateParams
        });
      }
    }
    
    const results = await Promise.all(queries.map(q => executeQuery(q.query, q.params)));
    
    // Fetch updated medicine data
    const updatedMedicine = await executeQuery(
      'SELECT * FROM medicines WHERE id = ?',
      [medicineData.id]
    );
    
    // Fetch the created transaction
    const createdTransaction = await executeQuery(
      `SELECT mst.*, m.name as medicine_name, u.name as created_by_name
       FROM medicine_stock_transactions mst
       JOIN medicines m ON mst.medicine_id = m.id
       LEFT JOIN users u ON mst.created_by = u.id
       WHERE mst.id = ?`,
      [results[0].insertId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Stock transaction completed successfully',
      data: {
        transaction: createdTransaction[0],
        updated_medicine: updatedMedicine[0]
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error processing stock transaction:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process stock transaction'
    }, { status: 500 });
  }
}
