import { Router } from 'express';
import {
  listContracts,
  getContractById,
  createMilestone,
  submitMilestoneDelivery,
} from '../controllers/contractController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', listContracts);
router.get('/:id', getContractById);
router.post('/milestones', createMilestone);
router.post('/milestones/:id/deliver', submitMilestoneDelivery);

export default router;
