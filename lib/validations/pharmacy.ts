import { z } from 'zod';

// Medicine Management Schemas
export const createMedicineSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required').max(200),
  genericName: z.string().max(200).optional(),
  brandName: z.string().optional(),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  category: z.enum([
    'Analgesic', 'Antibiotic', 'Antiviral', 'Antifungal', 'Antihistamine',
    'Antacid', 'Antidiabetic', 'Antihypertensive', 'Cardiac', 'Respiratory',
    'Neurological', 'Psychiatric', 'Dermatological', 'Ophthalmological',
    'ENT', 'Gynecological', 'Pediatric', 'Surgical', 'Emergency', 'Vitamin',
    'Supplement', 'Vaccine', 'Other'
  ]),
  therapeuticClass: z.string().optional(),
  dosageForm: z.enum(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Suppository', 'Powder', 'Solution']),
  strength: z.string().min(1, 'Strength is required'),
  unit: z.enum(['mg', 'g', 'ml', 'L', 'IU', 'mcg', '%', 'units']),
  
  // Inventory settings
  inventory: z.object({
    minimumStock: z.number().min(0, 'Minimum stock must be non-negative'),
    maximumStock: z.number().min(0, 'Maximum stock must be non-negative'),
    reorderLevel: z.number().min(0, 'Reorder level must be non-negative').optional(),
    reorderQuantity: z.number().min(0, 'Reorder quantity must be non-negative').optional()
  }),
  
  // Pricing information
  pricing: z.object({
    costPrice: z.number().min(0, 'Cost price must be non-negative'),
    sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
    mrp: z.number().min(0, 'MRP must be non-negative'),
    gstRate: z.number().min(0).max(100, 'GST rate must be between 0-100').default(0),
    discountAllowed: z.number().min(0).max(100, 'Discount must be between 0-100').default(0)
  }),
  
  // Vendor information
  vendor: z.object({
    name: z.string().min(1, 'Vendor name is required'),
    contactPerson: z.string().optional(),
    contactNumber: z.string().regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional(),
    email: z.string().email('Invalid email').optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional()
    }).optional(),
    gstNumber: z.string().optional(),
    licenseNumber: z.string().optional()
  }),
  
  // Drug information
  drugInfo: z.object({
    composition: z.string().optional(),
    indications: z.array(z.string()).optional(),
    contraindications: z.array(z.string()).optional(),
    sideEffects: z.array(z.string()).optional(),
    dosageInstructions: z.string().optional(),
    storageConditions: z.string().optional(),
    warnings: z.array(z.string()).optional(),
    interactions: z.array(z.string()).optional(),
    pregnancyCategory: z.enum(['A', 'B', 'C', 'D', 'X']).optional(),
    scheduleType: z.enum(['H', 'H1', 'X', 'G', 'Non-scheduled']).optional()
  }).optional(),
  
  // Alert settings
  alerts: z.object({
    lowStockAlert: z.boolean().default(true),
    expiryAlert: z.boolean().default(true),
    expiryAlertDays: z.number().min(1).max(365).default(90)
  }).optional(),
  
  // Flags
  isPrescriptionRequired: z.boolean().default(false),
  isNarcotic: z.boolean().default(false),
  isRefrigerated: z.boolean().default(false)
});

export const updateMedicineSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  updates: createMedicineSchema.partial()
});

// Batch Management Schemas
export const addBatchSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  batchNo: z.string().min(1, 'Batch number is required'),
  manufacturingDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime('Invalid expiry date'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  costPrice: z.number().min(0, 'Cost price must be non-negative'),
  sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
  mrp: z.number().min(0, 'MRP must be non-negative'),
  supplier: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
    email: z.string().email().optional()
  }).optional(),
  purchaseOrderId: z.string().optional(),
  gstRate: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).default(0)
});

export const updateBatchSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  batchNo: z.string().min(1, 'Batch number is required'),
  updates: z.object({
    quantity: z.number().min(0).optional(),
    status: z.enum(['Active', 'Expired', 'Recalled', 'Damaged']).optional(),
    costPrice: z.number().min(0).optional(),
    sellingPrice: z.number().min(0).optional(),
    mrp: z.number().min(0).optional()
  })
});

// Stock Movement Schemas
export const stockMovementSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  movementType: z.enum(['Purchase', 'Sale', 'Return', 'Adjustment', 'Transfer', 'Expired', 'Damaged']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  batchNo: z.string().optional(),
  reason: z.string().optional(),
  referenceId: z.string().optional(),
  notes: z.string().optional()
});

