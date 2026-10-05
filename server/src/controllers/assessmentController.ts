import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../models/db';

export async function getSkillGraph(_req: Request, res: Response): Promise<void> {
  try {
    const nodes = db.getSkillGraph();
    res.json({ success: true, graph: nodes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch skill graph' });
  }
}

export async function listSkillAssessments(req: Request, res: Response): Promise<void> {
  try {
    const skillName = req.query.skill as string | undefined;
    const assessments = db.listSkillAssessments(skillName);
    // Strip correctOptionIndex from public list for security before taking test
    const sanitized = assessments.map((a) => ({
      ...a,
      questions: a.questions.map(({ correctOptionIndex, explanation, ...q }) => q),
    }));
    res.json({ success: true, assessments: sanitized });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to list assessments' });
  }
}

export async function getSkillAssessmentById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const assessment = db.getSkillAssessmentById(id);
    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }
    const sanitized = {
      ...assessment,
      questions: assessment.questions.map(({ correctOptionIndex, explanation, ...q }) => q),
    };
    res.json({ success: true, assessment: sanitized });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to get assessment' });
  }
}

export async function submitSkillAssessment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { answers } = req.body; // { q1: 0, q2: 1, ... }

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ success: false, message: 'Answers object is required' });
      return;
    }

    const result = db.submitSkillAssessment(userId, id, answers);
    res.json({
      success: true,
      message: result.passed
        ? 'Congratulations! You passed the assessment and earned a verified skill badge.'
        : 'Assessment completed. You did not meet the passing threshold. You may retake it.',
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to submit assessment' });
  }
}

export async function getMyAssessmentSubmissions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const submissions = db.getUserAssessmentSubmissions(userId);
    res.json({ success: true, submissions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to get submissions' });
  }
}
