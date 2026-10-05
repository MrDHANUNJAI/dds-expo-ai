import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getConversationById,
  getConversationMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationAsRead,
  blockParticipant,
} from '../controllers/conversationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.post('/', getOrCreateConversation);
router.get('/:id', getConversationById);
router.get('/:id/messages', getConversationMessages);
router.post('/:id/messages', sendMessage);
router.put('/messages/:id', editMessage);
router.delete('/messages/:id', deleteMessage);
router.post('/:id/read', markConversationAsRead);
router.post('/:id/block', blockParticipant);

export default router;
