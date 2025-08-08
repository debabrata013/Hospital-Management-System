// Database Models for Arogya Hospital Management System

export interface Patient {
  _id?: string
  patientId: string // Unique alphanumeric ID
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: Date
    gender: 'male' | 'female' | 'other'
    bloodGroup?: string
    phone: string
    email?: string
    address: {
      street: string
      city: string
      state: string
      pincode: string
    }
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  medicalHistory: {
    allergies?: string[]
    chronicConditions?: string[]
    currentMedications?: string[]
  }
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface Doctor {
  _id?: string
  doctorId: string
  personalInfo: {
    firstName: string
    lastName: string
    phone: string
    email: string
    address: {
      street: string
      city: string
      state: string
      pincode: string
    }
  }
  professional: {
    specialization: string
    qualification: string[]
    experience: number
    licenseNumber: string
    department: string
  }
  schedule: {
    workingDays: string[]
    workingHours: {
      start: string
      end: string
    }
  }
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface Appointment {
  _id?: string
  appointmentId: string
  patientId: string
  doctorId: string
  appointmentDate: Date
  appointmentTime: string
  type: 'consultation' | 'follow-up' | 'emergency'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  reason: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface MedicalRecord {
  _id?: string
  recordId: string
  patientId: string
  doctorId: string
  appointmentId?: string
  visitDate: Date
  chiefComplaint: string
  diagnosis: string
  prescription: {
    medicines: {
      name: string
      dosage: string
      frequency: string
      duration: string
      instructions?: string
    }[]
  }
  vitals: {
    bloodPressure?: string
    temperature?: number
    pulse?: number
    weight?: number
    height?: number
    bmi?: number
  }
  labReports?: {
    testName: string
    result: string
    normalRange: string
    date: Date
    fileUrl?: string
  }[]
  doctorNotes: string
  followUpDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Billing {
  _id?: string
  billId: string
  patientId: string
  appointmentId?: string
  items: {
    description: string
    quantity: number
    unitPrice: number
    total: number
    category: 'consultation' | 'medicine' | 'test' | 'procedure' | 'room'
  }[]
  subtotal: number
  discount: number
  tax: number
  totalAmount: number
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded'
  paymentMethod?: 'cash' | 'card' | 'upi' | 'insurance'
  paymentDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Staff {
  _id?: string
  staffId: string
  personalInfo: {
    firstName: string
    lastName: string
    phone: string
    email: string
    address: {
      street: string
      city: string
      state: string
      pincode: string
    }
  }
  employment: {
    role: 'doctor' | 'nurse' | 'admin' | 'pharmacist' | 'receptionist' | 'technician'
    department: string
    joiningDate: Date
    salary: number
    employmentType: 'full-time' | 'part-time' | 'contract'
  }
  credentials: {
    username: string
    password: string // This should be hashed
    role: 'super-admin' | 'admin' | 'doctor' | 'nurse' | 'staff'
    permissions: string[]
  }
  schedule?: {
    workingDays: string[]
    workingHours: {
      start: string
      end: string
    }
  }
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface Medicine {
  _id?: string
  medicineId: string
  name: string
  genericName?: string
  manufacturer: string
  category: string
  dosageForm: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops'
  strength: string
  inventory: {
    currentStock: number
    minimumStock: number
    maximumStock: number
    unitPrice: number
    sellingPrice: number
    batchNumber: string
    expiryDate: Date
    supplier: string
  }
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface Admission {
  _id?: string
  admissionId: string
  patientId: string
  doctorId: string
  admissionDate: Date
  dischargeDate?: Date
  roomNumber: string
  bedNumber: string
  admissionType: 'emergency' | 'planned' | 'transfer'
  reason: string
  status: 'admitted' | 'discharged' | 'transferred'
  dailyNotes: {
    date: Date
    notes: string
    vitals: {
      bloodPressure?: string
      temperature?: number
      pulse?: number
    }
    attendingStaff: string
  }[]
  dischargeSummary?: {
    finalDiagnosis: string
    treatmentGiven: string
    medicinesOnDischarge: string[]
    followUpInstructions: string
    nextAppointment?: Date
  }
  createdAt: Date
  updatedAt: Date
}

// Collection names
export const Collections = {
  PATIENTS: 'patients',
  DOCTORS: 'doctors',
  APPOINTMENTS: 'appointments',
  MEDICAL_RECORDS: 'medical_records',
  BILLING: 'billing',
  STAFF: 'staff',
  MEDICINES: 'medicines',
  ADMISSIONS: 'admissions'
} as const
