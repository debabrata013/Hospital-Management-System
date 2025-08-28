# Staff & Duty Management System API Documentation

## Overview
Complete REST API implementation for the Hospital Management System's Staff & Duty Management module. Features comprehensive staff profiles, shift management, doctor scheduling, leave tracking system, attendance monitoring, and performance analytics.

## API Endpoints

### 👥 Staff Profile Management
- **GET** `/api/staff/profiles` - Get staff profiles with filtering and pagination
- **POST** `/api/staff/profiles` - Create new staff profile
- **PUT** `/api/staff/profiles` - Update staff profile information

### ⏰ Shift Management
- **GET** `/api/staff/shifts` - Get shifts with filtering and pagination
- **POST** `/api/staff/shifts` - Create shift, check-in, check-out, add breaks
- **PUT** `/api/staff/shifts` - Update shift information

### 🏥 Leave Management
- **GET** `/api/staff/leaves` - Get leave requests with filtering
- **POST** `/api/staff/leaves` - Create, approve, reject, extend leave requests
- **PUT** `/api/staff/leaves` - Update leave request information
- **DELETE** `/api/staff/leaves` - Cancel leave request

### 📊 Dashboard & Analytics
- **GET** `/api/staff/dashboard` - Get comprehensive staff analytics and dashboard data

## Key Features

### 🔐 Role-Based Access Control
- **Super Admin**: Full access to all staff operations across all departments
- **Admin**: Complete staff management within assigned scope
- **HR Manager**: Staff profiles, leave management, performance tracking
- **Department Head**: Department staff management and scheduling
- **Staff Members**: Own profile, shifts, and leave requests

### 👤 Comprehensive Staff Profiles
- **Personal Information**: Demographics, contact details, emergency contacts
- **Professional Details**: Qualifications, experience, certifications, skills
- **Employment Information**: Job history, current assignment, benefits
- **Performance Tracking**: Reviews, goals, disciplinary actions
- **Health & Medical**: Medical conditions, fitness for duty, vaccinations

### ⏱️ Advanced Shift Management
- **Flexible Scheduling**: Morning, Evening, Night, Full Day, Emergency, On-Call shifts
- **Attendance Tracking**: Check-in/out with location and method verification
- **Break Management**: Detailed break tracking with duration and reasons
- **Shift Handovers**: Critical patient information and task transfers
- **Performance Metrics**: Task completion, punctuality, productivity tracking

### 🩺 Doctor Scheduling
- **Consultation Slots**: Time-based appointment scheduling
- **Patient Capacity**: Maximum patients per day configuration
- **Emergency Availability**: On-call and emergency shift management
- **Fee Management**: Consultation fee tracking and billing integration

### 📅 Comprehensive Leave System
- **Multiple Leave Types**: Annual, Sick, Maternity, Paternity, Emergency, Study, etc.
- **Approval Workflow**: Multi-level approval based on leave type and duration
- **Coverage Management**: Staff replacement and handover coordination
- **Leave Balance**: Automatic calculation and tracking
- **Extensions**: Leave extension requests and approvals

### 📈 Performance & Analytics
- **Attendance Analytics**: Punctuality, absenteeism, overtime tracking
- **Performance Reviews**: Regular assessments with goal setting
- **Training Management**: Skill development and certification tracking
- **Disciplinary Actions**: Warning system and corrective measures

## Authentication & Authorization

### Required Authentication
All endpoints require valid session authentication via NextAuth.js.

### Permission Matrix
| Role | Profiles | Shifts | Leaves | Dashboard |
|------|----------|--------|--------|-----------|
| Super Admin | Full | Full | Full | Full |
| Admin | Department | Department | Department | Department |
| HR Manager | Full | View | Full | HR Analytics |
| Department Head | Department | Department | Department | Department |
| Staff | Own | Own | Own | Own |

## Request/Response Format

