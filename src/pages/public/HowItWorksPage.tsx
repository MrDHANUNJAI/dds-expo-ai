import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  CheckCircle,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Tabs } from '../../components/common/Tabs';
import { Button } from '../../components/common/Button';

export const HowItWorksPage: React.FC = () => {
  const [roleTab, setRoleTab] = useState<'sellers' | 'freelancers'>('sellers');

  const sellerSteps = [
    {
      step: '01',
      title: 'Post your project requirements',
      desc: 'Define your technical objectives, deliverables, timeline, and budget. Our structured intake ensures freelancers receive clear, actionable context.',
      icon: FileText,
    },
    {
      step: '02',
      title: 'Receive tailored proposals',
      desc: 'Vetted independent professionals submit detailed proposals with milestone breakdowns, portfolio examples, and realistic turnaround estimates.',
      icon: Users,
    },
    {
      step: '03',
      title: 'Compare talent and interview',
      desc: 'Review verified client ratings, completed jobs, and code samples. Message candidates directly to evaluate alignment before hiring.',
      icon: Award,
    },
    {
      step: '04',
      title: 'Fund milestones with Escrow security',
      desc: 'Deposit milestone funds into secure escrow. Money is only transferred to the freelancer after you review and approve each delivery.',
      icon: CreditCard,
    },
    {
      step: '05',
      title: 'Approve work and build long-term relationships',
      desc: 'Sign off on completed deliverables, release milestone funds, and leave transparent feedback. Rehire top performers with one click.',
      icon: CheckCircle,
    },
  ];

  const freelancerSteps = [
    {
      step: '01',
      title: 'Create an authoritative profile',
      desc: 'Showcase your core skills, experience level, past case studies, and certifications. Set your desired hourly rate or fixed contract minimums.',
      icon: Briefcase,
    },
    {
      step: '02',
      title: 'Browse verified high-budget projects',
      desc: 'Explore open projects filtered by technology, budget, and scope. Apply only to opportunities that genuinely match your expertise.',
      icon: FileText,
    },
    {
      step: '03',
      title: 'Submit competitive, tailored proposals',
      desc: 'Articulate your approach, outline proposed milestones, and stand out with relevant portfolio items rather than generic cover letters.',
      icon: Users,
    },
    {
      step: '04',
      title: 'Get hired with guaranteed escrow protection',
      desc: 'Never work without financial security. Every contract is backed by escrow funding before you commit a single line of code or design file.',
      icon: CreditCard,
    },
    {
      step: '05',
      title: 'Deliver excellence and grow your business',
      desc: 'Deliver milestones on schedule, receive automated payment releases, build your 5-star reputation, and win recurring client partnerships.',
      icon: CheckCircle,
    },
  ];

  const currentSteps = roleTab === 'sellers' ? sellerSteps : freelancerSteps;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumbs items={[{ label: 'How It Works' }]} />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          How WorkNova Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Transparent, escrow-protected collaboration built for modern engineering and creative teams.
        </p>

        <div className="pt-4 flex justify-center">
          <Tabs
            tabs={[
              { id: 'sellers', label: 'For Clients & Organizations' },
              { id: 'freelancers', label: 'For Independent Freelancers' },
            ]}
            activeTab={roleTab}
            onChange={(t) => setRoleTab(t as 'sellers' | 'freelancers')}
          />
        </div>
      </div>

      {/* Visual Timeline Cards */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {currentSteps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-lg tabular-nums">
                {s.step}
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Escrow Guarantee Callout */}
      <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">WorkNova Escrow Guarantee</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Every contract is backed by dispute mediation, milestone holds, and encrypted invoicing to ensure fair outcomes for all parties.
            </p>
          </div>
        </div>
        <Link to={roleTab === 'sellers' ? '/seller/register' : '/freelancer/register'}>
          <Button variant="primary" size="md" className="shrink-0" rightIcon={<ArrowRight className="w-4 h-4" />}>
            {roleTab === 'sellers' ? 'Post a Project Now' : 'Join as a Freelancer'}
          </Button>
        </Link>
      </div>
    </div>
  );
};
