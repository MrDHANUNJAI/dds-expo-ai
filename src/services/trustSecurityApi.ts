import {
  VerificationItem,
  SessionItem,
  SecurityActivityItem,
} from '../types';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('worknova_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const trustSecurityApi = {
  // --- VERIFICATIONS ---
  async getMyVerifications(): Promise<{ verifications: VerificationItem[]; statusSummary: any }> {
    const res = await fetch('/api/verification/me', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch verifications');
    return json.data;
  },

  async requestEmailVerification(): Promise<any> {
    const res = await fetch('/api/verification/email/request', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to request email code');
    return json.data;
  },

  async verifyEmail(code: string): Promise<any> {
    const res = await fetch('/api/verification/email/verify', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ code }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Email verification failed');
    return json.data;
  },

  async sendPhoneOTP(phoneNumber: string): Promise<any> {
    const res = await fetch('/api/verification/phone/send-otp', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ phoneNumber }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to send OTP');
    return json.data;
  },

  async verifyPhoneOTP(otp: string): Promise<any> {
    const res = await fetch('/api/verification/phone/verify-otp', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ otp }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Invalid or expired OTP');
    return json.data;
  },

  async submitIdentityVerification(data: {
    documentType: string;
    documentNumber: string;
    documentFrontUrl?: string;
  }): Promise<any> {
    const res = await fetch('/api/verification/identity/submit', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to submit identity');
    return json.data;
  },

  async submitBusinessVerification(data: {
    businessName: string;
    registrationNumber: string;
    taxId: string;
    documentUrl?: string;
  }): Promise<any> {
    const res = await fetch('/api/verification/business/submit', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to submit business registration');
    return json.data;
  },

  // --- SESSIONS & 2FA ---
  async getActiveSessions(): Promise<SessionItem[]> {
    const res = await fetch('/api/security/sessions', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch sessions');
    return json.data.sessions;
  },

  async revokeSession(id: string): Promise<void> {
    const res = await fetch(`/api/security/sessions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to revoke session');
  },

  async revokeOtherSessions(): Promise<void> {
    const res = await fetch('/api/security/sessions/revoke-others', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to revoke sessions');
  },

  async getSecurityActivity(): Promise<SecurityActivityItem[]> {
    const res = await fetch('/api/security/activity', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch activity');
    return json.data.activity;
  },

  // --- SEARCH & INTELLIGENCE ---
  async searchMarketplace(params: Record<string, string>): Promise<any> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/search?${query}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Search failed');
    return json.data;
  },

  async getRecommendedProjects(): Promise<any[]> {
    const res = await fetch('/api/search/recommendations/projects', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch recommendations');
    return json.data.recommendations;
  },

  async getProfileCompleteness(): Promise<{ score: number; missingFields: string[]; isVerified: boolean }> {
    const res = await fetch('/api/search/profile-completeness', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to get profile score');
    return json.data;
  },
};
