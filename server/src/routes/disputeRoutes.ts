import { Router } from 'express';
import {
  createDispute,
  getDisputes,
  getDisputeById,
  respondToDispute,
  addEvidence,
} from '../controllers/disputeController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', createDispute);
router.get('/', getDisputes);
router.get('/:id', getDisputeById);
router.post('/:id/respond', respondToDispute);
router.post('/:id/evidence', addEvidence);

export default router;
