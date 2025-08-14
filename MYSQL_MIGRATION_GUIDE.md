# 🔄 MySQL Migration Guide - Hostinger Database
## आरोग्य अस्पताल (Arogya Hospital) Management System

### 📋 Migration Overview

This guide provides step-by-step instructions to migrate your Hospital Management System from MongoDB to Hostinger MySQL database.

---

## 🗄️ Database Schema Analysis

### **Frontend Components → Database Tables Mapping:**

| **Frontend Module** | **Database Tables** | **Key Features** |
|-------------------|-------------------|-----------------|
| **Super Admin** | `users`, `departments`, `hospital_settings`, `audit_logs` | User management, system configuration |
| **Admin Dashboard** | `patients`, `appointments`, `billing`, `staff_profiles` | Patient management, scheduling, billing |
| **Doctor Portal** | `medical_records`, `prescriptions`, `test_reports` | Clinical documentation, prescriptions |
| **Receptionist** | `patients`, `appointments`, `appointment_queue`, `billing` | Patient registration, appointment scheduling |
| **Staff Dashboard** | `patient_vitals`, `staff_shifts`, `leave_requests` | Vitals recording, shift management |
| **Pharmacy** | `medicines`, `prescription_medications`, `medicine_stock_transactions` | Inventory management, dispensing |

---

## 🚀 Step-by-Step Migration Process

### **Phase 1: Database Setup (Day 1)**

#### **1.1 Create MySQL Database Schema**

```bash
# Connect to Hostinger MySQL
mysql -h 148.222.53.8 -u hospital -p u153229971_Hospital

# Run the schema files
source /path/to/mysql-schema.sql
source /path/to/mysql-schema-part2.sql
source /path/to/mysql-schema-part3.sql
```

#### **1.2 Verify Database Structure**

```sql
-- Check all tables are created
SHOW TABLES;

-- Verify key tables structure
DESCRIBE users;
DESCRIBE patients;
DESCRIBE appointments;
DESCRIBE medicines;
```

### **Phase 2: Update Environment Configuration (Day 1)**

#### **2.1 Update .env.local**

```bash
# Remove MongoDB configuration
# MONGODB_URI=...

# Add MySQL configuration (already present)
DB_HOST=148.222.53.8
DB_USER=hospital
DB_PASSWORD=Hospital2025
DB_NAME=u153229971_Hospital
DB_PORT=3306

# Keep existing JWT and other configs
JWT_SECRET=arogya-hospital-super-secret-jwt-key-2024-dev-environment
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NODE_ENV=development
```

#### **2.2 Install MySQL Dependencies**

```bash
npm install mysql2
npm uninstall mongoose mongodb
```

### **Phase 3: API Routes Migration (Days 2-3)**

#### **3.1 Replace MongoDB Models with MySQL Queries**

**Before (MongoDB):**
```javascript
const User = require('../models/User');
const user = await User.findOne({ email });
```

**After (MySQL):**
```javascript
const { executeQuery } = require('../lib/mysql-connection');
const users = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
const user = users[0];
```

#### **3.2 Update All API Routes**

Replace the following API files:

| **API Route** | **Status** | **New Implementation** |
|--------------|-----------|----------------------|
| `/api/auth/login` | ✅ **Complete** | MySQL authentication with JWT |
| `/api/patients` | ✅ **Complete** | Full CRUD with pagination |
| `/api/appointments` | ✅ **Complete** | Appointment management with queue |
| `/api/prescriptions` | 🔄 **Next** | Prescription management |
| `/api/billing` | 🔄 **Next** | Billing and payments |
| `/api/medicines` | 🔄 **Next** | Pharmacy inventory |
| `/api/staff` | 🔄 **Next** | Staff management |
| `/api/reports` | 🔄 **Next** | Analytics and reports |

### **Phase 4: Frontend Updates (Days 4-5)**

#### **4.1 Update API Calls in Frontend Components**

**Example: Patient Management**
```typescript
// Before (MongoDB structure)
const response = await fetch('/api/patients', {
  method: 'POST',
  body: JSON.stringify({
    name,
    email,
    contactNumber,
    // MongoDB field names
  })
});

// After (MySQL structure) - Same API, different backend
const response = await fetch('/api/patients', {
  method: 'POST',
  body: JSON.stringify({
    name,
    email,
    contactNumber,
    dateOfBirth,
    // Standardized field names
  })
});
```

