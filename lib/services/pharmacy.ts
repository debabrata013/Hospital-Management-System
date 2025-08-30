import { executeQuery } from '@/lib/db/connection'
import { v4 as uuidv4 } from 'uuid'

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
             COUNT(mb.id) as batch_count,
             SUM(CASE WHEN mb.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN mb.quantity ELSE 0 END) as expiring_stock
      FROM medicines m
      LEFT JOIN medicine_batches mb ON m.id = mb.medicine_id
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

    query += ` GROUP BY m.id ORDER BY m.name`

    if (filters.limit) {
      query += ` LIMIT ?`
      params.push(parseInt(filters.limit))
    }

    return await executeQuery(query, params) as Medicine[]
  }

  async getMedicineById(id: string) {
    const query = `
      SELECT m.*, 
             GROUP_CONCAT(CONCAT(mb.batch_number, ':', mb.quantity, ':', mb.expiry_date) SEPARATOR '|') as batches
      FROM medicines m
      LEFT JOIN medicine_batches mb ON m.id = mb.medicine_id
      WHERE m.id = ?
      GROUP BY m.id
    `
    const results = await executeQuery(query, [id]) as any[]
    return results[0] || null
  }

  async createMedicine(data: Partial<Medicine>) {
    const id = uuidv4()
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
    let query = `
      SELECT v.*, 
             COUNT(po.id) as total_orders,
             MAX(po.order_date) as last_order_date
      FROM vendors v
      LEFT JOIN purchase_orders po ON v.id = po.vendor_id
      WHERE 1=1
    `
    const params: any[] = []

    if (filters.search) {
      query += ` AND (v.name LIKE ? OR v.contact_person LIKE ?)`
      params.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    if (filters.status) {
      query += ` AND v.status = ?`
      params.push(filters.status)
    }

    query += ` GROUP BY v.id ORDER BY v.name`
    return await executeQuery(query, params) as Vendor[]
  }

  async createVendor(data: Partial<Vendor>) {
    const id = uuidv4()
    const query = `
      INSERT INTO vendors (id, name, contact_person, phone, email, address, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    await executeQuery(query, [
      id, data.name, data.contact_person, data.phone, data.email, data.address, data.status || 'active'
    ])
    return { id, ...data }
  }

  // Prescription operations
  async getPrescriptions(filters: any = {}) {
    let query = `
      SELECT p.*, 
             COUNT(pi.id) as item_count,
             SUM(pi.total_price) as calculated_total
      FROM prescriptions p
      LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
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

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`

    if (filters.limit) {
      query += ` LIMIT ?`
      params.push(parseInt(filters.limit))
    }

    return await executeQuery(query, params) as Prescription[]
  }

  async getPrescriptionById(id: string) {
    const prescriptionQuery = `SELECT * FROM prescriptions WHERE id = ?`
    const itemsQuery = `SELECT * FROM prescription_items WHERE prescription_id = ?`
    
    const [prescription] = await executeQuery(prescriptionQuery, [id]) as any[]
    const items = await executeQuery(itemsQuery, [id]) as PrescriptionItem[]
    
    if (prescription) {
      prescription.items = items
    }
    
    return prescription
  }

  async createPrescription(data: any) {
    const id = uuidv4()
    const prescriptionNumber = `RX-${Date.now()}`
    
    // Insert prescription
    const prescriptionQuery = `
      INSERT INTO prescriptions (id, prescription_number, patient_id, patient_name, doctor_id, doctor_name, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `
    await executeQuery(prescriptionQuery, [
      id, prescriptionNumber, data.patient_id, data.patient_name, data.doctor_id, data.doctor_name
    ])

    // Insert prescription items
    let totalAmount = 0
    for (const item of data.items) {
      const itemId = uuidv4()
      const itemTotal = item.quantity * item.unit_price
      totalAmount += itemTotal

      const itemQuery = `
        INSERT INTO prescription_items (id, prescription_id, medicine_id, medicine_name, quantity, dosage, frequency, duration, instructions, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      await executeQuery(itemQuery, [
        itemId, id, item.medicine_id, item.medicine_name, item.quantity,
        item.dosage, item.frequency, item.duration, item.instructions,
        item.unit_price, itemTotal
      ])
    }

    // Update total amount
    await executeQuery(`UPDATE prescriptions SET total_amount = ? WHERE id = ?`, [totalAmount, id])

    return this.getPrescriptionById(id)
  }

  async dispensePrescription(id: string, items: any[]) {
    // Update prescription items with dispensed quantities
    for (const item of items) {
      await executeQuery(
        `UPDATE prescription_items SET dispensed_quantity = ? WHERE id = ?`,
        [item.dispensed_quantity, item.id]
      )

      // Update medicine stock
      await executeQuery(
        `UPDATE medicines SET current_stock = current_stock - ? WHERE id = ?`,
        [item.dispensed_quantity, item.medicine_id]
      )

      // Record stock transaction
      const transactionId = uuidv4()
      await executeQuery(`
        INSERT INTO stock_transactions (id, medicine_id, transaction_type, quantity, unit_price, total_amount, reference_id, reference_type)
        VALUES (?, ?, 'sale', ?, ?, ?, ?, 'prescription')
      `, [transactionId, item.medicine_id, item.dispensed_quantity, item.unit_price, item.dispensed_quantity * item.unit_price, id])
    }

    // Update prescription status
    const allDispensed = items.every(item => item.dispensed_quantity >= item.quantity)
    const status = allDispensed ? 'dispensed' : 'partially_dispensed'
    
    await executeQuery(`UPDATE prescriptions SET status = ? WHERE id = ?`, [status, id])

    return this.getPrescriptionById(id)
  }

  // Stock alerts
  async getStockAlerts() {
    const query = `
      SELECT m.*, 
             mb.batch_number, mb.expiry_date, mb.quantity as batch_quantity,
             CASE 
               WHEN m.current_stock = 0 THEN 'out_of_stock'
               WHEN m.current_stock <= m.minimum_stock THEN 'low_stock'
               WHEN mb.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expiring'
               ELSE 'normal'
             END as alert_type
      FROM medicines m
      LEFT JOIN medicine_batches mb ON m.id = mb.medicine_id
      WHERE m.current_stock <= m.minimum_stock 
         OR mb.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY alert_type, m.name
    `
    return await executeQuery(query, [])
  }

  // Dashboard statistics
  async getDashboardStats() {
    const queries = {
      totalMedicines: `SELECT COUNT(*) as count FROM medicines`,
      lowStock: `SELECT COUNT(*) as count FROM medicines WHERE current_stock <= minimum_stock`,
      expiringSoon: `SELECT COUNT(DISTINCT m.id) as count FROM medicines m JOIN medicine_batches mb ON m.id = mb.medicine_id WHERE mb.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`,
      totalValue: `SELECT SUM(current_stock * unit_price) as value FROM medicines`,
      totalPrescriptions: `SELECT COUNT(*) as count FROM prescriptions WHERE DATE(created_at) = CURDATE()`,
      activePrescriptions: `SELECT COUNT(*) as count FROM prescriptions WHERE status = 'pending'`,
      completedPrescriptions: `SELECT COUNT(*) as count FROM prescriptions WHERE status = 'dispensed' AND DATE(created_at) = CURDATE()`,
      pendingDispensing: `SELECT COUNT(*) as count FROM prescriptions WHERE status IN ('pending', 'partially_dispensed')`
    }

    const results: any = {}
    for (const [key, query] of Object.entries(queries)) {
      const [result] = await executeQuery(query, []) as any[]
      results[key] = result.count || result.value || 0
    }

    return results
  }
}
