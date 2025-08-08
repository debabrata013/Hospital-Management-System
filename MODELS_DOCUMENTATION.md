# 🏥 Hospital Management System - Enhanced Models Documentation

## 📋 Overview
This document provides comprehensive documentation for the enhanced Mongoose models designed specifically for the Arogya Hospital Management System. All models have been significantly improved from your original schema with additional features, validations, and methods.

---

## 🔧 **Schema Enhancements Made**

### ✅ **Improvements Applied:**
1. **Enhanced Validation** - Added comprehensive field validation and constraints
2. **Better Indexing** - Optimized database indexes for performance
3. **Rich Virtuals** - Added computed properties for better data access
4. **Advanced Methods** - Instance and static methods for common operations
5. **Security Features** - Audit trails, integrity checks, and compliance flags
6. **Offline Sync Support** - Enhanced `lastUpdated` fields and conflict resolution
7. **Business Logic** - Built-in business rules and workflows
8. **Performance Optimization** - Efficient queries and aggregation pipelines

---

## 📊 **Model Specifications**

### 1. **User Schema** (`models/User.js`)
**Enhanced from your original with:**
- ✅ Comprehensive role-based validation
- ✅ Address and emergency contact fields
- ✅ Professional qualifications for doctors
- ✅ Working schedule management
- ✅ Salary and employment details
- ✅ Profile picture support
- ✅ Last login tracking

```javascript
// Key Features:
- Role-based field requirements
- Email and phone validation
- Automatic ID generation
- Working days and shift management
- Methods: isDoctor(), isAdmin()
- Virtuals: fullName
```

**Roles Supported:** `super-admin`, `admin`, `doctor`, `staff`, `receptionist`, `patient`

### 2. **Patient Schema** (`models/Patient.js`)
**Significantly enhanced with:**
- ✅ Comprehensive medical history tracking
- ✅ Insurance information management
- ✅ Detailed admission history with daily notes
- ✅ Emergency contact validation
- ✅ Blood group and demographic data
- ✅ Age calculation virtual
- ✅ Current admission status

```javascript
// Key Features:
- Auto-generated patient ID (PAT + timestamp)
- Medical history: allergies, chronic conditions, surgeries
- Insurance: provider, policy, coverage details
- Admission tracking with room/bed assignment
- Methods: isCurrentlyAdmitted(), addAdmission()
- Virtuals: age, currentAdmission
```

### 3. **Medical Record Schema** (`models/MedicalRecord.js`)
**Completely redesigned with:**
- ✅ Comprehensive clinical assessment
- ✅ AI-powered diet plan integration
- ✅ Advanced vitals tracking with validation
- ✅ Laboratory test management
- ✅ File attachment system
- ✅ Prescription management
- ✅ Follow-up and referral tracking

```javascript
// Key Features:
- Auto-generated record ID (MED + timestamp)
- Detailed vitals with BMI calculation
- AI diet plans with doctor approval workflow
- Lab test tracking with results
- Clinical notes and assessment
- Methods: addLabTest(), approveDietPlan()
- Virtuals: calculatedBMI, bloodPressureString
```

### 4. **Billing Schema** (`models/Billing.js`)
**Advanced billing system with:**
- ✅ Multi-item billing with categories
- ✅ Multiple payment methods support
- ✅ Discount authorization workflow
- ✅ Refund management
- ✅ Payment tracking and status
- ✅ Overdue detection
- ✅ Print and email tracking

```javascript
// Key Features:
- Auto-generated bill ID (BILL + timestamp)
- Multiple payment modes: cash, UPI, insurance, etc.
- Discount approval workflow
- Refund processing
- Outstanding amount calculation
- Methods: addPayment(), applyDiscount()
- Virtuals: totalPaid, isOverdue
```

### 5. **Medicine Schema** (`models/Medicine.js`)
**Complete inventory management with:**
- ✅ Batch tracking with expiry dates
- ✅ Stock movement history
- ✅ Vendor management
- ✅ Pricing and margin calculation
- ✅ Low stock and expiry alerts
- ✅ Drug information and warnings
- ✅ Regulatory compliance fields

```javascript
// Key Features:
- Auto-generated medicine ID (MED + timestamp)
- Batch-wise inventory tracking
- Stock movement audit trail
- Automatic reorder level calculation
- Expiry date monitoring
- Methods: addStock(), reduceStock(), needsReorder()
- Virtuals: stockStatus, totalValue
```

