import {
  ContractItem,
  MilestoneItem,
  WalletData,
  LedgerEntry,
  WithdrawalRecord,
  InvoiceRecord,
} from '../types';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('worknova_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const financeApi = {
  // --- CONTRACTS ---
  async getContracts(status?: string): Promise<{ contracts: ContractItem[] }> {
    const q = status ? `?status=${status}` : '';
    const res = await fetch(`/api/contracts${q}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch contracts');
    return json.data;
  },

  async getContractById(id: string): Promise<ContractItem> {
    const res = await fetch(`/api/contracts/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch contract');
    return json.data.contract;
  },

  async createMilestone(contractId: string, data: {
    title: string;
    description: string;
    amount: number;
    dueDate: string;
  }): Promise<MilestoneItem> {
    const res = await fetch('/api/contracts/milestones', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ contractId, ...data }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create milestone');
    return json.data.milestone;
  },

  async deliverMilestone(milestoneId: string, data: {
    message: string;
    attachments?: string[];
  }): Promise<any> {
    const res = await fetch(`/api/contracts/milestones/${milestoneId}/deliver`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to submit delivery');
    return json.data;
  },

  // --- MILESTONES ESCROW & RELEASE ---
  async getMilestonePaymentInfo(milestoneId: string): Promise<any> {
    const res = await fetch(`/api/milestones/${milestoneId}/payment`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch milestone details');
    return json.data;
  },

  async releaseMilestone(milestoneId: string): Promise<any> {
    const res = await fetch(`/api/milestones/${milestoneId}/release`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to release milestone payment');
    return json.data;
  },

  // --- PAYMENTS & FUNDING ---
  async fundMilestone(milestoneId: string, providerName: string = 'Razorpay'): Promise<any> {
    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ milestoneId, provider: providerName }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to initiate milestone funding');
    return json.data;
  },

  async verifyPayment(data: {
    paymentId: string;
    orderId: string;
    signature: string;
  }): Promise<any> {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Payment verification failed');
    return json.data;
  },

  async getMyPayments(): Promise<any[]> {
    const res = await fetch('/api/payments/me', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch payments');
    return json.data.payments;
  },

  // --- WALLET & LEDGER ---
  async getWallet(): Promise<WalletData> {
    const res = await fetch('/api/wallet', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch wallet');
    return json.data.wallet;
  },

  async getWalletLedger(): Promise<LedgerEntry[]> {
    const res = await fetch('/api/wallet/ledger', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch ledger');
    return json.data.ledger;
  },

  // --- WITHDRAWALS ---
  async requestWithdrawal(data: {
    amount: number;
    method: string;
    destinationAccount: string;
  }): Promise<WithdrawalRecord> {
    const res = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to submit withdrawal request');
    return json.data.withdrawal;
  },

  async getWithdrawals(): Promise<WithdrawalRecord[]> {
    const res = await fetch('/api/withdrawals', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch withdrawals');
    return json.data.withdrawals;
  },

  // --- INVOICES ---
  async getInvoices(): Promise<InvoiceRecord[]> {
    const res = await fetch('/api/invoices', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch invoices');
    return json.data.invoices;
  },
};
