# 🗄️ Database Setup - Arogya Hospital Management System

## 📋 Overview
This document explains the MongoDB database setup for the Arogya Hospital Management System.

## 🔧 Configuration

### Environment Variables
The following environment variables are configured in `.env.local`:

```env
MONGODB_URI=mongodb+srv://pattnaikd833:WCpNo7zqKCZ7oLET@cluster0.zbyg6hq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_NAME=arogya_hospital
NODE_ENV=development
```

### Database Connection
- **Connection File**: `lib/mongodb.ts`
- **Database Name**: `arogya_hospital`
- **Connection Pool**: Max 10 connections
- **Timeout Settings**: 5s server selection, 45s socket timeout

## 📊 Database Schema

### Collections Structure

#### 1. **Patients** (`patients`)
```typescript
{
  _id: ObjectId,
  patientId: string, // Unique: PAT + timestamp
  personalInfo: {
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    gender: 'male' | 'female' | 'other',
    bloodGroup: string,
    phone: string,
    email: string,
    address: { street, city, state, pincode }
  },
  emergencyContact: { name, relationship, phone },
  medicalHistory: { allergies, chronicConditions, currentMedications },
  createdAt: Date,
  updatedAt: Date,
  isActive: boolean
}
```

#### 2. **Doctors** (`doctors`)
```typescript
{
  _id: ObjectId,
  doctorId: string, // Unique: DOC + timestamp
  personalInfo: { firstName, lastName, phone, email, address },
  professional: {
    specialization: string,
    qualification: string[],
    experience: number,
    licenseNumber: string,
    department: string
  },
  schedule: {
    workingDays: string[],
    workingHours: { start, end }
  },
  createdAt: Date,
  updatedAt: Date,
  isActive: boolean
}
```

