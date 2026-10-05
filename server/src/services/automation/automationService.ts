import { db } from '../../models/db';
import { ScheduledJobDocument, JobStatus, JobType } from '../../types';

export class AutomationService {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    this.startWorker();
  }

  public startWorker(intervalMs: number = 30000) {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.processQueue().catch((err) => console.error('Error in automation queue worker:', err));
    }, intervalMs);
  }

  public stopWorker() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // --- 1. DEADLINE & REMINDER SCANNER ---
  public async checkDeadlinesAndReminders(): Promise<{ remindersSent: number }> {
    let remindersSent = 0;
    const now = Date.now();
    const oneDayMs = 86400000;

    // Scan active contracts & milestones
    const contracts = db.listContracts();
    for (const contract of contracts) {
      if (contract.status !== 'ACTIVE') continue;

      const contractMilestones = contract.milestones || db.listMilestones(contract.id);
      for (const ms of contractMilestones) {
        if (!ms.dueDate) continue;
        const dueTimestamp = new Date(ms.dueDate).getTime();
        const diffMs = dueTimestamp - now;
        const diffDays = Math.ceil(diffMs / oneDayMs);

        // 3 days remaining reminder
        if (diffDays === 3) {
          db.createNotification({
            userId: contract.freelancerId,
            type: 'MILESTONE_REMINDER',
            title: `Deadline approaching: ${ms.title}`,
            message: `Milestone "${ms.title}" for ${contract.projectTitle} is due in 3 days.`,
            entityType: 'milestone',
            entityId: ms.id,
            link: `/freelancer/dashboard?tab=contracts`,
          });
          remindersSent++;
        }

        // 1 day remaining reminder
        if (diffDays === 1) {
          db.createNotification({
            userId: contract.freelancerId,
            type: 'MILESTONE_REMINDER',
            title: `Urgent: Milestone due tomorrow`,
            message: `Milestone "${ms.title}" is due tomorrow. Please submit deliverables on the workspace.`,
            entityType: 'milestone',
            entityId: ms.id,
            link: `/freelancer/dashboard?tab=contracts`,
          });
          remindersSent++;
        }

        // Milestone submitted reminder for seller (awaiting approval)
        if (ms.workflowStatus === 'SUBMITTED') {
          db.createNotification({
            userId: contract.sellerId,
            type: 'DELIVERY_PENDING_APPROVAL',
            title: `Deliverables ready for review`,
            message: `Freelancer submitted work for "${ms.title}". Review deliverables to approve & release funds.`,
            entityType: 'milestone',
            entityId: ms.id,
            link: `/seller/dashboard?tab=contracts`,
          });
          remindersSent++;
        }
      }
    }

    return { remindersSent };
  }

  // --- 2. SCHEDULED QUEUE PROCESSOR ---
  public async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      let job = db.getNextPendingJob();
      while (job) {
        db.updateScheduledJob(job.id, { status: 'RUNNING' });

        try {
          await this.executeJob(job);
          db.updateScheduledJob(job.id, {
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
          });
        } catch (err: any) {
          const nextAttempts = job.attempts + 1;
          if (nextAttempts >= job.maxAttempts) {
            db.updateScheduledJob(job.id, {
              status: 'FAILED',
              attempts: nextAttempts,
              lastError: err.message,
            });
          } else {
            // Exponential backoff
            const delaySec = Math.pow(2, nextAttempts) * 10;
            const nextRunAt = new Date(Date.now() + delaySec * 1000).toISOString();
            db.updateScheduledJob(job.id, {
              status: 'RETRYING',
              attempts: nextAttempts,
              nextRunAt,
              lastError: err.message,
            });
          }
        }

        job = db.getNextPendingJob();
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeJob(job: ScheduledJobDocument): Promise<void> {
    switch (job.type) {
      case 'PROJECT_REMINDER':
      case 'MILESTONE_REMINDER':
        if (job.payload.userId && job.payload.message) {
          db.createNotification({
            userId: job.payload.userId,
            type: 'AUTOMATION_REMINDER',
            title: job.payload.title || 'WorkNova Reminder',
            message: job.payload.message,
            entityType: 'system',
            link: job.payload.link,
          });
        }
        break;

      case 'REVIEW_REMINDER':
        if (job.payload.userId) {
          db.createNotification({
            userId: job.payload.userId,
            type: 'REVIEW_REMINDER',
            title: 'Please leave a review',
            message: `Your project "${job.payload.projectTitle}" completed. Share your feedback!`,
            entityType: 'project',
            entityId: job.payload.projectId,
            link: job.payload.link,
          });
        }
        break;

      case 'SEARCH_INDEX_UPDATE':
      case 'CLEANUP_TASK':
        // Simulated index & cleanup tasks
        break;

      default:
        console.log(`Executed scheduled job type: ${job.type}`);
    }
  }
}

export const automationService = new AutomationService();
