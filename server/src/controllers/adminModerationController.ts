import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { DisputeStatus, ReviewStatus, ReportStatus, ModerationActionType } from '../types';

// --- REPORTS MODERATION ---
export async function getAdminReports(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
      return;
    }

    const { status, type } = req.query;
    const reports = db.listReports({
      status: status ? (String(status) as ReportStatus) : undefined,
      type: type ? (String(type) as any) : undefined,
    });

    res.json({
      success: true,
      data: { reports },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
}

export async function resolveAdminReport(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
      return;
    }

    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    if (!status || !['RESOLVED', 'DISMISSED', 'UNDER_REVIEW', 'ACTION_REQUIRED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid report status' });
      return;
    }

    const updated = db.updateReportStatus(id, status, resolutionNotes, req.user.id);
    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'REPORT_RESOLVED',
      details: { reportId: id, status, resolutionNotes },
    });

    res.json({
      success: true,
      message: `Report marked as ${status.toLowerCase()}`,
      data: { report: updated },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to update report' });
  }
}

// --- DISPUTES MODERATION ---
export async function getAdminDisputes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
      return;
    }

    const { status, priority } = req.query;
    const disputes = db.listDisputes({
      status: status ? (String(status) as DisputeStatus) : undefined,
      priority: priority ? (String(priority) as any) : undefined,
    });

    res.json({
      success: true,
      data: { disputes },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch disputes' });
  }
}

export async function resolveAdminDispute(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
      return;
    }

    const { id } = req.params;
    const { favoredParty, resolution, refundAmount, releaseAmount, adminNote } = req.body;

    if (!favoredParty || !['SELLER', 'FREELANCER', 'SPLIT'].includes(favoredParty)) {
      res.status(400).json({ success: false, message: 'Valid favored party selection is required (SELLER, FREELANCER, or SPLIT)' });
      return;
    }

    const dispute = db.findDisputeById(id);
    if (!dispute) {
      res.status(404).json({ success: false, message: 'Dispute not found' });
      return;
    }

    // Connect financial effect via Phase 5 financial system (safe transactions)
    let transactionId: string | undefined;

    if (favoredParty === 'SELLER' && dispute.milestoneId) {
      const payment = db.findPaymentByMilestoneId(dispute.milestoneId);
      if (payment && payment.status === 'PAID') {
        const refundAmt = refundAmount ? Number(refundAmount) : payment.amount;
        const refund = db.requestRefund(payment.id, req.user.id, refundAmt, `Dispute resolution: ${resolution}`);
        db.updateRefundStatus(refund.id, 'COMPLETED');
        transactionId = refund.id;
      }
    } else if (favoredParty === 'FREELANCER' && dispute.milestoneId) {
      const milestone = db.findMilestoneById(dispute.milestoneId);
      if (milestone && milestone.paymentStatus === 'FUNDED') {
        const released = db.releaseMilestonePayment(milestone.id, req.user.id);
        transactionId = released.milestone.id;
      }
    } else if (favoredParty === 'SPLIT' && dispute.milestoneId) {
      // Create safe adjustment transaction records
      const splitTx = db.createTransaction({
        userId: dispute.openedBy,
        projectId: dispute.projectId,
        contractId: dispute.contractId,
        milestoneId: dispute.milestoneId,
        type: 'ADJUSTMENT',
        direction: 'CREDIT',
        amount: Number(refundAmount || 0),
        minorUnits: Math.round(Number(refundAmount || 0) * 100),
        currency: dispute.currency,
        status: 'COMPLETED',
        reference: `disp-${dispute.id}`,
        description: `Dispute split adjustment: ${resolution}`,
      });
      transactionId = splitTx.id;
    }

    const resolved = db.resolveDispute(id, {
      resolution: resolution || `Arbitrated in favor of ${favoredParty}`,
      resolutionDetails: {
        favoredParty,
        refundAmount: Number(refundAmount || 0),
        releaseAmount: Number(releaseAmount || 0),
        adminNote: adminNote || '',
        transactionId,
      },
      adminId: req.user.id,
    });

    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'DISPUTE_RESOLVED',
      details: { disputeId: id, favoredParty, transactionId, resolution },
    });

    res.json({
      success: true,
      message: `Dispute resolved successfully in favor of ${favoredParty}`,
      data: { dispute: resolved },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to resolve dispute' });
  }
}

