import mongoose from "mongoose";

const PurchaseOrderSchema = new mongoose.Schema({
  // Unique Purchase Order Identifier
  purchaseOrderId: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    index: true
  },
  
  // Vendor Information
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
    index: true
  },
  
  // Order Dates
  orderDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  
  // Order Items
  items: [{
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true
    },
    medicineName: {
      type: String,
      required: true
    },
    genericName: String,
    strength: String,
    dosageForm: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    gstRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    itemSubtotal: {
      type: Number,
      required: true
    },
    itemDiscount: {
      type: Number,
      default: 0
    },
    itemGST: {
      type: Number,
      default: 0
    },
    itemTotal: {
      type: Number,
      required: true
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    notes: String,
    
    // Batch information for received items
    receivedBatches: [{
      batchNo: String,
      quantity: Number,
      manufacturingDate: Date,
      expiryDate: Date,
      receivedDate: Date
    }]
  }],
  
  // Financial Summary
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalGST: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  outstandingAmount: {
    type: Number,
    default: function() { return this.totalAmount; }
  },
  
  // Shipping Information
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    contactPerson: String,
    contactNumber: String
  },
  shippingCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Acknowledged', 'Partially Received', 'Completed', 'Cancelled'],
    default: 'Draft',
    index: true
  },
  
  // Priority and Urgency
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Payment Information
  paymentTerms: {
    creditDays: {
      type: Number,
      default: 30
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Cheque', 'NEFT', 'RTGS', 'UPI', 'Credit Card'],
      default: 'NEFT'
    },
    dueDate: Date
  },
  
  // Delivery Information
  deliveryInfo: {
    deliveryMethod: {
      type: String,
      enum: ['Vendor Delivery', 'Self Pickup', 'Courier', 'Transport'],
      default: 'Vendor Delivery'
    },
    trackingNumber: String,
    courierService: String,
    deliveryInstructions: String
  },
  
  // Quality Control
  qualityCheck: {
    isRequired: {
      type: Boolean,
      default: true
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    checkDate: Date,
    checkStatus: {
      type: String,
      enum: ['Pending', 'Passed', 'Failed', 'Partial'],
      default: 'Pending'
    },
    checkNotes: String,
    rejectedItems: [{
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine"
      },
      quantity: Number,
      reason: String,
      action: {
        type: String,
        enum: ['Return', 'Replace', 'Accept with Discount']
      }
    }]
  },
  
  // Approval Workflow
  approvals: [{
    approvalLevel: {
      type: String,
      enum: ['Pharmacy Manager', 'Finance Manager', 'Administrator']
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvalDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    comments: String
  }],
  
  // Communication History
  communications: [{
    communicationType: {
      type: String,
      enum: ['Email', 'Phone', 'SMS', 'Meeting', 'Other']
    },
    communicationDate: {
      type: Date,
      default: Date.now
    },
    communicatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    subject: String,
    message: String,
    response: String,
    followUpRequired: Boolean,
    followUpDate: Date
  }],
  
  // Documents
  documents: [{
    documentType: {
      type: String,
      enum: ['Purchase Order', 'Invoice', 'Delivery Challan', 'Quality Certificate', 'Payment Receipt', 'Other']
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
    }
  }],
  
  // Notes and Comments
  notes: String,
  internalNotes: String,
  cancellationReason: String,
  
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
PurchaseOrderSchema.index({ purchaseOrderId: 1 });
PurchaseOrderSchema.index({ vendorId: 1, orderDate: -1 });
PurchaseOrderSchema.index({ status: 1 });
PurchaseOrderSchema.index({ urgency: 1 });
PurchaseOrderSchema.index({ expectedDeliveryDate: 1 });
PurchaseOrderSchema.index({ 'paymentTerms.dueDate': 1 });

// Virtual for completion percentage
PurchaseOrderSchema.virtual('completionPercentage').get(function() {
  if (this.items.length === 0) return 0;
  
  const totalItems = this.items.length;
  const completedItems = this.items.filter(item => 
    item.receivedQuantity >= item.quantity
  ).length;
  
  return Math.round((completedItems / totalItems) * 100);
});

// Virtual for delivery status
PurchaseOrderSchema.virtual('deliveryStatus').get(function() {
  if (!this.expectedDeliveryDate) return 'No Expected Date';
  
  const now = new Date();
  const expected = new Date(this.expectedDeliveryDate);
  
  if (this.status === 'Completed') return 'Delivered';
  if (now > expected) return 'Overdue';
  if (now.getTime() - expected.getTime() <= 24 * 60 * 60 * 1000) return 'Due Today';
  return 'On Track';
});

// Virtual for payment status
PurchaseOrderSchema.virtual('paymentStatus').get(function() {
  if (this.paidAmount === 0) return 'Unpaid';
  if (this.paidAmount >= this.totalAmount) return 'Paid';
  return 'Partially Paid';
});

// Pre-save middleware
PurchaseOrderSchema.pre('save', function(next) {
  // Generate purchaseOrderId if not provided
  if (!this.purchaseOrderId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.purchaseOrderId = `PO${timestamp}${random}`;
  }
  
  // Calculate outstanding amount
  this.outstandingAmount = this.totalAmount - this.paidAmount;
  
  // Set payment due date if not set
  if (!this.paymentTerms.dueDate && this.paymentTerms.creditDays) {
    const dueDate = new Date(this.orderDate);
    dueDate.setDate(dueDate.getDate() + this.paymentTerms.creditDays);
    this.paymentTerms.dueDate = dueDate;
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Instance Methods
PurchaseOrderSchema.methods.addCommunication = function(communicationData, userId) {
  this.communications.push({
    ...communicationData,
    communicatedBy: userId,
    communicationDate: new Date()
  });
  return this.save();
};

PurchaseOrderSchema.methods.receiveItem = function(itemIndex, receivedQuantity, batchData, userId) {
  if (itemIndex >= this.items.length) {
    throw new Error('Invalid item index');
  }
  
  const item = this.items[itemIndex];
  item.receivedQuantity += receivedQuantity;
  
  if (batchData) {
    item.receivedBatches.push({
      ...batchData,
      quantity: receivedQuantity,
      receivedDate: new Date()
    });
  }
  
  // Update status based on received quantities
  const allItemsReceived = this.items.every(item => 
    item.receivedQuantity >= item.quantity
  );
  const anyItemReceived = this.items.some(item => 
    item.receivedQuantity > 0
  );
  
  if (allItemsReceived) {
    this.status = 'Completed';
    this.actualDeliveryDate = new Date();
  } else if (anyItemReceived) {
    this.status = 'Partially Received';
  }
  
  this.lastUpdatedBy = userId;
  return this.save();
};

PurchaseOrderSchema.methods.addPayment = function(amount, paymentMethod, userId, notes) {
  this.paidAmount += amount;
  this.outstandingAmount = this.totalAmount - this.paidAmount;
  
  // Add communication record for payment
  this.communications.push({
    communicationType: 'Other',
    communicatedBy: userId,
    subject: 'Payment Made',
    message: `Payment of ₹${amount} made via ${paymentMethod}. ${notes || ''}`,
    communicationDate: new Date()
  });
  
  this.lastUpdatedBy = userId;
  return this.save();
};

PurchaseOrderSchema.methods.cancel = function(reason, userId) {
  this.status = 'Cancelled';
  this.cancellationReason = reason;
  this.lastUpdatedBy = userId;
  return this.save();
};

PurchaseOrderSchema.methods.approve = function(approvalLevel, userId, comments) {
  const approval = this.approvals.find(a => a.approvalLevel === approvalLevel);
  if (approval) {
    approval.approvedBy = userId;
    approval.approvalDate = new Date();
    approval.status = 'Approved';
    approval.comments = comments;
  } else {
    this.approvals.push({
      approvalLevel,
      approvedBy: userId,
      approvalDate: new Date(),
      status: 'Approved',
      comments
    });
  }
  
  // Check if all required approvals are complete
  const requiredApprovals = ['Pharmacy Manager'];
  if (this.totalAmount > 50000) requiredApprovals.push('Finance Manager');
  if (this.totalAmount > 100000) requiredApprovals.push('Administrator');
  
  const allApproved = requiredApprovals.every(level => 
    this.approvals.some(a => a.approvalLevel === level && a.status === 'Approved')
  );
  
  if (allApproved && this.status === 'Draft') {
    this.status = 'Sent';
  }
  
  this.lastUpdatedBy = userId;
  return this.save();
};

// Static Methods
PurchaseOrderSchema.statics.findPendingOrders = function() {
  return this.find({ 
    status: { $in: ['Draft', 'Sent', 'Acknowledged', 'Partially Received'] }
  }).populate('vendorId', 'name contactNumber');
};

PurchaseOrderSchema.statics.findOverdueOrders = function() {
  return this.find({
    expectedDeliveryDate: { $lt: new Date() },
    status: { $in: ['Sent', 'Acknowledged', 'Partially Received'] }
  }).populate('vendorId', 'name contactNumber');
};

PurchaseOrderSchema.statics.findOrdersNeedingApproval = function() {
  return this.find({
    status: 'Draft',
    $or: [
      { 'approvals.status': 'Pending' },
      { approvals: { $size: 0 } }
    ]
  }).populate('createdBy', 'name');
};

PurchaseOrderSchema.statics.getPurchaseStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        orderDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' },
        completedOrders: { 
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        },
        pendingOrders: { 
          $sum: { $cond: [{ $in: ['$status', ['Draft', 'Sent', 'Acknowledged']] }, 1, 0] }
        },
        overdueOrders: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $lt: ['$expectedDeliveryDate', new Date()] },
                  { $in: ['$status', ['Sent', 'Acknowledged', 'Partially Received']] }
                ]
              }, 
              1, 
              0
            ]
          }
        }
      }
    }
  ]);
};

PurchaseOrderSchema.statics.getVendorPerformance = function(vendorId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        vendorId: new mongoose.Types.ObjectId(vendorId),
        orderDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' },
        completedOrders: { 
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        },
        onTimeDeliveries: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $eq: ['$status', 'Completed'] },
                  { $lte: ['$actualDeliveryDate', '$expectedDeliveryDate'] }
                ]
              }, 
              1, 
              0
            ]
          }
        },
        averageDeliveryTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'Completed'] },
              { 
                $divide: [
                  { $subtract: ['$actualDeliveryDate', '$orderDate'] },
                  1000 * 60 * 60 * 24
                ]
              },
              null
            ]
          }
        }
      }
    }
  ]);
};

export default mongoose.models.PurchaseOrder || mongoose.model("PurchaseOrder", PurchaseOrderSchema);
