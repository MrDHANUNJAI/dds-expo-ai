import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentById,
  getMyPayments,
  handleWebhook,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/create', authenticate, createPaymentOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/me', authenticate, getMyPayments);
router.get('/:id', authenticate, getPaymentById);

// Public webhook endpoint for payment provider (signature verified inside controller)
router.post('/webhook', handleWebhook);

export default router;
