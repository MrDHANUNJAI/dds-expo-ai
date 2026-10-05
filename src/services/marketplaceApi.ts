import { Project, Proposal, Category, ProjectStatus, ProposalStatus } from '../types';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('worknova_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const marketplaceApi = {
  // --- PROJECTS ---
  async getProjects(params?: {
    category?: string;
    subcategory?: string;
    budgetType?: string;
    experienceLevel?: string;
    minBudget?: number;
    maxBudget?: number;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ projects: Project[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.subcategory) query.set('subcategory', params.subcategory);
    if (params?.budgetType && params.budgetType !== 'all') query.set('budgetType', params.budgetType);
    if (params?.experienceLevel && params.experienceLevel !== 'all') query.set('experienceLevel', params.experienceLevel);
    if (params?.minBudget) query.set('minBudget', String(params.minBudget));
    if (params?.maxBudget) query.set('maxBudget', String(params.maxBudget));
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await fetch(`/api/projects?${query.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch projects');
    }
    return json.data;
  },

  async getProjectById(idOrSlug: string): Promise<{ project: Project; seller: any }> {
    const res = await fetch(`/api/projects/${idOrSlug}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to load project details');
    }
    return json.data;
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create project');
    }
    return json.data.project;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update project');
    }
    return json.data.project;
  },

  async updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
    const res = await fetch(`/api/projects/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update project status');
    }
    return json.data.project;
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete project');
    }
  },

  async getMySellerProjects(): Promise<{ projects: (Project & { shortlistedCount?: number })[]; stats: any }> {
    const res = await fetch('/api/projects/seller/mine', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch seller projects');
    }
    return json.data;
  },

  // --- PROPOSALS ---
  async submitProposal(data: {
    projectId: string;
    coverLetter: string;
    bidAmount: number;
    estimatedDays: number;
    milestones?: { description: string; amount: number; durationDays: number }[];
    attachments?: string[];
  }): Promise<Proposal> {
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to submit proposal');
    }
    return json.data.proposal;
  },

  async getMyProposals(status?: string): Promise<{ proposals: Proposal[]; counts: Record<string, number> }> {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    const res = await fetch(`/api/proposals/my-proposals${query}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to load proposals');
    }
    return json.data;
  },

  async checkMyProposal(projectId: string): Promise<Proposal | null> {
    const res = await fetch(`/api/proposals/check/${projectId}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return json.data.proposal;
    }
    return null;
  },

  async updateProposal(id: string, data: Partial<Proposal>): Promise<Proposal> {
    const res = await fetch(`/api/proposals/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update proposal');
    }
    return json.data.proposal;
  },

  async withdrawProposal(id: string): Promise<Proposal> {
    const res = await fetch(`/api/proposals/${id}/withdraw`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to withdraw proposal');
    }
    return json.data.proposal;
  },

  async getProjectProposals(projectId: string): Promise<{ project: any; proposals: Proposal[]; stats: any }> {
    const res = await fetch(`/api/proposals/project/${projectId}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch project proposals');
    }
    return json.data;
  },

  async updateProposalStatus(id: string, status: ProposalStatus, clientNotes?: string): Promise<Proposal> {
    const res = await fetch(`/api/proposals/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ status, clientNotes }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update proposal status');
    }
    return json.data.proposal;
  },

  // --- CATEGORIES & SKILLS ---
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch categories');
    }
    return json.data.categories;
  },

  async getSkills(): Promise<{ id: string; name: string; category: string }[]> {
    const res = await fetch('/api/categories/skills/all');
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch skills');
    }
    return json.data.skills;
  },

  // --- SAVED PROJECTS ---
  async getSavedProjects(): Promise<{ savedProjects: Project[]; savedProjectIds: string[] }> {
    const res = await fetch('/api/saved-projects', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch saved projects');
    }
    return json.data;
  },

  async toggleSaveProject(projectId: string): Promise<{ isSaved: boolean }> {
    const res = await fetch(`/api/saved-projects/${projectId}/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to bookmark project');
    }
    return json.data;
  },
};
