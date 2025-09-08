# Hospital Management System - API Documentation

**Generated on:** 2025-09-06T14:56:35.051Z
**Total Endpoints Tested:** 87

## Authentication APIs



---

### POST /api/auth/register

**Request Body:**
```json
{
  "name": "Test User",
  "email": "test@test.com",
  "password": "test123",
  "role": "admin"
}
```

**Status:** ✅ 201 Created

**Content-Type:** application/json

**Response:**
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

### GET /api/auth/session

**Status:** ❌ 401 Unauthorized

**Content-Type:** application/json

**Response:**
```json
{
  "message": "Unauthorized"
}
```

---

### POST /api/auth/logout

**Status:** ✅ 200 OK

**Content-Type:** text/plain;charset=UTF-8

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

### POST /api/auth/send-otp

**Request Body:**
```json
{
  "email": "test@test.com"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "message": "Phone number is required"
}
```

---

### POST /api/auth/verify-otp

**Request Body:**
```json
{
  "email": "test@test.com",
  "otp": "123456"
}
```

**Status:** ❌ 500 Internal Server Error

**Content-Type:** application/json

**Response:**
```json
{
  "message": "An internal server error occurred"
}
```

---

## Patients APIs

### GET /api/patients

**Status:** ✅ 200 OK

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

### POST /api/patients

**Request Body:**
```json
{
  "name": "John Doe",
  "age": 30,
  "phone": "1234567890",
  "email": "john@test.com"
}
```

**Status:** ❌ 405 Method Not Allowed

**Response:**
```json
""
```

---

### GET /api/patients/1

**Status:** ✅ 200 OK

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

### PUT /api/patients/1

**Request Body:**
```json
{
  "name": "John Updated"
}
```

**Status:** ❌ 405 Method Not Allowed

**Response:**
```json
""
```

---

### GET /api/patients/1/appointments

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[
  {
    "id": 17,
    "appointmentDate": "2025-09-19T18:30:00.000Z",
    "reason": null,
    "status": "rescheduled",
    "notes": null,
    "patientId": 1,
    "name": "Amit Sharma",
    "email": "amit@example.com",
    "phone": "9876543211"
  },
  {
    "id": 29,
    "appointmentDate": "2025-09-13T18:30:00.000Z",
    "reason": null,
    "status": "scheduled",
    "notes": null,
    "patientId": 1,
    "name": "Amit Sharma",
    "email": "amit@example.com",
    "phone": "9876543211"
  },
  {
    "id": 5,
    "appointmentDate": "2025-08-31T18:30:00.000Z",
    "reason": null,
    "status": "scheduled",
    "notes": null,
    "patientId": 1,
    "name": "Amit Sharma",
    "email": "amit@example.com",
    "phone": "9876543211"
  },
  {
    "id": 35,
    "appointmentDate": "2025-08-31T18:30:00.000Z",
    "reason": "Follow-up consultation for hypertension",
    "status": "scheduled",
    "notes": "Regular follow-up appointment",
    "patientId": 1,
    "name": "Amit Sharma",
    "email": "amit@example.com",
    "phone": "9876543211"
  },
  {
    "id": 1,
    "appointmentDate": "2025-08-30T18:30:00.000Z",
    "reason": null,
    "status": "confirmed",
    "notes": null,
    "patientId": 1,
    "name": "Amit Sharma",
    "email": "amit@example.com",
    "phone": "9876543211"
  }
]
```

---

### GET /api/doctor/patients

**Status:** ✅ 200 OK

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

### GET /api/admin/patients

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "patients": [
    {
      "id": 29,
      "patient_id": "P002",
      "name": "day2",
      "date_of_birth": "2025-09-02T18:30:00.000Z",
      "gender": "Female",
      "contact_number": "96396396",
      "email": null,
      "address": "ok",
      "blood_group": "AB-",
      "emergency_contact_name": "pl",
      "emergency_contact_number": "96396396",
      "emergency_contact_relation": null,
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": null,
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 1,
      "registration_date": "2025-09-01T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-09-02T09:46:35.000Z",
      "updated_at": "2025-09-02T09:46:35.000Z"
    },
    {
      "id": 28,
      "patient_id": "P001",
      "name": "lallu prasad panda",
      "date_of_birth": "2025-08-31T18:30:00.000Z",
      "gender": "Female",
      "contact_number": "96396396",
      "email": "lalluprasidpanda@gmail.com",
      "address": "GIETU GUNUPUR",
      "blood_group": "AB-",
      "emergency_contact_name": "ok",
      "emergency_contact_number": "96396396",
      "emergency_contact_relation": null,
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": null,
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 1,
      "registration_date": "2025-09-01T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-09-02T09:42:05.000Z",
      "updated_at": "2025-09-02T09:42:05.000Z"
    },
    {
      "id": 21,
      "patient_id": "PNaN",
      "name": "Rahul Kumar Behera",
      "date_of_birth": "2004-04-22T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "637109960",
      "email": "22cse019.kiranbehera@giet.edu",
      "address": "giet",
      "blood_group": null,
      "emergency_contact_name": "1236547896",
      "emergency_contact_number": "1236547896",
      "emergency_contact_relation": "1236547896",
      "city": "rayagada",
      "state": "odisha",
      "pincode": "765022",
      "marital_status": "Single",
      "occupation": "student ",
      "insurance_provider": "no",
      "insurance_policy_number": "21455",
      "insurance_expiry_date": null,
      "aadhar_number": "545677888",
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-09-01T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-09-02T07:41:53.000Z",
      "updated_at": "2025-09-02T08:21:25.000Z"
    },
    {
      "id": 20,
      "patient_id": "PAT996376",
      "name": "KIRAN BEHERA",
      "date_of_birth": "2008-01-09T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "1236547896",
      "email": "",
      "address": "No address provided",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "1236547896",
      "emergency_contact_relation": "Emergency",
      "city": "",
      "state": "",
      "pincode": "",
      "marital_status": "Divorced",
      "occupation": "",
      "insurance_provider": "",
      "insurance_policy_number": "",
      "insurance_expiry_date": null,
      "aadhar_number": "",
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:13:27.000Z",
      "updated_at": "2025-08-31T23:18:28.000Z"
    },
    {
      "id": 19,
      "patient_id": "PAT965925",
      "name": "KIRAN BEHERA",
      "date_of_birth": "2000-08-29T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "1236547896",
      "email": null,
      "address": "No address provided",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "1236547896",
      "emergency_contact_relation": "Emergency",
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": "Single",
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:12:57.000Z",
      "updated_at": "2025-09-02T07:44:22.000Z"
    },
    {
      "id": 18,
      "patient_id": "PAT935696",
      "name": "John Doe",
      "date_of_birth": "1990-08-29T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "+1234567890",
      "email": null,
      "address": "123 Main St, Anytown, USA",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "+0987654321",
      "emergency_contact_relation": "Emergency",
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": "Single",
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:12:27.000Z",
      "updated_at": "2025-08-31T00:32:20.000Z"
    },
    {
      "id": 17,
      "patient_id": "PAT708391",
      "name": "KIRAN BEHERA",
      "date_of_birth": "2000-08-29T18:30:00.000Z",
      "gender": "Female",
      "contact_number": "1236547896",
      "email": null,
      "address": "No address provided",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "1236547896",
      "emergency_contact_relation": "Emergency",
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": "Single",
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:08:39.000Z",
      "updated_at": "2025-09-02T07:44:41.000Z"
    },
    {
      "id": 16,
      "patient_id": "PAT628883",
      "name": "John Doe",
      "date_of_birth": "1990-08-29T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "+1234567890",
      "email": null,
      "address": "123 Main St, Anytown, USA",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "+0987654321",
      "emergency_contact_relation": "Emergency",
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": "Single",
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:07:20.000Z",
      "updated_at": "2025-09-02T07:42:36.000Z"
    },
    {
      "id": 15,
      "patient_id": "PAT571530",
      "name": "John Doe",
      "date_of_birth": "1990-08-29T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "+1234567890",
      "email": null,
      "address": "123 Main St, Anytown, USA",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "+0987654321",
      "emergency_contact_relation": "Emergency",
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": "Single",
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:06:22.000Z",
      "updated_at": "2025-09-02T08:20:27.000Z"
    },
    {
      "id": 14,
      "patient_id": "PAT428802",
      "name": "KIRAN BEHERA",
      "date_of_birth": "2000-08-29T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "1236547896",
      "email": null,
      "address": "No address provided",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "1236547896",
      "emergency_contact_relation": "Emergency",
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": "Single",
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:04:00.000Z",
      "updated_at": "2025-09-02T08:31:24.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 19,
    "totalPages": 2
  }
}
```

