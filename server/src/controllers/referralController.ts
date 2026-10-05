import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../models/db';

export async function getReferralProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const code = db.getOrCreateReferralCode(req.user.id);
    const referrals = db.listUserReferrals(req.user.id);
    const { totalCredits, rewards } = db.listUserRewards(req.user.id);

    const qualifiedCount = referrals.filter((r) => r.status === 'QUALIFIED').length;
    const pendingCount = referrals.filter((r) => r.status === 'PENDING').length;

    res.json({
      success: true,
      data: {
        code,
        referralLink: `${req.protocol}://${req.get('host')}/register?ref=${code}`,
        rewardPerReferral: 25,
        currency: 'USD',
        stats: {
          totalInvited: referrals.length,
          qualifiedCount,
          pendingCount,
          totalEarnedCredits: totalCredits,
        },
        referrals,
        rewards,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch referral profile' });
  }
}

export async function applyReferralCode(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: 'Referral code is required' });
      return;
    }

    const user = db.findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const ref = db.processReferralRegistration(user.id, user.email, code);
    if (!ref) {
      res.status(400).json({ success: false, message: 'Invalid referral code or cannot refer yourself' });
      return;
    }

    // Award initial welcome bonus to the referred user as well
    db.addPlatformReward(
      user.id,
      'PLATFORM_CREDIT',
      10,
      `Welcome bonus credit for joining via invite code ${code.toUpperCase()}`
    );

    res.status(200).json({
      success: true,
      message: 'Referral code applied! $10 platform credit added to your account.',
      data: ref,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to apply referral code' });
  }
}
