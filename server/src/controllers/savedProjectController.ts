import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function getSavedProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({ success: false, message: 'Unauthorized', code: 'FORBIDDEN' });
      return;
    }

    const savedRecords = db.listSavedProjects(req.user.id);
    const savedProjects = savedRecords
      .map((sr) => {
        const proj = db.findProjectById(sr.projectId);
        if (!proj) return null;
        return {
          ...proj,
          savedAt: sr.createdAt,
        };
      })
      .filter(Boolean);

    res.json({
      success: true,
      data: {
        savedProjects,
        savedProjectIds: savedRecords.map((s) => s.projectId),
      },
    });
  } catch (err: any) {
    console.error('getSavedProjects error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch saved projects', code: 'SERVER_ERROR' });
  }
}

export async function toggleSaveProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'FREELANCER') {
      res.status(403).json({
        success: false,
        message: 'Please sign in as a freelancer to save projects to your bookmarks.',
        code: 'FORBIDDEN',
      });
      return;
    }

    const { projectId } = req.params;
    const project = db.findProjectById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found', code: 'NOT_FOUND' });
      return;
    }

    const isSavedNow = db.toggleSaveProject(req.user.id, projectId);

    res.json({
      success: true,
      data: {
        isSaved: isSavedNow,
        projectId,
      },
      message: isSavedNow ? 'Project bookmarked to your saved list.' : 'Project removed from bookmarks.',
    });
  } catch (err: any) {
    console.error('toggleSaveProject error:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle save project', code: 'SERVER_ERROR' });
  }
}