---

### POST /api/admin/patients

**Request Body:**
```json
{
  "name": "Admin Patient",
  "age": 25,
  "phone": "9876543210"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields"
}
```

---

### GET /api/admin/patients-list

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[
  {
    "id": 1,
    "name": "Amit Sharma",
    "patient_id": "PAT001",
    "contact_number": "9876543211",
    "date_of_birth": "1988-05-14T18:30:00.000Z",
    "gender": "Male",
    "is_active": 1
  },
  {
    "id": 29,
    "name": "day2",
    "patient_id": "P002",
    "contact_number": "96396396",
    "date_of_birth": "2025-09-02T18:30:00.000Z",
    "gender": "Female",
    "is_active": 1
  },
  {
    "id": 8,
    "name": "John Doe",
    "patient_id": "PAT759126",
    "contact_number": "+1234567890",
    "date_of_birth": "1990-08-29T18:30:00.000Z",
    "gender": "Male",
    "is_active": 1
  },
  {
    "id": 9,
    "name": "John Doe",
    "patient_id": "PAT791172",
    "contact_number": "+1234567890",
    "date_of_birth": "1990-08-29T18:30:00.000Z",
    "gender": "Male",
    "is_active": 1
  },
  {
    "id": 10,
    "name": "John Doe",
    "patient_id": "PAT990296",
    "contact_number": "+1234567890",
    "date_of_birth": "1990-08-29T18:30:00.000Z",
    "gender": "Male",
    "is_active": 1
  },
  {
    "id": 12,
    "name": "John Doe",
    "patient_id": "PAT348989",
    "contact_number": "+1234567890",
    "date_of_birth": "1990-08-29T18:30:00.000Z",
    "gender": "Male",
    "is_active": 1
  },
  {
    "id": 11,
    "name": "KIRAN BEHERA",
    "patient_id": "PAT072661",
    "contact_number": "1236547896",
    "date_of_birth": "2000-08-29T18:30:00.000Z",
    "gender": "Male",
    "is_active": 1
  },
  {
    "id": 28,
    "name": "lallu prasad panda",
    "patient_id": "P001",
    "contact_number": "96396396",
    "date_of_birth": "2025-08-31T18:30:00.000Z",
    "gender": "Female",
    "is_active": 1
  },
  {
    "id": 2,
    "name": "Priya Patel",
    "patient_id": "PAT002",
    "contact_number": "9876543212",
    "date_of_birth": "1995-08-21T18:30:00.000Z",
    "gender": "Female",
    "is_active": 1
  }
]
```

---

## Appointments APIs

### GET /api/patients/1/appointments

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[
  {
    "id": 17,
    "appointmentDate": "2025-09-19T18:30:00.000Z",
    "reason": null,
    "status": "rescheduled",
    "notes": null,
    "patientId": 1,
    "name": "Amit Sharma",
    "email": "amit@example.com",
    "phone": "9876543211"
  },
  {
    "id": 29,
    "appointmentDate": "2025-09-13T18:30:00.000Z",
    "reason": null,
    "status": "scheduled",
    "notes": null,
    "patientId": 1,
    "name": "Amit Sharma",
    "email": "amit@example.com",
    "phone": "9876543211"
  },
  {
    "id": 5,
    "appointmentDate": "2025-08-31T18:30:00.000Z",
    "reason": null,
    "status": "scheduled",
    "notes": null,
    "patientId": 1,
    "name": "Amit Sharma",
    "email": "amit@example.com",
    "phone": "9876543211"
  },
  {
    "id": 35,
    "appointmentDate": "2025-08-31T18:30:00.000Z",
    "reason": "Follow-up consultation for hypertension",
    "status": "scheduled",
    "notes": "Regular follow-up appointment",
    "patientId": 1,
    "name": "Amit Sharma",
    "email": "amit@example.com",
    "phone": "9876543211"
  },
  {
    "id": 1,
    "appointmentDate": "2025-08-30T18:30:00.000Z",
    "reason": null,
    "status": "confirmed",
    "notes": null,
    "patientId": 1,
    "name": "Amit Sharma",
    "email": "amit@example.com",
    "phone": "9876543211"
  }
]
```

---

### GET /api/appointments/1

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "id": 1,
  "appointmentDate": "2025-08-30T18:30:00.000Z",
  "reason": null,
  "status": "confirmed",
  "notes": null,
  "patientId": 1,
  "name": "Amit Sharma",
  "email": "amit@example.com",
  "phone": "9876543211",
  "age": 37,
  "gender": "Male"
}
```

---

### PUT /api/appointments/1

**Request Body:**
```json
{
  "status": "completed"
}
```

**Status:** ❌ 405 Method Not Allowed

**Response:**
```json
""
```

---

### POST /api/book-appointment

**Request Body:**
```json
{
  "patientName": "Test Patient",
  "phone": "1234567890",
  "date": "2024-01-01",
  "time": "10:00"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "message": "Please fill in all required fields"
}
```

---

### GET /api/doctor/appointments

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[]
```

---

### GET /api/admin/appointments

**Status:** ✅ 200 OK

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

### POST /api/admin/appointments

**Request Body:**
```json
{
  "patientId": 1,
  "doctorId": 1,
  "date": "2024-01-01",
  "time": "10:00"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields"
}
```

---

## Doctor APIs

### GET /api/doctor/patients

**Status:** ✅ 200 OK

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

### GET /api/doctor/appointments

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[]
```

---

### GET /api/doctor/pending-tasks

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[]
```

---

### GET /api/doctor/consultations

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[
  {
    "id": 33,
    "date": "2025-09-01T18:30:00.000Z",
    "status": "completed",
    "reason": "h",
    "notes": "{\"vitals\":{\"bp\":\"34\",\"temp\":\"23\",\"weight\":\"34\",\"pulse\":\"45\",\"respiration\":\"\",\"oxygen\":\"34\"},\"clinical\":\"h\"}",
    "diagnosis": "h",
    "patient": {
      "id": 19,
      "firstName": "KIRAN",
      "lastName": "BEHERA",
      "name": "KIRAN BEHERA",
      "age": 25,
      "phone": "1236547896",
      "email": null
    }
  },
  {
    "id": 34,
    "date": "2025-09-01T18:30:00.000Z",
    "status": "completed",
    "reason": "dead",
    "notes": "{\"vitals\":{\"bp\":\"34\",\"temp\":\"34\",\"weight\":\"34\",\"pulse\":\"34\",\"respiration\":\"34\",\"oxygen\":\"34\"},\"clinical\":\"dead\"}",
    "diagnosis": "dead",
    "patient": {
      "id": 17,
      "firstName": "KIRAN",
      "lastName": "BEHERA",
      "name": "KIRAN BEHERA",
      "age": 25,
      "phone": "1236547896",
      "email": null
    }
  }
]
```

---

### POST /api/doctor/consultations

**Request Body:**
```json
{
  "patientId": 1,
  "diagnosis": "Test diagnosis",
  "prescription": "Test prescription"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Patient, chief complaint, and diagnosis are required."
}
```

---

### GET /api/doctor/dashboard-stats

**Status:** ✅ 200 OK

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

### GET /api/doctor/recent-patients

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[
  {
    "id": 19,
    "firstName": "KIRAN",
    "lastName": "BEHERA",
    "age": 25,
    "lastVisit": "2025-09-01T18:30:00.000Z",
    "status": "completed"
  },
  {
    "id": 17,
    "firstName": "KIRAN",
    "lastName": "BEHERA",
    "age": 25,
    "lastVisit": "2025-09-01T18:30:00.000Z",
    "status": "completed"
  },
  {
    "id": 1,
    "firstName": "Amit",
    "lastName": "Sharma",
    "age": 37,
    "lastVisit": "2025-08-31T18:30:00.000Z",
    "status": "scheduled"
  },
  {
    "id": 2,
    "firstName": "Priya",
    "lastName": "Patel",
    "age": 30,
    "lastVisit": "2025-08-31T18:30:00.000Z",
    "status": ""
  }
]
```