#### **4.2 Update Data Models in Frontend**

```typescript
// types/patient.ts
export interface Patient {
  id: number;                    // Changed from MongoDB ObjectId
  patient_id: string;           // Unique patient identifier
  name: string;
  date_of_birth: string;        // Changed from dateOfBirth
  contact_number: string;       // Changed from contactNumber
  // ... other fields
}
```

### **Phase 5: Testing & Validation (Days 6-7)**

#### **5.1 Database Connection Test**

```javascript
// Test database connection
const { testConnection } = require('./lib/mysql-connection');

async function testDB() {
  const isConnected = await testConnection();
  console.log('Database connected:', isConnected);
}

testDB();
```

#### **5.2 API Testing Checklist**

- [ ] User authentication (login/logout)
- [ ] Patient registration and management
- [ ] Appointment scheduling
- [ ] Prescription creation
- [ ] Billing operations
- [ ] Medicine inventory
- [ ] Staff management
- [ ] Report generation

---

## 🔧 Implementation Details

### **MySQL Connection Configuration**

```javascript
// lib/mysql-connection.js
const mysql = require('mysql2/promise');

const dbConfig = {
  host: '148.222.53.8',
  user: 'hospital',
  password: 'Hospital2025',
  database: 'u153229971_Hospital',
  port: 3306,
  charset: 'utf8mb4',
  timezone: '+05:30'
};
```

### **Key API Route Examples**

#### **Authentication API**
```javascript
// app/api/auth/login/route.js
export async function POST(request) {
  const { email, password } = await request.json();
  
  const users = await executeQuery(
    'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
    [email]
  );
  
  // Password verification and JWT token generation
}
```

#### **Patient Management API**
```javascript
// app/api/patients/route.js
export async function GET(request) {
  const patients = await executeQuery(`
    SELECT p.*, u.name as created_by_name
    FROM patients p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.is_active = TRUE
    ORDER BY p.created_at DESC
  `);
  
  return NextResponse.json({ success: true, data: patients });
}
```

---

## 📊 Database Schema Highlights

### **Core Tables Structure:**

1. **users** - Staff, doctors, admins (15 fields)
2. **patients** - Patient information (25 fields)
3. **appointments** - Appointment scheduling (20 fields)
4. **prescriptions** - Prescription management (12 fields)
5. **medicines** - Pharmacy inventory (25 fields)
6. **billing** - Financial transactions (18 fields)
7. **medical_records** - Clinical documentation (15 fields)
8. **audit_logs** - System audit trail (12 fields)

### **Key Features:**

- **Unique ID Generation**: `PAT202412001`, `APT202412001`, etc.
- **Role-based Access Control**: Super-admin, admin, doctor, staff, receptionist
- **Audit Trail**: Complete logging of all operations
- **Soft Deletes**: `is_active` flag for data retention
- **Relationships**: Proper foreign key constraints
- **Indexing**: Optimized for performance

---

## 🔍 Data Migration Strategy

### **Option 1: Fresh Start (Recommended)**
- Start with clean MySQL database
- Re-enter critical data manually
- Import essential master data (medicines, departments)

### **Option 2: Data Export/Import**
- Export existing MongoDB data to JSON
- Transform data structure to match MySQL schema
- Import using custom migration scripts

### **Migration Script Example:**
```javascript
// scripts/migrate-patients.js
const { executeQuery } = require('../lib/mysql-connection');

async function migratePatients(mongoPatients) {
  for (const patient of mongoPatients) {
    const insertData = {
      patient_id: generatePatientId(),
      name: patient.name,
      date_of_birth: formatDate(patient.dateOfBirth),
      contact_number: patient.contactNumber,
      // ... transform other fields
    };
    
    await executeQuery(
      'INSERT INTO patients SET ?',
      [insertData]
    );
  }
}
```

---

## 🚨 Critical Migration Points

### **1. Field Name Changes**
- `dateOfBirth` → `date_of_birth`
- `contactNumber` → `contact_number`
- `_id` → `id` (auto-increment)

