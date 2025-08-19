// Pharmacy API - Individual Medicine Management
// GET /api/pharmacy/medicines/[id] - Get medicine details
// PUT /api/pharmacy/medicines/[id] - Update medicine
// DELETE /api/pharmacy/medicines/[id] - Delete medicine (soft delete)

import { NextRequest, NextResponse } from 'next/server';
const { executeQuery, dbUtils } = require('@/lib/mysql-connection');

// GET - Fetch medicine details by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const medicineId = params.id;
    
    // Fetch medicine details with stock transactions
    const medicineQuery = `
      SELECT 
        m.*,
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
        END as expiry_status
      FROM medicines m
      WHERE (m.id = ? OR m.medicine_id = ?) AND m.is_active = 1
    `;
    
    const medicine = await executeQuery(medicineQuery, [medicineId, medicineId]);
    
    if (medicine.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Medicine not found'
      }, { status: 404 });
    }
    
    // Fetch recent stock transactions
    const transactionsQuery = `
      SELECT 
        mst.*,
        u.name as created_by_name
      FROM medicine_stock_transactions mst
      LEFT JOIN users u ON mst.created_by = u.id
      WHERE mst.medicine_id = ?
      ORDER BY mst.created_at DESC
      LIMIT 10
    `;
    
    const transactions = await executeQuery(transactionsQuery, [medicine[0].id]);
    
    // Fetch prescription usage (last 30 days)
    const usageQuery = `
      SELECT 
        COUNT(*) as prescription_count,
        SUM(pm.quantity) as total_dispensed
      FROM prescription_medications pm
      JOIN prescriptions p ON pm.prescription_id = p.id
      WHERE pm.medicine_id = ? 
        AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND pm.is_dispensed = 1
    `;
    
    const usage = await executeQuery(usageQuery, [medicine[0].id]);
    
    return NextResponse.json({
      success: true,
      data: {
        medicine: medicine[0],
        recent_transactions: transactions,
        usage_stats: usage[0] || { prescription_count: 0, total_dispensed: 0 }
      }
    });
    
  } catch (error) {
    console.error('Error fetching medicine details:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch medicine details'
    }, { status: 500 });
  }
}

// PUT - Update medicine
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const medicineId = params.id;
    const body = await request.json();
    
    // Check if medicine exists
    const existingMedicine = await executeQuery(
      'SELECT * FROM medicines WHERE (id = ? OR medicine_id = ?) AND is_active = 1',
      [medicineId, medicineId]
    );
    
    if (existingMedicine.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Medicine not found'
      }, { status: 404 });
    }
    
    const medicine = existingMedicine[0];
    
    // Prepare update data (only include provided fields)
    const updateData: any = {
      updated_at: new Date()
    };
    
    // List of updatable fields
    const updatableFields = [
      'name', 'generic_name', 'brand_name', 'category', 'manufacturer',
      'composition', 'strength', 'dosage_form', 'pack_size', 'unit_price',
      'mrp', 'minimum_stock', 'maximum_stock', 'expiry_date', 'batch_number',
      'supplier', 'storage_conditions', 'side_effects', 'contraindications',
      'drug_interactions', 'pregnancy_category', 'prescription_required'
    ];
    
    updatableFields.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'unit_price' || field === 'mrp') {
          updateData[field] = parseFloat(body[field]);
        } else if (field === 'minimum_stock' || field === 'maximum_stock') {
          updateData[field] = parseInt(body[field]);
        } else if (field === 'expiry_date') {
          updateData[field] = body[field] ? dbUtils.formatDate(body[field]) : null;
        } else if (field === 'prescription_required') {
          updateData[field] = Boolean(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    });
    
    // Check if name is being changed and if it conflicts
    if (updateData.name && updateData.name !== medicine.name) {
      const nameConflict = await executeQuery(
        'SELECT id FROM medicines WHERE name = ? AND id != ? AND is_active = 1',
        [updateData.name, medicine.id]
      );
      
      if (nameConflict.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'Medicine with this name already exists'
        }, { status: 409 });
      }
    }
    
    // Handle stock update separately if provided
    let stockTransaction = null;
    if (body.stock_adjustment !== undefined) {
      const adjustment = parseInt(body.stock_adjustment);
      const newStock = medicine.current_stock + adjustment;
      
      if (newStock < 0) {
        return NextResponse.json({
          success: false,
          error: 'Stock adjustment would result in negative stock'
        }, { status: 400 });
      }
      
      updateData.current_stock = newStock;
      
      // Prepare stock transaction
      stockTransaction = {
        medicine_id: medicine.id,
        transaction_type: adjustment > 0 ? 'purchase' : 'adjustment',
        quantity: Math.abs(adjustment),
        unit_price: medicine.unit_price,
        total_amount: Math.abs(adjustment) * medicine.unit_price,
        batch_number: body.batch_number || medicine.batch_number,
        expiry_date: body.expiry_date ? dbUtils.formatDate(body.expiry_date) : medicine.expiry_date,
        supplier: body.supplier || medicine.supplier,
        reference_id: body.reference_id || `ADJ-${Date.now()}`,
        notes: body.adjustment_notes || `Stock adjustment: ${adjustment > 0 ? '+' : ''}${adjustment}`,
        created_by: 1, // TODO: Get from auth
        created_at: new Date()
      };
    }
    
    // Build update query
    const { query: updateQuery, params: updateParams } = dbUtils.buildUpdateQuery(
      'medicines',
      updateData,
      { id: medicine.id }
    );
    
    // Execute update in transaction
    const queries = [{ query: updateQuery, params: updateParams }];
    
    if (stockTransaction) {
      const { query: stockQuery, params: stockParams } = dbUtils.buildInsertQuery(
        'medicine_stock_transactions',
        stockTransaction
      );
      queries.push({ query: stockQuery, params: stockParams });
    }
    
    await executeQuery(updateQuery, updateParams);
    
    if (stockTransaction) {
      const { query: stockQuery, params: stockParams } = dbUtils.buildInsertQuery(
        'medicine_stock_transactions',
        stockTransaction
      );
      await executeQuery(stockQuery, stockParams);
    }
    
    // Fetch updated medicine
    const updatedMedicine = await executeQuery(
      'SELECT * FROM medicines WHERE id = ?',
      [medicine.id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Medicine updated successfully',
      data: updatedMedicine[0]
    });
    
  } catch (error) {
    console.error('Error updating medicine:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update medicine'
    }, { status: 500 });
  }
}

// DELETE - Soft delete medicine
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const medicineId = params.id;
    
    // Check if medicine exists
    const existingMedicine = await executeQuery(
      'SELECT * FROM medicines WHERE (id = ? OR medicine_id = ?) AND is_active = 1',
      [medicineId, medicineId]
    );
    
    if (existingMedicine.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Medicine not found'
      }, { status: 404 });
    }
    
    const medicine = existingMedicine[0];
    
    // Check if medicine is used in any active prescriptions
    const activePrescriptions = await executeQuery(`
      SELECT COUNT(*) as count
      FROM prescription_medications pm
      JOIN prescriptions p ON pm.prescription_id = p.id
      WHERE pm.medicine_id = ? AND p.status = 'active'
    `, [medicine.id]);
    
    if (activePrescriptions[0].count > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete medicine that is used in active prescriptions'
      }, { status: 400 });
    }
    
    // Soft delete medicine
    await executeQuery(
      'UPDATE medicines SET is_active = 0, updated_at = ? WHERE id = ?',
      [new Date(), medicine.id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Medicine deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting medicine:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete medicine'
    }, { status: 500 });
  }
}
