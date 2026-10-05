import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function createReport(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { type, reason, description, reportedUserId, projectId, messageId, reviewId, evidence } = req.body;

    if (!type || !reason || !description || description.trim().length < 5) {
      res.status(400).json({
        success: false,
        message: 'Report type, category reason, and explanation are required',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const report = db.createReport({
      reporterId: req.user.id,
      reportedUserId,
      projectId,
      messageId,
      reviewId,
      type,
      reason,
      description: description.trim(),
      evidence: evidence || [],
    });

    res.status(201).json({
      success: true,
      message: 'Report received. Our Trust & Safety team investigates all reports thoroughly.',
      data: { report },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to submit report' });
  }
}

export async function getMyReports(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const all = db.listReports();
    const myReports = all.filter((r) => r.reporterId === req.user?.id);

    res.json({
      success: true,
      data: { reports: myReports },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
}
