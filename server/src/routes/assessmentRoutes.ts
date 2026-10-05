import { Router } from 'express';
import {
  getSkillGraph,
  listSkillAssessments,
  getSkillAssessmentById,
  submitSkillAssessment,
  getMyAssessmentSubmissions,
} from '../controllers/assessmentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public skill exploration & assessment directory
router.get('/graph', getSkillGraph);
router.get('/tests', listSkillAssessments);
router.get('/tests/:id', getSkillAssessmentById);

// Authenticated submissions
router.post('/tests/:id/submit', authenticate, submitSkillAssessment);
router.get('/my-submissions', authenticate, getMyAssessmentSubmissions);

export default router;
