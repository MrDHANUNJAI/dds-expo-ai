import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PlusCircle,
  Briefcase,
  Users,
  DollarSign,
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Settings,
  CheckCircle2,
  XCircle,
  UserCheck,
  Filter,
  Plus,
  Trash2,
  Send,
  Eye,
  Columns,
  List,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { sellerDashboardData } from '../../data/dashboard';
import { freelancers } from '../../data/freelancers';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Avatar } from '../../components/common/Avatar';
import { Rating } from '../../components/common/Rating';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
import { SellerProfile } from '../../types/auth';
import { Project, Proposal, ProjectStatus, ProposalStatus } from '../../types';
import { marketplaceApi } from '../../services/marketplaceApi';
import { ContractsEscrowWorkspace } from '../../components/finance/ContractsEscrowWorkspace';
import { ChatWorkspace } from '../../components/chat/ChatWorkspace';
import { TrustVerificationCenter } from '../../components/trust/TrustVerificationCenter';
import { OrganizationManager } from '../../components/growth/OrganizationManager';
import { SubscriptionManager } from '../../components/growth/SubscriptionManager';
import { ReferralRewardsHub } from '../../components/growth/ReferralRewardsHub';
import { DeveloperPortal } from '../../components/growth/DeveloperPortal';
import { AIAgentOrchestrator } from '../../components/growth/AIAgentOrchestrator';
import { PlatformGovernanceHub } from '../../components/growth/PlatformGovernanceHub';

