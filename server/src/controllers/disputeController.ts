import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { emailService } from '../services/emailService';

export async function createDispute(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { contractId, milestoneId, reason, description, amount, priority } = req.body;
    if (!contractId || !reason || !description) {
      res.status(400).json({
        success: false,
        message: 'Contract ID, reason, and detailed description are required',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const contract = db.findContractById(contractId);
    if (!contract) {
      res.status(404).json({ success: false, message: 'Contract not found' });
      return;
    }

    if (contract.sellerId !== req.user.id && contract.freelancerUserId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized for this contract' });
      return;
    }

    const againstUserId = contract.sellerId === req.user.id ? contract.freelancerUserId : contract.sellerId;

    // Check duplicate active dispute
    const existing = db.listDisputes({ userId: req.user.id }).find(
      (d) => d.contractId === contractId && d.status !== 'CLOSED' && d.status !== 'RESOLVED_SELLER' && d.status !== 'RESOLVED_FREELANCER'
    );
    if (existing) {
      res.status(400).json({
        success: false,
        message: 'An active dispute is already in progress for this contract.',
        code: 'DUPLICATE_ACTIVE_DISPUTE',
      });
      return;
    }

    const dispute = db.createDispute({
      projectId: contract.projectId,
      contractId,
      milestoneId,
      openedBy: req.user.id,
      againstUserId,
      reason,
      description: description.trim(),
      amount: amount ? Number(amount) : contract.totalAmount,
      currency: contract.currency,
      priority: priority || 'MEDIUM',
    });

    const opposing = db.findUserById(againstUserId);
    if (opposing) {
      emailService.sendDisputeUpdateNotification(
        opposing.email,
        `${opposing.firstName} ${opposing.lastName}`,
        dispute.id,
        'OPEN'
      );
    }

    res.status(201).json({
      success: true,
      message: 'Dispute submitted for arbitration. A platform case manager has been assigned.',
      data: { dispute },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create dispute' });
  }
}

export async function getDisputes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const disputes =
      req.user.role === 'ADMIN'
        ? db.listDisputes()
        : db.listDisputes({ userId: req.user.id });

    res.json({
      success: true,
      data: { disputes },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch disputes' });
  }
}

export async function getDisputeById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const dispute = db.findDisputeById(id);
    if (!dispute) {
      res.status(404).json({ success: false, message: 'Dispute not found', code: 'NOT_FOUND' });
      return;
    }

    if (dispute.openedBy !== req.user.id && dispute.againstUserId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized to view this dispute', code: 'FORBIDDEN' });
      return;
    }

    const project = db.findProjectById(dispute.projectId);
    const contract = db.findContractById(dispute.contractId);
    const opener = db.findUserById(dispute.openedBy);
    const against = db.findUserById(dispute.againstUserId);
    const milestone = dispute.milestoneId ? db.findMilestoneById(dispute.milestoneId) : null;

    res.json({
      success: true,
      data: {
        dispute,
        project,
        contract,
        milestone,
        openedBy: opener ? { id: opener.id, name: `${opener.firstName} ${opener.lastName}`, role: opener.role } : null,
        againstUser: against ? { id: against.id, name: `${against.firstName} ${against.lastName}`, role: against.role } : null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch dispute details' });
  }
}

export async function respondToDispute(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { statement } = req.body;

    if (!statement || statement.trim().length < 5) {
      res.status(400).json({ success: false, message: 'Please provide a valid statement' });
      return;
    }

    const dispute = db.findDisputeById(id);
    if (!dispute) {
      res.status(404).json({ success: false, message: 'Dispute not found' });
      return;
    }

    if (dispute.openedBy !== req.user.id && dispute.againstUserId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const updated = db.addDisputeTimelineEvent(id, {
      actorId: req.user.id,
      actorRole: req.user.role,
      event: 'Party Statement Submitted',
      note: statement.trim(),
    });

    res.json({
      success: true,
      message: 'Statement added to dispute record',
      data: { dispute: updated },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to submit response' });
  }
}

export async function addEvidence(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, fileUrl, fileType, description } = req.body;

    if (!title || !fileUrl) {
      res.status(400).json({ success: false, message: 'Evidence title and file URL are required' });
      return;
    }

    const dispute = db.findDisputeById(id);
    if (!dispute) {
      res.status(404).json({ success: false, message: 'Dispute not found' });
      return;
    }

    if (dispute.openedBy !== req.user.id && dispute.againstUserId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const updated = db.addDisputeEvidence(id, {
      uploadedBy: req.user.id,
      title: title.trim(),
      fileUrl,
      fileType: fileType || 'document',
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Evidence submitted for arbitration review',
      data: { dispute: updated },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to add evidence' });
  }
}
