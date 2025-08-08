# 🧪 Testing Plan - Super Admin Dashboard

## 📋 Overview
Comprehensive testing plan for the Arogya Hospital Management System Super Admin Dashboard, covering functional, security, performance, and user acceptance testing.

---

## 🔐 A) Authentication & Authorization Testing

### 1. **Authentication Flow**
```bash
# Test Cases:
✅ TC-AUTH-001: Access dashboard without login
   Expected: Redirect to login page
   
✅ TC-AUTH-002: Login with invalid credentials
   Expected: Show error message
   
✅ TC-AUTH-003: Login with valid super-admin credentials
   Expected: Access granted to dashboard
   
✅ TC-AUTH-004: Login with non-super-admin role (admin/doctor/staff)
   Expected: Show "Access Denied" message
   
✅ TC-AUTH-005: Session timeout
   Expected: Redirect to login after timeout
   
✅ TC-AUTH-006: JWT token manipulation
   Expected: Reject invalid/tampered tokens
```

### 2. **Role-Based Access Control**
```bash
# Test API Endpoints:
curl -H "Authorization: Bearer INVALID_TOKEN" http://localhost:3000/api/admin/kpis
# Expected: 401 Unauthorized

curl -H "Authorization: Bearer DOCTOR_TOKEN" http://localhost:3000/api/admin/users
# Expected: 403 Forbidden

curl -H "Authorization: Bearer SUPER_ADMIN_TOKEN" http://localhost:3000/api/admin/users
# Expected: 200 OK with user data
```

---

## 📊 B) KPIs & Dashboard Testing

### 1. **KPI Data Accuracy**
```javascript
// Test Cases:
✅ TC-KPI-001: Empty database
   Expected: All KPIs show 0 values
   
✅ TC-KPI-002: Sample data present
   Expected: KPIs match database counts
   
✅ TC-KPI-003: Real-time data updates
   Expected: KPIs refresh on data changes
   
✅ TC-KPI-004: Date range calculations
   Expected: Today's stats vs overall stats accuracy
```

### 2. **KPI API Testing**
```bash
# Test API Response:
curl -X GET http://localhost:3000/api/admin/kpis \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"

# Expected Response Structure:
{
  "success": true,
  "data": {
    "dailyStats": {
      "patientsToday": 5,
      "appointmentsToday": 12,
      "revenueToday": 15000,
      "reportsCount": 3
    },
    "overallStats": {
      "totalPatients": 150,
      "totalAppointments": 300,
      "pendingBills": 25,
      "lowStockMedicines": 8
    },
    "inventoryStatus": {
      "total": 200,
      "lowStock": 8,
      "outOfStock": 2,
      "status": "warning"
    }
  }
}
```

---

## 👥 C) User Management Testing

### 1. **CRUD Operations**
```javascript
// Test Cases:
✅ TC-USER-001: Create new user
   Input: Valid user data
   Expected: User created successfully
   
✅ TC-USER-002: Create user with existing email
   Input: Duplicate email
   Expected: Error "Email already exists"
   
✅ TC-USER-003: Create user with missing required fields
   Input: Incomplete data
   Expected: Validation error
   
✅ TC-USER-004: Update user information
   Input: Modified user data
   Expected: User updated successfully
   
✅ TC-USER-005: Delete user
   Input: User ID
   Expected: User soft deleted (isActive: false)
   
✅ TC-USER-006: Search users
   Input: Search term
   Expected: Filtered results
   
✅ TC-USER-007: Pagination
   Input: Page number
   Expected: Correct page data
```

### 2. **User API Testing**
```bash
# Create User Test:
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN" \
  -d '{
    "name": "Dr. Test User",
    "email": "test@hospital.com",
    "password": "securepass123",
    "role": "doctor",
    "contactNumber": "+91 9876543210",
    "department": "Cardiology",
    "specialization": "Heart Surgery"
  }'

# Expected: 201 Created with user data

# Get Users Test:
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=10&search=test" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"

# Expected: 200 OK with paginated user list
```

---

## 💰 D) Discount Approval Testing

### 1. **Discount Workflow**
```javascript
// Test Cases:
✅ TC-DISC-001: Fetch pending discount requests
   Expected: List of unapproved discounts
   
✅ TC-DISC-002: Approve discount request
   Input: Bill ID, action: "approve"
   Expected: Discount approved, bill updated
   
✅ TC-DISC-003: Reject discount request
   Input: Bill ID, action: "reject"
   Expected: Discount rejected, amount recalculated
   
✅ TC-DISC-004: Process already approved discount
   Input: Previously approved discount
   Expected: Error "Already processed"
```

