import { Router } from 'express';
import {
  search,
  getRecommendedFreelancers,
  getRecommendedProjects,
  getProfileCompleteness,
} from '../controllers/searchController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public search
router.get('/', search);
router.get('/recommendations/freelancers/:projectId', getRecommendedFreelancers);

// Protected recommendations & completeness
router.get('/recommendations/projects', authenticate, getRecommendedProjects);
router.get('/profile-completeness', authenticate, getProfileCompleteness);

export default router;
