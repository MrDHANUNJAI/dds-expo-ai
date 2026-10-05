function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('worknova_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type ApiScope =
  | 'projects:read'
  | 'projects:write'
  | 'proposals:read'
  | 'proposals:write'
  | 'contracts:read'
  | 'contracts:write'
  | 'profiles:read'
  | 'messages:read'
  | 'messages:write'
  | 'analytics:read'
  | 'webhooks:manage';

export interface ApiKeyItem {
  id: string;
  userId: string;
  organizationId?: string;
  name: string;
  keyPrefix: string;
  scopes: ApiScope[];
  rateLimitPerMin: number;
  lastUsedAt?: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
}

export type WebhookEvent =
  | 'project.created'
  | 'project.updated'
  | 'proposal.created'
  | 'proposal.accepted'
  | 'contract.created'
  | 'milestone.funded'
  | 'milestone.released'
  | 'delivery.submitted'
  | 'payment.completed'
  | 'review.created'
  | 'dispute.opened';

export interface WebhookItem {
  id: string;
  userId: string;
  organizationId?: string;
  targetUrl: string;
  events: WebhookEvent[];
  secret: string;
  status: 'ACTIVE' | 'PAUSED' | 'FAILED';
  failureCount: number;
  createdAt: string;
}

export interface WebhookLogItem {
  id: string;
  subscriptionId: string;
  event: WebhookEvent;
  payload: Record<string, any>;
  statusCode?: number;
  responseBody?: string;
  durationMs?: number;
  status: 'DELIVERED' | 'FAILED' | 'RETRYING';
  attempt: number;
  createdAt: string;
}

export interface MarketplaceAppItem {
  id: string;
  developerId: string;
  developerName: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  iconUrl: string;
  category: 'PRODUCTIVITY' | 'ANALYTICS' | 'COMMUNICATION' | 'ACCOUNTING' | 'AI_TOOLS';
  requestedScopes: ApiScope[];
  webhookEvents?: WebhookEvent[];
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FEATURED';
  installsCount: number;
  rating: number;
}

export type AIAgentType =
  | 'PROJECT_AGENT'
  | 'FREELANCER_AGENT'
  | 'SELLER_AGENT'
  | 'MATCHING_AGENT'
  | 'SUPPORT_AGENT'
  | 'RISK_AGENT'
  | 'ADMIN_ASSISTANT';

export interface AIAgentTaskItem {
  id: string;
  userId: string;
  userRole: string;
  agentType: AIAgentType;
  actionName: string;
  riskLevel: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL';
  approvalStatus: 'NOT_REQUIRED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  allowedTools: string[];
  deniedTools: string[];
  inputPrompt: string;
  outputResult?: string;
  structuredOutput?: Record<string, any>;
  executionStatus: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'AWAITING_APPROVAL';
  durationMs?: number;
  createdAt: string;
  completedAt?: string;
}

export interface SkillGraphItem {
  id: string;
  name: string;
  category: string;
  relatedSkills: string[];
  demandScore: number;
  averageHourlyRate: number;
}

export interface SkillAssessmentItem {
  id: string;
  skillName: string;
  title: string;
  description: string;
  durationMinutes: number;
  passScorePercent: number;
  questionsCount: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  badgeName: string;
  questions: {
    id: string;
    question: string;
    codeSnippet?: string;
    options: string[];
    difficulty: string;
  }[];
}

export interface IncidentItem {
  id: string;
  title: string;
  service: string;
  severity: 'SEV_1_CRITICAL' | 'SEV_2_MAJOR' | 'SEV_3_MODERATE' | 'SEV_4_MINOR';
  status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
  summary: string;
  impactDescription: string;
  startedAt: string;
  resolvedAt?: string;
  timeline: {
    timestamp: string;
    message: string;
    status: string;
  }[];
}

export interface HealthReportItem {
  overallHealthScore: number;
  timestamp: string;
  supplyDemandRatio: number;
  activeProjectsCount: number;
  availableFreelancersCount: number;
  medianTimeToHireHours: number;
  disputeRatePercent: number;
  liquidityAlerts: {
    category: string;
    status: 'SURPLUS' | 'SHORTAGE' | 'BALANCED';
    message: string;
    demandChangePercent: number;
    supplyChangePercent: number;
  }[];
}

export const ecosystemApi = {
  // Developer API Keys
  async getMyApiKeys(organizationId?: string): Promise<{ success: boolean; keys: ApiKeyItem[] }> {
    const url = organizationId
      ? `/api/developer/keys?organizationId=${organizationId}`
      : '/api/developer/keys';
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  async createApiKey(data: {
    name: string;
    scopes: ApiScope[];
    organizationId?: string;
  }): Promise<{ success: boolean; message: string; apiKey: string; keyDoc: ApiKeyItem }> {
    const res = await fetch('/api/developer/keys', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async revokeApiKey(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/developer/keys/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Webhooks
  async getMyWebhooks(organizationId?: string): Promise<{ success: boolean; webhooks: WebhookItem[] }> {
    const url = organizationId
      ? `/api/developer/webhooks?organizationId=${organizationId}`
      : '/api/developer/webhooks';
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  async createWebhook(data: {
    targetUrl: string;
    events: WebhookEvent[];
    organizationId?: string;
  }): Promise<{ success: boolean; webhook: WebhookItem }> {
    const res = await fetch('/api/developer/webhooks', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteWebhook(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/developer/webhooks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getWebhookLogs(id: string): Promise<{ success: boolean; logs: WebhookLogItem[] }> {
    const res = await fetch(`/api/developer/webhooks/${id}/logs`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async testWebhook(id: string, event?: WebhookEvent): Promise<{ success: boolean; message: string; deliveryLog: WebhookLogItem }> {
    const res = await fetch(`/api/developer/webhooks/${id}/test`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ event }),
    });
    return res.json();
  },

  // Marketplace Apps
  async getMarketplaceApps(category?: string): Promise<{ success: boolean; apps: MarketplaceAppItem[] }> {
    const url = category ? `/api/developer/apps?category=${category}` : '/api/developer/apps';
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  async getInstalledApps(): Promise<{ success: boolean; installations: any[] }> {
    const res = await fetch('/api/developer/apps/installed', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async installApp(appId: string, organizationId?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/developer/apps/${appId}/install`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ organizationId }),
    });
    return res.json();
  },

  async uninstallApp(appId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/developer/apps/${appId}/uninstall`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // AI Agent Orchestrator
  async getAgentCapabilities(): Promise<{ success: boolean; agents: any[] }> {
    const res = await fetch('/api/agents/capabilities', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async runAgentTask(data: {
    agentType: AIAgentType;
    actionName: string;
    inputPrompt: string;
    contextPayload?: Record<string, any>;
    riskLevel?: string;
  }): Promise<{ success: boolean; message: string; task: AIAgentTaskItem }> {
    const res = await fetch('/api/agents/tasks/run', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async listAgentTasks(agentType?: AIAgentType, status?: string): Promise<{ success: boolean; tasks: AIAgentTaskItem[] }> {
    const params = new URLSearchParams();
    if (agentType) params.append('agentType', agentType);
    if (status) params.append('status', status);
    const res = await fetch(`/api/agents/tasks?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async approveAgentTask(id: string): Promise<{ success: boolean; task: AIAgentTaskItem }> {
    const res = await fetch(`/api/agents/tasks/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async rejectAgentTask(id: string, reason?: string): Promise<{ success: boolean; task: AIAgentTaskItem }> {
    const res = await fetch(`/api/agents/tasks/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  // Skill Assessments & Graph
  async getSkillGraph(): Promise<{ success: boolean; graph: SkillGraphItem[] }> {
    const res = await fetch('/api/assessments/graph');
    return res.json();
  },

  async listSkillAssessments(): Promise<{ success: boolean; assessments: SkillAssessmentItem[] }> {
    const res = await fetch('/api/assessments/tests');
    return res.json();
  },

  async submitSkillAssessment(
    id: string,
    answers: Record<string, number>
  ): Promise<{
    success: boolean;
    message: string;
    scorePercent: number;
    passed: boolean;
    submission: any;
    badgeAwarded?: any;
  }> {
    const res = await fetch(`/api/assessments/tests/${id}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers }),
    });
    return res.json();
  },

  async getMySubmissions(): Promise<{ success: boolean; submissions: any[] }> {
    const res = await fetch('/api/assessments/my-submissions', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Platform Governance & Status
  async getIncidents(): Promise<{ success: boolean; incidents: IncidentItem[] }> {
    const res = await fetch('/api/governance/incidents');
    return res.json();
  },

  async getMarketplaceHealth(): Promise<{ success: boolean; report: HealthReportItem }> {
    const res = await fetch('/api/governance/health');
    return res.json();
  },

  async getCustomReports(): Promise<{ success: boolean; reports: any[] }> {
    const res = await fetch('/api/governance/reports', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createCustomReport(data: any): Promise<{ success: boolean; report: any }> {
    const res = await fetch('/api/governance/reports', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async exportAuditArchive(): Promise<{ success: boolean; archive: any }> {
    const res = await fetch('/api/governance/audit-archive', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};
