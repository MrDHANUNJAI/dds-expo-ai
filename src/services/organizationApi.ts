function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('worknova_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  type: 'SELLER_COMPANY' | 'FREELANCER_AGENCY' | 'STUDIO' | 'TEAM' | 'ENTERPRISE';
  description: string;
  logoUrl?: string;
  website?: string;
  industry: string;
  country: string;
  timezone: string;
  currency: string;
  ownerId: string;
  verified: boolean;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  stats: {
    totalSpend?: number;
    totalEarned?: number;
    projectsCount: number;
    membersCount: number;
    averageRating: number;
  };
  members?: OrganizationMemberData[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMemberData {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'FINANCE' | 'VIEWER';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  joinedAt: string;
}

export interface OrganizationInvitationData {
  id: string;
  organizationId: string;
  organizationName: string;
  inviterId: string;
  email: string;
  role: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  token: string;
  expiresAt: string;
  createdAt: string;
}

export const organizationApi = {
  async getMyOrganizations(): Promise<{ organization: OrganizationData; role: string }[]> {
    const res = await fetch('/api/organizations/my', {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getOrganization(id: string): Promise<OrganizationData | null> {
    const res = await fetch(`/api/organizations/${id}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.success ? json.data : null;
  },

  async createOrganization(data: {
    name: string;
    type: string;
    description?: string;
    website?: string;
    industry?: string;
    country?: string;
    timezone?: string;
    currency?: string;
  }): Promise<{ organization: OrganizationData; membership: OrganizationMemberData }> {
    const res = await fetch('/api/organizations', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to create organization');
    return json.data;
  },

  async updateOrganization(id: string, partial: Partial<OrganizationData>): Promise<OrganizationData> {
    const res = await fetch(`/api/organizations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(partial),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update organization');
    return json.data;
  },

  async getMembers(id: string): Promise<{ members: OrganizationMemberData[]; invitations: OrganizationInvitationData[] }> {
    const res = await fetch(`/api/organizations/${id}/members`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.success ? json.data : { members: [], invitations: [] };
  },

  async inviteMember(id: string, email: string, role: string): Promise<any> {
    const res = await fetch(`/api/organizations/${id}/members/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, role }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to invite member');
    return json.data;
  },

  async removeMember(id: string, memberId: string): Promise<void> {
    const res = await fetch(`/api/organizations/${id}/members/${memberId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to remove member');
  },

  async updateMemberRole(id: string, memberId: string, role: string): Promise<OrganizationMemberData> {
    const res = await fetch(`/api/organizations/${id}/members/${memberId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update role');
    return json.data;
  },

  async acceptInvitation(token: string): Promise<OrganizationMemberData> {
    const res = await fetch('/api/organizations/invitations/accept', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to accept invitation');
    return json.data;
  },
};
