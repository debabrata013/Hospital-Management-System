# 🏥 Hospital Management System - Backend Server

## 📋 Overview

This is a comprehensive Express.js backend server for the Hospital Management System. It provides RESTful API endpoints for managing patients, appointments, prescriptions, billing, and more.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Patient Management**: Complete CRUD operations for patient records
- **Appointment System**: Schedule and manage appointments
- **Prescription Management**: Digital prescriptions with compliance tracking
- **Billing System**: Comprehensive billing and payment tracking
- **File Upload**: Secure file upload with validation
- **Audit Logging**: Complete audit trail for all operations
- **Security**: Rate limiting, CORS, helmet, and input validation
- **Dashboard Statistics**: Real-time analytics and reporting

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/hospital-management
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   
   # Email Configuration (for notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@hospital.com
   
   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=uploads/
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Security
   BCRYPT_ROUNDS=12
   SESSION_SECRET=your-session-secret-key
   ```

3. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User Management
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Patient Management
- `POST /api/patients` - Create new patient
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID

### Appointment Management
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get appointments
- `PUT /api/appointments/:id` - Update appointment

### Prescription Management
- `POST /api/prescriptions` - Create prescription (Doctor only)
- `GET /api/prescriptions` - Get prescriptions

### Billing Management
- `POST /api/billing` - Create billing record
- `GET /api/billing` - Get billing records

### File Upload
- `POST /api/upload` - Upload files

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Audit Logs
- `GET /api/audit-logs` - Get audit logs (Admin only)

### Health Check
- `GET /health` - Server health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- `super-admin` - Full system access
- `admin` - Administrative access
- `doctor` - Doctor-specific access
- `nurse` - Nurse-specific access
- `billing` - Billing-specific access

## 📊 Database Models

The backend integrates with the existing MongoDB models:

- **User** - System users and staff
- **Patient** - Patient information and medical history
- **Appointment** - Appointment scheduling and management
- **Prescription** - Medication prescriptions
- **TestReport** - Laboratory and diagnostic reports
- **Billing** - Financial records and payments
- **MedicalRecord** - Comprehensive medical records
- **AuditLog** - System audit trail

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: File type and size restrictions
- **Audit Logging**: Complete operation tracking
- **Role-based Access**: Granular permission control

## 📁 File Structure

```
server.js                 # Main server file
backend-package.json      # Backend dependencies
models/                   # MongoDB models
├── User.js
├── Patient.js
├── Appointment.js
├── Prescription.js
├── TestReport.js
├── Billing.js
├── MedicalRecord.js
└── AuditLog.js
uploads/                  # File upload directory
logs/                     # Application logs
```

## 🔧 Configuration

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
npm test
```

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs
The server logs all operations to the console and can be configured to write to files.

## 🚨 Error Handling

The server includes comprehensive error handling:
- Input validation errors
- Database connection errors
- Authentication errors
- File upload errors
- Rate limiting errors

## 🔄 Integration with Frontend

This backend server can work alongside your existing Next.js API routes or replace them entirely. Update your frontend API calls to point to this server:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 📝 API Documentation

### Example API Calls

#### Login
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'doctor@hospital.com',
    password: 'password123'
  })
});
```

#### Create Appointment
```javascript
const response = await fetch('http://localhost:5000/api/appointments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    patientId: 'patient-id',
    doctorId: 'doctor-id',
    appointmentDate: '2024-01-15T10:00:00Z',
    type: 'consultation',
    notes: 'Regular checkup'
  })
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the existing documentation
- Review the API endpoints
- Check the server logs for errors
- Ensure all environment variables are set correctly