### 2. **Discount API Testing**
```bash
# Get Pending Discounts:
curl -X GET "http://localhost:3000/api/billing/discounts?status=pending" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"

# Approve Discount:
curl -X POST http://localhost:3000/api/billing/discounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN" \
  -d '{
    "billId": "BILL123456",
    "action": "approve",
    "remarks": "Approved for senior citizen"
  }'

# Expected: 200 OK with approval confirmation
```

---

## 🏥 E) Hospital Settings Testing

### 1. **Settings Management**
```javascript
// Test Cases:
✅ TC-SET-001: Add new department
   Input: Department data
   Expected: Department added to system
   
✅ TC-SET-002: Update service pricing
   Input: New price data
   Expected: Prices updated across system
   
✅ TC-SET-003: Manage wards and rooms
   Input: Ward/room configuration
   Expected: Room availability updated
```

---

## 💾 F) Backup & Restore Testing

### 1. **Database Operations**
```javascript
// Test Cases:
✅ TC-BAK-001: Trigger database backup
   Expected: Download valid JSON file
   
✅ TC-BAK-002: Validate backup file structure
   Expected: All collections present
   
✅ TC-BAK-003: Restore from backup
   Input: Valid backup file
   Expected: Database restored successfully
   
✅ TC-BAK-004: Restore with invalid file
   Input: Corrupted backup
   Expected: Error with rollback
```

### 2. **Backup API Testing**
```bash
# Trigger Backup:
curl -X POST http://localhost:3000/api/admin/backup \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"

# Expected: File download with timestamp
```

---

## 🔍 G) Audit Logs Testing

### 1. **Audit Trail Verification**
```javascript
// Test Cases:
✅ TC-AUD-001: User action logging
   Action: Create/Update/Delete user
   Expected: Audit log entry created
   
✅ TC-AUD-002: Filter by date range
   Input: Start and end dates
   Expected: Filtered audit logs
   
✅ TC-AUD-003: Filter by user
   Input: User ID
   Expected: User-specific logs
   
✅ TC-AUD-004: Filter by action type
   Input: Action type (CREATE/UPDATE/DELETE)
   Expected: Action-specific logs
```

---

## 🤖 H) AI Review Testing

### 1. **AI-Generated Content Review**
```javascript
// Test Cases:
✅ TC-AI-001: List pending AI diet plans
   Expected: Plans where aiGenerated=true, approvedByDoctor=false
   
✅ TC-AI-002: Approve AI diet plan
   Input: Record ID
   Expected: approvedByDoctor set to true
   
✅ TC-AI-003: Edit AI diet plan before approval
   Input: Modified plan text
   Expected: Updated plan saved and approved
```

---

## 💬 I) Internal Messaging Testing

### 1. **Real-time Communication**
```javascript
// Test Cases:
✅ TC-MSG-001: Send message to staff
   Input: Message content, recipient
   Expected: Message delivered instantly
   
✅ TC-MSG-002: Unread message count
   Expected: Badge shows correct count
   
✅ TC-MSG-003: Mark message as read
   Expected: Unread count decreases
   
✅ TC-MSG-004: Group messaging
   Input: Message to multiple recipients
   Expected: All recipients receive message
```

---

## 📱 J) Responsive Design Testing

### 1. **Device Compatibility**
```javascript
// Test Cases:
✅ TC-RES-001: Desktop (1920x1080)
   Expected: Full layout with sidebar
   
✅ TC-RES-002: Tablet (768x1024)
   Expected: Collapsible sidebar
   
✅ TC-RES-003: Mobile (375x667)
   Expected: Mobile-optimized layout
   
✅ TC-RES-004: Navigation menu
   Expected: Responsive navigation
```

---

## ⚡ K) Performance Testing

### 1. **Load Testing**
```bash
# Test Cases:
✅ TC-PERF-001: Dashboard load time
   Expected: < 2 seconds initial load
   
✅ TC-PERF-002: KPI data fetch
   Expected: < 500ms API response
   
✅ TC-PERF-003: User list pagination
   Expected: < 1 second page load
   
✅ TC-PERF-004: Concurrent users
   Expected: Handle 100+ concurrent users
```

### 2. **Performance Monitoring**
```bash
# Load Testing with Artillery:
npm install -g artillery
artillery quick --count 10 --num 100 http://localhost:3000/api/admin/kpis

# Expected: 95% requests < 1000ms
```

---

## 🔒 L) Security Testing

### 1. **Security Vulnerabilities**
```javascript
// Test Cases:
✅ TC-SEC-001: SQL Injection attempts
   Input: Malicious SQL in search fields
   Expected: Input sanitized, no injection
   
✅ TC-SEC-002: XSS attempts
   Input: Script tags in form fields
   Expected: Scripts escaped/removed
   
✅ TC-SEC-003: CSRF protection
   Expected: CSRF tokens validated
   
✅ TC-SEC-004: Rate limiting
   Expected: Excessive requests blocked
```

---

## 🧪 M) Automated Testing Scripts

