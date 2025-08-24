# 🏥 Pharmacy API Documentation
## आरोग्य अस्पताल (Arogya Hospital) Management System

### 📋 Overview
This comprehensive pharmacy API provides complete medicine inventory management, prescription handling, stock tracking, and reporting capabilities for the hospital management system.

---

## 🔗 API Endpoints

### 1. Medicine Management

#### **GET /api/pharmacy/medicines**
Fetch all medicines with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search in name, generic_name, brand_name
- `category` (string): Filter by medicine category
- `lowStock` (boolean): Show only low stock items
- `expiringSoon` (boolean): Show medicines expiring in 30 days
- `sortBy` (string): Sort field (default: 'name')
- `sortOrder` (string): 'ASC' or 'DESC' (default: 'ASC')

**Example Request:**
```bash
GET /api/pharmacy/medicines?page=1&limit=10&search=paracetamol&lowStock=true
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "medicines": [
      {
        "id": 1,
        "medicine_id": "MED001",
        "name": "Paracetamol 500mg",
        "generic_name": "Paracetamol",
        "brand_name": "Crocin",
        "category": "Analgesic",
        "manufacturer": "GSK",
        "strength": "500mg",
        "dosage_form": "tablet",
        "unit_price": 2.50,
        "mrp": 3.00,
        "current_stock": 50,
        "minimum_stock": 100,
        "stock_status": "low",
        "expiry_status": "good",
        "prescription_required": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "categories": ["Analgesic", "Antibiotic", "Antacid"]
    }
  }
}
```

#### **POST /api/pharmacy/medicines**
Add a new medicine to inventory.

**Request Body:**
```json
{
  "name": "Amoxicillin 250mg",
  "generic_name": "Amoxicillin",
  "brand_name": "Amoxil",
  "category": "Antibiotic",
  "manufacturer": "Cipla",
  "composition": "Amoxicillin Trihydrate",
  "strength": "250mg",
  "dosage_form": "capsule",
  "pack_size": "10 capsules",
  "unit_price": 15.00,
  "mrp": 18.00,
  "current_stock": 200,
  "minimum_stock": 50,
  "maximum_stock": 500,
  "expiry_date": "2025-12-31",
  "batch_number": "AMX2024001",
  "supplier": "Cipla Ltd",
  "prescription_required": true
}
```

#### **GET /api/pharmacy/medicines/[id]**
Get detailed information about a specific medicine.

#### **PUT /api/pharmacy/medicines/[id]**
Update medicine information or adjust stock.

**Request Body (Stock Adjustment):**
```json
{
  "stock_adjustment": 50,
  "adjustment_type": "increase",
  "batch_number": "NEW2024001",
  "expiry_date": "2025-06-30",
  "adjustment_notes": "New stock received from supplier"
}
```

#### **DELETE /api/pharmacy/medicines/[id]**
Soft delete a medicine (sets is_active = false).

---

### 2. Stock Management

#### **GET /api/pharmacy/stock**
Get stock overview and alerts.

**Query Parameters:**
- `alertType` (string): 'low', 'expiring', 'expired'
- `page` (number): Page number
- `limit` (number): Items per page

