# 🏥 Hospital Management System - Backend Development Guide (Part 2)

## 🛡️ Data Validation & Security

### **Input Validation Framework**

```typescript
// Validation schemas using Zod
import { z } from 'zod';

const PatientRegistrationSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  dob: z.date().max(new Date()),
  gender: z.enum(['Male', 'Female', 'Other']),
  contactNumber: z.string().regex(/^[+]?[1-9][\d]{0,15}$/),
  email: z.string().email().optional(),
  address: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/)
  }),
  emergencyContacts: z.array(z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^[+]?[1-9][\d]{0,15}$/),
    relationship: z.string().min(2)
  })).min(1)
});

const MedicalRecordSchema = z.object({
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  chiefComplaint: z.string().min(5).max(500),
  diagnosis: z.object({
    primary: z.object({
      condition: z.string().min(3),
      icdCode: z.string().optional()
    }),
    secondary: z.array(z.object({
      condition: z.string(),
      icdCode: z.string().optional()
    })).optional()
  }),
  treatmentPlan: z.object({
    medications: z.array(z.object({
      medicineName: z.string().min(2),
      dosage: z.string().min(1),
      frequency: z.enum([
        'Once daily', 'Twice daily', 'Thrice daily', 
        'Four times daily', 'As needed'
      ]),
      duration: z.string().min(1)
    })).optional()
  }).optional()
});

// Validation middleware
export function validateRequest(schema: z.ZodSchema) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Validation failed',
          details: error.errors
        }, { status: 400 });
      }
      throw error;
    }
  };
}
```

### **Data Sanitization**

```typescript
// Sanitization utilities
import DOMPurify from 'isomorphic-dompurify';

const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    // Remove HTML tags and scripts
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

// Sanitization middleware
export function sanitizeRequestBody() {
  return async (request: NextRequest) => {
    const body = await request.json();
    const sanitizedBody = sanitizeInput(body);
    
    // Replace request body with sanitized version
    return new NextRequest(request.url, {
      ...request,
      body: JSON.stringify(sanitizedBody)
    });
  };
}
```

### **Security Headers & CORS**

```typescript
// Security middleware
export function securityHeaders() {
  return (response: NextResponse) => {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    return response;
  };
}

// CORS configuration for patient portal
export function corsHeaders(origin: string) {
  const allowedOrigins = [
    'https://hospital.example.com',
    'https://patient-portal.example.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
  ].filter(Boolean);

  if (allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    };
  }
  
  return {};
}
```

---

## 📁 File Upload & Management

### **File Upload System**

```typescript
// File upload configuration
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/dicom',
    'text/plain'
  ],
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  patientAccessiblePath: './uploads/patient-accessible'
};

// File upload handler
export async function handleFileUpload(
  file: File,
  patientId: string,
  category: string,
  isPatientAccessible: boolean = true
) {
  // Validate file
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    throw new Error('File size exceeds limit');
  }
  
  if (!UPLOAD_CONFIG.allowedMimeTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2);
  const extension = file.name.split('.').pop();
  const filename = `${patientId}_${category}_${timestamp}_${randomString}.${extension}`;
  
  // Determine upload path
  const uploadPath = isPatientAccessible 
    ? UPLOAD_CONFIG.patientAccessiblePath 
    : UPLOAD_CONFIG.uploadPath;
  
  const filePath = path.join(uploadPath, filename);
  
  // Save file
  const buffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(buffer));
  
  // Create file record
  const fileRecord = {
    filename,
    originalName: file.name,
    url: `/api/files/${isPatientAccessible ? 'patient-accessible' : 'download'}/${filename}`,
    fileSize: file.size,
    mimeType: file.type,
    isPatientAccessible,
    uploadedDate: new Date()
  };
  
  return fileRecord;
}

// File download handler with access control
export async function handleFileDownload(
  filename: string,
  userId: string,
  userRole: string
) {
  const filePath = path.join(UPLOAD_CONFIG.uploadPath, filename);
  
  // Check if file exists
  if (!await fs.access(filePath).then(() => true).catch(() => false)) {
    throw new Error('File not found');
  }
  
  // Find associated record to check permissions
  const fileRecord = await findFileRecord(filename);
  
  if (!fileRecord) {
    throw new Error('File record not found');
  }
  
  // Check access permissions
  if (userRole === 'patient') {
    if (!fileRecord.isPatientAccessible) {
      throw new Error('Access denied');
    }
    
    // Verify patient ownership
    const hasAccess = await verifyPatientFileAccess(userId, fileRecord);
    if (!hasAccess) {
      throw new Error('Access denied');
    }
  }
  
  // Log file access
  await logFileAccess(filename, userId, 'download');
  
  // Return file
  const fileBuffer = await fs.readFile(filePath);
  return {
    buffer: fileBuffer,
    mimeType: fileRecord.mimeType,
    filename: fileRecord.originalName
  };
}
```

