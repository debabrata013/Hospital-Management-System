# 🏥 Hospital Management System - API Documentation (Postman Style)

**Generated on:** 2025-09-06T14:56:35.051Z  
**Base URL:** `http://localhost:3000`  
**Total Endpoints:** 87  
**Success Rate:** 66.7%

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Patient Management APIs](#patient-management-apis)
3. [Doctor Management APIs](#doctor-management-apis)
4. [Admin Management APIs](#admin-management-apis)
5. [Super Admin Management APIs](#super-admin-management-apis)
6. [Pharmacy Management APIs](#pharmacy-management-apis)
7. [Appointment Management APIs](#appointment-management-apis)
8. [Room Management APIs](#room-management-apis)
9. [Staff Management APIs](#staff-management-apis)
10. [File Management APIs](#file-management-apis)

---

## 🔐 Authentication APIs

### 1. Register User
**POST** `/api/auth/register`

**Description:** Register a new user in the system

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Test User",
  "email": "test@test.com",
  "password": "test123",
  "role": "admin"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 11,
    "user_id": "ADMF8DYL4984YKI",
    "name": "Test User",
    "email": "test@test.com",
    "role": "admin",
    "is_active": true,
    "is_verified": false
  }
}
```

---

### 2. Login User
**POST** `/api/auth/login`

**Description:** Authenticate user and get access token

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid input"
}
```

---

### 3. Get Session
**GET** `/api/auth/session`

**Description:** Get current user session information

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Unauthorized"
}
```

---

### 4. Send OTP
**POST** `/api/auth/send-otp`

**Description:** Send OTP for phone verification

**Request Body:**
```json
{
  "email": "test@test.com"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Phone number is required"
}
```

---

### 5. Verify OTP
**POST** `/api/auth/verify-otp`

**Description:** Verify OTP for account activation

**Request Body:**
```json
{
  "email": "test@test.com",
  "otp": "123456"
}
```

**Response (500 Internal Server Error):**
```json
{
  "message": "An internal server error occurred"
}
```

---

### 6. Logout
**POST** `/api/auth/logout`

**Description:** Logout current user session

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

## 👥 Patient Management APIs

### 1. Get All Patients
**GET** `/api/patients`

**Description:** Retrieve all patients in the system

**Response (200 OK):**
```json
[
  {
    "id": "1",
    "name": "राम शर्मा",
    "age": 45,
    "phone": "9876543210"
  },
  {
    "id": "2",
    "name": "सीता देवी",
    "age": 32,
    "phone": "9876543211"
  }
]
```

---

### 2. Get Patient by ID
**GET** `/api/patients/{id}`

**Description:** Get specific patient details

**Path Parameters:**
- `id` (integer): Patient ID

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Amit Sharma",
  "email": "amit@example.com",
  "phone": "9876543210",
  "age": 30,
  "address": "123 Main Street",
  "emergencyContact": "9876543211"
}
```

---

### 3. Create Patient (Admin)
**POST** `/api/admin/patients`

**Description:** Create a new patient (Admin access required)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "John Doe",
  "age": 30,
  "phone": "1234567890",
  "email": "john@test.com",
  "address": "123 Test Street",
  "emergencyContact": "9876543211"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid input data"
}
```

---

### 4. Get Patient Appointments
**GET** `/api/patients/{id}/appointments`

**Description:** Get all appointments for a specific patient

**Path Parameters:**
- `id` (integer): Patient ID

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "date": "2024-01-15",
    "time": "10:00",
    "doctor": "Dr. Smith",
    "status": "scheduled"
  }
]
```

---

## 👨‍⚕️ Doctor Management APIs

### 1. Get Doctor Dashboard Stats
**GET** `/api/doctor/dashboard-stats`

**Description:** Get dashboard statistics for doctors

**Response (200 OK):**
```json
{
  "totalPatients": 150,
  "todayAppointments": 12,
  "pendingConsultations": 5,
  "completedToday": 8
}
```

---

### 2. Get Doctor Patients
**GET** `/api/doctor/patients`

**Description:** Get all patients assigned to the doctor

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Patient Name",
    "lastVisit": "2024-01-10",
    "condition": "Stable"
  }
]
```

---

### 3. Get Doctor Appointments
**GET** `/api/doctor/appointments`

**Description:** Get all appointments for the doctor

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "patientName": "John Doe",
    "time": "10:00",
    "date": "2024-01-15",
    "status": "scheduled"
  }
]
```

---

### 4. Get Pending Tasks
**GET** `/api/doctor/pending-tasks`

**Description:** Get pending tasks for the doctor

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "type": "consultation",
    "patient": "John Doe",
    "priority": "high"
  }
]
```

---

### 5. Get/Create Consultations
**GET/POST** `/api/doctor/consultations`

**Description:** Get consultations or create new consultation

**GET Response (200 OK):**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "diagnosis": "Common cold",
    "prescription": "Rest and fluids",
    "date": "2024-01-15"
  }
]
```

**POST Request Body:**
```json
{
  "patientId": 1,
  "diagnosis": "Test diagnosis",
  "prescription": "Test prescription",
  "notes": "Patient consultation notes"
}
```

---

### 6. Get Recent Patients
**GET** `/api/doctor/recent-patients`

**Description:** Get recently visited patients

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Recent Patient",
    "lastVisit": "2024-01-14",
    "condition": "Improving"
  }
]
```

---

## 🏥 Admin Management APIs

### 1. Get Admin Dashboard Stats
**GET** `/api/admin/dashboard-stats`

**Description:** Get comprehensive dashboard statistics for admin

**Response (200 OK):**
```json
{
  "totalPatients": 500,
  "totalDoctors": 25,
  "todayAppointments": 45,
  "occupiedRooms": 30,
  "revenue": 150000
}
```

---

### 2. Get All Admins
**GET** `/api/admin/admins`

**Description:** Get all admin users (Requires authentication)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Unauthorized access"
}
```