---

## Admin APIs

### GET /api/admin/patients

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "patients": [
    {
      "id": 29,
      "patient_id": "P002",
      "name": "day2",
      "date_of_birth": "2025-09-02T18:30:00.000Z",
      "gender": "Female",
      "contact_number": "96396396",
      "email": null,
      "address": "ok",
      "blood_group": "AB-",
      "emergency_contact_name": "pl",
      "emergency_contact_number": "96396396",
      "emergency_contact_relation": null,
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": null,
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 1,
      "registration_date": "2025-09-01T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-09-02T09:46:35.000Z",
      "updated_at": "2025-09-02T09:46:35.000Z"
    },
    {
      "id": 28,
      "patient_id": "P001",
      "name": "lallu prasad panda",
      "date_of_birth": "2025-08-31T18:30:00.000Z",
      "gender": "Female",
      "contact_number": "96396396",
      "email": "lalluprasidpanda@gmail.com",
      "address": "GIETU GUNUPUR",
      "blood_group": "AB-",
      "emergency_contact_name": "ok",
      "emergency_contact_number": "96396396",
      "emergency_contact_relation": null,
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": null,
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 1,
      "registration_date": "2025-09-01T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-09-02T09:42:05.000Z",
      "updated_at": "2025-09-02T09:42:05.000Z"
    },
    {
      "id": 21,
      "patient_id": "PNaN",
      "name": "Rahul Kumar Behera",
      "date_of_birth": "2004-04-22T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "637109960",
      "email": "22cse019.kiranbehera@giet.edu",
      "address": "giet",
      "blood_group": null,
      "emergency_contact_name": "1236547896",
      "emergency_contact_number": "1236547896",
      "emergency_contact_relation": "1236547896",
      "city": "rayagada",
      "state": "odisha",
      "pincode": "765022",
      "marital_status": "Single",
      "occupation": "student ",
      "insurance_provider": "no",
      "insurance_policy_number": "21455",
      "insurance_expiry_date": null,
      "aadhar_number": "545677888",
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-09-01T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-09-02T07:41:53.000Z",
      "updated_at": "2025-09-02T08:21:25.000Z"
    },
    {
      "id": 20,
      "patient_id": "PAT996376",
      "name": "KIRAN BEHERA",
      "date_of_birth": "2008-01-09T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "1236547896",
      "email": "",
      "address": "No address provided",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "1236547896",
      "emergency_contact_relation": "Emergency",
      "city": "",
      "state": "",
      "pincode": "",
      "marital_status": "Divorced",
      "occupation": "",
      "insurance_provider": "",
      "insurance_policy_number": "",
      "insurance_expiry_date": null,
      "aadhar_number": "",
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:13:27.000Z",
      "updated_at": "2025-08-31T23:18:28.000Z"
    },
    {
      "id": 19,
      "patient_id": "PAT965925",
      "name": "KIRAN BEHERA",
      "date_of_birth": "2000-08-29T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "1236547896",
      "email": null,
      "address": "No address provided",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "1236547896",
      "emergency_contact_relation": "Emergency",
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": "Single",
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:12:57.000Z",
      "updated_at": "2025-09-02T07:44:22.000Z"
    },
    {
      "id": 18,
      "patient_id": "PAT935696",
      "name": "John Doe",
      "date_of_birth": "1990-08-29T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "+1234567890",
      "email": null,
      "address": "123 Main St, Anytown, USA",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "+0987654321",
      "emergency_contact_relation": "Emergency",
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": "Single",
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:12:27.000Z",
      "updated_at": "2025-08-31T00:32:20.000Z"
    },
    {
      "id": 17,
      "patient_id": "PAT708391",
      "name": "KIRAN BEHERA",
      "date_of_birth": "2000-08-29T18:30:00.000Z",
      "gender": "Female",
      "contact_number": "1236547896",
      "email": null,
      "address": "No address provided",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "1236547896",
      "emergency_contact_relation": "Emergency",
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": "Single",
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:08:39.000Z",
      "updated_at": "2025-09-02T07:44:41.000Z"
    },
    {
      "id": 16,
      "patient_id": "PAT628883",
      "name": "John Doe",
      "date_of_birth": "1990-08-29T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "+1234567890",
      "email": null,
      "address": "123 Main St, Anytown, USA",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "+0987654321",
      "emergency_contact_relation": "Emergency",
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": "Single",
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:07:20.000Z",
      "updated_at": "2025-09-02T07:42:36.000Z"
    },
    {
      "id": 15,
      "patient_id": "PAT571530",
      "name": "John Doe",
      "date_of_birth": "1990-08-29T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "+1234567890",
      "email": null,
      "address": "123 Main St, Anytown, USA",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "+0987654321",
      "emergency_contact_relation": "Emergency",
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": "Single",
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:06:22.000Z",
      "updated_at": "2025-09-02T08:20:27.000Z"
    },
    {
      "id": 14,
      "patient_id": "PAT428802",
      "name": "KIRAN BEHERA",
      "date_of_birth": "2000-08-29T18:30:00.000Z",
      "gender": "Male",
      "contact_number": "1236547896",
      "email": null,
      "address": "No address provided",
      "blood_group": null,
      "emergency_contact_name": "Emergency Contact",
      "emergency_contact_number": "1236547896",
      "emergency_contact_relation": "Emergency",
      "city": null,
      "state": null,
      "pincode": null,
      "marital_status": "Single",
      "occupation": null,
      "insurance_provider": null,
      "insurance_policy_number": null,
      "insurance_expiry_date": null,
      "aadhar_number": null,
      "profile_image": null,
      "medical_history": null,
      "allergies": null,
      "current_medications": null,
      "is_active": 0,
      "registration_date": "2025-08-30T18:30:00.000Z",
      "created_by": null,
      "created_at": "2025-08-31T00:04:00.000Z",
      "updated_at": "2025-09-02T08:31:24.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 19,
    "totalPages": 2
  }
}
```

---

### POST /api/admin/patients

**Request Body:**
```json
{
  "name": "Admin Patient",
  "age": 25,
  "phone": "9876543210"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields"
}
```

---

### GET /api/admin/appointments

**Status:** ✅ 200 OK

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

### POST /api/admin/appointments

**Request Body:**
```json
{
  "patientId": 1,
  "doctorId": 1,
  "date": "2024-01-01",
  "time": "10:00"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields"
}
```

---

### GET /api/admin/admins

**Status:** ❌ 401 Unauthorized

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Authentication token required"
}
```

---

### POST /api/admin/admins

**Request Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@test.com",
  "password": "admin123"
}
```

**Status:** ❌ 401 Unauthorized

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Authentication token required"
}
```

---

### GET /api/admin/dashboard-stats

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "totalPatients": 9,
  "totalAppointments": 0,
  "completedAppointments": 5,
  "admittedPatients": 1,
  "availableBeds": 49,
  "criticalAlerts": 0,
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

