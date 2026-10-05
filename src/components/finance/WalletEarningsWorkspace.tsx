import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  DollarSign,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { financeApi } from '../../services/financeApi';
import { WalletData, LedgerEntry, WithdrawalRecord, InvoiceRecord } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';

export const WalletEarningsWorkspace: React.FC = () => {
  const { user } = useAuth();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal Modal
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(5000);
  const [payoutMethod, setPayoutMethod] = useState<'BANK_TRANSFER' | 'UPI' | 'PAYPAL'>('UPI');
  const [destinationAccount, setDestinationAccount] = useState('alex.morgan@oksbi');
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const [wal, led, withs, invs] = await Promise.all([
        financeApi.getWallet(),
        financeApi.getWalletLedger(),
        financeApi.getWithdrawals(),
        financeApi.getInvoices(),
      ]);

      setWallet(wal);
      setLedger(led);
      setWithdrawals(withs);
      setInvoices(invs);
    } catch (err: any) {
      console.warn('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || withdrawAmount > wallet.availableBalance) {
      setErrorMessage('Withdrawal amount cannot exceed available balance.');
      return;
    }
    if (withdrawAmount <= 0) {
      setErrorMessage('Please enter a valid withdrawal amount.');
      return;
    }

    try {
      setProcessingWithdrawal(true);
      setErrorMessage(null);
      await financeApi.requestWithdrawal({
        amount: withdrawAmount,
        method: payoutMethod,
        destinationAccount,
      });

      setStatusMessage(`Payout request for INR ${withdrawAmount.toLocaleString()} submitted for processing.`);
      setWithdrawalModalOpen(false);
      loadFinanceData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Withdrawal request failed');
    } finally {
      setProcessingWithdrawal(false);
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

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Available for Payout</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹{(wallet?.availableBalance || 0).toLocaleString()}
          </div>
          <div className="mt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setWithdrawalModalOpen(true)}
              disabled={(wallet?.availableBalance || 0) <= 0}
              className="w-full text-xs"
            >
              Withdraw Funds
            </Button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pending Escrow</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹{(wallet?.pendingBalance || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Held in client escrow awaiting deliverable approval
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Net Earned</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹{(wallet?.totalEarned || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2">
            Cumulative completed milestones
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Withdrawn</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹{(wallet?.totalWithdrawn || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Successfully disbursed to external accounts
          </p>
        </div>
      </div>

      {/* Ledger History & Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ledger Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Wallet Transaction Ledger
            </h3>
            <span className="text-xs text-slate-500">{ledger.length} Records</span>
          </div>

          <div className="divide-y divide-slate-100">
            {ledger.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No ledger transactions recorded yet.
              </div>
            ) : (
              ledger.map((entry) => {
                const isCredit = entry.direction === 'CREDIT';
                return (
                  <div key={entry.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{entry.description}</p>
                        <p className="text-[11px] text-slate-400">
                          {entry.type} • {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-bold ${
                          isCredit ? 'text-emerald-600' : 'text-slate-800'
                        }`}
                      >
                        {isCredit ? '+' : '-'}₹{entry.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-2">
              <Download className="w-4 h-4 text-slate-600" />
              Tax Invoices
            </h3>
            <span className="text-xs text-slate-500">{invoices.length} Available</span>
          </div>

          <div className="divide-y divide-slate-100 p-2">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Invoices generate automatically when milestone payments are released.
              </div>
            ) : (
              invoices.map((inv) => (
                <div key={inv.id} className="p-3 hover:bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-semibold text-slate-900 text-[11px]">
                      {inv.invoiceNumber}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{inv.projectTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      ₹{inv.totalAmount.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-medium">PAID</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      {withdrawalModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setWithdrawalModalOpen(false)}
          title="Withdraw Funds to Bank or UPI"
          maxWidth="md"
        >
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Available for Withdrawal:</span>
                <span className="font-bold text-slate-900">
                  ₹{(wallet?.availableBalance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Withdrawal Amount (₹)
              </label>
              <input
                type="number"
                min="500"
                max={wallet?.availableBalance || 0}
                required
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payout Channel
              </label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as any)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="UPI">UPI ID (Instant VPA Transfer)</option>
                <option value="BANK_TRANSFER">Direct Bank Transfer (NEFT/IMPS)</option>
                <option value="PAYPAL">PayPal / Global Wire</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Account / UPI VPA
              </label>
              <input
                type="text"
                required
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value)}
                placeholder="e.g. username@okhdfcbank or IFSC / Account Number"
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setWithdrawalModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={processingWithdrawal}>
                {processingWithdrawal ? 'Submitting Transfer...' : 'Confirm Payout'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