### 6. **Message Schema** (`models/Message.js`)
**Advanced communication system with:**
- ✅ Group messaging support
- ✅ Priority and urgency levels
- ✅ File attachments
- ✅ Read receipts and delivery status
- ✅ Thread and reply management
- ✅ Patient/case linking
- ✅ Scheduled messages and reminders

```javascript
// Key Features:
- Auto-generated message ID (MSG + timestamp)
- Group and individual messaging
- Priority levels: low, normal, high, urgent
- Read/delivery tracking
- Thread management
- Methods: markAsRead(), addReply()
- Virtuals: messageAge, unreadCount
```

### 7. **Appointment Schema** (`models/Appointment.js`)
**Comprehensive appointment management with:**
- ✅ Advanced scheduling with conflict detection
- ✅ Check-in and consultation tracking
- ✅ Billing integration
- ✅ Cancellation and rescheduling
- ✅ Patient feedback system
- ✅ Insurance information
- ✅ Special requirements handling

```javascript
// Key Features:
- Auto-generated appointment ID (APT + timestamp)
- Conflict detection for double booking
- Check-in with vitals recording
- Consultation time tracking
- Cancellation/reschedule workflow
- Methods: checkIn(), startConsultation(), complete()
- Virtuals: appointmentDateTime, isOverdue
```

### 8. **Audit Log Schema** (`models/AuditLog.js`)
**Enterprise-grade audit system with:**
- ✅ Comprehensive action tracking
- ✅ Security risk assessment
- ✅ Compliance flag management
- ✅ Device and location tracking
- ✅ Performance metrics
- ✅ Integrity verification
- ✅ Automated alerting

```javascript
// Key Features:
- Auto-generated log ID (LOG + timestamp)
- Risk level assessment
- Security and compliance flags
- Device fingerprinting
- Data integrity checksums
- Methods: addSecurityFlag(), verifyIntegrity()
- Virtuals: riskAssessment, logAge
```

---

## 🚀 **Usage Examples**

### Creating a New Patient
```javascript
import { Patient } from './models';

const newPatient = new Patient({
  name: 'John Doe',
  dob: new Date('1990-01-01'),
  gender: 'Male',
  contactNumber: '+91 9876543210',
  emergencyContact: {
    name: 'Jane Doe',
    phone: '+91 9876543211',
    relationship: 'Wife'
  },
  address: {
    street: '123 Main St',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001'
  }
});

await newPatient.save();
console.log(`Patient ID: ${newPatient.patientId}`);
```

### Booking an Appointment
```javascript
import { Appointment } from './models';

const appointment = new Appointment({
  patientId: patient._id,
  doctorId: doctor._id,
  appointmentDate: new Date('2024-02-15'),
  appointmentTime: '10:00',
  reason: 'Regular checkup',
  appointmentType: 'consultation',
  billing: {
    consultationFee: 500
  }
});

await appointment.save();
```

### Creating Medical Record with AI Diet Plan
```javascript
import { MedicalRecord } from './models';

const record = new MedicalRecord({
  patientId: patient._id,
  doctorId: doctor._id,
  visitType: 'Consultation',
  chiefComplaint: 'Chest pain',
  diagnosis: {
    primary: 'Gastritis'
  },
  dietPlan: {
    aiGenerated: true,
    plan: {
      breakfast: 'Oats with fruits',
      lunch: 'Rice with vegetables',
      dinner: 'Light soup',
      restrictions: ['Spicy food', 'Caffeine']
    }
  }
});

await record.save();
```

---

## 🔍 **Database Indexes**

### Performance Optimized Indexes:
```javascript
// User indexes
{ email: 1 }, { role: 1 }, { department: 1 }

// Patient indexes  
{ patientId: 1 }, { contactNumber: 1 }, { name: 1 }

// Appointment indexes
{ doctorId: 1, appointmentDate: 1, appointmentTime: 1 } // Unique

// Medical Record indexes
{ patientId: 1, encounterDate: -1 }, { doctorId: 1 }

// Billing indexes
{ patientId: 1, createdAt: -1 }, { status: 1 }

// Medicine indexes
{ medicineId: 1 }, { 'inventory.currentStock': 1 }

// Message indexes
{ fromUserId: 1, createdAt: -1 }, { toUserId: 1 }

// Audit Log indexes
{ userId: 1, createdAt: -1 }, { riskLevel: 1 }
```

