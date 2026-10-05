import { Router } from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  replyToTicket,
  closeTicket,
  getFAQs,
} from '../controllers/supportController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public FAQs
router.get('/faq', getFAQs);

// Protected tickets
router.post('/tickets', authenticate, createTicket);
router.get('/tickets', authenticate, getTickets);
router.get('/tickets/:id', authenticate, getTicketById);
router.post('/tickets/:id/messages', authenticate, replyToTicket);
router.post('/tickets/:id/close', authenticate, closeTicket);

export default router;
