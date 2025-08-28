# Medicine & Pharmacy Tracking System API Documentation

## Overview
Complete REST API implementation for the Hospital Management System's Medicine & Pharmacy Tracking module. Features comprehensive inventory management, prescription dispensing, vendor management, stock alerts, and auto-billing integration.

## API Endpoints

### 🏥 Medicine Management
- **GET** `/api/pharmacy/medicines` - Get medicines with filtering and pagination
- **POST** `/api/pharmacy/medicines` - Create new medicine
- **PUT** `/api/pharmacy/medicines` - Update medicine information

### 📦 Inventory Management
- **GET** `/api/pharmacy/inventory` - Get inventory reports and stock movements
- **POST** `/api/pharmacy/inventory` - Add batch or record stock movement
- **PUT** `/api/pharmacy/inventory` - Update batch information

### 💊 Prescription Processing
- **GET** `/api/pharmacy/prescriptions` - Get prescriptions for dispensing
- **POST** `/api/pharmacy/prescriptions` - Dispense prescription with auto-billing

### 🏪 Vendor Management
- **GET** `/api/pharmacy/vendors` - Get vendors with filtering
- **POST** `/api/pharmacy/vendors` - Create new vendor
- **PUT** `/api/pharmacy/vendors` - Update vendor information

### 📋 Purchase Orders
- **GET** `/api/pharmacy/purchase-orders` - Get purchase orders
- **POST** `/api/pharmacy/purchase-orders` - Create new purchase order
- **PUT** `/api/pharmacy/purchase-orders` - Update purchase order status

### 🚨 Stock Alerts
- **GET** `/api/pharmacy/alerts` - Get stock alerts and notifications
- **POST** `/api/pharmacy/alerts` - Send notifications or update alert settings
- **PUT** `/api/pharmacy/alerts` - Update global alert configuration

## Key Features

### 📊 Inventory Management
- **Batch Tracking**: Complete batch management with manufacturing and expiry dates
- **Stock Movements**: Detailed tracking of all stock movements (purchase, sale, adjustment, transfer)
- **Multi-level Stock Control**: Minimum, maximum, and reorder level management
- **Real-time Stock Updates**: Automatic stock updates with prescription dispensing

### 🔔 Smart Alerts System
- **Low Stock Alerts**: Automatic notifications when stock falls below reorder level
- **Expiry Alerts**: Configurable alerts for medicines nearing expiry (default 90 days)
- **Out of Stock Notifications**: Immediate alerts for zero stock situations
- **Overstock Warnings**: Alerts for excess inventory management

### 🏪 Vendor Management
- **Comprehensive Vendor Profiles**: Complete business details, contact information, and performance metrics
- **Performance Tracking**: Delivery time, quality ratings, and on-time delivery rates
- **Document Management**: GST certificates, drug licenses, and other compliance documents
- **Payment Terms**: Flexible credit terms and payment method configurations

### 💰 Auto-billing Integration
- **Prescription-based Billing**: Automatic invoice generation from prescription dispensing
- **Real-time Pricing**: Dynamic pricing with batch-specific cost and selling prices
- **Discount Management**: Integrated discount system with approval workflows
- **Payment Processing**: Multiple payment methods with gateway integration

### 📈 Advanced Reporting
- **Stock Summary Reports**: Category-wise and manufacturer-wise inventory analysis
- **Expiry Reports**: Detailed expiring and expired medicine tracking
- **Stock Valuation**: Current stock value and potential revenue analysis
- **Sales Analytics**: Medicine-wise and category-wise sales performance

## Authentication & Authorization

### Required Authentication
All endpoints require valid session authentication via NextAuth.js.

### Role-Based Access Control
- **Admin**: Full access to all pharmacy operations
- **Pharmacy Manager**: Complete pharmacy management + approvals
- **Pharmacist**: Medicine dispensing + inventory updates
- **Inventory Manager**: Stock management + batch operations
- **Procurement Manager**: Vendor and purchase order management

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

### Create Medicine
```javascript
POST /api/pharmacy/medicines
{
  "medicineName": "Paracetamol",
  "genericName": "Acetaminophen",
  "manufacturer": "ABC Pharma",
  "category": "Analgesic",
  "dosageForm": "Tablet",
  "strength": "500",
  "unit": "mg",
  "inventory": {
    "minimumStock": 100,
    "maximumStock": 1000,
    "reorderLevel": 150
  },
  "pricing": {
    "costPrice": 2.50,
    "sellingPrice": 3.00,
    "mrp": 3.50,
    "gstRate": 12
  },
  "vendor": {
    "name": "MediSupply Co.",
    "contactNumber": "+91-9876543210"
  }
}
```

