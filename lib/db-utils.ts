import { connectToDatabase } from './mongodb'
import { Collections } from './models'
import { ObjectId } from 'mongodb'

// Generic database operations
export class DatabaseUtils {
  
  // Create a new document
  static async create(collection: string, data: any) {
    try {
      const { db } = await connectToDatabase()
      const result = await db.collection(collection).insertOne({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      return {
        success: true,
        data: { _id: result.insertedId, ...data },
        message: 'Document created successfully'
      }
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create document'
      }
    }
  }

  // Find documents with optional filters
  static async find(collection: string, filter: any = {}, options: any = {}) {
    try {
      const { db } = await connectToDatabase()
      const cursor = db.collection(collection).find(filter, options)
      const documents = await cursor.toArray()
      
      return {
        success: true,
        data: documents,
        count: documents.length,
        message: 'Documents retrieved successfully'
      }
    } catch (error) {
      console.error(`Error finding documents in ${collection}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve documents'
      }
    }
  }

  // Find a single document by ID
  static async findById(collection: string, id: string) {
    try {
      const { db } = await connectToDatabase()
      const document = await db.collection(collection).findOne({ 
        _id: new ObjectId(id) 
      })
      
      if (!document) {
        return {
          success: false,
          data: null,
          message: 'Document not found'
        }
      }
      
      return {
        success: true,
        data: document,
        message: 'Document retrieved successfully'
      }
    } catch (error) {
      console.error(`Error finding document by ID in ${collection}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve document'
      }
    }
  }

  // Update a document by ID
  static async updateById(collection: string, id: string, updateData: any) {
    try {
      const { db } = await connectToDatabase()
      const result = await db.collection(collection).updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      )
      
      if (result.matchedCount === 0) {
        return {
          success: false,
          message: 'Document not found'
        }
      }
      
      return {
        success: true,
        data: result,
        message: 'Document updated successfully'
      }
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update document'
      }
    }
  }

  // Delete a document by ID
  static async deleteById(collection: string, id: string) {
    try {
      const { db } = await connectToDatabase()
      const result = await db.collection(collection).deleteOne({ 
        _id: new ObjectId(id) 
      })
      
      if (result.deletedCount === 0) {
        return {
          success: false,
          message: 'Document not found'
        }
      }
      
      return {
        success: true,
        message: 'Document deleted successfully'
      }
    } catch (error) {
      console.error(`Error deleting document in ${collection}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to delete document'
      }
    }
  }

  // Generate unique ID for entities
  static generateUniqueId(prefix: string): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `${prefix}${timestamp}${random}`.toUpperCase()
  }

  // Search documents with text search
  static async search(collection: string, searchTerm: string, fields: string[]) {
    try {
      const { db } = await connectToDatabase()
      
      // Create regex pattern for case-insensitive search
      const regex = new RegExp(searchTerm, 'i')
      
      // Build search query for multiple fields
      const searchQuery = {
        $or: fields.map(field => ({ [field]: regex }))
      }
      
      const documents = await db.collection(collection).find(searchQuery).toArray()
      
      return {
        success: true,
        data: documents,
        count: documents.length,
        message: 'Search completed successfully'
      }
    } catch (error) {
      console.error(`Error searching in ${collection}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Search failed'
      }
    }
  }

  // Get paginated results
  static async paginate(collection: string, filter: any = {}, page: number = 1, limit: number = 10) {
    try {
      const { db } = await connectToDatabase()
      const skip = (page - 1) * limit
      
      const [documents, totalCount] = await Promise.all([
        db.collection(collection).find(filter).skip(skip).limit(limit).toArray(),
        db.collection(collection).countDocuments(filter)
      ])
      
      const totalPages = Math.ceil(totalCount / limit)
      
      return {
        success: true,
        data: documents,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        message: 'Paginated results retrieved successfully'
      }
    } catch (error) {
      console.error(`Error paginating ${collection}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Pagination failed'
      }
    }
  }
}

// Specific helper functions for hospital entities

export class PatientUtils {
  static async createPatient(patientData: any) {
    const patientId = DatabaseUtils.generateUniqueId('PAT')
    return DatabaseUtils.create(Collections.PATIENTS, {
      ...patientData,
      patientId,
      isActive: true
    })
  }

  static async findPatientByPhone(phone: string) {
    return DatabaseUtils.find(Collections.PATIENTS, { 
      'personalInfo.phone': phone 
    })
  }

  static async searchPatients(searchTerm: string) {
    return DatabaseUtils.search(Collections.PATIENTS, searchTerm, [
      'personalInfo.firstName',
      'personalInfo.lastName',
      'personalInfo.phone',
      'personalInfo.email',
      'patientId'
    ])
  }
}

export class AppointmentUtils {
  static async createAppointment(appointmentData: any) {
    const appointmentId = DatabaseUtils.generateUniqueId('APT')
    return DatabaseUtils.create(Collections.APPOINTMENTS, {
      ...appointmentData,
      appointmentId,
      status: 'scheduled'
    })
  }

  static async getAppointmentsByDate(date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    return DatabaseUtils.find(Collections.APPOINTMENTS, {
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
  }

  static async getDoctorAppointments(doctorId: string, date?: Date) {
    const filter: any = { doctorId }
    
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      filter.appointmentDate = {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }
    
    return DatabaseUtils.find(Collections.APPOINTMENTS, filter)
  }
}

export class MedicalRecordUtils {
  static async createMedicalRecord(recordData: any) {
    const recordId = DatabaseUtils.generateUniqueId('MED')
    return DatabaseUtils.create(Collections.MEDICAL_RECORDS, {
      ...recordData,
      recordId
    })
  }

  static async getPatientMedicalHistory(patientId: string) {
    return DatabaseUtils.find(Collections.MEDICAL_RECORDS, 
      { patientId }, 
      { sort: { visitDate: -1 } }
    )
  }
}

export class BillingUtils {
  static async createBill(billingData: any) {
    const billId = DatabaseUtils.generateUniqueId('BILL')
    return DatabaseUtils.create(Collections.BILLING, {
      ...billingData,
      billId,
      paymentStatus: 'pending'
    })
  }

  static async getDailyRevenue(date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const { db } = await connectToDatabase()
    const result = await db.collection(Collections.BILLING).aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalBills: { $sum: 1 }
        }
      }
    ]).toArray()
    
    return result[0] || { totalRevenue: 0, totalBills: 0 }
  }
}
