import mongoose from "mongoose";

const BillingSchema = new mongoose.Schema({
  billId: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Patient",
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  admissionId: String, // Reference to admission if applicable
  
  // Bill Items
  items: [{
    itemId: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 200
    },
    category: {
      type: String,
      enum: ['Consultation', 'Medicine', 'Laboratory', 'Radiology', 'Procedure', 'Room Charges', 'Surgery', 'Emergency', 'Other'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    // For medicine items
    medicineDetails: {
      batchNo: String,
      expiryDate: Date,
      manufacturer: String
    },
    // Service provider (doctor/technician)
    serviceProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    serviceDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Financial Summary
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  totalTax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    reason: String,
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    approvedAt: Date
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment Information
  payments: [{
    paymentId: {
      type: String,
      required: true,
      uppercase: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMode: { 
      type: String, 
      enum: ["cash", "card", "UPI", "net-banking", "insurance", "cheque", "demand-draft"],
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    transactionId: String,
    bankReference: String,
    cardDetails: {
      last4Digits: String,
      cardType: {
        type: String,
        enum: ['Credit', 'Debit']
      }
    },
    upiDetails: {
      upiId: String,
      transactionRef: String
    },
    insuranceDetails: {
      provider: String,
      policyNumber: String,
      claimNumber: String,
      approvalCode: String,
      coveragePercentage: Number
    },
    chequeDetails: {
      chequeNumber: String,
      bankName: String,
      chequeDate: Date,
      clearanceStatus: {
        type: String,
        enum: ['Pending', 'Cleared', 'Bounced'],
        default: 'Pending'
      }
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Completed'
    },
    notes: String
  }],
  
  // Bill Status
  status: { 
    type: String, 
    enum: ["pending", "partial", "paid", "cancelled", "refunded"], 
    default: "pending" 
  },
  
  // Outstanding Amount
  outstandingAmount: {
    type: Number,
    default: function() {
      return this.finalAmount;
    },
    min: 0
  },
  
  // Due Date
  dueDate: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 30); // 30 days from creation
      return date;
    }
  },
  
  // Bill Generation Details
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Print and Email Status
  printCount: {
    type: Number,
    default: 0
  },
  lastPrintedAt: Date,
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  
  // Refund Information
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    refundDate: Date,
    refundMode: {
      type: String,
      enum: ['cash', 'bank-transfer', 'card-reversal', 'adjustment']
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Processed', 'Rejected'],
      default: 'Pending'
    }
  }],
  
  // Notes and Comments
  notes: String,
  internalNotes: String, // Not visible to patient
  
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
BillingSchema.index({ billId: 1 });
BillingSchema.index({ patientId: 1, createdAt: -1 });
BillingSchema.index({ status: 1 });
BillingSchema.index({ dueDate: 1 });
BillingSchema.index({ generatedBy: 1 });

// Virtual for total paid amount
BillingSchema.virtual('totalPaid').get(function() {
  return this.payments
    .filter(payment => payment.status === 'Completed')
    .reduce((total, payment) => total + payment.amount, 0);
});

// Virtual for payment status
BillingSchema.virtual('paymentStatus').get(function() {
  const totalPaid = this.totalPaid;
  if (totalPaid === 0) return 'Unpaid';
  if (totalPaid >= this.finalAmount) return 'Paid';
  return 'Partial';
});

// Virtual for overdue status
BillingSchema.virtual('isOverdue').get(function() {
  return this.status !== 'paid' && new Date() > this.dueDate;
});

// Pre-save middleware
BillingSchema.pre('save', function(next) {
  // Generate billId if not provided
  if (!this.billId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.billId = `BILL${timestamp}${random}`;
  }
  
  // Calculate totals
  this.subtotal = this.items.reduce((total, item) => total + item.amount, 0);
  this.totalTax = this.items.reduce((total, item) => total + (item.taxAmount || 0), 0);
  this.totalAmount = this.subtotal + this.totalTax;
  this.finalAmount = this.totalAmount - this.discount.amount;
  
  // Update outstanding amount
  const totalPaid = this.payments
    .filter(payment => payment.status === 'Completed')
    .reduce((total, payment) => total + payment.amount, 0);
  this.outstandingAmount = Math.max(0, this.finalAmount - totalPaid);
  
  // Update status based on payments
  if (totalPaid === 0) {
    this.status = 'pending';
  } else if (totalPaid >= this.finalAmount) {
    this.status = 'paid';
  } else {
    this.status = 'partial';
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Method to add payment
BillingSchema.methods.addPayment = function(paymentData) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 3).toUpperCase();
  const paymentId = `PAY${timestamp}${random}`;
  
  this.payments.push({
    ...paymentData,
    paymentId
  });
  
  return this.save();
};

// Method to apply discount
BillingSchema.methods.applyDiscount = function(discountData, approvedBy) {
  this.discount = {
    ...discountData,
    approvedBy,
    approvedAt: new Date()
  };
  
  return this.save();
};

// Method to add refund
BillingSchema.methods.addRefund = function(refundData) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 3).toUpperCase();
  const refundId = `REF${timestamp}${random}`;
  
  this.refunds.push({
    ...refundData,
    refundId,
    refundDate: new Date()
  });
  
  return this.save();
};

// Method to mark as printed
BillingSchema.methods.markAsPrinted = function() {
  this.printCount += 1;
  this.lastPrintedAt = new Date();
  return this.save();
};

// Method to mark email as sent
BillingSchema.methods.markEmailSent = function() {
  this.emailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

// Static method to get daily revenue
BillingSchema.statics.getDailyRevenue = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['paid', 'partial'] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$finalAmount' },
        totalBills: { $sum: 1 },
        averageBillAmount: { $avg: '$finalAmount' }
      }
    }
  ]);
};

// Static method to get overdue bills
BillingSchema.statics.getOverdueBills = function() {
  return this.find({
    status: { $in: ['pending', 'partial'] },
    dueDate: { $lt: new Date() }
  }).populate('patientId', 'name patientId contactNumber');
};

export default mongoose.models.Billing || mongoose.model("Billing", BillingSchema);
