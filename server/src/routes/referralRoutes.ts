import { Router } from 'express';
import { getReferralProfile, applyReferralCode } from '../controllers/referralController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/my', getReferralProfile);
router.post('/apply', applyReferralCode);

export default router;
