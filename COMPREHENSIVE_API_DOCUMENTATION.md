# Hospital Management System - Comprehensive API Documentation

**Generated on:** 2025-09-06T14:58:10.150Z
**Total Endpoints Tested:** 27
**Base URL:** http://localhost:3000

## Table of Contents

- [Authentication](#authentication)
- [Patient Management](#patient-management)
- [Doctor Management](#doctor-management)
- [Admin Management](#admin-management)
- [Super Admin Management](#super-admin-management)
- [Pharmacy Management](#pharmacy-management)
- [Appointment Management](#appointment-management)
- [Room Management](#room-management)
- [Staff Management](#staff-management)
- [File Management](#file-management)

## Authentication

### ✅ Register Admin User

**Description:** Register a new admin user

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Test Admin",
  "email": "testadmin@hospital.com",
  "password": "admin123",
  "role": "admin"
}
```

**Status:** 201 Created

**Content-Type:** application/json

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 12,
    "user_id": "ADMF8E1N4POVHN2",
    "name": "Test Admin",
    "email": "testadmin@hospital.com",
    "role": "admin",
    "is_active": true,
    "is_verified": false
  }
}
```

---

### ❌ Login Admin User

**Description:** Login with admin credentials

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "testadmin@hospital.com",
  "password": "admin123"
}
```

**Status:** 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "message": "Invalid input"
}
```

---

### ❌ Get Session

**Description:** Get current user session

**Endpoint:** `GET /api/auth/session`

**Status:** 401 Unauthorized

**Content-Type:** application/json

**Response:**
```json
{
  "message": "Unauthorized"
}
```

---

### ✅ Logout

**Description:** Logout current user

**Endpoint:** `POST /api/auth/logout`

**Status:** 200 OK

**Content-Type:** text/plain;charset=UTF-8

**Response:**
```json
"{\"message\":\"Logout successful\"}"
```

---

## Patient Management

### ✅ Get All Patients

**Description:** Retrieve all patients

**Endpoint:** `GET /api/patients`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
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

### ❌ Create Patient (Admin)

**Description:** Create a new patient via admin endpoint

**Endpoint:** `POST /api/admin/patients`

**Request Body:**
```json
{
  "name": "John Doe",
  "age": 30,
  "phone": "9876543210",
  "email": "john.doe@test.com",
  "address": "123 Test Street",
  "emergencyContact": "9876543211"
}
```

**Status:** 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields"
}
```

---

### ✅ Get Patient by ID

**Description:** Get specific patient details

**Endpoint:** `GET /api/patients/1`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "id": 1,
  "name": "Amit Sharma",
  "email": "amit@example.com",
  "phone": "9876543211",
  "age": 37,
  "gender": "Male",
  "address": "123 Main Street, Mumbai",
  "dateOfBirth": "1988-05-14T18:30:00.000Z",
  "bloodGroup": "Unknown",
  "emergencyContact": "9876543211",
  "medicalHistory": null
}
```

---

## Doctor Management

### ✅ Get Doctor Dashboard Stats

**Description:** Get doctor dashboard statistics

**Endpoint:** `GET /api/doctor/dashboard-stats`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "todaysAppointments": 0,
  "totalPatients": 4,
  "emergencyCalls": 0,
  "surgeriesToday": 0
}
```

---

### ✅ Get Doctor Patients

**Description:** Get patients assigned to doctor

**Endpoint:** `GET /api/doctor/patients`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
[
  {
    "id": 1,
    "firstName": "Amit",
    "lastName": "Sharma",
    "name": "Amit Sharma",
    "dateOfBirth": "1988-05-14T18:30:00.000Z",
    "age": 37,
    "phone": "9876543211",
    "email": "amit@example.com",
    "address": "123 Main Street, Mumbai",
    "gender": "Male",
    "totalAppointments": 1,
    "lastVisit": "2025-08-31T18:30:00.000Z",
    "createdAt": "2025-08-25T23:57:10.000Z"
  },
  {
    "id": 29,
    "firstName": "day2",
    "lastName": "",
    "name": "day2",
    "dateOfBirth": "2025-09-02T18:30:00.000Z",
    "age": 0,
    "phone": "96396396",
    "email": null,
    "address": "ok",
    "gender": "Female",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-09-02T09:46:35.000Z"
  },
  {
    "id": 13,
    "firstName": "Jane",
    "lastName": "Smith",
    "name": "Jane Smith",
    "dateOfBirth": "1997-08-29T18:30:00.000Z",
    "age": 28,
    "phone": "+1987654321",
    "email": null,
    "address": "456 Oak St, Somewhere, USA",
    "gender": "Female",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-08-31T00:03:30.000Z"
  },
  {
    "id": 8,
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "dateOfBirth": "1990-08-29T18:30:00.000Z",
    "age": 35,
    "phone": "+1234567890",
    "email": null,
    "address": "123 Main St, Anytown, USA",
    "gender": "Male",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-08-30T23:52:50.000Z"
  },
  {
    "id": 9,
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "dateOfBirth": "1990-08-29T18:30:00.000Z",
    "age": 35,
    "phone": "+1234567890",
    "email": null,
    "address": "123 Main St, Anytown, USA",
    "gender": "Male",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-08-30T23:53:22.000Z"
  },
  {
    "id": 10,
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "dateOfBirth": "1990-08-29T18:30:00.000Z",
    "age": 35,
    "phone": "+1234567890",
    "email": null,
    "address": "123 Main St, Anytown, USA",
    "gender": "Male",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-08-30T23:56:41.000Z"
  },
  {
    "id": 12,
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "dateOfBirth": "1990-08-29T18:30:00.000Z",
    "age": 35,
    "phone": "+1234567890",
    "email": null,
    "address": "123 Main St, Anytown, USA",
    "gender": "Male",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-08-31T00:02:40.000Z"
  },
  {
    "id": 15,
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "dateOfBirth": "1990-08-29T18:30:00.000Z",
    "age": 35,
    "phone": "+1234567890",
    "email": null,
    "address": "123 Main St, Anytown, USA",
    "gender": "Male",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-08-31T00:06:22.000Z"
  },
  {
    "id": 16,
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "dateOfBirth": "1990-08-29T18:30:00.000Z",
    "age": 35,
    "phone": "+1234567890",
    "email": null,
    "address": "123 Main St, Anytown, USA",
    "gender": "Male",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-08-31T00:07:20.000Z"
  },
  {
    "id": 18,
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "dateOfBirth": "1990-08-29T18:30:00.000Z",
    "age": 35,
    "phone": "+1234567890",
    "email": null,
    "address": "123 Main St, Anytown, USA",
    "gender": "Male",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-08-31T00:12:27.000Z"
  },
  {
    "id": 11,
    "firstName": "KIRAN",
    "lastName": "BEHERA",
    "name": "KIRAN BEHERA",
    "dateOfBirth": "2000-08-29T18:30:00.000Z",
    "age": 25,
    "phone": "1236547896",
    "email": null,
    "address": "giet",
    "gender": "Male",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-08-30T23:58:04.000Z"
  },
  {
    "id": 14,
    "firstName": "KIRAN",
    "lastName": "BEHERA",
    "name": "KIRAN BEHERA",
    "dateOfBirth": "2000-08-29T18:30:00.000Z",
    "age": 25,
    "phone": "1236547896",
    "email": null,
    "address": "No address provided",
    "gender": "Male",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-08-31T00:04:00.000Z"
  },
  {
    "id": 17,
    "firstName": "KIRAN",
    "lastName": "BEHERA",
    "name": "KIRAN BEHERA",
    "dateOfBirth": "2000-08-29T18:30:00.000Z",
    "age": 25,
    "phone": "1236547896",
    "email": null,
    "address": "No address provided",
    "gender": "Female",
    "totalAppointments": 1,
    "lastVisit": "2025-09-01T18:30:00.000Z",
    "createdAt": "2025-08-31T00:08:39.000Z"
  },
  {
    "id": 19,
    "firstName": "KIRAN",
    "lastName": "BEHERA",
    "name": "KIRAN BEHERA",
    "dateOfBirth": "2000-08-29T18:30:00.000Z",
    "age": 25,
    "phone": "1236547896",
    "email": null,
    "address": "No address provided",
    "gender": "Male",
    "totalAppointments": 1,
    "lastVisit": "2025-09-01T18:30:00.000Z",
    "createdAt": "2025-08-31T00:12:57.000Z"
  },
  {
    "id": 20,
    "firstName": "KIRAN",
    "lastName": "BEHERA",
    "name": "KIRAN BEHERA",
    "dateOfBirth": "2008-01-09T18:30:00.000Z",
    "age": 17,
    "phone": "1236547896",
    "email": "",
    "address": "No address provided",
    "gender": "Male",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-08-31T00:13:27.000Z"
  },
  {
    "id": 28,
    "firstName": "lallu",
    "lastName": "prasad panda",
    "name": "lallu prasad panda",
    "dateOfBirth": "2025-08-31T18:30:00.000Z",
    "age": 0,
    "phone": "96396396",
    "email": "lalluprasidpanda@gmail.com",
    "address": "GIETU GUNUPUR",
    "gender": "Female",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-09-02T09:42:05.000Z"
  },
  {
    "id": 2,
    "firstName": "Priya",
    "lastName": "Patel",
    "name": "Priya Patel",
    "dateOfBirth": "1995-08-21T18:30:00.000Z",
    "age": 30,
    "phone": "9876543212",
    "email": "priya@example.com",
    "address": "456 Park Avenue, Delhi",
    "gender": "Female",
    "totalAppointments": 1,
    "lastVisit": "2025-08-31T18:30:00.000Z",
    "createdAt": "2025-08-25T23:57:10.000Z"
  },
  {
    "id": 21,
    "firstName": "Rahul",
    "lastName": "Kumar Behera",
    "name": "Rahul Kumar Behera",
    "dateOfBirth": "2004-04-22T18:30:00.000Z",
    "age": 21,
    "phone": "637109960",
    "email": "22cse019.kiranbehera@giet.edu",
    "address": "giet",
    "gender": "Male",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-09-02T07:41:53.000Z"
  },
  {
    "id": 7,
    "firstName": "Test",
    "lastName": "Patient",
    "name": "Test Patient",
    "dateOfBirth": "1995-08-29T18:30:00.000Z",
    "age": 30,
    "phone": "+1234567890",
    "email": null,
    "address": "Test Address",
    "gender": "Male",
    "totalAppointments": 0,
    "lastVisit": null,
    "createdAt": "2025-08-30T23:52:12.000Z"
  }
]
```

---

### ✅ Get Doctor Appointments

**Description:** Get doctor appointments

**Endpoint:** `GET /api/doctor/appointments`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
[]
```

---

## Admin Management

### ✅ Get Admin Dashboard Stats

**Description:** Get admin dashboard statistics

**Endpoint:** `GET /api/admin/dashboard-stats`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "totalPatients": 9,
  "totalAppointments": 0,
  "completedAppointments": 5,
  "admittedPatients": 1,
  "availableBeds": 49,
  "criticalAlerts": 1,
  "todayRevenue": "0.00",
  "recentAppointments": [
    {
      "appointment_id": "A003",
      "appointment_date": "2025-09-08T18:30:00.000Z",
      "appointment_time": "05:30:00",
      "appointment_type": "",
      "status": "scheduled",
      "patient_name": "Jane Smith",
      "patient_number": "PAT398646",
      "doctor_name": "Dr. Vikram Singh"
    },
    {
      "appointment_id": "APT014",
      "appointment_date": "2025-09-09T18:30:00.000Z",
      "appointment_time": "13:30:00",
      "appointment_type": "counseling",
      "status": "scheduled",
      "patient_name": "KIRAN BEHERA",
      "patient_number": "PAT072661",
      "doctor_name": "Dr. Rajesh Kumar"
    },
    {
      "appointment_id": "APT011",
      "appointment_date": "2025-09-09T18:30:00.000Z",
      "appointment_time": "14:00:00",
      "appointment_type": "counseling",
      "status": "in-progress",
      "patient_name": "John Doe",
      "patient_number": "PAT571530",
      "doctor_name": "Dr. Rajesh Kumar"
    },
    {
      "appointment_id": "APT024",
      "appointment_date": "2025-09-13T18:30:00.000Z",
      "appointment_time": "12:45:00",
      "appointment_type": "consultation",
      "status": "scheduled",
      "patient_name": "Amit Sharma",
      "patient_number": "PAT001",
      "doctor_name": "Dr. Rajesh Kumar"
    },
    {
      "appointment_id": "APT023",
      "appointment_date": "2025-09-15T18:30:00.000Z",
      "appointment_time": "15:30:00",
      "appointment_type": "emergency",
      "status": "confirmed",
      "patient_name": "John Doe",
      "patient_number": "PAT348989",
      "doctor_name": "Dr. Rajesh Kumar"
    }
  ]
}
```

---

### ❌ Get All Admins

**Description:** Get all admin users

**Endpoint:** `GET /api/admin/admins`

**Status:** 401 Unauthorized

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Authentication token required"
}
```

---

### ✅ Get Admin Appointments

**Description:** Get all appointments for admin view

**Endpoint:** `GET /api/admin/appointments`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "appointments": [
    {
      "id": "APT010",
      "appointmentDate": "2025-09-28T18:30:00.000Z",
      "appointmentTime": "13:15:00",
      "appointmentType": "routine-checkup",
      "status": "completed",
      "notes": null,
      "createdAt": "2025-08-31T03:12:18.000Z",
      "updatedAt": "2025-08-31T03:12:18.000Z",
      "patient": {
        "id": 11,
        "name": "KIRAN BEHERA",
        "patientId": "PAT072661",
        "contactNumber": "1236547896",
        "dateOfBirth": "2000-08-29T18:30:00.000Z"
      },
      "doctor": {
        "id": 3,
        "name": "Dr. Rajesh Kumar",
        "email": "doctor@hospital.com",
        "department": "General Medicine"
      }
    },
    {
      "id": "APT025",
      "appointmentDate": "2025-09-27T18:30:00.000Z",
      "appointmentTime": "13:00:00",
      "appointmentType": "counseling",
      "status": "cancelled",
      "notes": null,
      "createdAt": "2025-08-31T03:12:21.000Z",
      "updatedAt": "2025-08-31T03:12:21.000Z",
      "patient": {
        "id": 9,
        "name": "John Doe",
        "patientId": "PAT791172",
        "contactNumber": "+1234567890",
        "dateOfBirth": "1990-08-29T18:30:00.000Z"
      },
      "doctor": {
        "id": 3,
        "name": "Dr. Rajesh Kumar",
        "email": "doctor@hospital.com",
        "department": "General Medicine"
      }
    },
    {
      "id": "APT013",
      "appointmentDate": "2025-09-25T18:30:00.000Z",
      "appointmentTime": "10:15:00",
      "appointmentType": "consultation",
      "status": "cancelled",
      "notes": null,
      "createdAt": "2025-08-31T03:12:18.000Z",
      "updatedAt": "2025-08-31T03:12:18.000Z",
      "patient": {
        "id": 8,
        "name": "John Doe",
        "patientId": "PAT759126",
        "contactNumber": "+1234567890",
        "dateOfBirth": "1990-08-29T18:30:00.000Z"
      },
      "doctor": {
        "id": 3,
        "name": "Dr. Rajesh Kumar",
        "email": "doctor@hospital.com",
        "department": "General Medicine"
      }
    },
    {
      "id": "A001",
      "appointmentDate": "2025-09-24T18:30:00.000Z",
      "appointmentTime": "07:18:00",
      "appointmentType": "emergency",
      "status": "scheduled",
      "notes": null,
      "createdAt": "2025-09-02T08:20:28.000Z",
      "updatedAt": "2025-09-02T08:20:28.000Z",
      "patient": {
        "id": 11,
        "name": "KIRAN BEHERA",
        "patientId": "PAT072661",
        "contactNumber": "1236547896",
        "dateOfBirth": "2000-08-29T18:30:00.000Z"
      },
      "doctor": {
        "id": 7,
        "name": "Dr. Vikram Singh",
        "email": "vikram.singh@hospital.com",
        "department": "General Medicine"
      }
    },
    {
      "id": "APT018",
      "appointmentDate": "2025-09-24T18:30:00.000Z",
      "appointmentTime": "12:15:00",
      "appointmentType": "routine-checkup",
      "status": "no-show",
      "notes": null,
      "createdAt": "2025-08-31T03:12:19.000Z",
      "updatedAt": "2025-08-31T03:12:19.000Z",
      "patient": {
        "id": 2,
        "name": "Priya Patel",
        "patientId": "PAT002",
        "contactNumber": "9876543212",
        "dateOfBirth": "1995-08-21T18:30:00.000Z"
      },
      "doctor": {
        "id": 3,
        "name": "Dr. Rajesh Kumar",
        "email": "doctor@hospital.com",
        "department": "General Medicine"
      }
    },
    {
      "id": "APT009",
      "appointmentDate": "2025-09-24T18:30:00.000Z",
      "appointmentTime": "12:45:00",
      "appointmentType": "counseling",
      "status": "confirmed",
      "notes": null,
      "createdAt": "2025-08-31T03:12:17.000Z",
      "updatedAt": "2025-08-31T03:12:17.000Z",
      "patient": {
        "id": 8,
        "name": "John Doe",
        "patientId": "PAT759126",
        "contactNumber": "+1234567890",
        "dateOfBirth": "1990-08-29T18:30:00.000Z"
      },
      "doctor": {
        "id": 3,
        "name": "Dr. Rajesh Kumar",
        "email": "doctor@hospital.com",
        "department": "General Medicine"
      }
    },
    {
      "id": "",
      "appointmentDate": "2025-09-24T18:30:00.000Z",
      "appointmentTime": "15:00:00",
      "appointmentType": "",
      "status": "cancelled",
      "notes": "Sample appointment for John Doe with Dr. Dr. Rajesh Kumar",
      "createdAt": "2025-08-31T03:08:30.000Z",
      "updatedAt": "2025-08-31T04:42:08.000Z",
      "patient": {
        "id": 12,
        "name": "John Doe",
        "patientId": "PAT348989",
        "contactNumber": "+1234567890",
        "dateOfBirth": "1990-08-29T18:30:00.000Z"
      },
      "doctor": {
        "id": 3,
        "name": "Dr. Rajesh Kumar",
        "email": "doctor@hospital.com",
        "department": "General Medicine"
      }
    },
    {
      "id": "APT020",
      "appointmentDate": "2025-09-23T18:30:00.000Z",
      "appointmentTime": "12:15:00",
      "appointmentType": "procedure",
      "status": "confirmed",
      "notes": null,
      "createdAt": "2025-08-31T03:12:20.000Z",
      "updatedAt": "2025-08-31T03:12:20.000Z",
      "patient": {
        "id": 13,
        "name": "Jane Smith",
        "patientId": "PAT398646",
        "contactNumber": "+1987654321",
        "dateOfBirth": "1997-08-29T18:30:00.000Z"
      },
      "doctor": {
        "id": 3,
        "name": "Dr. Rajesh Kumar",
        "email": "doctor@hospital.com",
        "department": "General Medicine"
      }
    },
    {
      "id": "APT008",
      "appointmentDate": "2025-09-23T18:30:00.000Z",
      "appointmentTime": "12:30:00",
      "appointmentType": "emergency",
      "status": "cancelled",
      "notes": null,
      "createdAt": "2025-08-31T03:12:17.000Z",
      "updatedAt": "2025-08-31T03:12:17.000Z",
      "patient": {
        "id": 2,
        "name": "Priya Patel",
        "patientId": "PAT002",
        "contactNumber": "9876543212",
        "dateOfBirth": "1995-08-21T18:30:00.000Z"
      },
      "doctor": {
        "id": 3,
        "name": "Dr. Rajesh Kumar",
        "email": "doctor@hospital.com",
        "department": "General Medicine"
      }
    },
    {
      "id": "APT021",
      "appointmentDate": "2025-09-22T18:30:00.000Z",
      "appointmentTime": "09:00:00",
      "appointmentType": "follow-up",
      "status": "in-progress",
      "notes": null,
      "createdAt": "2025-08-31T03:12:20.000Z",
      "updatedAt": "2025-08-31T03:12:20.000Z",
      "patient": {
        "id": 9,
        "name": "John Doe",
        "patientId": "PAT791172",
        "contactNumber": "+1234567890",
        "dateOfBirth": "1990-08-29T18:30:00.000Z"
      },
      "doctor": {
        "id": 3,
        "name": "Dr. Rajesh Kumar",
        "email": "doctor@hospital.com",
        "department": "General Medicine"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 35,
    "totalPages": 4
  }
}
```

---

## Super Admin Management

### ✅ Get Super Admin Dashboard Stats

**Description:** Get super admin dashboard statistics

**Endpoint:** `GET /api/super-admin/dashboard-stats`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "stats": {
    "totalUsers": 10,
    "totalDoctors": 2,
    "totalAdmins": 6,
    "totalPatients": 9,
    "todayAppointments": 0,
    "systemHealth": 98.5
  },
  "monthlyData": [
    {
      "month": "Apr",
      "users": 0,
      "doctors": 0
    },
    {
      "month": "May",
      "users": 0,
      "doctors": 0
    },
    {
      "month": "Jun",
      "users": 0,
      "doctors": 0
    },
    {
      "month": "Jul",
      "users": 0,
      "doctors": 0
    },
    {
      "month": "Aug",
      "users": 3,
      "doctors": 0
    },
    {
      "month": "Sep",
      "users": 8,
      "doctors": 3
    }
  ],
  "recentActivities": []
}
```

---

### ❌ Create Doctor

**Description:** Create a new doctor

**Endpoint:** `POST /api/super-admin/doctors`

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

**Status:** 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Missing required fields: name, email, password, contact_number, specialization, license_number"
}
```

---

### ✅ Get All Doctors

**Description:** Get all doctors

**Endpoint:** `GET /api/super-admin/doctors`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "doctors": [
    {
      "id": 9,
      "user_id": "DOC004",
      "name": "Dr. Rajesh Kumaar",
      "email": "rajeshkumar@gmail.com",
      "contact_number": "+919876543210",
      "specialization": "General ",
      "qualification": null,
      "experience_years": 0,
      "license_number": null,
      "department": "Pharmasy",
      "address": null,
      "date_of_birth": null,
      "gender": null,
      "joining_date": null,
      "salary": null,
      "is_active": 1,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-09-06T01:05:23.000Z",
      "updated_at": "2025-09-06T01:05:23.000Z"
    },
    {
      "id": 7,
      "user_id": "DOC002",
      "name": "Dr. Vikram Singh",
      "email": "vikram.singh@hospital.com",
      "contact_number": "+91 87654 32109",
      "specialization": "Neurologist",
      "qualification": "MBBS, MD Neurology",
      "experience_years": 15,
      "license_number": "MED123457",
      "department": "Neurology",
      "address": null,
      "date_of_birth": null,
      "gender": null,
      "joining_date": null,
      "salary": null,
      "is_active": 1,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-09-01T22:36:51.000Z",
      "updated_at": "2025-09-01T22:36:51.000Z"
    },
    {
      "id": 8,
      "user_id": "DOC003",
      "name": "Dr. Sunita Rao",
      "email": "sunita.rao@hospital.com",
      "contact_number": "+91 76543 21098",
      "specialization": "Pediatrician",
      "qualification": "MBBS, MD Pediatrics",
      "experience_years": 8,
      "license_number": "MED123458",
      "department": "Pediatrics",
      "address": null,
      "date_of_birth": null,
      "gender": null,
      "joining_date": null,
      "salary": null,
      "is_active": 0,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-09-01T22:36:51.000Z",
      "updated_at": "2025-09-01T22:36:51.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

---

## Pharmacy Management

### ✅ Get Pharmacy Dashboard

**Description:** Get pharmacy dashboard data

**Endpoint:** `GET /api/pharmacy/dashboard`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMedicines": 4,
    "lowStock": 1,
    "expiringSoon": 0,
    "totalValue": "5080.00",
    "totalPrescriptions": 0,
    "activePrescriptions": 2,
    "completedPrescriptions": 0,
    "pendingDispensing": 2
  }
}
```

---

### ✅ Get All Medicines

**Description:** Get all medicines in inventory

**Endpoint:** `GET /api/pharmacy/medicines`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "medicine_id": "MED002",
      "name": "Amoxicillin",
      "generic_name": "Amoxicillin",
      "brand_name": null,
      "category": "Antibiotic",
      "manufacturer": null,
      "composition": null,
      "strength": "250mg",
      "dosage_form": "capsule",
      "pack_size": null,
      "unit_price": "5.00",
      "mrp": "6.00",
      "current_stock": 500,
      "minimum_stock": 10,
      "maximum_stock": 1000,
      "expiry_date": null,
      "batch_number": null,
      "supplier": null,
      "storage_conditions": null,
      "side_effects": null,
      "contraindications": null,
      "drug_interactions": null,
      "pregnancy_category": "Unknown",
      "prescription_required": 1,
      "is_active": 1,
      "created_at": "2025-08-13T05:42:44.000Z",
      "updated_at": "2025-08-13T05:42:44.000Z",
      "batch_count": 0,
      "expiring_stock": "0"
    },
    {
      "id": 3,
      "medicine_id": "",
      "name": "asdf",
      "generic_name": "sdfv",
      "brand_name": null,
      "category": "Antihistamine",
      "manufacturer": "awsfd",
      "composition": null,
      "strength": null,
      "dosage_form": "tablet",
      "pack_size": null,
      "unit_price": "5.00",
      "mrp": "0.00",
      "current_stock": 16,
      "minimum_stock": 10,
      "maximum_stock": 1000,
      "expiry_date": null,
      "batch_number": null,
      "supplier": null,
      "storage_conditions": null,
      "side_effects": null,
      "contraindications": null,
      "drug_interactions": null,
      "pregnancy_category": "Unknown",
      "prescription_required": 1,
      "is_active": 1,
      "created_at": "2025-08-30T01:15:02.000Z",
      "updated_at": "2025-08-30T01:15:02.000Z",
      "batch_count": 0,
      "expiring_stock": "0"
    },
    {
      "id": 1,
      "medicine_id": "MED001",
      "name": "Paracetamol",
      "generic_name": "Acetaminophen",
      "brand_name": null,
      "category": "Analgesic",
      "manufacturer": null,
      "composition": null,
      "strength": "500mg",
      "dosage_form": "tablet",
      "pack_size": null,
      "unit_price": "2.50",
      "mrp": "3.00",
      "current_stock": 1000,
      "minimum_stock": 10,
      "maximum_stock": 1000,
      "expiry_date": null,
      "batch_number": null,
      "supplier": null,
      "storage_conditions": null,
      "side_effects": null,
      "contraindications": null,
      "drug_interactions": null,
      "pregnancy_category": "Unknown",
      "prescription_required": 1,
      "is_active": 1,
      "created_at": "2025-08-13T05:42:44.000Z",
      "updated_at": "2025-08-13T05:42:44.000Z",
      "batch_count": 0,
      "expiring_stock": "0"
    },
    {
      "id": 5,
      "medicine_id": "MEDMF8DZPQ1VY0GU",
      "name": "Paracetamol",
      "generic_name": null,
      "brand_name": null,
      "category": "painkiller",
      "manufacturer": null,
      "composition": null,
      "strength": null,
      "dosage_form": "tablet",
      "pack_size": null,
      "unit_price": "0.00",
      "mrp": "0.00",
      "current_stock": 0,
      "minimum_stock": 10,
      "maximum_stock": 1000,
      "expiry_date": null,
      "batch_number": null,
      "supplier": null,
      "storage_conditions": null,
      "side_effects": null,
      "contraindications": null,
      "drug_interactions": null,
      "pregnancy_category": "Unknown",
      "prescription_required": 1,
      "is_active": 1,
      "created_at": "2025-09-06T09:26:25.000Z",
      "updated_at": "2025-09-06T09:26:25.000Z",
      "batch_count": 0,
      "expiring_stock": "0"
    }
  ]
}
```

---

### ✅ Create Medicine

**Description:** Add new medicine to inventory

**Endpoint:** `POST /api/pharmacy/medicines`

**Request Body:**
```json
{
  "name": "Paracetamol",
  "category": "Painkiller",
  "price": 10.5,
  "stock": 100,
  "manufacturer": "Test Pharma",
  "expiryDate": "2025-12-31"
}
```

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "medicine_id": "MEDMF8E21FTXPWZE",
    "name": "Paracetamol",
    "generic_name": null,
    "brand_name": null,
    "category": "Painkiller",
    "manufacturer": "Test Pharma",
    "composition": null,
    "strength": null,
    "dosage_form": "tablet",
    "pack_size": null,
    "unit_price": "0.00",
    "mrp": "0.00",
    "current_stock": 0,
    "minimum_stock": 10,
    "maximum_stock": 1000,
    "expiry_date": null,
    "batch_number": null,
    "supplier": null,
    "storage_conditions": null,
    "side_effects": null,
    "contraindications": null,
    "drug_interactions": null,
    "pregnancy_category": "Unknown",
    "prescription_required": 1,
    "is_active": 1,
    "created_at": "2025-09-06T09:28:13.000Z",
    "updated_at": "2025-09-06T09:28:13.000Z"
  }
}
```

---

### ✅ Get Stock Alerts

**Description:** Get low stock alerts

**Endpoint:** `GET /api/pharmacy/alerts`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "medicine_id": "MEDMF8DZPQ1VY0GU",
      "name": "Paracetamol",
      "generic_name": null,
      "brand_name": null,
      "category": "painkiller",
      "manufacturer": null,
      "composition": null,
      "strength": null,
      "dosage_form": "tablet",
      "pack_size": null,
      "unit_price": "0.00",
      "mrp": "0.00",
      "current_stock": 0,
      "minimum_stock": 10,
      "maximum_stock": 1000,
      "expiry_date": null,
      "batch_number": null,
      "supplier": null,
      "storage_conditions": null,
      "side_effects": null,
      "contraindications": null,
      "drug_interactions": null,
      "pregnancy_category": "Unknown",
      "prescription_required": 1,
      "is_active": 1,
      "created_at": "2025-09-06T09:26:25.000Z",
      "updated_at": "2025-09-06T09:26:25.000Z",
      "batch_quantity": null,
      "alert_type": "out_of_stock"
    },
    {
      "id": 6,
      "medicine_id": "MEDMF8E21FTXPWZE",
      "name": "Paracetamol",
      "generic_name": null,
      "brand_name": null,
      "category": "Painkiller",
      "manufacturer": "Test Pharma",
      "composition": null,
      "strength": null,
      "dosage_form": "tablet",
      "pack_size": null,
      "unit_price": "0.00",
      "mrp": "0.00",
      "current_stock": 0,
      "minimum_stock": 10,
      "maximum_stock": 1000,
      "expiry_date": null,
      "batch_number": null,
      "supplier": null,
      "storage_conditions": null,
      "side_effects": null,
      "contraindications": null,
      "drug_interactions": null,
      "pregnancy_category": "Unknown",
      "prescription_required": 1,
      "is_active": 1,
      "created_at": "2025-09-06T09:28:13.000Z",
      "updated_at": "2025-09-06T09:28:13.000Z",
      "batch_quantity": null,
      "alert_type": "out_of_stock"
    }
  ]
}
```

---

### ✅ Search Medicines

**Description:** Search medicines by name

**Endpoint:** `GET /api/pharmacy/search?q=paracetamol`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": {
    "medicines": [
      {
        "id": 1,
        "medicine_id": "MED001",
        "name": "Paracetamol",
        "generic_name": "Acetaminophen",
        "brand_name": null,
        "category": "Analgesic",
        "manufacturer": null,
        "strength": "500mg",
        "dosage_form": "tablet",
        "unit_price": "2.50",
        "mrp": "3.00",
        "current_stock": 1000,
        "minimum_stock": 10,
        "expiry_date": null,
        "prescription_required": 1,
        "stock_status": "good",
        "expiry_status": "good",
        "relevance_score": 10
      },
      {
        "id": 5,
        "medicine_id": "MEDMF8DZPQ1VY0GU",
        "name": "Paracetamol",
        "generic_name": null,
        "brand_name": null,
        "category": "painkiller",
        "manufacturer": null,
        "strength": null,
        "dosage_form": "tablet",
        "unit_price": "0.00",
        "mrp": "0.00",
        "current_stock": 0,
        "minimum_stock": 10,
        "expiry_date": null,
        "prescription_required": 1,
        "stock_status": "low",
        "expiry_status": "good",
        "relevance_score": 10
      },
      {
        "id": 6,
        "medicine_id": "MEDMF8E21FTXPWZE",
        "name": "Paracetamol",
        "generic_name": null,
        "brand_name": null,
        "category": "Painkiller",
        "manufacturer": "Test Pharma",
        "strength": null,
        "dosage_form": "tablet",
        "unit_price": "0.00",
        "mrp": "0.00",
        "current_stock": 0,
        "minimum_stock": 10,
        "expiry_date": null,
        "prescription_required": 1,
        "stock_status": "low",
        "expiry_status": "good",
        "relevance_score": 10
      }
    ],
    "prescriptions": [],
    "patients": []
  },
  "query": "paracetamol",
  "type": "all"
}
```

---

## Appointment Management

### ❌ Book Appointment

**Description:** Book a new appointment

**Endpoint:** `POST /api/book-appointment`

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

**Status:** 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "message": "Please fill in all required fields"
}
```

