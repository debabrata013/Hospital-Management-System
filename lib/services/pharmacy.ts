const { executeQuery, dbUtils } = require('@/lib/mysql-connection')

export interface Medicine {
  id: string
  name: string
  generic_name?: string
  category: string
  manufacturer?: string
  unit_price: number
  current_stock: number
  minimum_stock: number
  maximum_stock: number
  unit: string
  description?: string
}

export interface Vendor {
  id: string
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  status: 'active' | 'inactive'
}

export interface Prescription {
  id: string
  prescription_number: string
  patient_id: string
  patient_name: string
  doctor_id: string
  doctor_name: string
  status: 'pending' | 'dispensed' | 'partially_dispensed' | 'cancelled'
  total_amount: number
  items?: PrescriptionItem[]
}

export interface PrescriptionItem {
  id: string
  medicine_id: string
  medicine_name: string
  quantity: number
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  unit_price: number
  total_price: number
  dispensed_quantity: number
}

export class PharmacyService {
  // Medicine operations
  async getMedicines(filters: any = {}) {
    let query = `
      SELECT m.*,
             COALESCE(COUNT(mst.id), 0) as batch_count,
             COALESCE(SUM(CASE WHEN mst.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN mst.quantity ELSE 0 END), 0) as expiring_stock
      FROM medicines m
      LEFT JOIN medicine_stock_transactions mst ON m.id = mst.medicine_id AND mst.transaction_type = 'purchase'
      WHERE m.is_active = 1
    `
    const params: any[] = []

    if (filters.search) {
      query += ` AND (m.name LIKE ? OR m.generic_name LIKE ? OR m.brand_name LIKE ?)`
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`)
    }

    if (filters.category) {
      query += ` AND m.category = ?`
      params.push(filters.category)
    }

    if (filters.low_stock) {
      query += ` AND m.current_stock <= m.minimum_stock`
    }

    query += ` GROUP BY m.id ORDER BY m.name`

    if (filters.limit) {
      query += ` LIMIT ?`
      params.push(parseInt(filters.limit))
    }

    try {
      return await executeQuery(query, params) as Medicine[]
    } catch (error) {
      console.error('Error in getMedicines:', error)
      return []
    }
  }

  async getMedicineById(id: string) {
    const query = `SELECT * FROM medicines WHERE medicine_id = ? OR id = ?`
    try {
      const results = await executeQuery(query, [id, id]) as any[]
      return results[0] || null
    } catch (error) {
      console.error('Error in getMedicineById:', error)
      return null
    }
  }

  async createMedicine(data: Partial<Medicine>) {
    const medicineId = dbUtils.generateId('MED')
    try {
      const query = `
        INSERT INTO medicines (
          medicine_id, name, generic_name, brand_name, category, manufacturer, 
          composition, strength, dosage_form, pack_size, unit_price, mrp, 
          current_stock, minimum_stock, maximum_stock, batch_number, expiry_date, 
          supplier, storage_conditions, side_effects, contraindications, 
          drug_interactions, pregnancy_category, prescription_required, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `
      await executeQuery(query, [
        medicineId,
        data.name,
        data.generic_name || null,
        data.brand_name || null,
        data.category || null,
        data.manufacturer || null,
        data.composition || null,
        data.strength || null,
        data.dosage_form || 'tablet',
        data.pack_size || null,
        data.unit_price || 0,
        data.mrp || 0,
        data.current_stock || 0,
        data.minimum_stock || 10,
        data.maximum_stock || 1000,
        data.batch_number || null,
        data.expiry_date ? dbUtils.formatDate(data.expiry_date) : null,
        data.supplier || null,
        data.storage_conditions || null,
        data.side_effects || null,
        data.contraindications || null,
        data.drug_interactions || null,
        data.pregnancy_category || 'Unknown',
        data.prescription_required !== false
      ])
      
      // Create initial stock transaction if stock > 0
      if (data.current_stock && Number(data.current_stock) > 0) {
        await this.createStockTransaction({
          medicine_id: medicineId,
          transaction_type: 'purchase',
          quantity: Number(data.current_stock),
          unit_price: data.unit_price || 0,
          batch_number: data.batch_number,
          expiry_date: data.expiry_date,
          supplier: data.supplier,
          notes: 'Initial stock entry'
        })
      }
      
      return this.getMedicineById(medicineId)
    } catch (error) {
      console.error('Error in createMedicine:', error)
      throw new Error('Failed to create medicine. Please check the database connection.')
    }
  }

  async updateMedicine(id: string, data: Partial<Medicine>) {
    const query = `
      UPDATE medicines 
      SET name = ?, generic_name = ?, brand_name = ?, category = ?, manufacturer = ?, 
          composition = ?, strength = ?, dosage_form = ?, pack_size = ?, unit_price = ?, 
          mrp = ?, minimum_stock = ?, maximum_stock = ?, batch_number = ?, expiry_date = ?,
          supplier = ?, storage_conditions = ?, side_effects = ?, contraindications = ?,
          drug_interactions = ?, pregnancy_category = ?, prescription_required = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE medicine_id = ? OR id = ?
    `
    await executeQuery(query, [
      data.name, data.generic_name, data.brand_name, data.category, data.manufacturer,
      data.composition, data.strength, data.dosage_form, data.pack_size, data.unit_price,
      data.mrp, data.minimum_stock, data.maximum_stock, data.batch_number,
      data.expiry_date ? dbUtils.formatDate(data.expiry_date) : null,
      data.supplier, data.storage_conditions, data.side_effects, data.contraindications,
      data.drug_interactions, data.pregnancy_category, data.prescription_required,
      id, id
    ])
    return this.getMedicineById(id)
  }

  async deleteMedicine(id: string) {
    const query = `UPDATE medicines SET is_active = 0 WHERE medicine_id = ? OR id = ?`
    await executeQuery(query, [id, id])
    return true
  }

  // Stock transaction operations
  async createStockTransaction(data: any) {
    try {
      const query = `
        INSERT INTO medicine_stock_transactions (
          medicine_id, transaction_type, quantity, unit_price, total_amount,
          batch_number, expiry_date, supplier, reference_id, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `
      await executeQuery(query, [
        data.medicine_id,
        data.transaction_type,
        data.quantity,
        data.unit_price || 0,
        (data.quantity || 0) * (data.unit_price || 0),
        data.batch_number || null,
        data.expiry_date ? dbUtils.formatDate(data.expiry_date) : null,
        data.supplier || null,
        data.reference_id || null,
        data.notes || null
      ])
      
      // Update medicine stock
      if (data.transaction_type === 'purchase') {
        await executeQuery(
          `UPDATE medicines SET current_stock = current_stock + ? WHERE medicine_id = ?`,
          [data.quantity, data.medicine_id]
        )
      } else if (data.transaction_type === 'sale') {
        await executeQuery(
          `UPDATE medicines SET current_stock = current_stock - ? WHERE medicine_id = ?`,
          [data.quantity, data.medicine_id]
        )
      }
      
      return true
    } catch (error) {
      console.error('Error in createStockTransaction:', error)
      throw error
    }
  }

  async getStockTransactions(medicineId?: string, filters: any = {}) {
    let query = `
      SELECT mst.*, m.name as medicine_name
      FROM medicine_stock_transactions mst
      JOIN medicines m ON mst.medicine_id = m.medicine_id
      WHERE 1=1
    `
    const params: any[] = []

    if (medicineId) {
      query += ` AND mst.medicine_id = ?`
      params.push(medicineId)
    }

    if (filters.transaction_type) {
      query += ` AND mst.transaction_type = ?`
      params.push(filters.transaction_type)
    }

    if (filters.start_date) {
      query += ` AND DATE(mst.created_at) >= ?`
      params.push(filters.start_date)
    }

    if (filters.end_date) {
      query += ` AND DATE(mst.created_at) <= ?`
      params.push(filters.end_date)
    }

    query += ` ORDER BY mst.created_at DESC`

    if (filters.limit) {
      query += ` LIMIT ?`
      params.push(parseInt(filters.limit))
    }

    try {
      return await executeQuery(query, params)
    } catch (error) {
      console.error('Error in getStockTransactions:', error)
      return []
    }
  }

  // Vendor operations
  async getVendors(filters: any = {}) {
    try {
      // Simple query without JOIN to avoid missing table issues
      let query = `SELECT * FROM vendors WHERE 1=1`
      const params: any[] = []

      if (filters.search) {
        query += ` AND (vendor_name LIKE ? OR contact_person LIKE ?)`
        params.push(`%${filters.search}%`, `%${filters.search}%`)
      }

      if (filters.vendor_type) {
        query += ` AND vendor_type = ?`
        params.push(filters.vendor_type)
      }

      query += ` ORDER BY vendor_name`
      
      if (filters.limit) {
        query += ` LIMIT ?`
        params.push(parseInt(filters.limit))
      }

      return await executeQuery(query, params) as Vendor[]
    } catch (error) {
      console.error('Error in getVendors:', error)
      // Return empty array if table doesn't exist
      return []
    }
  }

  async createVendor(data: Partial<Vendor>) {
    try {
      // Try to create vendors table if it doesn't exist
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS vendors (
          id INT PRIMARY KEY AUTO_INCREMENT,
          vendor_id VARCHAR(20) UNIQUE NOT NULL,
          vendor_name VARCHAR(100) NOT NULL,
          contact_person VARCHAR(100),
          email VARCHAR(255),
          phone VARCHAR(15) NOT NULL,
          address TEXT,
          city VARCHAR(50),
          state VARCHAR(50),
          pincode VARCHAR(10),
          gst_number VARCHAR(15),
          pan_number VARCHAR(10),
          vendor_type ENUM('medicine', 'equipment', 'supplies', 'services', 'other') DEFAULT 'medicine',
          payment_terms VARCHAR(100),
          credit_limit DECIMAL(12,2) DEFAULT 0.00,
          is_active BOOLEAN DEFAULT TRUE,
          rating DECIMAL(2,1) DEFAULT 0.0,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `, [])

      const vendorId = dbUtils.generateId('VEN')
      const query = `
        INSERT INTO vendors (
          vendor_id, vendor_name, contact_person, email, phone, address, 
          city, state, pincode, gst_number, pan_number, vendor_type, 
          payment_terms, credit_limit, is_active, rating, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `
      await executeQuery(query, [
        vendorId,
        data.name || data.vendor_name,
        data.contact_person || null,
        data.email || null,
        data.phone,
        data.address || null,
        data.city || null,
        data.state || null,
        data.pincode || null,
        data.gst_number || null,
        data.pan_number || null,
        data.vendor_type || 'medicine',
        data.payment_terms || null,
        data.credit_limit || 0,
        data.rating || 0,
        data.notes || null
      ])
      return { id: vendorId, vendor_id: vendorId, ...data }
    } catch (error) {
      console.error('Error in createVendor:', error)
      throw new Error('Failed to create vendor. Please check the database connection.')
    }
  }

  async updateVendor(id: string, data: Partial<Vendor>) {
    try {
      const query = `
        UPDATE vendors 
        SET vendor_name = ?, contact_person = ?, email = ?, phone = ?, address = ?,
            city = ?, state = ?, pincode = ?, gst_number = ?, pan_number = ?,
            vendor_type = ?, payment_terms = ?, credit_limit = ?, rating = ?,
            notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE vendor_id = ? OR id = ?
      `
      await executeQuery(query, [
        data.name || data.vendor_name,
        data.contact_person || null,
        data.email || null,
        data.phone,
        data.address || null,
        data.city || null,
        data.state || null,
        data.pincode || null,
        data.gst_number || null,
        data.pan_number || null,
        data.vendor_type || 'medicine',
        data.payment_terms || null,
        data.credit_limit || 0,
        data.rating || 0,
        data.notes || null,
        id, id
      ])
      return { id, ...data }
    } catch (error) {
      console.error('Error in updateVendor:', error)
      throw new Error('Failed to update vendor.')
    }
  }

  async deleteVendor(id: string) {
    try {
      const query = `UPDATE vendors SET is_active = 0 WHERE vendor_id = ? OR id = ?`
      await executeQuery(query, [id, id])
      return true
    } catch (error) {
      console.error('Error in deleteVendor:', error)
      throw new Error('Failed to delete vendor.')
    }
  }
  async getPrescriptions(filters: any = {}) {
    let query = `
      SELECT p.*,
             pt.name as patient_name,
             u.name as doctor_name,
             COALESCE(COUNT(pm.id), 0) as item_count,
             COALESCE(SUM(pm.total_price), p.total_amount) as calculated_total
      FROM prescriptions p
      LEFT JOIN patients pt ON p.patient_id = pt.id
      LEFT JOIN users u ON p.doctor_id = u.id
      LEFT JOIN prescription_medications pm ON p.id = pm.prescription_id
      WHERE 1=1
    `
    const params: any[] = []

    if (filters.status) {
      query += ` AND p.status = ?`
      params.push(filters.status)
    }

    if (filters.search) {
      query += ` AND (pt.name LIKE ? OR u.name LIKE ? OR p.prescription_id LIKE ?)`
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`)
    }

    if (filters.patient_id) {
      query += ` AND p.patient_id = ?`
      params.push(filters.patient_id)
    }

    if (filters.doctor_id) {
      query += ` AND p.doctor_id = ?`
      params.push(filters.doctor_id)
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`

    if (filters.limit) {
      query += ` LIMIT ?`
      params.push(parseInt(filters.limit))
    }

    try {
      return await executeQuery(query, params) as Prescription[]
    } catch (error) {
      console.error('Error in getPrescriptions:', error)
      return []
    }
  }

  async getPrescriptionById(id: string) {
    const prescriptionQuery = `
      SELECT p.*,
             pt.name as patient_name,
             u.name as doctor_name
      FROM prescriptions p
      LEFT JOIN patients pt ON p.patient_id = pt.id
      LEFT JOIN users u ON p.doctor_id = u.id
      WHERE p.id = ? OR p.prescription_id = ?
    `
    
    try {
      const [prescription] = await executeQuery(prescriptionQuery, [id, id]) as any[]
      
      if (prescription) {
        // Get prescription items
        const itemsQuery = `
          SELECT pm.*,
                 m.name as medicine_name,
                 m.unit_price as current_unit_price
          FROM prescription_medications pm
          LEFT JOIN medicines m ON pm.medicine_id = m.id
          WHERE pm.prescription_id = ?
        `
        prescription.items = await executeQuery(itemsQuery, [prescription.id])
      }
      
      return prescription
    } catch (error) {
      console.error('Error in getPrescriptionById:', error)
      return null
    }
  }

  async createPrescription(data: any) {
    const prescriptionId = dbUtils.generateId('RX')
    
    try {
      // Insert prescription
      const prescriptionQuery = `
        INSERT INTO prescriptions (
          prescription_id, patient_id, doctor_id, appointment_id, medical_record_id,
          prescription_date, total_amount, status, notes, follow_up_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
      `
      await executeQuery(prescriptionQuery, [
        prescriptionId,
        data.patient_id,
        data.doctor_id,
        data.appointment_id || null,
        data.medical_record_id || null,
        dbUtils.formatDate(data.prescription_date || new Date()),
        data.total_amount || 0,
        data.notes || null,
        data.follow_up_date ? dbUtils.formatDate(data.follow_up_date) : null
      ])

      // Get the inserted prescription ID
      const [insertedPrescription] = await executeQuery(
        `SELECT id FROM prescriptions WHERE prescription_id = ?`,
        [prescriptionId]
      ) as any[]

      // Insert prescription items
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          await executeQuery(`
            INSERT INTO prescription_medications (
              prescription_id, medicine_id, medicine_name, dosage, frequency, 
              duration, quantity, unit_price, total_price, instructions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            insertedPrescription.id,
            item.medicine_id,
            item.medicine_name,
            item.dosage,
            item.frequency,
            item.duration,
            item.quantity,
            item.unit_price,
            item.quantity * item.unit_price,
            item.instructions || null
          ])
        }
      }

      return this.getPrescriptionById(prescriptionId)
    } catch (error) {
      console.error('Error in createPrescription:', error)
      throw error
    }
  }

  async dispensePrescription(id: string, items: any[]) {
    try {
      // Update prescription status
      await executeQuery(`UPDATE prescriptions SET status = 'completed' WHERE id = ? OR prescription_id = ?`, [id, id])

      // Mark items as dispensed and create stock transactions
      for (const item of items) {
        await executeQuery(`
          UPDATE prescription_medications 
          SET is_dispensed = 1, dispensed_at = CURRENT_TIMESTAMP, dispensed_by = 1
          WHERE prescription_id = (SELECT id FROM prescriptions WHERE id = ? OR prescription_id = ?) 
          AND medicine_id = ?
        `, [id, id, item.medicine_id])

        // Create stock transaction for sale
        await this.createStockTransaction({
          medicine_id: item.medicine_id,
          transaction_type: 'sale',
          quantity: item.quantity,
          unit_price: item.unit_price,
          reference_id: id,
          notes: `Dispensed from prescription ${id}`
        })
      }

      return this.getPrescriptionById(id)
    } catch (error) {
      console.error('Error in dispensePrescription:', error)
      throw error
    }
  }

  // Stock alerts
  async getStockAlerts() {
    const query = `
      SELECT m.*,
             mst.batch_number,
             mst.expiry_date,
             mst.quantity as batch_quantity,
             CASE 
               WHEN m.current_stock = 0 THEN 'out_of_stock'
               WHEN m.current_stock <= m.minimum_stock THEN 'low_stock'
               WHEN mst.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expiring'
               ELSE 'normal'
             END as alert_type
      FROM medicines m
      LEFT JOIN medicine_stock_transactions mst ON m.id = mst.medicine_id 
        AND mst.transaction_type = 'purchase' 
        AND mst.expiry_date IS NOT NULL
      WHERE (m.current_stock <= m.minimum_stock 
        OR mst.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY))
        AND m.is_active = 1
      ORDER BY 
        CASE 
          WHEN m.current_stock = 0 THEN 1
          WHEN m.current_stock <= m.minimum_stock THEN 2
          WHEN mst.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 3
          ELSE 4
        END,
        m.name
    `
    try {
      return await executeQuery(query, [])
    } catch (error) {
      console.error('Error in getStockAlerts:', error)
      return []
    }
  }

  // Dashboard statistics
  async getDashboardStats() {
    const results: any = {}
    
    try {
      // Total medicines
      const [medicinesResult] = await executeQuery(`
        SELECT COUNT(*) as count FROM medicines WHERE is_active = 1
      `, []) as any[]
      results.totalMedicines = medicinesResult.count || 0

      // Low stock
      const [lowStockResult] = await executeQuery(`
        SELECT COUNT(*) as count FROM medicines 
        WHERE current_stock <= minimum_stock AND is_active = 1
      `, []) as any[]
      results.lowStock = lowStockResult.count || 0

      // Expiring soon (within 30 days)
      const [expiringSoonResult] = await executeQuery(`
        SELECT COUNT(DISTINCT m.id) as count 
        FROM medicines m
        JOIN medicine_stock_transactions mst ON m.id = mst.medicine_id
        WHERE mst.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND mst.expiry_date > CURDATE()
        AND m.is_active = 1
      `, []) as any[]
      results.expiringSoon = expiringSoonResult.count || 0

      // Total value
      const [valueResult] = await executeQuery(`
        SELECT SUM(current_stock * unit_price) as value 
        FROM medicines WHERE is_active = 1
      `, []) as any[]
      results.totalValue = valueResult.value || 0

      // Prescription stats
      const [totalPrescriptionsResult] = await executeQuery(`
        SELECT COUNT(*) as count FROM prescriptions 
        WHERE DATE(created_at) = CURDATE()
      `, []) as any[]
      results.totalPrescriptions = totalPrescriptionsResult.count || 0

      const [activePrescriptionsResult] = await executeQuery(`
        SELECT COUNT(*) as count FROM prescriptions WHERE status = 'active'
      `, []) as any[]
      results.activePrescriptions = activePrescriptionsResult.count || 0

      const [completedPrescriptionsResult] = await executeQuery(`
        SELECT COUNT(*) as count FROM prescriptions 
        WHERE status = 'completed' AND DATE(created_at) = CURDATE()
      `, []) as any[]
      results.completedPrescriptions = completedPrescriptionsResult.count || 0

      const [pendingDispensingResult] = await executeQuery(`
        SELECT COUNT(*) as count FROM prescriptions 
        WHERE status IN ('active', 'partial')
      `, []) as any[]
      results.pendingDispensing = pendingDispensingResult.count || 0

    } catch (error) {
      console.error('Error in getDashboardStats:', error)
      // Return default values if database queries fail
      results.totalMedicines = 0
      results.lowStock = 0
      results.expiringSoon = 0
      results.totalValue = 0
      results.totalPrescriptions = 0
      results.activePrescriptions = 0
      results.completedPrescriptions = 0
      results.pendingDispensing = 0
    }

    return results
  }
}