### **Image Processing for Medical Images**

```typescript
import sharp from 'sharp';

// Process medical images
export async function processMedicalImage(
  imageBuffer: Buffer,
  options: {
    resize?: { width: number; height: number };
    watermark?: boolean;
    anonymize?: boolean;
  } = {}
) {
  let processedImage = sharp(imageBuffer);
  
  // Resize if specified
  if (options.resize) {
    processedImage = processedImage.resize(
      options.resize.width,
      options.resize.height,
      { fit: 'inside', withoutEnlargement: true }
    );
  }
  
  // Add watermark for patient copies
  if (options.watermark) {
    const watermarkSvg = `
      <svg width="200" height="50">
        <text x="10" y="30" font-family="Arial" font-size="16" 
              fill="rgba(0,0,0,0.3)" transform="rotate(-15)">
          PATIENT COPY
        </text>
      </svg>
    `;
    
    processedImage = processedImage.composite([{
      input: Buffer.from(watermarkSvg),
      gravity: 'southeast'
    }]);
  }
  
  // Remove EXIF data for anonymization
  if (options.anonymize) {
    processedImage = processedImage.withMetadata({});
  }
  
  return await processedImage.jpeg({ quality: 90 }).toBuffer();
}
```

---

## 🔔 Notification System

### **Multi-Channel Notification Framework**