### GET /api/admin/appointment-stats

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "total": 35,
  "today": 0,
  "pending": 9,
  "completed": 5,
  "cancelled": 8,
  "byType": [
    {
      "appointment_type": "consultation",
      "count": 10
    },
    {
      "appointment_type": "emergency",
      "count": 6
    },
    {
      "appointment_type": "counseling",
      "count": 6
    },
    {
      "appointment_type": "routine-checkup",
      "count": 3
    },
    {
      "appointment_type": "follow-up",
      "count": 3
    },
    {
      "appointment_type": "procedure",
      "count": 3
    },
    {
      "appointment_type": "",
      "count": 2
    },
    {
      "appointment_type": "vaccination",
      "count": 2
    }
  ],
  "recent": [
    {
      "id": 15,
      "appointment_date": "2025-09-28T18:30:00.000Z",
      "appointment_time": "13:15:00",
      "status": "completed",
      "appointment_type": "routine-checkup",
      "patient_name": "KIRAN BEHERA",
      "patient_id": "PAT072661",
      "doctor_name": "Dr. Rajesh Kumar"
    },
    {
      "id": 30,
      "appointment_date": "2025-09-27T18:30:00.000Z",
      "appointment_time": "13:00:00",
      "status": "cancelled",
      "appointment_type": "counseling",
      "patient_name": "John Doe",
      "patient_id": "PAT791172",
      "doctor_name": "Dr. Rajesh Kumar"
    },
    {
      "id": 18,
      "appointment_date": "2025-09-25T18:30:00.000Z",
      "appointment_time": "10:15:00",
      "status": "cancelled",
      "appointment_type": "consultation",
      "patient_name": "John Doe",
      "patient_id": "PAT759126",
      "doctor_name": "Dr. Rajesh Kumar"
    },
    {
      "id": 6,
      "appointment_date": "2025-09-24T18:30:00.000Z",
      "appointment_time": "15:00:00",
      "status": "cancelled",
      "appointment_type": "",
      "patient_name": "John Doe",
      "patient_id": "PAT348989",
      "doctor_name": "Dr. Rajesh Kumar"
    },
    {
      "id": 14,
      "appointment_date": "2025-09-24T18:30:00.000Z",
      "appointment_time": "12:45:00",
      "status": "confirmed",
      "appointment_type": "counseling",
      "patient_name": "John Doe",
      "patient_id": "PAT759126",
      "doctor_name": "Dr. Rajesh Kumar"
    },
    {
      "id": 23,
      "appointment_date": "2025-09-24T18:30:00.000Z",
      "appointment_time": "12:15:00",
      "status": "no-show",
      "appointment_type": "routine-checkup",
      "patient_name": "Priya Patel",
      "patient_id": "PAT002",
      "doctor_name": "Dr. Rajesh Kumar"
    },
    {
      "id": 46,
      "appointment_date": "2025-09-24T18:30:00.000Z",
      "appointment_time": "07:18:00",
      "status": "scheduled",
      "appointment_type": "emergency",
      "patient_name": "KIRAN BEHERA",
      "patient_id": "PAT072661",
      "doctor_name": "Dr. Vikram Singh"
    },
    {
      "id": 13,
      "appointment_date": "2025-09-23T18:30:00.000Z",
      "appointment_time": "12:30:00",
      "status": "cancelled",
      "appointment_type": "emergency",
      "patient_name": "Priya Patel",
      "patient_id": "PAT002",
      "doctor_name": "Dr. Rajesh Kumar"
    },
    {
      "id": 25,
      "appointment_date": "2025-09-23T18:30:00.000Z",
      "appointment_time": "12:15:00",
      "status": "confirmed",
      "appointment_type": "procedure",
      "patient_name": "Jane Smith",
      "patient_id": "PAT398646",
      "doctor_name": "Dr. Rajesh Kumar"
    },
    {
      "id": 12,
      "appointment_date": "2025-09-22T18:30:00.000Z",
      "appointment_time": "13:00:00",
      "status": "confirmed",
      "appointment_type": "consultation",
      "patient_name": "John Doe",
      "patient_id": "PAT791172",
      "doctor_name": "Dr. Rajesh Kumar"
    }
  ]
}
```

---

### GET /api/admin/appointment-data

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "patients": [
    {
      "id": 1,
      "name": "Amit Sharma",
      "patient_id": "PAT001",
      "contact_number": "9876543211"
    },
    {
      "id": 29,
      "name": "day2",
      "patient_id": "P002",
      "contact_number": "96396396"
    },
    {
      "id": 8,
      "name": "John Doe",
      "patient_id": "PAT759126",
      "contact_number": "+1234567890"
    },
    {
      "id": 9,
      "name": "John Doe",
      "patient_id": "PAT791172",
      "contact_number": "+1234567890"
    },
    {
      "id": 10,
      "name": "John Doe",
      "patient_id": "PAT990296",
      "contact_number": "+1234567890"
    },
    {
      "id": 12,
      "name": "John Doe",
      "patient_id": "PAT348989",
      "contact_number": "+1234567890"
    },
    {
      "id": 11,
      "name": "KIRAN BEHERA",
      "patient_id": "PAT072661",
      "contact_number": "1236547896"
    },
    {
      "id": 28,
      "name": "lallu prasad panda",
      "patient_id": "P001",
      "contact_number": "96396396"
    },
    {
      "id": 2,
      "name": "Priya Patel",
      "patient_id": "PAT002",
      "contact_number": "9876543212"
    }
  ],
  "doctors": [
    {
      "id": 9,
      "name": "Dr. Rajesh Kumaar",
      "email": "rajeshkumar@gmail.com",
      "specialization": "General "
    },
    {
      "id": 7,
      "name": "Dr. Vikram Singh",
      "email": "vikram.singh@hospital.com",
      "specialization": "Neurologist"
    }
  ],
  "appointmentTypes": [
    "General Consultation",
    "Follow-up",
    "Emergency",
    "Surgery",
    "Lab Test",
    "X-Ray",
    "Specialist Consultation"
  ]
}
```

---

