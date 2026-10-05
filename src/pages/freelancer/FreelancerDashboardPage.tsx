import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  Briefcase,
  DollarSign,
  CheckCircle2,
  ArrowUpRight,
  Search,
  Award,
  Settings,
  Bookmark,
  FileText,
  RotateCcw,
  Edit3,
  Trash2,
  Check,
  XCircle,
  MessageSquare,
  Shield,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { freelancerDashboardData } from '../../data/dashboard';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { FreelancerProfile } from '../../types/auth';
import { Proposal, Project, ProposalStatus } from '../../types';
import { marketplaceApi } from '../../services/marketplaceApi';
import { ContractsEscrowWorkspace } from '../../components/finance/ContractsEscrowWorkspace';
import { WalletEarningsWorkspace } from '../../components/finance/WalletEarningsWorkspace';
import { ChatWorkspace } from '../../components/chat/ChatWorkspace';
import { TrustVerificationCenter } from '../../components/trust/TrustVerificationCenter';
import { DisputesSupportModal } from '../../components/trust/DisputesSupportModal';
import { OrganizationManager } from '../../components/growth/OrganizationManager';
import { SubscriptionManager } from '../../components/growth/SubscriptionManager';
import { ReferralRewardsHub } from '../../components/growth/ReferralRewardsHub';
import { ReputationBadgeShowcase } from '../../components/growth/ReputationBadgeShowcase';
import { DeveloperPortal } from '../../components/growth/DeveloperPortal';
import { AIAgentOrchestrator } from '../../components/growth/AIAgentOrchestrator';
import { SkillAssessmentsHub } from '../../components/growth/SkillAssessmentsHub';

