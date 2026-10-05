import { Router } from 'express';
import {
  getSellerProfile,
  updateSellerProfile,
  completeSellerOnboarding,
  uploadSellerAvatar,
} from '../controllers/sellerController';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import { uploadAvatar } from '../middleware/uploadMiddleware';

const router = Router();

// Protect all seller routes with Authentication + SELLER role
router.use(authenticate);
router.use(requireRole('SELLER'));

router.get('/me', getSellerProfile);
router.put('/me', updateSellerProfile);
router.post('/onboarding', completeSellerOnboarding);
router.post('/me/avatar', uploadAvatar.single('avatar'), uploadSellerAvatar);

export default router;