### **2. Data Type Changes**
- MongoDB ObjectId → MySQL INT (auto-increment)
- Date strings → MySQL DATE/DATETIME
- Nested objects → JSON columns or separate tables

### **3. Relationship Changes**
- MongoDB references → MySQL foreign keys
- Embedded documents → Separate tables with relationships

### **4. Query Changes**
- MongoDB aggregation → MySQL JOINs
- `$lookup` → `LEFT JOIN`
- `$match` → `WHERE`

---

## 📈 Performance Optimizations

### **Database Indexes**
```sql
-- Key indexes for performance
CREATE INDEX idx_patients_name_phone ON patients(name, contact_number);
CREATE INDEX idx_appointments_date_doctor ON appointments(appointment_date, doctor_id);
CREATE INDEX idx_prescriptions_patient_date ON prescriptions(patient_id, prescription_date);
CREATE INDEX idx_medicines_name_stock ON medicines(name, current_stock);
```

### **Connection Pooling**
```javascript
const pool = mysql.createPool({
  ...dbConfig,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000
});
```

---

## 🔒 Security Considerations

### **1. SQL Injection Prevention**
```javascript
// Always use parameterized queries
const users = await executeQuery(
  'SELECT * FROM users WHERE email = ?',
  [email]  // Parameters array
);
```

### **2. Data Validation**
```javascript
// Validate input before database operations
if (!email || !email.includes('@')) {
  throw new Error('Invalid email format');
}
```

### **3. Access Control**
```javascript
// Role-based access control
if (user.role !== 'admin' && user.role !== 'super-admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

---

## 🧪 Testing Strategy

### **1. Unit Tests**
```javascript
// Test database operations
describe('Patient API', () => {
  test('should create patient', async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(201);
  });
});
```

### **2. Integration Tests**
```javascript
// Test complete workflows
describe('Appointment Workflow', () => {
  test('should book appointment for existing patient', async () => {
    // Create patient → Book appointment → Verify booking
  });
});
```

### **3. Load Testing**
```bash
# Test database performance
ab -n 1000 -c 10 http://localhost:3000/api/patients
```

---

## 📋 Migration Checklist

### **Pre-Migration**
- [ ] Backup existing MongoDB data
- [ ] Set up Hostinger MySQL database
- [ ] Install MySQL dependencies
- [ ] Update environment variables

### **Migration**
- [ ] Create database schema
- [ ] Update database connection
- [ ] Migrate API routes
- [ ] Update frontend components
- [ ] Test all functionality

### **Post-Migration**
- [ ] Performance testing
- [ ] Security audit
- [ ] User acceptance testing
- [ ] Documentation update
- [ ] Deployment to production

---

## 🚀 Deployment to Hostinger

### **1. Upload Files**
```bash
# Upload to Hostinger file manager
- Upload all project files to public_html
- Ensure node_modules are installed
- Set proper file permissions
```

### **2. Environment Configuration**
```bash
# Create .env.production
DB_HOST=148.222.53.8
DB_USER=hospital
DB_PASSWORD=Hospital2025
DB_NAME=u153229971_Hospital
DB_PORT=3306
NODE_ENV=production
```

### **3. Start Application**
```bash
# On Hostinger server
npm install
npm run build
npm start
```

---

## 📞 Support & Troubleshooting

### **Common Issues:**

1. **Connection Timeout**
   - Increase `acquireTimeout` in connection config
   - Check Hostinger firewall settings

2. **Query Performance**
   - Add appropriate indexes
   - Optimize JOIN queries
   - Use LIMIT for large datasets

3. **Data Type Errors**
   - Ensure proper date formatting
   - Validate JSON data before insertion
   - Handle NULL values properly

### **Debug Tools:**
```javascript
// Enable query logging
const result = await executeQuery(query, params);
console.log('Query executed:', query, params);
```

---

## 🎯 Success Metrics

- **Performance**: < 2s page load times
- **Reliability**: 99.9% uptime
- **Security**: No SQL injection vulnerabilities
- **Scalability**: Handle 1000+ concurrent users
- **Data Integrity**: Zero data loss during migration

---

**Migration Timeline: 7 Days**
**Estimated Effort: 40-50 hours**
**Risk Level: Medium (with proper testing)**

Ready to proceed with the migration? Let's start with Phase 1! 🚀
