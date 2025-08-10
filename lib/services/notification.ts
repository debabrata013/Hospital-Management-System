import nodemailer from 'nodemailer';
import AuditLog from '@/models/AuditLog';

export interface NotificationData {
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  recipients: string[];
  subject?: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'PHARMACY' | 'BILLING' | 'MEDICAL' | 'SYSTEM' | 'ALERT';
  metadata?: Record<string, any>;
}

export interface AuditLogData {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  details: Record<string, any>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress?: string;
  userAgent?: string;
}

export class NotificationService {
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter() {
    try {
      // Initialize email transporter with environment variables
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  // ==================== NOTIFICATION METHODS ====================

  async sendNotification(notificationData: NotificationData): Promise<boolean> {
    try {
      const results = await Promise.allSettled([
        this.sendEmailNotification(notificationData),
        this.sendInAppNotification(notificationData),
        // Add SMS and Push notifications as needed
      ]);

      // Log notification attempt
      await this.logNotificationAttempt(notificationData, results);

      // Return true if at least one notification method succeeded
      return results.some(result => result.status === 'fulfilled' && result.value === true);
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  private async sendEmailNotification(data: NotificationData): Promise<boolean> {
    if (data.type !== 'EMAIL' || !this.emailTransporter) {
      return false;
    }

    try {
      const emailOptions = {
        from: process.env.SMTP_FROM || 'noreply@hospital.com',
        to: data.recipients.join(', '),
        subject: data.subject || 'Hospital Management System Notification',
        html: this.generateEmailTemplate(data),
        priority: this.getEmailPriority(data.priority)
      };

      await this.emailTransporter.sendMail(emailOptions);
      return true;
    } catch (error) {
      console.error('Email notification failed:', error);
      return false;
    }
  }

  private async sendInAppNotification(data: NotificationData): Promise<boolean> {
    try {
      // Store in-app notification in database
      // This would typically be stored in a notifications collection
      // For now, we'll just log it
      console.log('In-app notification:', {
        recipients: data.recipients,
        message: data.message,
        category: data.category,
        priority: data.priority,
        timestamp: new Date()
      });
      return true;
    } catch (error) {
      console.error('In-app notification failed:', error);
      return false;
    }
  }

  private generateEmailTemplate(data: NotificationData): string {
    const priorityColor = {
      LOW: '#10B981',
      MEDIUM: '#F59E0B',
      HIGH: '#EF4444',
      URGENT: '#DC2626'
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${data.subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EC4899, #BE185D); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .priority { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🏥 आरोग्य अस्पताल</h2>
              <p>${data.category} Notification</p>
            </div>
            <div class="content">
              <div style="margin-bottom: 15px;">
                <span class="priority" style="background-color: ${priorityColor[data.priority]}">
                  ${data.priority} PRIORITY
                </span>
              </div>
              <div style="font-size: 16px; margin-bottom: 20px;">
                ${data.message}
              </div>
              ${data.metadata ? `
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid ${priorityColor[data.priority]};">
                  <strong>Additional Details:</strong>
                  <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${JSON.stringify(data.metadata, null, 2)}</pre>
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>This is an automated notification from the Hospital Management System.</p>
              <p>Timestamp: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getEmailPriority(priority: string): 'high' | 'normal' | 'low' {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return 'high';
      case 'MEDIUM':
        return 'normal';
      default:
        return 'low';
    }
  }

  private async logNotificationAttempt(data: NotificationData, results: PromiseSettledResult<boolean>[]): Promise<void> {
    try {
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      const failureCount = results.length - successCount;

      console.log('Notification attempt logged:', {
        category: data.category,
        priority: data.priority,
        recipients: data.recipients.length,
        successCount,
        failureCount,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to log notification attempt:', error);
    }
  }

  // ==================== AUDIT LOG METHODS ====================

  async logAuditTrail(auditData: AuditLogData): Promise<void> {
    try {
      const auditLog = new AuditLog({
        action: auditData.action,
        entityType: auditData.entityType,
        entityId: auditData.entityId,
        userId: auditData.userId,
        details: auditData.details,
        riskLevel: auditData.riskLevel,
        ipAddress: auditData.ipAddress || 'unknown',
        userAgent: auditData.userAgent || 'unknown',
        timestamp: new Date()
      });

      await auditLog.save();

      // Send high-risk alerts
      if (auditData.riskLevel === 'HIGH' || auditData.riskLevel === 'CRITICAL') {
        await this.sendSecurityAlert(auditData);
      }
    } catch (error) {
      console.error('Failed to log audit trail:', error);
    }
  }

  private async sendSecurityAlert(auditData: AuditLogData): Promise<void> {
    try {
      const alertData: NotificationData = {
        type: 'EMAIL',
        recipients: [
          process.env.SECURITY_ALERT_EMAIL || 'security@hospital.com',
          process.env.ADMIN_EMAIL || 'admin@hospital.com'
        ],
        subject: `🚨 Security Alert: ${auditData.riskLevel} Risk Action Detected`,
        message: `
          A ${auditData.riskLevel.toLowerCase()} risk action has been detected in the system.
          
          Action: ${auditData.action}
          Entity: ${auditData.entityType} (${auditData.entityId})
          User: ${auditData.userId}
          IP Address: ${auditData.ipAddress}
          
          Please review this activity immediately.
        `,
        priority: auditData.riskLevel === 'CRITICAL' ? 'URGENT' : 'HIGH',
        category: 'SYSTEM',
        metadata: auditData.details
      };

      await this.sendNotification(alertData);
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  // ==================== PHARMACY-SPECIFIC NOTIFICATIONS ====================

  async sendLowStockAlert(medicines: any[]): Promise<void> {
    const alertData: NotificationData = {
      type: 'EMAIL',
      recipients: [
        process.env.PHARMACY_EMAIL || 'pharmacy@hospital.com',
        process.env.INVENTORY_EMAIL || 'inventory@hospital.com'
      ],
      subject: '⚠️ Low Stock Alert - Immediate Action Required',
      message: `
        The following medicines are running low on stock and require immediate attention:
        
        ${medicines.map(med => `• ${med.medicineName} - Current: ${med.inventory.currentStock}, Min: ${med.inventory.reorderLevel}`).join('\n')}
        
        Please reorder these medicines as soon as possible to avoid stockouts.
      `,
      priority: 'HIGH',
      category: 'PHARMACY',
      metadata: { medicines: medicines.map(m => ({ id: m._id, name: m.medicineName, stock: m.inventory.currentStock })) }
    };

    await this.sendNotification(alertData);
  }

  async sendExpiryAlert(medicines: any[]): Promise<void> {
    const alertData: NotificationData = {
      type: 'EMAIL',
      recipients: [
        process.env.PHARMACY_EMAIL || 'pharmacy@hospital.com'
      ],
      subject: '📅 Medicine Expiry Alert',
      message: `
        The following medicines are expiring soon and need attention:
        
        ${medicines.map(med => `• ${med.medicineName} (Batch: ${med.batchNo}) - Expires: ${new Date(med.expiryDate).toLocaleDateString()}`).join('\n')}
        
        Please review and take appropriate action (return, discount, or dispose).
      `,
      priority: 'MEDIUM',
      category: 'PHARMACY',
      metadata: { medicines }
    };

    await this.sendNotification(alertData);
  }

  async sendPrescriptionAlert(prescription: any, alertType: 'DISPENSED' | 'CANCELLED' | 'MODIFIED'): Promise<void> {
    const alertData: NotificationData = {
      type: 'EMAIL',
      recipients: [prescription.doctorEmail, prescription.patientEmail].filter(Boolean),
      subject: `Prescription ${alertType.toLowerCase()} - ${prescription.prescriptionId}`,
      message: `
        Prescription ${prescription.prescriptionId} has been ${alertType.toLowerCase()}.
        
        Patient: ${prescription.patientName}
        Doctor: ${prescription.doctorName}
        Date: ${new Date(prescription.prescriptionDate).toLocaleDateString()}
        
        ${alertType === 'DISPENSED' ? 'All prescribed medicines have been dispensed successfully.' : 
          alertType === 'CANCELLED' ? 'This prescription has been cancelled.' :
          'This prescription has been modified. Please review the changes.'}
      `,
      priority: 'MEDIUM',
      category: 'PHARMACY',
      metadata: { prescription }
    };

    await this.sendNotification(alertData);
  }

  // ==================== UTILITY METHODS ====================

  async testNotificationSystem(): Promise<{ email: boolean; inApp: boolean }> {
    const testData: NotificationData = {
      type: 'EMAIL',
      recipients: [process.env.TEST_EMAIL || 'test@hospital.com'],
      subject: 'Test Notification - Hospital Management System',
      message: 'This is a test notification to verify the notification system is working correctly.',
      priority: 'LOW',
      category: 'SYSTEM'
    };

    const emailResult = await this.sendEmailNotification(testData);
    const inAppResult = await this.sendInAppNotification(testData);

    return { email: emailResult, inApp: inAppResult };
  }
}
