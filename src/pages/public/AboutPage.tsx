import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, HeartHandshake, Zap, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Button } from '../../components/common/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      <Breadcrumbs items={[{ label: 'About' }]} />

      {/* Hero statement */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Our Purpose
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Building the most trusted freelance marketplace for modern technology teams.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          WorkNova was established to solve remote hiring friction: erratic quality, predatory platform fee structures, and fragmented communication. We connect high-caliber independent talent directly with organizations that respect their craft.
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Vetted Craftsmanship</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We prioritize depth over volume. Every freelancer profile undergoes technical auditing, identity verification, and portfolio validation.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Escrow Security</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Both parties work with complete peace of mind. Clients only release funds for verified deliverables; freelancers never work without deposit security.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Radical Efficiency</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Fast, ergonomic UI designed for serious engineers and product leads. No spam proposals, no hidden algorithmic downgrades.
          </p>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold tabular-nums">10,000+</div>
            <div className="text-sm font-semibold text-slate-200">Verified Freelancers</div>
            <div className="text-xs text-slate-400">Over 40 countries</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold tabular-nums">5,000+</div>
            <div className="text-sm font-semibold text-slate-200">Finished Projects</div>
            <div className="text-xs text-slate-400">95% on-time milestone delivery</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold tabular-nums">$3.4M+</div>
            <div className="text-sm font-semibold text-slate-200">Freelancer Payouts</div>
            <div className="text-xs text-slate-400">Processed through escrow</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold tabular-nums">99.2%</div>
            <div className="text-sm font-semibold text-slate-200">Satisfaction Rate</div>
            <div className="text-xs text-slate-400">Verified client feedback</div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center max-w-xl mx-auto space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-slate-900">Ready to join WorkNova?</h2>
        <p className="text-sm text-slate-600">
          Whether you want to build high-impact software or hire top-tier talent, your journey begins here.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/seller/register">
            <Button variant="primary" size="md">
              Post a Project
            </Button>
          </Link>
          <Link to="/freelancer/register">
            <Button variant="outline" size="md">
              Join as Freelancer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