### GET /api/admin/doctor-schedules

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[
  {
    "id": 9,
    "name": "Dr. Rajesh Kumaar",
    "department": "General Medicine",
    "status": "full-time",
    "shifts": [
      {
        "dayOfWeek": "Monday",
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": "Tuesday",
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": "Wednesday",
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": "Thursday",
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": "Friday",
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ]
  },
  {
    "id": 7,
    "name": "Dr. Vikram Singh",
    "department": "General Medicine",
    "status": "full-time",
    "shifts": [
      {
        "dayOfWeek": "Monday",
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": "Tuesday",
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": "Wednesday",
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": "Thursday",
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": "Friday",
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ]
  }
]
```

---

### GET /api/admin/patients-list

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[
  {
    "id": 1,
    "name": "Amit Sharma",
    "patient_id": "PAT001",
    "contact_number": "9876543211",
    "date_of_birth": "1988-05-14T18:30:00.000Z",
    "gender": "Male",
    "is_active": 1
  },
  {
    "id": 29,
    "name": "day2",
    "patient_id": "P002",
    "contact_number": "96396396",
    "date_of_birth": "2025-09-02T18:30:00.000Z",
    "gender": "Female",
    "is_active": 1
  },
  {
    "id": 8,
    "name": "John Doe",
    "patient_id": "PAT759126",
    "contact_number": "+1234567890",
    "date_of_birth": "1990-08-29T18:30:00.000Z",
    "gender": "Male",
    "is_active": 1
  },
  {
    "id": 9,
    "name": "John Doe",
    "patient_id": "PAT791172",
    "contact_number": "+1234567890",
    "date_of_birth": "1990-08-29T18:30:00.000Z",
    "gender": "Male",
    "is_active": 1
  },
  {
    "id": 10,
    "name": "John Doe",
    "patient_id": "PAT990296",
    "contact_number": "+1234567890",
    "date_of_birth": "1990-08-29T18:30:00.000Z",
    "gender": "Male",
    "is_active": 1
  },
  {
    "id": 12,
    "name": "John Doe",
    "patient_id": "PAT348989",
    "contact_number": "+1234567890",
    "date_of_birth": "1990-08-29T18:30:00.000Z",
    "gender": "Male",
    "is_active": 1
  },
  {
    "id": 11,
    "name": "KIRAN BEHERA",
    "patient_id": "PAT072661",
    "contact_number": "1236547896",
    "date_of_birth": "2000-08-29T18:30:00.000Z",
    "gender": "Male",
    "is_active": 1
  },
  {
    "id": 28,
    "name": "lallu prasad panda",
    "patient_id": "P001",
    "contact_number": "96396396",
    "date_of_birth": "2025-08-31T18:30:00.000Z",
    "gender": "Female",
    "is_active": 1
  },
  {
    "id": 2,
    "name": "Priya Patel",
    "patient_id": "PAT002",
    "contact_number": "9876543212",
    "date_of_birth": "1995-08-21T18:30:00.000Z",
    "gender": "Female",
    "is_active": 1
  }
]
```

---

### GET /api/admin/admitted-patients

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[
  {
    "id": 1,
    "name": "KIRAN BEHERA",
    "age": 25,
    "condition": "bALO",
    "roomNumber": "103",
    "admissionDate": "2025-08-22T18:30:00.000Z",
    "status": "Active",
    "doctor": {
      "name": "Not Assigned"
    }
  }
]
```

---

### GET /api/admin/stock-alerts

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[]
```

---

### GET /api/admin/rooms

**Status:** ✅ 200 OK

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

### POST /api/admin/rooms

**Request Body:**
```json
{
  "roomNumber": "101",
  "type": "general",
  "status": "available"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Invalid action"
}
```

---

### GET /api/admin/room-assignments

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[
  {
    "id": 1,
    "room_id": 6,
    "patient_id": 14,
    "admission_date": "2025-08-22T18:30:00.000Z",
    "expected_discharge_date": "2025-08-30T18:30:00.000Z",
    "actual_discharge_date": null,
    "diagnosis": "bALO",
    "notes": null,
    "status": "Active",
    "room_number": "103",
    "room_type": "General",
    "floor": 1,
    "patient_name": "KIRAN BEHERA",
    "patient_code": "PAT428802",
    "contact_number": "1236547896",
    "gender": "Male"
  }
]
```

---

### POST /api/admin/room-assignments

**Request Body:**
```json
{
  "patientId": 1,
  "roomId": 1
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields"
}
```

---

### GET /api/admin/room-cleaning

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
[]
```

---

### POST /api/admin/room-cleaning

**Request Body:**
```json
{
  "roomId": 1,
  "status": "cleaning"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields"
}
```

---

### GET /api/admin/cleaning

**Status:** ❌ 500 Internal Server Error

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Internal server error"
}
```

---

### POST /api/admin/cleaning

**Request Body:**
```json
{
  "roomId": 1,
  "cleaningType": "deep",
  "assignedTo": "staff1"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Invalid action"
}
```

---

## Super Admin APIs

### GET /api/super-admin/dashboard-stats

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "stats": {
    "totalUsers": 9,
    "totalDoctors": 2,
    "totalAdmins": 5,
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
      "users": 7,
      "doctors": 3
    }
  ],
  "recentActivities": []
}
```

---

### GET /api/super-admin/analytics

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "period": 30,
  "type": "overview",
  "data": {
    "userGrowth": [
      {
        "date": "2025-08-12T18:30:00.000Z",
        "new_users": 1,
        "role": "super-admin"
      },
      {
        "date": "2025-08-25T18:30:00.000Z",
        "new_users": 2,
        "role": "admin"
      },
      {
        "date": "2025-08-31T18:30:00.000Z",
        "new_users": 1,
        "role": "admin"
      },
      {
        "date": "2025-08-31T18:30:00.000Z",
        "new_users": 1,
        "role": "staff"
      },
      {
        "date": "2025-09-01T18:30:00.000Z",
        "new_users": 2,
        "role": "doctor"
      },
      {
        "date": "2025-09-05T18:30:00.000Z",
        "new_users": 1,
        "role": "admin"
      },
      {
        "date": "2025-09-05T18:30:00.000Z",
        "new_users": 1,
        "role": "doctor"
      },
      {
        "date": "2025-09-05T18:30:00.000Z",
        "new_users": 1,
        "role": "receptionist"
      }
    ],
    "appointmentTrends": [
      {
        "date": "2025-08-30T18:30:00.000Z",
        "appointments": 1,
        "status": "scheduled"
      },
      {
        "date": "2025-08-30T18:30:00.000Z",
        "appointments": 2,
        "status": "confirmed"
      },
      {
        "date": "2025-08-30T18:30:00.000Z",
        "appointments": 1,
        "status": "completed"
      },
      {
        "date": "2025-08-31T18:30:00.000Z",
        "appointments": 1,
        "status": ""
      },
      {
        "date": "2025-08-31T18:30:00.000Z",
        "appointments": 2,
        "status": "scheduled"
      },
      {
        "date": "2025-08-31T18:30:00.000Z",
        "appointments": 2,
        "status": "cancelled"
      },
      {
        "date": "2025-09-01T18:30:00.000Z",
        "appointments": 2,
        "status": "completed"
      },
      {
        "date": "2025-09-03T18:30:00.000Z",
        "appointments": 1,
        "status": "scheduled"
      },
      {
        "date": "2025-09-03T18:30:00.000Z",
        "appointments": 1,
        "status": "cancelled"
      },
      {
        "date": "2025-09-04T18:30:00.000Z",
        "appointments": 1,
        "status": "scheduled"
      },
      {
        "date": "2025-09-04T18:30:00.000Z",
        "appointments": 1,
        "status": "completed"
      },
      {
        "date": "2025-09-04T18:30:00.000Z",
        "appointments": 1,
        "status": "cancelled"
      },
      {
        "date": "2025-09-08T18:30:00.000Z",
        "appointments": 1,
        "status": "scheduled"
      },
      {
        "date": "2025-09-09T18:30:00.000Z",
        "appointments": 1,
        "status": "scheduled"
      },
      {
        "date": "2025-09-09T18:30:00.000Z",
        "appointments": 1,
        "status": "in-progress"
      },
      {
        "date": "2025-09-13T18:30:00.000Z",
        "appointments": 1,
        "status": "scheduled"
      },
      {
        "date": "2025-09-15T18:30:00.000Z",
        "appointments": 1,
        "status": "confirmed"
      },
      {
        "date": "2025-09-17T18:30:00.000Z",
        "appointments": 1,
        "status": "rescheduled"
      },
      {
        "date": "2025-09-18T18:30:00.000Z",
        "appointments": 1,
        "status": "confirmed"
      },
      {
        "date": "2025-09-19T18:30:00.000Z",
        "appointments": 1,
        "status": "rescheduled"
      },
      {
        "date": "2025-09-22T18:30:00.000Z",
        "appointments": 1,
        "status": "confirmed"
      },
      {
        "date": "2025-09-22T18:30:00.000Z",
        "appointments": 1,
        "status": "in-progress"
      },
      {
        "date": "2025-09-23T18:30:00.000Z",
        "appointments": 1,
        "status": "confirmed"
      },
      {
        "date": "2025-09-23T18:30:00.000Z",
        "appointments": 1,
        "status": "cancelled"
      },
      {
        "date": "2025-09-24T18:30:00.000Z",
        "appointments": 1,
        "status": "scheduled"
      },
      {
        "date": "2025-09-24T18:30:00.000Z",
        "appointments": 1,
        "status": "confirmed"
      },
      {
        "date": "2025-09-24T18:30:00.000Z",
        "appointments": 1,
        "status": "cancelled"
      },
      {
        "date": "2025-09-24T18:30:00.000Z",
        "appointments": 1,
        "status": "no-show"
      },
      {
        "date": "2025-09-25T18:30:00.000Z",
        "appointments": 1,
        "status": "cancelled"
      },
      {
        "date": "2025-09-27T18:30:00.000Z",
        "appointments": 1,
        "status": "cancelled"
      },
      {
        "date": "2025-09-28T18:30:00.000Z",
        "appointments": 1,
        "status": "completed"
      }
    ],
    "patientTrends": [
      {
        "date": "2025-08-25T18:30:00.000Z",
        "new_patients": 2
      },
      {
        "date": "2025-08-30T18:30:00.000Z",
        "new_patients": 14
      },
      {
        "date": "2025-09-01T18:30:00.000Z",
        "new_patients": 3
      }
    ],
    "summary": {
      "total_active_users": 9,
      "total_doctors": 2,
      "total_admins": 5,
      "total_patients": 9,
      "upcoming_appointments": 19
    }
  },
  "generatedAt": "2025-09-06T14:56:05.231Z"
}
```

---

### GET /api/super-admin/admins

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "admins": [
    {
      "id": 11,
      "user_id": "ADMF8DYL4984YKI",
      "name": "Test User",
      "email": "test@test.com",
      "role": "admin",
      "contact_number": "0000000000",
      "department": null,
      "is_active": 1,
      "is_verified": 0,
      "last_login": null,
      "created_at": "2025-09-06T09:25:32.000Z",
      "updated_at": "2025-09-06T09:25:32.000Z"
    },
    {
      "id": 4,
      "user_id": "ADM001",
      "name": "assdf",
      "email": "sad@dmail.com",
      "role": "admin",
      "contact_number": "2134567856",
      "department": "asdf",
      "is_active": 1,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-08-31T23:38:16.000Z",
      "updated_at": "2025-08-31T23:38:16.000Z"
    },
    {
      "id": 3,
      "user_id": "DOC001",
      "name": "Dr. Rajesh Kumar",
      "email": "doctor@hospital.com",
      "role": "admin",
      "contact_number": "",
      "department": "General Medicine",
      "is_active": 1,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-08-25T23:53:39.000Z",
      "updated_at": "2025-08-31T23:50:30.000Z"
    },
    {
      "id": 2,
      "user_id": "PHMES2WXC00DYJA",
      "name": "Pharmacy User",
      "email": "p@gmail.com",
      "role": "admin",
      "contact_number": "",
      "department": "Pharmacy",
      "is_active": 1,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-08-25T23:31:57.000Z",
      "updated_at": "2025-08-31T23:50:15.000Z"
    },
    {
      "id": 1,
      "user_id": "USRME9VFX57",
      "name": "Super Administrator",
      "email": "admin@arogyahospital.com",
      "role": "super-admin",
      "contact_number": "+91-9999999999",
      "department": "Administration",
      "is_active": 1,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-08-13T11:12:49.000Z",
      "updated_at": "2025-09-02T05:31:28.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### POST /api/super-admin/admins

**Request Body:**
```json
{
  "name": "Super Admin",
  "email": "superadmin@test.com",
  "password": "super123"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields"
}
```

---

### GET /api/super-admin/doctors

**Status:** ✅ 200 OK

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

### POST /api/super-admin/doctors

**Request Body:**
```json
{
  "name": "Dr. Test",
  "email": "doctor@test.com",
  "specialization": "General"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Missing required fields: name, email, password, contact_number, specialization, license_number"
}
```

---

### GET /api/super-admin/doctors/1

**Status:** ❌ 404 Not Found

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Doctor not found"
}
```

