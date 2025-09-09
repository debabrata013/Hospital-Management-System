# Hospital Management System - User Credentials

## 🔐 Authentication System Overview

This document contains all user credentials for the Hospital Management System. The system now has proper authentication and role-based access control.

## 📋 User Accounts

### Super Administrator
- **Username:** `superadmin`
- **Email:** `superadmin@hospital.com`
- **Mobile:** `+919876543210`
- **Password:** `fi`
- **Role:** `super-admin`
- **Access:** All dashboards and full system control

### Hospital Administrator
- **Username:** `admin`
- **Email:** `admin@hospital.com`
- **Mobile:** `+919876543211`
- **Password:** `Admin@123`
- **Role:** `admin`
- **Access:** Admin dashboard, user management, reports

### Doctors
#### Dr. Rajesh Sharma (Cardiologist)
- **Username:** `dr.sharma`
- **Email:** `dr.sharma@hospital.com`
- **Mobile:** `+919876543212`
- **Password:** `Doctor@123`
- **Role:** `doctor`
- **Department:** Cardiology
- **Access:** Doctor dashboard, patient management, prescriptions

#### Dr. Priya Patel (Pediatrician)
- **Username:** `dr.priya`
- **Email:** `dr.priya@hospital.com`
- **Mobile:** `+919876543213`
- **Password:** `Doctor@456`
- **Role:** `doctor`
- **Department:** Pediatrics
- **Access:** Doctor dashboard, patient management, prescriptions

### Pharmacy Staff
- **Username:** `pharmacist`
- **Email:** `pharmacist@hospital.com`
- **Mobile:** `+919876543214`
- **Password:** `Pharmacy@123`
- **Role:** `pharmacy`
- **Access:** Pharmacy dashboard, medicine management, inventory

### Hospital Staff
- **Username:** `staff.nurse`
- **Email:** `nurse@hospital.com`
- **Mobile:** `+919876543215`
- **Password:** `Staff@123`
- **Role:** `staff`
- **Access:** Staff dashboard, patient status updates

### Receptionist
- **Username:** `receptionist`
- **Email:** `reception@hospital.com`
- **Mobile:** `+919876543216`
- **Password:** `Reception@123`
- **Role:** `receptionist`
- **Access:** Reception dashboard, appointments, billing

### Patient (Demo)
- **Username:** `patient.demo`
- **Email:** `patient@example.com`
- **Mobile:** `+919876543217`
- **Password:** `Patient@123`
- **Role:** `patient`
- **Access:** Patient portal, appointments, medical records

## 🔑 Login Methods

Users can login using any of the following:
- **Email address** (e.g., `admin@hospital.com`)
- **Mobile number** (e.g., `+919876543211`)
- **Username** (e.g., `admin`)

## 🛡️ Security Features

### Password Policy
- Minimum 8 characters
- Must contain uppercase and lowercase letters
- Must contain numbers
- Must contain special characters
- Password expires every 90 days

### Session Management
- Session timeout: 30 minutes of inactivity
- Maximum concurrent sessions: 3
- Remember me option: 30 days
- Secure HTTP-only cookies

### Account Security
- Account lockout after 5 failed attempts
- Lockout duration: 15 minutes
- Two-factor authentication support (optional)

## 🚪 Dashboard Access

### Role-Based Access Control
- **Super Admin:** Access to all dashboards
- **Admin:** `/admin` dashboard only
- **Doctor:** `/doctor` dashboard only
- **Pharmacy:** `/pharmacy` dashboard only
- **Staff:** `/staff` dashboard only
- **Receptionist:** `/receptionist` dashboard only
- **Patient:** `/patient` dashboard only

### Protected Routes
All dashboard routes are protected and require authentication:
- Users must login to access any dashboard
- Users are redirected to their role-specific dashboard after login
- Unauthorized access attempts are blocked
- Session verification on every request

## 🔄 Logout Functionality

### Logout Features
- **Confirmation Dialog:** Prevents accidental logout
- **Session Information:** Shows current user details before logout
- **Secure Logout:** Clears all session data and cookies
- **Quick Logout:** Emergency logout option available
- **Auto Redirect:** Redirects to login page after logout

### Logout Button Locations
- Available in all dashboard headers
- Integrated in user session components
- Accessible from navigation menus

## 🚨 Security Best Practices Implemented

### Authentication
- JWT tokens with expiration
- HTTP-only secure cookies
- Password hashing with bcrypt
- Session validation middleware

### Authorization
- Role-based access control (RBAC)
- Permission-based feature access
- Route protection middleware
- API endpoint security

### Data Protection
- Sensitive data exclusion from responses
- Secure token storage
- Input validation and sanitization
- Error handling without information leakage

### Session Management
- Automatic session expiry
- Secure session storage
- Session invalidation on logout
- Concurrent session limits

## 🔧 Development Notes

### Environment Variables Required
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=production
```

### Database Files
- User data: `/database/users-auth-data.json`
- Schema: `/database/complete-schema.sql`

### Key Components
- Authentication middleware: `/middleware.ts`
- Auth APIs: `/app/api/auth/`
- Protected route component: `/components/auth/ProtectedRoute.tsx`
- Logout component: `/components/auth/LogoutButton.tsx`
- User session component: `/components/auth/UserSession.tsx`

## 📞 Support Information

### Emergency Access
If you're locked out, contact:
- **Email:** support@hospital.com
- **Phone:** +91 9876543210
- **Emergency:** Use super admin credentials

### Password Reset
- Use "Forgot Password" link on login page
- Contact administrator for manual reset
- Emergency access via super admin account

---

**⚠️ Security Warning:** 
- Change all default passwords in production
- Use strong, unique passwords for each account
- Enable two-factor authentication for admin accounts
- Regularly review user access and permissions
- Monitor login attempts and suspicious activities
