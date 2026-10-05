import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Lock,
  MessageSquare,
  FileCheck2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { categories } from '../../data/categories';
import { freelancers } from '../../data/freelancers';
import { projects } from '../../data/projects';
import { SearchBar } from '../../components/marketplace/SearchBar';
import { CategoryCard } from '../../components/marketplace/CategoryCard';
import { FreelancerCard } from '../../components/marketplace/FreelancerCard';
import { ProjectCard } from '../../components/marketplace/ProjectCard';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { Freelancer } from '../../types';

export const HomePage: React.FC = () => {
  const [howItWorksRole, setHowItWorksRole] = useState<'sellers' | 'freelancers'>('sellers');
  const [selectedFreelancerForMsg, setSelectedFreelancerForMsg] = useState<Freelancer | null>(null);

  const featuredFreelancers = freelancers.slice(0, 4);
  const featuredProjects = projects.slice(0, 4);

  const stats = [
    { value: '10K+', label: 'Vetted Freelancers', detail: 'Across 45+ technical domains' },
    { value: '5K+', label: 'Delivered Projects', detail: 'Completed with 5-star ratings' },
    { value: '95%', label: 'Success Rate', detail: 'On-time milestone delivery' },
    { value: '50+', label: 'Specialized Categories', detail: 'From AI to Cloud infrastructure' },
  ];

  const sellerSteps = [
    { step: '01', title: 'Post a Project', desc: 'Describe your requirements, deliverables, budget range, and timeline.' },
    { step: '02', title: 'Receive Proposals', desc: 'Get competitive proposals from verified independent specialists within hours.' },
    { step: '03', title: 'Compare Freelancers', desc: 'Review portfolios, verified past client reviews, and detailed technical scores.' },
    { step: '04', title: 'Hire with Escrow', desc: 'Fund milestones securely. Funds are only released when you approve deliverables.' },
    { step: '05', title: 'Get Work Done', desc: 'Collaborate with structured progress tracking and finalize delivery.' },
  ];

  const freelancerSteps = [
    { step: '01', title: 'Create Profile', desc: 'Highlight your technical proficiencies, past case studies, and hourly rate.' },
    { step: '02', title: 'Find Projects', desc: 'Filter through curated high-budget projects matching your specific domain.' },
    { step: '03', title: 'Submit Proposal', desc: 'Send tailored proposals with your estimated timeline and milestone pricing.' },
    { step: '04', title: 'Get Hired', desc: 'Agree on milestones with guaranteed payment protection before starting work.' },
    { step: '05', title: 'Complete Work', desc: 'Deliver high-quality work, receive prompt payment, and earn 5-star reviews.' },
  ];

  const advantages = [
    {
      title: 'Verified Talent',
      desc: 'Discover skilled professionals with detailed profiles, code audits, and verified portfolios.',
      icon: ShieldCheck,
    },
    {
      title: 'Competitive Proposals',
      desc: 'Compare different freelancers transparently before making your hiring decision.',
      icon: TrendingUp,
    },
    {
      title: 'Secure Projects',
      desc: 'Manage your project through structured milestones and built-in escrow protection.',
      icon: Lock,
    },
    {
      title: 'Transparent Profiles',
      desc: 'View skills, experience, portfolio, ratings, and unedited completed client reviews.',
      icon: Award,
    },
    {
      title: 'Clear Communication',
      desc: 'Keep project requirements, files, and milestones organized in one workspace.',
      icon: MessageSquare,
    },
    {
      title: 'Project Management',
      desc: 'Track progress, review milestone drafts, and approve delivery with ease.',
      icon: FileCheck2,
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 pb-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
              Find the right talent.{' '}
              <span className="text-indigo-600">Get work done.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Connect with skilled freelancers, post projects, compare proposals, and get your work completed by professionals.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link to="/seller/register">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Post a Project
                </Button>
              </Link>
              <Link to="/find-work">
                <Button size="lg" variant="outline">
                  Find Work
                </Button>
              </Link>
            </div>

            {/* Large Marketplace Search Bar */}
            <div className="pt-6 max-w-2xl mx-auto">
              <SearchBar placeholder="What service or skill are you looking for?" />
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500 flex-wrap">
                <span className="font-semibold text-slate-400">Popular:</span>
                {['Web Development', 'Logo Design', 'Mobile App', 'UI/UX Design', 'Video Editing'].map((term) => (
                  <Link
                    key={term}
                    to={`/find-work?q=${encodeURIComponent(term)}`}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Trusted by businesses and independent professionals worldwide
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200">
          {stats.map((stat, i) => (
            <div key={i} className="text-center sm:text-left space-y-1">
              <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-slate-800">{stat.label}</div>
              <div className="text-xs text-slate-500">{stat.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Explore popular categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse top independent specialists across key digital disciplines.
            </p>
          </div>
          <Link to="/categories">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Categories
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 4. FEATURED FREELANCERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Top freelancers
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Vetted professionals with verified ratings and proven commercial delivery.
            </p>
          </div>
          <Link to="/find-freelancers">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Browse All Freelancers
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredFreelancers.map((fl) => (
            <FreelancerCard
              key={fl.id}
              freelancer={fl}
              onMessage={(f) => setSelectedFreelancerForMsg(f)}
            />
          ))}
        </div>
      </section>

      {/* 5. FEATURED PROJECTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Latest projects
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Recently posted opportunities seeking experienced independent talent.
            </p>
          </div>
          <Link to="/find-work">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Explore All Projects
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featuredProjects.map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>
      </section>

      {/* 6. HOW IT WORKS (Dual Sellers / Freelancers Flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              How it works
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              A structured, reliable marketplace workflow designed for transparency and trust.
            </p>
            <Tabs
              tabs={[
                { id: 'sellers', label: 'For Clients & Sellers' },
                { id: 'freelancers', label: 'For Freelancers' },
              ]}
              activeTab={howItWorksRole}
              onChange={(id) => setHowItWorksRole(id as 'sellers' | 'freelancers')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {(howItWorksRole === 'sellers' ? sellerSteps : freelancerSteps).map((step, idx) => (
              <div key={step.step} className="relative space-y-2">
                <div className="text-2xl font-black text-indigo-600/30 tabular-nums">
                  {step.step}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHY USE OUR PLATFORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Why choose WorkNova
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Engineered from first principles to eliminate friction in modern remote hiring.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. DUAL CTAs: FREELANCER CTA & SELLER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Freelancer CTA */}
          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Join the Network
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Turn your skills into opportunities.
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Build your profile, showcase your work, find projects and grow your freelance career with guaranteed milestone security.
              </p>
            </div>
            <div>
              <Link to="/freelancer/register">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Join as Freelancer
                </Button>
              </Link>
            </div>
          </div>

          {/* Seller CTA */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Start Hiring
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Have a project in mind?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Find skilled professionals and get your project moving today. Review custom proposals tailored to your scope.
              </p>
            </div>
            <div>
              <Link to="/seller/register">
                <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Post a Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder Modal for Messaging in Phase 1 */}
      <Modal
        isOpen={Boolean(selectedFreelancerForMsg)}
        onClose={() => setSelectedFreelancerForMsg(null)}
        title={selectedFreelancerForMsg ? `Message ${selectedFreelancerForMsg.name}` : 'Direct Message'}
        description="Phase 1 UI Prototype Notice"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Real-time chat and direct messaging will be connected in <strong>Phase 2</strong>.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
            Freelancer: <strong>{selectedFreelancerForMsg?.name}</strong> ({selectedFreelancerForMsg?.title}) · Rate: ${selectedFreelancerForMsg?.hourlyRate}/hr
          </div>
          <Button variant="primary" size="sm" className="w-full" onClick={() => setSelectedFreelancerForMsg(null)}>
            Understood
          </Button>
        </div>
      </Modal>
    </div>
  );
};
