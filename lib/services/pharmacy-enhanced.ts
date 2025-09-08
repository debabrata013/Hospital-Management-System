import { PharmacyService } from './pharmacy'

export class EnhancedPharmacyService extends PharmacyService {
  
  // Enhanced dispensePrescription with comprehensive auto-billing
  async dispensePrescriptionWithAutoBilling(id: string, items: any[]) {
    const { executeQuery, executeTransaction, dbUtils } = require('@/lib/mysql-connection')
    
    try {
      // Validate inputs
      if (!id || !items || items.length === 0) {
        throw new Error('Invalid prescription ID or items')
      }

      // Get prescription details for billing
      const prescription = await this.getPrescriptionById(id)
      if (!prescription) {
        throw new Error('Prescription not found')
      }

      if (prescription.status === 'completed') {
        throw new Error('Prescription already dispensed')
      }

      // Prepare transaction queries
      const queries = []
      let totalAmount = 0

      // Update prescription status
      queries.push({
        query: `UPDATE prescriptions SET status = 'completed' WHERE id = ? OR prescription_id = ?`,
        params: [id, id]
      })

      // Process each item
      for (const item of items) {
        // Validate item
        if (!item.medicine_id || !item.quantity || !item.unit_price) {
          throw new Error(`Invalid item data for medicine ${item.medicine_name}`)
        }

        const itemTotal = item.quantity * item.unit_price
        totalAmount += itemTotal

        // Mark item as dispensed
        queries.push({
          query: `
            UPDATE prescription_medications 
            SET is_dispensed = 1, dispensed_at = CURRENT_TIMESTAMP, dispensed_by = 1
            WHERE prescription_id = (SELECT id FROM prescriptions WHERE id = ? OR prescription_id = ?) 
            AND medicine_id = ?
          `,
          params: [id, id, item.medicine_id]
        })

        // Update medicine stock
        queries.push({
          query: `UPDATE medicines SET current_stock = current_stock - ? WHERE id = ?`,
          params: [item.quantity, item.medicine_id]
        })

        // Create stock transaction
        queries.push({
          query: `
            INSERT INTO medicine_stock_transactions (
              medicine_id, transaction_type, quantity, unit_price, total_amount,
              reference_id, notes, created_by
            ) VALUES (?, 'sale', ?, ?, ?, ?, ?, 1)
          `,
          params: [
            item.medicine_id, 
            item.quantity, 
            item.unit_price, 
            itemTotal, 
            id, 
            `Auto-dispensed from prescription ${id}`
          ]
        })
      }

      // Auto-create billing entry if total > 0
      if (totalAmount > 0) {
        const billId = dbUtils.generateId('BILL')
        
        // Create main bill record with prescription reference
        queries.push({
          query: `
            INSERT INTO billing (
              bill_id, patient_id, bill_date, bill_type, subtotal, total_amount,
              paid_amount, balance_amount, payment_status, payment_method, 
              reference_id, notes, created_by
            ) VALUES (?, ?, CURDATE(), 'pharmacy', ?, ?, 0, ?, 'pending', 'cash', ?, ?, 1)
          `,
          params: [
            billId, 
            prescription.patient_id, 
            totalAmount, 
            totalAmount, 
            totalAmount, 
            id, 
            `Auto-generated from prescription ${id}`
          ]
        })

        // Add billing items (will be added after getting billing ID)
        const billItemsData = items.map(item => ({
          medicine_name: item.medicine_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }))

        // Execute all queries in transaction
        await executeTransaction(queries)

        // Get the created billing record ID and add items
        const [billRecord] = await executeQuery(`SELECT id FROM billing WHERE bill_id = ?`, [billId])
        
        if (billRecord) {
          const itemQueries = billItemsData.map(item => ({
            query: `
              INSERT INTO billing_items (
                billing_id, item_type, item_name, quantity, unit_price, 
                total_price, final_amount
              ) VALUES (?, 'medicine', ?, ?, ?, ?, ?)
            `,
            params: [
              billRecord.id, 
              item.medicine_name, 
              item.quantity, 
              item.unit_price, 
              item.total_price, 
              item.total_price
            ]
          }))

          await executeTransaction(itemQueries)
        }

        return {
          success: true,
          prescription: await this.getPrescriptionById(id),
          bill: { bill_id: billId, total_amount: totalAmount },
          message: `Prescription dispensed and bill ${billId} created automatically`
        }
      } else {
        // Execute queries without billing
        await executeTransaction(queries)
        
        return {
          success: true,
          prescription: await this.getPrescriptionById(id),
          message: 'Prescription dispensed successfully'
        }
      }

    } catch (error) {
      console.error('Error in dispensePrescriptionWithAutoBilling:', error)
      throw new Error(`Failed to dispense prescription: ${error.message}`)
    }
  }

  // Enhanced offline bill creation with validation
  async createOfflineBillWithValidation(billData: any) {
    try {
      // Validate bill data
      if (!billData.patient_id || !billData.items || billData.items.length === 0) {
        throw new Error('Invalid bill data: missing patient or items')
      }

      // Validate each item
      for (const item of billData.items) {
        if (!item.medicine_name || !item.bill_quantity || !item.unit_price) {
          throw new Error(`Invalid item: ${item.medicine_name}`)
        }
      }

      // Calculate and validate total
      const calculatedTotal = billData.items.reduce((sum: number, item: any) => 
        sum + (item.bill_quantity * item.unit_price), 0
      )

      if (Math.abs(calculatedTotal - billData.total_amount) > 0.01) {
        throw new Error('Total amount mismatch')
      }

      // Create enhanced bill data
      const enhancedBillData = {
        ...billData,
        bill_id: `OFFLINE_${Date.now()}`,
        created_at: new Date().toISOString(),
        status: 'offline_pending',
        validation_passed: true
      }

      return enhancedBillData

    } catch (error) {
      console.error('Error in createOfflineBillWithValidation:', error)
      throw error
    }
  }

  // Enhanced sync with retry mechanism
  async syncOfflineDataWithRetry(maxRetries = 3) {
    let retryCount = 0
    let lastError = null

    while (retryCount < maxRetries) {
      try {
        const result = await this.syncOfflineData()
        return {
          success: true,
          syncedCount: result,
          retries: retryCount
        }
      } catch (error) {
        lastError = error
        retryCount++
        
        if (retryCount < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
        }
      }
    }

    throw new Error(`Sync failed after ${maxRetries} retries: ${lastError?.message}`)
  }
}

export const enhancedPharmacyService = new EnhancedPharmacyService()
