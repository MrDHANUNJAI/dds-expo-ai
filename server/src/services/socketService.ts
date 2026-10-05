import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/tokenUtils';
import { db } from '../models/db';
import { MessageType, MessageAttachment } from '../types';

let io: Server | null = null;
const onlineUsers = new Map<string, number>(); // userId -> active socket count
const userRateLimits = new Map<string, number[]>(); // userId -> timestamps

export function initSocketService(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication Middleware
  io.use((socket: Socket, next) => {
    let token = socket.handshake.auth?.token;

    if (!token && socket.handshake.headers.cookie) {
      const match = socket.handshake.headers.cookie.match(/worknova_access_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token && typeof socket.handshake.headers.authorization === 'string') {
      const parts = socket.handshake.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return next(new Error('AUTHENTICATION_ERROR: Token not provided'));
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return next(new Error('AUTHENTICATION_ERROR: Invalid or expired token'));
    }

    const user = db.findUserById(payload.userId);
    if (!user) {
      return next(new Error('AUTHENTICATION_ERROR: User does not exist'));
    }

    (socket as any).user = user;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    if (!user) return;

    const userId = user.id;

    // Track presence
    const currentCount = onlineUsers.get(userId) || 0;
    onlineUsers.set(userId, currentCount + 1);

    // Join user's personal notification room
    socket.join(`user:${userId}`);

    // If admin, join admin room
    if (user.role === 'ADMIN') {
      socket.join('room:admin');
    }

    // Broadcast user online if first connection
    if (currentCount === 0) {
      io?.emit('user:presence', { userId, status: 'ONLINE' });
    }

    // Join Conversation Room
    socket.on('conversation:join', (conversationId: string) => {
      const conv = db.findConversationById(conversationId);
      if (!conv) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // Check authorization
      if (conv.sellerId !== userId && conv.freelancerId !== userId && user.role !== 'ADMIN') {
        socket.emit('error', { message: 'Unauthorized for this conversation' });
        return;
      }

      socket.join(`conversation:${conversationId}`);
    });

    // Leave Conversation Room
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Send Real-Time Message
    socket.on(
      'message:send',
      async (data: {
        conversationId: string;
        content: string;
        messageType?: MessageType;
        attachments?: MessageAttachment[];
        replyToMessageId?: string;
      }) => {
        try {
          // 1. Check account suspension / restrictions
          if (db.isUserSuspended(userId)) {
            socket.emit('message:error', { message: 'Your account is suspended. Messaging is disabled.' });
            return;
          }
          if (db.isMessagingRestricted(userId)) {
            socket.emit('message:error', { message: 'Your messaging privileges are currently restricted.' });
            return;
          }

          // 2. Validate conversation access
          const conv = db.findConversationById(data.conversationId);
          if (!conv) {
            socket.emit('message:error', { message: 'Conversation does not exist.' });
            return;
          }

          if (conv.sellerId !== userId && conv.freelancerId !== userId && user.role !== 'ADMIN') {
            socket.emit('message:error', { message: 'You are not a participant in this conversation.' });
            return;
          }

          // Check if opposing user blocked or is blocked
          const recipientId = conv.sellerId === userId ? conv.freelancerId : conv.sellerId;
          if (db.isUserBlocked(userId, recipientId)) {
            socket.emit('message:error', { message: 'Communication is blocked between you and this participant.' });
            return;
          }

          // 3. Rate limiting (max 12 messages per 10 seconds)
          const now = Date.now();
          const userTimestamps = userRateLimits.get(userId) || [];
          const recent = userTimestamps.filter((t) => now - t < 10000);
          if (recent.length >= 12) {
            socket.emit('message:error', {
              message: "You're sending messages too quickly. Please wait a few seconds.",
            });
            return;
          }
          recent.push(now);
          userRateLimits.set(userId, recent);

          // 4. Content validation
          const text = (data.content || '').trim();
          const attachments = data.attachments || [];
          if (!text && attachments.length === 0) {
            socket.emit('message:error', { message: 'Message content or attachment is required.' });
            return;
          }

          // 5. Persist message
          const msg = db.createMessage({
            conversationId: data.conversationId,
            senderId: userId,
            senderRole: user.role,
            messageType: data.messageType || (attachments.length > 0 ? 'FILE' : 'TEXT'),
            content: text,
            attachments,
            replyToMessageId: data.replyToMessageId,
            status: 'SENT',
          });

          // 6. Broadcast to conversation room
          io?.to(`conversation:${data.conversationId}`).emit('message:new', msg);

          // 7. Create in-app notification for recipient
          const notif = db.createNotification({
            userId: recipientId,
            type: 'NEW_MESSAGE',
            title: `New message from ${user.firstName} ${user.lastName}`,
            message: text.length > 60 ? `${text.slice(0, 60)}...` : text || 'Shared a project file',
            entityType: 'message',
            entityId: data.conversationId,
          });

          // Emit to recipient's personal room
          io?.to(`user:${recipientId}`).emit('notification:new', notif);
          io?.to(`user:${recipientId}`).emit('conversation:updated', {
            conversationId: data.conversationId,
            lastMessage: msg,
          });
        } catch (err: any) {
          console.error('Socket message:send error:', err);
          socket.emit('message:error', { message: err.message || 'Failed to send message.' });
        }
      }
    );

    // Typing Indicators
    socket.on('typing:start', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:status', {
        conversationId: data.conversationId,
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:status', {
        conversationId: data.conversationId,
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        isTyping: false,
      });
    });

    // Mark Messages as Read
    socket.on('message:read', (data: { conversationId: string }) => {
      const count = db.markConversationMessagesRead(data.conversationId, userId);
      if (count > 0) {
        socket.to(`conversation:${data.conversationId}`).emit('message:read_receipt', {
          conversationId: data.conversationId,
          readerUserId: userId,
          readAt: new Date().toISOString(),
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const active = (onlineUsers.get(userId) || 1) - 1;
      if (active <= 0) {
        onlineUsers.delete(userId);
        io?.emit('user:presence', { userId, status: 'OFFLINE' });
      } else {
        onlineUsers.set(userId, active);
      }
    });
  });

  return io;
}

export function getSocketIO(): Server | null {
  return io;
}

export function isUserOnline(userId: string): boolean {
  return (onlineUsers.get(userId) || 0) > 0;
}

export function broadcastSystemEvent(event: string, payload: any): void {
  io?.emit(event, payload);
}

export function notifyUserRealtime(userId: string, notification: any): void {
  io?.to(`user:${userId}`).emit('notification:new', notification);
}
