import { Request, Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function search(req: Request, res: Response): Promise<void> {
  try {
    const {
      q,
      tab,
      category,
      subcategory,
      minBudget,
      maxBudget,
      experienceLevel,
      ratingMin,
      verifiedOnly,
      sortBy,
    } = req.query;

    const results = db.searchMarketplace({
      query: q ? String(q) : undefined,
      tab: tab ? (String(tab).toUpperCase() as any) : 'ALL',
      category: category ? String(category) : undefined,
      subcategory: subcategory ? String(subcategory) : undefined,
      minBudget: minBudget ? Number(minBudget) : undefined,
      maxBudget: maxBudget ? Number(maxBudget) : undefined,
      experienceLevel: experienceLevel ? String(experienceLevel) : undefined,
      ratingMin: ratingMin ? Number(ratingMin) : undefined,
      verifiedOnly: verifiedOnly === 'true',
      sortBy: sortBy ? (String(sortBy) as any) : 'RELEVANT',
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Search query failed' });
  }
}

export async function getRecommendedFreelancers(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const { limit } = req.query;

    const recommendations = db.getRecommendedFreelancersForProject(
      projectId,
      limit ? Number(limit) : 5
    );

    res.json({
      success: true,
      data: { recommendations },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to generate freelancer recommendations' });
  }
}

export async function getRecommendedProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({ success: false, message: 'Only freelancers can view job recommendations' });
      return;
    }

    const { limit } = req.query;
    const recommendations = db.getRecommendedProjectsForFreelancer(
      req.user.id,
      limit ? Number(limit) : 6
    );

    res.json({
      success: true,
      data: { recommendations },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to generate project recommendations' });
  }
}

export async function getProfileCompleteness(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const completeness = db.calculateProfileCompleteness(req.user.id);
    res.json({
      success: true,
      data: completeness,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to calculate profile completeness' });
  }
}
