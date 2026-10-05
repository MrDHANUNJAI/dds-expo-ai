import { Router } from 'express';
import {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
  getOrganizationMembers,
  inviteOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMemberRole,
  acceptInvitation,
} from '../controllers/organizationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/my', getMyOrganizations);
router.post('/', createOrganization);
router.post('/invitations/accept', acceptInvitation);
router.get('/:id', getOrganizationById);
router.put('/:id', updateOrganization);
router.get('/:id/members', getOrganizationMembers);
router.post('/:id/members/invite', inviteOrganizationMember);
router.delete('/:id/members/:memberId', removeOrganizationMember);
router.put('/:id/members/:memberId/role', updateOrganizationMemberRole);

export default router;
