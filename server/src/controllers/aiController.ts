import { Request, Response } from 'express';
import { aiService } from '../services/ai/aiService';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function createProjectWithAI(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
      res.status(400).json({ success: false, message: 'Please provide a clear description prompt.' });
      return;
    }

    const draft = await aiService.createProjectWithAI(prompt, req.user?.id);
    res.json({
      success: true,
      message: 'AI project draft generated for your review',
      data: { draft },
    });
  } catch (err: any) {
    console.error('AI project creation error:', err);
    res.status(500).json({ success: false, message: 'AI assistant currently unavailable. You can continue manually.' });
  }
}

export async function extractSkills(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ success: false, message: 'Content required' });
      return;
    }

    const skills = await aiService.extractSkills(content, req.user?.id);
    res.json({ success: true, data: { skills } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to extract skills' });
  }
}

export async function analyzeRequirements(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { description } = req.body;
    if (!description) {
      res.status(400).json({ success: false, message: 'Description required' });
      return;
    }

    const analysis = await aiService.analyzeRequirements(description, req.user?.id);
    res.json({ success: true, data: analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to analyze requirements' });
  }
}

export async function improveProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectTitle, projectDescription, currentCoverLetter, freelancerSkills } = req.body;
    const result = await aiService.improveProposal(
      {
        projectTitle: projectTitle || 'Project',
        projectDescription: projectDescription || '',
        currentCoverLetter: currentCoverLetter || '',
        freelancerSkills: freelancerSkills || [],
      },
      req.user?.id
    );

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to improve proposal' });
  }
}

export async function checkProposalQuality(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectDescription, coverLetter, bidAmount } = req.body;
    const result = await aiService.checkProposalQuality(
      {
        projectDescription: projectDescription || '',
        coverLetter: coverLetter || '',
        bidAmount: Number(bidAmount || 0),
      },
      req.user?.id
    );

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to evaluate proposal' });
  }
}

export async function improveProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { role, currentTitle, bio, skills } = req.body;
    const result = await aiService.improveProfile(
      {
        role: role || 'FREELANCER',
        currentTitle: currentTitle || '',
        bio: bio || '',
        skills: skills || [],
      },
      req.user?.id
    );

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to improve profile' });
  }
}

export async function explainMatch(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId, freelancerId } = req.body;
    const project = db.findProjectById(projectId);
    const freelancer = db.findUserById(freelancerId);
    const flProfile = db.findFreelancerProfileByUserId(freelancerId);

    if (!project || !freelancer) {
      res.status(404).json({ success: false, message: 'Project or freelancer not found' });
      return;
    }

    const reasons = await aiService.explainFreelancerMatch(project, {
      name: `${freelancer.firstName} ${freelancer.lastName}`,
      title: flProfile?.professionalTitle || 'Software Engineer',
      rating: 5.0,
      completedProjects: 14,
      skills: flProfile?.skills || project.skills,
    });

    res.json({ success: true, data: { reasons } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to generate match explanation' });
  }
}

export async function parseSearchQuery(req: Request, res: Response): Promise<void> {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ success: false, message: 'Query is required' });
      return;
    }

    const parsed = await aiService.parseNaturalLanguageSearch(query);
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to parse search' });
  }
}

export async function supportAssistant(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ success: false, message: 'Query is required' });
      return;
    }

    const response = await aiService.supportAssistant(query, req.user?.id);
    res.json({ success: true, data: response });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Support assistant currently unavailable' });
  }
}

export async function summarizeDispute(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const summary = await aiService.summarizeDispute(id, req.user.id);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to summarize dispute' });
  }
}

export async function getAIUsageMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const metrics = db.getAIUsageSummary();
    res.json({ success: true, data: metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch AI usage' });
  }
}