```typescript
// Notification types
interface NotificationConfig {
  type: 'email' | 'sms' | 'push' | 'in-app';
  template: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  recipients: string[];
  data: Record<string, any>;
  scheduledFor?: Date;
  retryAttempts?: number;
}

// Notification service
class NotificationService {
  async sendNotification(config: NotificationConfig) {
    try {
      switch (config.type) {
        case 'email':
          return await this.sendEmail(config);
        case 'sms':
          return await this.sendSMS(config);
        case 'push':
          return await this.sendPushNotification(config);
        case 'in-app':
          return await this.sendInAppNotification(config);
      }
    } catch (error) {
      await this.handleNotificationError(config, error);
    }
  }
  
  private async sendEmail(config: NotificationConfig) {
    const emailTemplate = await this.getEmailTemplate(config.template);
    const renderedContent = this.renderTemplate(emailTemplate, config.data);
    
    // Use your preferred email service (SendGrid, AWS SES, etc.)
    const result = await emailService.send({
      to: config.recipients,
      subject: renderedContent.subject,
      html: renderedContent.html,
      priority: config.priority
    });
    
    await this.logNotification(config, result);
    return result;
  }
  
  private async sendSMS(config: NotificationConfig) {
    const smsTemplate = await this.getSMSTemplate(config.template);
    const message = this.renderTemplate(smsTemplate, config.data);
    
    // Use SMS service (Twilio, AWS SNS, etc.)
    const result = await smsService.send({
      to: config.recipients,
      message: message.text
    });
    
    await this.logNotification(config, result);
    return result;
  }
}

// Notification templates
const NOTIFICATION_TEMPLATES = {
  appointmentReminder: {
    email: {
      subject: 'Appointment Reminder - {{appointmentDate}}',
      html: `
        <h2>Appointment Reminder</h2>
        <p>Dear {{patientName}},</p>
        <p>This is a reminder for your appointment:</p>
        <ul>
          <li>Date: {{appointmentDate}}</li>
          <li>Time: {{appointmentTime}}</li>
          <li>Doctor: {{doctorName}}</li>
          <li>Department: {{department}}</li>
        </ul>
        <p>Please arrive 15 minutes early.</p>
      `
    },
    sms: {
      text: 'Reminder: Your appointment with Dr. {{doctorName}} is on {{appointmentDate}} at {{appointmentTime}}. Please arrive 15 minutes early.'
    }
  },
  testResultAvailable: {
    email: {
      subject: 'Test Results Available',
      html: `
        <h2>Test Results Available</h2>
        <p>Dear {{patientName}},</p>
        <p>Your test results for {{testName}} are now available in your patient portal.</p>
        <p><a href="{{portalLink}}">View Results</a></p>
      `
    },
    sms: {
      text: 'Your test results for {{testName}} are available. Login to your patient portal to view them.'
    }
  },
  criticalValueAlert: {
    email: {
      subject: 'URGENT: Critical Test Result',
      html: `
        <h2 style="color: red;">CRITICAL VALUE ALERT</h2>
        <p>Patient: {{patientName}} ({{patientId}})</p>
        <p>Test: {{testName}}</p>
        <p>Critical Value: {{criticalValue}}</p>
        <p>Normal Range: {{normalRange}}</p>
        <p>Immediate action required.</p>
      `
    },
    sms: {
      text: 'CRITICAL: {{patientName}} - {{testName}}: {{criticalValue}} (Normal: {{normalRange}}). Immediate action required.'
    }
  }
};
```

### **Patient Portal Notifications**

```typescript
// Patient-specific notification preferences
const getPatientNotificationPreferences = async (patientId: string) => {
  const patient = await Patient.findById(patientId);
  return patient.portalAccess.preferences;
};

// Send patient notification based on preferences
const sendPatientNotification = async (
  patientId: string,
  template: string,
  data: Record<string, any>
) => {
  const patient = await Patient.findById(patientId);
  const preferences = patient.portalAccess.preferences;
  
  const notifications: NotificationConfig[] = [];
  
  if (preferences.receiveAppointmentReminders && template.includes('appointment')) {
    if (preferences.preferredContactMethod === 'email' || preferences.preferredContactMethod === 'both') {
      notifications.push({
        type: 'email',
        template,
        priority: 'normal',
        recipients: [patient.email],
        data: { ...data, patientName: patient.name }
      });
    }
    
    if (preferences.preferredContactMethod === 'sms' || preferences.preferredContactMethod === 'both') {
      notifications.push({
        type: 'sms',
        template,
        priority: 'normal',
        recipients: [patient.contactNumber],
        data: { ...data, patientName: patient.name }
      });
    }
  }
  
  // Send all notifications
  const notificationService = new NotificationService();
  for (const notification of notifications) {
    await notificationService.sendNotification(notification);
  }
};
```

---

## 📊 Audit Trail Implementation

### **Comprehensive Audit System**

