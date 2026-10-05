import React, { useState, useEffect } from 'react';
import {
  Crown,
  ShieldCheck,
  Zap,
  Clock,
  Star,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { growthApi, ReputationBreakdownData } from '../../services/growthApi';
import { useAuth } from '../../context/AuthContext';

interface ReputationBadgeShowcaseProps {
  userId?: string;
}

export const ReputationBadgeShowcase: React.FC<ReputationBadgeShowcaseProps> = ({ userId }) => {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  const [rep, setRep] = useState<ReputationBreakdownData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (targetId) {
      growthApi
        .getUserReputation(targetId)
        .then((data) => setRep(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [targetId]);

  if (loading) {
    return <div className="py-8 text-center text-slate-400 text-xs">Calculating reputation metrics...</div>;
  }

  if (!rep) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Top Header & Score Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" /> Professional Reputation Index
          </div>
          <h3 className="text-xl font-bold text-slate-900">Reputation & Trust Score</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculated across verified contracts, milestone completion speed, client feedback, and dispute history.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 text-white p-4 rounded-2xl shadow-md shrink-0">
          <div className="w-14 h-14 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-white leading-none">{rep.score}</span>
            <span className="text-[9px] uppercase tracking-wider text-indigo-300 font-bold">/ 100</span>
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Overall Status</div>
            <div className="text-sm font-bold text-white">
              {rep.score >= 90 ? 'Exceptional Talent' : rep.score >= 75 ? 'Top Performer' : 'Verified Pro'}
            </div>
            <div className="text-[11px] text-slate-400">Escrow Protected</div>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Average Rating
          </div>
          <p className="text-xl font-extrabold text-slate-900">{rep.averageRating} ★</p>
          <span className="text-[10px] text-slate-400 font-medium">5.0 platform maximum</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" /> On-Time Delivery
          </div>
          <p className="text-xl font-extrabold text-slate-900">{rep.onTimeDeliveryRate}%</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Prompt milestones</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Repeat Client Rate
          </div>
          <p className="text-xl font-extrabold text-slate-900">{rep.repeatClientRate}%</p>
          <span className="text-[10px] text-slate-400 font-medium">High satisfaction</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Completed Jobs
          </div>
          <p className="text-xl font-extrabold text-slate-900">{rep.totalCompletedProjects}</p>
          <span className="text-[10px] text-indigo-600 font-semibold">100% verified</span>
        </div>
      </div>

      {/* Verified Badges Showcase */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Accredited Badges ({rep.badges.length})
        </h4>

        {rep.badges.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 text-center">
            Complete contracts and verify identity to unlock Top Rated and Rising Talent badges.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rep.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  {badge.badgeType === 'TOP_RATED' ? (
                    <Crown className="w-5 h-5 text-amber-300" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">{badge.name}</h5>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Endorsements */}
      {Object.keys(rep.skillReputation).length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Skill Competency Ratings
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(rep.skillReputation).map(([skill, tier]) => (
              <div
                key={skill}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
              >
                <span>{skill}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 uppercase">
                  {tier}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
