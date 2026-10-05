import { Router } from 'express';
import {
  submitProposal,
  getMyProposals,
  getProjectProposals,
  getProposalById,
  updateProposal,
  withdrawProposal,
  updateProposalStatus,
  checkMyProposalForProject,
} from '../controllers/proposalController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Freelancer routes
router.post('/', authenticate, requireRole('FREELANCER'), submitProposal);
router.get('/my-proposals', authenticate, requireRole('FREELANCER'), getMyProposals);
router.get('/check/:projectId', authenticate, checkMyProposalForProject);
router.put('/:id', authenticate, updateProposal);
router.patch('/:id/withdraw', authenticate, withdrawProposal);

// Seller & Admin proposal review routes
router.get('/project/:projectId', authenticate, getProjectProposals);
router.get('/:id', authenticate, getProposalById);
router.patch('/:id/status', authenticate, updateProposalStatus);

export default router;