### Add Medicine Batch
```javascript
POST /api/pharmacy/inventory
{
  "action": "add_batch",
  "medicineId": "64f7b1234567890abcdef123",
  "batchNo": "BATCH001",
  "expiryDate": "2025-12-31T00:00:00.000Z",
  "quantity": 500,
  "costPrice": 2.50,
  "sellingPrice": 3.00,
  "mrp": 3.50
}
```

### Dispense Prescription
```javascript
POST /api/pharmacy/prescriptions
{
  "prescriptionId": "64f7b1234567890abcdef456",
  "medications": [
    {
      "medicationIndex": 0,
      "medicineId": "64f7b1234567890abcdef123",
      "batchNo": "BATCH001",
      "quantityDispensed": 10,
      "sellingPrice": 3.00,
      "discount": 5
    }
  ],
  "pharmacistId": "64f7b1234567890abcdef789",
  "paymentMethod": "cash",
  "customerPaid": 30.00
}
```

### Get Stock Alerts
```javascript
GET /api/pharmacy/alerts?alertType=low_stock&limit=20
```

### Create Purchase Order
```javascript
POST /api/pharmacy/purchase-orders
{
  "vendorId": "64f7b1234567890abcdef999",
  "items": [
    {
      "medicineId": "64f7b1234567890abcdef123",
      "quantity": 1000,
      "unitPrice": 2.50,
      "discount": 5,
      "gstRate": 12
    }
  ],
  "expectedDeliveryDate": "2025-08-20T00:00:00.000Z",
  "urgency": "Medium"
}
```

## Advanced Features

### Batch Management
- **FIFO/FEFO Support**: First-In-First-Out and First-Expired-First-Out dispensing
- **Batch Tracking**: Complete traceability from purchase to dispensing
- **Expiry Management**: Automatic batch status updates and alerts

### Stock Movement Tracking
- **Comprehensive Audit Trail**: Every stock movement is tracked with user, timestamp, and reason
- **Movement Types**: Purchase, Sale, Return, Adjustment, Transfer, Expired, Damaged
- **Reference Linking**: Stock movements linked to prescriptions, purchase orders, or adjustments

### Prescription Integration
- **Auto-stock Deduction**: Automatic stock reduction when prescriptions are dispensed
- **Batch Selection**: Intelligent batch selection based on expiry dates
- **Billing Integration**: Seamless integration with billing system for invoice generation

### Vendor Performance
- **Delivery Metrics**: Track average delivery time and on-time delivery rates
- **Quality Ratings**: Vendor quality assessment and rating system
- **Purchase Analytics**: Vendor-wise purchase value and order frequency

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **201**: Created successfully
- **400**: Bad request / Validation error
- **401**: Unauthorized
- **403**: Insufficient permissions
- **404**: Resource not found
- **409**: Conflict (duplicate resource)
- **500**: Internal server error

### Validation Errors
All input validation is handled by Zod schemas with detailed error messages for debugging and user feedback.

## Integration Points

### Database Models
- **Medicine**: Comprehensive medicine information with batch and inventory data
- **Prescription**: Prescription management with dispensing tracking
- **Vendor**: Vendor management with performance metrics
- **PurchaseOrder**: Purchase order lifecycle management

### Service Integration
- **PharmacyService**: Core inventory and medicine management
- **PharmacyExtendedService**: Prescription processing and vendor management
- **BillingService**: Auto-billing integration for prescription dispensing
- **NotificationService**: Alert and notification management

### Frontend Integration
- Compatible with React/Next.js frontend
- Real-time stock updates and alerts
- Comprehensive dashboard integration
- Mobile-responsive design support

## Compliance & Security

### Healthcare Compliance
- **Drug Tracking**: Complete audit trail for controlled substances
- **Expiry Management**: Automated expiry tracking and alerts
- **Batch Traceability**: Full traceability from manufacturer to patient

### Data Security
- Role-based access control
- Input validation and sanitization
- Audit logging for all operations
- Secure prescription dispensing workflow

## Performance Optimization

### Database Optimization
- Proper indexing for fast queries
- Aggregation pipelines for complex reports
- Efficient batch operations

### Caching Strategy
- Medicine data caching for frequent lookups
- Stock level caching for dashboard displays
- Alert caching for real-time notifications

---

**Built for आरोग्य अस्पताल (Arogya Hospital) Management System**  
**Complete Medicine & Pharmacy Tracking System - Production Ready**
