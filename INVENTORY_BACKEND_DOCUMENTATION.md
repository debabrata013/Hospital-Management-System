# 🏥 Complete Inventory Management Backend API Documentation

## 📋 Overview
This document describes the complete backend functionality for the Hospital Management System's inventory management module.

## 🚀 API Endpoints

### 1. **Main Inventory API** - `/api/admin/inventory`

#### **GET** - Fetch Inventory Data
```http
GET /api/admin/inventory
GET /api/admin/inventory?search=paracetamol
GET /api/admin/inventory?category=Analgesic
GET /api/admin/inventory?critical=true
GET /api/admin/inventory?expiring=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalItems": 8086,
    "criticalStock": 0,
    "expiringSoon": 50,
    "totalValue": 3560000,
    "inventory": [...],
    "categories": ["Analgesic", "Antibiotic", "Antidiabetic"],
    "summary": {
      "totalItems": "8,086",
      "criticalStock": "0",
      "expiringSoon": "50",
      "totalValue": "₹35.6L"
    }
  }
}
```

#### **POST** - Add New Medicine
```http
POST /api/admin/inventory
Content-Type: application/json

{
  "name": "Paracetamol 500mg",
  "generic_name": "Paracetamol",
  "brand_name": "Crocin",
  "category": "Analgesic",
  "manufacturer": "GSK",
  "strength": "500mg",
  "dosage_form": "tablet",
  "unit_price": 2.50,
  "mrp": 5.00,
  "current_stock": 1000,
  "minimum_stock": 100,
  "maximum_stock": 5000,
  "expiry_date": "2025-12-31",
  "batch_number": "BATCH001",
  "supplier": "PharmaCorp Ltd",
  "prescription_required": false
}
```

#### **PUT** - Update Medicine
```http
PUT /api/admin/inventory
Content-Type: application/json

{
  "id": 1,
  "name": "Updated Medicine Name",
  "current_stock": 500,
  "unit_price": 3.00
}
```

#### **DELETE** - Delete Medicine
```http
DELETE /api/admin/inventory?id=1
```

---

### 2. **Stock Management API** - `/api/admin/inventory/stock`

#### **GET** - Get Stock Transactions
```http
GET /api/admin/inventory/stock
GET /api/admin/inventory/stock?medicine_id=1
GET /api/admin/inventory/stock?type=IN
```

#### **POST** - Add Stock Transaction
```http
POST /api/admin/inventory/stock
Content-Type: application/json

{
  "medicine_id": 1,
  "transaction_type": "IN",
  "quantity": 100,
  "unit_price": 2.50,
  "total_amount": 250.00,
  "batch_number": "BATCH001",
  "expiry_date": "2025-12-31",
  "supplier": "PharmaCorp Ltd",
  "reference_number": "REF001",
  "notes": "Stock addition",
  "created_by": 1
}
```

**Transaction Types:**
- `IN` - Stock In (Purchase/Receipt)
- `OUT` - Stock Out (Sale/Dispense)
- `ADJUSTMENT` - Stock Adjustment

---

### 3. **Vendor Management API** - `/api/admin/inventory/vendors`

#### **GET** - Get All Vendors
```http
GET /api/admin/inventory/vendors
```

#### **POST** - Add New Vendor
```http
POST /api/admin/inventory/vendors
Content-Type: application/json

{
  "name": "PharmaCorp Ltd",
  "contact_person": "John Smith",
  "phone": "9876543210",
  "email": "orders@pharmacorp.com",
  "address": "123 Medical Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "gst_number": "GST123456789",
  "license_number": "LIC123456",
  "payment_terms": "30 days",
  "credit_limit": 100000
}
```

#### **PUT** - Update Vendor
```http
PUT /api/admin/inventory/vendors
Content-Type: application/json

{
  "id": 1,
  "name": "Updated Vendor Name",
  "phone": "9876543211"
}
```

#### **DELETE** - Delete Vendor
```http
DELETE /api/admin/inventory/vendors?id=1
```

---

### 4. **Purchase Order API** - `/api/admin/inventory/purchase-orders`

#### **GET** - Get Purchase Orders
```http
GET /api/admin/inventory/purchase-orders
GET /api/admin/inventory/purchase-orders?status=pending
```

#### **POST** - Create Purchase Order
```http
POST /api/admin/inventory/purchase-orders
Content-Type: application/json

{
  "supplier_id": 1,
  "order_date": "2024-01-15",
  "expected_delivery_date": "2024-01-22",
  "total_amount": 1500.00,
  "notes": "Urgent order",
  "created_by": 1,
  "items": [
    {
      "medicine_id": 1,
      "quantity": 100,
      "unit_price": 10.00,
      "total_price": 1000.00,
      "batch_number": "PO001"
    },
    {
      "medicine_id": 2,
      "quantity": 50,
      "unit_price": 10.00,
      "total_price": 500.00,
      "batch_number": "PO002"
    }
  ]
}
```

#### **PUT** - Update Order Status
```http
PUT /api/admin/inventory/purchase-orders
Content-Type: application/json

{
  "id": 1,
  "status": "delivered"
}
```

**Order Statuses:**
- `pending` - Order placed
- `confirmed` - Order confirmed by vendor
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled

---

### 5. **Reports API** - `/api/admin/inventory/reports`

