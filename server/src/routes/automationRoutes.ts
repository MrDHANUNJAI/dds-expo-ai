import { Router } from 'express';
import {
  triggerDeadlineCheck,
  listJobs,
  retryJob,
} from '../controllers/automationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/trigger-deadlines', triggerDeadlineCheck);
router.get('/jobs', listJobs);
router.post('/jobs/:id/retry', retryJob);

export default router;
