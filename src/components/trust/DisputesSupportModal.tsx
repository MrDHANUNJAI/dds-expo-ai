import React, { useState } from 'react';
import {
  AlertTriangle,
  LifeBuoy,
  FileText,
  Upload,
  ShieldAlert,
  Send,
  X,
} from 'lucide-react';
import { communicationApi } from '../../services/communicationApi';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface DisputesSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'DISPUTE' | 'SUPPORT';
  projectId?: string;
  contractId?: string;
  milestoneId?: string;
  onSuccess?: () => void;
}

export const DisputesSupportModal: React.FC<DisputesSupportModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'DISPUTE',
  projectId = 'proj-1',
  contractId = 'con-001',
  milestoneId,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'DISPUTE' | 'SUPPORT'>(defaultMode);

  // Dispute form state
  const [reason, setReason] = useState('UNRESPONSIVE_PARTY');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputedAmount, setDisputedAmount] = useState(25000);
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Support ticket form state
  const [supportCategory, setSupportCategory] = useState('BILLING');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportDesc, setSupportDesc] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDesc.trim()) return;

    try {
      setSubmittingDispute(true);
      setError(null);
      await communicationApi.createDispute({
        projectId,
        contractId,
        milestoneId,
        reason,
        description: disputeDesc.trim(),
        disputedAmount,
      });

      setFeedback('Dispute submitted for admin arbitration. Funds in escrow have been frozen safely.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit dispute');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleCreateSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportDesc.trim()) return;

    try {
      setSubmittingSupport(true);
      setError(null);
      await communicationApi.createSupportTicket({
        category: supportCategory,
        subject: supportSubject.trim(),
        description: supportDesc.trim(),
      });

      setFeedback('Support ticket logged with platform operations. Reference will appear on your support desk.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setSubmittingSupport(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'DISPUTE' ? 'Open Contract Dispute & Arbitration' : 'Contact WorkNova Operations Support'}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Mode Selector */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setMode('DISPUTE')}
            className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
              mode === 'DISPUTE'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            File Project Dispute
          </button>
          <button
            type="button"
            onClick={() => setMode('SUPPORT')}
            className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
              mode === 'SUPPORT'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            Platform Support Ticket
          </button>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200">
            {feedback}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {mode === 'DISPUTE' ? (
          <form onSubmit={handleCreateDispute} className="space-y-3">
            <div className="bg-amber-50 p-3 rounded-lg text-amber-900 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Filing a dispute pauses milestone release. An independent WorkNova arbitration officer will inspect contract deliverables, chat history, and evidence.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispute Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="UNRESPONSIVE_PARTY">Unresponsive Specialist / Client</option>
                <option value="DELIVERABLE_NOT_MET">Deliverables do not match contract scope</option>
                <option value="MISSED_DEADLINE">Contract deadline severely breached</option>
                <option value="PAYMENT_DISPUTE">Escrow release disagreement</option>
                <option value="SCOPE_CREEP">Unreasonable demands outside original contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Disputed Amount (₹)
              </label>
              <input
                type="number"
                value={disputedAmount}
                onChange={(e) => setDisputedAmount(Number(e.target.value))}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Statement & Facts
              </label>
              <textarea
                rows={4}
                required
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                placeholder="Explain clearly what went wrong and what resolution you are requesting..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submittingDispute || !disputeDesc.trim()}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {submittingDispute ? 'Submitting...' : 'File Official Dispute'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateSupport} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={supportCategory}
                onChange={(e) => setSupportCategory(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="BILLING">Billing, Invoices & Escrow</option>
                <option value="ACCOUNT">Account, Login & 2FA</option>
                <option value="VERIFICATION">Identity & Business Verification</option>
                <option value="TECHNICAL">Platform Technical Support</option>
                <option value="POLICY">Marketplace Terms & Safety</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="Brief subject of the inquiry..."
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                required
                value={supportDesc}
                onChange={(e) => setSupportDesc(e.target.value)}
                placeholder="Describe your issue with as much detail as possible..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submittingSupport || !supportSubject.trim() || !supportDesc.trim()}
              >
                {submittingSupport ? 'Logging...' : 'Submit Support Request'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
