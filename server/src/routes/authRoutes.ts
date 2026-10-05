import { Router } from 'express';
import {
  registerFreelancer,
  registerSeller,
  login,
  adminLogin,
  logout,
  refreshSession,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
  deactivateAccount,
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Registration & Login with rate limiting
router.post('/freelancer/register', rateLimiter(20, 60), registerFreelancer);
router.post('/seller/register', rateLimiter(20, 60), registerSeller);
router.post('/login', rateLimiter(20, 60), login);
router.post('/admin/login', rateLimiter(15, 60), adminLogin);

// Session management
router.post('/refresh', refreshSession);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

// Password recovery
router.post('/forgot-password', rateLimiter(10, 60), forgotPassword);
router.post('/reset-password', rateLimiter(10, 60), resetPassword);

// Authenticated user security settings
router.post('/change-password', authenticate, changePassword);
router.post('/deactivate', authenticate, deactivateAccount);

export default router;
