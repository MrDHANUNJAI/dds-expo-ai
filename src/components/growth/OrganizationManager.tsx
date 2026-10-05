import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Plus,
  Mail,
  ShieldCheck,
  UserCheck,
  Crown,
  Trash2,
  CheckCircle2,
  Sparkles,
  Briefcase,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { organizationApi, OrganizationData, OrganizationMemberData } from '../../services/organizationApi';
import { useAuth } from '../../context/AuthContext';

export const OrganizationManager: React.FC = () => {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<{ organization: OrganizationData; role: string }[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationData | null>(null);
  const [members, setMembers] = useState<OrganizationMemberData[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    type: 'FREELANCER_AGENCY',
    description: '',
    industry: 'Technology & Software Development',
    website: '',
    country: 'Global',
    timezone: 'UTC',
    currency: 'USD',
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const list = await organizationApi.getMyOrganizations();
      setOrgs(list);
      if (list.length > 0 && !selectedOrg) {
        loadOrgDetails(list[0].organization.id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrgDetails = async (id: string) => {
    try {
      const details = await organizationApi.getOrganization(id);
      if (details) {
        setSelectedOrg(details);
        const memData = await organizationApi.getMembers(id);
        setMembers(memData.members);
        setInvitations(memData.invitations);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMsg(null);
    try {
      const res = await organizationApi.createOrganization(formData);
      setActionMsg({ type: 'success', text: `Organization "${res.organization.name}" created successfully!` });
      setShowCreateModal(false);
      setFormData({
        name: '',
        type: 'FREELANCER_AGENCY',
        description: '',
        industry: 'Technology & Software Development',
        website: '',
        country: 'Global',
        timezone: 'UTC',
        currency: 'USD',
      });
      await fetchOrgs();
      loadOrgDetails(res.organization.id);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to create organization' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg || !inviteEmail) return;
    setSubmitting(true);
    setActionMsg(null);
    try {
      await organizationApi.inviteMember(selectedOrg.id, inviteEmail, inviteRole);
      setActionMsg({ type: 'success', text: `Invitation sent to ${inviteEmail}` });
      setShowInviteModal(false);
      setInviteEmail('');
      loadOrgDetails(selectedOrg.id);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to invite' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!selectedOrg) return;
    if (!confirm(`Are you sure you want to remove ${memberName} from this organization?`)) return;
    try {
      await organizationApi.removeMember(selectedOrg.id, memberId);
      setActionMsg({ type: 'success', text: 'Member removed successfully' });
      loadOrgDetails(selectedOrg.id);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to remove member' });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!selectedOrg) return;
    try {
      await organizationApi.updateMemberRole(selectedOrg.id, memberId, newRole);
      setActionMsg({ type: 'success', text: 'Role updated successfully' });
      loadOrgDetails(selectedOrg.id);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to update role' });
    }
  };

  return (
    <div className="space-y-6">
      {actionMsg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <p className="text-sm font-medium">{actionMsg.text}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Phase 9 Enterprise & Teams
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Teams & Agency Hub</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Scale your freelance agency or enterprise company. Invite colleagues, assign role-based permissions, and pool contracts together.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Organization
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Organization list selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>My Organizations</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                {orgs.length}
              </span>
            </h3>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Loading organizations...</div>
            ) : orgs.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No organizations yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Start an agency or company to collaborate with team members.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Create one now
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {orgs.map(({ organization: org, role }) => {
                  const isSelected = selectedOrg?.id === org.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => loadOrgDetails(org.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-200 shadow-xs ring-1 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-700 font-bold flex items-center justify-center text-base shrink-0">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                            {org.name}
                            {org.verified && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 capitalize">
                            {org.type.toLowerCase().replace('_', ' ')} • {org.industry}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                        {role}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Agency Benefits</h4>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                Bid on high-ticket enterprise contracts as an accredited agency.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                Delegate tasks to members without sharing credentials.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                Consolidated agency earnings wallet with instant payouts.
              </li>
            </ul>
          </div>
        </div>

        {/* Right column: Selected Org Details & Team Members */}
        <div className="lg:col-span-8">
          {selectedOrg ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
              {/* Org Header */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-md">
                      {selectedOrg.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900">{selectedOrg.name}</h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {selectedOrg.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-lg">
                        {selectedOrg.description || 'No organization description provided.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                        <span>{selectedOrg.industry}</span>
                        <span>•</span>
                        <span>{selectedOrg.country}</span>
                        <span>•</span>
                        <span>Currency: {selectedOrg.currency}</span>
                        {selectedOrg.website && (
                          <>
                            <span>•</span>
                            <a
                              href={selectedOrg.website.startsWith('http') ? selectedOrg.website : `https://${selectedOrg.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                            >
                              Website <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shrink-0 shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Invite Member
                  </button>
                </div>

                {/* Metrics ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
                  <div className="p-3 rounded-lg bg-slate-50">
                    <span className="text-xs text-slate-500">Active Members</span>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{members.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <span className="text-xs text-slate-500">Total Projects</span>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{selectedOrg.stats.projectsCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <span className="text-xs text-slate-500">Reputation Rating</span>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{selectedOrg.stats.averageRating} ★</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <span className="text-xs text-slate-500">Verified Agency</span>
                    <p className="text-xs font-bold text-indigo-600 mt-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Tier 1
                    </p>
                  </div>
                </div>
              </div>

              {/* Members Table */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Team Members & Roles ({members.length})
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3">Member</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Joined</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                                {member.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-xs">{member.userName}</p>
                                <p className="text-[11px] text-slate-500">{member.userEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            {member.role === 'OWNER' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                <Crown className="w-3 h-3 text-amber-500" /> Owner
                              </span>
                            ) : (
                              <select
                                value={member.role}
                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="ADMIN">Admin</option>
                                <option value="MANAGER">Manager</option>
                                <option value="MEMBER">Member</option>
                                <option value="FINANCE">Finance</option>
                                <option value="VIEWER">Viewer</option>
                              </select>
                            )}
                          </td>
                          <td className="py-3">
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {member.status}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-slate-500">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-right">
                            {member.role !== 'OWNER' && (
                              <button
                                onClick={() => handleRemoveMember(member.id, member.userName)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Remove member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pending Invitations list */}
                {invitations.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Pending Invitations ({invitations.length})
                    </h5>
                    <div className="space-y-2">
                      {invitations.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-200/50 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-amber-600" />
                            <span className="font-semibold text-slate-800">{inv.email}</span>
                            <span className="text-slate-500">({inv.role})</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 uppercase px-2 py-0.5 bg-white rounded-md border border-amber-200">
                            Pending Accept
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-12 text-center text-slate-400">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-700">Select an organization</p>
              <p className="text-xs text-slate-500 mt-1">Choose an organization from the left panel to manage members and settings.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Org Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create New Organization</h3>
            <p className="text-xs text-slate-500 mb-4">
              Set up an agency or company workspace for team collaboration.
            </p>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Digital Labs, Stellar Studio"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="FREELANCER_AGENCY">Freelancer Agency</option>
                    <option value="SELLER_COMPANY">Seller Company</option>
                    <option value="STUDIO">Design Studio</option>
                    <option value="TEAM">Core Team</option>
                    <option value="ENTERPRISE">Enterprise Account</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of agency capabilities, tech stack, and portfolio focus..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Website (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://myagency.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Invite Team Member</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a colleague to <strong className="text-slate-800">{selectedOrg?.name}</strong>.
            </p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Colleague Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Workspace Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="ADMIN">Admin (Full management access)</option>
                  <option value="MANAGER">Manager (Project & proposal submission)</option>
                  <option value="MEMBER">Member (Task deliverable contributor)</option>
                  <option value="FINANCE">Finance (Invoices & payouts access)</option>
                  <option value="VIEWER">Viewer (Read-only)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs"
                >
                  {submitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
