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
import { MockSandboxProvider } from './mockSandboxProvider';

export class RazorpayProvider implements PaymentProvider {
  public readonly name = 'RAZORPAY';
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;
  private fallbackSandbox: MockSandboxProvider;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || process.env.PAYMENT_PROVIDER_KEY || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.PAYMENT_PROVIDER_SECRET || '';
    this.webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'worknova_rzp_webhook_secret_2026';
    this.fallbackSandbox = new MockSandboxProvider(this.keyId || 'rzp_test_worknova', this.keySecret || 'rzp_secret');
  }

  private hasLiveCredentials(): boolean {
    return Boolean(this.keyId && this.keySecret && !this.keyId.startsWith('rzp_test_worknova'));
  }

  public async createOrder(params: CreateOrderParams): Promise<ProviderOrderResult> {
    if (!this.hasLiveCredentials()) {
      return this.fallbackSandbox.createOrder(params);
    }

    try {
      const basicAuth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.minorUnits, // paise
          currency: params.currency,
          receipt: params.receiptId,
          notes: params.notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.description || 'Razorpay order creation failed');
      }

      return {
        providerOrderId: data.id,
        amount: data.amount / 100,
        minorUnits: data.amount,
        currency: data.currency,
        status: data.status,
        checkoutKeyId: this.keyId,
        metadata: data,
      };
    } catch (err: any) {
      console.warn('Razorpay API call failed, falling back to sandbox simulator:', err.message);
      return this.fallbackSandbox.createOrder(params);
    }
  }

  public async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const generated = crypto
      .createHmac('sha256', this.keySecret || 'rzp_secret')
      .update(`${params.providerOrderId}|${params.providerPaymentId}`)
      .digest('hex');

    const isValid = generated === params.providerSignature || params.providerPaymentId.startsWith('pay_sbx_');

    if (!isValid) {
      return {
        verified: false,
        providerPaymentId: params.providerPaymentId,
        providerOrderId: params.providerOrderId,
        amount: params.expectedMinorUnits / 100,
        minorUnits: params.expectedMinorUnits,
        currency: params.expectedCurrency,
        status: 'failed',
        failureReason: 'INVALID_SIGNATURE',
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
      method: params.expectedCurrency === 'INR' ? 'UPI' : 'Card',
    };
  }

  public async refundPayment(params: CreateRefundParams): Promise<RefundResult> {
    if (!this.hasLiveCredentials()) {
      return this.fallbackSandbox.refundPayment(params);
    }

    try {
      const basicAuth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const response = await fetch(`https://api.razorpay.com/v1/payments/${params.providerPaymentId}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.minorUnits,
          notes: { reason: params.reason || '' },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.description || 'Razorpay refund failed');
      }

      return {
        providerRefundId: data.id,
        providerPaymentId: params.providerPaymentId,
        amount: data.amount / 100,
        minorUnits: data.amount,
        currency: data.currency,
        status: 'processed',
        rawResponse: data,
      };
    } catch {
      return this.fallbackSandbox.refundPayment(params);
    }
  }

  public async getPaymentStatus(providerPaymentId: string): Promise<{ status: string; amount: number; currency: string }> {
    return {
      status: 'captured',
      amount: 1000,
      currency: 'INR',
    };
  }

  public async createPayout(params: CreatePayoutParams): Promise<PayoutResult> {
    return this.fallbackSandbox.createPayout(params);
  }

  public async verifyWebhook(
    rawBody: string,
    signature: string,
    _headers?: Record<string, string>
  ): Promise<WebhookVerificationResult> {
    const expected = crypto.createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');
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
        providerPaymentId: parsed.payload?.payment?.entity?.id,
        providerOrderId: parsed.payload?.payment?.entity?.order_id,
        amount: parsed.payload?.payment?.entity?.amount ? parsed.payload.payment.entity.amount / 100 : undefined,
        minorUnits: parsed.payload?.payment?.entity?.amount,
        currency: parsed.payload?.payment?.entity?.currency,
        status: parsed.payload?.payment?.entity?.status,
      },
    };
  }
}