#### 3. **Appointments** (`appointments`)
```typescript
{
  _id: ObjectId,
  appointmentId: string, // Unique: APT + timestamp
  patientId: string,
  doctorId: string,
  appointmentDate: Date,
  appointmentTime: string,
  type: 'consultation' | 'follow-up' | 'emergency',
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show',
  reason: string,
  notes: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. **Medical Records** (`medical_records`)
```typescript
{
  _id: ObjectId,
  recordId: string, // Unique: MED + timestamp
  patientId: string,
  doctorId: string,
  appointmentId: string,
  visitDate: Date,
  chiefComplaint: string,
  diagnosis: string,
  prescription: {
    medicines: [{ name, dosage, frequency, duration, instructions }]
  },
  vitals: { bloodPressure, temperature, pulse, weight, height, bmi },
  labReports: [{ testName, result, normalRange, date, fileUrl }],
  doctorNotes: string,
  followUpDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. **Billing** (`billing`)
```typescript
{
  _id: ObjectId,
  billId: string, // Unique: BILL + timestamp
  patientId: string,
  appointmentId: string,
  items: [{ description, quantity, unitPrice, total, category }],
  subtotal: number,
  discount: number,
  tax: number,
  totalAmount: number,
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded',
  paymentMethod: 'cash' | 'card' | 'upi' | 'insurance',
  paymentDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. **Staff** (`staff`)
```typescript
{
  _id: ObjectId,
  staffId: string, // Unique: STAFF + timestamp
  personalInfo: { firstName, lastName, phone, email, address },
  employment: {
    role: 'doctor' | 'nurse' | 'admin' | 'pharmacist' | 'receptionist' | 'technician',
    department: string,
    joiningDate: Date,
    salary: number,
    employmentType: 'full-time' | 'part-time' | 'contract'
  },
  credentials: {
    username: string,
    password: string, // Hashed
    role: 'super-admin' | 'admin' | 'doctor' | 'nurse' | 'staff',
    permissions: string[]
  },
  schedule: { workingDays, workingHours },
  createdAt: Date,
  updatedAt: Date,
  isActive: boolean
}
```

#### 7. **Medicines** (`medicines`)
```typescript
{
  _id: ObjectId,
  medicineId: string, // Unique: MED + timestamp
  name: string,
  genericName: string,
  manufacturer: string,
  category: string,
  dosageForm: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops',
  strength: string,
  inventory: {
    currentStock: number,
    minimumStock: number,
    maximumStock: number,
    unitPrice: number,
    sellingPrice: number,
    batchNumber: string,
    expiryDate: Date,
    supplier: string
  },
  createdAt: Date,
  updatedAt: Date,
  isActive: boolean
}
```

#### 8. **Admissions** (`admissions`)
```typescript
{
  _id: ObjectId,
  admissionId: string, // Unique: ADM + timestamp
  patientId: string,
  doctorId: string,
  admissionDate: Date,
  dischargeDate: Date,
  roomNumber: string,
  bedNumber: string,
  admissionType: 'emergency' | 'planned' | 'transfer',
  reason: string,
  status: 'admitted' | 'discharged' | 'transferred',
  dailyNotes: [{ date, notes, vitals, attendingStaff }],
  dischargeSummary: {
    finalDiagnosis: string,
    treatmentGiven: string,
    medicinesOnDischarge: string[],
    followUpInstructions: string,
    nextAppointment: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install mongodb @types/mongodb --legacy-peer-deps
```

### 2. Environment Configuration
Create `.env.local` file with your MongoDB connection string:
```env
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=arogya_hospital
```

### 3. Test Database Connection
```bash
# Test the connection via API
curl http://localhost:3000/api/test-db
```

### 4. Initialize Database (Optional)
```bash
# Run the initialization script
npx ts-node scripts/init-db.ts
```

## 🔍 Database Indexes

The following indexes are created for optimal performance:

### Unique Indexes
- `patients.patientId`
- `doctors.doctorId`
- `appointments.appointmentId`
- `medical_records.recordId`
- `billing.billId`
- `staff.staffId`
- `staff.credentials.username`
- `medicines.medicineId`

### Search Indexes
- `patients.personalInfo.phone`
- `patients.personalInfo.email`
- `doctors.personalInfo.email`
- `appointments.patientId + appointmentDate`
- `appointments.doctorId + appointmentDate`
- `medical_records.patientId + visitDate`
- `billing.patientId`

## 🛠️ Utility Functions

### DatabaseUtils Class
- `create(collection, data)` - Create new document
- `find(collection, filter, options)` - Find documents
- `findById(collection, id)` - Find by ObjectId
- `updateById(collection, id, data)` - Update document
- `deleteById(collection, id)` - Delete document
- `search(collection, term, fields)` - Text search
- `paginate(collection, filter, page, limit)` - Paginated results

### Specialized Utils
- **PatientUtils**: Patient-specific operations
- **AppointmentUtils**: Appointment management
- **MedicalRecordUtils**: Medical record operations
- **BillingUtils**: Billing and revenue calculations

## 📡 API Endpoints

### Test Endpoints
- `GET /api/test-db` - Test database connection
- `POST /api/test-db` - Test document creation

### Future API Structure
```
/api/patients/          # Patient management
/api/doctors/           # Doctor management
/api/appointments/      # Appointment booking
/api/medical-records/   # Medical records
/api/billing/           # Billing system
/api/staff/             # Staff management
/api/medicines/         # Pharmacy inventory
/api/admissions/        # Patient admissions
```

## 🔒 Security Considerations

1. **Connection Security**: Uses MongoDB Atlas with SSL/TLS
2. **Environment Variables**: Sensitive data in `.env.local`
3. **Password Hashing**: Staff passwords are hashed using bcrypt
4. **Input Validation**: All inputs validated before database operations
5. **Connection Pooling**: Limited connection pool to prevent overload

## 📊 Sample Data

The initialization script creates:
- 1 Admin user (username: `admin`, password: `admin123`)
- 1 Sample doctor (Dr. Rajesh Sharma)
- 1 Sample patient (Amit Kumar)
- 1 Sample medicine (Paracetamol)

## 🔧 Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check internet connection
   - Verify MongoDB Atlas IP whitelist
   - Check firewall settings

2. **Authentication Failed**
   - Verify username/password in connection string
   - Check database user permissions

3. **Database Not Found**
   - Database is created automatically on first write operation
   - Run initialization script to create collections

### Debug Commands
```bash
# Test connection
curl http://localhost:3000/api/test-db

# Check environment variables
echo $MONGODB_URI

# View logs
npm run dev
```

## 📈 Performance Optimization

1. **Indexes**: All frequently queried fields are indexed
2. **Connection Pooling**: Reuses connections efficiently
3. **Pagination**: Large datasets are paginated
4. **Aggregation**: Complex queries use MongoDB aggregation pipeline
5. **Caching**: Consider Redis for frequently accessed data

---

**Database Status**: ✅ Ready for Production
**Last Updated**: January 2024
**Version**: 1.0.0
