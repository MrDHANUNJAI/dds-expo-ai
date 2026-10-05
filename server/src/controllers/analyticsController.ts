import { Request, Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function getSellerAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN')) {
      res.status(403).json({ success: false, message: 'Seller or Admin access required' });
      return;
    }

    const sellerId = req.query.sellerId ? String(req.query.sellerId) : req.user.id;
    const analytics = db.getSellerAnalytics(sellerId);

    res.json({
      success: true,
      data: { analytics },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch seller analytics' });
  }
}

export async function getFreelancerAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || (req.user.role !== 'FREELANCER' && req.user.role !== 'ADMIN')) {
      res.status(403).json({ success: false, message: 'Freelancer or Admin access required' });
      return;
    }

    const freelancerId = req.query.freelancerId ? String(req.query.freelancerId) : req.user.id;
    const analytics = db.getFreelancerAnalytics(freelancerId);

    res.json({
      success: true,
      data: { analytics },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch freelancer analytics' });
  }
}

export async function getAdminAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const { dateRange } = req.query;
    const analytics = db.getAdminPlatformAnalytics(dateRange ? String(dateRange) : '30d');

    res.json({
      success: true,
      data: { analytics },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin platform analytics' });
  }
}

export async function trackEvent(req: Request, res: Response): Promise<void> {
  try {
    const { eventType, entityType, entityId, sessionId, metadata } = req.body;
    if (!eventType) {
      res.status(400).json({ success: false, message: 'Event type is required' });
      return;
    }

    const userId = (req as any).user?.id;
    const recorded = db.recordAnalyticsEvent({
      userId,
      eventType,
      entityType,
      entityId,
      sessionId,
      metadata,
    });

    res.status(201).json({
      success: true,
      data: { eventId: recorded.id },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to record event' });
  }
}