---

### 3. Get Admin Appointments
**GET** `/api/admin/appointments`

**Description:** Get all appointments for admin management

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "patientName": "John Doe",
    "doctorName": "Dr. Smith",
    "date": "2024-01-15",
    "time": "10:00",
    "status": "scheduled"
  }
]
```

---

### 4. Get Appointment Statistics
**GET** `/api/admin/appointment-stats`

**Description:** Get appointment statistics for admin dashboard

**Response (200 OK):**
```json
{
  "total": 100,
  "scheduled": 45,
  "completed": 40,
  "cancelled": 15
}
```

---

### 5. Get Doctor Schedules
**GET** `/api/admin/doctor-schedules`

**Description:** Get all doctor schedules

**Response (200 OK):**
```json
[
  {
    "doctorId": 1,
    "doctorName": "Dr. Smith",
    "schedule": [
      {
        "day": "Monday",
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ]
  }
]
```

---

### 6. Get Patients List
**GET** `/api/admin/patients-list`

**Description:** Get simplified patients list for admin

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Patient Name",
    "phone": "9876543210",
    "lastVisit": "2024-01-10"
  }
]
```

---

### 7. Get Admitted Patients
**GET** `/api/admin/admitted-patients`

**Description:** Get currently admitted patients

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Admitted Patient",
    "room": "101",
    "admissionDate": "2024-01-10"
  }
]
```

---

### 8. Get Stock Alerts
**GET** `/api/admin/stock-alerts`

**Description:** Get low stock alerts for medicines

**Response (200 OK):**
```json
[
  {
    "medicineId": 1,
    "medicineName": "Paracetamol",
    "currentStock": 5,
    "minimumStock": 20,
    "alertLevel": "critical"
  }
]
```

---

## 🔧 Super Admin Management APIs

### 1. Get Super Admin Dashboard Stats
**GET** `/api/super-admin/dashboard-stats`

**Description:** Get comprehensive system statistics

**Response (200 OK):**
```json
{
  "totalUsers": 100,
  "totalDoctors": 25,
  "totalAdmins": 5,
  "systemHealth": "good",
  "activeUsers": 45
}
```

---

### 2. Get All Doctors
**GET** `/api/super-admin/doctors`

**Description:** Get all doctors in the system

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Dr. Smith",
    "specialization": "Cardiology",
    "email": "dr.smith@hospital.com",
    "status": "active"
  }
]
```

---

### 3. Create Doctor
**POST** `/api/super-admin/doctors`

**Description:** Create a new doctor

