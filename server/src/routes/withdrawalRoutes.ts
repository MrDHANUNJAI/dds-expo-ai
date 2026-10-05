import { Router } from 'express';
import { requestWithdrawal, getWithdrawals, getWithdrawalById } from '../controllers/withdrawalController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', requestWithdrawal);
router.get('/', getWithdrawals);
router.get('/:id', getWithdrawalById);

export default router;
