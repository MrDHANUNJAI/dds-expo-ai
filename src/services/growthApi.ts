function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('worknova_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  type: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  isPopular?: boolean;
  features: string[];
  limits: {
    proposalsPerMonth: number;
    aiTokensPerMonth: number;
    teamMembers: number;
    storageGb: number;
    platformFeeDiscountPercent: number;
  };
}

export interface UserSubscriptionInfo {
  subscription: {
    id: string;
    planId: string;
    planType: string;
    billingCycle: 'MONTHLY' | 'YEARLY';
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  plan: SubscriptionPlanItem;
  proposalsUsedThisMonth: number;
  proposalsRemaining: number;
}

export interface TaskItem {
  id: string;
  projectId: string;
  contractId: string;
  title: string;
  description: string;
  assigneeId?: string;
  assigneeName?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  milestoneId?: string;
  commentsCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  projectId: string;
  contractId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface WorkspaceFileItem {
  id: string;
  projectId: string;
  name: string;
  size: number;
  type: string;
  version: number;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  folder: string;
  createdAt: string;
}

export interface ReputationBreakdownData {
  score: number;
  onTimeDeliveryRate: number;
  repeatClientRate: number;
  averageRating: number;
  totalCompletedProjects: number;
  verifiedWorkHistoryCount: number;
  skillReputation: Record<string, 'EXCELLENT' | 'STRONG' | 'PROFICIENT' | 'GROWING'>;
  badges: {
    id: string;
    userId: string;
    badgeType: string;
    name: string;
    description: string;
    icon: string;
    awardedAt: string;
  }[];
}

export interface ReferralProfileData {
  code: string;
  referralLink: string;
  rewardPerReferral: number;
  currency: string;
  stats: {
    totalInvited: number;
    qualifiedCount: number;
    pendingCount: number;
    totalEarnedCredits: number;
  };
  referrals: any[];
  rewards: any[];
}

export const growthApi = {
  // Subscriptions
  async getPlans(): Promise<SubscriptionPlanItem[]> {
    const res = await fetch('/api/subscriptions/plans');
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getMySubscription(orgId?: string): Promise<UserSubscriptionInfo> {
    const url = orgId ? `/api/subscriptions/my?orgId=${orgId}` : '/api/subscriptions/my';
    const res = await fetch(url, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  async subscribe(planId: string, billingCycle: 'MONTHLY' | 'YEARLY', organizationId?: string): Promise<any> {
    const res = await fetch('/api/subscriptions/subscribe', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ planId, billingCycle, organizationId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Subscription failed');
    return json.data;
  },

  async cancelSubscription(subId: string): Promise<void> {
    const res = await fetch(`/api/subscriptions/cancel/${subId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to cancel subscription');
  },

  // Collaboration Tasks
  async getTasks(projectId: string, contractId?: string): Promise<TaskItem[]> {
    const url = contractId
      ? `/api/collaboration/${projectId}/tasks?contractId=${contractId}`
      : `/api/collaboration/${projectId}/tasks`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async createTask(projectId: string, data: Partial<TaskItem>): Promise<TaskItem> {
    const res = await fetch(`/api/collaboration/${projectId}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to create task');
    return json.data;
  },

  async updateTask(taskId: string, partial: Partial<TaskItem>): Promise<TaskItem> {
    const res = await fetch(`/api/collaboration/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(partial),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update task');
    return json.data;
  },

  async deleteTask(taskId: string): Promise<void> {
    const res = await fetch(`/api/collaboration/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to delete task');
  },

  // Activity Stream & Files
  async getActivities(projectId: string, contractId?: string): Promise<ActivityItem[]> {
    const url = contractId
      ? `/api/collaboration/${projectId}/activities?contractId=${contractId}`
      : `/api/collaboration/${projectId}/activities`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getFiles(projectId: string): Promise<WorkspaceFileItem[]> {
    const res = await fetch(`/api/collaboration/${projectId}/files`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async uploadFile(projectId: string, data: { name: string; url: string; size?: number; type?: string; folder?: string }): Promise<WorkspaceFileItem> {
    const res = await fetch(`/api/collaboration/${projectId}/files`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to record file');
    return json.data;
  },

  async deleteFile(fileId: string): Promise<void> {
    const res = await fetch(`/api/collaboration/files/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to delete file');
  },

  // Reputation & Badges
  async getUserReputation(userId: string): Promise<ReputationBreakdownData> {
    const res = await fetch(`/api/reputation/user/${userId}`);
    const json = await res.json();
    return json.data;
  },

  // Referrals
  async getReferralProfile(): Promise<ReferralProfileData> {
    const res = await fetch('/api/referrals/my', { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data;
  },

  async applyReferralCode(code: string): Promise<any> {
    const res = await fetch('/api/referrals/apply', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to apply referral code');
    return json;
  },

  // Currency & i18n
  async getCurrencies(): Promise<Record<string, { symbol: string; rate: number; name: string }>> {
    const res = await fetch('/api/i18n/currencies');
    const json = await res.json();
    return json.success ? json.data.currencies : {};
  },

  async convertCurrency(amount: number, from: string, to: string): Promise<{ convertedAmount: number; symbol: string; rate: number }> {
    const res = await fetch(`/api/i18n/convert?amount=${amount}&from=${from}&to=${to}`);
    const json = await res.json();
    return json.data;
  },
};
