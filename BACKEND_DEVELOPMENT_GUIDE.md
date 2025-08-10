# 🏥 Hospital Management System - Backend Development Guide

## 📋 Table of Contents
1. [Database Architecture Overview](#database-architecture-overview)
2. [Model Relationships](#model-relationships)
3. [API Route Structure](#api-route-structure)
4. [Patient Portal Implementation](#patient-portal-implementation)
5. [Authentication & Authorization](#authentication--authorization)
6. [Data Validation & Security](#data-validation--security)
7. [File Upload & Management](#file-upload--management)
8. [Notification System](#notification-system)
9. [Audit Trail Implementation](#audit-trail-implementation)
10. [Performance Optimization](#performance-optimization)

---

## 🗄️ Database Architecture Overview

### **Core Design Principles**
- **Patient-Centric Design**: All models revolve around the Patient entity
- **Audit Trail**: Every sensitive operation is logged
- **Patient Portal Ready**: Models support patient access controls
- **Scalable Relationships**: Efficient indexing and referencing
- **Data Integrity**: Comprehensive validation and constraints

### **Database Models Structure**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      User       │    │     Patient     │    │  MedicalRecord  │
│                 │    │                 │    │                 │
│ - employeeId    │    │ - patientId     │    │ - recordId      │
│ - role          │◄───┤ - portalAccess  │◄───┤ - patientAccess │
│ - permissions   │    │ - medicalHistory│    │ - aiGenerated   │
│ - workSchedule  │    │ - insurance     │    │ - labTests      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Appointment   │    │  Prescription   │    │   TestReport    │
│                 │    │                 │    │                 │
│ - appointmentId │    │ - prescriptionId│    │ - reportId      │
│ - consultation  │    │ - medications   │    │ - patientAccess │
│ - billing       │    │ - patientAccess │    │ - attachments   │
│ - feedback      │    │ - compliance    │    │ - criticalValues│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Billing     │    │DischargeSummary │    │AfterCareInstruct│
│                 │    │                 │    │                 │
│ - billId        │    │ - summaryId     │    │ - instructionId │
│ - payments      │    │ - patientAccess │    │ - reminders     │
│ - discounts     │    │ - signatures    │    │ - compliance    │
│ - refunds       │    │ - followUpCare  │    │ - effectiveness │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Key Features by Model**

#### **1. User Model**
- **Role-based permissions** with granular access control
- **Work schedule management** for doctors and staff
- **Two-factor authentication** support
- **Session management** with device tracking
- **Employee ID generation** with role prefixes

#### **2. Patient Model**
- **Comprehensive medical history** with allergies, conditions, medications
- **Multiple insurance support** with primary/secondary designation
- **Portal access control** with preferences
- **Identity document management** with verification status
- **Financial tracking** with credit limits and payment history

#### **3. MedicalRecord Model**
- **AI-generated content** with doctor approval workflow
- **Comprehensive examination** documentation
- **Lab test integration** with result tracking
- **Patient access control** with section-level restrictions
- **Audit trail** for all access and modifications

#### **4. Prescription Model**
- **Digital signatures** with multiple authentication methods
- **Compliance monitoring** with adherence scoring
- **Drug interaction checks** and safety validations
- **Pharmacy integration** with dispensing tracking
- **Patient download tracking** with audit trail

#### **5. TestReport Model**
- **Multi-category support** (Lab, Radiology, Cardiology, etc.)
- **Critical value notifications** with automated alerts
- **Patient access approval** workflow
- **Amendment tracking** with version control
- **Quality control** documentation

#### **6. DischargeSummary Model**
- **Comprehensive discharge planning** with follow-up care
- **Digital signatures** from multiple doctors
- **Billing integration** with cost summaries
- **Patient education** materials
- **Readmission risk assessment**

#### **7. AfterCareInstruction Model**
- **Multi-category instructions** (Medication, Diet, Exercise, etc.)
- **Interactive compliance** reporting
- **Reminder system** with multiple delivery methods
- **Multimedia support** with accessibility features
- **Effectiveness tracking** with patient feedback

---

## 🔗 Model Relationships

### **Primary Relationships**

```typescript
// Patient is the central entity
Patient (1) ←→ (N) MedicalRecord
Patient (1) ←→ (N) Appointment
Patient (1) ←→ (N) Prescription
Patient (1) ←→ (N) TestReport
Patient (1) ←→ (N) DischargeSummary
Patient (1) ←→ (N) AfterCareInstruction
Patient (1) ←→ (N) Billing

// User (Doctor/Staff) relationships
User (1) ←→ (N) MedicalRecord (as doctor)
User (1) ←→ (N) Appointment (as doctor)
User (1) ←→ (N) Prescription (as prescriber)
User (1) ←→ (N) TestReport (as reviewer)

// Cross-model relationships
Appointment (1) ←→ (1) MedicalRecord
MedicalRecord (1) ←→ (N) Prescription
MedicalRecord (1) ←→ (N) TestReport
Appointment (1) ←→ (1) Billing
DischargeSummary (1) ←→ (N) AfterCareInstruction
```

### **Reference Implementation**

```javascript
// Example: Finding all patient data for portal
const getPatientPortalData = async (patientId) => {
  const patient = await Patient.findById(patientId)
    .populate('portalAccess.userId');
  
  const medicalRecords = await MedicalRecord.findPatientAccessibleRecords(patientId);
  const prescriptions = await Prescription.findActiveByPatient(patientId);
  const testReports = await TestReport.findPatientAccessibleReports(patientId);
  const dischargeSummaries = await DischargeSummary.findPatientAccessible(patientId);
  const afterCareInstructions = await AfterCareInstruction.findActiveByPatient(patientId);
  const appointments = await Appointment.findByPatient(patientId, 10);
  
  return {
    patient,
    medicalRecords,
    prescriptions,
    testReports,
    dischargeSummaries,
    afterCareInstructions,
    appointments
  };
};
```

---

## 🛣️ API Route Structure

### **Route Organization**

```
/api/
├── auth/
│   ├── login/
│   ├── logout/
│   ├── register/
│   └── verify-2fa/
├── patients/
│   ├── [id]/
│   ├── register/
│   ├── search/
│   └── portal/
│       ├── profile/
│       ├── medical-history/
│       ├── prescriptions/
│       ├── test-reports/
│       ├── discharge-summaries/
│       ├── aftercare-instructions/
│       └── appointments/
├── medical-records/
│   ├── [id]/
│   ├── patient/[patientId]/
│   ├── ai/
│   │   ├── generate-summary/
│   │   └── generate-diet-plan/
│   └── attachments/
├── appointments/
│   ├── [id]/
│   ├── book/
│   ├── reschedule/
│   ├── cancel/
│   ├── check-availability/
│   └── today/
├── prescriptions/
│   ├── [id]/
│   ├── patient/[patientId]/
│   ├── download/[id]/
│   └── dispense/
├── test-reports/
│   ├── [id]/
│   ├── patient/[patientId]/
│   ├── approve/[id]/
│   ├── download/[id]/
│   └── critical-alerts/
├── discharge-summaries/
│   ├── [id]/
│   ├── patient/[patientId]/
│   ├── sign/[id]/
│   └── download/[id]/
├── aftercare-instructions/
│   ├── [id]/
│   ├── patient/[patientId]/
│   ├── acknowledge/[id]/
│   └── compliance/[id]/
├── billing/
│   ├── [id]/
│   ├── patient/[patientId]/
│   ├── payment/
│   └── discounts/
├── users/
│   ├── [id]/
│   ├── doctors/
│   ├── staff/
│   └── availability/
├── notifications/
│   ├── send/
│   ├── patient/[patientId]/
│   └── critical-alerts/
├── files/
│   ├── upload/
│   ├── download/[id]/
│   └── patient-accessible/[id]/
└── reports/
    ├── daily-summary/
    ├── patient-statistics/
    └── financial-summary/
```

### **API Route Implementation Examples**

#### **Patient Portal Routes**

```typescript
// /api/patients/portal/medical-history/route.ts
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticatePatient(request);
    if (auth instanceof NextResponse) return auth;

    const medicalRecords = await MedicalRecord.findPatientAccessibleRecords(
      auth.patient.id
    );

    return NextResponse.json({
      success: true,
      data: medicalRecords
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch medical history' },
      { status: 500 }
    );
  }
}
```

#### **Prescription Download Route**

```typescript
// /api/prescriptions/download/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    const prescription = await Prescription.findById(params.id)
      .populate('patientId', 'name patientId')
      .populate('doctorId', 'name specialization');

    if (!prescription) {
      return NextResponse.json(
        { error: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (auth.user.role === 'patient' && 
        prescription.patientId._id.toString() !== auth.user.patientId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Record download
    await prescription.addDownloadRecord(
      auth.user.id,
      getClientIP(request),
      request.headers.get('user-agent') || ''
    );

    // Generate PDF and return
    const pdfBuffer = await generatePrescriptionPDF(prescription);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="prescription-${prescription.prescriptionId}.pdf"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to download prescription' },
      { status: 500 }
    );
  }
}
```

---

## 👤 Patient Portal Implementation

### **Patient Portal Features**

1. **View Medical History**
   - Access to approved medical records
   - Chronological timeline view
   - Diagnosis and treatment history
   - Doctor notes (approved sections)

2. **Download Prescriptions**
   - Active and past prescriptions
   - PDF generation with digital signatures
   - Medication compliance tracking
   - Refill reminders

3. **Access Test Reports**
   - Lab results with normal ranges
   - Radiology reports with images
   - Critical value notifications
   - Trend analysis over time

4. **Discharge Summaries**
   - Complete discharge documentation
   - Follow-up instructions
   - Medication lists
   - Care plan details

5. **After-Care Instructions**
   - Interactive instruction sets
   - Compliance reporting
   - Reminder notifications
   - Progress tracking

6. **Appointment Management**
   - View upcoming appointments
   - Request new appointments
   - Reschedule existing appointments
   - Appointment history

### **Patient Portal Authentication**

```typescript
// Patient portal authentication middleware
export async function authenticatePatient(request: NextRequest) {
  try {
    const token = request.cookies.get('patient-auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const patient = await Patient.findById(decoded.patientId)
      .populate('portalAccess.userId');
    
    if (!patient || !patient.portalAccess.isEnabled) {
      return NextResponse.json(
        { error: 'Portal access disabled' },
        { status: 403 }
      );
    }

    return { patient, user: patient.portalAccess.userId };
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid authentication token' },
      { status: 401 }
    );
  }
}
```

### **Patient Data Access Control**

```typescript
// Check if patient can access specific medical record
const canPatientAccessRecord = (medicalRecord, patientId) => {
  // Basic ownership check
  if (medicalRecord.patientId.toString() !== patientId) {
    return false;
  }

  // Access control check
  if (!medicalRecord.patientAccess.isAccessible) {
    return false;
  }

  // Status check
  if (!['Completed', 'Reviewed', 'Approved'].includes(medicalRecord.status)) {
    return false;
  }

  return true;
};

// Filter restricted sections
const filterRestrictedSections = (record, restrictedSections) => {
  const filteredRecord = { ...record.toObject() };
  
  restrictedSections.forEach(section => {
    if (filteredRecord[section]) {
      delete filteredRecord[section];
    }
  });
  
  return filteredRecord;
};
```

---

## 🔐 Authentication & Authorization

### **Multi-Role Authentication System**

```typescript
// Role-based authentication middleware
export async function requireRole(roles: string[]) {
  return async (request: NextRequest) => {
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    if (!roles.includes(auth.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return auth;
  };
}

// Usage examples
export const requireDoctor = requireRole(['doctor']);
export const requireAdmin = requireRole(['admin', 'super-admin']);
export const requireStaff = requireRole(['doctor', 'staff', 'admin']);
```

### **Permission-Based Access Control**

```typescript
// Check specific permissions
const hasPermission = (user, module, action) => {
  if (user.role === 'super-admin') return true;
  
  const permission = user.permissions.find(p => p.module === module);
  return permission && permission.actions.includes(action);
};

// Middleware for permission checking
export async function requirePermission(module: string, action: string) {
  return async (request: NextRequest) => {
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    if (!hasPermission(auth.user, module, action)) {
      return NextResponse.json(
        { error: `Permission denied: ${action} on ${module}` },
        { status: 403 }
      );
    }

    return auth;
  };
}
```

### **Session Management**

```typescript
// Session tracking
const trackUserSession = async (user, request) => {
  const sessionData = {
    sessionId: generateSessionId(),
    deviceInfo: request.headers.get('user-agent'),
    ipAddress: getClientIP(request)
  };

  await user.addActiveSession(sessionData);
  
  return sessionData.sessionId;
};

// Session cleanup
const cleanupExpiredSessions = async () => {
  const users = await User.find({
    'activeSessions.lastActivity': {
      $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours
    }
  });

  for (const user of users) {
    user.activeSessions = user.activeSessions.filter(
      session => session.lastActivity > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    await user.save();
  }
};
```

This is Part 1 of the Backend Development Guide. The document continues with detailed implementation guidelines for data validation, file management, notifications, audit trails, and performance optimization.
