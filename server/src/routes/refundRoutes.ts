import { Router } from 'express';
import { requestRefund, getRefunds, getRefundById } from '../controllers/refundController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', requestRefund);
router.get('/', getRefunds);
router.get('/:id', getRefundById);

export default router;
