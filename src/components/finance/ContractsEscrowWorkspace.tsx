import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  UploadCloud,
  FileText,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { financeApi } from '../../services/financeApi';
import { ContractItem, MilestoneItem } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { Avatar } from '../common/Avatar';

interface ContractsEscrowWorkspaceProps {
  onOpenMessages?: (projectId: string, counterpartyId: string) => void;
  onOpenDispute?: (projectId: string, contractId: string, milestoneId?: string) => void;
}

export const ContractsEscrowWorkspace: React.FC<ContractsEscrowWorkspaceProps> = ({
  onOpenMessages,
  onOpenDispute,
}) => {
  const { user } = useAuth();
  const isSeller = user?.role === 'SELLER';

  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Escrow Funding Modal (for Seller)
  const [fundingMilestone, setFundingMilestone] = useState<MilestoneItem | null>(null);
  const [fundingBreakdown, setFundingBreakdown] = useState<any>(null);
  const [paymentProvider, setPaymentProvider] = useState<'Razorpay' | 'Stripe'>('Razorpay');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Deliver Work Modal (for Freelancer)
  const [deliveringMilestone, setDeliveringMilestone] = useState<MilestoneItem | null>(null);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  // Release Payment Modal (for Seller)
  const [releasingMilestone, setReleasingMilestone] = useState<MilestoneItem | null>(null);
  const [processingRelease, setProcessingRelease] = useState(false);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getContracts();
      setContracts(res.contracts);
      if (!selectedContractId && res.contracts.length > 0) {
        setSelectedContractId(res.contracts[0].id);
      }
    } catch (err: any) {
      console.warn('Could not load contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const activeContract = contracts.find((c) => c.id === selectedContractId);

  // Handle Initiating Milestone Funding
  const openFundingModal = async (ms: MilestoneItem) => {
    setFundingMilestone(ms);
    try {
      const info = await financeApi.getMilestonePaymentInfo(ms.id);
      setFundingBreakdown(info.pricing);
    } catch (err: any) {
      setFundingBreakdown({
        subtotal: ms.amount,
        platformFee: Math.round(ms.amount * 0.05),
        taxAmount: Math.round(ms.amount * 0.05 * 0.18),
        totalPayable: Math.round(ms.amount * 1.059),
        currency: ms.currency,
      });
    }
  };

  const handleExecutePayment = async () => {
    if (!fundingMilestone) return;
    try {
      setProcessingPayment(true);
      setErrorMessage(null);

      // 1. Create order on server
      const orderData = await financeApi.fundMilestone(fundingMilestone.id, paymentProvider);

      // 2. Simulate Razorpay/Stripe checkout confirmation
      await new Promise((r) => setTimeout(r, 1200));

      // 3. Verify payment signature
      const verifyRes = await financeApi.verifyPayment({
        paymentId: orderData.paymentId,
        orderId: orderData.orderId,
        signature: 'sim_sig_' + Math.random().toString(36).substring(7),
      });

      setStatusMessage(
        `Milestone "${fundingMilestone.title}" funded successfully! Funds held securely in WorkNova Escrow.`
      );
      setFundingMilestone(null);
      loadContracts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle Freelancer Submitting Work
  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveringMilestone || !deliveryNote.trim()) return;

    try {
      setSubmittingDelivery(true);
      setErrorMessage(null);
      await financeApi.deliverMilestone(deliveringMilestone.id, {
        message: deliveryNote.trim(),
        attachments: ['Project-Source-Code.zip', 'Verification-Logs.pdf'],
      });

      setStatusMessage(`Work deliverable submitted for "${deliveringMilestone.title}"! Client notified for approval.`);
      setDeliveringMilestone(null);
      setDeliveryNote('');
      loadContracts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit deliverable');
    } finally {
      setSubmittingDelivery(false);
    }
  };

  // Handle Seller Releasing Escrow Funds to Freelancer
  const handleReleasePayment = async () => {
    if (!releasingMilestone) return;
    try {
      setProcessingRelease(true);
      setErrorMessage(null);
      const res = await financeApi.releaseMilestone(releasingMilestone.id);
      setStatusMessage(res.message || 'Payment released to freelancer wallet successfully!');
      setReleasingMilestone(null);
      loadContracts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to release payment');
    } finally {
      setProcessingRelease(false);
    }
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <Alert variant="success" onClose={() => setStatusMessage(null)}>
          {statusMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Contracts & Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Contracts & Escrow Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Milestone-based project management with protected escrow and automated wallet disbursements.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-xs text-slate-400">
          Loading workspace contracts...
        </div>
      ) : contracts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-sm">No active contracts yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isSeller
              ? 'When you accept a freelancer proposal, a formal contract with milestone escrow is automatically established here.'
              : 'When a client hires you for a project, your active contract and milestone funding tracker will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contracts Sidebar Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              Active Engagements ({contracts.length})
            </h3>
            <div className="space-y-2">
              {contracts.map((c) => {
                const isSelected = c.id === selectedContractId;
                const counterpartyName = isSeller ? c.freelancerName : c.sellerName;
                const totalEscrow = c.milestones.reduce((acc, m) => acc + (m.paymentStatus === 'FUNDED' ? m.amount : 0), 0);

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContractId(c.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/10 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {c.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {c.currency} {c.totalBudget.toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">
                      {c.projectTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      With <strong className="text-slate-700">{counterpartyName || 'Counterparty'}</strong>
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{c.milestones.length} Milestones</span>
                      <span className="text-emerald-600 font-medium">
                        {totalEscrow > 0 ? `${c.currency} ${totalEscrow.toLocaleString()} in Escrow` : 'Unfunded'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Contract Milestones Pane */}
          {activeContract && (
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{activeContract.projectTitle}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Contract Ref: <span className="font-mono text-slate-700">{activeContract.id}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenMessages && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          onOpenMessages(
                            activeContract.projectId,
                            isSeller ? activeContract.freelancerId : activeContract.sellerId
                          )
                        }
                      >
                        Project Chat
                      </Button>
                    )}
                    {onOpenDispute && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenDispute(activeContract.projectId, activeContract.id)}
                        className="text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        Dispute
                      </Button>
                    )}
                  </div>
                </div>

                {/* Milestones List */}
                <div className="mt-5 space-y-3">
                  <h4 className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Milestones & Escrow Status
                  </h4>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                    {activeContract.milestones.map((ms, index) => {
                      const isFunded = ms.paymentStatus === 'FUNDED';
                      const isReleased = ms.paymentStatus === 'RELEASED';
                      const isSubmitted = ms.workflowStatus === 'SUBMITTED';

                      return (
                        <div key={ms.id} className="p-4 bg-slate-50/50 hover:bg-white transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {index + 1}
                                </span>
                                <h5 className="font-semibold text-xs text-slate-900">{ms.title}</h5>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                    isReleased
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isFunded
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {ms.paymentStatus}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 pl-7">{ms.description}</p>
                              <div className="pl-7 mt-2 flex items-center gap-4 text-[11px] text-slate-400">
                                <span>Due: {new Date(ms.dueDate).toLocaleDateString()}</span>
                                <span>Status: {ms.workflowStatus}</span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:items-end gap-2 shrink-0">
                              <span className="font-bold text-sm text-slate-900">
                                {ms.currency} {ms.amount.toLocaleString()}
                              </span>

                              {/* Action buttons depending on role and payment status */}
                              <div className="flex items-center gap-2">
                                {isSeller ? (
                                  <>
                                    {!isFunded && !isReleased && (
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => openFundingModal(ms)}
                                        className="text-xs"
                                      >
                                        Fund Milestone
                                      </Button>
                                    )}
                                    {isFunded && (
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setReleasingMilestone(ms)}
                                        className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                      >
                                        Approve & Release
                                      </Button>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {isFunded && !isReleased && (
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setDeliveringMilestone(ms)}
                                        className="text-xs"
                                      >
                                        Submit Work
                                      </Button>
                                    )}
                                    {!isFunded && !isReleased && (
                                      <span className="text-[11px] text-slate-400 italic">
                                        Awaiting client funding
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Escrow Funding Modal */}
      {fundingMilestone && (
        <Modal
          isOpen={true}
          onClose={() => setFundingMilestone(null)}
          title={`Fund Milestone: ${fundingMilestone.title}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Milestone Subtotal:</span>
                <span className="font-semibold text-slate-900">
                  {fundingMilestone.currency} {fundingMilestone.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Processing Fee (5%):</span>
                <span className="font-semibold text-slate-900">
                  {fundingMilestone.currency}{' '}
                  {fundingBreakdown?.platformFee?.toLocaleString() || Math.round(fundingMilestone.amount * 0.05)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Applicable GST (18% on fee):</span>
                <span className="font-semibold text-slate-900">
                  {fundingMilestone.currency}{' '}
                  {fundingBreakdown?.taxAmount?.toLocaleString() ||
                    Math.round(fundingMilestone.amount * 0.05 * 0.18)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Payable into Escrow:</span>
                <span className="text-indigo-600">
                  {fundingMilestone.currency}{' '}
                  {fundingBreakdown?.totalPayable?.toLocaleString() ||
                    Math.round(fundingMilestone.amount * 1.059)}
                </span>
              </div>
            </div>

            {/* Provider selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Payment Method:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentProvider('Razorpay')}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    paymentProvider === 'Razorpay'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900">Razorpay (India)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">UPI, Net Banking, Cards</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentProvider('Stripe')}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    paymentProvider === 'Stripe'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900">Stripe (Global)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">International Visa/MC</p>
                </button>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg text-emerald-800 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Funds remain protected in WorkNova Escrow until you review and approve the specialist's deliverable.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setFundingMilestone(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExecutePayment}
                disabled={processingPayment}
              >
                {processingPayment ? 'Processing Escrow Deposit...' : 'Confirm & Deposit Funds'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Freelancer Delivery Submission Modal */}
      {deliveringMilestone && (
        <Modal
          isOpen={true}
          onClose={() => setDeliveringMilestone(null)}
          title={`Submit Deliverable: ${deliveringMilestone.title}`}
          maxWidth="md"
        >
          <form onSubmit={handleSubmitDelivery} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Delivery Notes & Solution Summary
              </label>
              <textarea
                rows={4}
                required
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="Detail what was built, testing performed, deployment URLs, or instructions for the client..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">Attached Delivery Package:</span>
              <p className="text-[11px] text-slate-500 mt-1">
                • Project-Source-Code.zip (Production build)
                <br />• Verification-Logs.pdf (Testing confirmation)
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setDeliveringMilestone(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submittingDelivery || !deliveryNote.trim()}>
                {submittingDelivery ? 'Submitting...' : 'Submit to Client'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Seller Release Payment Modal */}
      {releasingMilestone && (
        <Modal
          isOpen={true}
          onClose={() => setReleasingMilestone(null)}
          title="Approve Work & Release Escrow Payment"
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you satisfied with the deliverables for{' '}
              <strong className="text-slate-900">"{releasingMilestone.title}"</strong>?
            </p>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs space-y-1">
              <div className="flex justify-between font-bold text-emerald-900 text-sm">
                <span>Escrow Payout to Specialist:</span>
                <span>
                  {releasingMilestone.currency} {releasingMilestone.amount.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Upon confirmation, this amount will immediately transfer from Escrow into the freelancer's digital wallet and an official tax invoice will be generated.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setReleasingMilestone(null)}>
                Review Further
              </Button>
              <Button
                variant="primary"
                onClick={handleReleasePayment}
                disabled={processingRelease}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {processingRelease ? 'Releasing Funds...' : 'Approve & Release Funds'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
