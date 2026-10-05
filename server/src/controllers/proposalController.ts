import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ProposalStatus } from '../types';

export async function submitProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({
        success: false,
        message: 'Only registered freelancers can submit project proposals.',
        code: 'FORBIDDEN',
      });
      return;
    }

    const { projectId, coverLetter, bidAmount, estimatedDays, milestones, attachments } = req.body;

    if (!projectId || !coverLetter || !bidAmount || !estimatedDays) {
      res.status(400).json({
        success: false,
        message: 'Project ID, cover letter, bid amount, and estimated duration are required.',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    if (coverLetter.trim().length < 30) {
      res.status(400).json({
        success: false,
        message: 'Please provide a detailed cover letter explaining your approach (at least 30 characters).',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const project = db.findProjectById(projectId);
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'The requested project could not be found.',
        code: 'NOT_FOUND',
      });
      return;
    }

    if (project.status !== 'PUBLISHED') {
      res.status(400).json({
        success: false,
        message: 'This project is currently not accepting new proposals.',
        code: 'PROJECT_NOT_OPEN',
      });
      return;
    }

    const flProfile = db.findFreelancerProfileByUserId(req.user.id);
    const existing = db.findProposalByProjectAndFreelancer(projectId, req.user.id);

    if (existing && existing.status !== 'WITHDRAWN') {
      res.status(409).json({
        success: false,
        message: 'You have already submitted a proposal for this project.',
        code: 'PROPOSAL_EXISTS',
        data: { proposal: existing },
      });
      return;
    }

    const newProposal = db.createProposal({
      projectId,
      projectTitle: project.title,
      freelancerId: flProfile?.id || `flp-${req.user.id}`,
      freelancerUserId: req.user.id,
      freelancerName: `${req.user.firstName} ${req.user.lastName}`,
      freelancerTitle: flProfile?.professionalTitle || 'Independent Professional',
      freelancerAvatar: req.user.profileImage,
      freelancerHourlyRate: flProfile?.hourlyRate,
      freelancerRating: 5.0,
      coverLetter: coverLetter.trim(),
      bidAmount: Number(bidAmount),
      estimatedDays: Number(estimatedDays),
      milestones: Array.isArray(milestones) ? milestones : undefined,
      attachments: Array.isArray(attachments) ? attachments : undefined,
    });

    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PROPOSAL_SUBMITTED',
      details: {
        proposalId: newProposal.id,
        projectId,
        projectTitle: project.title,
        bidAmount: newProposal.bidAmount,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Your proposal has been submitted successfully!',
      data: { proposal: newProposal },
    });
  } catch (err: any) {
    console.error('submitProposal error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to submit proposal',
      code: 'SERVER_ERROR',
    });
  }
}

export async function getMyProposals(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({ success: false, message: 'Unauthorized', code: 'FORBIDDEN' });
      return;
    }

    const { status } = req.query;
    const filterStatus = status ? (String(status).toUpperCase() as ProposalStatus) : undefined;

    const allMyProposals = db.listProposals({
      freelancerUserId: req.user.id,
      status: filterStatus,
    });

    // Augment with live project details
    const proposalsWithProjects = allMyProposals.map((prop) => {
      const proj = db.findProjectById(prop.projectId);
      return {
        ...prop,
        project: proj
          ? {
              id: proj.id,
              title: proj.title,
              categoryName: proj.categoryName,
              budgetType: proj.budgetType,
              budgetMin: proj.budgetMin,
              budgetMax: proj.budgetMax,
              status: proj.status,
              sellerCompany: proj.sellerCompany,
              deadline: proj.deadline,
            }
          : null,
      };
    });

    const counts = {
      all: db.listProposals({ freelancerUserId: req.user.id }).length,
      submitted: db.listProposals({ freelancerUserId: req.user.id, status: 'SUBMITTED' }).length,
      shortlisted: db.listProposals({ freelancerUserId: req.user.id, status: 'SHORTLISTED' }).length,
      accepted: db.listProposals({ freelancerUserId: req.user.id, status: 'ACCEPTED' }).length,
      rejected: db.listProposals({ freelancerUserId: req.user.id, status: 'REJECTED' }).length,
      withdrawn: db.listProposals({ freelancerUserId: req.user.id, status: 'WITHDRAWN' }).length,
    };

    res.json({
      success: true,
      data: {
        proposals: proposalsWithProjects,
        counts,
      },
    });
  } catch (err: any) {
    console.error('getMyProposals error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch proposals', code: 'SERVER_ERROR' });
  }
}

