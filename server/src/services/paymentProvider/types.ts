export interface CreateOrderParams {
  amount: number; // in standard currency units (e.g. 1000)
  minorUnits: number; // in minor units (e.g. 100000 paise / cents)
  currency: 'INR' | 'USD';
  receiptId: string;
  notes?: Record<string, string>;
}

export interface ProviderOrderResult {
  providerOrderId: string;
  amount: number;
  minorUnits: number;
  currency: 'INR' | 'USD';
  status: 'created' | 'attempted' | 'paid';
  checkoutKeyId: string;
  metadata?: Record<string, unknown>;
}

export interface VerifyPaymentParams {
  providerOrderId: string;
  providerPaymentId: string;
  providerSignature: string;
  expectedMinorUnits: number;
  expectedCurrency: 'INR' | 'USD';
}

export interface VerifyPaymentResult {
  verified: boolean;
  providerPaymentId: string;
  providerOrderId: string;
  amount: number;
  minorUnits: number;
  currency: 'INR' | 'USD';
  status: 'captured' | 'authorized' | 'failed';
  method?: string;
  failureReason?: string;
  rawResponse?: Record<string, unknown>;
}

export interface CreateRefundParams {
  providerPaymentId: string;
  amount: number;
  minorUnits: number;
  currency: 'INR' | 'USD';
  reason?: string;
  notes?: Record<string, string>;
}

export interface RefundResult {
  providerRefundId: string;
  providerPaymentId: string;
  amount: number;
  minorUnits: number;
  currency: 'INR' | 'USD';
  status: 'processed' | 'pending' | 'failed';
  rawResponse?: Record<string, unknown>;
}

export interface CreatePayoutParams {
  userId: string;
  amount: number;
  minorUnits: number;
  currency: 'INR' | 'USD';
  method: 'BANK_TRANSFER' | 'UPI' | 'PAYPAL';
  accountDetailsReference: string;
  referenceId: string;
}

export interface PayoutResult {
  providerPayoutId: string;
  amount: number;
  minorUnits: number;
  currency: 'INR' | 'USD';
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  rawResponse?: Record<string, unknown>;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  eventType: string;
  providerEventId: string;
  data: {
    providerPaymentId?: string;
    providerOrderId?: string;
    amount?: number;
    minorUnits?: number;
    currency?: string;
    status?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface PaymentProvider {
  name: string;
  createOrder(params: CreateOrderParams): Promise<ProviderOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
  refundPayment(params: CreateRefundParams): Promise<RefundResult>;
  getPaymentStatus(providerPaymentId: string): Promise<{ status: string; amount: number; currency: string }>;
  createPayout(params: CreatePayoutParams): Promise<PayoutResult>;
  verifyWebhook(rawBody: string, signature: string, headers?: Record<string, string>): Promise<WebhookVerificationResult>;
}
