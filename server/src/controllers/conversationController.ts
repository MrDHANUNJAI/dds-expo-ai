import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { isUserOnline, getSocketIO } from '../services/socketService';
import { emailService } from '../services/emailService';

export async function getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const conversations = db.listUserConversations(req.user.id);
    const withOnlineStatus = conversations.map((c) => ({
      ...c,
      otherUser: {
        ...c.otherUser,
        isOnline: isUserOnline(c.otherUser.id),
      },
    }));

    res.json({
      success: true,
      data: { conversations: withOnlineStatus },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
}

export async function getOrCreateConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { projectId, contractId, sellerId, freelancerId } = req.body;
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Project ID is required', code: 'VALIDATION_ERROR' });
      return;
    }

    let finalSellerId = sellerId;
    let finalFreelancerId = freelancerId;

    if (contractId) {
      const contract = db.findContractById(contractId);
      if (contract) {
        finalSellerId = contract.sellerId;
        finalFreelancerId = contract.freelancerUserId;
      }
    }

    if (!finalSellerId || !finalFreelancerId) {
      const project = db.findProjectById(projectId);
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }
      finalSellerId = project.sellerId;
      finalFreelancerId = req.user.role === 'FREELANCER' ? req.user.id : freelancerId;
    }

    if (req.user.id !== finalSellerId && req.user.id !== finalFreelancerId && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized to participate in this project conversation' });
      return;
    }

    const conv = db.createConversation({
      projectId,
      contractId,
      sellerId: finalSellerId,
      freelancerId: finalFreelancerId,
      status: 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      data: { conversation: conv },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to start conversation' });
  }
}

