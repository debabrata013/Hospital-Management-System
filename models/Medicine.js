import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
  medicineId: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  medicineName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  genericName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  brandName: String,
  manufacturer: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Analgesic', 'Antibiotic', 'Antiviral', 'Antifungal', 'Antihistamine',
      'Antacid', 'Antidiabetic', 'Antihypertensive', 'Cardiac', 'Respiratory',
      'Neurological', 'Psychiatric', 'Dermatological', 'Ophthalmological',
      'ENT', 'Gynecological', 'Pediatric', 'Surgical', 'Emergency', 'Vitamin',
      'Supplement', 'Vaccine', 'Other'
    ]
  },
  therapeuticClass: String,
  dosageForm: {
    type: String,
    required: true,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Suppository', 'Powder', 'Solution']
  },
  strength: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['mg', 'g', 'ml', 'L', 'IU', 'mcg', '%', 'units']
  },
  
  // Inventory Management
  inventory: {
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    minimumStock: {
      type: Number,
      required: true,
      min: 0,
      default: 10
    },
    maximumStock: {
      type: Number,
      required: true,
      min: 0,
      default: 1000
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0
    },
    reorderQuantity: {
      type: Number,
      required: true,
      min: 0
    }
  },
  
  // Batch Information
  batches: [{
    batchNo: {
      type: String,
      required: true
    },
    manufacturingDate: Date,
    expiryDate: {
      type: Date,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    mrp: {
      type: Number,
      required: true,
      min: 0
    },
    supplier: {
      name: String,
      contactNumber: String,
      email: String
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    purchaseOrderId: String,
    gstRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Recalled', 'Damaged'],
      default: 'Active'
    }
  }],
  
  // Pricing Information
  pricing: {
    costPrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    mrp: {
      type: Number,
      required: true,
      min: 0
    },
    gstRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    marginPercentage: Number,
    discountAllowed: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Vendor Information
  vendor: {
    name: {
      type: String,
      required: true
    },
    contactPerson: String,
    contactNumber: {
      type: String,
      match: [/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    gstNumber: String,
    licenseNumber: String
  },
  
  // Drug Information
  drugInfo: {
    composition: String,
    indications: [String],
    contraindications: [String],
    sideEffects: [String],
    dosageInstructions: String,
    storageConditions: String,
    warnings: [String],
    interactions: [String],
    pregnancyCategory: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'X']
    },
    scheduleType: {
      type: String,
      enum: ['H', 'H1', 'X', 'G', 'Non-scheduled']
    }
  },
  
  // Stock Movement Tracking
  stockMovements: [{
    movementType: {
      type: String,
      enum: ['Purchase', 'Sale', 'Return', 'Adjustment', 'Transfer', 'Expired', 'Damaged'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    batchNo: String,
    reason: String,
    referenceId: String, // Bill ID, Purchase Order ID, etc.
    movementDate: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    notes: String
  }],
  
  // Alert Settings
  alerts: {
    lowStockAlert: {
      type: Boolean,
      default: true
    },
    expiryAlert: {
      type: Boolean,
      default: true
    },
    expiryAlertDays: {
      type: Number,
      default: 90 // Alert 90 days before expiry
    },
    lastAlertSent: Date
  },
  
  // Status and Flags
  isActive: {
    type: Boolean,
    default: true
  },
  isPrescriptionRequired: {
    type: Boolean,
    default: false
  },
  isNarcotic: {
    type: Boolean,
    default: false
  },
  isRefrigerated: {
    type: Boolean,
    default: false
  },
  
  // Audit Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // For offline sync
  lastUpdated: { 
    type: Number, 
    default: Date.now 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
MedicineSchema.index({ medicineId: 1 });
MedicineSchema.index({ medicineName: 1 });
MedicineSchema.index({ genericName: 1 });
MedicineSchema.index({ category: 1 });
MedicineSchema.index({ 'inventory.currentStock': 1 });
MedicineSchema.index({ 'batches.expiryDate': 1 });
MedicineSchema.index({ isActive: 1 });

// Virtual for stock status
MedicineSchema.virtual('stockStatus').get(function() {
  if (this.inventory.currentStock === 0) return 'Out of Stock';
  if (this.inventory.currentStock <= this.inventory.minimumStock) return 'Low Stock';
  if (this.inventory.currentStock >= this.inventory.maximumStock) return 'Overstock';
  return 'In Stock';
});

// Virtual for expiring batches
MedicineSchema.virtual('expiringBatches').get(function() {
  const alertDate = new Date();
  alertDate.setDate(alertDate.getDate() + this.alerts.expiryAlertDays);
  
  return this.batches.filter(batch => 
    batch.status === 'Active' && 
    batch.expiryDate <= alertDate &&
    batch.quantity > 0
  );
});

// Virtual for total value
MedicineSchema.virtual('totalValue').get(function() {
  return this.inventory.currentStock * this.pricing.costPrice;
});

// Pre-save middleware
MedicineSchema.pre('save', function(next) {
  // Generate medicineId if not provided
  if (!this.medicineId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.medicineId = `MED${timestamp}${random}`;
  }
  
  // Calculate margin percentage
  if (this.pricing.costPrice && this.pricing.sellingPrice) {
    this.pricing.marginPercentage = parseFloat(
      (((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.costPrice) * 100).toFixed(2)
    );
  }
  
  // Update reorder level if not set
  if (!this.inventory.reorderLevel) {
    this.inventory.reorderLevel = Math.ceil(this.inventory.minimumStock * 1.5);
  }
  
  // Update reorder quantity if not set
  if (!this.inventory.reorderQuantity) {
    this.inventory.reorderQuantity = this.inventory.maximumStock - this.inventory.minimumStock;
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Method to add stock
MedicineSchema.methods.addStock = function(quantity, batchData, userId) {
  // Add to batches
  this.batches.push(batchData);
  
  // Update current stock
  this.inventory.currentStock += quantity;
  
  // Add stock movement
  this.stockMovements.push({
    movementType: 'Purchase',
    quantity: quantity,
    batchNo: batchData.batchNo,
    performedBy: userId,
    reason: 'Stock purchase'
  });
  
  return this.save();
};

// Method to reduce stock (for sales)
MedicineSchema.methods.reduceStock = function(quantity, batchNo, userId, referenceId) {
  // Find the batch
  const batch = this.batches.find(b => b.batchNo === batchNo && b.status === 'Active');
  if (!batch || batch.quantity < quantity) {
    throw new Error('Insufficient stock in the specified batch');
  }
  
  // Reduce batch quantity
  batch.quantity -= quantity;
  
  // Update current stock
  this.inventory.currentStock -= quantity;
  
  // Add stock movement
  this.stockMovements.push({
    movementType: 'Sale',
    quantity: -quantity,
    batchNo: batchNo,
    performedBy: userId,
    referenceId: referenceId,
    reason: 'Medicine sale'
  });
  
  return this.save();
};

// Method to check if reorder is needed
MedicineSchema.methods.needsReorder = function() {
  return this.inventory.currentStock <= this.inventory.reorderLevel;
};

// Method to get active batches sorted by expiry
MedicineSchema.methods.getActiveBatches = function() {
  return this.batches
    .filter(batch => batch.status === 'Active' && batch.quantity > 0)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
};

// Static method to find medicines needing reorder
MedicineSchema.statics.findMedicinesNeedingReorder = function() {
  return this.find({
    isActive: true,
    $expr: { $lte: ['$inventory.currentStock', '$inventory.reorderLevel'] }
  });
};

// Static method to find expiring medicines
MedicineSchema.statics.findExpiringMedicines = function(days = 90) {
  const alertDate = new Date();
  alertDate.setDate(alertDate.getDate() + days);
  
  return this.find({
    isActive: true,
    'batches.expiryDate': { $lte: alertDate },
    'batches.status': 'Active',
    'batches.quantity': { $gt: 0 }
  });
};

// Static method to get inventory summary
MedicineSchema.statics.getInventorySummary = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        totalMedicines: { $sum: 1 },
        totalStock: { $sum: '$inventory.currentStock' },
        totalValue: { $sum: { $multiply: ['$inventory.currentStock', '$pricing.costPrice'] } },
        lowStockCount: {
          $sum: {
            $cond: [
              { $lte: ['$inventory.currentStock', '$inventory.minimumStock'] },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

export default mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema);