---

### PUT /api/super-admin/doctors/1

**Request Body:**
```json
{
  "name": "Dr. Updated"
}
```

**Status:** ❌ 500 Internal Server Error

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Failed to update doctor"
}
```

---

### GET /api/super-admin/doctors/stats

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "totalDoctors": 3,
  "activeDoctors": 2,
  "inactiveDoctors": 1,
  "specializationsCount": 3,
  "departmentsCount": 3,
  "recentDoctors": 3,
  "specializationBreakdown": [
    {
      "specialization": "Neurologist",
      "count": 1
    },
    {
      "specialization": "General ",
      "count": 1
    },
    {
      "specialization": "Pediatrician",
      "count": 1
    }
  ]
}
```

---

### GET /api/super-admin/users

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 11,
      "user_id": "ADMF8DYL4984YKI",
      "name": "Test User",
      "email": "test@test.com",
      "role": "admin",
      "contact_number": "0000000000",
      "department": null,
      "specialization": null,
      "is_active": 1,
      "is_verified": 0,
      "last_login": null,
      "created_at": "2025-09-06T09:25:32.000Z",
      "updated_at": "2025-09-06T09:25:32.000Z"
    },
    {
      "id": 10,
      "user_id": "REC001",
      "name": "sahil",
      "email": "sahil@gmail.com",
      "role": "receptionist",
      "contact_number": "+919638527410",
      "department": null,
      "specialization": null,
      "is_active": 1,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-09-06T01:23:46.000Z",
      "updated_at": "2025-09-06T01:23:46.000Z"
    },
    {
      "id": 9,
      "user_id": "DOC004",
      "name": "Dr. Rajesh Kumaar",
      "email": "rajeshkumar@gmail.com",
      "role": "doctor",
      "contact_number": "+919876543210",
      "department": "Pharmasy",
      "specialization": "General ",
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
      "role": "doctor",
      "contact_number": "+91 87654 32109",
      "department": "Neurology",
      "specialization": "Neurologist",
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
      "role": "doctor",
      "contact_number": "+91 76543 21098",
      "department": "Pediatrics",
      "specialization": "Pediatrician",
      "is_active": 0,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-09-01T22:36:51.000Z",
      "updated_at": "2025-09-01T22:36:51.000Z"
    },
    {
      "id": 5,
      "user_id": "STF001",
      "name": "akash",
      "email": "as@gmail.com",
      "role": "staff",
      "contact_number": "2345654324",
      "department": "asdf",
      "specialization": null,
      "is_active": 1,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-09-01T00:02:17.000Z",
      "updated_at": "2025-09-01T00:02:43.000Z"
    },
    {
      "id": 4,
      "user_id": "ADM001",
      "name": "assdf",
      "email": "sad@dmail.com",
      "role": "admin",
      "contact_number": "2134567856",
      "department": "asdf",
      "specialization": null,
      "is_active": 1,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-08-31T23:38:16.000Z",
      "updated_at": "2025-08-31T23:38:16.000Z"
    },
    {
      "id": 3,
      "user_id": "DOC001",
      "name": "Dr. Rajesh Kumar",
      "email": "doctor@hospital.com",
      "role": "admin",
      "contact_number": "",
      "department": "General Medicine",
      "specialization": "General Physician",
      "is_active": 1,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-08-25T23:53:39.000Z",
      "updated_at": "2025-08-31T23:50:30.000Z"
    },
    {
      "id": 2,
      "user_id": "PHMES2WXC00DYJA",
      "name": "Pharmacy User",
      "email": "p@gmail.com",
      "role": "admin",
      "contact_number": "",
      "department": "Pharmacy",
      "specialization": null,
      "is_active": 1,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-08-25T23:31:57.000Z",
      "updated_at": "2025-08-31T23:50:15.000Z"
    },
    {
      "id": 1,
      "user_id": "USRME9VFX57",
      "name": "Super Administrator",
      "email": "admin@arogyahospital.com",
      "role": "super-admin",
      "contact_number": "+91-9999999999",
      "department": "Administration",
      "specialization": null,
      "is_active": 1,
      "is_verified": 1,
      "last_login": null,
      "created_at": "2025-08-13T11:12:49.000Z",
      "updated_at": "2025-09-02T05:31:28.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "totalPages": 1
  }
}
```

---

### POST /api/super-admin/users

**Request Body:**
```json
{
  "name": "New User",
  "email": "user@test.com",
  "role": "staff"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields"
}
```

---

### GET /api/super-admin/users/1

**Status:** ❌ 405 Method Not Allowed

**Response:**
```json
""
```

---

### PUT /api/super-admin/users/1

**Request Body:**
```json
{
  "name": "Updated User"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields: id, email, and role are required"
}
```

---

### GET /api/super-admin/staff

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "staff": [
    {
      "id": 10,
      "user_id": "REC001",
      "name": "sahil",
      "email": "sahil@gmail.com",
      "role": "receptionist",
      "contact_number": "+919638527410",
      "department": null,
      "is_active": 1,
      "is_verified": 1,
      "joining_date": "2025-09-05T18:30:00.000Z",
      "last_login": null,
      "created_at": "2025-09-06T01:23:46.000Z",
      "updated_at": "2025-09-06T01:23:46.000Z"
    },
    {
      "id": 5,
      "user_id": "STF001",
      "name": "akash",
      "email": "as@gmail.com",
      "role": "staff",
      "contact_number": "2345654324",
      "department": "asdf",
      "is_active": 1,
      "is_verified": 1,
      "joining_date": "2025-08-31T18:30:00.000Z",
      "last_login": null,
      "created_at": "2025-09-01T00:02:17.000Z",
      "updated_at": "2025-09-01T00:02:43.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### POST /api/super-admin/staff

**Request Body:**
```json
{
  "name": "Staff Member",
  "email": "staff@test.com",
  "department": "nursing"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields"
}
```

---

### GET /api/super-admin/staff/1

**Status:** ❌ 404 Not Found

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Staff member not found"
}
```

