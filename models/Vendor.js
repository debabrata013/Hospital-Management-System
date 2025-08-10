import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema({
  // Unique Vendor Identifier
  vendorId: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    index: true
  },
  
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: 100
  },
  contactNumber: {
    type: String,
    required: true,
    match: [/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  alternateNumber: {
    type: String,
    match: [/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  website: String,
  
  // Address Information
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Business Details
  businessDetails: {
    gstNumber: {
      type: String,
      uppercase: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
    },
    licenseNumber: String,
    drugLicenseNumber: String,
    panNumber: {
      type: String,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
    },
    businessType: {
      type: String,
      enum: ['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer'],
      default: 'Distributor'
    },
    establishedYear: Number,
    annualTurnover: Number
  },
  
  // Bank Details
  bankDetails: {
    accountNumber: String,
    ifscCode: {
      type: String,
      uppercase: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
    },
    bankName: String,
    branchName: String,
    accountHolderName: String,
    accountType: {
      type: String,
      enum: ['Savings', 'Current', 'Overdraft']
    }
  },
  
  // Payment Terms
  paymentTerms: {
    creditDays: {
      type: Number,
      min: 0,
      max: 365,
      default: 30
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    minimumOrderValue: {
      type: Number,
      min: 0,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Cheque', 'NEFT', 'RTGS', 'UPI', 'Credit Card'],
      default: 'NEFT'
    }
  },
  
  // Performance Metrics
  performance: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalPurchaseValue: {
      type: Number,
      default: 0
    },
    averageDeliveryTime: Number, // in days
    onTimeDeliveryRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    qualityRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    lastOrderDate: Date,
    lastPaymentDate: Date
  },
  
  // Product Categories
  productCategories: [{
    type: String,
    enum: [
      'Analgesic', 'Antibiotic', 'Antiviral', 'Antifungal', 'Antihistamine',
      'Antacid', 'Antidiabetic', 'Antihypertensive', 'Cardiac', 'Respiratory',
      'Neurological', 'Psychiatric', 'Dermatological', 'Ophthalmological',
      'ENT', 'Gynecological', 'Pediatric', 'Surgical', 'Emergency', 'Vitamin',
      'Supplement', 'Vaccine', 'Medical Devices', 'Surgical Instruments', 'Other'
    ]
  }],
  
  // Contact History
  contactHistory: [{
    contactDate: {
      type: Date,
      default: Date.now
    },
    contactType: {
      type: String,
      enum: ['Phone', 'Email', 'Meeting', 'Visit', 'Other']
    },
    contactedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    purpose: String,
    notes: String,
    followUpRequired: Boolean,
    followUpDate: Date
  }],
  
  // Documents
  documents: [{
    documentType: {
      type: String,
      enum: ['GST Certificate', 'Drug License', 'PAN Card', 'Bank Details', 'Agreement', 'Other']
    },
    documentName: String,
    documentPath: String,
    uploadedDate: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    expiryDate: Date,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Status and Flags
  isActive: {
    type: Boolean,
    default: true
  },
  isBlacklisted: {
    type: Boolean,
    default: false
  },
  blacklistReason: String,
  isPreferred: {
    type: Boolean,
    default: false
  },
  
  // Audit Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
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
VendorSchema.index({ vendorId: 1 });
VendorSchema.index({ name: 1 });
VendorSchema.index({ 'businessDetails.businessType': 1 });
VendorSchema.index({ isActive: 1 });
VendorSchema.index({ isPreferred: 1 });
VendorSchema.index({ 'productCategories': 1 });

// Virtual for full address
VendorSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
});

// Virtual for outstanding amount (would need to calculate from purchase orders)
VendorSchema.virtual('outstandingAmount').get(function() {
  // This would be calculated from unpaid purchase orders
  return 0; // Placeholder
});

// Virtual for vendor rating
VendorSchema.virtual('overallRating').get(function() {
  const deliveryWeight = 0.4;
  const qualityWeight = 0.6;
  
  const deliveryScore = (this.performance.onTimeDeliveryRate / 100) * 5;
  const qualityScore = this.performance.qualityRating;
  
  return ((deliveryScore * deliveryWeight) + (qualityScore * qualityWeight)).toFixed(1);
});

// Pre-save middleware
VendorSchema.pre('save', function(next) {
  // Generate vendorId if not provided
  if (!this.vendorId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.vendorId = `VEN${timestamp}${random}`;
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Instance Methods
VendorSchema.methods.addContactHistory = function(contactData, userId) {
  this.contactHistory.push({
    ...contactData,
    contactedBy: userId,
    contactDate: new Date()
  });
  return this.save();
};

VendorSchema.methods.updatePerformance = function(orderData) {
  this.performance.totalOrders += 1;
  this.performance.totalPurchaseValue += orderData.totalAmount;
  this.performance.lastOrderDate = new Date();
  
  // Update delivery performance if delivery data is provided
  if (orderData.deliveryTime) {
    const currentAvg = this.performance.averageDeliveryTime || 0;
    const totalOrders = this.performance.totalOrders;
    this.performance.averageDeliveryTime = 
      ((currentAvg * (totalOrders - 1)) + orderData.deliveryTime) / totalOrders;
  }
  
  if (orderData.onTimeDelivery !== undefined) {
    const currentRate = this.performance.onTimeDeliveryRate || 0;
    const totalOrders = this.performance.totalOrders;
    const onTimeCount = Math.round((currentRate / 100) * (totalOrders - 1));
    const newOnTimeCount = onTimeCount + (orderData.onTimeDelivery ? 1 : 0);
    this.performance.onTimeDeliveryRate = (newOnTimeCount / totalOrders) * 100;
  }
  
  return this.save();
};

VendorSchema.methods.blacklist = function(reason, userId) {
  this.isBlacklisted = true;
  this.blacklistReason = reason;
  this.isActive = false;
  this.lastUpdatedBy = userId;
  return this.save();
};

VendorSchema.methods.activate = function(userId) {
  this.isActive = true;
  this.isBlacklisted = false;
  this.blacklistReason = null;
  this.lastUpdatedBy = userId;
  return this.save();
};

// Static Methods
VendorSchema.statics.findActiveVendors = function() {
  return this.find({ isActive: true, isBlacklisted: false });
};

VendorSchema.statics.findPreferredVendors = function() {
  return this.find({ isActive: true, isPreferred: true, isBlacklisted: false });
};

VendorSchema.statics.findByProductCategory = function(category) {
  return this.find({ 
    productCategories: category,
    isActive: true,
    isBlacklisted: false 
  });
};

VendorSchema.statics.getVendorStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalVendors: { $sum: 1 },
        activeVendors: { $sum: { $cond: ['$isActive', 1, 0] } },
        preferredVendors: { $sum: { $cond: ['$isPreferred', 1, 0] } },
        blacklistedVendors: { $sum: { $cond: ['$isBlacklisted', 1, 0] } },
        totalPurchaseValue: { $sum: '$performance.totalPurchaseValue' },
        averageRating: { $avg: '$performance.qualityRating' }
      }
    }
  ]);
};

VendorSchema.statics.getTopVendorsByPurchaseValue = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'performance.totalPurchaseValue': -1 })
    .limit(limit)
    .select('vendorId name performance.totalPurchaseValue performance.qualityRating');
};

VendorSchema.statics.getVendorsNeedingAttention = function() {
  return this.find({
    isActive: true,
    $or: [
      { 'performance.qualityRating': { $lt: 3 } },
      { 'performance.onTimeDeliveryRate': { $lt: 80 } },
      { 'documents.expiryDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }
    ]
  });
};

export default mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
