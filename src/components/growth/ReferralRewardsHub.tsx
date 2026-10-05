import React, { useState, useEffect } from 'react';
import {
  Gift,
  Copy,
  Check,
  Users,
  DollarSign,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { growthApi, ReferralProfileData } from '../../services/growthApi';

export const ReferralRewardsHub: React.FC = () => {
  const [profile, setProfile] = useState<ReferralProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const data = await growthApi.getReferralProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const handleCopyLink = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput) return;
    setClaiming(true);
    setActionMsg(null);
    try {
      const res = await growthApi.applyReferralCode(inviteCodeInput.trim());
      setActionMsg({ type: 'success', text: res.message || 'Referral code applied successfully!' });
      setInviteCodeInput('');
      await fetchReferralData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to apply referral code' });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-slate-400 text-xs">Loading rewards hub...</div>;
  }

  if (!profile) return null;

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

      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5 text-indigo-400" /> Refer & Earn $25
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Invite fellow talent & clients to WorkNova
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Give your peers $10 in platform fee credit when they sign up with your code. When they complete their first milestone, you earn $25 directly in your platform wallet.
          </p>
        </div>

        {/* Link Copy Box */}
        <div className="mt-6 max-w-xl flex flex-col sm:flex-row gap-2">
          <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white font-mono truncate flex items-center justify-between">
            <span>{profile.referralLink}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="px-5 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shrink-0 shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Link!' : 'Copy Referral Link'}
          </button>
        </div>
      </div>

      {/* Referral Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Users className="w-4 h-4 text-indigo-600" /> Friends Invited
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{profile.stats.totalInvited}</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Qualified Referrals
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{profile.stats.qualifiedCount}</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" /> Pending First Project
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{profile.stats.pendingCount}</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Total Credits Earned
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">${profile.stats.totalEarnedCredits}</p>
        </div>
      </div>

      {/* Enter Code Box & Referral History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Claim referral code */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Have an Invitation Code?
          </h3>
          <p className="text-xs text-slate-500">
            If a friend or colleague invited you to WorkNova, enter their 8-character referral code to claim $10 platform credit.
          </p>

          <form onSubmit={handleApplyCode} className="space-y-3">
            <input
              type="text"
              placeholder="e.g. ALEX4821"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 text-sm font-mono uppercase tracking-wider rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={claiming}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all"
            >
              {claiming ? 'Applying...' : 'Claim $10 Bonus Credit'}
            </button>
          </form>
        </div>

        {/* Right: Credit Transactions Log */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Reward Credits Activity</span>
            <span className="text-xs text-slate-500 font-normal">
              {profile.rewards.length} transactions
            </span>
          </h3>

          {profile.rewards.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50">
              No reward transactions yet. Invite friends or apply a code to get started.
            </div>
          ) : (
            <div className="space-y-2.5">
              {profile.rewards.map((rew) => (
                <div
                  key={rew.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{rew.description}</p>
                    <p className="text-[11px] text-slate-400">{new Date(rew.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    +${rew.amount} USD
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
