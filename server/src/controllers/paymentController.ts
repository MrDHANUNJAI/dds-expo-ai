import { Request, Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getPaymentProvider } from '../services/paymentProvider';

export async function createPaymentOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN')) {
      res.status(403).json({ success: false, message: 'Only clients or admins can fund milestones', code: 'FORBIDDEN' });
      return;
    }

    const { milestoneId } = req.body;
    if (!milestoneId) {
      res.status(400).json({ success: false, message: 'Milestone ID is required', code: 'VALIDATION_ERROR' });
      return;
    }

    const milestone = db.findMilestoneById(milestoneId);
    if (!milestone) {
      res.status(404).json({ success: false, message: 'Milestone not found', code: 'NOT_FOUND' });
      return;
    }

    if (milestone.paymentStatus === 'FUNDED' || milestone.paymentStatus === 'RELEASED') {
      res.status(400).json({
        success: false,
        message: `Milestone is already ${milestone.paymentStatus.toLowerCase()}`,
        code: 'ALREADY_FUNDED',
      });
      return;
    }

    const contract = db.findContractById(milestone.contractId);
    if (!contract) {
      res.status(404).json({ success: false, message: 'Associated contract not found', code: 'NOT_FOUND' });
      return;
    }

    if (contract.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You do not own this project milestone', code: 'FORBIDDEN' });
      return;
    }

    const settings = db.getPlatformSettings();
    const feeRate = settings.sellerFeeRate || 0; // Seller platform fee (0% by default, freelancer pays fee upon release)
    const platformFee = Math.round(milestone.amount * feeRate);
    const taxRate = settings.taxRate || 0;
    const taxAmount = Math.round(platformFee * taxRate);
    const totalAmount = milestone.amount + platformFee + taxAmount;
    const totalMinorUnits = Math.round(totalAmount * 100);

    const provider = getPaymentProvider(settings.paymentProvider);
    const receiptId = `rcpt_${milestone.id.slice(0, 8)}_${Date.now().toString(36)}`;

    const orderResult = await provider.createOrder({
      amount: totalAmount,
      minorUnits: totalMinorUnits,
      currency: milestone.currency,
      receiptId,
      notes: {
        milestoneId: milestone.id,
        contractId: contract.id,
        sellerId: req.user.id,
        freelancerId: contract.freelancerUserId,
      },
    });

    const payment = db.createPayment({
      projectId: milestone.projectId,
      contractId: contract.id,
      milestoneId: milestone.id,
      sellerId: req.user.id,
      freelancerId: contract.freelancerUserId,
      amount: milestone.amount,
      minorUnits: milestone.minorUnits,
      currency: milestone.currency,
      platformFee,
      platformFeeMinorUnits: platformFee * 100,
      platformFeeRate: settings.defaultPlatformFeeRate,
      taxAmount,
      taxRate,
      totalAmount,
      totalAmountMinorUnits: totalMinorUnits,
      provider: provider.name as any,
      providerOrderId: orderResult.providerOrderId,
      status: 'CHECKOUT_PENDING',
      paymentType: 'MILESTONE_FUNDING',
      metadata: {
        receiptId,
        checkoutKeyId: orderResult.checkoutKeyId,
        milestoneTitle: milestone.title,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        payment,
        order: {
          id: orderResult.providerOrderId,
          amount: totalAmount,
          minorUnits: totalMinorUnits,
          currency: milestone.currency,
          keyId: orderResult.checkoutKeyId,
          milestoneTitle: milestone.title,
          subtotal: milestone.amount,
          platformFee,
          taxAmount,
          totalAmount,
        },
      },
    });
  } catch (err: any) {
    console.error('createPaymentOrder error:', err);
    res.status(500).json({ success: false, message: err.message || 'Payment initiation failed', code: 'SERVER_ERROR' });
  }
}

export async function verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }

    const { providerOrderId, providerPaymentId, providerSignature } = req.body;
    if (!providerOrderId || !providerPaymentId) {
      res.status(400).json({
        success: false,
        message: 'Order ID and Payment ID are required for verification',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const payment = db.findPaymentByOrderId(providerOrderId);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Matching payment order not found', code: 'NOT_FOUND' });
      return;
    }

    // Verify ownership
    if (payment.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized for this payment', code: 'FORBIDDEN' });
      return;
    }

    // Direct provider verification
    const provider = getPaymentProvider(payment.provider);
    const verification = await provider.verifyPayment({
      providerOrderId,
      providerPaymentId,
      providerSignature: providerSignature || '',
      expectedMinorUnits: payment.totalAmountMinorUnits,
      expectedCurrency: payment.currency,
    });

    if (!verification.verified) {
      db.updatePayment(payment.id, {
        status: 'FAILED',
        failedAt: new Date().toISOString(),
      });
      res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid gateway signature or payment was declined.',
        code: 'PAYMENT_VERIFICATION_FAILED',
      });
      return;
    }

    // Atomic completion & milestone funding
    payment.providerPaymentId = providerPaymentId;
    payment.providerSignature = providerSignature;
    const result = db.completeMilestoneFunding(payment.milestoneId, payment.id);

    res.json({
      success: true,
      message: 'Payment verified successfully! Milestone funds are now secured in escrow.',
      data: {
        payment: result.payment,
        milestone: result.milestone,
        invoice: result.invoice,
      },
    });
  } catch (err: any) {
    console.error('verifyPayment error:', err);
    res.status(500).json({ success: false, message: err.message || 'Payment verification failed', code: 'SERVER_ERROR' });
  }
}

export async function getPaymentById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const payment = db.findPaymentById(id);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found', code: 'NOT_FOUND' });
      return;
    }

    if (payment.sellerId !== req.user.id && payment.freelancerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized', code: 'FORBIDDEN' });
      return;
    }

    const invoice = db.findInvoiceByPaymentId(payment.id);
    res.json({
      success: true,
      data: { payment, invoice },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment', code: 'SERVER_ERROR' });
  }
}

export async function getMyPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const payments =
      req.user.role === 'SELLER'
        ? db.listPayments({ sellerId: req.user.id })
        : db.listPayments({ freelancerId: req.user.id });

    // Augment with milestone and invoice info
    const detailed = payments.map((p) => {
      const ms = db.findMilestoneById(p.milestoneId);
      const inv = db.findInvoiceByPaymentId(p.id);
      return {
        ...p,
        milestoneTitle: ms?.title || 'Project Milestone',
        invoiceNumber: inv?.invoiceNumber,
      };
    });

    res.json({
      success: true,
      data: { payments: detailed },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments', code: 'SERVER_ERROR' });
  }
}

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    const signature = (req.headers['x-razorpay-signature'] || req.headers['stripe-signature'] || '') as string;
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const provider = getPaymentProvider();
    const verification = await provider.verifyWebhook(rawBody, signature, req.headers as Record<string, string>);

    if (!verification.isValid) {
      res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }

    // Idempotency check: don't process same event twice
    if (db.hasWebhookBeenProcessed(verification.providerEventId)) {
      res.json({ success: true, message: 'Webhook already processed (idempotent)' });
      return;
    }

    db.recordProcessedWebhook(verification.providerEventId, provider.name, verification.eventType);

    if (verification.eventType === 'payment.captured' && verification.data.providerOrderId) {
      const payment = db.findPaymentByOrderId(verification.data.providerOrderId);
      if (payment && payment.status !== 'PAID') {
        payment.providerPaymentId = verification.data.providerPaymentId || payment.providerPaymentId;
        db.completeMilestoneFunding(payment.milestoneId, payment.id);
      }
    }

    res.json({ success: true, received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ success: false, message: 'Webhook handler error' });
  }
}