```typescript
// Audit log entry structure
interface AuditLogEntry {
  userId: string;
  userRole: string;
  userName: string;
  action: string;
  actionType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'DOWNLOAD' | 'SHARE';
  resourceType: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  additionalData?: Record<string, any>;
}

// Audit logging service
class AuditService {
  async logAction(entry: AuditLogEntry) {
    try {
      // Create audit log entry
      const auditLog = new AuditLog({
        ...entry,
        timestamp: new Date()
      });
      
      await auditLog.save();
      
      // For critical actions, send immediate alerts
      if (entry.riskLevel === 'CRITICAL') {
        await this.sendCriticalAuditAlert(entry);
      }
      
      // Update user activity
      await this.updateUserActivity(entry.userId);
      
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw error to avoid breaking main operation
    }
  }
  
  async logPatientDataAccess(
    userId: string,
    patientId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    ipAddress: string
  ) {
    const patient = await Patient.findById(patientId);
    
    await this.logAction({
      userId,
      userRole: 'patient',
      userName: patient.name,
      action: `Accessed ${resourceType}: ${action}`,
      actionType: 'READ',
      resourceType,
      resourceId,
      ipAddress,
      userAgent: '',
      timestamp: new Date(),
      riskLevel: 'LOW',
      additionalData: {
        patientId,
        patientName: patient.name
      }
    });
  }
  
  private async sendCriticalAuditAlert(entry: AuditLogEntry) {
    const alertData = {
      action: entry.action,
      user: entry.userName,
      resource: `${entry.resourceType}:${entry.resourceId}`,
      timestamp: entry.timestamp,
      ipAddress: entry.ipAddress
    };
    
    await new NotificationService().sendNotification({
      type: 'email',
      template: 'criticalAuditAlert',
      priority: 'critical',
      recipients: await this.getSecurityTeamEmails(),
      data: alertData
    });
  }
}

// Audit middleware for API routes
export function auditMiddleware(
  resourceType: string,
  actionType: AuditLogEntry['actionType']
) {
  return async (request: NextRequest, response: NextResponse) => {
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;
    
    const auditService = new AuditService();
    
    // Log the action
    await auditService.logAction({
      userId: auth.user.id,
      userRole: auth.user.role,
      userName: auth.user.name,
      action: `${actionType} ${resourceType}`,
      actionType,
      resourceType,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || '',
      timestamp: new Date(),
      riskLevel: determineRiskLevel(actionType, resourceType, auth.user.role)
    });
    
    return response;
  };
}

// Risk level determination
function determineRiskLevel(
  actionType: string,
  resourceType: string,
  userRole: string
): AuditLogEntry['riskLevel'] {
  // Critical actions
  if (actionType === 'DELETE' && ['Patient', 'MedicalRecord'].includes(resourceType)) {
    return 'CRITICAL';
  }
  
  // High risk actions
  if (actionType === 'UPDATE' && resourceType === 'User' && userRole !== 'super-admin') {
    return 'HIGH';
  }
  
  if (actionType === 'DOWNLOAD' && ['TestReport', 'MedicalRecord'].includes(resourceType)) {
    return 'HIGH';
  }
  
  // Medium risk actions
  if (actionType === 'CREATE' && ['Prescription', 'MedicalRecord'].includes(resourceType)) {
    return 'MEDIUM';
  }
  
  // Default to low risk
  return 'LOW';
}
```

### **Audit Report Generation**

```typescript
// Generate audit reports
class AuditReportService {
  async generateUserActivityReport(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    const activities = await AuditLog.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: -1 });
    
    const summary = {
      totalActions: activities.length,
      actionsByType: this.groupByActionType(activities),
      riskLevelDistribution: this.groupByRiskLevel(activities),
      resourcesAccessed: this.getUniqueResources(activities),
      timelineData: this.generateTimeline(activities)
    };
    
    return { activities, summary };
  }
  
  async generatePatientAccessReport(patientId: string) {
    const accessLogs = await AuditLog.find({
      'additionalData.patientId': patientId
    }).populate('userId', 'name role').sort({ timestamp: -1 });
    
    return {
      totalAccesses: accessLogs.length,
      uniqueUsers: [...new Set(accessLogs.map(log => log.userId))].length,
      accessByResource: this.groupByResourceType(accessLogs),
      recentAccesses: accessLogs.slice(0, 20)
    };
  }
  
  async generateSecurityReport(startDate: Date, endDate: Date) {
    const criticalActions = await AuditLog.find({
      riskLevel: 'CRITICAL',
      timestamp: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name role');
    
    const failedLogins = await AuditLog.find({
      actionType: 'LOGIN_FAILED',
      timestamp: { $gte: startDate, $lte: endDate }
    });
    
    const suspiciousActivities = await this.detectSuspiciousActivities(startDate, endDate);
    
    return {
      criticalActions,
      failedLogins,
      suspiciousActivities,
      recommendations: this.generateSecurityRecommendations(criticalActions, failedLogins)
    };
  }
  
  private async detectSuspiciousActivities(startDate: Date, endDate: Date) {
    // Detect unusual patterns
    const suspiciousPatterns = await AuditLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            ipAddress: '$ipAddress',
            hour: { $hour: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 100 } // More than 100 actions per hour
        }
      }
    ]);
    
    return suspiciousPatterns;
  }
}
```

