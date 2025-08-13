// Medicine/Pharmacy Management API Routes - MySQL Implementation
// Hospital Management System - Arogya Hospital

import { NextResponse } from 'next/server';
import { executeQuery, executeTransaction, dbUtils } from '../../../lib/mysql-connection.js';
import { verifyToken } from '../../../lib/auth-middleware.js';

// GET - Fetch medicines with filters
export async function GET(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock') === 'true';
    const expiringSoon = searchParams.get('expiringSoon') === 'true';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'ASC';
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = ['m.is_active = TRUE'];
    let queryParams = [];

    if (search) {
      whereConditions.push(`(
        m.name LIKE ? OR 
        m.generic_name LIKE ? OR 
        m.brand_name LIKE ? OR 
        m.medicine_id LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereConditions.push('m.category = ?');
      queryParams.push(category);
    }

    if (lowStock) {
      whereConditions.push('m.current_stock <= m.minimum_stock');
    }

    if (expiringSoon) {
      whereConditions.push('m.expiry_date <= DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)');
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM medicines m 
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams);
    const totalMedicines = countResult[0].total;

    // Get medicines with stock status
    const medicinesQuery = `
      SELECT 
        m.id,
        m.medicine_id,
        m.name,
        m.generic_name,
        m.brand_name,
        m.category,
        m.manufacturer,
        m.composition,
        m.strength,
        m.dosage_form,
        m.pack_size,
        m.unit_price,
        m.mrp,
        m.current_stock,
        m.minimum_stock,
        m.maximum_stock,
        m.expiry_date,
        m.batch_number,
        m.supplier,
        m.prescription_required,
        m.created_at,
        CASE 
          WHEN m.current_stock <= 0 THEN 'out_of_stock'
          WHEN m.current_stock <= m.minimum_stock THEN 'low_stock'
          WHEN m.current_stock >= m.maximum_stock THEN 'overstock'
          ELSE 'in_stock'
        END as stock_status,
        CASE 
          WHEN m.expiry_date <= CURRENT_DATE THEN 'expired'
          WHEN m.expiry_date <= DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY) THEN 'expiring_soon'
          ELSE 'valid'
        END as expiry_status,
        DATEDIFF(m.expiry_date, CURRENT_DATE) as days_to_expiry
      FROM medicines m
      ${whereClause}
      ORDER BY m.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const medicines = await executeQuery(medicinesQuery, [...queryParams, limit, offset]);

    // Get recent stock transactions for each medicine
    for (let medicine of medicines) {
      const recentTransactions = await executeQuery(`
        SELECT 
          mst.transaction_type,
          mst.quantity,
          mst.created_at,
          u.name as created_by_name
        FROM medicine_stock_transactions mst
        LEFT JOIN users u ON mst.created_by = u.id
        WHERE mst.medicine_id = ?
        ORDER BY mst.created_at DESC
        LIMIT 5
      `, [medicine.id]);

      medicine.recent_transactions = recentTransactions;
    }

    return NextResponse.json({
      success: true,
      data: {
        medicines,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMedicines / limit),
          totalMedicines,
          hasNextPage: page < Math.ceil(totalMedicines / limit),
          hasPrevPage: page > 1
        },
        summary: {
          totalMedicines,
          lowStockCount: medicines.filter(m => m.stock_status === 'low_stock' || m.stock_status === 'out_of_stock').length,
          expiringSoonCount: medicines.filter(m => m.expiry_status === 'expiring_soon').length,
          expiredCount: medicines.filter(m => m.expiry_status === 'expired').length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching medicines:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch medicines' },
      { status: 500 }
    );
  }
}

// POST - Add new medicine
export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    // Check if user has permission to add medicines
    if (!['super-admin', 'admin', 'pharmacy'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to add medicines' },
        { status: 403 }
      );
    }

    const medicineData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'dosageForm', 'unitPrice', 'mrp'];
    for (const field of requiredFields) {
      if (!medicineData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if medicine with same name and strength already exists
    const existingMedicine = await executeQuery(
      'SELECT id FROM medicines WHERE name = ? AND strength = ? AND is_active = TRUE',
      [medicineData.name, medicineData.strength || '']
    );

    if (existingMedicine.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Medicine with same name and strength already exists' },
        { status: 409 }
      );
    }

    // Generate unique medicine ID
    const medicineId = dbUtils.generateId('MED');

    // Prepare medicine data
    const insertData = {
      medicine_id: medicineId,
      name: medicineData.name,
      generic_name: medicineData.genericName || null,
      brand_name: medicineData.brandName || null,
      category: medicineData.category || null,
      manufacturer: medicineData.manufacturer || null,
      composition: medicineData.composition || null,
      strength: medicineData.strength || null,
      dosage_form: medicineData.dosageForm,
      pack_size: medicineData.packSize || null,
      unit_price: medicineData.unitPrice,
      mrp: medicineData.mrp,
      current_stock: medicineData.initialStock || 0,
      minimum_stock: medicineData.minimumStock || 10,
      maximum_stock: medicineData.maximumStock || 1000,
      expiry_date: medicineData.expiryDate ? dbUtils.formatDate(medicineData.expiryDate) : null,
      batch_number: medicineData.batchNumber || null,
      supplier: medicineData.supplier || null,
      storage_conditions: medicineData.storageConditions || null,
      side_effects: medicineData.sideEffects || null,
      contraindications: medicineData.contraindications || null,
      drug_interactions: medicineData.drugInteractions || null,
      pregnancy_category: medicineData.pregnancyCategory || 'Unknown',
      prescription_required: medicineData.prescriptionRequired !== false // Default to true
    };

    // Insert medicine
    const { query, params } = dbUtils.buildInsertQuery('medicines', insertData);
    const result = await executeQuery(query, params);

    // Create initial stock transaction if initial stock is provided
    if (medicineData.initialStock && medicineData.initialStock > 0) {
      await executeQuery(
        `INSERT INTO medicine_stock_transactions 
         (medicine_id, transaction_type, quantity, unit_price, total_amount, notes, created_by, created_at)
         VALUES (?, 'purchase', ?, ?, ?, 'Initial stock', ?, CURRENT_TIMESTAMP)`,
        [
          result.insertId,
          medicineData.initialStock,
          medicineData.unitPrice,
          medicineData.initialStock * medicineData.unitPrice,
          authResult.user.userId
        ]
      );
    }

    // Log the creation
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, new_values, created_at) 
       VALUES (?, ?, 'CREATE', 'medicines', ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        result.insertId.toString(),
        JSON.stringify(insertData)
      ]
    );

    // Fetch the created medicine
    const createdMedicine = await executeQuery(
      'SELECT * FROM medicines WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json({
      success: true,
      message: 'Medicine added successfully',
      data: {
        medicine: createdMedicine[0]
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding medicine:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add medicine' },
      { status: 500 }
    );
  }
}

