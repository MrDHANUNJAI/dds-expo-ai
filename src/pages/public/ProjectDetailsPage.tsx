import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Calendar,
  FileText,
  Paperclip,
  CheckCircle2,
  Bookmark,
  Share2,
  AlertCircle,
  Briefcase,
  Users,
  ShieldCheck,
  Send,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Check,
} from 'lucide-react';
import { projects as fallbackProjects } from '../../data/projects';
import { sellers as fallbackSellers } from '../../data/sellers';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Avatar } from '../../components/common/Avatar';
import { Rating } from '../../components/common/Rating';
import { Alert } from '../../components/common/Alert';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { marketplaceApi } from '../../services/marketplaceApi';
import { Project, Proposal, ProposalMilestone } from '../../types';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [existingProposal, setExistingProposal] = useState<Proposal | null>(null);

  // Modals & form state
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Proposal form fields
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState<number>(14);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [milestones, setMilestones] = useState<ProposalMilestone[]>([
    { description: 'Initial Architecture & Setup', amount: 0, durationDays: 5 },
  ]);

  // Load project details
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const { project: p, seller: s } = await marketplaceApi.getProjectById(id);
        setProject(p);
        setSeller(s);
        setBidAmount(p.budgetMin || 1000);
      } catch (err) {
        console.warn('Backend project not found, using static fallback:', err);
        const fbProject = fallbackProjects.find((p) => p.id === id) || fallbackProjects[0];
        const fbSeller = fallbackSellers.find((s) => s.id === fbProject.sellerId) || fallbackSellers[0];
        setProject(fbProject as Project);
        setSeller(fbSeller);
        setBidAmount(fbProject.budgetMin || 1000);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Check if current user has an existing proposal & if bookmarked
  useEffect(() => {
    async function checkUserProposal() {
      if (!id || !user || user.role !== 'FREELANCER') return;
      try {
        const prop = await marketplaceApi.checkMyProposal(id);
        if (prop) {
          setExistingProposal(prop);
          setBidAmount(prop.bidAmount);
          setEstimatedDays(prop.estimatedDays || 14);
          setCoverLetter(prop.coverLetter);
          if (prop.milestones && prop.milestones.length > 0) {
            setMilestones(prop.milestones);
          }
        }

        const { savedProjectIds } = await marketplaceApi.getSavedProjects();
        if (savedProjectIds.includes(id)) {
          setIsBookmarked(true);
        }
      } catch (err) {
        console.error('Failed to check user proposal status:', err);
      }
    }
    checkUserProposal();
  }, [id, user]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleBookmarkToggle = async () => {
    if (!user || user.role !== 'FREELANCER') {
      setLoginPromptOpen(true);
      return;
    }
    if (!project) return;
    try {
      const res = await marketplaceApi.toggleSaveProject(project.id);
      setIsBookmarked(res.isSaved);
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  const handleOpenProposalModal = () => {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    if (user.role !== 'FREELANCER') {
      setActionError('Only Freelancer accounts can submit proposals. You are currently signed in as ' + user.role);
      return;
    }
    setProposalModalOpen(true);
  };

  const handleAddMilestone = () => {
    setMilestones([...milestones, { description: '', amount: 500, durationDays: 7 }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: keyof ProposalMilestone, value: any) => {
    const next = [...milestones];
    next[index] = { ...next[index], [field]: value };
    setMilestones(next);
  };

  // Submit new proposal
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    if (coverLetter.trim().length < 30) {
      setActionError('Cover letter must be at least 30 characters explaining your approach.');
      return;
    }
    if (bidAmount <= 0) {
      setActionError('Please specify a valid bid amount greater than $0.');
      return;
    }

    setSubmitting(true);
    setActionError(null);
    try {
      const proposal = await marketplaceApi.submitProposal({
        projectId: project.id,
        coverLetter,
        bidAmount,
        estimatedDays,
        milestones: milestones.filter((m) => m.description.trim().length > 0),
      });

      setExistingProposal(proposal);
      setProposalModalOpen(false);
      setActionSuccess('Your proposal has been submitted to the client! You can track its status in your dashboard.');
      setProject({ ...project, proposalCount: (project.proposalCount || 0) + 1 });
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit submitted proposal
  const handleEditProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingProposal) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const updated = await marketplaceApi.updateProposal(existingProposal.id, {
        coverLetter,
        bidAmount,
        estimatedDays,
        milestones,
      });
      setExistingProposal(updated);
      setEditModalOpen(false);
      setActionSuccess('Proposal updated successfully.');
    } catch (err: any) {
      setActionError(err.message || 'Failed to update proposal');
    } finally {
      setSubmitting(false);
    }
  };

  // Withdraw proposal
  const handleWithdrawProposal = async () => {
    if (!existingProposal) return;
    if (!confirm('Are you sure you want to withdraw your proposal? This cannot be undone.')) return;
    try {
      const withdrawn = await marketplaceApi.withdrawProposal(existingProposal.id);
      setExistingProposal(withdrawn);
      setActionSuccess('Your proposal has been withdrawn.');
      if (project && project.proposalCount > 0) {
        setProject({ ...project, proposalCount: project.proposalCount - 1 });
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to withdraw proposal');
    }
  };

  if (loading || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm">Loading project specifications...</p>
      </div>
    );
  }

  const formattedBudget =
    project.budgetType === 'fixed'
      ? `$${(project.budgetMin || 0).toLocaleString()} – $${(project.budgetMax || 0).toLocaleString()}`
      : `$${project.budgetMin} – $${project.budgetMax}/hr`;

  // Fee calculation (10% platform fee)
  const fee = Math.round(bidAmount * 0.1);
  const netEarnings = Math.max(0, bidAmount - fee);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Find Work', href: '/find-work' },
          { label: project.categoryName || project.category, href: `/categories` },
          { label: project.title },
        ]}
      />

      {copiedLink && (
        <Alert
          type="success"
          message="Project link copied to clipboard!"
          onDismiss={() => setCopiedLink(false)}
        />
      )}

      {actionSuccess && (
        <Alert
          type="success"
          message={actionSuccess}
          onDismiss={() => setActionSuccess(null)}
        />
      )}

      {actionError && (
        <Alert
          type="error"
          message={actionError}
          onDismiss={() => setActionError(null)}
        />
      )}

      {/* Main Layout: 2 Columns (Left Details 8 cols, Right Summary 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Project Specifications */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
            {/* Top metadata */}
            <div className="flex items-center justify-between gap-4 text-xs text-slate-500 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-indigo-600">
                  {project.subcategoryName || project.subcategory || project.categoryName || project.category}
                </span>
                <span className="text-slate-300">·</span>
                <span>Posted {project.postedTime || 'Recently'}</span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{project.isRemote !== false ? 'Worldwide / Remote' : project.sellerLocation || 'Global'}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleBookmarkToggle}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isBookmarked
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                  title={isBookmarked ? 'Saved' : 'Save Project'}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-600' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Share Project"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    project.status === 'PUBLISHED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : project.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {project.title}
              </h1>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Budget</span>
                <span className="font-bold text-slate-900 text-sm tabular-nums">{formattedBudget}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Experience</span>
                <span className="font-semibold text-slate-800 text-sm">{project.experienceLevel} Level</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Estimated Duration</span>
                <span className="font-semibold text-slate-800 text-sm">{project.duration || project.deadline}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Project Scope</span>
                <span className="font-semibold text-slate-800 text-sm">{project.scope || 'Medium'} Scope</span>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Project Overview & Requirements
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* Deliverables Checklist */}
            {project.deliverables && project.deliverables.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Key Deliverables
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  {project.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Skills & Technologies Required
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Attachments */}
            {project.attachments && project.attachments.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Project Attachments
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.attachments.map((file, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3"
                    >
                      <Paperclip className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-semibold text-slate-800 truncate">{file}</p>
                        <p className="text-slate-400">Attached Technical File</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Activity Metrics */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Activity on this Job
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                <div>
                  <span className="text-slate-400 block">Proposals</span>
                  <span className="font-bold text-slate-900 text-sm tabular-nums">
                    {project.proposalCount || 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Interviewing</span>
                  <span className="font-bold text-slate-900 text-sm tabular-nums">2</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Invited Freelancers</span>
                  <span className="font-bold text-slate-900 text-sm tabular-nums">3</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Payment Verified</span>
                  <span className="font-bold text-emerald-600 text-sm">Yes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Proposal Action Card & Seller Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div>
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {formattedBudget}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {project.budgetType === 'fixed'
                  ? 'Fixed price with milestone releases'
                  : 'Hourly billing with weekly tracking'}
              </p>
            </div>

            {/* If user already submitted a proposal */}
            {existingProposal && existingProposal.status !== 'WITHDRAWN' ? (
              <div className="space-y-3 p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">Your Proposal</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      existingProposal.status === 'SHORTLISTED'
                        ? 'bg-amber-100 text-amber-800'
                        : existingProposal.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : existingProposal.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {existingProposal.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-700">
                  <p>
                    <strong>Bid:</strong> ${existingProposal.bidAmount.toLocaleString()} ({existingProposal.estimatedDays || 14} days)
                  </p>
                  <p className="line-clamp-2 text-slate-600 text-[11px] italic">
                    "{existingProposal.coverLetter}"
                  </p>
                </div>

                {existingProposal.status === 'SUBMITTED' && (
                  <div className="flex gap-2 pt-2 border-t border-indigo-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setEditModalOpen(true)}
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    >
                      Edit Proposal
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-600 hover:text-red-700"
                      onClick={handleWithdrawProposal}
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    >
                      Withdraw
                    </Button>
                  </div>
                )}
              </div>
            ) : existingProposal?.status === 'WITHDRAWN' ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                You withdrew your proposal for this project.
                <button
                  onClick={() => setProposalModalOpen(true)}
                  className="block mt-1 text-indigo-600 font-semibold hover:underline"
                >
                  Submit a new proposal →
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full font-semibold shadow-xs"
                onClick={handleOpenProposalModal}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit a Proposal
              </Button>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Funds held securely in WorkNova Escrow</span>
            </div>
          </div>

          {/* Seller Information Card */}
          {seller && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                About the Client
              </h3>

              <div className="flex items-center gap-3">
                <Avatar name={seller.company || seller.name || project.sellerName} size="md" />
                <div className="min-w-0">
                  <span className="text-sm font-bold text-slate-900 truncate block">
                    {seller.company || project.sellerCompany}
                  </span>
                  <p className="text-xs text-slate-500">{seller.name || project.sellerName}</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Rating</span>
                  <Rating rating={seller.rating || 4.9} reviewCount={seller.reviewCount || 18} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Location</span>
                  <span className="font-medium text-slate-800">{seller.location || project.sellerLocation || 'Global'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Projects Posted</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {seller.projectsPosted || 6}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Member Since</span>
                  <span className="text-slate-700">{seller.memberSince || 'March 2024'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- SUBMIT PROPOSAL MODAL --- */}
      <Modal
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        title="Submit a Proposal"
        description={`Bidding on: ${project.title}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitProposal} className="space-y-5">
          {/* Bid details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Total Bid Amount ($ USD)
              </label>
              <input
                type="number"
                min="10"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-900"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Client's budget: {formattedBudget}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimated Delivery (Days)
              </label>
              <input
                type="number"
                min="1"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-900"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Client timeline: {project.duration || project.deadline}
              </p>
            </div>
          </div>

          {/* Fee Calculation Callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Proposal Bid:</span>
              <span className="font-semibold text-slate-900 tabular-nums">${bidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>WorkNova Service Fee (10%):</span>
              <span className="text-red-600 tabular-nums">-${fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-slate-200 text-xs">
              <span>You'll Receive:</span>
              <span className="tabular-nums">${netEarnings.toLocaleString()}</span>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="font-semibold text-slate-700">Cover Letter</label>
              <span className={`text-[11px] ${coverLetter.length >= 30 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {coverLetter.length}/30 min chars
              </span>
            </div>
            <textarea
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Explain why you are the best fit for this project. Outline your technical approach, previous relevant experience, and timeline..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-3 focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          {/* Optional Milestone Breakdown */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Project Milestones</h4>
                <p className="text-[11px] text-slate-500">Break work down into released payments</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleAddMilestone}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Milestone
              </Button>
            </div>

            <div className="space-y-2">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Milestone description"
                    value={m.description}
                    onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                    className="flex-1 text-xs bg-white border border-slate-300 rounded-lg p-2"
                  />
                  <input
                    type="number"
                    placeholder="$ Amount"
                    value={m.amount}
                    onChange={(e) => handleMilestoneChange(idx, 'amount', Number(e.target.value))}
                    className="w-24 text-xs bg-white border border-slate-300 rounded-lg p-2"
                  />
                  <input
                    type="number"
                    placeholder="Days"
                    value={m.durationDays}
                    onChange={(e) => handleMilestoneChange(idx, 'durationDays', Number(e.target.value))}
                    className="w-20 text-xs bg-white border border-slate-300 rounded-lg p-2"
                  />
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setProposalModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Submit Proposal Now
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT PROPOSAL MODAL --- */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Submitted Proposal"
        description="Update your bid details or cover letter before client review"
        maxWidth="lg"
      >
        <form onSubmit={handleEditProposal} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bid Amount ($)</label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Days</label>
              <input
                type="number"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Letter</label>
            <textarea
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- LOGIN REQUIRED PROMPT MODAL --- */}
      <Modal
        isOpen={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        title="Freelancer Sign In Required"
        description="Join WorkNova to bid on high-impact projects"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            You must be logged in with a <strong>Freelancer Account</strong> to submit proposals and bookmark projects.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => navigate('/freelancer/login')}
            >
              Log in as Freelancer
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => navigate('/freelancer/register')}
            >
              Create Freelancer Profile
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