export const FreelancerDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const flProfile = profile as FreelancerProfile;

  // Real backend proposals and saved projects
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadingData, setLoadingData] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = (searchParams.get('tab') || '').toUpperCase();
  const validTabs = ['PROPOSALS', 'CONTRACTS', 'AI-AGENTS', 'SKILLS', 'DEVELOPER', 'TEAMS', 'MEMBERSHIP', 'REWARDS', 'MESSAGES', 'EARNINGS', 'TRUST', 'SAVED'];
  const [activeMainTab, setActiveMainTab] = useState<string>(
    validTabs.includes(tabParam) ? tabParam : 'PROPOSALS'
  );

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveMainTab(tabParam);
    }
  }, [tabParam]);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Support / Dispute Modal
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeProjectId, setDisputeProjectId] = useState('proj-1');
  const [disputeContractId, setDisputeContractId] = useState('con-001');

  // Proposal Modals
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [editBidAmount, setEditBidAmount] = useState<number>(0);
  const [editEstimatedDays, setEditEstimatedDays] = useState<number>(14);
  const [editCoverLetter, setEditCoverLetter] = useState<string>('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadFreelancerData = async () => {
    try {
      setLoadingData(true);
      // Fetch my proposals
      const propData = await marketplaceApi.getMyProposals(statusFilter !== 'ALL' ? statusFilter : undefined);
      setProposals(propData.proposals);
      setCounts(propData.counts);

      // Fetch saved projects
      const savedData = await marketplaceApi.getSavedProjects();
      setSavedProjects(savedData.savedProjects);
    } catch (err: any) {
      console.warn('Could not load freelancer proposals:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadFreelancerData();
  }, [statusFilter]);

  // Handle edit proposal
  const openEditModal = (prop: Proposal) => {
    setEditingProposal(prop);
    setEditBidAmount(prop.bidAmount);
    setEditEstimatedDays(prop.estimatedDays || 14);
    setEditCoverLetter(prop.coverLetter);
  };

  const handleSaveProposalEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProposal) return;
    setSubmittingEdit(true);
    setErrorMsg(null);
    try {
      const updated = await marketplaceApi.updateProposal(editingProposal.id, {
        bidAmount: editBidAmount,
        estimatedDays: editEstimatedDays,
        coverLetter: editCoverLetter,
      });

      setProposals((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      setEditingProposal(null);
      setSuccessMsg('Proposal updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update proposal');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Handle withdraw proposal
  const handleWithdraw = async (propId: string) => {
    if (!confirm('Are you sure you want to withdraw this proposal?')) return;
    try {
      const withdrawn = await marketplaceApi.withdrawProposal(propId);
      setProposals((prev) => prev.map((p) => (p.id === propId ? withdrawn : p)));
      setSuccessMsg('Proposal withdrawn.');
      loadFreelancerData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to withdraw proposal');
    }
  };

  // Remove saved project
  const handleRemoveSaved = async (projectId: string) => {
    try {
      await marketplaceApi.toggleSaveProject(projectId);
      setSavedProjects((prev) => prev.filter((p) => p.id !== projectId));
      setSuccessMsg('Removed from bookmarks.');
    } catch (err: any) {
      setErrorMsg('Failed to update saved project');
    }
  };

  const realCompletion = flProfile?.profileCompletion ?? 80;

  return (
    <DashboardLayout role="freelancer">
      <div className="space-y-8">
        {/* Status Alerts */}
        {successMsg && <Alert type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />}
        {errorMsg && <Alert type="error" message={errorMsg} onDismiss={() => setErrorMsg(null)} />}

        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Good morning, {user?.firstName || 'Alex'}
              </h1>
              {user?.isVerified && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified Specialist
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {flProfile?.professionalTitle ? (
                <span>Title: <strong>{flProfile.professionalTitle}</strong> · </span>
              ) : null}
              You have <strong>{counts.submitted || proposals.length} active proposals</strong> and{' '}
              <strong>{savedProjects.length} bookmarked projects</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/freelancer/settings">
              <Button variant="outline" size="md" leftIcon={<Settings className="w-4 h-4" />}>
                Settings
              </Button>
            </Link>
            <Link to="/find-work">
              <Button variant="primary" size="md" leftIcon={<Search className="w-4 h-4" />}>
                Find Projects
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Submitted Proposals</span>
              <span className="text-indigo-600 font-medium text-[11px]">Active</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {counts.submitted ?? proposals.filter((p) => p.status === 'SUBMITTED').length}
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
              Awaiting client review
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Shortlisted Bids</span>
              <span className="text-amber-600 font-medium text-[11px]">High interest</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {counts.shortlisted ?? proposals.filter((p) => p.status === 'SHORTLISTED').length}
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
              Shortlisted by clients
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Saved Projects</span>
              <span className="text-emerald-600 font-medium text-[11px]">Bookmarked</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {savedProjects.length}
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
              Saved for later application
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Hourly Rate</span>
              <span className="text-slate-400 font-medium text-[11px]">Base</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              ${flProfile?.hourlyRate || 85}/h
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
              Standard billing rate
            </div>
          </div>
        </div>

        {activeMainTab === 'CONTRACTS' ? (
          <ContractsEscrowWorkspace />
        ) : activeMainTab === 'AI-AGENTS' ? (
          <AIAgentOrchestrator />
        ) : activeMainTab === 'SKILLS' ? (
          <SkillAssessmentsHub />
        ) : activeMainTab === 'DEVELOPER' ? (
          <DeveloperPortal />
        ) : activeMainTab === 'TEAMS' ? (
          <OrganizationManager />
        ) : activeMainTab === 'MEMBERSHIP' ? (
          <SubscriptionManager />
        ) : activeMainTab === 'REWARDS' ? (
          <ReferralRewardsHub />
        ) : activeMainTab === 'MESSAGES' ? (
          <ChatWorkspace />
        ) : activeMainTab === 'EARNINGS' ? (
          <WalletEarningsWorkspace />
        ) : activeMainTab === 'TRUST' ? (
          <div className="space-y-6">
            <ReputationBadgeShowcase />
            <TrustVerificationCenter />
          </div>
        ) : (
          /* Main Work Area: Tabs for My Proposals & Bookmarks */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): My Proposals & Saved Projects */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                {/* Main Subtabs Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveMainTab('PROPOSALS')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeMainTab === 'PROPOSALS'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>My Proposals ({proposals.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveMainTab('SAVED')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeMainTab === 'SAVED'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Saved Jobs ({savedProjects.length})</span>
                  </button>
                </div>

                {/* Status Filter for proposals */}
                {activeMainTab === 'PROPOSALS' && (
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold">
                    {['ALL', 'SUBMITTED', 'SHORTLISTED', 'ACCEPTED', 'WITHDRAWN'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          statusFilter === st
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'ALL' ? 'All' : st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Proposals Tab Content */}
              {activeMainTab === 'PROPOSALS' ? (
                loadingData ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading your proposals...</div>
                ) : proposals.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {proposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                prop.status === 'SHORTLISTED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : prop.status === 'ACCEPTED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prop.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : prop.status === 'WITHDRAWN'
                                  ? 'bg-slate-100 text-slate-500'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {prop.status}
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-400">
                              Applied {new Date(prop.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>

                          <Link
                            to={`/projects/${prop.projectId}`}
                            className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors block truncate"
                          >
                            {prop.projectTitle || prop.project?.title || 'Project Proposal'}
                          </Link>

                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span>
                              Bid: <strong className="text-slate-800 tabular-nums">${prop.bidAmount.toLocaleString()}</strong>
                            </span>
                            <span>·</span>
                            <span>Timeline: {prop.estimatedDays} days</span>
                            {prop.clientNotes && (
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Client Note: {prop.clientNotes}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions for proposal */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setViewingProposal(prop)}
                          >
                            View
                          </Button>

                          {prop.status === 'SUBMITTED' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => openEditModal(prop)}
                                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-red-600 hover:text-red-700"
                                onClick={() => handleWithdraw(prop.id)}
                              >
                                Withdraw
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl space-y-3">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No proposals found under this filter.</p>
                    <Link to="/find-work">
                      <Button variant="primary" size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
                        Browse Available Projects
                      </Button>
                    </Link>
                  </div>
                )
              ) : (
                /* Saved Jobs Tab Content */
                savedProjects.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {savedProjects.map((p) => (
                      <div
                        key={p.id}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <Link
                            to={`/projects/${p.id}`}
                            className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors block truncate"
                          >
                            {p.title}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>
                              Budget: ${p.budgetMin?.toLocaleString()} – ${p.budgetMax?.toLocaleString()}
                            </span>
                            <span>·</span>
                            <span>{p.categoryName || p.category}</span>
                            <span>·</span>
                            <span>{p.proposalCount || 0} proposals</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link to={`/projects/${p.id}`}>
                            <Button variant="primary" size="sm">
                              Apply Now
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-600"
                            onClick={() => handleRemoveSaved(p.id)}
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl space-y-3">
                    <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">You haven't bookmarked any projects yet.</p>
                    <Link to="/find-work">
                      <Button variant="primary" size="sm">
                        Explore Marketplace
                      </Button>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Profile Strength & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Real Profile Strength Meter */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Profile Strength
                </h3>
                <span className="text-xs font-bold text-indigo-600 tabular-nums">
                  {realCompletion}% Complete
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${realCompletion}%` }}
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-slate-700">Account Registered</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600">+20%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        flProfile?.professionalTitle ? 'text-emerald-500' : 'text-slate-300'
                      }`}
                    />
                    <span className="text-slate-700">Professional Title</span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600">+10%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        flProfile?.skills?.length ? 'text-emerald-500' : 'text-slate-300'
                      }`}
                    />
                    <span className="text-slate-700">Technical Skills</span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600">+15%</span>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/freelancer/settings">
                  <Button variant="outline" size="sm" className="w-full">
                    Update Profile & Portfolio
                  </Button>
                </Link>
              </div>
            </div>

            {/* Success Tip */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-5 space-y-2 text-xs text-indigo-950">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Freelancer Success Tip</span>
              </div>
              <p className="text-indigo-900/80 leading-relaxed">
                Clear milestone schedules and realistic delivery timelines significantly improve proposal acceptance rates.
              </p>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* --- PROPOSAL DETAILS MODAL --- */}
      <Modal
        isOpen={Boolean(viewingProposal)}
        onClose={() => setViewingProposal(null)}
        title="Proposal Details"
        description={viewingProposal?.projectTitle || 'Project Proposal'}
        maxWidth="lg"
      >
        {viewingProposal && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 block">Bid Amount:</span>
                <span className="text-base font-extrabold text-slate-900 tabular-nums">
                  ${viewingProposal.bidAmount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Status:</span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  {viewingProposal.status}
                </span>
              </div>
            </div>

            {viewingProposal.clientNotes && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                <strong>Feedback from Client:</strong> {viewingProposal.clientNotes}
              </div>
            )}

            <div>
              <span className="font-semibold text-slate-700 block mb-1">Cover Letter:</span>
              <p className="p-3 bg-white rounded border border-slate-200 whitespace-pre-line leading-relaxed text-slate-700">
                {viewingProposal.coverLetter}
              </p>
            </div>

            {viewingProposal.milestones && viewingProposal.milestones.length > 0 && (
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Milestones:</span>
                <div className="space-y-1.5">
                  {viewingProposal.milestones.map((m, i) => (
                    <div key={i} className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                      <span>{m.description}</span>
                      <span className="font-semibold text-slate-800">${m.amount} ({m.durationDays} days)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <Link to={`/projects/${viewingProposal.projectId}`} className="text-indigo-600 font-semibold hover:underline">
                View Project Page →
              </Link>
              <Button variant="primary" size="sm" onClick={() => setViewingProposal(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* --- EDIT PROPOSAL MODAL --- */}
      <Modal
        isOpen={Boolean(editingProposal)}
        onClose={() => setEditingProposal(null)}
        title="Edit Proposal"
        description="Update your bid details"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProposalEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bid Amount ($)</label>
              <input
                type="number"
                value={editBidAmount}
                onChange={(e) => setEditBidAmount(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Days</label>
              <input
                type="number"
                value={editEstimatedDays}
                onChange={(e) => setEditEstimatedDays(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Letter</label>
            <textarea
              rows={5}
              value={editCoverLetter}
              onChange={(e) => setEditCoverLetter(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingProposal(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submittingEdit}
            >
              Save Updates
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