// PUT - Update medicine or stock
export async function PUT(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const medicineId = searchParams.get('id');
    const action = searchParams.get('action'); // 'update' or 'stock'
    
    if (!medicineId) {
      return NextResponse.json(
        { success: false, message: 'Medicine ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Get existing medicine
    const existingMedicine = await executeQuery(
      'SELECT * FROM medicines WHERE id = ? AND is_active = TRUE',
      [medicineId]
    );

    if (existingMedicine.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Medicine not found' },
        { status: 404 }
      );
    }

    const medicine = existingMedicine[0];

    if (action === 'stock') {
      // Stock adjustment
      const transactionType = updateData.transactionType; // 'purchase', 'sale', 'adjustment', 'return', 'expired'
      const quantity = parseInt(updateData.quantity);
      const unitPrice = updateData.unitPrice || medicine.unit_price;

      if (!transactionType || !quantity) {
        return NextResponse.json(
          { success: false, message: 'Transaction type and quantity are required' },
          { status: 400 }
        );
      }

      // Calculate new stock based on transaction type
      let newStock = medicine.current_stock;
      if (['purchase', 'return', 'adjustment'].includes(transactionType)) {
        newStock += Math.abs(quantity);
      } else if (['sale', 'expired'].includes(transactionType)) {
        newStock -= Math.abs(quantity);
        if (newStock < 0) {
          return NextResponse.json(
            { success: false, message: 'Insufficient stock for this transaction' },
            { status: 400 }
          );
        }
      }

      const totalAmount = Math.abs(quantity) * unitPrice;

      // Execute stock transaction
      const transactionQueries = [
        {
          query: 'UPDATE medicines SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          params: [newStock, medicineId]
        },
        {
          query: `INSERT INTO medicine_stock_transactions 
                  (medicine_id, transaction_type, quantity, unit_price, total_amount, batch_number, 
                   expiry_date, supplier, reference_id, notes, created_by, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          params: [
            medicineId,
            transactionType,
            transactionType === 'sale' || transactionType === 'expired' ? -Math.abs(quantity) : Math.abs(quantity),
            unitPrice,
            totalAmount,
            updateData.batchNumber || null,
            updateData.expiryDate ? dbUtils.formatDate(updateData.expiryDate) : null,
            updateData.supplier || null,
            updateData.referenceId || null,
            updateData.notes || null,
            authResult.user.userId
          ]
        }
      ];

      await executeTransaction(transactionQueries);

      // Create low stock notification if needed
      if (newStock <= medicine.minimum_stock) {
        await executeQuery(
          `INSERT INTO system_notifications (notification_id, user_id, notification_type, title, message, priority, created_at)
           SELECT ?, u.id, 'low_stock', ?, ?, 'high', CURRENT_TIMESTAMP
           FROM users u 
           WHERE u.role IN ('admin', 'pharmacy') AND u.is_active = TRUE`,
          [
            dbUtils.generateId('NOT'),
            'Low Stock Alert',
            `${medicine.name} is running low (${newStock} remaining)`
          ]
        );
      }

      // Log the stock transaction
      await executeQuery(
        `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, additional_info, created_at) 
         VALUES (?, ?, 'UPDATE', 'medicines', ?, ?, CURRENT_TIMESTAMP)`,
        [
          dbUtils.generateId('LOG'),
          authResult.user.userId,
          medicineId,
          JSON.stringify({ 
            action: 'stock_transaction', 
            type: transactionType, 
            quantity: quantity,
            old_stock: medicine.current_stock,
            new_stock: newStock
          })
        ]
      );

      return NextResponse.json({
        success: true,
        message: 'Stock updated successfully',
        data: {
          oldStock: medicine.current_stock,
          newStock: newStock,
          transactionType: transactionType,
          quantity: quantity
        }
      });

    } else {
      // Regular medicine update
      const updateFields = {};
      
      if (updateData.name) updateFields.name = updateData.name;
      if (updateData.genericName !== undefined) updateFields.generic_name = updateData.genericName;
      if (updateData.brandName !== undefined) updateFields.brand_name = updateData.brandName;
      if (updateData.category !== undefined) updateFields.category = updateData.category;
      if (updateData.manufacturer !== undefined) updateFields.manufacturer = updateData.manufacturer;
      if (updateData.composition !== undefined) updateFields.composition = updateData.composition;
      if (updateData.strength !== undefined) updateFields.strength = updateData.strength;
      if (updateData.packSize !== undefined) updateFields.pack_size = updateData.packSize;
      if (updateData.unitPrice !== undefined) updateFields.unit_price = updateData.unitPrice;
      if (updateData.mrp !== undefined) updateFields.mrp = updateData.mrp;
      if (updateData.minimumStock !== undefined) updateFields.minimum_stock = updateData.minimumStock;
      if (updateData.maximumStock !== undefined) updateFields.maximum_stock = updateData.maximumStock;
      if (updateData.expiryDate !== undefined) updateFields.expiry_date = updateData.expiryDate ? dbUtils.formatDate(updateData.expiryDate) : null;
      if (updateData.batchNumber !== undefined) updateFields.batch_number = updateData.batchNumber;
      if (updateData.supplier !== undefined) updateFields.supplier = updateData.supplier;
      if (updateData.storageConditions !== undefined) updateFields.storage_conditions = updateData.storageConditions;
      if (updateData.sideEffects !== undefined) updateFields.side_effects = updateData.sideEffects;
      if (updateData.contraindications !== undefined) updateFields.contraindications = updateData.contraindications;
      if (updateData.drugInteractions !== undefined) updateFields.drug_interactions = updateData.drugInteractions;
      if (updateData.pregnancyCategory !== undefined) updateFields.pregnancy_category = updateData.pregnancyCategory;
      if (updateData.prescriptionRequired !== undefined) updateFields.prescription_required = updateData.prescriptionRequired;

      updateFields.updated_at = new Date();

      // Update medicine
      const { query, params } = dbUtils.buildUpdateQuery('medicines', updateFields, { id: medicineId });
      await executeQuery(query, params);

      // Log the update
      await executeQuery(
        `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, old_values, new_values, created_at) 
         VALUES (?, ?, 'UPDATE', 'medicines', ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          dbUtils.generateId('LOG'),
          authResult.user.userId,
          medicineId,
          JSON.stringify(existingMedicine[0]),
          JSON.stringify(updateFields)
        ]
      );

      return NextResponse.json({
        success: true,
        message: 'Medicine updated successfully'
      });
    }

  } catch (error) {
    console.error('Error updating medicine:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update medicine' },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate medicine
export async function DELETE(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    // Check permissions
    if (!['super-admin', 'admin'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to delete medicines' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const medicineId = searchParams.get('id');
    
    if (!medicineId) {
      return NextResponse.json(
        { success: false, message: 'Medicine ID is required' },
        { status: 400 }
      );
    }

    // Get existing medicine
    const existingMedicine = await executeQuery(
      'SELECT * FROM medicines WHERE id = ? AND is_active = TRUE',
      [medicineId]
    );

    if (existingMedicine.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Medicine not found' },
        { status: 404 }
      );
    }

    // Check if medicine is used in any active prescriptions
    const activePrescriptions = await executeQuery(
      `SELECT COUNT(*) as count FROM prescription_medications pm
       INNER JOIN prescriptions p ON pm.prescription_id = p.id
       WHERE pm.medicine_id = ? AND p.status = 'active'`,
      [medicineId]
    );

    if (activePrescriptions[0].count > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete medicine that is used in active prescriptions' },
        { status: 400 }
      );
    }

    // Soft delete medicine
    await executeQuery(
      'UPDATE medicines SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [medicineId]
    );

    // Log the deletion
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, old_values, created_at) 
       VALUES (?, ?, 'DELETE', 'medicines', ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        medicineId,
        JSON.stringify(existingMedicine[0])
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Medicine deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting medicine:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete medicine' },
      { status: 500 }
    );
  }
}