// --- REVIEWS MODERATION ---
export async function getAdminReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
      return;
    }

    const reviews = db.listAllReviewsAdmin();
    res.json({
      success: true,
      data: { reviews },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
}

export async function updateAdminReviewStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['PUBLISHED', 'HIDDEN', 'FLAGGED', 'REMOVED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid review status' });
      return;
    }

    const updated = db.updateReviewStatusAdmin(id, status as ReviewStatus);
    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'REVIEW_STATUS_UPDATED',
      details: { reviewId: id, status },
    });

    res.json({
      success: true,
      message: `Review status updated to ${status.toLowerCase()}`,
      data: { review: updated },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to update review status' });
  }
}

// --- SUPPORT TICKETS MODERATION ---
export async function getAdminSupportTickets(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
      return;
    }

    const { status, category } = req.query;
    const tickets = db.listSupportTickets({
      status: status ? (String(status) as any) : undefined,
      category: category ? (String(category) as any) : undefined,
    });

    res.json({
      success: true,
      data: { tickets },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch support tickets' });
  }
}

export async function assignAdminSupportTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
      return;
    }

    const { id } = req.params;
    const { adminId } = req.body;

    const updated = db.updateSupportTicket(id, {
      assignedAdminId: adminId || req.user.id,
      status: 'IN_PROGRESS',
    });

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      data: { ticket: updated },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to assign ticket' });
  }
}

// --- USER MODERATION & RESTRICTIONS ---
export async function getModerationOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
      return;
    }

    const reports = db.listReports();
    const disputes = db.listDisputes();
    const tickets = db.listSupportTickets();
    const reviews = db.listAllReviewsAdmin();
    const moderationActions = db.listModerationActions();

    res.json({
      success: true,
      data: {
        metrics: {
          openReportsCount: reports.filter((r) => r.status === 'OPEN' || r.status === 'UNDER_REVIEW').length,
          totalReportsCount: reports.length,
          activeDisputesCount: disputes.filter((d) => d.status !== 'CLOSED' && d.status !== 'RESOLVED_SELLER' && d.status !== 'RESOLVED_FREELANCER').length,
          totalDisputesCount: disputes.length,
          openTicketsCount: tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
          flaggedReviewsCount: reviews.filter((r) => r.status === 'FLAGGED').length,
          activeRestrictionsCount: moderationActions.length,
        },
        recentReports: reports.slice(0, 5),
        recentDisputes: disputes.slice(0, 5),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch moderation overview' });
  }
}

export async function restrictUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
      return;
    }

    const { userId } = req.params;
    const { action, reason, expiresAt } = req.body;

    if (!action || !reason) {
      res.status(400).json({ success: false, message: 'Action type and justification reason are required' });
      return;
    }

    const record = db.applyModerationAction({
      adminId: req.user.id,
      userId,
      action: action as ModerationActionType,
      reason: reason.trim(),
      expiresAt,
    });

    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'USER_MODERATED',
      details: { targetUserId: userId, action, reason },
    });

    res.json({
      success: true,
      message: `Moderation action "${action.replace('_', ' ')}" applied to user.`,
      data: { moderationAction: record },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to apply restriction' });
  }
}

// --- FAQ ADMIN MANAGEMENT ---
export async function getAdminFAQs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const faqs = db.listFAQs(false);
    res.json({
      success: true,
      data: { faqs },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch FAQs' });
  }
}

export async function createAdminFAQ(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const { question, answer, category, order, published } = req.body;
    if (!question || !answer || !category) {
      res.status(400).json({ success: false, message: 'Question, answer, and category are required' });
      return;
    }

    const faq = db.createFAQ({
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim(),
      order: order ? Number(order) : 1,
      published: published !== undefined ? Boolean(published) : true,
    });

    res.status(201).json({
      success: true,
      message: 'FAQ entry created',
      data: { faq },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: 'Failed to create FAQ' });
  }
}

export async function updateAdminFAQ(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const updated = db.updateFAQ(id, req.body);

    res.json({
      success: true,
      message: 'FAQ entry updated',
      data: { faq: updated },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: 'Failed to update FAQ' });
  }
}

export async function deleteAdminFAQ(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    db.deleteFAQ(id);

    res.json({
      success: true,
      message: 'FAQ entry deleted',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: 'Failed to delete FAQ' });
  }
}