---

## Room Management

### ✅ Get All Rooms

**Description:** Get all hospital rooms

**Endpoint:** `GET /api/admin/rooms`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "room_number": "101",
      "room_name": "General Ward A",
      "room_type": "General",
      "floor": 1,
      "capacity": 2,
      "current_occupancy": 1,
      "status": "Occupied",
      "daily_rate": "1500.00",
      "description": null,
      "created_at": "2025-08-31T01:48:59.000Z",
      "updated_at": "2025-08-31T01:48:59.000Z"
    },
    {
      "id": 2,
      "room_number": "102",
      "room_name": "Private Room A",
      "room_type": "Private",
      "floor": 1,
      "capacity": 1,
      "current_occupancy": 0,
      "status": "Available",
      "daily_rate": "3500.00",
      "description": null,
      "created_at": "2025-08-31T01:48:59.000Z",
      "updated_at": "2025-08-31T01:48:59.000Z"
    },
    {
      "id": 6,
      "room_number": "103",
      "room_name": "General Ward B",
      "room_type": "General",
      "floor": 1,
      "capacity": 2,
      "current_occupancy": 1,
      "status": "Occupied",
      "daily_rate": "1500.00",
      "description": null,
      "created_at": "2025-08-31T01:48:59.000Z",
      "updated_at": "2025-08-31T02:15:13.000Z"
    },
    {
      "id": 3,
      "room_number": "201",
      "room_name": "ICU Room 1",
      "room_type": "ICU",
      "floor": 2,
      "capacity": 1,
      "current_occupancy": 1,
      "status": "Occupied",
      "daily_rate": "8000.00",
      "description": null,
      "created_at": "2025-08-31T01:48:59.000Z",
      "updated_at": "2025-08-31T01:48:59.000Z"
    },
    {
      "id": 4,
      "room_number": "202",
      "room_name": "Semi-Private Room A",
      "room_type": "Semi-Private",
      "floor": 2,
      "capacity": 2,
      "current_occupancy": 0,
      "status": "Cleaning Required",
      "daily_rate": "2500.00",
      "description": null,
      "created_at": "2025-08-31T01:48:59.000Z",
      "updated_at": "2025-08-31T01:48:59.000Z"
    },
    {
      "id": 5,
      "room_number": "301",
      "room_name": "Emergency Room 1",
      "room_type": "Emergency",
      "floor": 3,
      "capacity": 1,
      "current_occupancy": 0,
      "status": "Available",
      "daily_rate": "5000.00",
      "description": null,
      "created_at": "2025-08-31T01:48:59.000Z",
      "updated_at": "2025-08-31T01:48:59.000Z"
    }
  ],
  "total": 6
}
```

---

### ❌ Create Room

**Description:** Create a new room

**Endpoint:** `POST /api/admin/rooms`

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

**Status:** 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Invalid action"
}
```

