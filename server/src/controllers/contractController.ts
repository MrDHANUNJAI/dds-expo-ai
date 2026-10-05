import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function listContracts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const contracts =
      req.user.role === 'SELLER'
        ? db.listContracts({ sellerId: req.user.id })
        : req.user.role === 'FREELANCER'
        ? db.listContracts({ freelancerUserId: req.user.id })
        : db.listContracts();

    const withMilestones = contracts.map((c) => {
      const ms = db.listMilestones(c.id);
      const fundedCount = ms.filter((m) => m.paymentStatus === 'FUNDED' || m.paymentStatus === 'RELEASED').length;
      const completedCount = ms.filter((m) => m.paymentStatus === 'RELEASED').length;
      return {
        ...c,
        milestonesCount: ms.length,
        fundedCount,
        completedCount,
        progressPercent: ms.length > 0 ? Math.round((completedCount / ms.length) * 100) : 0,
      };
    });

    res.json({
      success: true,
      data: { contracts: withMilestones },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch contracts', code: 'SERVER_ERROR' });
  }
}

export async function getContractById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const contract = db.findContractById(id);
    if (!contract) {
      res.status(404).json({ success: false, message: 'Contract not found', code: 'NOT_FOUND' });
      return;
    }

    if (contract.sellerId !== req.user.id && contract.freelancerUserId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized for this contract', code: 'FORBIDDEN' });
      return;
    }

    const milestones = db.listMilestones(contract.id);
    const payments = db.listPayments().filter((p) => p.contractId === contract.id);

    res.json({
      success: true,
      data: {
        contract,
        milestones,
        payments,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch contract details' });
  }
}

export async function createMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'SELLER') {
      res.status(403).json({ success: false, message: 'Only clients can add contract milestones', code: 'FORBIDDEN' });
      return;
    }

    const { contractId, title, description, amount, dueDate } = req.body;
    if (!contractId || !title || !amount) {
      res.status(400).json({ success: false, message: 'Contract ID, title, and amount are required', code: 'VALIDATION_ERROR' });
      return;
    }

    const contract = db.findContractById(contractId);
    if (!contract || contract.sellerId !== req.user.id) {
      res.status(403).json({ success: false, message: 'Unauthorized for this contract' });
      return;
    }

    const newMilestone = db.createMilestone({
      contractId,
      projectId: contract.projectId,
      title: title.trim(),
      description: description || '',
      amount: Number(amount),
      currency: contract.currency,
      paymentStatus: 'UNFUNDED',
      workflowStatus: 'PENDING',
      dueDate: dueDate || '2 weeks',
    });

    res.status(201).json({
      success: true,
      message: 'Milestone created. Fund milestone to start work.',
      data: { milestone: newMilestone },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create milestone' });
  }
}

export async function submitMilestoneDelivery(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({ success: false, message: 'Only freelancers can submit work', code: 'FORBIDDEN' });
      return;
    }

    const { id } = req.params;
    const { deliveryNotes, deliveryFiles } = req.body;

    const milestone = db.findMilestoneById(id);
    if (!milestone) {
      res.status(404).json({ success: false, message: 'Milestone not found' });
      return;
    }

    const contract = db.findContractById(milestone.contractId);
    if (!contract || contract.freelancerUserId !== req.user.id) {
      res.status(403).json({ success: false, message: 'Unauthorized for this milestone' });
      return;
    }

    if (milestone.paymentStatus !== 'FUNDED') {
      res.status(400).json({
        success: false,
        message: 'Cannot deliver work on unfunded milestone. Employer must fund escrow first.',
        code: 'NOT_FUNDED',
      });
      return;
    }

    const updated = db.updateMilestone(id, {
      workflowStatus: 'SUBMITTED',
      deliveryNotes: deliveryNotes || 'Work completed and submitted for client approval.',
      deliveryFiles: deliveryFiles || [],
      deliveredAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Milestone delivery submitted! The client will review and approve payment.',
      data: { milestone: updated },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to submit milestone delivery' });
  }
}
