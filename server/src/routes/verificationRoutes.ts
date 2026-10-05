import { Router } from 'express';
import {
  getMyVerifications,
  requestEmailVerification,
  verifyEmail,
  sendPhoneOTP,
  verifyPhoneOTP,
  submitIdentityVerification,
  submitBusinessVerification,
} from '../controllers/verificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/me', getMyVerifications);
router.post('/email/request', requestEmailVerification);
router.post('/email/verify', verifyEmail);
router.post('/phone/send-otp', sendPhoneOTP);
router.post('/phone/verify-otp', verifyPhoneOTP);
router.post('/identity/submit', submitIdentityVerification);
router.post('/business/submit', submitBusinessVerification);

export default router;