### 1. **Jest Test Suite**
```javascript
// tests/dashboard.test.js
describe('Super Admin Dashboard', () => {
  test('should load KPIs correctly', async () => {
    const response = await fetch('/api/admin/kpis', {
      headers: { Authorization: `Bearer ${SUPER_ADMIN_TOKEN}` }
    })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.dailyStats).toBeDefined()
  })

  test('should create user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'doctor',
      contactNumber: '+91 9876543210'
    }
    
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPER_ADMIN_TOKEN}`
      },
      body: JSON.stringify(userData)
    })
    
    expect(response.status).toBe(201)
  })
})
```

### 2. **Cypress E2E Tests**
```javascript
// cypress/integration/dashboard.spec.js
describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    cy.login('superadmin@hospital.com', 'password')
  })

  it('should display KPI cards', () => {
    cy.visit('/super-admin/dashboard')
    cy.get('[data-testid="patients-today"]').should('be.visible')
    cy.get('[data-testid="appointments-today"]').should('be.visible')
    cy.get('[data-testid="revenue-today"]').should('be.visible')
  })

  it('should manage users', () => {
    cy.visit('/super-admin/dashboard')
    cy.get('[data-testid="users-tab"]').click()
    cy.get('[data-testid="add-user-btn"]').click()
    cy.get('[data-testid="user-form"]').should('be.visible')
  })
})
```

---

## 📊 N) Test Data Setup

### 1. **Sample Data Creation**
```javascript
// scripts/create-test-data.js
const createTestData = async () => {
  // Create test patients
  const patients = await Patient.insertMany([
    {
      name: 'Test Patient 1',
      dob: new Date('1990-01-01'),
      gender: 'Male',
      contactNumber: '+91 9876543210',
      // ... other fields
    }
    // ... more test patients
  ])

  // Create test appointments
  const appointments = await Appointment.insertMany([
    {
      patientId: patients[0]._id,
      doctorId: doctors[0]._id,
      appointmentDate: new Date(),
      appointmentTime: '10:00',
      // ... other fields
    }
    // ... more test appointments
  ])

  // Create test billing records
  const bills = await Billing.insertMany([
    {
      patientId: patients[0]._id,
      totalAmount: 1000,
      discount: { amount: 100, reason: 'Senior citizen' },
      // ... other fields
    }
    // ... more test bills
  ])
}
```

---

## 🎯 O) Test Execution Plan

### **Phase 1: Unit Testing (Week 1)**
- [ ] API endpoint testing
- [ ] Database model testing
- [ ] Utility function testing
- [ ] Authentication middleware testing

### **Phase 2: Integration Testing (Week 2)**
- [ ] API integration testing
- [ ] Database integration testing
- [ ] Third-party service integration
- [ ] End-to-end workflow testing

### **Phase 3: UI Testing (Week 3)**
- [ ] Component testing
- [ ] User interaction testing
- [ ] Responsive design testing
- [ ] Cross-browser testing

### **Phase 4: Performance & Security (Week 4)**
- [ ] Load testing
- [ ] Security vulnerability testing
- [ ] Performance optimization
- [ ] Final acceptance testing

---

## 📈 P) Success Criteria

### **Functional Requirements**
- ✅ All CRUD operations work correctly
- ✅ Authentication and authorization function properly
- ✅ KPIs display accurate real-time data
- ✅ Discount approval workflow functions correctly
- ✅ Backup and restore operations work

### **Performance Requirements**
- ✅ Dashboard loads in < 2 seconds
- ✅ API responses in < 500ms
- ✅ Handles 100+ concurrent users
- ✅ Mobile responsive on all devices

### **Security Requirements**
- ✅ No security vulnerabilities found
- ✅ Proper input validation and sanitization
- ✅ Secure authentication and session management
- ✅ Audit trails for all critical actions

---

## 🚀 Q) Test Environment Setup

### **Development Environment**
```bash
# Setup test database
MONGODB_URI=mongodb://localhost:27017/arogya_test
NODE_ENV=test

# Run tests
npm test
npm run test:e2e
npm run test:performance
```

### **Staging Environment**
```bash
# Deploy to staging
npm run deploy:staging

# Run full test suite
npm run test:full
```

---

## 📋 R) Test Reporting

### **Test Report Template**
```markdown
# Test Execution Report

## Summary
- Total Tests: 150
- Passed: 145
- Failed: 3
- Skipped: 2
- Coverage: 92%

## Failed Tests
1. TC-USER-003: User creation validation
2. TC-PERF-002: KPI response time
3. TC-SEC-001: SQL injection test

## Recommendations
- Fix validation logic for user creation
- Optimize KPI query performance
- Implement additional input sanitization
```

---

**Testing Status**: 🧪 **Ready for Execution**  
**Last Updated**: January 2024  
**Coverage Target**: 90%+  
**Performance Target**: < 2s load time
