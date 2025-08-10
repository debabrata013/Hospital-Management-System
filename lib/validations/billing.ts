import { z } from 'zod';

// Bill Item Schema
export const BillItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  category: z.enum([
    'Consultation', 'Medicine', 'Laboratory', 'Radiology', 
    'Procedure', 'Room Charges', 'Surgery', 'Emergency', 'Other'
  ]),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  amount: z.number().min(0, 'Amount cannot be negative'),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.number().min(0).default(0),
  serviceProvider: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service provider ID').optional(),
  serviceDate: z.string().datetime().optional(),
  medicineDetails: z.object({
    batchNo: z.string().optional(),
    expiryDate: z.string().datetime().optional(),
    manufacturer: z.string().optional()
  }).optional()
});

// Create Invoice Schema
export const CreateInvoiceSchema = z.object({
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID'),
  appointmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid appointment ID').optional(),
  admissionId: z.string().optional(),
  items: z.array(BillItemSchema).min(1, 'At least one item is required'),
  dueDate: z.string().datetime().optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
  discount: z.object({
    amount: z.number().min(0).default(0),
    percentage: z.number().min(0).max(100).default(0),
    reason: z.string().optional()
  }).optional()
});

// Update Invoice Schema
export const UpdateInvoiceSchema = z.object({
  items: z.array(BillItemSchema).optional(),
  status: z.enum(['pending', 'partial', 'paid', 'cancelled', 'refunded']).optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().max(500, 'Notes too long').optional()
});

// Payment Schema
export const PaymentSchema = z.object({
  amount: z.number().min(0.01, 'Payment amount must be greater than 0'),
  paymentMode: z.enum(['cash', 'card', 'UPI', 'net-banking', 'insurance', 'cheque', 'demand-draft']),
  transactionId: z.string().optional(),
  bankReference: z.string().optional(),
  notes: z.string().max(200, 'Notes too long').optional(),
  
  // Card payment details
  cardDetails: z.object({
    last4Digits: z.string().length(4, 'Last 4 digits must be exactly 4 characters'),
    cardType: z.enum(['Credit', 'Debit'])
  }).optional(),
  
  // UPI payment details
  upiDetails: z.object({
    upiId: z.string().email('Invalid UPI ID format'),
    transactionRef: z.string()
  }).optional(),
  
  // Insurance payment details
  insuranceDetails: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    claimNumber: z.string().optional(),
    approvalCode: z.string().optional(),
    coveragePercentage: z.number().min(0).max(100)
  }).optional(),
  
  // Cheque payment details
  chequeDetails: z.object({
    chequeNumber: z.string(),
    bankName: z.string(),
    chequeDate: z.string().datetime()
  }).optional()
});

// Discount Request Schema
export const DiscountRequestSchema = z.object({
  billId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid bill ID'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0, 'Discount value cannot be negative'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(200, 'Reason too long'),
  requestedBy: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')
});

// Discount Approval Schema
export const DiscountApprovalSchema = z.object({
  requestId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid request ID'),
  action: z.enum(['approve', 'reject']),
  comments: z.string().max(200, 'Comments too long').optional()
});

// Financial Report Query Schema
export const FinancialReportQuerySchema = z.object({
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  reportType: z.enum(['daily', 'weekly', 'monthly', 'custom']).default('daily'),
  groupBy: z.enum(['date', 'paymentMode', 'category', 'doctor']).optional(),
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID').optional(),
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid doctor ID').optional(),
  department: z.string().optional(),
  includeRefunds: z.boolean().default(false)
});

// Refund Request Schema
export const RefundRequestSchema = z.object({
  billId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid bill ID'),
  amount: z.number().min(0.01, 'Refund amount must be greater than 0'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(200, 'Reason too long'),
  refundMode: z.enum(['cash', 'bank-transfer', 'card-reversal', 'adjustment'])
});

// Outstanding Payments Query Schema
export const OutstandingPaymentsQuerySchema = z.object({
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID').optional(),
  overdueDays: z.number().min(0).optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  sortBy: z.enum(['dueDate', 'amount', 'patientName', 'createdAt']).default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

// Payment Gateway Response Schema (for validation)
export const PaymentGatewayResponseSchema = z.object({
  transactionId: z.string(),
  status: z.enum(['success', 'failed', 'pending']),
  amount: z.number(),
  currency: z.string().default('INR'),
  paymentMode: z.string(),
  gatewayResponse: z.record(z.any()).optional(),
  timestamp: z.string().datetime()
});

export default {
  BillItemSchema,
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
  PaymentSchema,
  DiscountRequestSchema,
  DiscountApprovalSchema,
  FinancialReportQuerySchema,
  RefundRequestSchema,
  OutstandingPaymentsQuerySchema,
  PaymentGatewayResponseSchema
};

// Individual exports for API routes
export const createInvoiceSchema = CreateInvoiceSchema;
export const updateInvoiceSchema = UpdateInvoiceSchema;
export const invoiceQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  patientId: z.string().optional(),
  status: z.enum(['draft', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const processPaymentSchema = PaymentSchema;
export const refundPaymentSchema = RefundRequestSchema;
export const paymentQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  invoiceId: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'net_banking', 'insurance']).optional(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.string().default('paymentDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const applyDiscountSchema = DiscountRequestSchema;
export const discountApprovalSchema = DiscountApprovalSchema;
export const discountQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.string().default('requestDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const financialReportSchema = FinancialReportQuerySchema;
