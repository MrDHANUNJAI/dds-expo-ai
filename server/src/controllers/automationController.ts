import { Response } from 'express';
import { automationService } from '../services/automation/automationService';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function triggerDeadlineCheck(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const result = await automationService.checkDeadlinesAndReminders();
    res.json({
      success: true,
      message: `Automation deadline scanner completed. ${result.remindersSent} notifications generated.`,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Automation scan failed' });
  }
}

export async function listJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const { status } = req.query;
    const jobs = db.listScheduledJobs(typeof status === 'string' ? status : undefined);
    res.json({ success: true, data: { jobs } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to list scheduled jobs' });
  }
}

export async function retryJob(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const updated = db.updateScheduledJob(id, {
      status: 'PENDING',
      attempts: 0,
      nextRunAt: new Date().toISOString(),
      lastError: undefined,
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    automationService.processQueue().catch(console.error);

    res.json({ success: true, message: 'Job scheduled for immediate execution', data: { job: updated } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retry job' });
  }
}