### Standard Response Structure
```json
{
  "success": boolean,
  "data": object | array,
  "message": string,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

### Error Response Structure
```json
{
  "success": false,
  "error": string,
  "details": array // Validation errors
}
```

## Usage Examples

### Create Staff Profile
```javascript
POST /api/staff/profiles
{
  "userId": "64f7b1234567890abcdef123",
  "personalInfo": {
    "dateOfBirth": "1990-05-15T00:00:00.000Z",
    "gender": "Male",
    "maritalStatus": "Married",
    "bloodGroup": "O+",
    "languages": [
      {
        "language": "English",
        "proficiency": "Advanced"
      },
      {
        "language": "Hindi",
        "proficiency": "Native"
      }
    ]
  },
  "qualifications": [
    {
      "degree": "MBBS",
      "institution": "AIIMS Delhi",
      "yearOfPassing": 2015,
      "percentage": 85.5
    }
  ],
  "currentAssignment": {
    "department": "Cardiology",
    "shift": "Morning",
    "supervisor": "64f7b1234567890abcdef456"
  }
}
```

### Create Shift Schedule
```javascript
POST /api/staff/shifts
{
  "action": "create",
  "staffId": "64f7b1234567890abcdef123",
  "shiftDate": "2025-08-15T00:00:00.000Z",
  "shiftType": "Morning",
  "startTime": "08:00",
  "endTime": "16:00",
  "breakTime": {
    "start": "12:00",
    "end": "13:00",
    "duration": 60
  },
  "department": "Cardiology",
  "ward": "CCU",
  "responsibilities": [
    {
      "task": "Patient rounds",
      "priority": "High"
    },
    {
      "task": "Update medical records",
      "priority": "Medium"
    }
  ],
  "doctorSchedule": {
    "maxPatients": 25,
    "consultationFee": 500,
    "emergencyAvailable": true
  }
}
```

### Check-In to Shift
```javascript
POST /api/staff/shifts
{
  "action": "check_in",
  "shiftId": "64f7b1234567890abcdef789",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "method": "Mobile App"
}
```

### Create Leave Request
```javascript
POST /api/staff/leaves
{
  "staffId": "64f7b1234567890abcdef123",
  "leaveType": "Annual Leave",
  "startDate": "2025-08-20T00:00:00.000Z",
  "endDate": "2025-08-25T00:00:00.000Z",
  "reason": "Family vacation",
  "urgency": "Low",
  "coverage": {
    "isRequired": true,
    "handoverNotes": "Patient care instructions attached",
    "criticalTasks": [
      "Monitor ICU patient in room 205",
      "Complete discharge summary for patient in room 301"
    ]
  }
}
```

### Approve Leave Request
```javascript
POST /api/staff/leaves
{
  "action": "approve",
  "leaveRequestId": "64f7b1234567890abcdef999",
  "approverId": "64f7b1234567890abcdef456",
  "comments": "Approved with coverage arranged",
  "conditions": "Ensure all critical patients are properly handed over"
}
```

### Get Dashboard Analytics
```javascript
GET /api/staff/dashboard?type=all&department=Cardiology&dateRange=30
```

## Advanced Features

### Shift Management
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Overtime Calculation**: Automatic overtime hours calculation
- **Shift Swapping**: Staff can request shift exchanges
- **Emergency Scheduling**: Quick assignment for emergency situations

### Leave Management
- **Smart Approval**: Automatic routing based on leave type and duration
- **Coverage Coordination**: Automatic notification to potential covering staff
- **Leave Balance**: Real-time balance calculation and tracking
- **Holiday Integration**: Automatic exclusion of holidays from leave calculations

### Performance Tracking
- **360-Degree Reviews**: Multi-source feedback collection
- **Goal Setting**: SMART goals with progress tracking
- **Skill Assessment**: Regular competency evaluations
- **Career Development**: Training recommendations and career pathing

### Analytics & Reporting
- **Attendance Patterns**: Detailed attendance and punctuality analysis
- **Leave Trends**: Department and seasonal leave pattern analysis
- **Performance Metrics**: Individual and team performance dashboards
- **Compliance Reporting**: Regulatory compliance and audit reports

## Integration Points

### Database Models
- **User**: Enhanced with employment and scheduling fields
- **StaffProfile**: Comprehensive staff information management
- **StaffShift**: Detailed shift and attendance tracking
- **LeaveRequest**: Complete leave lifecycle management

### Service Integration
- **StaffService**: Core staff management operations
- **NotificationService**: Automated alerts and notifications
- **BillingService**: Integration for payroll and billing
- **ReportingService**: Analytics and dashboard generation

### External Integrations
- **Biometric Systems**: Attendance tracking integration
- **Payroll Systems**: Automatic timesheet generation
- **HR Systems**: Employee lifecycle management
- **Communication Platforms**: Automated notifications

## Compliance & Security

### Healthcare Compliance
- **HIPAA Compliance**: Secure handling of staff medical information
- **Labor Law Compliance**: Adherence to working hour regulations
- **Audit Trails**: Complete activity logging for compliance
- **Data Privacy**: Secure handling of personal information

### Security Features
- **Role-based Access**: Granular permission system
- **Data Encryption**: Sensitive data encryption at rest and in transit
- **Session Management**: Secure session handling
- **Audit Logging**: Comprehensive activity tracking

## Performance Optimization

### Database Optimization
- **Strategic Indexing**: Optimized queries for large datasets
- **Aggregation Pipelines**: Efficient analytics calculations
- **Caching Strategy**: Frequently accessed data caching

### API Performance
- **Pagination**: Efficient data loading for large datasets
- **Filtering**: Advanced filtering capabilities
- **Bulk Operations**: Batch processing for multiple operations

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **201**: Created successfully
- **400**: Bad request / Validation error
- **401**: Unauthorized
- **403**: Insufficient permissions
- **404**: Resource not found
- **409**: Conflict (scheduling conflicts, etc.)
- **500**: Internal server error

### Validation Errors
All input validation is handled by Zod schemas with detailed error messages for debugging and user feedback.

---

**Built for आरोग्य अस्पताल (Arogya Hospital) Management System**  
**Complete Staff & Duty Management System - Production Ready**
