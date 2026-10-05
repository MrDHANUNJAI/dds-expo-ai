import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function getWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({ success: false, message: 'Wallet is only available for freelancer accounts', code: 'FORBIDDEN' });
      return;
    }

    const wallet = db.getOrCreateWallet(req.user.id);
    const ledger = db.getWalletLedger(req.user.id).slice(0, 10);
    const payouts = db.listPayouts(req.user.id);

    res.json({
      success: true,
      data: {
        wallet,
        recentLedger: ledger,
        pendingPayoutsCount: payouts.filter((p) => p.status === 'PROCESSING' || p.status === 'REQUESTED').length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallet', code: 'SERVER_ERROR' });
  }
}

export async function getWalletLedger(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({ success: false, message: 'Unauthorized', code: 'FORBIDDEN' });
      return;
    }

    const ledger = db.getWalletLedger(req.user.id);
    res.json({
      success: true,
      data: { ledger },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch ledger', code: 'SERVER_ERROR' });
  }
}

export async function getEarningsSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({ success: false, message: 'Unauthorized', code: 'FORBIDDEN' });
      return;
    }

    const wallet = db.getOrCreateWallet(req.user.id);
    const ledger = db.getWalletLedger(req.user.id);
    const contracts = db.listContracts({ freelancerUserId: req.user.id });

    // Calculate gross vs platform fee from ledger
    const earningsEntries = ledger.filter((l) => l.type === 'EARNING');
    const feeEntries = ledger.filter((l) => l.type === 'PLATFORM_FEE');

    const grossEarnings = earningsEntries.reduce((sum, l) => sum + l.amount, 0);
    const totalFees = feeEntries.reduce((sum, l) => sum + l.amount, 0);
    const netEarnings = wallet.totalEarned;

    // Monthly breakdown (mocked based on actual releases)
    const monthlyBreakdown = [
      { month: 'Oct 2026', gross: grossEarnings, fees: totalFees, net: netEarnings },
      { month: 'Sep 2026', gross: 0, fees: 0, net: 0 },
    ];

    res.json({
      success: true,
      data: {
        summary: {
          grossEarnings,
          totalFees,
          netEarnings,
          availableBalance: wallet.availableBalance,
          pendingBalance: wallet.pendingBalance,
          totalWithdrawn: wallet.totalWithdrawn,
          currency: wallet.currency,
        },
        monthlyBreakdown,
        contractsCount: contracts.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to load earnings summary', code: 'SERVER_ERROR' });
  }
}
