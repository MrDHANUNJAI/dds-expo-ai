import { Router } from 'express';
import {
  getFreelancerProfile,
  updateFreelancerProfile,
  completeFreelancerOnboarding,
  uploadFreelancerAvatar,
} from '../controllers/freelancerController';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import { uploadAvatar } from '../middleware/uploadMiddleware';

const router = Router();

// Protect all freelancer routes with Authentication + FREELANCER role
router.use(authenticate);
router.use(requireRole('FREELANCER'));

router.get('/me', getFreelancerProfile);
router.put('/me', updateFreelancerProfile);
router.post('/onboarding', completeFreelancerOnboarding);
router.post('/me/avatar', uploadAvatar.single('avatar'), uploadFreelancerAvatar);

export default router;
