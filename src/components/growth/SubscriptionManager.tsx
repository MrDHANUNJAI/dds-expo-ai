import React, { useState, useEffect } from 'react';
import {
  Check,
  Zap,
  Crown,
  Shield,
  Sparkles,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { growthApi, SubscriptionPlanItem, UserSubscriptionInfo } from '../../services/growthApi';
import { useAuth } from '../../context/AuthContext';

export const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [subInfo, setSubInfo] = useState<UserSubscriptionInfo | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanItem | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const [plansData, currentSub] = await Promise.all([
        growthApi.getPlans(),
        growthApi.getMySubscription(),
      ]);
      setPlans(plansData);
      setSubInfo(currentSub);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlanItem) => {
    if (subInfo?.plan.id === plan.id && subInfo.subscription?.status === 'ACTIVE') {
      return;
    }
    setSelectedPlan(plan);
    setShowCheckoutModal(true);
  };

  const confirmSubscription = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    setActionMsg(null);
    try {
      await growthApi.subscribe(selectedPlan.id, billingCycle);
      setActionMsg({
        type: 'success',
        text: `Successfully upgraded to the ${selectedPlan.name} plan!`,
      });
      setShowCheckoutModal(false);
      await fetchSubscriptionData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Subscription upgrade failed' });
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSub = async () => {
    if (!subInfo?.subscription?.id) return;
    if (!confirm('Are you sure you want to cancel automatic subscription renewal?')) return;
    setProcessing(true);
    try {
      await growthApi.cancelSubscription(subInfo.subscription.id);
      setActionMsg({
        type: 'success',
        text: 'Subscription renewal has been cancelled. Your benefits remain active until the end of the current billing cycle.',
      });
      await fetchSubscriptionData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to cancel subscription' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading subscription plans...</div>;
  }

  const currentPlanId = subInfo?.plan.id || 'plan-free';

  return (
    <div className="space-y-8">
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

      {/* Header & Active Plan Status Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            Current Tier: {subInfo?.plan.name || 'Free Starter'}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Plans & Monetization Quota
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Upgrade your account to unlock unlimited proposal submissions, lower platform fees, team collaborator seats, and AI workflow accelerators.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 shrink-0">
          <div>
            <span className="text-xs text-slate-500 block">Proposals Remaining</span>
            <span className="text-xl font-extrabold text-slate-900">
              {subInfo?.proposalsRemaining} <span className="text-xs font-normal text-slate-500">left this month</span>
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <div>
            <span className="text-xs text-slate-500 block">Platform Fee Tier</span>
            <span className="text-sm font-bold text-indigo-600">
              {subInfo?.plan.limits.platformFeeDiscountPercent ? `${10 - (10 * subInfo.plan.limits.platformFeeDiscountPercent / 100)}% Standard` : '10% Standard'}
            </span>
          </div>
        </div>
      </div>

      {/* Billing Cycle Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              billingCycle === 'MONTHLY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('YEARLY')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'YEARLY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annual Billing
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.filter(p => p.id !== 'plan-enterprise').map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const price = billingCycle === 'YEARLY' ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between relative ${
                plan.isPopular
                  ? 'bg-white border-indigo-500 shadow-xl ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[11px] tracking-wide uppercase shadow-md flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[36px]">{plan.description}</p>

                <div className="mt-5 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ${price}
                  </span>
                  <span className="text-xs text-slate-500 font-medium"> / month</span>
                  {billingCycle === 'YEARLY' && plan.priceYearly > 0 && (
                    <p className="text-[11px] text-slate-400 mt-0.5">Billed annually (${plan.priceYearly}/yr)</p>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Features included:</p>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 pt-0">
                {isCurrent ? (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-default flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Current Active Plan
                    </button>
                    {subInfo?.subscription && !subInfo.subscription.cancelAtPeriodEnd && (
                      <button
                        onClick={handleCancelSub}
                        className="w-full text-center text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        Cancel Renewal
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      plan.isPopular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {price === 0 ? 'Downgrade to Free' : 'Upgrade to ' + plan.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enterprise Banner Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Building className="w-3.5 h-3.5" />
            Enterprise Custom Tier
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Need a custom enterprise hiring setup?</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Consolidated monthly invoicing (Net-30/60), custom compliance agreements (MSA/NDAs), Single Sign-On (SAML/Okta), and a dedicated 1-hour SLA account manager.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" /> 0% Escrow Surcharge
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Background Checked Talent
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Dedicated Account Director
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            const entPlan = plans.find(p => p.id === 'plan-enterprise');
            if (entPlan) handleSubscribe(entPlan);
          }}
          className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl transition-all shrink-0"
        >
          Request Enterprise Plan ($299/mo)
        </button>
      </div>

      {/* Checkout Confirmation Modal */}
      {showCheckoutModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Confirm {selectedPlan.name} Subscription
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Review subscription terms before activating your membership.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 mb-4 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Plan Tier:</span>
                <span className="text-slate-900 font-bold">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Billing Cycle:</span>
                <span className="text-slate-900 capitalize">{billingCycle.toLowerCase()}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-slate-200">
                <span className="text-slate-900 font-bold">Total Due Today:</span>
                <span className="text-indigo-600 font-extrabold text-sm">
                  ${billingCycle === 'YEARLY' ? selectedPlan.priceYearly : selectedPlan.priceMonthly}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">
              By confirming, your wallet or default payment method will be charged. You can modify or cancel renewal anytime from your account settings.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={confirmSubscription}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs"
              >
                {processing ? 'Processing...' : 'Activate Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