// Prescription Processing Schemas
export const dispensePrescriptionSchema = z.object({
  prescriptionId: z.string().min(1, 'Prescription ID is required'),
  medications: z.array(z.object({
    medicationIndex: z.number().min(0),
    medicineId: z.string().min(1, 'Medicine ID is required'),
    batchNo: z.string().min(1, 'Batch number is required'),
    quantityDispensed: z.number().min(1, 'Quantity must be at least 1'),
    sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
    discount: z.number().min(0).max(100).default(0),
    notes: z.string().optional()
  })).min(1, 'At least one medication must be dispensed'),
  pharmacistId: z.string().min(1, 'Pharmacist ID is required'),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'insurance']).default('cash'),
  customerPaid: z.number().min(0, 'Amount paid must be non-negative'),
  notes: z.string().optional()
});

// Vendor Management Schemas
export const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  contactPerson: z.string().optional(),
  contactNumber: z.string().regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(6, 'Invalid pincode').max(6, 'Invalid pincode'),
    country: z.string().default('India')
  }),
  businessDetails: z.object({
    gstNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    drugLicenseNumber: z.string().optional(),
    panNumber: z.string().optional(),
    businessType: z.enum(['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer']).default('Distributor')
  }),
  bankDetails: z.object({
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    bankName: z.string().optional(),
    accountHolderName: z.string().optional()
  }).optional(),
  paymentTerms: z.object({
    creditDays: z.number().min(0).default(30),
    discountPercentage: z.number().min(0).max(100).default(0),
    minimumOrderValue: z.number().min(0).default(0)
  }).optional(),
  isActive: z.boolean().default(true)
});

export const updateVendorSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  updates: createVendorSchema.partial()
});

// Purchase Order Schemas
export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  orderDate: z.string().datetime().optional(),
  expectedDeliveryDate: z.string().datetime().optional(),
  items: z.array(z.object({
    medicineId: z.string().min(1, 'Medicine ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price must be non-negative'),
    discount: z.number().min(0).max(100).default(0),
    gstRate: z.number().min(0).max(100).default(0),
    notes: z.string().optional()
  })).min(1, 'At least one item is required'),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(6, 'Invalid pincode').max(6, 'Invalid pincode')
  }).optional(),
  notes: z.string().optional(),
  urgency: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium')
});

export const updatePurchaseOrderSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase order ID is required'),
  status: z.enum(['Draft', 'Sent', 'Acknowledged', 'Partially Received', 'Completed', 'Cancelled']).optional(),
  notes: z.string().optional()
});

// Query Schemas
export const medicineQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  stockStatus: z.enum(['In Stock', 'Low Stock', 'Out of Stock', 'Overstock']).optional(),
  expiryStatus: z.enum(['Expiring Soon', 'Expired', 'Valid']).optional(),
  sortBy: z.enum(['medicineName', 'category', 'currentStock', 'expiryDate', 'createdAt']).default('medicineName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export const stockMovementQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  medicineId: z.string().optional(),
  movementType: z.enum(['Purchase', 'Sale', 'Return', 'Adjustment', 'Transfer', 'Expired', 'Damaged']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  performedBy: z.string().optional(),
  sortBy: z.enum(['movementDate', 'quantity', 'movementType']).default('movementDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const prescriptionQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z.enum(['Active', 'Partially Filled', 'Completed', 'Cancelled', 'Expired']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['prescriptionDate', 'patientName', 'status']).default('prescriptionDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const vendorQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  businessType: z.enum(['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer']).optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'businessType', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

// Report Schemas
export const inventoryReportSchema = z.object({
  reportType: z.enum(['stock_summary', 'low_stock', 'expiring_medicines', 'stock_valuation', 'movement_summary']),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  includeInactive: z.boolean().default(false),
  groupBy: z.enum(['category', 'manufacturer', 'vendor', 'month']).optional()
});

export const salesReportSchema = z.object({
  reportType: z.enum(['daily_sales', 'monthly_sales', 'medicine_wise', 'prescription_wise', 'profit_analysis']),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  medicineId: z.string().optional(),
  category: z.string().optional(),
  pharmacistId: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'medicine', 'category']).optional()
});

// Alert Configuration Schema
export const alertConfigSchema = z.object({
  lowStockThreshold: z.number().min(0).default(10),
  expiryAlertDays: z.number().min(1).max(365).default(90),
  enableEmailAlerts: z.boolean().default(true),
  enableSMSAlerts: z.boolean().default(false),
  alertRecipients: z.array(z.object({
    userId: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    alertTypes: z.array(z.enum(['low_stock', 'expiry', 'out_of_stock', 'overstock']))
  })).optional()
});
