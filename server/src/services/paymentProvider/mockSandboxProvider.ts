import crypto from 'crypto';
import {
  PaymentProvider,
  CreateOrderParams,
  ProviderOrderResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
  CreateRefundParams,
  RefundResult,
  CreatePayoutParams,
  PayoutResult,
  WebhookVerificationResult,
} from './types';

export class MockSandboxProvider implements PaymentProvider {
  public readonly name = 'MOCK_SANDBOX';
  private secretKey: string;
  private keyId: string;

  constructor(keyId = 'rzp_test_worknova2026', secretKey = 'worknova_sbx_secret_2026') {
    this.keyId = process.env.PAYMENT_PROVIDER_KEY || keyId;
    this.secretKey = process.env.PAYMENT_PROVIDER_SECRET || secretKey;
  }

  public generateSignature(orderId: string, paymentId: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  }

  public async createOrder(params: CreateOrderParams): Promise<ProviderOrderResult> {
    const randomHex = crypto.randomBytes(8).toString('hex');
    const providerOrderId = `order_sbx_${randomHex}`;

    return {
      providerOrderId,
      amount: params.amount,
      minorUnits: params.minorUnits,
      currency: params.currency,
      status: 'created',
      checkoutKeyId: this.keyId,
      metadata: {
        receiptId: params.receiptId,
        testMode: true,
        provider: 'Razorpay / Sandbox Simulator',
      },
    };
  }

  public async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const expectedSig = this.generateSignature(params.providerOrderId, params.providerPaymentId);
    
    // Check if signature matches or test bypass
    const isValidSignature =
      params.providerSignature === expectedSig ||
      params.providerSignature === 'test_verified_signature' ||
      params.providerPaymentId.startsWith('pay_sbx_');

    if (!isValidSignature) {
      return {
        verified: false,
        providerPaymentId: params.providerPaymentId,
        providerOrderId: params.providerOrderId,
        amount: params.expectedMinorUnits / 100,
        minorUnits: params.expectedMinorUnits,
        currency: params.expectedCurrency,
        status: 'failed',
        failureReason: 'SIGNATURE_VERIFICATION_FAILED',
      };
    }

    return {
      verified: true,
      providerPaymentId: params.providerPaymentId,
      providerOrderId: params.providerOrderId,
      amount: params.expectedMinorUnits / 100,
      minorUnits: params.expectedMinorUnits,
      currency: params.expectedCurrency,
      status: 'captured',
      method: params.expectedCurrency === 'INR' ? 'UPI / NetBanking' : 'Credit Card',
      rawResponse: {
        captured: true,
        gateway: 'WorkNova Secure Gateway',
        fee: Math.round(params.expectedMinorUnits * 0.02),
        tax: 0,
      },
    };
  }

  public async refundPayment(params: CreateRefundParams): Promise<RefundResult> {
    const refundHex = crypto.randomBytes(6).toString('hex');
    const providerRefundId = `rfnd_sbx_${refundHex}`;

    return {
      providerRefundId,
      providerPaymentId: params.providerPaymentId,
      amount: params.amount,
      minorUnits: params.minorUnits,
      currency: params.currency,
      status: 'processed',
      rawResponse: {
        reason: params.reason || 'Client requested refund',
        processedAt: new Date().toISOString(),
      },
    };
  }

  public async getPaymentStatus(providerPaymentId: string): Promise<{ status: string; amount: number; currency: string }> {
    return {
      status: 'captured',
      amount: 1000,
      currency: 'INR',
    };
  }

  public async createPayout(params: CreatePayoutParams): Promise<PayoutResult> {
    const payoutHex = crypto.randomBytes(6).toString('hex');
    const providerPayoutId = `pout_sbx_${payoutHex}`;

    return {
      providerPayoutId,
      amount: params.amount,
      minorUnits: params.minorUnits,
      currency: params.currency,
      status: 'COMPLETED',
      rawResponse: {
        method: params.method,
        beneficiary: params.accountDetailsReference,
        processedAt: new Date().toISOString(),
      },
    };
  }

  public async verifyWebhook(
    rawBody: string,
    signature: string,
    _headers?: Record<string, string>
  ): Promise<WebhookVerificationResult> {
    const expected = crypto.createHmac('sha256', this.secretKey).update(rawBody).digest('hex');
    const isValid = signature === expected || signature === 'test_webhook_signature';

    let parsed: any = {};
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      // ignore
    }

    return {
      isValid,
      eventType: parsed.event || 'payment.captured',
      providerEventId: parsed.id || `evt_${Date.now()}`,
      data: {
        providerPaymentId: parsed.payload?.payment?.entity?.id || parsed.paymentId,
        providerOrderId: parsed.payload?.payment?.entity?.order_id || parsed.orderId,
        amount: parsed.payload?.payment?.entity?.amount ? parsed.payload.payment.entity.amount / 100 : parsed.amount,
        minorUnits: parsed.payload?.payment?.entity?.amount || parsed.minorUnits,
        currency: parsed.payload?.payment?.entity?.currency || parsed.currency || 'INR',
        status: parsed.payload?.payment?.entity?.status || 'captured',
      },
    };
  }
}
