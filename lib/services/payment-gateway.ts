/**
 * Payment Gateway Service
 * 
 * This service provides a unified interface for payment processing
 * Currently implements mock functionality but structured for real gateway integration
 */

export interface PaymentRequest {
  amount: number;
  paymentMode: string;
  billId: string;
  patientId: string;
  currency?: string;
  
  // Card payment details
  cardDetails?: {
    last4Digits: string;
    cardType: 'Credit' | 'Debit';
  };
  
  // UPI payment details
  upiDetails?: {
    upiId: string;
    transactionRef: string;
  };
  
  // Net banking details
  bankDetails?: {
    bankCode: string;
    accountNumber?: string;
  };
  
  // Insurance details
  insuranceDetails?: {
    provider: string;
    policyNumber: string;
    claimNumber?: string;
    approvalCode?: string;
    coveragePercentage: number;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  bankReference?: string;
  gatewayResponse?: any;
  error?: string;
  status: 'success' | 'failed' | 'pending';
}

export class PaymentGatewayService {
  private readonly isProduction: boolean;
  private readonly gatewayConfig: any;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.gatewayConfig = {
      // Razorpay Configuration
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
      },
      
      // PayU Configuration
      payu: {
        merchantKey: process.env.PAYU_MERCHANT_KEY,
        merchantSalt: process.env.PAYU_MERCHANT_SALT
      },
      