#### **GET** - Generate Reports
```http
GET /api/admin/inventory/reports?type=summary
GET /api/admin/inventory/reports?type=critical
GET /api/admin/inventory/reports?type=expiring
GET /api/admin/inventory/reports?type=transactions&start_date=2024-01-01&end_date=2024-01-31
GET /api/admin/inventory/reports?type=category
GET /api/admin/inventory/reports?type=vendor
```

**Report Types:**
- `summary` - Overall inventory summary
- `critical` - Critical stock items
- `expiring` - Expiring medicines (90 days)
- `transactions` - Stock transactions with date range
- `category` - Category-wise breakdown
- `vendor` - Vendor performance report

---

## 🗄️ Database Schema

### **medicines** Table
```sql
CREATE TABLE medicines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  medicine_id VARCHAR(20) UNIQUE,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  brand_name VARCHAR(255),
  category VARCHAR(100),
  manufacturer VARCHAR(255),
  composition TEXT,
  strength VARCHAR(100),
  dosage_form VARCHAR(50),
  pack_size VARCHAR(100),
  unit_price DECIMAL(10,2),
  mrp DECIMAL(10,2),
  current_stock INT DEFAULT 0,
  minimum_stock INT DEFAULT 0,
  maximum_stock INT DEFAULT 0,
  expiry_date DATE,
  batch_number VARCHAR(100),
  supplier VARCHAR(255),
  storage_conditions TEXT,
  side_effects TEXT,
  contraindications TEXT,
  drug_interactions TEXT,
  pregnancy_category VARCHAR(50),
  prescription_required BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **medicine_stock_transactions** Table
```sql
CREATE TABLE medicine_stock_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id VARCHAR(20) UNIQUE,
  medicine_id INT,
  transaction_type ENUM('IN', 'OUT', 'ADJUSTMENT'),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  batch_number VARCHAR(100),
  expiry_date DATE,
  supplier VARCHAR(255),
  reference_number VARCHAR(100),
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);
```

### **medicine_suppliers** Table
```sql
CREATE TABLE medicine_suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supplier_id VARCHAR(20) UNIQUE,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  gst_number VARCHAR(20),
  license_number VARCHAR(100),
  payment_terms VARCHAR(100),
  credit_limit DECIMAL(15,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **purchase_orders** Table
```sql
CREATE TABLE purchase_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(20) UNIQUE,
  supplier_id INT,
  order_date DATE,
  expected_delivery_date DATE,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
  total_amount DECIMAL(15,2),
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES medicine_suppliers(id)
);
```

### **purchase_order_items** Table
```sql
CREATE TABLE purchase_order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  purchase_order_id INT,
  medicine_id INT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  batch_number VARCHAR(100),
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);
```

---

## 🔧 Features Implemented

### ✅ **Core Inventory Management**
- Add, Edit, Delete medicines
- Real-time stock tracking
- Automatic stock calculations
- Unique medicine ID generation

### ✅ **Stock Transaction Management**
- Stock IN (Purchase/Receipt)
- Stock OUT (Sale/Dispense)
- Stock ADJUSTMENT (Corrections)
- Transaction history tracking
- Automatic stock updates

### ✅ **Vendor Management**
- Vendor CRUD operations
- Vendor performance tracking
- Purchase history per vendor
- Credit limit management

### ✅ **Purchase Order Management**
- Create purchase orders
- Multi-item orders
- Order status tracking
- Delivery date management

### ✅ **Search & Filtering**
- Search by medicine name
- Filter by category
- Critical stock filter
- Expiring medicines filter
- Real-time search results

### ✅ **Reports & Analytics**
- Inventory summary reports
- Critical stock alerts
- Expiring medicines report
- Transaction reports with date range
- Category-wise analysis
- Vendor performance reports

### ✅ **Data Validation**
- Required field validation
- Data type validation
- Business logic validation
- Error handling

### ✅ **Real-time Updates**
- Live stock calculations
- Automatic status updates
- Real-time dashboard data
- Instant search results

---

## 🚀 Usage Examples

### **Frontend Integration**
```javascript
// Fetch inventory data
const response = await fetch('/api/admin/inventory');
const data = await response.json();

// Add new medicine
const addMedicine = async (medicineData) => {
  const response = await fetch('/api/admin/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(medicineData)
  });
  return response.json();
};

// Search medicines
const searchMedicines = async (searchTerm) => {
  const response = await fetch(`/api/admin/inventory?search=${searchTerm}`);
  return response.json();
};

// Record stock transaction
const recordStockTransaction = async (transactionData) => {
  const response = await fetch('/api/admin/inventory/stock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transactionData)
  });
  return response.json();
};
```

---

## 📊 Current Database Status

Based on the latest data:
- **Total Medicines**: 8,086 units
- **Critical Stock**: 0 units
- **Expiring Soon**: 50 units (Vitamin D3)
- **Total Value**: ₹35.6L
- **Categories**: 8 different categories
- **Active Medicines**: All medicines are active

---

## 🎯 Next Steps

1. **Start your Next.js server**: `npm run dev`
2. **Test the APIs**: Use the provided endpoints
3. **Integrate with frontend**: Use the JavaScript examples
4. **Customize as needed**: Modify the API responses for your requirements

---

## 🔒 Security Notes

- All APIs include proper error handling
- Database connections are properly managed
- Input validation is implemented
- SQL injection protection via parameterized queries
- Soft deletes for data integrity

---

**🎉 Your complete inventory management backend is ready!**
