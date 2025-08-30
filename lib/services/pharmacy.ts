import { executeQuery } from '@/lib/db/connection'

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
             0 as batch_count,
             0 as expiring_stock
      FROM medicines m
      WHERE 1=1
    `
    const params: any[] = []

    if (filters.search) {
      query += ` AND (m.name LIKE ? OR m.generic_name LIKE ?)`
      params.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    if (filters.category) {
      query += ` AND m.category = ?`
      params.push(filters.category)
    }

    query += ` ORDER BY m.name`

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
    const query = `SELECT * FROM medicines WHERE id = ?`
    try {
      const results = await executeQuery(query, [id]) as any[]
      return results[0] || null
    } catch (error) {
      console.error('Error in getMedicineById:', error)
      return null
    }
  }

  async createMedicine(data: Partial<Medicine>) {
    const id = crypto.randomUUID()
    const query = `
      INSERT INTO medicines (id, name, generic_name, category, manufacturer, unit_price, current_stock, minimum_stock, maximum_stock, unit, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    await executeQuery(query, [
      id, data.name, data.generic_name, data.category, data.manufacturer,
      data.unit_price, data.current_stock || 0, data.minimum_stock || 10,
      data.maximum_stock || 1000, data.unit, data.description
    ])
    return this.getMedicineById(id)
  }

  async updateMedicine(id: string, data: Partial<Medicine>) {
    const query = `
      UPDATE medicines 
      SET name = ?, generic_name = ?, category = ?, manufacturer = ?, unit_price = ?, 
          minimum_stock = ?, maximum_stock = ?, unit = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    await executeQuery(query, [
      data.name, data.generic_name, data.category, data.manufacturer,
      data.unit_price, data.minimum_stock, data.maximum_stock, data.unit,
      data.description, id
    ])
    return this.getMedicineById(id)
  }

  // Vendor operations
  async getVendors(filters: any = {}) {
    // Return empty array since vendors table doesn't exist yet
    try {
      // Simple query without JOIN to avoid purchase_orders table dependency
      let query = `SELECT * FROM vendors WHERE 1=1`
      const params: any[] = []

      if (filters.search) {
        query += ` AND (name LIKE ? OR contact_person LIKE ?)`
        params.push(`%${filters.search}%`, `%${filters.search}%`)
      }

      if (filters.status) {
        query += ` AND status = ?`
        params.push(filters.status)
      }

      query += ` ORDER BY name`
      return await executeQuery(query, params) as Vendor[]
    } catch (error) {
      console.error('Error in getVendors:', error)
      // Return empty array if table doesn't exist
      return []
    }
  }

  async createVendor(data: Partial<Vendor>) {
    const id = crypto.randomUUID()
    try {
      const query = `
        INSERT INTO vendors (id, name, contact_person, phone, email, address, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      await executeQuery(query, [
        id, data.name, data.contact_person, data.phone, data.email, data.address, data.status || 'active'
      ])
      return { id, ...data }
    } catch (error) {
      console.error('Error in createVendor:', error)
      throw new Error('Vendors table not available. Please set up the database first.')
    }
  }

  // Prescription operations
  async getPrescriptions(filters: any = {}) {
    let query = `
      SELECT p.*,
             0 as item_count,
             p.total_amount as calculated_total
      FROM prescriptions p
      WHERE 1=1
    `
    const params: any[] = []

    if (filters.status) {
      query += ` AND p.status = ?`
      params.push(filters.status)
    }

    if (filters.search) {
      query += ` AND (p.patient_name LIKE ? OR p.doctor_name LIKE ? OR p.prescription_number LIKE ?)`
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`)
    }

    query += ` ORDER BY p.created_at DESC`

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
    const prescriptionQuery = `SELECT * FROM prescriptions WHERE id = ?`
    
    try {
      const [prescription] = await executeQuery(prescriptionQuery, [id]) as any[]
      
      if (prescription) {
        prescription.items = [] // Empty items array since table doesn't exist yet
      }
      
      return prescription
    } catch (error) {
      console.error('Error in getPrescriptionById:', error)
      return null
    }
  }

  async createPrescription(data: any) {
    const id = crypto.randomUUID()
    const prescriptionNumber = `RX-${Date.now()}`
    
    // Calculate total amount
    let totalAmount = 0
    if (data.items && Array.isArray(data.items)) {
      totalAmount = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    }

    try {
      // Insert prescription
      const prescriptionQuery = `
        INSERT INTO prescriptions (id, prescription_number, patient_id, patient_name, doctor_id, doctor_name, status, total_amount)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
      `
      await executeQuery(prescriptionQuery, [
        id, prescriptionNumber, data.patient_id, data.patient_name, data.doctor_id, data.doctor_name, totalAmount
      ])

      return this.getPrescriptionById(id)
    } catch (error) {
      console.error('Error in createPrescription:', error)
      throw error
    }
  }

  async dispensePrescription(id: string, items: any[]) {
    try {
      // Update prescription status
      await executeQuery(`UPDATE prescriptions SET status = 'dispensed' WHERE id = ?`, [id])

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
             '' as batch_number,
             NULL as expiry_date,
             0 as batch_quantity,
             CASE 
               WHEN m.current_stock = 0 THEN 'out_of_stock'
               WHEN m.current_stock <= m.minimum_stock THEN 'low_stock'
               ELSE 'normal'
             END as alert_type
      FROM medicines m
      WHERE m.current_stock <= m.minimum_stock
      ORDER BY alert_type, m.name
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
      const [medicinesResult] = await executeQuery(`SELECT COUNT(*) as count FROM medicines`, []) as any[]
      results.totalMedicines = medicinesResult.count || 0

      // Low stock
      const [lowStockResult] = await executeQuery(`SELECT COUNT(*) as count FROM medicines WHERE current_stock <= minimum_stock`, []) as any[]
      results.lowStock = lowStockResult.count || 0

      // Expiring soon (simplified - just return 0 since we don't have batches table)
      results.expiringSoon = 0

      // Total value
      const [valueResult] = await executeQuery(`SELECT SUM(current_stock * unit_price) as value FROM medicines`, []) as any[]
      results.totalValue = valueResult.value || 0

      // Prescription stats
      const [totalPrescriptionsResult] = await executeQuery(`SELECT COUNT(*) as count FROM prescriptions WHERE DATE(created_at) = CURDATE()`, []) as any[]
      results.totalPrescriptions = totalPrescriptionsResult.count || 0

      const [activePrescriptionsResult] = await executeQuery(`SELECT COUNT(*) as count FROM prescriptions WHERE status = 'pending'`, []) as any[]
      results.activePrescriptions = activePrescriptionsResult.count || 0

      const [completedPrescriptionsResult] = await executeQuery(`SELECT COUNT(*) as count FROM prescriptions WHERE status = 'dispensed' AND DATE(created_at) = CURDATE()`, []) as any[]
      results.completedPrescriptions = completedPrescriptionsResult.count || 0

      const [pendingDispensingResult] = await executeQuery(`SELECT COUNT(*) as count FROM prescriptions WHERE status IN ('pending', 'partially_dispensed')`, []) as any[]
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