export async function getConversationById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const conv = db.findConversationById(id);
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found', code: 'NOT_FOUND' });
      return;
    }

    if (conv.sellerId !== req.user.id && conv.freelancerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized to view this conversation', code: 'FORBIDDEN' });
      return;
    }

    const otherUserId = conv.sellerId === req.user.id ? conv.freelancerId : conv.sellerId;
    const otherUser = db.findUserById(otherUserId);
    const project = db.findProjectById(conv.projectId);
    const contract = conv.contractId ? db.findContractById(conv.contractId) : null;

    res.json({
      success: true,
      data: {
        conversation: conv,
        otherUser: otherUser
          ? {
              id: otherUser.id,
              name: `${otherUser.firstName} ${otherUser.lastName}`,
              role: otherUser.role,
              avatarUrl: otherUser.avatarUrl,
              isOnline: isUserOnline(otherUser.id),
            }
          : null,
        project,
        contract,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
}

export async function getConversationMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { limit, before, search } = req.query;

    const conv = db.findConversationById(id);
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found' });
      return;
    }

    if (conv.sellerId !== req.user.id && conv.freelancerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Auto mark read when opening
    db.markConversationMessagesRead(id, req.user.id);

    const messages = db.getConversationMessages(id, {
      limit: limit ? Number(limit) : 50,
      before: before ? String(before) : undefined,
      search: search ? String(search) : undefined,
    });

    res.json({
      success: true,
      data: { messages },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to load messages' });
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (db.isUserSuspended(req.user.id)) {
      res.status(403).json({ success: false, message: 'Account suspended. Messaging is disabled.', code: 'ACCOUNT_SUSPENDED' });
      return;
    }

    if (db.isMessagingRestricted(req.user.id)) {
      res.status(403).json({ success: false, message: 'Messaging is restricted on your account.', code: 'MESSAGING_RESTRICTED' });
      return;
    }

    const { id } = req.params;
    const { content, messageType, attachments, replyToMessageId } = req.body;

    const conv = db.findConversationById(id);
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found' });
      return;
    }

    if (conv.sellerId !== req.user.id && conv.freelancerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const recipientId = conv.sellerId === req.user.id ? conv.freelancerId : conv.sellerId;
    if (db.isUserBlocked(req.user.id, recipientId)) {
      res.status(403).json({ success: false, message: 'Communication with this user is blocked' });
      return;
    }

    const text = (content || '').trim();
    const cleanAttachments = attachments || [];
    if (!text && cleanAttachments.length === 0) {
      res.status(400).json({ success: false, message: 'Message content or attachments required' });
      return;
    }

    const msg = db.createMessage({
      conversationId: id,
      senderId: req.user.id,
      senderRole: req.user.role,
      messageType: messageType || (cleanAttachments.length > 0 ? 'FILE' : 'TEXT'),
      content: text,
      attachments: cleanAttachments,
      replyToMessageId,
      status: 'SENT',
    });

    // Realtime notification via Socket.IO
    const io = getSocketIO();
    if (io) {
      io.to(`conversation:${id}`).emit('message:new', msg);
      io.to(`user:${recipientId}`).emit('conversation:updated', { conversationId: id, lastMessage: msg });
    }

    const notif = db.createNotification({
      userId: recipientId,
      type: 'NEW_MESSAGE',
      title: `New message from ${req.user.firstName} ${req.user.lastName}`,
      message: text.length > 60 ? `${text.slice(0, 60)}...` : text || 'Sent an attachment',
      entityType: 'message',
      entityId: id,
    });

    if (io) {
      io.to(`user:${recipientId}`).emit('notification:new', notif);
    }

    // Optional email dispatch hook
    const recipient = db.findUserById(recipientId);
    if (recipient && !isUserOnline(recipientId)) {
      const project = db.findProjectById(conv.projectId);
      emailService.sendNewMessageNotification(
        recipient.email,
        `${recipient.firstName} ${recipient.lastName}`,
        `${req.user.firstName} ${req.user.lastName}`,
        project?.title || 'Project',
        text || 'Sent an attachment'
      );
    }

    res.status(201).json({
      success: true,
      data: { message: msg },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to send message' });
  }
}

export async function editMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { content } = req.body;

    const msg = db.findMessageById(id);
    if (!msg) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }

    if (msg.senderId !== req.user.id) {
      res.status(403).json({ success: false, message: 'Cannot edit messages sent by another user' });
      return;
    }

    // Window: within 10 minutes
    const ageMs = Date.now() - new Date(msg.createdAt).getTime();
    if (ageMs > 10 * 60 * 1000) {
      res.status(400).json({
        success: false,
        message: 'Messages can only be edited within 10 minutes of sending.',
        code: 'EDIT_WINDOW_EXPIRED',
      });
      return;
    }

    const updated = db.updateMessage(id, {
      content: content.trim(),
      editedAt: new Date().toISOString(),
    });

    const io = getSocketIO();
    io?.to(`conversation:${msg.conversationId}`).emit('message:edited', updated);

    res.json({
      success: true,
      data: { message: updated },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to edit message' });
  }
}

export async function deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const deleted = db.softDeleteMessage(id, req.user.id);

    const io = getSocketIO();
    io?.to(`conversation:${deleted.conversationId}`).emit('message:deleted', {
      id: deleted.id,
      conversationId: deleted.conversationId,
    });

    res.json({
      success: true,
      message: 'Message deleted',
      data: { message: deleted },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to delete message' });
  }
}

export async function markConversationAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const count = db.markConversationMessagesRead(id, req.user.id);

    const io = getSocketIO();
    io?.to(`conversation:${id}`).emit('message:read_receipt', {
      conversationId: id,
      readerUserId: req.user.id,
      readAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Marked ${count} messages as read`,
      data: { readCount: count },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update read status' });
  }
}

export async function blockParticipant(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params; // conversationId
    const { reason } = req.body;

    const conv = db.findConversationById(id);
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found' });
      return;
    }

    const targetUserId = conv.sellerId === req.user.id ? conv.freelancerId : conv.sellerId;
    const block = db.blockUser(req.user.id, targetUserId, reason);

    res.json({
      success: true,
      message: 'User blocked from direct messaging',
      data: { block },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to block user' });
  }
}
