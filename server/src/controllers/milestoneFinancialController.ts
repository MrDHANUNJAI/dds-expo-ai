import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function getMilestonePayment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const milestone = db.findMilestoneById(id);
    if (!milestone) {
      res.status(404).json({ success: false, message: 'Milestone not found', code: 'NOT_FOUND' });
      return;
    }

    const contract = db.findContractById(milestone.contractId);
    const settings = db.getPlatformSettings();
    const feeRate = settings.sellerFeeRate || 0;
    const platformFee = Math.round(milestone.amount * feeRate);
    const taxAmount = Math.round(platformFee * (settings.taxRate || 0));
    const totalPayable = milestone.amount + platformFee + taxAmount;

    const payment = db.findPaymentByMilestoneId(milestone.id);
    const invoice = payment ? db.findInvoiceByPaymentId(payment.id) : null;

    res.json({
      success: true,
      data: {
        milestone,
        contract,
        pricing: {
          subtotal: milestone.amount,
          platformFee,
          taxAmount,
          totalPayable,
          currency: milestone.currency,
          taxRate: settings.taxRate,
          freelancerFeeRate: settings.freelancerFeeRate,
        },
        payment,
        invoice,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch milestone payment details', code: 'SERVER_ERROR' });
  }
}

export async function releaseMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const milestone = db.findMilestoneById(id);
    if (!milestone) {
      res.status(404).json({ success: false, message: 'Milestone not found', code: 'NOT_FOUND' });
      return;
    }

    const contract = db.findContractById(milestone.contractId);
    if (!contract) {
      res.status(404).json({ success: false, message: 'Contract not found', code: 'NOT_FOUND' });
      return;
    }

    if (contract.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Only the project employer can approve and release milestone funds', code: 'FORBIDDEN' });
      return;
    }

    const result = db.releaseMilestonePayment(id, req.user.id);

    res.json({
      success: true,
      message: `Milestone "${milestone.title}" approved! Net payout of ${milestone.currency} ${result.netAmount.toLocaleString()} has been released to the specialist's wallet.`,
      data: result,
    });
  } catch (err: any) {
    console.error('releaseMilestone error:', err);
    res.status(400).json({ success: false, message: err.message || 'Milestone release failed', code: 'RELEASE_FAILED' });
  }
}

export async function getReleaseStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const milestone = db.findMilestoneById(id);
    if (!milestone) {
      res.status(404).json({ success: false, message: 'Milestone not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        milestoneId: id,
        paymentStatus: milestone.paymentStatus,
        workflowStatus: milestone.workflowStatus,
        releasedAt: milestone.releasedAt,
        fundedAt: milestone.fundedAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error checking release status' });
  }
}
