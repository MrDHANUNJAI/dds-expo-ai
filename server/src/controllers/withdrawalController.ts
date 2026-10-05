import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function requestWithdrawal(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({ success: false, message: 'Only freelancers can request withdrawals', code: 'FORBIDDEN' });
      return;
    }

    const { amount, method, accountDetailsReference } = req.body;
    const parsedAmount = Number(amount);

    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ success: false, message: 'Please enter a valid withdrawal amount', code: 'VALIDATION_ERROR' });
      return;
    }

    if (!method || !['BANK_TRANSFER', 'UPI', 'PAYPAL'].includes(method)) {
      res.status(400).json({ success: false, message: 'Invalid payout method selected', code: 'VALIDATION_ERROR' });
      return;
    }

    if (!accountDetailsReference || accountDetailsReference.trim().length < 4) {
      res.status(400).json({ success: false, message: 'Please provide valid payout destination details', code: 'VALIDATION_ERROR' });
      return;
    }

    const wallet = db.getOrCreateWallet(req.user.id);
    if (wallet.availableBalance < parsedAmount) {
      res.status(400).json({
        success: false,
        message: `Insufficient available balance. You have ${wallet.currency} ${wallet.availableBalance.toLocaleString()} available.`,
        code: 'INSUFFICIENT_BALANCE',
      });
      return;
    }

    const result = db.createPayoutRequest(
      req.user.id,
      parsedAmount,
      method,
      accountDetailsReference.trim()
    );

    res.status(201).json({
      success: true,
      message: `Withdrawal request for ${wallet.currency} ${parsedAmount.toLocaleString()} submitted successfully! It is now being processed.`,
      data: {
        payout: result.payout,
        wallet: result.wallet,
      },
    });
  } catch (err: any) {
    console.error('requestWithdrawal error:', err);
    res.status(400).json({ success: false, message: err.message || 'Withdrawal failed', code: 'WITHDRAWAL_FAILED' });
  }
}

export async function getWithdrawals(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({ success: false, message: 'Unauthorized', code: 'FORBIDDEN' });
      return;
    }

    const payouts = db.listPayouts(req.user.id);
    res.json({
      success: true,
      data: { payouts },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch withdrawals', code: 'SERVER_ERROR' });
  }
}

export async function getWithdrawalById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const payout = db.findPayoutById(id);
    if (!payout) {
      res.status(404).json({ success: false, message: 'Withdrawal record not found', code: 'NOT_FOUND' });
      return;
    }

    if (payout.userId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized', code: 'FORBIDDEN' });
      return;
    }

    res.json({
      success: true,
      data: { payout },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch withdrawal', code: 'SERVER_ERROR' });
  }
}