**Example Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_medicines": 500,
      "low_stock_count": 25,
      "expired_count": 5,
      "expiring_soon_count": 15,
      "total_stock_value": 125000.00
    },
    "stock_alerts": [
      {
        "medicine_id": "MED001",
        "name": "Paracetamol 500mg",
        "current_stock": 10,
        "minimum_stock": 50,
        "stock_status": "low",
        "expiry_status": "good",
        "days_to_expiry": 180
      }
    ],
    "recent_transactions": []
  }
}
```

#### **POST /api/pharmacy/stock**
Add stock transaction (purchase, sale, adjustment, etc.).

**Request Body:**
```json
{
  "medicine_id": "MED001",
  "transaction_type": "purchase",
  "quantity": 100,
  "unit_price": 2.50,
  "total_amount": 250.00,
  "batch_number": "BATCH2024001",
  "expiry_date": "2025-12-31",
  "supplier": "ABC Pharmaceuticals",
  "reference_id": "PO-2024-001",
  "notes": "Monthly stock replenishment"
}
```

**Transaction Types:**
- `purchase`: Adding new stock
- `sale`: Medicine dispensed
- `return`: Returned stock
- `adjustment`: Stock correction
- `expired`: Expired stock removal

---

### 3. Prescription Management

#### **GET /api/pharmacy/prescriptions**
Get prescriptions for pharmacy processing.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: 'active', 'completed', 'cancelled'
- `patientId`: Filter by patient
- `doctorId`: Filter by doctor
- `search`: Search in patient name, prescription ID
- `dateFrom`, `dateTo`: Date range filter
- `pendingOnly`: Show only prescriptions with pending medications

**Example Response:**
```json
{
  "success": true,
  "data": {
    "prescriptions": [
      {
        "id": 1,
        "prescription_id": "RX2024001",
        "patient_name": "John Doe",
        "patient_code": "PAT001",
        "doctor_name": "Dr. Smith",
        "prescription_date": "2024-01-15",
        "total_amount": 450.00,
        "status": "active",
        "total_medications": 3,
        "dispensed_medications": 1,
        "dispensing_status": "partially_dispensed"
      }
    ],
    "statistics": {
      "total_prescriptions": 150,
      "active_prescriptions": 45,
      "pending_dispensing": 25
    }
  }
}
```

#### **POST /api/pharmacy/prescriptions**
Create a new prescription.

**Request Body:**
```json
{
  "patient_id": "PAT001",
  "doctor_id": "DOC001",
  "appointment_id": "APT001",
  "prescription_date": "2024-01-15",
  "medications": [
    {
      "medicine_id": "MED001",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "quantity": 10,
      "instructions": "Take after meals"
    }
  ],
  "notes": "Follow up after 5 days",
  "follow_up_date": "2024-01-20"
}
```

#### **GET /api/pharmacy/prescriptions/[id]**
Get detailed prescription information.

#### **PUT /api/pharmacy/prescriptions/[id]**
Update prescription or dispense medications.

**Dispense Single Medication:**
```json
{
  "action": "dispense_medication",
  "medication_id": 1,
  "quantity_dispensed": 10,
  "notes": "Dispensed to patient"
}
```

**Dispense All Medications:**
```json
{
  "action": "dispense_all",
  "notes": "Full prescription dispensed"
}
```

---

### 4. Search Functionality

#### **GET /api/pharmacy/search**
Search medicines, prescriptions, and patients.

**Query Parameters:**
- `q` (string): Search query (minimum 2 characters)
- `type` (string): 'medicines', 'prescriptions', 'patients', 'all'
- `limit` (number): Results limit per type

**Example:**
```bash
GET /api/pharmacy/search?q=paracetamol&type=medicines&limit=5
```

#### **POST /api/pharmacy/search**
Advanced search operations.

**Medicine Suggestions:**
```json
{
  "action": "medicine_suggestions",
  "category": "Analgesic",
  "doctor_id": "DOC001"
}
```

**Patient History:**
```json
{
  "action": "patient_history",
  "patient_id": "PAT001",
  "limit": 10
}
```

---

### 5. Reports and Analytics

#### **GET /api/pharmacy/reports**
Generate various pharmacy reports.

**Query Parameters:**
- `type`: Report type ('overview', 'sales', 'inventory', 'prescriptions', 'expiry', 'financial')
- `dateFrom`, `dateTo`: Date range
- `category`: Medicine category filter
- `doctorId`: Doctor filter

**Report Types:**

1. **Overview Report** (`type=overview`)
   - Key metrics and trends
   - Stock overview
   - Top medicines
   - Category analysis

2. **Sales Report** (`type=sales`)
   - Sales summary and trends
   - Top selling medicines
   - Doctor-wise analysis

3. **Inventory Report** (`type=inventory`)
   - Stock analysis
   - Low stock alerts
   - Fast/slow moving items

4. **Prescription Report** (`type=prescriptions`)
   - Prescription patterns
   - Most prescribed medicines
   - Day-wise trends

5. **Expiry Report** (`type=expiry`)
   - Expired and expiring medicines
   - Value at risk

6. **Financial Report** (`type=financial`)
   - Revenue analysis
   - Profit margins
   - Monthly trends

---

## 🔐 Authentication & Authorization

All pharmacy API endpoints require authentication. Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <jwt_token>
```