---

### PUT /api/super-admin/staff/1

**Request Body:**
```json
{
  "name": "Updated Staff"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields"
}
```

---

## Pharmacy APIs

### GET /api/pharmacy/medicines

**Status:** ✅ 200 OK

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
    }
  ]
}
```

---

### POST /api/pharmacy/medicines

**Request Body:**
```json
{
  "name": "Paracetamol",
  "category": "painkiller",
  "price": 10,
  "stock": 100
}
```

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": {
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
    "updated_at": "2025-09-06T09:26:25.000Z"
  }
}
```

---

### GET /api/pharmacy/medicines/1

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": {
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
    "updated_at": "2025-08-13T05:42:44.000Z"
  }
}
```

---

### PUT /api/pharmacy/medicines/1

**Request Body:**
```json
{
  "stock": 150
}
```

**Status:** ❌ 500 Internal Server Error

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Failed to update medicine"
}
```

---

### GET /api/pharmacy/vendors

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "vendor_id": "VENMF1859A3XPVCL",
      "vendor_name": "asdf",
      "contact_person": "asdf",
      "email": "q@gmail.com",
      "phone": "9283767892",
      "address": "sanbdkbjiew",
      "city": "hvgh",
      "state": null,
      "pincode": "123432",
      "gst_number": "dszg",
      "pan_number": null,
      "vendor_type": "equipment",
      "payment_terms": null,
      "credit_limit": "0.00",
      "is_active": 1,
      "rating": "0.0",
      "notes": null,
      "created_at": "2025-09-01T09:08:21.000Z",
      "updated_at": "2025-09-01T09:15:53.000Z"
    }
  ]
}
```

---

### POST /api/pharmacy/vendors

**Request Body:**
```json
{
  "name": "Vendor 1",
  "contact": "1234567890",
  "email": "vendor@test.com"
}
```

**Status:** ❌ 500 Internal Server Error

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Failed to create vendor"
}
```

---

### GET /api/pharmacy/vendors/1

**Status:** ❌ 405 Method Not Allowed

**Response:**
```json
""
```

---

### PUT /api/pharmacy/vendors/1

**Request Body:**
```json
{
  "name": "Updated Vendor"
}
```

**Status:** ❌ 500 Internal Server Error

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Failed to update vendor"
}
```

---

### GET /api/pharmacy/prescriptions

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "prescription_id": "RX-1756766021775",
      "patient_id": 17,
      "doctor_id": 1,
      "appointment_id": null,
      "medical_record_id": null,
      "prescription_date": "2025-08-31T18:30:00.000Z",
      "total_amount": "0.00",
      "status": "active",
      "notes": null,
      "follow_up_date": null,
      "created_at": "2025-09-01T17:03:50.000Z",
      "updated_at": "2025-09-01T17:03:50.000Z",
      "final_diagnosis": "dead",
      "patient_name": "KIRAN BEHERA",
      "doctor_name": "Super Administrator",
      "item_count": 1,
      "calculated_total": "0.00"
    },
    {
      "id": 3,
      "prescription_id": "RX-1756765094256",
      "patient_id": 19,
      "doctor_id": 1,
      "appointment_id": null,
      "medical_record_id": null,
      "prescription_date": "2025-08-31T18:30:00.000Z",
      "total_amount": "0.00",
      "status": "active",
      "notes": null,
      "follow_up_date": null,
      "created_at": "2025-09-01T16:48:22.000Z",
      "updated_at": "2025-09-01T16:48:22.000Z",
      "final_diagnosis": "h",
      "patient_name": "KIRAN BEHERA",
      "doctor_name": "Super Administrator",
      "item_count": 1,
      "calculated_total": "0.00"
    },
    {
      "id": 1,
      "prescription_id": "RX1756186085548",
      "patient_id": 1,
      "doctor_id": 3,
      "appointment_id": null,
      "medical_record_id": null,
      "prescription_date": "2025-08-25T18:30:00.000Z",
      "total_amount": "150.00",
      "status": "active",
      "notes": "Patient advised rest and plenty of fluids. Follow up if symptoms persist.",
      "follow_up_date": "2025-09-01T18:30:00.000Z",
      "created_at": "2025-08-25T23:58:12.000Z",
      "updated_at": "2025-08-25T23:58:12.000Z",
      "final_diagnosis": null,
      "patient_name": "Amit Sharma",
      "doctor_name": "Dr. Rajesh Kumar",
      "item_count": 2,
      "calculated_total": "125.00"
    }
  ]
}
```

---

### POST /api/pharmacy/prescriptions

**Request Body:**
```json
{
  "patientId": 1,
  "doctorId": 1,
  "medicines": [
    {
      "medicineId": 1,
      "quantity": 2
    }
  ]
}
```

**Status:** ❌ 500 Internal Server Error

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Failed to create prescription"
}
```

---

### GET /api/pharmacy/prescriptions/1

**Status:** ❌ 500 Internal Server Error

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Failed to fetch prescription details"
}
```

---

### POST /api/pharmacy/prescriptions/1/dispense

**Request Body:**
```json
{
  "dispensedBy": "pharmacist1"
}
```

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "prescription_id": "RX1756186085548",
    "patient_id": 1,
    "doctor_id": 3,
    "appointment_id": null,
    "medical_record_id": null,
    "prescription_date": "2025-08-25T18:30:00.000Z",
    "total_amount": "150.00",
    "status": "completed",
    "notes": "Patient advised rest and plenty of fluids. Follow up if symptoms persist.",
    "follow_up_date": "2025-09-01T18:30:00.000Z",
    "created_at": "2025-08-25T23:58:12.000Z",
    "updated_at": "2025-09-06T09:26:32.000Z",
    "final_diagnosis": null,
    "patient_name": "Amit Sharma",
    "doctor_name": "Dr. Rajesh Kumar",
    "items": [
      {
        "id": 1,
        "prescription_id": 1,
        "medicine_id": 1,
        "medicine_name": "Paracetamol",
        "generic_name": "Acetaminophen",
        "strength": "500mg",
        "dosage_form": "tablet",
        "quantity": 10,
        "dosage": "1 tablet",
        "frequency": "Twice daily",
        "duration": "5 days",
        "instructions": "Take after meals with water",
        "unit_price": "2.50",
        "total_price": "25.00",
        "is_dispensed": 0,
        "dispensed_quantity": 0,
        "dispensed_by": null,
        "dispensed_at": null,
        "batch_number": null,
        "expiry_date": null,
        "notes": null,
        "created_at": "2025-08-25T23:58:12.000Z",
        "updated_at": "2025-08-25T23:58:12.000Z",
        "current_unit_price": "2.50"
      },
      {
        "id": 2,
        "prescription_id": 1,
        "medicine_id": 2,
        "medicine_name": "Amoxicillin",
        "generic_name": "Amoxicillin",
        "strength": "250mg",
        "dosage_form": "capsule",
        "quantity": 20,
        "dosage": "2 tablets",
        "frequency": "Three times daily",
        "duration": "7 days",
        "instructions": "Take before meals",
        "unit_price": "5.00",
        "total_price": "100.00",
        "is_dispensed": 0,
        "dispensed_quantity": 0,
        "dispensed_by": null,
        "dispensed_at": null,
        "batch_number": null,
        "expiry_date": null,
        "notes": null,
        "created_at": "2025-08-25T23:58:12.000Z",
        "updated_at": "2025-08-25T23:58:12.000Z",
        "current_unit_price": "5.00"
      }
    ]
  }
}
```

---

### GET /api/pharmacy/stock

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_medicines": 4,
      "low_stock_count": "1",
      "expired_count": "0",
      "expiring_soon_count": "0",
      "total_stock_value": "5080.00"
    },
    "stock_alerts": [
      {
        "id": 5,
        "medicine_id": "MEDMF8DZPQ1VY0GU",
        "name": "Paracetamol",
        "generic_name": null,
        "category": "painkiller",
        "current_stock": 0,
        "minimum_stock": 10,
        "maximum_stock": 1000,
        "unit_price": "0.00",
        "mrp": "0.00",
        "expiry_date": null,
        "batch_number": null,
        "supplier": null,
        "stock_status": "low",
        "expiry_status": "good",
        "stock_value": "0.00",
        "days_to_expiry": null
      },
      {
        "id": 3,
        "medicine_id": "",
        "name": "asdf",
        "generic_name": "sdfv",
        "category": "Antihistamine",
        "current_stock": 16,
        "minimum_stock": 10,
        "maximum_stock": 1000,
        "unit_price": "5.00",
        "mrp": "0.00",
        "expiry_date": null,
        "batch_number": null,
        "supplier": null,
        "stock_status": "good",
        "expiry_status": "good",
        "stock_value": "80.00",
        "days_to_expiry": null
      },
      {
        "id": 2,
        "medicine_id": "MED002",
        "name": "Amoxicillin",
        "generic_name": "Amoxicillin",
        "category": "Antibiotic",
        "current_stock": 500,
        "minimum_stock": 10,
        "maximum_stock": 1000,
        "unit_price": "5.00",
        "mrp": "6.00",
        "expiry_date": null,
        "batch_number": null,
        "supplier": null,
        "stock_status": "good",
        "expiry_status": "good",
        "stock_value": "2500.00",
        "days_to_expiry": null
      },
      {
        "id": 1,
        "medicine_id": "MED001",
        "name": "Paracetamol",
        "generic_name": "Acetaminophen",
        "category": "Analgesic",
        "current_stock": 1000,
        "minimum_stock": 10,
        "maximum_stock": 1000,
        "unit_price": "2.50",
        "mrp": "3.00",
        "expiry_date": null,
        "batch_number": null,
        "supplier": null,
        "stock_status": "good",
        "expiry_status": "good",
        "stock_value": "2500.00",
        "days_to_expiry": null
      }
    ],
    "recent_transactions": [
      {
        "id": 1,
        "transaction_id": "TXN001",
        "medicine_id": "MED001",
        "transaction_type": "IN",
        "quantity": 100,
        "unit_price": "25.50",
        "total_amount": "2550.00",
        "batch_number": "BATCH001",
        "expiry_date": "2025-12-30T18:30:00.000Z",
        "supplier": "MediCorp Pharmaceuticals",
        "reference_number": null,
        "notes": null,
        "created_by": 2,
        "created_at": "2025-08-25T23:44:53.000Z",
        "updated_at": "2025-08-25T23:44:53.000Z",
        "medicine_name": "Paracetamol",
        "created_by_name": "Pharmacy User"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 4,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### POST /api/pharmacy/stock

**Request Body:**
```json
{
  "medicineId": 1,
  "quantity": 50,
  "type": "in",
  "reason": "purchase"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "medicine_id is required"
}
```

---

### GET /api/pharmacy/stock/transactions

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": []
}
```