export async function getProjectProposals(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }

    const { projectId } = req.params;
    const project = db.findProjectById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found', code: 'NOT_FOUND' });
      return;
    }

    // Only owner seller or admin can view all proposals
    if (project.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only the project creator can review applicants for this job.',
        code: 'FORBIDDEN',
      });
      return;
    }

    const proposals = db.listProposals({ projectId });

    // Augment with full freelancer profile if available
    const augmentedProposals = proposals.map((prop) => {
      const flProfile = db.findFreelancerProfileByUserId(prop.freelancerUserId);
      const flUser = db.findUserById(prop.freelancerUserId);
      return {
        ...prop,
        freelancer: {
          id: prop.freelancerUserId,
          name: flUser ? `${flUser.firstName} ${flUser.lastName}` : prop.freelancerName,
          title: flProfile?.professionalTitle || prop.freelancerTitle,
          avatar: flUser?.profileImage || prop.freelancerAvatar,
          skills: flProfile?.skills || [],
          experienceLevel: flProfile?.experienceLevel || 'Intermediate',
          hourlyRate: flProfile?.hourlyRate || prop.freelancerHourlyRate,
          rating: 4.95,
          location: flProfile?.location || 'Worldwide',
          completedProjects: 14,
        },
      };
    });

    res.json({
      success: true,
      data: {
        project: {
          id: project.id,
          title: project.title,
          status: project.status,
          budgetType: project.budgetType,
          budgetMin: project.budgetMin,
          budgetMax: project.budgetMax,
          proposalCount: proposals.length,
        },
        proposals: augmentedProposals,
        stats: {
          total: proposals.length,
          submitted: proposals.filter((p) => p.status === 'SUBMITTED').length,
          shortlisted: proposals.filter((p) => p.status === 'SHORTLISTED').length,
          accepted: proposals.filter((p) => p.status === 'ACCEPTED').length,
          rejected: proposals.filter((p) => p.status === 'REJECTED').length,
        },
      },
    });
  } catch (err: any) {
    console.error('getProjectProposals error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch project proposals', code: 'SERVER_ERROR' });
  }
}

export async function getProposalById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }

    const { id } = req.params;
    const proposal = db.findProposalById(id);
    if (!proposal) {
      res.status(404).json({ success: false, message: 'Proposal not found', code: 'NOT_FOUND' });
      return;
    }

    const project = db.findProjectById(proposal.projectId);

    // Permission check: freelancer who submitted, seller who owns project, or admin
    const isOwnerFreelancer = proposal.freelancerUserId === req.user.id;
    const isOwnerSeller = project && project.sellerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwnerFreelancer && !isOwnerSeller && !isAdmin) {
      res.status(403).json({ success: false, message: 'Unauthorized to view this proposal', code: 'FORBIDDEN' });
      return;
    }

    res.json({
      success: true,
      data: { proposal, project },
    });
  } catch (err: any) {
    console.error('getProposalById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch proposal', code: 'SERVER_ERROR' });
  }
}

