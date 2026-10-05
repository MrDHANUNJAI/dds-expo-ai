import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Circle,
  Search,
  AlertTriangle,
  Shield,
  File,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { communicationApi } from '../../services/communicationApi';
import { ConversationItem, MessageItem } from '../../types';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

interface ChatWorkspaceProps {
  initialConversationId?: string;
  onOpenDispute?: (projectId: string, contractId?: string) => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  initialConversationId,
  onOpenDispute,
}) => {
  const { user } = useAuth();
  const {
    onlineUserIds,
    typingUsers,
    joinConversation,
    leaveConversation,
    sendRealtimeMessage,
    startTyping,
    stopTyping,
    markAsRead,
    lastMessage,
  } = useSocket();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversations list
  const loadConversations = async () => {
    try {
      setLoadingConvs(true);
      const res = await communicationApi.getConversations();
      setConversations(res.conversations);
      if (!activeConvId && res.conversations.length > 0) {
        setActiveConvId(res.conversations[0].id);
      }
    } catch (err) {
      console.warn('Could not load conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // When active conversation changes, join room and load messages
  useEffect(() => {
    if (!activeConvId) return;

    joinConversation(activeConvId);
    markAsRead(activeConvId);

    const loadMsgs = async () => {
      setLoadingMsgs(true);
      try {
        const msgList = await communicationApi.getConversationMessages(activeConvId);
        setMessages(msgList);
      } catch (err) {
        console.warn('Could not load messages:', err);
      } finally {
        setLoadingMsgs(false);
      }
    };

    loadMsgs();

    return () => {
      leaveConversation(activeConvId);
    };
  }, [activeConvId]);

  // Handle incoming real-time socket messages
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.conversationId === activeConvId) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === lastMessage.id)) return prev;
        return [...prev, lastMessage];
      });
      markAsRead(activeConvId);
    }

    // Update conversations list preview
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === lastMessage.conversationId) {
          return {
            ...c,
            lastMessage: {
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              senderName: lastMessage.senderName,
              createdAt: lastMessage.createdAt,
            },
          };
        }
        return c;
      })
    );
  }, [lastMessage, activeConvId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!activeConvId) return;

    startTyping(activeConvId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(activeConvId);
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachmentName) || !activeConvId) return;

    const content = inputText.trim();
    setInputText('');

    let attachments: any[] | undefined = undefined;
    if (attachmentName) {
      attachments = [
        {
          id: `att-${Date.now()}`,
          name: attachmentName,
          size: 1024 * 45,
          type: 'application/pdf',
          url: '#',
        },
      ];
      setAttachmentName(null);
    }

    stopTyping(activeConvId);

    // Send through WebSocket service
    sendRealtimeMessage(activeConvId, content, attachments);

    // Optimistically add to messages
    const optimisticMsg: MessageItem = {
      id: `opt-${Date.now()}`,
      conversationId: activeConvId,
      senderId: user?.id || '',
      senderName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      senderRole: user?.role || 'FREELANCER',
      type: 'TEXT',
      content,
      attachments,
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchFilter.toLowerCase();
    return (
      c.otherUser.name.toLowerCase().includes(q) ||
      (c.projectTitle && c.projectTitle.toLowerCase().includes(q)) ||
      (c.otherUser.companyName && c.otherUser.companyName.toLowerCase().includes(q))
    );
  });

  const isOtherUserOnline = activeConv ? onlineUserIds.has(activeConv.otherUser.id) : false;
  const currentTypingPerson = activeConvId ? typingUsers[activeConvId] : undefined;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col md:flex-row h-[680px]">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Direct Messages
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              {conversations.length} Active
            </span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100/70 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingConvs ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading messages...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No active conversations found.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = c.id === activeConvId;
              const isOnline = onlineUserIds.has(c.otherUser.id);
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      src={c.otherUser.avatarUrl}
                      name={c.otherUser.name}
                      size="md"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      title={isOnline ? 'Online now' : 'Offline'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {c.otherUser.name}
                      </span>
                      {c.lastMessage && (
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                          {new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    {c.projectTitle && (
                      <p className="text-[11px] text-indigo-600 truncate font-medium mt-0.5">
                        {c.projectTitle}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {c.lastMessage ? c.lastMessage.content : 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Chat Pane */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar
                  src={activeConv.otherUser.avatarUrl}
                  name={activeConv.otherUser.name}
                  size="md"
                />
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                    isOtherUserOnline ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {activeConv.otherUser.name}
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                    {activeConv.otherUser.role}
                  </span>
                  {activeConv.otherUser.companyName && (
                    <span className="text-xs text-slate-400">
                      • {activeConv.otherUser.companyName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                  <span className="text-indigo-600 font-medium">
                    {activeConv.projectTitle || 'Marketplace Project'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className={isOtherUserOnline ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                    {isOtherUserOnline ? 'Active on platform' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenDispute && (
                <button
                  type="button"
                  onClick={() => onOpenDispute(activeConv.projectId, activeConv.contractId)}
                  className="px-2.5 py-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open Dispute Arbitration"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dispute</span>
                </button>
              )}
            </div>
          </div>

          {/* Safety Notice Banner */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
            <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              Always keep communications and payments on WorkNova to protect funds in Escrow.
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
            {loadingMsgs ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading conversation...</div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No messages yet. Send an opening message to begin collaboration.
              </div>
            ) : (
              messages.map((m) => {
                const isMine = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs ${
                        isMine
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {!isMine && (
                        <p className="text-[10px] font-bold text-slate-500 mb-1">
                          {m.senderName}
                        </p>
                      )}
                      <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>

                      {/* Attachments */}
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-indigo-500/30 space-y-1">
                          {m.attachments.map((att) => (
                            <div
                              key={att.id}
                              className={`flex items-center gap-2 p-1.5 rounded-lg text-[11px] ${
                                isMine ? 'bg-indigo-700/60 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <File className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate flex-1">{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div
                        className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                          isMine ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMine && (
                          <span>
                            {m.status === 'READ' ? (
                              <CheckCheck className="w-3 h-3 text-emerald-300" />
                            ) : (
                              <Check className="w-3 h-3 text-indigo-300" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing status indicator */}
            {currentTypingPerson && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic py-1">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span>{currentTypingPerson} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachment Preview Chip */}
          {attachmentName && (
            <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between text-xs text-indigo-800">
              <div className="flex items-center gap-2 truncate">
                <File className="w-4 h-4 text-indigo-600" />
                <span className="truncate">{attachmentName}</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachmentName(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
          >
            <button
              type="button"
              onClick={() => {
                const simulatedFiles = ['Technical-Specification-v2.pdf', 'Design-System-Tokens.zip', 'Deliverable-Bundle-Build.tar.gz'];
                const choice = simulatedFiles[Math.floor(Math.random() * simulatedFiles.length)];
                setAttachmentName(choice);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              title="Attach document or asset"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="Type your message... (Press Enter to send)"
              value={inputText}
              onChange={handleInputChange}
              className="flex-1 text-xs py-2 px-3.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!inputText.trim() && !attachmentName}
              className="gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
          <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-800 text-sm">No conversation selected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Select an active project thread from the list on the left to review messages, exchange attachments, and collaborate with your counterparty.
          </p>
        </div>
      )}
    </div>
  );
};
