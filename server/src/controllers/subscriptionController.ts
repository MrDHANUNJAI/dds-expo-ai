import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../models/db';

export async function getSubscriptionPlans(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const plans = db.listSubscriptionPlans();
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch plans' });
  }
}

export async function getMySubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const orgId = req.query.orgId as string | undefined;
    const subInfo = db.getUserSubscription(req.user.id, orgId);
    res.json({ success: true, data: subInfo });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch subscription' });
  }
}

export async function subscribeToPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { planId, billingCycle, organizationId } = req.body;
    if (!planId) {
      res.status(400).json({ success: false, message: 'Plan ID is required' });
      return;
    }

    const sub = db.createOrUpdateUserSubscription(
      req.user.id,
      planId,
      billingCycle || 'MONTHLY',
      organizationId
    );

    // If subscribed to Pro or higher, automatically award badge
    if (planId === 'plan-pro' || planId === 'plan-agency') {
      db.awardBadge({
        userId: req.user.id,
        badgeType: planId === 'plan-agency' ? 'VERIFIED_AGENCY' : 'RISING_TALENT',
        name: planId === 'plan-agency' ? 'Verified Agency' : 'Pro Verified Member',
        description: 'Active professional tier subscription with accelerated benefits',
        icon: 'Sparkles',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: sub,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to activate subscription' });
  }
}

export async function cancelSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const cancelled = db.cancelUserSubscription(id);
    if (!cancelled) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }
    res.json({
      success: true,
      message: 'Subscription will not renew at the end of the current billing cycle',
      data: { cancelled },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to cancel subscription' });
  }
}
