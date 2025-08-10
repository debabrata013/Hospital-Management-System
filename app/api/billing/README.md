# Billing & Payment System API Documentation

## Overview
Complete REST API implementation for the Hospital Management System's Billing & Payment module. Built with Next.js API routes, comprehensive validation, role-based access control, and audit trail logging.

## API Endpoints

### 📋 Main Billing Operations
- **GET** `/api/billing` - Get invoices with filtering and pagination
- **POST** `/api/billing` - Create new invoice
- **PUT** `/api/billing` - Update invoice

### 💳 Payment Processing
- **GET** `/api/billing/payments` - Get payment history
- **POST** `/api/billing/payments` - Process payment
- **PUT** `/api/billing/payments` - Process refund

### 📊 Financial Reports
- **GET** `/api/billing/reports` - Generate financial reports
- **POST** `/api/billing/reports` - Generate custom reports

### 🎯 Discount Management
- **GET** `/api/billing/discounts` - Get discount history
- **POST** `/api/billing/discounts` - Apply discount
- **PUT** `/api/billing/discounts` - Approve/reject discount
- **DELETE** `/api/billing/discounts` - Remove discount

### 📄 Invoice Operations
- **GET** `/api/billing/invoices/[id]` - Get specific invoice
- **PUT** `/api/billing/invoices/[id]` - Update invoice status
- **DELETE** `/api/billing/invoices/[id]` - Cancel invoice

### 📈 Outstanding Payments
- **GET** `/api/billing/outstanding` - Get outstanding payments
- **POST** `/api/billing/outstanding` - Send payment reminders
- **PUT** `/api/billing/outstanding` - Mark overdue/write-off

### 🔄 Bulk Operations
- **POST** `/api/billing/bulk` - Bulk operations (invoices, payments, status updates)

## Authentication & Authorization

### Required Authentication
All endpoints require valid session authentication via NextAuth.js.

### Role-Based Access Control
- **Admin**: Full access to all operations
- **Billing Manager**: Full billing operations + approvals
- **Finance Manager**: Reports + outstanding management
- **Billing Staff**: Invoice creation + payment processing
- **Cashier**: Payment processing only
- **Doctor**: Invoice creation + discount requests

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

## Key Features

### 🔒 Security Features
- Role-based access control
- Input validation with Zod schemas
- Audit trail logging for all operations
- Risk level assessment for sensitive operations

### 💰 Payment Gateway Integration
- Mock payment processing for development
- Support for multiple payment methods (cash, card, UPI, net banking, insurance)
- Real gateway integration ready (Razorpay, PayU)
- Automatic payment status tracking

### 📊 Financial Reporting
- Daily, weekly, monthly revenue reports
- Outstanding payments tracking
- Department-wise revenue analysis
- Payment method analytics
- Overdue account management

### 🎯 Discount Management
- Automatic approval workflow based on amount/percentage
- Role-based discount authorization
- Comprehensive discount audit trail
- Discount removal with proper authorization

### 🔄 Bulk Operations
- Batch invoice creation (up to 100 invoices)
- Bulk payment processing (up to 50 payments)
- Mass status updates
- Bulk reminder sending
- Validation-only mode for testing

## Usage Examples

### Create Invoice
```javascript
POST /api/billing
{
  "patientId": "PAT001",
  "items": [
    {
      "description": "Consultation Fee",
      "quantity": 1,
      "unitPrice": 500,
      "department": "General Medicine"
    }
  ],
  "dueDate": "2025-08-20T00:00:00.000Z"
}
```

### Process Payment
```javascript
POST /api/billing/payments
{
  "invoiceId": "INV001",
  "amount": 500,
  "paymentMethod": "card",
  "notes": "Payment via credit card"
}
```

### Apply Discount
```javascript
POST /api/billing/discounts
{
  "invoiceId": "INV001",
  "discountType": "percentage",
  "discountValue": 10,
  "reason": "Senior citizen discount"
}
```

### Generate Financial Report
```javascript
GET /api/billing/reports?reportType=monthly&dateFrom=2025-08-01&dateTo=2025-08-31
```

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **201**: Created successfully
- **400**: Bad request / Validation error
- **401**: Unauthorized
- **403**: Insufficient permissions
- **404**: Resource not found
- **500**: Internal server error

### Validation Errors
All input validation is handled by Zod schemas with detailed error messages for debugging and user feedback.

## Integration Notes

### Database Models
- Uses existing MongoDB models (Billing.js)
- Maintains relationships with Patient, User, and other models
- Implements proper indexing for performance

### Services Integration
- **BillingService**: Core business logic
- **PaymentGatewayService**: Payment processing
- **NotificationService**: Email/SMS notifications
- **AuditService**: Compliance logging

### Frontend Integration
- Compatible with React/Next.js frontend
- Standardized API responses for easy consumption
- Comprehensive error handling for user experience

## Development & Testing

### Environment Setup
- Mock payment gateway for development
- Comprehensive validation schemas
- Audit trail logging for debugging

### Testing Considerations
- Bulk operations include validation-only mode
- Mock payment success rate: 90%
- Comprehensive error scenarios covered

## Compliance & Security

### Healthcare Compliance
- Detailed audit trails for all financial operations
- Risk level assessment for sensitive operations
- Proper authorization workflows

### Data Security
- Input sanitization and validation
- Role-based access control
- Secure payment processing
- Audit logging for compliance

---

**Built for आरोग्य अस्पताल (Arogya Hospital) Management System**  
**Complete Billing & Payment System Backend - Production Ready**