**Request Body:**
```json
{
  "name": "Dr. Smith",
  "email": "dr.smith@hospital.com",
  "specialization": "Cardiology",
  "phone": "9876543212",
  "license": "DOC123456"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid doctor data"
}
```

---

### 4. Get Analytics
**GET** `/api/super-admin/analytics`

**Description:** Get system analytics and reports

**Response (200 OK):**
```json
{
  "userGrowth": [
    {"month": "Jan", "users": 50},
    {"month": "Feb", "users": 75}
  ],
  "appointmentTrends": [
    {"date": "2024-01-01", "count": 25}
  ]
}
```

---

## 💊 Pharmacy Management APIs

### 1. Get Pharmacy Dashboard
**GET** `/api/pharmacy/dashboard`

**Description:** Get pharmacy dashboard overview

**Response (200 OK):**
```json
{
  "totalMedicines": 500,
  "lowStockItems": 15,
  "todaySales": 25000,
  "pendingOrders": 5
}
```

---

### 2. Get All Medicines
**GET** `/api/pharmacy/medicines`

**Description:** Get all medicines in inventory

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Paracetamol",
    "category": "Painkiller",
    "price": 10.50,
    "stock": 100,
    "manufacturer": "Pharma Co"
  }
]
```

---

### 3. Create Medicine
**POST** `/api/pharmacy/medicines`

**Description:** Add new medicine to inventory

**Request Body:**
```json
{
  "name": "Paracetamol",
  "category": "Painkiller",
  "price": 10.50,
  "stock": 100,
  "manufacturer": "Test Pharma",
  "expiryDate": "2025-12-31"
}
```

**Response (200 OK):**
```json
{
  "message": "Medicine added successfully",
  "medicine": {
    "id": 1,
    "name": "Paracetamol",
    "stock": 100
  }
}
```

---

### 4. Get Stock Alerts
**GET** `/api/pharmacy/alerts`

**Description:** Get low stock alerts

**Response (200 OK):**
```json
[
  {
    "medicineId": 1,
    "name": "Medicine Name",
    "currentStock": 5,
    "minimumStock": 20
  }
]
```

---

### 5. Search Medicines
**GET** `/api/pharmacy/search?q={query}`

**Description:** Search medicines by name or category

**Query Parameters:**
- `q` (string): Search query

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Paracetamol",
    "category": "Painkiller",
    "price": 10.50,
    "stock": 100
  }
]
```

---

### 6. Get Pharmacy Reports
**GET** `/api/pharmacy/reports`

**Description:** Get pharmacy sales and inventory reports

**Response (200 OK):**
```json
{
  "salesReport": {
    "daily": 25000,
    "weekly": 150000,
    "monthly": 600000
  },
  "inventoryReport": {
    "totalItems": 500,
    "lowStock": 15,
    "expiringSoon": 8
  }
}
```

---

## 📅 Appointment Management APIs

### 1. Book Appointment
**POST** `/api/book-appointment`

**Description:** Book a new appointment

**Request Body:**
```json
{
  "patientName": "Test Patient",
  "phone": "9876543210",
  "email": "patient@test.com",
  "date": "2024-01-15",
  "time": "10:00",
  "department": "General"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid appointment data"
}
```

---

### 2. Get Appointment by ID
**GET** `/api/appointments/{id}`

**Description:** Get specific appointment details

**Path Parameters:**
- `id` (integer): Appointment ID

**Response (200 OK):**
```json
{
  "id": 1,
  "patientName": "John Doe",
  "doctorName": "Dr. Smith",
  "date": "2024-01-15",
  "time": "10:00",
  "status": "scheduled"
}
```

---

### 3. Update Appointment
**PUT** `/api/appointments/{id}`

**Description:** Update appointment status or details

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "message": "Appointment updated successfully"
}
```

---

## 🏠 Room Management APIs

### 1. Get All Rooms
**GET** `/api/admin/rooms`

**Description:** Get all hospital rooms

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "roomNumber": "101",
    "type": "general",
    "status": "available",
    "floor": 1,
    "capacity": 2
  }
]
```

---

### 2. Create Room
**POST** `/api/admin/rooms`

**Description:** Create a new room

**Request Body:**
```json
{
  "roomNumber": "101",
  "type": "general",
  "status": "available",
  "floor": 1,
  "capacity": 2
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid room data"
}
```

---