---

## ⚡ Performance Optimization

### **Database Optimization**

```typescript
// Optimized queries with proper indexing
class OptimizedQueries {
  // Efficient patient search with text indexing
  static async searchPatients(query: string, limit: number = 20) {
    return await Patient.find({
      $text: { $search: query }
    }, {
      score: { $meta: 'textScore' }
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .select('name patientId contactNumber email')
    .lean(); // Use lean() for read-only operations
  }
  
  // Efficient appointment loading with aggregation
  static async getDoctorSchedule(doctorId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await Appointment.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId),
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $nin: ['cancelled', 'no-show'] }
        }
      },
      {
        $lookup: {
          from: 'patients',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patient',
          pipeline: [
            { $project: { name: 1, patientId: 1, contactNumber: 1 } }
          ]
        }
      },
      {
        $unwind: '$patient'
      },
      {
        $sort: { appointmentTime: 1 }
      }
    ]);
  }
  
  // Efficient medical record retrieval with pagination
  static async getPatientMedicalHistory(
    patientId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    
    const [records, total] = await Promise.all([
      MedicalRecord.find({ 
        patientId,
        'patientAccess.isAccessible': true 
      })
      .populate('doctorId', 'name specialization')
      .sort({ encounterDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
      
      MedicalRecord.countDocuments({ 
        patientId,
        'patientAccess.isAccessible': true 
      })
    ]);
    
    return {
      records,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }
}

// Connection pooling and caching
const mongooseOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0 // Disable mongoose buffering
};

// Redis caching for frequently accessed data
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

class CacheService {
  static async get(key: string) {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  static async set(key: string, value: any, ttl: number = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  static async invalidate(pattern: string) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

// Cached data access
const getCachedPatientData = async (patientId: string) => {
  const cacheKey = `patient:${patientId}`;
  
  let patientData = await CacheService.get(cacheKey);
  
  if (!patientData) {
    patientData = await Patient.findById(patientId).lean();
    await CacheService.set(cacheKey, patientData, 1800); // 30 minutes
  }
  
  return patientData;
};
```

### **API Response Optimization**

```typescript
// Response compression and optimization
import compression from 'compression';

// Paginated response helper
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  additionalData?: Record<string, any>
) {
  return {
    success: true,
    data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      recordsPerPage: limit,
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    ...additionalData
  };
}

// Optimized JSON responses
export function optimizeResponse(data: any) {
  // Remove null and undefined values
  const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    return value;
  }));
  
  return cleanData;
}

// Streaming large responses
export async function streamLargeDataset(
  query: any,
  response: NextResponse
) {
  const stream = new ReadableStream({
    async start(controller) {
      const cursor = query.cursor();
      
      controller.enqueue(new TextEncoder().encode('{"data":['));
      
      let isFirst = true;
      
      for await (const doc of cursor) {
        if (!isFirst) {
          controller.enqueue(new TextEncoder().encode(','));
        }
        
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(doc))
        );
        
        isFirst = false;
      }
      
      controller.enqueue(new TextEncoder().encode(']}'));
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked'
    }
  });
}
```

This completes the comprehensive Backend Development Guide for the Hospital Management System. The guide covers all aspects needed to build a robust, secure, and scalable backend that supports the patient portal features and maintains professional healthcare standards.
