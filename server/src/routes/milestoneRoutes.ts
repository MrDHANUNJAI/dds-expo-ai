import { Router } from 'express';
import { getMilestonePayment, releaseMilestone } from '../controllers/milestoneFinancialController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/:id/payment', getMilestonePayment);
router.post('/:id/release', releaseMilestone);

export default router;
