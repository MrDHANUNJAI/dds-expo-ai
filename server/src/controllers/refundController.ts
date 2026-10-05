import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function requestRefund(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'SELLER') {
      res.status(403).json({ success: false, message: 'Only clients can request milestone refunds', code: 'FORBIDDEN' });
      return;
    }

    const { paymentId, amount, reason } = req.body;
    if (!paymentId || !amount || !reason) {
      res.status(400).json({ success: false, message: 'Payment ID, amount, and reason are required', code: 'VALIDATION_ERROR' });
      return;
    }

    const payment = db.findPaymentById(paymentId);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found', code: 'NOT_FOUND' });
      return;
    }

    if (payment.sellerId !== req.user.id) {
      res.status(403).json({ success: false, message: 'You did not fund this milestone', code: 'FORBIDDEN' });
      return;
    }

    const refund = db.requestRefund(paymentId, req.user.id, Number(amount), reason.trim());

    res.status(201).json({
      success: true,
      message: 'Refund request submitted for administrative review.',
      data: { refund },
    });
  } catch (err: any) {
    console.error('requestRefund error:', err);
    res.status(400).json({ success: false, message: err.message || 'Refund request failed', code: 'REFUND_ERROR' });
  }
}

export async function getRefunds(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const all = db.listRefunds();
    const refunds = req.user.role === 'ADMIN' ? all : all.filter((r) => r.requestedBy === req.user?.id);

    res.json({
      success: true,
      data: { refunds },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch refunds' });
  }
}

export async function getRefundById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const refund = db.findRefundById(id);
    if (!refund) {
      res.status(404).json({ success: false, message: 'Refund record not found', code: 'NOT_FOUND' });
      return;
    }

    if (refund.requestedBy !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized', code: 'FORBIDDEN' });
      return;
    }

    res.json({
      success: true,
      data: { refund },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch refund details' });
  }
}
