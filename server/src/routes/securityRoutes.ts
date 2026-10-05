import { Router } from 'express';
import {
  getActiveSessions,
  revokeSession,
  revokeOtherSessions,
  getSecurityActivity,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  changePassword,
} from '../controllers/securityController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/sessions', getActiveSessions);
router.delete('/sessions/:id', revokeSession);
router.post('/sessions/revoke-others', revokeOtherSessions);
router.get('/activity', getSecurityActivity);
router.post('/2fa/setup', setupTwoFactor);
router.post('/2fa/enable', enableTwoFactor);
router.post('/2fa/disable', disableTwoFactor);
router.post('/change-password', changePassword);

export default router;