export async function updateProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({ success: false, message: 'Unauthorized', code: 'FORBIDDEN' });
      return;
    }

    const { id } = req.params;
    const proposal = db.findProposalById(id);
    if (!proposal) {
      res.status(404).json({ success: false, message: 'Proposal not found', code: 'NOT_FOUND' });
      return;
    }

    if (proposal.freelancerUserId !== req.user.id) {
      res.status(403).json({ success: false, message: 'You can only edit your own proposal', code: 'FORBIDDEN' });
      return;
    }

    if (proposal.status !== 'SUBMITTED') {
      res.status(400).json({
        success: false,
        message: `Proposals cannot be modified once they are ${proposal.status.toLowerCase()}.`,
        code: 'PROPOSAL_LOCKED',
      });
      return;
    }

    const { coverLetter, bidAmount, estimatedDays, milestones } = req.body;
    const partial: any = {};
    if (coverLetter) partial.coverLetter = coverLetter.trim();
    if (bidAmount) partial.bidAmount = Number(bidAmount);
    if (estimatedDays) partial.estimatedDays = Number(estimatedDays);
    if (milestones) partial.milestones = milestones;

    const updated = db.updateProposal(id, partial);

    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PROPOSAL_EDITED',
      details: { proposalId: id, projectId: proposal.projectId },
    });

    res.json({
      success: true,
      message: 'Proposal updated successfully',
      data: { proposal: updated },
    });
  } catch (err: any) {
    console.error('updateProposal error:', err);
    res.status(500).json({ success: false, message: 'Failed to update proposal', code: 'SERVER_ERROR' });
  }
}

export async function withdrawProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({ success: false, message: 'Unauthorized', code: 'FORBIDDEN' });
      return;
    }

    const { id } = req.params;
    const withdrawn = db.withdrawProposal(id, req.user.id);

    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PROPOSAL_WITHDRAWN',
      details: { proposalId: id, projectId: withdrawn.projectId },
    });

    res.json({
      success: true,
      message: 'Your proposal has been withdrawn.',
      data: { proposal: withdrawn },
    });
  } catch (err: any) {
    console.error('withdrawProposal error:', err);
    res.status(500).json({ success: false, message: 'Failed to withdraw proposal', code: 'SERVER_ERROR' });
  }
}

export async function updateProposalStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }

    const { id } = req.params;
    const { status, clientNotes } = req.body;

    const validStatuses: ProposalStatus[] = ['SUBMITTED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid proposal status', code: 'INVALID_STATUS' });
      return;
    }

    const proposal = db.findProposalById(id);
    if (!proposal) {
      res.status(404).json({ success: false, message: 'Proposal not found', code: 'NOT_FOUND' });
      return;
    }

    const project = db.findProjectById(proposal.projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Associated project not found', code: 'NOT_FOUND' });
      return;
    }

    if (project.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Only the project creator can review applicants', code: 'FORBIDDEN' });
      return;
    }

    const updated = db.updateProposalStatus(id, status, clientNotes);

    // If accepted, optionally set project to in progress
    if (status === 'ACCEPTED' && project.status === 'PUBLISHED') {
      db.updateProject(project.id, { status: 'IN_PROGRESS' });
    }

    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PROPOSAL_STATUS_CHANGED',
      details: {
        proposalId: id,
        freelancerUserId: proposal.freelancerUserId,
        status,
        clientNotes,
      },
    });

    res.json({
      success: true,
      message: `Proposal marked as ${status.toLowerCase()}`,
      data: { proposal: updated },
    });
  } catch (err: any) {
    console.error('updateProposalStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update proposal status', code: 'SERVER_ERROR' });
  }
}

export async function checkMyProposalForProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.json({ success: true, data: { proposal: null } });
      return;
    }

    const { projectId } = req.params;
    const proposal = db.findProposalByProjectAndFreelancer(projectId, req.user.id);

    res.json({
      success: true,
      data: { proposal: proposal || null },
    });
  } catch (err: any) {
    console.error('checkMyProposalForProject error:', err);
    res.status(500).json({ success: false, message: 'Failed to check proposal status', code: 'SERVER_ERROR' });
  }
}
