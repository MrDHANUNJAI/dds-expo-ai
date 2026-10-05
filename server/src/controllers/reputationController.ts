import { Request, Response } from 'express';
import { db } from '../models/db';

export async function getUserReputation(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const rep = db.getReputationBreakdown(userId);
    res.json({ success: true, data: rep });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to calculate reputation' });
  }
}

export async function getUserBadges(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const badges = db.getUserBadges(userId);
    res.json({ success: true, data: badges });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch badges' });
  }
}