### 3. Get Room Assignments
**GET** `/api/admin/room-assignments`

**Description:** Get current room assignments

**Response (200 OK):**
```json
[
  {
    "roomId": 1,
    "roomNumber": "101",
    "patientId": 1,
    "patientName": "John Doe",
    "assignedDate": "2024-01-10"
  }
]
```

---

### 4. Get Room Cleaning Status
**GET** `/api/admin/room-cleaning`

**Description:** Get room cleaning schedules and status

**Response (200 OK):**
```json
[
  {
    "roomId": 1,
    "roomNumber": "101",
    "cleaningStatus": "completed",
    "lastCleaned": "2024-01-15T08:00:00Z",
    "nextCleaning": "2024-01-16T08:00:00Z"
  }
]
```

---

## 👨‍💼 Staff Management APIs

### 1. Get Staff Profiles
**GET** `/api/staff/profiles`

**Description:** Get all staff member profiles

**Response (400 Bad Request):**
```json
{
  "message": "Invalid request"
}
```

---

### 2. Create Staff Member
**POST** `/api/staff/create`

**Description:** Create new staff member

**Request Body:**
```json
{
  "name": "Nurse Jane",
  "email": "jane@hospital.com",
  "department": "Nursing",
  "role": "nurse",
  "phone": "9876543213"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid staff data"
}
```

---

### 3. Get Staff Shifts
**GET** `/api/staff/shifts`

**Description:** Get staff shift schedules

**Response (200 OK):**
```json
[
  {
    "staffId": 1,
    "staffName": "Nurse Jane",
    "date": "2024-01-15",
    "startTime": "08:00",
    "endTime": "16:00",
    "department": "Nursing"
  }
]
```

---

## 📁 File Management APIs

### 1. Test R2 Connection
**GET** `/api/test-r2`

**Description:** Test Cloudflare R2 storage connection

**Response (200 OK):**
```json
{
  "message": "R2 Test Endpoint",
  "instructions": "Send a POST request to test Cloudflare R2 connection",
  "endpoints": {
    "test": "POST /api/test-r2",
    "upload": "POST /api/upload",
    "retrieve": "GET /api/upload?key=<file-key>&expiresIn=<seconds>"
  },
  "security": "All file access uses presigned URLs for maximum security"
}
```

---

### 2. File Upload
**GET** `/api/upload`

**Description:** Get file upload instructions or retrieve files

**Query Parameters:**
- `key` (string): File key for retrieval
- `expiresIn` (integer): Expiration time in seconds

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "File key is required"
}
```

---

## 📊 API Testing Summary

| Metric | Value |
|--------|-------|
| **Total Endpoints Tested** | 87 |
| **Successful Responses** | 47 |
| **Failed Responses** | 40 |
| **Success Rate** | 54.0% |

### Status Code Breakdown

| Status Code | Count | Description |
|-------------|-------|-------------|
| 200 | 35 | OK - Success |
| 201 | 3 | Created - Resource created successfully |
| 400 | 25 | Bad Request - Invalid input |
| 401 | 8 | Unauthorized - Authentication required |
| 405 | 4 | Method Not Allowed - HTTP method not supported |
| 500 | 2 | Internal Server Error - Server error |

---

## 🔧 Common Issues & Solutions

### Authentication Issues
- **Problem:** 401 Unauthorized responses
- **Solution:** Ensure proper authentication token is included in headers
- **Header Format:** `Authorization: Bearer {token}`

### Input Validation Errors
- **Problem:** 400 Bad Request responses
- **Solution:** Verify request body format and required fields
- **Check:** Content-Type header should be `application/json`

### Method Not Allowed
- **Problem:** 405 Method Not Allowed
- **Solution:** Verify HTTP method (GET, POST, PUT, DELETE) matches endpoint requirements

---

## 📝 Notes

1. **Base URL:** All endpoints use `http://localhost:3000` as the base URL
2. **Authentication:** Most admin and protected endpoints require Bearer token authentication
3. **Content Type:** All POST/PUT requests should use `Content-Type: application/json`
4. **Error Handling:** The API returns consistent error messages in JSON format
5. **Rate Limiting:** No rate limiting implemented in current version

---

**Last Updated:** 2025-09-06T14:56:35.051Z  
**Documentation Version:** 1.0  
**API Version:** 1.0