export const SellerDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const sellerProfile = profile as SellerProfile;

  const [searchParams] = useSearchParams();
  const mainTab = (searchParams.get('tab') || '').toUpperCase();

  // Real backend project state
  const [sellerProjects, setSellerProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'IN_PROGRESS'>('ALL');

  // Create Project Modal state
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);

  // Review & Compare Proposals Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeProjectForReview, setActiveProjectForReview] = useState<Project | null>(null);
  const [projectProposals, setProjectProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Alerts
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Project Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('cat-1');
  const [description, setDescription] = useState('');
  const [budgetType, setBudgetType] = useState<'fixed' | 'hourly'>('fixed');
  const [budgetMin, setBudgetMin] = useState(2500);
  const [budgetMax, setBudgetMax] = useState(5000);
  const [experienceLevel, setExperienceLevel] = useState<'Entry' | 'Intermediate' | 'Expert'>('Intermediate');
  const [scope, setScope] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [duration, setDuration] = useState('3–4 weeks');
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, Node.js');
  const [deliverables, setDeliverables] = useState<string[]>([
    'Core functional milestone build',
    'Comprehensive documentation and tests',
  ]);

  // Load seller's real projects from backend
  const loadSellerProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await marketplaceApi.getMySellerProjects();
      setSellerProjects(res.projects);
    } catch (err: any) {
      console.warn('Could not load seller projects, using fallback:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadSellerProjects();
  }, []);

  // Handle Create Project (either as PUBLISHED or DRAFT)
  const handleSaveProject = async (targetStatus: 'PUBLISHED' | 'DRAFT') => {
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide a project title and description.');
      return;
    }

    setSubmittingProject(true);
    setErrorMessage(null);
    try {
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await marketplaceApi.createProject({
        title,
        categoryId,
        description,
        budgetType,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        experienceLevel,
        scope,
        duration,
        deadline: duration,
        skills: skillsArray,
        deliverables: deliverables.filter((d) => d.trim().length > 0),
        status: targetStatus,
      });

      setStatusMessage(
        targetStatus === 'PUBLISHED'
          ? `"${created.title}" is now published and live on the marketplace!`
          : `Draft saved for "${created.title}".`
      );

      setPostModalOpen(false);
      resetProjectForm();
      await loadSellerProjects();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create project');
    } finally {
      setSubmittingProject(false);
    }
  };

  const resetProjectForm = () => {
    setTitle('');
    setDescription('');
    setBudgetMin(2000);
    setBudgetMax(4500);
    setSkillsInput('React, TypeScript, Node.js');
    setDeliverables(['Core functional milestone build', 'Documentation and tests']);
  };

  // Open proposals review modal for a specific project
  const handleOpenReview = async (proj: Project) => {
    setActiveProjectForReview(proj);
    setReviewModalOpen(true);
    setLoadingProposals(true);
    setSelectedForCompare([]);
    try {
      const res = await marketplaceApi.getProjectProposals(proj.id);
      setProjectProposals(res.proposals);
    } catch (err: any) {
      console.error('Failed to load proposals:', err);
      setErrorMessage('Failed to load proposals for this project.');
    } finally {
      setLoadingProposals(false);
    }
  };

  // Change proposal status (Shortlist, Accept, Reject)
  const handleUpdateProposalStatus = async (proposalId: string, newStatus: ProposalStatus, notes?: string) => {
    try {
      await marketplaceApi.updateProposalStatus(proposalId, newStatus, notes);
      setProjectProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: newStatus, clientNotes: notes || p.clientNotes } : p))
      );
      setStatusMessage(`Candidate proposal marked as ${newStatus.toLowerCase()}.`);
      // refresh project list stats
      loadSellerProjects();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update proposal status');
    }
  };

  // Quick publish for draft project
  const handlePublishDraft = async (projectId: string) => {
    try {
      await marketplaceApi.updateProjectStatus(projectId, 'PUBLISHED');
      setStatusMessage('Project published to the marketplace!');
      loadSellerProjects();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to publish project');
    }
  };

  const displayName = sellerProfile?.businessName || `${user?.firstName}'s Team`;

  // Filter projects by active tab
  const filteredProjects = sellerProjects.filter((p) => {
    if (activeTab === 'ALL') return true;
    return p.status === activeTab;
  });

  const totalProposalsCount = sellerProjects.reduce((sum, p) => sum + (p.proposalCount || 0), 0);

  return (
    <DashboardLayout role="seller">
      <div className="space-y-8">
        {/* Status Feedback */}
        {statusMessage && (
          <Alert type="success" message={statusMessage} onDismiss={() => setStatusMessage(null)} />
        )}
        {errorMessage && (
          <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage(null)} />
        )}

        {/* Welcome & Create Project CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {displayName}
              </h1>
              {user?.isVerified && (
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Verified Employer
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Welcome back, <strong>{user?.firstName}</strong>. You have <strong>{totalProposalsCount} active proposals</strong> across your listings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/seller/settings">
              <Button variant="outline" size="md" leftIcon={<Settings className="w-4 h-4" />}>
                Company Settings
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setPostModalOpen(true)}
            >
              Post a Project
            </Button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Active Job Listings</span>
              <span className="text-emerald-600 font-medium text-[11px]">Live now</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {sellerProjects.filter((p) => p.status === 'PUBLISHED').length}
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
              Accepting freelancer proposals
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Total Inbound Proposals</span>
              <span className="text-indigo-600 font-medium text-[11px]">Across all jobs</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalProposalsCount}
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
              Ready for client review
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Draft Listings</span>
              <span className="text-slate-400 font-medium text-[11px]">Unpublished</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {sellerProjects.filter((p) => p.status === 'DRAFT').length}
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
              Ready to launch
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Escrow Protection</span>
              <span className="text-emerald-600 font-medium text-[11px]">Secured</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              $6,500.00
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
              Reserved for active milestones
            </div>
          </div>
        </div>

        {/* Main Workspace Tabs */}
        {mainTab === 'CONTRACTS' ? (
          <ContractsEscrowWorkspace />
        ) : mainTab === 'AI-AGENTS' ? (
          <AIAgentOrchestrator />
        ) : mainTab === 'DEVELOPER' ? (
          <DeveloperPortal />
        ) : mainTab === 'GOVERNANCE' ? (
          <PlatformGovernanceHub />
        ) : mainTab === 'TEAMS' ? (
          <OrganizationManager />
        ) : mainTab === 'MEMBERSHIP' ? (
          <SubscriptionManager />
        ) : mainTab === 'REWARDS' ? (
          <ReferralRewardsHub />
        ) : mainTab === 'MESSAGES' ? (
          <ChatWorkspace />
        ) : mainTab === 'VERIFICATION' || mainTab === 'TRUST' ? (
          <TrustVerificationCenter />
        ) : (
          /* Project Listings & Inbound Proposals Review */
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Your Job Postings & Inbound Proposals
                </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review applicants, compare candidate bids, shortlist top talent, and accept proposals.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              {(['ALL', 'PUBLISHED', 'DRAFT', 'IN_PROGRESS'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL' ? 'All Jobs' : tab === 'PUBLISHED' ? 'Published' : tab === 'DRAFT' ? 'Drafts' : 'In Progress'}
                </button>
              ))}
            </div>
          </div>

          {/* Project List */}
          {loadingProjects ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading your project listings...</div>
          ) : filteredProjects.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          p.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {p.status}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-medium text-slate-500">{p.categoryName || p.category}</span>
                    </div>

                    <Link
                      to={`/projects/${p.id}`}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block truncate"
                    >
                      {p.title}
                    </Link>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>
                        Budget:{' '}
                        <strong className="text-slate-700">
                          {p.budgetType === 'fixed'
                            ? `$${p.budgetMin?.toLocaleString()} – $${p.budgetMax?.toLocaleString()}`
                            : `$${p.budgetMin} – $${p.budgetMax}/hr`}
                        </strong>
                      </span>
                      <span>·</span>
                      <span className="text-indigo-600 font-semibold tabular-nums">
                        {p.proposalCount || 0} proposals received
                      </span>
                      <span>·</span>
                      <span>Timeline: {p.duration || p.deadline}</span>
                    </div>
                  </div>

                  {/* Actions for this project */}
                  <div className="flex items-center gap-2 shrink-0">
                    {p.status === 'DRAFT' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePublishDraft(p.id)}
                      >
                        Publish Listing
                      </Button>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenReview(p)}
                      leftIcon={<Users className="w-3.5 h-3.5" />}
                    >
                      Review Proposals ({p.proposalCount || 0})
                    </Button>

                    <Link to={`/projects/${p.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl space-y-3">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No project listings found in this filter.</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                onClick={() => setPostModalOpen(true)}
              >
                Post a New Project
              </Button>
            </div>
          )}
        </div>
      )}
      </div>

      {/* --- REVIEW & COMPARE PROPOSALS MODAL --- */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Proposals for: ${activeProjectForReview?.title || 'Project'}`}
        description="Review applicants, compare candidate bids, and make hiring decisions"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Header toolbar: View mode & Compare toggle */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="text-xs text-slate-500">
              Showing <strong>{projectProposals.length}</strong> proposals
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={compareMode ? 'primary' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setCompareMode(!compareMode)}
                leftIcon={<Columns className="w-3.5 h-3.5" />}
              >
                {compareMode ? 'Exit Compare View' : 'Side-by-Side Compare'}
              </Button>
            </div>
          </div>

          {loadingProposals ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading applicants...</div>
          ) : projectProposals.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No proposals received yet</p>
              <p className="text-xs text-slate-500">
                Your listing is published. Freelancers will appear here as they submit their bids.
              </p>
            </div>
          ) : compareMode ? (
            /* --- SIDE BY SIDE COMPARE VIEW --- */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectProposals.slice(0, 4).map((prop) => (
                <div
                  key={prop.id}
                  className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={prop.freelancerName} size="sm" isOnline />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{prop.freelancerName}</h4>
                        <p className="text-[11px] text-slate-500">{prop.freelancerTitle}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        prop.status === 'SHORTLISTED'
                          ? 'bg-amber-100 text-amber-800'
                          : prop.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prop.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Bid Amount</span>
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        ${prop.bidAmount?.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Estimated Duration</span>
                      <span className="font-semibold text-slate-800">{prop.estimatedDays} days</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="font-semibold text-slate-700 text-[11px] block">Cover Letter Approach:</span>
                    <p className="text-slate-600 text-xs leading-relaxed max-h-32 overflow-y-auto whitespace-pre-line p-2 bg-white rounded border border-slate-100">
                      {prop.coverLetter}
                    </p>
                  </div>

                  {prop.milestones && prop.milestones.length > 0 && (
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-slate-700 text-[11px] block">
                        Milestones ({prop.milestones.length}):
                      </span>
                      <div className="space-y-1 text-[11px]">
                        {prop.milestones.map((m, idx) => (
                          <div key={idx} className="flex justify-between bg-white px-2 py-1 rounded border border-slate-100">
                            <span className="truncate">{m.description}</span>
                            <span className="font-semibold text-slate-800 shrink-0 ml-2">${m.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <Button
                      variant={prop.status === 'SHORTLISTED' ? 'secondary' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleUpdateProposalStatus(prop.id, 'SHORTLISTED')}
                    >
                      Shortlist
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleUpdateProposalStatus(prop.id, 'ACCEPTED')}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-600 hover:text-red-700"
                      onClick={() => handleUpdateProposalStatus(prop.id, 'REJECTED')}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* --- DETAILED LIST VIEW --- */
            <div className="space-y-4 divide-y divide-slate-100">
              {projectProposals.map((prop) => (
                <div key={prop.id} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar name={prop.freelancerName} size="md" isOnline />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{prop.freelancerName}</h4>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              prop.status === 'SHORTLISTED'
                                ? 'bg-amber-100 text-amber-800'
                                : prop.status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prop.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {prop.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{prop.freelancerTitle}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <Rating rating={prop.freelancerRating || 5.0} showText size="sm" />
                          <span>·</span>
                          <span>Hourly: ${prop.freelancerHourlyRate || 85}/hr</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-extrabold text-slate-900 tabular-nums">
                        ${prop.bidAmount?.toLocaleString()}
                      </div>
                      <span className="text-xs text-slate-500">
                        Delivery in {prop.estimatedDays} days
                      </span>
                    </div>
                  </div>

                  {/* Cover letter */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {prop.coverLetter}
                  </div>

                  {/* Milestones if provided */}
                  {prop.milestones && prop.milestones.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-slate-700">Proposed Milestone Schedule:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {prop.milestones.map((m, i) => (
                          <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200/60 text-[11px]">
                            <p className="font-semibold text-slate-800 truncate">{m.description}</p>
                            <p className="text-slate-500 font-medium mt-0.5">${m.amount} · {m.durationDays} days</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      Submitted on {new Date(prop.createdAt || Date.now()).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={prop.status === 'SHORTLISTED' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleUpdateProposalStatus(prop.id, 'SHORTLISTED')}
                        leftIcon={<Star className="w-3.5 h-3.5" />}
                      >
                        {prop.status === 'SHORTLISTED' ? 'Shortlisted' : 'Shortlist'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateProposalStatus(prop.id, 'ACCEPTED')}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Accept Proposal
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-600 hover:text-red-700"
                        onClick={() => handleUpdateProposalStatus(prop.id, 'REJECTED')}
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* --- POST A PROJECT FULL MODAL --- */}
      <Modal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        title="Post a New Project Listing"
        description="Publish your job requirements to connect with verified global talent"
        maxWidth="xl"
      >
        <div className="space-y-5">
          <Input
            label="Project Title"
            placeholder="e.g. Build a High-Performance Next.js & Node.js Application"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5"
              >
                <option value="cat-1">Web Development</option>
                <option value="cat-2">Design & Creative</option>
                <option value="cat-3">AI & Machine Learning</option>
                <option value="cat-4">Mobile Development</option>
                <option value="cat-5">Cloud & DevOps</option>
                <option value="cat-6">Writing & Translation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5"
              >
                <option value="Entry">Entry Level</option>
                <option value="Intermediate">Intermediate Level</option>
                <option value="Expert">Expert Level</option>
              </select>
            </div>
          </div>

          {/* Budget configuration */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label className="block text-xs font-bold text-slate-900">Budget Details</label>
            <div className="flex gap-4 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="modalBudgetType"
                  checked={budgetType === 'fixed'}
                  onChange={() => setBudgetType('fixed')}
                  className="text-indigo-600"
                />
                <span>Fixed Price</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="modalBudgetType"
                  checked={budgetType === 'hourly'}
                  onChange={() => setBudgetType('hourly')}
                  className="text-indigo-600"
                />
                <span>Hourly Rate</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  {budgetType === 'fixed' ? 'Minimum Budget ($)' : 'Min Rate ($/hr)'}
                </label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  {budgetType === 'fixed' ? 'Maximum Budget ($)' : 'Max Rate ($/hr)'}
                </label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-semibold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Scope & Duration</label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5"
              >
                <option value="Small">Small (Quick Deliverable)</option>
                <option value="Medium">Medium (Defined Milestone)</option>
                <option value="Large">Large (Complex Initiative)</option>
              </select>
              <input
                type="text"
                placeholder="Timeline e.g. 4–6 weeks"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Required Skills (Comma separated)</label>
            <input
              type="text"
              placeholder="e.g. React, TypeScript, Next.js, Tailwind CSS"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Brief & Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-3 focus:outline-none focus:border-indigo-600"
              placeholder="Detail your requirements, expectations, and goals..."
              required
            />
          </div>

          {/* Actions: Save Draft vs Publish */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPostModalOpen(false)}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                isLoading={submittingProject}
                onClick={() => handleSaveProject('DRAFT')}
              >
                Save as Draft
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={submittingProject}
                onClick={() => handleSaveProject('PUBLISHED')}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Publish Job Listing
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
