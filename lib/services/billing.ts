import models from '@/models';
const { Billing, Patient, User, AuditLog } = (models as any);
import { PaymentGatewayService } from './payment-gateway';
import { NotificationService } from './notification';

export interface BillCalculation {
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  error?: string;
  gatewayResponse?: any;
}

export class BillingService {
  private paymentGateway: PaymentGatewayService;
  private notificationService: NotificationService;

  constructor() {
    this.paymentGateway = new PaymentGatewayService();
    this.notificationService = new NotificationService();
  }

  /**
   * Calculate bill totals including taxes and discounts
   */
  calculateBillTotals(items: any[], discount: any = {}): BillCalculation {
    const subtotal = items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);

    const totalTax = items.reduce((total, item) => {
      const itemAmount = item.quantity * item.unitPrice;
      const taxAmount = (itemAmount * (item.taxRate || 0)) / 100;
      return total + taxAmount;
    }, 0);

    const totalAmount = subtotal + totalTax;
    
    let discountAmount = 0;
    if (discount.percentage && discount.percentage > 0) {
      discountAmount = (totalAmount * discount.percentage) / 100;
    } else if (discount.amount && discount.amount > 0) {
      discountAmount = discount.amount;
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    return {
      subtotal,
      totalTax,
      totalAmount,
      discountAmount,
      finalAmount
    };
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoiceData: any, generatedBy: string): Promise<any> {
    try {
      // Calculate totals
      const calculations = this.calculateBillTotals(invoiceData.items, invoiceData.discount);
      
      // Prepare bill items with calculated tax amounts
      const processedItems = invoiceData.items.map((item: any) => {
        const itemAmount = item.quantity * item.unitPrice;
        const taxAmount = (itemAmount * (item.taxRate || 0)) / 100;
        
        return {
          ...item,
          amount: itemAmount,
          taxAmount
        };
      });

      // Create bill document
      const billData = {
        patientId: invoiceData.patientId,
        appointmentId: invoiceData.appointmentId,
        admissionId: invoiceData.admissionId,
        items: processedItems,
        subtotal: calculations.subtotal,
        totalTax: calculations.totalTax,
        totalAmount: calculations.totalAmount,
        finalAmount: calculations.finalAmount,
        discount: {
          amount: calculations.discountAmount,
          percentage: invoiceData.discount?.percentage || 0,
          reason: invoiceData.discount?.reason
        },
        dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        generatedBy,
        notes: invoiceData.notes,
        status: 'pending'
      };

      const bill = new Billing(billData);
      await bill.save();

      // Populate references
      await bill.populate([
        { path: 'patientId', select: 'name patientId contactNumber email' },
        { path: 'generatedBy', select: 'name employeeId' }
      ]);

      // Log audit trail
      await this.logBillingActivity('CREATE_INVOICE', generatedBy, bill._id, {
        billId: bill.billId,
        patientId: bill.patientId._id,
        amount: bill.finalAmount
      });

      // Send notification to patient (if email available)
      if (bill.patientId.email) {
        await this.notificationService.sendBillGeneratedNotification(bill);
      }

      return bill;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  /**
   * Process payment for a bill
   */
  async processPayment(
    billId: string, 
    paymentData: any, 
    receivedBy: string
  ): Promise<PaymentResult> {
    try {
      const bill = await Billing.findById(billId);
      if (!bill) {
        throw new Error('Bill not found');
      }

      if (bill.status === 'paid') {
        throw new Error('Bill is already fully paid');
      }

      // Validate payment amount
      if (paymentData.amount > bill.outstandingAmount) {
        throw new Error('Payment amount exceeds outstanding balance');
      }

      let gatewayResult: any = null;

      // Process payment through gateway for non-cash payments
      if (paymentData.paymentMode !== 'cash') {
        gatewayResult = await this.paymentGateway.processPayment({
          amount: paymentData.amount,
          paymentMode: paymentData.paymentMode,
          billId: bill.billId,
          patientId: bill.patientId.toString(),
          ...paymentData
        });

        if (!gatewayResult.success) {
          return {
            success: false,
            error: gatewayResult.error || 'Payment processing failed'
          };
        }
      }

      // Add payment to bill
      const paymentRecord = {
        amount: paymentData.amount,
        paymentMode: paymentData.paymentMode,
        transactionId: gatewayResult?.transactionId || `CASH_${Date.now()}`,
        bankReference: gatewayResult?.bankReference,
        cardDetails: paymentData.cardDetails,
        upiDetails: paymentData.upiDetails,
        insuranceDetails: paymentData.insuranceDetails,
        chequeDetails: paymentData.chequeDetails,
        receivedBy,
        status: 'Completed',
        notes: paymentData.notes
      };

      await bill.addPayment(paymentRecord);

      // Log audit trail
      await this.logBillingActivity('PROCESS_PAYMENT', receivedBy, bill._id, {
        billId: bill.billId,
        paymentAmount: paymentData.amount,
        paymentMode: paymentData.paymentMode,
        transactionId: paymentRecord.transactionId
      });

      // Send payment confirmation
      if (bill.patientId.email) {
        await this.notificationService.sendPaymentConfirmation(bill, paymentRecord);
      }

      return {
        success: true,
        paymentId: paymentRecord.paymentId,
        transactionId: paymentRecord.transactionId,
        gatewayResponse: gatewayResult
      };

    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Apply discount to a bill
   */
  async applyDiscount(
    billId: string,
    discountData: any,
    approvedBy: string
  ): Promise<any> {
    try {
      const bill = await Billing.findById(billId);
      if (!bill) {
        throw new Error('Bill not found');
      }

      if (bill.status === 'paid') {
        throw new Error('Cannot apply discount to a paid bill');
      }

      // Calculate new discount amount
      let discountAmount = 0;
      if (discountData.discountType === 'percentage') {
        discountAmount = (bill.totalAmount * discountData.discountValue) / 100;
      } else {
        discountAmount = discountData.discountValue;
      }

      // Validate discount amount
      if (discountAmount > bill.totalAmount) {
        throw new Error('Discount amount cannot exceed bill total');
      }

      // Apply discount
      await bill.applyDiscount({
        amount: discountAmount,
        percentage: discountData.discountType === 'percentage' ? discountData.discountValue : 0,
        reason: discountData.reason
      }, approvedBy);

      // Log audit trail
      await this.logBillingActivity('APPLY_DISCOUNT', approvedBy, bill._id, {
        billId: bill.billId,
        discountAmount,
        discountType: discountData.discountType,
        reason: discountData.reason
      });

      return bill;
    } catch (error) {
      console.error('Error applying discount:', error);
      throw new Error('Failed to apply discount');
    }
  }

  /**
   * Generate financial reports
   */
  async generateFinancialReport(queryParams: any): Promise<any> {
    try {
      const { startDate, endDate, reportType, groupBy } = queryParams;
      
      const matchQuery: any = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      // Add optional filters
      if (queryParams.patientId) {
        matchQuery.patientId = queryParams.patientId;
      }

      if (queryParams.department) {
        matchQuery['items.category'] = queryParams.department;
      }

      // Base aggregation pipeline
      const pipeline: any[] = [
        { $match: matchQuery },
        {
          $lookup: {
            from: 'patients',
            localField: 'patientId',
            foreignField: '_id',
            as: 'patient'
          }
        },
        { $unwind: '$patient' }
      ];

      // Group by specified field
      let groupStage: any = {
        _id: null,
        totalRevenue: { $sum: '$finalAmount' },
        totalBills: { $sum: 1 },
        totalPaid: { $sum: '$totalPaid' },
        totalOutstanding: { $sum: '$outstandingAmount' },
        averageBillAmount: { $avg: '$finalAmount' }
      };

      if (groupBy === 'date') {
        groupStage._id = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
      } else if (groupBy === 'paymentMode') {
        pipeline.push({ $unwind: '$payments' });
        groupStage._id = '$payments.paymentMode';
        groupStage.totalRevenue = { $sum: '$payments.amount' };
      } else if (groupBy === 'category') {
        pipeline.push({ $unwind: '$items' });
        groupStage._id = '$items.category';
        groupStage.totalRevenue = { $sum: '$items.amount' };
      }

      pipeline.push({ $group: groupStage });
      pipeline.push({ $sort: { '_id': 1 } });

      const results = await Billing.aggregate(pipeline);

      // Calculate summary statistics
      const summary = {
        totalRevenue: results.reduce((sum, item) => sum + item.totalRevenue, 0),
        totalBills: results.reduce((sum, item) => sum + item.totalBills, 0),
        totalPaid: results.reduce((sum, item) => sum + (item.totalPaid || 0), 0),
        totalOutstanding: results.reduce((sum, item) => sum + (item.totalOutstanding || 0), 0),
        averageBillAmount: results.length > 0 ? 
          results.reduce((sum, item) => sum + item.averageBillAmount, 0) / results.length : 0
      };

      return {
        reportType,
        period: { startDate, endDate },
        summary,
        data: results,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating financial report:', error);
      throw new Error('Failed to generate financial report');
    }
  }

  /**
   * Get outstanding payments
   */
  async getOutstandingPayments(queryParams: any): Promise<any> {
    try {
      const {
        patientId,
        overdueDays,
        minAmount,
        maxAmount,
        sortBy,
        sortOrder,
        page,
        limit
      } = queryParams;

      const matchQuery: any = {
        status: { $in: ['pending', 'partial'] },
        outstandingAmount: { $gt: 0 }
      };

      // Add filters
      if (patientId) {
        matchQuery.patientId = patientId;
      }

      if (overdueDays !== undefined) {
        const overdueDate = new Date();
        overdueDate.setDate(overdueDate.getDate() - overdueDays);
        matchQuery.dueDate = { $lt: overdueDate };
      }

      if (minAmount !== undefined || maxAmount !== undefined) {
        matchQuery.outstandingAmount = {};
        if (minAmount !== undefined) {
          matchQuery.outstandingAmount.$gte = minAmount;
        }
        if (maxAmount !== undefined) {
          matchQuery.outstandingAmount.$lte = maxAmount;
        }
      }

      // Build sort object
      const sortObj: any = {};
      sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;

      const [bills, total] = await Promise.all([
        Billing.find(matchQuery)
          .populate('patientId', 'name patientId contactNumber email')
          .populate('generatedBy', 'name employeeId')
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .lean(),
        Billing.countDocuments(matchQuery)
      ]);

      return {
        bills,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          recordsPerPage: limit,
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        summary: {
          totalOutstanding: bills.reduce((sum, bill) => sum + bill.outstandingAmount, 0),
          totalBills: bills.length
        }
      };

    } catch (error) {
      console.error('Error getting outstanding payments:', error);
      throw new Error('Failed to retrieve outstanding payments');
    }
  }

  /**
   * Log billing activity for audit trail
   */
  private async logBillingActivity(
    action: string,
    userId: string,
    billId: string,
    additionalData: any
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      
      await AuditLog.create({
        userId,
        userRole: user?.role || 'unknown',
        userName: user?.name || 'Unknown User',
        action: `Billing: ${action}`,
        actionType: action.includes('CREATE') ? 'CREATE' : 
                   action.includes('UPDATE') ? 'UPDATE' : 'READ',
        resourceType: 'Billing',
        resourceId: billId,
        additionalData,
        timestamp: new Date(),
        riskLevel: action.includes('DISCOUNT') ? 'HIGH' : 'MEDIUM'
      });
    } catch (error) {
      console.error('Failed to log billing activity:', error);
    }
  }
}

export default BillingService;
