# 🏥 User & Patient Creation Guide

## 📋 **Overview**

Your hospital management system has **two separate entities**:

### 1. **USERS** (Staff/System Users)
- **Doctors, Admins, Receptionists, Nurses, Pharmacy Staff**
- Stored in `users` table
- Have login credentials and system access
- Created through admin panel or scripts

### 2. **PATIENTS** (Hospital Visitors)
- **People who visit hospital for treatment**
- Stored in `patients` table  
- No login credentials (just records)
- Created by staff during registration

---

## 👥 **USER CREATION (Staff/System Users)**

### **User Roles Available:**
```sql
ENUM('super-admin', 'admin', 'doctor', 'staff', 'receptionist', 'pharmacy')
```

### **Method 1: Super Admin Creation (First Time Setup)**

**Script:** `scripts/create-super-admin.js`
```bash
node scripts/create-super-admin.js
```

**Creates:**
- Email: `superadmin@gmail.com`
- Password: `dev123`
- Role: `super-admin`

### **Method 2: Admin Creation Script**

**Script:** `scripts/create-admin.js`
```bash
node scripts/create-admin.js
```

**Creates:**
- Email: `admin@arogyahospital.com`
- Password: `Admin@123`
- Role: `super-admin`

### **Method 3: Registration API**

**Endpoint:** `POST /api/auth/register`

```json
{
  "name": "Dr. John Doe",
  "email": "doctor@hospital.com",
  "password": "SecurePass123",
  "role": "doctor"
}
```

**Auto-generates:**
- `user_id`: `DOC1234567890AB` (role prefix + timestamp + random)
- Password hash using bcrypt
- Default values for contact, verification status

### **Method 4: Pharmacy User Creation**

**Script:** `scripts/create-pharmacy-user.js`
```bash
node scripts/create-pharmacy-user.js
```

**Creates:**
- Email: `pharmacy@hospital.com`
- Password: `pharmacy123`
- Role: `pharmacy`

---

## 🏥 **PATIENT CREATION (Hospital Visitors)**

### **Method 1: Patient Registration API**

**Endpoint:** `POST /api/patients`

```json
{
  "name": "Patient Name",
  "date_of_birth": "1990-01-01",
  "gender": "Male",
  "contact_number": "9876543210",
  "address": "Patient Address",
  "emergency_contact_name": "Emergency Contact",
  "emergency_contact_number": "9876543211"
}
```

**Auto-generates:**
- `patient_id`: `PAT1234567890` (unique alphanumeric ID)
- Registration date
- Created by (staff user who registered)

### **Method 2: Sample Patient Data**

**Script:** `scripts/create-sample-data.js`
```bash
node scripts/create-sample-data.js
```

**Creates sample patients for testing**

---

## 🔐 **Authentication Flow**

### **For USERS (Staff):**
1. **Login:** `POST /api/auth/login`
2. **OTP Verification:** `POST /api/auth/verify-otp`
3. **Session Management:** JWT tokens
4. **Role-based Access:** Different dashboards per role

### **For PATIENTS:**
- **No login required**
- **Identified by:** `patient_id` during visits
- **Records managed by:** Staff users

---

## 📊 **Database Schema**

### **Users Table:**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super-admin', 'admin', 'doctor', 'staff', 'receptionist', 'pharmacy'),
    contact_number VARCHAR(15),
    department VARCHAR(50),
    specialization VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Patients Table:**
```sql
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other'),
    contact_number VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_number VARCHAR(15) NOT NULL,
    medical_history TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## 🚀 **Quick Setup Commands**

### **1. Create Super Admin (First Time):**
```bash
node scripts/create-super-admin.js
```

### **2. Create Sample Users:**
```bash
node scripts/create-sample-data.js
```

### **3. Create Pharmacy User:**
```bash
node scripts/create-pharmacy-user.js
```

### **4. Setup Complete Database:**
```bash
node scripts/create-schema.js
```

---

## 🔑 **Default Login Credentials**

### **Super Admin:**
- **Email:** `superadmin@gmail.com`
- **Password:** `dev123`
- **Access:** Full system access

### **Admin:**
- **Email:** `admin@arogyahospital.com`
- **Password:** `Admin@123`
- **Access:** Administrative functions

### **Pharmacy:**
- **Email:** `pharmacy@hospital.com`
- **Password:** `pharmacy123`
- **Access:** Pharmacy module only

---

## 📱 **User Creation Workflow**

### **For Hospital Staff:**
1. **Super Admin** logs in
2. Goes to **User Management**
3. **Creates new user** with role
4. **User receives credentials**
5. **User logs in** and completes profile

### **For Patients:**
1. **Patient visits hospital**
2. **Receptionist** opens registration
3. **Enters patient details**
4. **System generates** `patient_id`
5. **Patient record created**

---

## ⚠️ **Important Notes**

### **Users vs Patients:**
- **Users** = Hospital staff with system access
- **Patients** = People receiving medical care
- **Separate tables** and different purposes
- **Users can create/manage** patient records

### **Security:**
- **All passwords** are bcrypt hashed
- **Role-based access** control implemented
- **Session management** with JWT tokens
- **OTP verification** for secure login

### **ID Generation:**
- **User ID:** Role prefix + timestamp + random (e.g., `DOC1234567890AB`)
- **Patient ID:** `PAT` + timestamp (e.g., `PAT1234567890`)

This system ensures proper separation between hospital staff (users) and patients, with appropriate security and access controls for each type.