---

## Staff Management

### ❌ Get Staff Profiles

**Description:** Get all staff profiles

**Endpoint:** `GET /api/staff/profiles`

**Status:** 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Invalid query parameters"
}
```

---

### ❌ Create Staff Member

**Description:** Create new staff member

**Endpoint:** `POST /api/staff/create`

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

**Status:** 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Missing required fields: name, email, password, contactNumber, role, department"
}
```

---

## File Management

### ✅ Test R2 Connection

**Description:** Test Cloudflare R2 connection

**Endpoint:** `GET /api/test-r2`

**Status:** 200 OK

**Content-Type:** application/json

**Response:**
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

## API Usage Examples

### Authentication Flow

```javascript
// 1. Register a new user
const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
  "name": "Test Admin",
  "email": "testadmin@hospital.com",
  "password": "admin123",
  "role": "admin"
})
});

// 2. Login to get token
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'testadmin@hospital.com',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();

// 3. Use token for authenticated requests
const protectedResponse = await fetch('http://localhost:3000/api/admin/dashboard-stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Test Summary

| Metric | Value |
|--------|-------|
| Total Endpoints | 27 |
| Successful | 18 |
| Failed | 9 |
| Success Rate | 66.7% |

### Status Code Breakdown

| Status Code | Count | Description |
|-------------|-------|-------------|
| 200 | 17 | OK - Success |
| 201 | 1 | Created - Resource created successfully |
| 400 | 7 | Bad Request - Invalid input |
| 401 | 2 | Unauthorized - Authentication required |