      // UPI Configuration
      upi: {
        merchantId: process.env.UPI_MERCHANT_ID,
        merchantKey: process.env.UPI_MERCHANT_KEY
      }
    };
  }

  /**
   * Process payment through appropriate gateway
   */
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In development/testing, use mock responses
      if (!this.isProduction || process.env.USE_MOCK_PAYMENTS === 'true') {
        return this.mockPaymentProcessing(paymentRequest);
      }

      // Route to appropriate payment processor
      switch (paymentRequest.paymentMode) {
        case 'card':
          return await this.processCardPayment(paymentRequest);
        case 'UPI':
          return await this.processUPIPayment(paymentRequest);
        case 'net-banking':
          return await this.processNetBankingPayment(paymentRequest);
        case 'insurance':
          return await this.processInsurancePayment(paymentRequest);
        default:
          throw new Error(`Unsupported payment mode: ${paymentRequest.paymentMode}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Mock payment processing for development/testing
   */
  private async mockPaymentProcessing(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate mock transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const bankReference = `REF_${Date.now()}`;

    // Simulate different payment outcomes based on amount
    const lastDigit = Math.floor(paymentRequest.amount) % 10;
    
    // 90% success rate, 5% pending, 5% failure
    let status: 'success' | 'failed' | 'pending';
    if (lastDigit === 9) {
      status = 'failed';
    } else if (lastDigit === 8) {
      status = 'pending';
    } else {
      status = 'success';
    }

    const mockResponse = {
      success: status === 'success',
      transactionId,
      bankReference,
      status,
      gatewayResponse: {
        gateway: 'MOCK_GATEWAY',
        paymentMode: paymentRequest.paymentMode,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency || 'INR',
        timestamp: new Date().toISOString(),
        mockData: true
      }
    };

    if (status === 'failed') {
      mockResponse.gatewayResponse.errorCode = 'INSUFFICIENT_FUNDS';
      mockResponse.gatewayResponse.errorMessage = 'Insufficient funds in account';
    }

    return mockResponse;
  }

  /**
   * Process card payment through Razorpay
   */
  private async processCardPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // This would integrate with actual Razorpay API
      const razorpayOrder = {
        amount: paymentRequest.amount * 100, // Convert to paise
        currency: paymentRequest.currency || 'INR',
        receipt: `bill_${paymentRequest.billId}`,
        payment_capture: 1
      };

      // Mock Razorpay response structure
      const response = {
        success: true,
        transactionId: `rzp_${Date.now()}`,
        bankReference: `bank_${Date.now()}`,
        status: 'success' as const,
        gatewayResponse: {
          gateway: 'RAZORPAY',
          orderId: `order_${Date.now()}`,
          paymentId: `pay_${Date.now()}`,
          ...razorpayOrder
        }
      };

      return response;
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: 'Card payment processing failed'
      };
    }
  }

  /**
   * Process UPI payment
   */
  private async processUPIPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate UPI ID format
      if (!paymentRequest.upiDetails?.upiId) {
        throw new Error('UPI ID is required for UPI payments');
      }

      // Mock UPI processing
      const response = {
        success: true,
        transactionId: `upi_${Date.now()}`,
        bankReference: `upi_ref_${Date.now()}`,
        status: 'success' as const,
        gatewayResponse: {
          gateway: 'UPI',
          upiId: paymentRequest.upiDetails.upiId,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency || 'INR'
        }
      };

      return response;
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: 'UPI payment processing failed'
      };
    }
  }

  /**
   * Process net banking payment
   */
  private async processNetBankingPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Mock net banking processing
      const response = {
        success: true,
        transactionId: `nb_${Date.now()}`,
        bankReference: `nb_ref_${Date.now()}`,
        status: 'success' as const,
        gatewayResponse: {
          gateway: 'NET_BANKING',
          amount: paymentRequest.amount,
          currency: paymentRequest.currency || 'INR'
        }
      };

      return response;
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: 'Net banking payment processing failed'
      };
    }
  }

  /**
   * Process insurance payment
   */
  private async processInsurancePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (!paymentRequest.insuranceDetails) {
        throw new Error('Insurance details are required for insurance payments');
      }

      // Mock insurance processing
      const coverageAmount = (paymentRequest.amount * paymentRequest.insuranceDetails.coveragePercentage) / 100;
      
      const response = {
        success: true,
        transactionId: `ins_${Date.now()}`,
        bankReference: `ins_ref_${Date.now()}`,
        status: 'success' as const,
        gatewayResponse: {
          gateway: 'INSURANCE',
          provider: paymentRequest.insuranceDetails.provider,
          policyNumber: paymentRequest.insuranceDetails.policyNumber,
          claimNumber: paymentRequest.insuranceDetails.claimNumber || `CLM_${Date.now()}`,
          coverageAmount,
          patientPayable: paymentRequest.amount - coverageAmount
        }
      };

      return response;
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: 'Insurance payment processing failed'
      };
    }
  }

  /**
   * Verify payment status (webhook handler)
   */
  async verifyPayment(transactionId: string, gatewayData: any): Promise<PaymentResponse> {
    try {
      // This would verify payment with the actual gateway
      // For now, return mock verification
      return {
        success: true,
        transactionId,
        status: 'success',
        gatewayResponse: {
          verified: true,
          verificationTime: new Date().toISOString(),
          ...gatewayData
        }
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: 'Payment verification failed'
      };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(transactionId: string, amount: number, reason: string): Promise<PaymentResponse> {
    try {
      // Mock refund processing
      const refundId = `refund_${Date.now()}`;
      
      return {
        success: true,
        transactionId: refundId,
        status: 'success',
        gatewayResponse: {
          originalTransactionId: transactionId,
          refundId,
          refundAmount: amount,
          reason,
          refundStatus: 'processed',
          estimatedSettlement: '3-5 business days'
        }
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: 'Refund processing failed'
      };
    }
  }

  /**
   * Get payment methods configuration
   */
  getPaymentMethods(): any {
    return {
      cash: {
        enabled: true,
        displayName: 'Cash Payment',
        icon: 'cash'
      },
      card: {
        enabled: true,
        displayName: 'Credit/Debit Card',
        icon: 'credit-card',
        supportedCards: ['VISA', 'MASTERCARD', 'RUPAY']
      },
      UPI: {
        enabled: true,
        displayName: 'UPI Payment',
        icon: 'smartphone',
        supportedApps: ['PhonePe', 'Google Pay', 'Paytm', 'BHIM']
      },
      'net-banking': {
        enabled: true,
        displayName: 'Net Banking',
        icon: 'building',
        supportedBanks: ['SBI', 'HDFC', 'ICICI', 'AXIS', 'PNB']
      },
      insurance: {
        enabled: true,
        displayName: 'Insurance',
        icon: 'shield',
        note: 'Subject to policy terms and approval'
      }
    };
  }
}

export default PaymentGatewayService;