---

### GET /api/pharmacy/search?q=paracetamol

**Status:** ✅ 200 OK

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

### GET /api/pharmacy/alerts

**Status:** ✅ 200 OK

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
    }
  ]
}
```

---

### GET /api/pharmacy/dashboard

**Status:** ✅ 200 OK

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

### GET /api/pharmacy/reports

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {},
    "topMedicines": [],
    "salesTrend": []
  }
}
```

---

### POST /api/pharmacy/billing/create

**Request Body:**
```json
{
  "patientId": 1,
  "items": [
    {
      "medicineId": 1,
      "quantity": 2,
      "price": 20
    }
  ]
}
```

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Invalid billing data"
}
```

---

### GET /api/pharmacy/billing/search-patients?q=john

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "patient_id": "PAT759126",
      "name": "John Doe",
      "contact_number": "+1234567890",
      "email": null,
      "address": "123 Main St, Anytown, USA"
    },
    {
      "id": 9,
      "patient_id": "PAT791172",
      "name": "John Doe",
      "contact_number": "+1234567890",
      "email": null,
      "address": "123 Main St, Anytown, USA"
    },
    {
      "id": 10,
      "patient_id": "PAT990296",
      "name": "John Doe",
      "contact_number": "+1234567890",
      "email": null,
      "address": "123 Main St, Anytown, USA"
    },
    {
      "id": 12,
      "patient_id": "PAT348989",
      "name": "John Doe",
      "contact_number": "+1234567890",
      "email": null,
      "address": "123 Main St, Anytown, USA"
    }
  ]
}
```

---

### GET /api/pharmacy/billing/prescriptions/1

**Status:** ✅ 200 OK

**Content-Type:** application/json

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "prescription_id": "RX1756186085548",
      "patient_id": 1,
      "doctor_id": 3,
      "appointment_id": null,
      "medical_record_id": null,
      "prescription_date": "2025-08-25T18:30:00.000Z",
      "total_amount": "150.00",
      "status": "completed",
      "notes": "Patient advised rest and plenty of fluids. Follow up if symptoms persist.",
      "follow_up_date": "2025-09-01T18:30:00.000Z",
      "created_at": "2025-08-25T23:58:12.000Z",
      "updated_at": "2025-09-06T09:26:32.000Z",
      "final_diagnosis": null,
      "doctor_name": "Dr. Rajesh Kumar",
      "items": [
        {
          "id": 1,
          "prescription_id": 1,
          "medicine_id": 1,
          "medicine_name": "Paracetamol",
          "generic_name": "Acetaminophen",
          "strength": "500mg",
          "dosage_form": "tablet",
          "quantity": 10,
          "dosage": "1 tablet",
          "frequency": "Twice daily",
          "duration": "5 days",
          "instructions": "Take after meals with water",
          "unit_price": null,
          "total_price": "25.00",
          "is_dispensed": 0,
          "dispensed_quantity": 0,
          "dispensed_by": null,
          "dispensed_at": null,
          "batch_number": null,
          "expiry_date": null,
          "notes": null,
          "created_at": "2025-08-25T23:58:12.000Z",
          "updated_at": "2025-08-25T23:58:12.000Z",
          "current_stock": null
        },
        {
          "id": 2,
          "prescription_id": 1,
          "medicine_id": 2,
          "medicine_name": "Amoxicillin",
          "generic_name": "Amoxicillin",
          "strength": "250mg",
          "dosage_form": "capsule",
          "quantity": 20,
          "dosage": "2 tablets",
          "frequency": "Three times daily",
          "duration": "7 days",
          "instructions": "Take before meals",
          "unit_price": null,
          "total_price": "100.00",
          "is_dispensed": 0,
          "dispensed_quantity": 0,
          "dispensed_by": null,
          "dispensed_at": null,
          "batch_number": null,
          "expiry_date": null,
          "notes": null,
          "created_at": "2025-08-25T23:58:12.000Z",
          "updated_at": "2025-08-25T23:58:12.000Z",
          "current_stock": null
        }
      ]
    }
  ]
}
```

---

## Staff APIs

### GET /api/super-admin/staff/1

**Status:** ❌ 404 Not Found

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Staff member not found"
}
```

---

### PUT /api/super-admin/staff/1

**Request Body:**
```json
{
  "name": "Updated Staff"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "error": "Missing required fields"
}
```

---

### GET /api/staff/profiles

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Invalid query parameters"
}
```

---

### POST /api/staff/create

**Request Body:**
```json
{
  "name": "Staff Member",
  "email": "staff@test.com",
  "department": "nursing",
  "role": "nurse"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Missing required fields: name, email, password, contactNumber, role, department"
}
```

---

### GET /api/staff/shifts

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Invalid query parameters"
}
```

---

### POST /api/staff/shifts

**Request Body:**
```json
{
  "staffId": 1,
  "date": "2024-01-01",
  "startTime": "08:00",
  "endTime": "16:00"
}
```

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "Invalid action specified"
}
```

---

## File Upload APIs

### GET /api/upload

**Status:** ❌ 400 Bad Request

**Content-Type:** application/json

**Response:**
```json
{
  "success": false,
  "error": "File key is required"
}
```

---

### GET /api/test-r2

**Status:** ✅ 200 OK

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

## Summary

- **Total Endpoints:** 87
- **Successful:** 47
- **Failed:** 40
- **Success Rate:** 54.0%

