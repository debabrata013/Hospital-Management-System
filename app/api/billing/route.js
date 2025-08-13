// Billing Management API Routes - MySQL Implementation
// Hospital Management System - Arogya Hospital

import { NextResponse } from 'next/server';
import { executeQuery, executeTransaction, dbUtils } from '../../../lib/mysql-connection.js';
import { verifyToken } from '../../../lib/auth-middleware.js';

// GET - Fetch bills with filters
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
    const patientId = searchParams.get('patientId');
    const billType = searchParams.get('billType');
    const paymentStatus = searchParams.get('paymentStatus');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    if (patientId) {
      whereConditions.push('b.patient_id = ?');
      queryParams.push(patientId);
    }

    if (billType) {
      whereConditions.push('b.bill_type = ?');
      queryParams.push(billType);
    }

    if (paymentStatus) {
      whereConditions.push('b.payment_status = ?');
      queryParams.push(paymentStatus);
    }

    if (dateFrom) {
      whereConditions.push('b.bill_date >= ?');
      queryParams.push(dateFrom);
    }

    if (dateTo) {
      whereConditions.push('b.bill_date <= ?');
      queryParams.push(dateTo);
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM billing b 
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams);
    const totalBills = countResult[0].total;

    // Get bills with patient details
    const billsQuery = `
      SELECT 
        b.id,
        b.bill_id,
        b.bill_date,
        b.bill_type,
        b.subtotal,
        b.discount_percentage,
        b.discount_amount,
        b.tax_percentage,
        b.tax_amount,
        b.total_amount,
        b.paid_amount,
        b.balance_amount,
        b.payment_status,
        b.payment_method,
        b.insurance_claim_amount,
        b.notes,
        b.created_at,
        p.patient_id,
        p.name as patient_name,
        p.contact_number as patient_contact,
        p.insurance_provider,
        a.appointment_id,
        a.appointment_date,
        creator.name as created_by_name,
        COUNT(bi.id) as item_count
      FROM billing b
      INNER JOIN patients p ON b.patient_id = p.id
      LEFT JOIN appointments a ON b.appointment_id = a.id
      LEFT JOIN users creator ON b.created_by = creator.id
      LEFT JOIN billing_items bi ON b.id = bi.billing_id
      ${whereClause}
      GROUP BY b.id
      ORDER BY b.bill_date DESC, b.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const bills = await executeQuery(billsQuery, [...queryParams, limit, offset]);

    // Get billing items for each bill
    for (let bill of bills) {
      const items = await executeQuery(`
        SELECT 
          bi.id,
          bi.item_type,
          bi.item_name,
          bi.item_code,
          bi.quantity,
          bi.unit_price,
          bi.total_price,
          bi.discount_percentage,
          bi.discount_amount,
          bi.final_amount
        FROM billing_items bi
        WHERE bi.billing_id = ?
        ORDER BY bi.id
      `, [bill.id]);

      bill.items = items;
    }

    return NextResponse.json({
      success: true,
      data: {
        bills,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalBills / limit),
          totalBills,
          hasNextPage: page < Math.ceil(totalBills / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

// POST - Create new bill
export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const billingData = await request.json();

    // Validate required fields
    const requiredFields = ['patientId', 'billType', 'items'];
    for (const field of requiredFields) {
      if (!billingData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(billingData.items) || billingData.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one billing item is required' },
        { status: 400 }
      );
    }

    // Validate patient exists
    const patient = await executeQuery(
      'SELECT id, insurance_provider FROM patients WHERE id = ? AND is_active = TRUE',
      [billingData.patientId]
    );

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }

    // Generate unique bill ID
    const billId = dbUtils.generateId('BILL');

    // Calculate amounts
    let subtotal = 0;
    const itemQueries = [];

    // Process billing items
    for (const item of billingData.items) {
      // Validate item
      if (!item.itemName || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          { success: false, message: 'All item fields (itemName, quantity, unitPrice) are required' },
          { status: 400 }
        );
      }

      const totalPrice = item.quantity * item.unitPrice;
      const discountAmount = (item.discountPercentage || 0) * totalPrice / 100;
      const finalAmount = totalPrice - discountAmount;
      
      subtotal += finalAmount;

      itemQueries.push({
        query: `INSERT INTO billing_items 
                (billing_id, item_type, item_name, item_code, quantity, unit_price, 
                 total_price, discount_percentage, discount_amount, final_amount) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [
          null, // Will be set after bill is created
          item.itemType || 'other',
          item.itemName,
          item.itemCode || null,
          item.quantity,
          item.unitPrice,
          totalPrice,
          item.discountPercentage || 0,
          discountAmount,
          finalAmount
        ]
      });
    }

    // Calculate bill totals
    const discountPercentage = billingData.discountPercentage || 0;
    const discountAmount = (discountPercentage * subtotal / 100) + (billingData.discountAmount || 0);
    const taxPercentage = billingData.taxPercentage || 0;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxPercentage * taxableAmount / 100;
    const totalAmount = taxableAmount + taxAmount;
    const paidAmount = billingData.paidAmount || 0;
    const balanceAmount = totalAmount - paidAmount;

    // Determine payment status
    let paymentStatus = 'pending';
    if (paidAmount >= totalAmount) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    }

    // Prepare bill data
    const billInsertData = {
      bill_id: billId,
      patient_id: billingData.patientId,
      appointment_id: billingData.appointmentId || null,
      bill_date: dbUtils.formatDate(billingData.billDate || new Date()),
      bill_type: billingData.billType,
      subtotal: subtotal,
      discount_percentage: discountPercentage,
      discount_amount: discountAmount,
      tax_percentage: taxPercentage,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      balance_amount: balanceAmount,
      payment_status: paymentStatus,
      payment_method: billingData.paymentMethod || null,
      insurance_claim_amount: billingData.insuranceClaimAmount || 0,
      notes: billingData.notes || null,
      created_by: authResult.user.userId
    };

    // Execute transaction
    const transactionQueries = [];

    // Insert bill
    const { query: billQuery, params: billParams } = 
      dbUtils.buildInsertQuery('billing', billInsertData);
    transactionQueries.push({ query: billQuery, params: billParams });

    const results = await executeTransaction(transactionQueries);
    const billDbId = results[0].insertId;

    // Insert billing items
    const itemInsertQueries = itemQueries.map(iq => ({
      query: iq.query,
      params: [billDbId, ...iq.params.slice(1)]
    }));

    await executeTransaction(itemInsertQueries);

    // Create payment transaction if payment was made
    if (paidAmount > 0) {
      const transactionId = dbUtils.generateId('TXN');
      await executeQuery(
        `INSERT INTO payment_transactions 
         (transaction_id, billing_id, payment_date, payment_method, amount, status, processed_by, created_at)
         VALUES (?, ?, ?, ?, ?, 'success', ?, CURRENT_TIMESTAMP)`,
        [
          transactionId,
          billDbId,
          dbUtils.formatDate(new Date()),
          billingData.paymentMethod || 'cash',
          paidAmount,
          authResult.user.userId
        ]
      );
    }

    // Log the creation
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, new_values, created_at) 
       VALUES (?, ?, 'CREATE', 'billing', ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        billDbId.toString(),
        JSON.stringify(billInsertData)
      ]
    );

    // Create notification for patient (if they have an account)
    const patientUser = await executeQuery(
      'SELECT id FROM users WHERE email = (SELECT email FROM patients WHERE id = ?)',
      [billingData.patientId]
    );

    if (patientUser.length > 0) {
      await executeQuery(
        `INSERT INTO system_notifications (notification_id, user_id, notification_type, title, message, priority, created_at)
         VALUES (?, ?, 'billing', ?, ?, 'medium', CURRENT_TIMESTAMP)`,
        [
          dbUtils.generateId('NOT'),
          patientUser[0].id,
          'New Bill Generated',
          `A new bill of ₹${totalAmount} has been generated for your account`
        ]
      );
    }

    // Fetch the created bill with details
    const createdBill = await executeQuery(`
      SELECT 
        b.*,
        p.name as patient_name,
        p.contact_number as patient_contact,
        creator.name as created_by_name
      FROM billing b
      INNER JOIN patients p ON b.patient_id = p.id
      LEFT JOIN users creator ON b.created_by = creator.id
      WHERE b.id = ?
    `, [billDbId]);

    // Get billing items
    const items = await executeQuery(`
      SELECT * FROM billing_items WHERE billing_id = ?
    `, [billDbId]);

    createdBill[0].items = items;

    return NextResponse.json({
      success: true,
      message: 'Bill created successfully',
      data: {
        bill: createdBill[0]
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create bill' },
      { status: 500 }
    );
  }
}

