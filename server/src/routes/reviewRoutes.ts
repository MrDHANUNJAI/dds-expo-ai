import { Router } from 'express';
import {
  submitProjectReview,
  getUserReviews,
  updateReview,
  reportReview,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public user review query
router.get('/user/:userId', getUserReviews);

// Protected review interactions
router.post('/project/:projectId', authenticate, submitProjectReview);
router.put('/:id', authenticate, updateReview);
router.post('/:id/report', authenticate, reportReview);

export default router;
