import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { MessageItem, NotificationItem } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: Set<string>;
  typingUsers: Record<string, string>; // conversationId -> typing user name
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendRealtimeMessage: (conversationId: string, content: string, attachments?: any[]) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  markAsRead: (conversationId: string) => void;
  lastMessage: MessageItem | null;
  latestNotification: NotificationItem | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUserIds: new Set(),
  typingUsers: {},
  joinConversation: () => {},
  leaveConversation: () => {},
  sendRealtimeMessage: () => {},
  startTyping: () => {},
  stopTyping: () => {},
  markAsRead: () => {},
  lastMessage: null,
  latestNotification: null,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [lastMessage, setLastMessage] = useState<MessageItem | null>(null);
  const [latestNotification, setLatestNotification] = useState<NotificationItem | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('user:presence', (data: { userId: string; status: 'ONLINE' | 'OFFLINE' }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (data.status === 'ONLINE') {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    });

    newSocket.on('message:new', (msg: MessageItem) => {
      setLastMessage(msg);
    });

    newSocket.on('typing:status', (data: { conversationId: string; userId: string; userName: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (data.isTyping) {
          next[data.conversationId] = data.userName;
        } else {
          delete next[data.conversationId];
        }
        return next;
      });
    });

    newSocket.on('notification:new', (notif: NotificationItem) => {
      setLatestNotification(notif);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:join', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:leave', conversationId);
  }, []);

  const sendRealtimeMessage = useCallback((conversationId: string, content: string, attachments?: any[]) => {
    socketRef.current?.emit('message:send', { conversationId, content, attachments });
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:start', { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:stop', { conversationId });
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    socketRef.current?.emit('message:read', { conversationId });
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUserIds,
        typingUsers,
        joinConversation,
        leaveConversation,
        sendRealtimeMessage,
        startTyping,
        stopTyping,
        markAsRead,
        lastMessage,
        latestNotification,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
