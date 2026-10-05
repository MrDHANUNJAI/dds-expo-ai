import { Router } from 'express';
import {
  getSubscriptionPlans,
  getMySubscription,
  subscribeToPlan,
  cancelSubscription,
} from '../controllers/subscriptionController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/plans', getSubscriptionPlans);
router.use(authenticate);
router.get('/my', getMySubscription);
router.post('/subscribe', subscribeToPlan);
router.post('/cancel/:id', cancelSubscription);

export default router;
