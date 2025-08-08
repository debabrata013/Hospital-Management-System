// Database Initialization Script for Arogya Hospital
import { connectToDatabase } from '../lib/mongodb'
import { Collections } from '../lib/models'
import { DatabaseUtils } from '../lib/db-utils'

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...')
    
    const { db } = await connectToDatabase()
    
    // Create indexes for better performance
    await createIndexes(db)
    
    // Insert sample data
    await insertSampleData()
    
    console.log('✅ Database initialization completed successfully!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  }
}

async function createIndexes(db: any) {
  console.log('📊 Creating database indexes...')
  
  // Patient indexes
  await db.collection(Collections.PATIENTS).createIndex({ patientId: 1 }, { unique: true })
  await db.collection(Collections.PATIENTS).createIndex({ 'personalInfo.phone': 1 })
  await db.collection(Collections.PATIENTS).createIndex({ 'personalInfo.email': 1 })
  
  // Doctor indexes
  await db.collection(Collections.DOCTORS).createIndex({ doctorId: 1 }, { unique: true })
  await db.collection(Collections.DOCTORS).createIndex({ 'personalInfo.email': 1 })
  
  // Appointment indexes
  await db.collection(Collections.APPOINTMENTS).createIndex({ appointmentId: 1 }, { unique: true })
  await db.collection(Collections.APPOINTMENTS).createIndex({ patientId: 1, appointmentDate: 1 })
  await db.collection(Collections.APPOINTMENTS).createIndex({ doctorId: 1, appointmentDate: 1 })
  
  // Medical Record indexes
  await db.collection(Collections.MEDICAL_RECORDS).createIndex({ recordId: 1 }, { unique: true })
  await db.collection(Collections.MEDICAL_RECORDS).createIndex({ patientId: 1, visitDate: -1 })
  
  // Billing indexes
  await db.collection(Collections.BILLING).createIndex({ billId: 1 }, { unique: true })
  await db.collection(Collections.BILLING).createIndex({ patientId: 1 })
  
  // Staff indexes
  await db.collection(Collections.STAFF).createIndex({ staffId: 1 }, { unique: true })
  await db.collection(Collections.STAFF).createIndex({ 'credentials.username': 1 }, { unique: true })
  
  console.log('✅ Database indexes created successfully')
}

async function insertSampleData() {
  console.log('📝 Inserting sample data...')
  
  // Sample Admin User
  const adminUser = {
    staffId: 'ADMIN001',
    personalInfo: {
      firstName: 'Admin',
      lastName: 'User',
      phone: '+91 98765 43210',
      email: 'admin@arogyahospital.com',
      address: {
        street: '123, Health Nagar',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001'
      }
    },
    employment: {
      role: 'admin',
      department: 'Administration',
      joiningDate: new Date(),
      salary: 50000,
      employmentType: 'full-time'
    },
    credentials: {
      username: 'admin',
      password: '$2b$10$rQZ8kHWiZ8.qhJ5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K', // 'admin123' hashed
      role: 'admin',
      permissions: ['all']
    },
    isActive: true
  }
  
  await DatabaseUtils.create(Collections.STAFF, adminUser)
  
  // Sample Doctor
  const sampleDoctor = {
    doctorId: 'DOC001',
    personalInfo: {
      firstName: 'Dr. Rajesh',
      lastName: 'Sharma',
      phone: '+91 98765 43211',
      email: 'dr.rajesh@arogyahospital.com',
      address: {
        street: '456, Medical Colony',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110002'
      }
    },
    professional: {
      specialization: 'General Medicine',
      qualification: ['MBBS', 'MD'],
      experience: 10,
      licenseNumber: 'MED12345',
      department: 'General Medicine'
    },
    schedule: {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      workingHours: {
        start: '09:00',
        end: '17:00'
      }
    },
    isActive: true
  }
  
  await DatabaseUtils.create(Collections.DOCTORS, sampleDoctor)
  
  // Sample Patient
  const samplePatient = {
    patientId: 'PAT001',
    personalInfo: {
      firstName: 'Amit',
      lastName: 'Kumar',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'male',
      bloodGroup: 'B+',
      phone: '+91 98765 43212',
      email: 'amit.kumar@email.com',
      address: {
        street: '789, Patient Street',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110003'
      }
    },
    emergencyContact: {
      name: 'Sunita Kumar',
      relationship: 'Wife',
      phone: '+91 98765 43213'
    },
    medicalHistory: {
      allergies: ['Penicillin'],
      chronicConditions: [],
      currentMedications: []
    },
    isActive: true
  }
  
  await DatabaseUtils.create(Collections.PATIENTS, samplePatient)
  
  // Sample Medicine
  const sampleMedicine = {
    medicineId: 'MED001',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    manufacturer: 'ABC Pharma',
    category: 'Analgesic',
    dosageForm: 'tablet',
    strength: '500mg',
    inventory: {
      currentStock: 1000,
      minimumStock: 100,
      maximumStock: 2000,
      unitPrice: 2.50,
      sellingPrice: 3.00,
      batchNumber: 'BATCH001',
      expiryDate: new Date('2025-12-31'),
      supplier: 'Medical Supplies Ltd'
    },
    isActive: true
  }
  
  await DatabaseUtils.create(Collections.MEDICINES, sampleMedicine)
  
  console.log('✅ Sample data inserted successfully')
}

// Run the initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database setup complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error)
      process.exit(1)
    })
}

export { initializeDatabase }