**Required Roles:**
- `pharmacy`: Full access to pharmacy operations
- `doctor`: Can create prescriptions, view medicine info
- `admin`: Full system access
- `staff`: Limited read access

---

## 📊 Database Schema Reference

### Key Tables:
- `medicines`: Medicine master data
- `medicine_stock_transactions`: Stock movement tracking
- `prescriptions`: Prescription headers
- `prescription_medications`: Individual prescription items
- `patients`: Patient information
- `users`: Staff and doctor information

### Important Fields:

**Medicine Status Indicators:**
- `stock_status`: 'low', 'medium', 'good'
- `expiry_status`: 'expired', 'expiring_soon', 'expiring_later', 'good'
- `is_active`: Boolean for soft delete

**Prescription Status:**
- `status`: 'active', 'completed', 'cancelled', 'expired'
- `is_dispensed`: Boolean for individual medications

---

## 🚀 Usage Examples

### 1. Complete Medicine Management Workflow

```javascript
// 1. Add new medicine
const newMedicine = await fetch('/api/pharmacy/medicines', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Aspirin 75mg',
    category: 'Cardiovascular',
    unit_price: 1.50,
    current_stock: 100
  })
});

// 2. Check low stock
const lowStock = await fetch('/api/pharmacy/stock?alertType=low');

// 3. Add stock
const stockUpdate = await fetch('/api/pharmacy/stock', {
  method: 'POST',
  body: JSON.stringify({
    medicine_id: 'MED001',
    transaction_type: 'purchase',
    quantity: 200
  })
});
```

### 2. Prescription Processing Workflow

```javascript
// 1. Search patient
const patients = await fetch('/api/pharmacy/search?q=john&type=patients');

// 2. Create prescription
const prescription = await fetch('/api/pharmacy/prescriptions', {
  method: 'POST',
  body: JSON.stringify({
    patient_id: 'PAT001',
    doctor_id: 'DOC001',
    medications: [
      {
        medicine_id: 'MED001',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
        quantity: 10
      }
    ]
  })
});

// 3. Dispense medication
const dispense = await fetch('/api/pharmacy/prescriptions/RX001', {
  method: 'PUT',
  body: JSON.stringify({
    action: 'dispense_medication',
    medication_id: 1,
    quantity_dispensed: 10
  })
});
```

### 3. Reporting and Analytics

```javascript
// Daily sales report
const salesReport = await fetch('/api/pharmacy/reports?type=sales&dateFrom=2024-01-01&dateTo=2024-01-31');

// Inventory analysis
const inventoryReport = await fetch('/api/pharmacy/reports?type=inventory');

// Expiry alerts
const expiryReport = await fetch('/api/pharmacy/reports?type=expiry');
```

---

## 🔧 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation error)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `409`: Conflict (duplicate data)
- `500`: Internal server error

---

## 📈 Performance Considerations

1. **Pagination**: Always use pagination for large datasets
2. **Indexing**: Database indexes on frequently queried fields
3. **Caching**: Consider caching for frequently accessed data
4. **Batch Operations**: Use batch operations for multiple updates
5. **Connection Pooling**: MySQL connection pooling for better performance

---

## 🔒 Security Features

1. **Input Validation**: All inputs are validated and sanitized
2. **SQL Injection Prevention**: Parameterized queries
3. **Role-Based Access**: Different access levels for different roles
4. **Audit Logging**: All operations are logged for audit trails
5. **Data Encryption**: Sensitive data is encrypted

---

## 📝 Notes

- All dates should be in ISO format (YYYY-MM-DD)
- Monetary values are in decimal format with 2 decimal places
- Stock quantities are integers
- Medicine IDs are auto-generated with prefix 'MED'
- Prescription IDs are auto-generated with prefix 'RX'
- All timestamps are in IST (Asia/Kolkata timezone)

---

## 🆘 Support

For technical support or API questions:
- Check the error response for specific details
- Verify authentication tokens
- Ensure required fields are provided
- Check data types and formats
- Review role-based access permissions

---

**Last Updated:** January 2024  
**API Version:** 1.0  
**Hospital:** आरोग्य अस्पताल (Arogya Hospital)
