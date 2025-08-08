import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  fromUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  toUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User"
  },
  // For group messages or department-wide messages
  toGroup: {
    type: String,
    enum: ['all-staff', 'doctors', 'nurses', 'admin', 'pharmacy', 'reception', 'custom']
  },
  customGroupMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  
  // Message Content
  subject: {
    type: String,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'urgent', 'announcement', 'reminder', 'alert', 'system'],
    default: 'text'
  },
  
  // Priority and Urgency
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    fileType: String,
    fileSize: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Message Status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'archived', 'deleted'],
    default: 'sent'
  },
  
  // Read Status (for individual recipients)
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    readAt: {
      type: Date,
      default: Date.now
    },
    deviceInfo: String
  }],
  
  // Delivery Status
  deliveredTo: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Thread and Reply Information
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  threadId: String,
  isReply: {
    type: Boolean,
    default: false
  },
  replyCount: {
    type: Number,
    default: 0
  },
  
  // Patient/Case Related
  relatedPatientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
  },
  relatedAppointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  relatedRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalRecord"
  },
  
  // Scheduling and Reminders
  scheduledFor: Date, // For scheduled messages
  reminderAt: Date,   // For reminder messages
  isScheduled: {
    type: Boolean,
    default: false
  },
  isReminder: {
    type: Boolean,
    default: false
  },
  
  // Auto-delete settings
  autoDeleteAfter: Date,
  isAutoDelete: {
    type: Boolean,
    default: false
  },
  
  // Message Actions
  actions: [{
    actionType: {
      type: String,
      enum: ['approve', 'reject', 'acknowledge', 'escalate', 'forward']
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    actionAt: {
      type: Date,
      default: Date.now
    },
    actionNote: String
  }],
  
  // Notification Settings
  pushNotificationSent: {
    type: Boolean,
    default: false
  },
  emailNotificationSent: {
    type: Boolean,
    default: false
  },
  smsNotificationSent: {
    type: Boolean,
    default: false
  },
  
  // Message Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: Date,
  
  // System Messages
  isSystemGenerated: {
    type: Boolean,
    default: false
  },
  systemEventType: {
    type: String,
    enum: ['appointment-reminder', 'payment-due', 'stock-alert', 'shift-change', 'emergency-alert']
  },
  
  // Archive and Delete
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
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
MessageSchema.index({ messageId: 1 });
MessageSchema.index({ fromUserId: 1, createdAt: -1 });
MessageSchema.index({ toUserId: 1, createdAt: -1 });
MessageSchema.index({ toGroup: 1, createdAt: -1 });
MessageSchema.index({ status: 1 });
MessageSchema.index({ priority: 1 });
MessageSchema.index({ isUrgent: 1 });
MessageSchema.index({ threadId: 1 });
MessageSchema.index({ scheduledFor: 1 });
MessageSchema.index({ isDeleted: 1, isArchived: 1 });

// Virtual for read status
MessageSchema.virtual('isRead').get(function() {
  return this.status === 'read';
});

// Virtual for unread count (for group messages)
MessageSchema.virtual('unreadCount').get(function() {
  if (this.toGroup) {
    // This would need to be calculated based on total recipients vs readBy array
    return Math.max(0, this.deliveredTo.length - this.readBy.length);
  }
  return this.status === 'read' ? 0 : 1;
});

// Virtual for message age
MessageSchema.virtual('messageAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
});

// Pre-save middleware
MessageSchema.pre('save', function(next) {
  // Generate messageId if not provided
  if (!this.messageId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.messageId = `MSG${timestamp}${random}`;
  }
  
  // Generate threadId for new conversations
  if (!this.threadId && !this.parentMessageId) {
    this.threadId = this.messageId;
  }
  
  // Set urgent flag based on priority
  if (this.priority === 'urgent') {
    this.isUrgent = true;
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Method to mark as read
MessageSchema.methods.markAsRead = function(userId, deviceInfo = null) {
  // Check if already read by this user
  const alreadyRead = this.readBy.some(read => read.userId.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({
      userId,
      readAt: new Date(),
      deviceInfo
    });
    
    // Update status if it's a direct message
    if (this.toUserId && this.toUserId.toString() === userId.toString()) {
      this.status = 'read';
    }
    
    this.viewCount += 1;
    this.lastViewedAt = new Date();
  }
  
  return this.save();
};

// Method to mark as delivered
MessageSchema.methods.markAsDelivered = function(userId) {
  const alreadyDelivered = this.deliveredTo.some(delivery => 
    delivery.userId.toString() === userId.toString()
  );
  
  if (!alreadyDelivered) {
    this.deliveredTo.push({
      userId,
      deliveredAt: new Date()
    });
    
    if (this.toUserId && this.toUserId.toString() === userId.toString()) {
      this.status = 'delivered';
    }
  }
  
  return this.save();
};

// Method to add reply
MessageSchema.methods.addReply = function(replyData) {
  this.replyCount += 1;
  return this.save();
};

// Method to add action
MessageSchema.methods.addAction = function(actionData) {
  this.actions.push({
    ...actionData,
    actionAt: new Date()
  });
  return this.save();
};

// Method to archive message
MessageSchema.methods.archive = function(userId) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = userId;
  return this.save();
};

// Method to delete message (soft delete)
MessageSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

// Static method to find unread messages for user
MessageSchema.statics.findUnreadForUser = function(userId) {
  return this.find({
    $or: [
      { toUserId: userId, status: { $ne: 'read' } },
      { 
        toGroup: { $exists: true },
        'readBy.userId': { $ne: userId }
      }
    ],
    isDeleted: false
  }).populate('fromUserId', 'name role department');
};

// Static method to find messages in thread
MessageSchema.statics.findInThread = function(threadId) {
  return this.find({ 
    threadId,
    isDeleted: false 
  })
  .populate('fromUserId', 'name role department')
  .populate('toUserId', 'name role department')
  .sort({ createdAt: 1 });
};

// Static method to find urgent messages
MessageSchema.statics.findUrgentMessages = function() {
  return this.find({
    isUrgent: true,
    status: { $ne: 'read' },
    isDeleted: false
  })
  .populate('fromUserId', 'name role department')
  .populate('toUserId', 'name role department')
  .sort({ createdAt: -1 });
};

// Static method to get message statistics
MessageSchema.statics.getMessageStats = function(userId, timeframe = 'week') {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  
  return this.aggregate([
    {
      $match: {
        $or: [{ fromUserId: userId }, { toUserId: userId }],
        createdAt: { $gte: startDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        sentMessages: {
          $sum: { $cond: [{ $eq: ['$fromUserId', userId] }, 1, 0] }
        },
        receivedMessages: {
          $sum: { $cond: [{ $eq: ['$toUserId', userId] }, 1, 0] }
        },
        urgentMessages: {
          $sum: { $cond: ['$isUrgent', 1, 0] }
        },
        unreadMessages: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $eq: ['$toUserId', userId] },
                  { $ne: ['$status', 'read'] }
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

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
