import { NextRequest, NextResponse } from 'next/server'
const { executeQuery, executeTransaction, dbUtils } = require('@/lib/mysql-connection')

export async function POST(request: NextRequest) {
  try {
    const { patient_id, items, payment_method, total_amount } = await request.json()

    if (!patient_id || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid billing data' })
    }

    const billId = dbUtils.generateId('BILL')
    
    // Create transaction queries
    const queries = []

    // Create main bill record
    queries.push({
      query: `
        INSERT INTO billing (
          bill_id, patient_id, bill_date, bill_type, subtotal, total_amount,
          paid_amount, balance_amount, payment_status, payment_method, created_by
        ) VALUES (?, ?, CURDATE(), 'pharmacy', ?, ?, ?, 0, 'paid', ?, 1)
      `,
      params: [billId, patient_id, total_amount, total_amount, total_amount, payment_method]
    })

    // Get the billing record ID for items
    const [billRecord] = await executeQuery(
      `SELECT id FROM billing WHERE bill_id = ?`,
      [billId]
    )

    // Add billing items and update stock
    for (const item of items) {
      const itemTotal = item.unit_price * item.bill_quantity

      // Add billing item
      queries.push({
        query: `
          INSERT INTO billing_items (
            billing_id, item_type, item_name, quantity, unit_price, 
            total_price, final_amount
          ) VALUES (?, 'medicine', ?, ?, ?, ?, ?)
        `,
        params: [
          billRecord?.id || 1, 'medicine', item.medicine_name, 
          item.bill_quantity, item.unit_price, itemTotal, itemTotal
        ]
      })

      // Update medicine stock
      queries.push({
        query: `
          UPDATE medicines 
          SET current_stock = current_stock - ? 
          WHERE medicine_id = ?
        `,
        params: [item.bill_quantity, item.medicine_id]
      })

      // Create stock transaction
      queries.push({
        query: `
          INSERT INTO medicine_stock_transactions (
            medicine_id, transaction_type, quantity, unit_price, total_amount,
            reference_id, notes, created_by
          ) VALUES (?, 'sale', ?, ?, ?, ?, 'Pharmacy sale', 1)
        `,
        params: [
          item.medicine_id, item.bill_quantity, item.unit_price, 
          itemTotal, billId
        ]
      })

      // Mark prescription item as dispensed if it exists
      if (item.prescription_id) {
        queries.push({
          query: `
            UPDATE prescription_medications 
            SET is_dispensed = 1, dispensed_at = CURRENT_TIMESTAMP, dispensed_by = 1
            WHERE prescription_id = ? AND medicine_id = ?
          `,
          params: [item.prescription_id, item.medicine_id]
        })
      }
    }

    // Execute all queries in transaction
    await executeTransaction(queries)

    return NextResponse.json({ 
      success: true, 
      data: { bill_id: billId, total_amount },
      message: 'Bill created successfully' 
    })

  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create bill' },
      { status: 500 }
    )
  }
}
