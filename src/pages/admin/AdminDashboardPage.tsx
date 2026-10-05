import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FolderKanban,
  DollarSign,
  AlertTriangle,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Plus,
  Edit,
  Trash2,
  FileText,
  Eye,
  Bot,
  Code,
  Activity,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { marketplaceApi } from '../../services/marketplaceApi';
import { Project, Proposal, Category, ProjectStatus } from '../../types';
import { DeveloperPortal } from '../../components/growth/DeveloperPortal';
import { AIAgentOrchestrator } from '../../components/growth/AIAgentOrchestrator';
import { PlatformGovernanceHub } from '../../components/growth/PlatformGovernanceHub';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'FREELANCER' | 'SELLER' | 'ADMIN';
  isVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  createdAt: string;
  profile?: any;
}

export const AdminDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabParam = (searchParams.get('tab') || '').toUpperCase();
  const validTabs = ['USERS', 'PROJECTS', 'PROPOSALS', 'CATEGORIES', 'AI-AGENTS', 'DEVELOPER', 'GOVERNANCE'];
  const [activeTab, setActiveTab] = useState<string>(
    validTabs.includes(tabParam) ? tabParam : 'USERS'
  );

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // State for Users & Audit
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // State for Projects & Proposals
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [proposalsList, setProposalsList] = useState<Proposal[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Category creation modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [subcatsInput, setSubcatsInput] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('worknova_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, overviewRes, projectsRes, catsRes] = await Promise.all([
        fetch('/api/admin/users', { headers, credentials: 'include' }),
        fetch('/api/admin/overview', { headers, credentials: 'include' }),
        fetch('/api/projects?status=ALL', { headers, credentials: 'include' }),
        fetch('/api/categories'),
      ]);

      if (usersRes.ok) {
        const uJson = await usersRes.json();
        if (uJson.success) setUsersList(uJson.data);
      }

      if (overviewRes.ok) {
        const oJson = await overviewRes.json();
        if (oJson.success && oJson.data.recentLogs) {
          setAuditLogs(oJson.data.recentLogs);
        }
      }

      if (projectsRes.ok) {
        const pJson = await projectsRes.json();
        if (pJson.success) setProjectsList(pJson.data.projects);
      }

      if (catsRes.ok) {
        const cJson = await catsRes.json();
        if (cJson.success) setCategoriesList(cJson.data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleSuspend = async (userId: string, email: string) => {
    try {
      const token = localStorage.getItem('worknova_token');
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setActionFeedback(json.message);
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isSuspended: json.data.isSuspended } : u))
        );
      } else {
        alert(json.message);
      }
    } catch (err) {
      alert('Failed to update suspension status.');
    }
  };

  // Change project status (Admin moderation)
  const handleUpdateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      await marketplaceApi.updateProjectStatus(projectId, newStatus);
      setProjectsList((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
      );
      setActionFeedback(`Project status updated to ${newStatus}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update project status');
    }
  };

  // Add new category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catDesc) return;
    try {
      const token = localStorage.getItem('worknova_token');
      const subcats = subcatsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name, i) => ({
          id: `sub-${Date.now()}-${i}`,
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
        }));

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: catName,
          slug: catName.toLowerCase().replace(/\s+/g, '-'),
          description: catDesc,
          icon: 'Folder',
          subcategories: subcats,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCategoriesList([...categoriesList, json.data.category]);
        setCatModalOpen(false);
        setCatName('');
        setCatDesc('');
        setSubcatsInput('');
        setActionFeedback('Category added successfully.');
      } else {
        alert(json.message);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  };

  const filteredUsers = usersList.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${u.firstName} ${u.lastName}`.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  const freelancerCount = usersList.filter((u) => u.role === 'FREELANCER').length;
  const sellerCount = usersList.filter((u) => u.role === 'SELLER').length;
  const suspendedCount = usersList.filter((u) => u.isSuspended).length;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                WorkNova Operations & Moderation Console
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Oversee platform accounts, monitor marketplace listings, and regulate categories.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdminData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            className="text-slate-200 border-slate-700 bg-slate-800 hover:bg-slate-700"
          >
            Refresh Records
          </Button>
        </div>

        {actionFeedback && (
          <Alert
            type="success"
            message={actionFeedback}
            onDismiss={() => setActionFeedback(null)}
          />
        )}

        {/* 4 Real Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Registered Accounts</span>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {usersList.length}
            </div>
            <p className="text-[11px] text-slate-400">Total verified accounts</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Active Job Listings</span>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {projectsList.filter((p) => p.status === 'PUBLISHED').length}
            </div>
            <p className="text-[11px] text-emerald-600">Live projects in marketplace</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Total Categories</span>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {categoriesList.length}
            </div>
            <p className="text-[11px] text-indigo-600">Active skill domains</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Suspended Accounts</span>
            <div className="text-3xl font-extrabold text-amber-700 tabular-nums">
              {suspendedCount}
            </div>
            <p className="text-[11px] text-slate-400">Restricted for review</p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'USERS'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            User Accounts ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab('AI-AGENTS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'AI-AGENTS'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            AI Orchestrator
          </button>

          <button
            onClick={() => setActiveTab('DEVELOPER')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'DEVELOPER'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Developer Ecosystem
          </button>

          <button
            onClick={() => setActiveTab('GOVERNANCE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'GOVERNANCE'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Platform Health & Incidents
          </button>

          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'PROJECTS'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Moderate Projects ({projectsList.length})
          </button>

          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === 'CATEGORIES'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Marketplace Categories ({categoriesList.length})
          </button>
        </div>

        {activeTab === 'AI-AGENTS' && <AIAgentOrchestrator />}
        {activeTab === 'DEVELOPER' && <DeveloperPortal />}
        {activeTab === 'GOVERNANCE' && <PlatformGovernanceHub />}

        {/* --- USERS TAB --- */}
        {activeTab === 'USERS' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  User Accounts Directory ({filteredUsers.length})
                </h2>
                <p className="text-xs text-slate-500">Live database accounts with suspension control</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
                >
                  <option value="all">All Roles</option>
                  <option value="FREELANCER">Freelancers</option>
                  <option value="SELLER">Sellers</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 flex items-center gap-2.5 font-medium text-slate-900">
                        <Avatar name={`${u.firstName} ${u.lastName}`} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900">{u.firstName} {u.lastName}</p>
                          <p className="text-[11px] text-slate-400">ID: {u.id.slice(0, 12)}...</p>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : u.role === 'SELLER'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-3 text-slate-500">{u.phone || '—'}</td>
                      <td className="py-3 px-3">
                        {u.isSuspended ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                            Suspended
                          </span>
                        ) : !u.isActive ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            Deactivated
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {u.role !== 'ADMIN' && (
                          <Button
                            variant={u.isSuspended ? 'outline' : 'danger'}
                            size="sm"
                            className="text-[11px] h-7 px-2.5"
                            onClick={() => handleToggleSuspend(u.id, u.email)}
                          >
                            {u.isSuspended ? 'Reactivate' : 'Suspend'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- PROJECTS MODERATION TAB --- */}
        {activeTab === 'PROJECTS' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Marketplace Projects Moderation
                </h2>
                <p className="text-xs text-slate-500">Supervise, review, or archive client job postings</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Project Title</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Budget</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectsList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <Link to={`/projects/${p.id}`} className="font-bold text-slate-900 hover:text-indigo-600">
                          {p.title}
                        </Link>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {p.proposalCount || 0} proposals · Created {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {p.sellerCompany || p.sellerName}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{p.categoryName || p.category}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800 tabular-nums">
                        ${p.budgetMin?.toLocaleString()} – ${p.budgetMax?.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            p.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'DRAFT'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : p.status === 'ARCHIVED'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/projects/${p.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Inspect
                            </Button>
                          </Link>
                          {p.status === 'PUBLISHED' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-amber-700"
                              onClick={() => handleUpdateProjectStatus(p.id, 'ARCHIVED')}
                            >
                              Archive
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-emerald-700"
                              onClick={() => handleUpdateProjectStatus(p.id, 'PUBLISHED')}
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- CATEGORIES TAB --- */}
        {activeTab === 'CATEGORIES' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Marketplace Categories ({categoriesList.length})
                </h2>
                <p className="text-xs text-slate-500">Configure taxonomies and specialization domains</p>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setCatModalOpen(true)}
              >
                Add Category
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriesList.map((cat) => (
                <div key={cat.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {cat.projectCount} jobs
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{cat.description}</p>
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                    <span className="font-semibold">Subcategories:</span> {cat.subcategories?.length || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Logs Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Security & Compliance Audit Trail
            </h2>
            <span className="text-xs text-slate-400">Live system events</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 font-mono text-[11px]">
                    {log.action}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    User: {log.userEmail || log.userId || 'system'}
                  </p>
                </div>
                <div className="text-right shrink-0 text-[11px] text-slate-400">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title="Create Marketplace Category"
        description="Add a new domain taxonomy and subcategories"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Cybersecurity & Network Defense"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5"
              placeholder="Outline the scope of this domain..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subcategories (comma separated)
            </label>
            <input
              type="text"
              value={subcatsInput}
              onChange={(e) => setSubcatsInput(e.target.value)}
              placeholder="e.g. Penetration Testing, Cloud Compliance, Zero Trust"
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setCatModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