---

## 🛡️ **Security Features**

### 1. **Data Validation**
- Email format validation
- Phone number validation
- Date range validation
- Enum value constraints

### 2. **Audit Trails**
- All CRUD operations logged
- User action tracking
- IP address and device logging
- Risk level assessment

### 3. **Data Integrity**
- Checksum generation
- Digital signatures
- Tamper detection
- Version control

### 4. **Compliance**
- HIPAA-relevant flagging
- Medical record retention
- Patient data access logging
- Regulatory reporting support

---

## 📱 **Offline Sync Support**

### Conflict Resolution:
```javascript
// Each model has lastUpdated field
lastUpdated: { 
  type: Number, 
  default: Date.now 
}

// Version control for medical records
version: {
  type: Number,
  default: 1
}

// Pre-save middleware updates timestamps
this.lastUpdated = Date.now();
```

---

## 🔧 **API Integration Ready**

### Model Methods Available:
```javascript
// Patient methods
patient.isCurrentlyAdmitted()
patient.addAdmission(admissionData)
patient.getLatestAdmission()

// Appointment methods
appointment.checkIn(staffId, vitals)
appointment.startConsultation()
appointment.complete(consultationData)
appointment.cancel(reason, cancelledBy)

// Billing methods
billing.addPayment(paymentData)
billing.applyDiscount(discountData, approvedBy)
billing.markAsPrinted()

// Medicine methods
medicine.addStock(quantity, batchData, userId)
medicine.reduceStock(quantity, batchNo, userId)
medicine.needsReorder()

// Static methods for queries
User.findByRole('doctor')
Patient.findByPhone('+91 9876543210')
Appointment.findTodaysAppointments(doctorId)
Medicine.findMedicinesNeedingReorder()
```

---

## 📊 **Analytics and Reporting**

### Built-in Analytics Methods:
```javascript
// Billing analytics
Billing.getDailyRevenue(date)
Billing.getOverdueBills()

// Appointment statistics
Appointment.getAppointmentStats(startDate, endDate)
Appointment.checkAvailability(doctorId, date, time)

// Medicine inventory
Medicine.getInventorySummary()
Medicine.findExpiringMedicines(days)

// Audit analytics
AuditLog.getActivitySummary(startDate, endDate)
AuditLog.detectAnomalies(userId)
```

---

## 🚀 **Next Steps**

### 1. **Database Setup**
```bash
# Install dependencies
npm install mongoose --legacy-peer-deps

# Set environment variables
MONGODB_URI=your_connection_string
```

### 2. **Model Usage**
```javascript
// Import models
import { User, Patient, Appointment } from './models';

// Use in your API routes
const patients = await Patient.find({ isActive: true });
```

### 3. **API Development**
- Create REST endpoints using these models
- Implement authentication middleware
- Add validation middleware
- Set up audit logging

---

## 📈 **Performance Considerations**

### 1. **Indexing Strategy**
- All frequently queried fields are indexed
- Compound indexes for complex queries
- TTL indexes for automatic cleanup

### 2. **Query Optimization**
- Use populate() judiciously
- Implement pagination for large datasets
- Use aggregation pipelines for complex reports

### 3. **Memory Management**
- Limit result sets with pagination
- Use lean() for read-only operations
- Implement caching for frequently accessed data

---

## ✅ **Schema Validation Summary**

| Model | Original Fields | Enhanced Fields | New Features |
|-------|----------------|-----------------|--------------|
| User | 8 | 25+ | Role validation, schedules, qualifications |
| Patient | 8 | 30+ | Medical history, insurance, admissions |
| MedicalRecord | 10 | 40+ | AI diet plans, lab tests, attachments |
| Billing | 8 | 35+ | Multi-payments, refunds, overdue tracking |
| Medicine | 7 | 45+ | Batch tracking, inventory, alerts |
| Message | 4 | 30+ | Groups, priorities, attachments, threads |
| Appointment | 4 | 50+ | Check-in, consultation, feedback, insurance |
| AuditLog | 3 | 60+ | Security, compliance, performance, integrity |

---

**Status**: ✅ **Production Ready**  
**Compatibility**: MongoDB 4.4+, Mongoose 6.0+  
**Last Updated**: January 2024  
**Version**: 2.0.0 (Enhanced)