// PUT - Update bill or process payment
export async function PUT(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const billId = searchParams.get('id');
    const action = searchParams.get('action'); // 'update' or 'payment'
    
    if (!billId) {
      return NextResponse.json(
        { success: false, message: 'Bill ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Get existing bill
    const existingBill = await executeQuery(
      'SELECT * FROM billing WHERE id = ?',
      [billId]
    );

    if (existingBill.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Bill not found' },
        { status: 404 }
      );
    }

    const bill = existingBill[0];

    if (action === 'payment') {
      // Process payment
      const paymentAmount = updateData.paymentAmount;
      const paymentMethod = updateData.paymentMethod || 'cash';

      if (!paymentAmount || paymentAmount <= 0) {
        return NextResponse.json(
          { success: false, message: 'Valid payment amount is required' },
          { status: 400 }
        );
      }

      if (paymentAmount > bill.balance_amount) {
        return NextResponse.json(
          { success: false, message: 'Payment amount cannot exceed balance amount' },
          { status: 400 }
        );
      }

      // Update bill amounts
      const newPaidAmount = parseFloat(bill.paid_amount) + parseFloat(paymentAmount);
      const newBalanceAmount = parseFloat(bill.total_amount) - newPaidAmount;
      
      let newPaymentStatus = 'partial';
      if (newBalanceAmount <= 0) {
        newPaymentStatus = 'paid';
      }

      // Create payment transaction
      const transactionId = dbUtils.generateId('TXN');
      const transactionQueries = [
        {
          query: `UPDATE billing 
                  SET paid_amount = ?, balance_amount = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP 
                  WHERE id = ?`,
          params: [newPaidAmount, newBalanceAmount, newPaymentStatus, billId]
        },
        {
          query: `INSERT INTO payment_transactions 
                  (transaction_id, billing_id, payment_date, payment_method, amount, reference_number, 
                   status, processed_by, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, 'success', ?, CURRENT_TIMESTAMP)`,
          params: [
            transactionId,
            billId,
            dbUtils.formatDate(new Date()),
            paymentMethod,
            paymentAmount,
            updateData.referenceNumber || null,
            authResult.user.userId
          ]
        }
      ];

      await executeTransaction(transactionQueries);

      // Log the payment
      await executeQuery(
        `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, additional_info, created_at) 
         VALUES (?, ?, 'UPDATE', 'billing', ?, ?, CURRENT_TIMESTAMP)`,
        [
          dbUtils.generateId('LOG'),
          authResult.user.userId,
          billId,
          JSON.stringify({ 
            action: 'payment_processed', 
            amount: paymentAmount, 
            method: paymentMethod,
            transaction_id: transactionId
          })
        ]
      );

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          transactionId,
          paidAmount: paymentAmount,
          newBalance: newBalanceAmount,
          paymentStatus: newPaymentStatus
        }
      });

    } else {
      // Regular bill update
      const updateFields = {};
      
      if (updateData.notes !== undefined) updateFields.notes = updateData.notes;
      if (updateData.paymentMethod !== undefined) updateFields.payment_method = updateData.paymentMethod;
      if (updateData.insuranceClaimAmount !== undefined) updateFields.insurance_claim_amount = updateData.insuranceClaimAmount;

      updateFields.updated_at = new Date();

      // Update bill
      const { query, params } = dbUtils.buildUpdateQuery('billing', updateFields, { id: billId });
      await executeQuery(query, params);

      // Log the update
      await executeQuery(
        `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, old_values, new_values, created_at) 
         VALUES (?, ?, 'UPDATE', 'billing', ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          dbUtils.generateId('LOG'),
          authResult.user.userId,
          billId,
          JSON.stringify(existingBill[0]),
          JSON.stringify(updateFields)
        ]
      );

      return NextResponse.json({
        success: true,
        message: 'Bill updated successfully'
      });
    }

  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update bill' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel bill (soft delete)
export async function DELETE(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const billId = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Cancelled by user';
    
    if (!billId) {
      return NextResponse.json(
        { success: false, message: 'Bill ID is required' },
        { status: 400 }
      );
    }

    // Get existing bill
    const existingBill = await executeQuery(
      'SELECT * FROM billing WHERE id = ?',
      [billId]
    );

    if (existingBill.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Bill not found' },
        { status: 404 }
      );
    }

    // Check if bill can be cancelled (no payments made)
    if (existingBill[0].paid_amount > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel bill with payments. Please process refund instead.' },
        { status: 400 }
      );
    }

    // Update bill status to cancelled
    await executeQuery(
      'UPDATE billing SET payment_status = "cancelled", notes = CONCAT(COALESCE(notes, ""), " - CANCELLED: ", ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [reason, billId]
    );

    // Log the cancellation
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, old_values, additional_info, created_at) 
       VALUES (?, ?, 'UPDATE', 'billing', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        billId,
        JSON.stringify(existingBill[0]),
        JSON.stringify({ action: 'cancelled', reason })
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Bill cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling bill:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel bill' },
      { status: 500 }
    );
  }
}
