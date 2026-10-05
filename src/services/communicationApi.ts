import {
  ConversationItem,
  MessageItem,
  NotificationItem,
  ReviewItem,
  DisputeItem,
  SupportTicketItem,
} from '../types';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('worknova_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const communicationApi = {
  // --- CONVERSATIONS ---
  async getConversations(status?: string): Promise<{ conversations: ConversationItem[]; unreadTotal: number }> {
    const q = status ? `?status=${status}` : '';
    const res = await fetch(`/api/conversations${q}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch conversations');
    return json.data;
  },

  async getOrCreateConversation(data: {
    projectId: string;
    freelancerId: string;
    contractId?: string;
    initialMessage?: string;
  }): Promise<ConversationItem> {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to start conversation');
    return json.data.conversation;
  },

  async getConversationMessages(conversationId: string): Promise<MessageItem[]> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch messages');
    return json.data.messages;
  },

  async sendMessage(
    conversationId: string,
    content: string,
    attachments?: { id: string; name: string; size: number; type: string; url: string }[]
  ): Promise<MessageItem> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ content, attachments }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to send message');
    return json.data.message;
  },

  async markConversationAsRead(conversationId: string): Promise<void> {
    await fetch(`/api/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
  },

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const res = await fetch('/api/notifications', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch notifications');
    return json.data;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
  },

  // --- REVIEWS ---
  async submitReview(projectId: string, data: {
    overallRating: number;
    skillsRating?: number;
    communicationRating?: number;
    adherenceRating?: number;
    qualityRating?: number;
    feedback: string;
  }): Promise<ReviewItem> {
    const res = await fetch(`/api/reviews/project/${projectId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to submit review');
    return json.data.review;
  },

  async getUserReviews(userId: string): Promise<{ reviews: ReviewItem[]; aggregation: any }> {
    const res = await fetch(`/api/reviews/user/${userId}`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch reviews');
    return json.data;
  },

  // --- DISPUTES ---
  async getDisputes(): Promise<DisputeItem[]> {
    const res = await fetch('/api/disputes', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load disputes');
    return json.data.disputes;
  },

  async createDispute(data: {
    projectId: string;
    contractId: string;
    milestoneId?: string;
    reason: string;
    description: string;
    disputedAmount?: number;
    currency?: string;
  }): Promise<DisputeItem> {
    const res = await fetch('/api/disputes', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to file dispute');
    return json.data.dispute;
  },

  // --- SUPPORT TICKETS ---
  async getSupportTickets(): Promise<SupportTicketItem[]> {
    const res = await fetch('/api/support/tickets', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load support tickets');
    return json.data.tickets;
  },

  async createSupportTicket(data: {
    category: string;
    subject: string;
    description: string;
    priority?: string;
  }): Promise<SupportTicketItem> {
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create support ticket');
    return json.data.ticket;
  },

  async replySupportTicket(ticketId: string, message: string): Promise<SupportTicketItem> {
    const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ message }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to reply to ticket');
    return json.data.ticket;
  },
};
