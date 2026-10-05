import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Globe,
  Award,
  GraduationCap,
  Briefcase,
  Share2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { freelancers } from '../../data/freelancers';
import { reviews } from '../../data/reviews';
import { Avatar } from '../../components/common/Avatar';
import { Rating } from '../../components/common/Rating';
import { Button } from '../../components/common/Button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';

export const FreelancerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeModal, setActiveModal] = useState<'hire' | 'message' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const freelancer = freelancers.find((f) => f.id === id) || freelancers[0];
  const freelancerReviews = reviews.filter((r) => r.role === 'client');

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Find Freelancers', href: '/find-freelancers' },
          { label: freelancer.name },
        ]}
      />

      {copiedLink && (
        <Alert
          type="success"
          message="Profile URL copied to clipboard!"
          onDismiss={() => setCopiedLink(false)}
        />
      )}

      {/* Top Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar
              name={freelancer.name}
              size="xl"
              isOnline={freelancer.availability === 'Available Now'}
              className="ring-4 ring-slate-100"
            />
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {freelancer.name}
                </h1>
                {freelancer.isVerified && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                )}
                {freelancer.isTopRated && (
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    Top Rated Plus
                  </span>
                )}
              </div>

              <p className="text-base text-slate-700 font-medium">{freelancer.title}</p>

              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{freelancer.location}</span>
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{freelancer.timezone}</span>
                </span>
                <span className="text-slate-300">·</span>
                <span>Member since {freelancer.memberSince}</span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Rating rating={freelancer.rating} reviewCount={freelancer.reviewCount} size="md" />
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-700">
                  <strong className="text-slate-900 tabular-nums">{freelancer.successRate}%</strong> Job Success
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Primary Action Buttons */}
          <div className="flex flex-col sm:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="sm:text-right">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                ${freelancer.hourlyRate}
              </span>
              <span className="text-xs text-slate-500 font-normal"> / hour</span>
              <div className="mt-0.5">
                <span className="text-xs text-emerald-700 font-medium">
                  ● {freelancer.availability}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                onClick={() => setActiveModal('hire')}
                className="flex-1 sm:flex-initial"
              >
                Hire Freelancer
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setActiveModal('message')}
                leftIcon={<MessageSquare className="w-4 h-4" />}
              >
                Message
              </Button>
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                title="Share profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Grid: Left (Content 8 cols) + Right (Sidebar 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* About */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              About
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {freelancer.bio}
            </p>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Skills & Proficiencies
            </h2>
            <div className="flex flex-wrap gap-2">
              {freelancer.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio Showcase */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Portfolio Showcase ({freelancer.portfolio.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {freelancer.portfolio.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="h-32 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-4 text-white flex flex-col justify-end relative">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.skills.map((s) => (
                        <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Work & Client Reviews */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Client Feedback & Reviews
            </h2>

            <div className="divide-y divide-slate-100">
              {freelancerReviews.map((rev) => (
                <div key={rev.id} className="py-4 space-y-2 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.projectTitle}</h4>
                      <p className="text-[11px] text-slate-400">
                        {rev.authorName} · {rev.authorCompany} · {rev.date}
                      </p>
                    </div>
                    <Rating rating={rev.rating} showText={false} />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Details & Verification */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Metrics */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Performance Stats
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Completed Projects</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {freelancer.completedProjects}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Job Success Score</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {freelancer.successRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Reviews</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {freelancer.reviewCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Hourly Rate</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  ${freelancer.hourlyRate}/hr
                </span>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Languages</span>
            </h3>
            <ul className="space-y-2 text-xs">
              {freelancer.languages.map((lang, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <span className="font-medium text-slate-800">{lang.language}</span>
                  <span className="text-slate-500">{lang.proficiency}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Education</span>
            </h3>
            <div className="space-y-3 text-xs">
              {freelancer.education.map((edu, idx) => (
                <div key={idx}>
                  <p className="font-semibold text-slate-900">{edu.degree}</p>
                  <p className="text-slate-500">{edu.institution}, {edu.year}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Certifications</span>
            </h3>
            <div className="space-y-3 text-xs">
              {freelancer.certifications.map((cert, idx) => (
                <div key={idx}>
                  <p className="font-semibold text-slate-900">{cert.title}</p>
                  <p className="text-slate-500">{cert.issuer} · {cert.year}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        title={activeModal === 'hire' ? `Hire ${freelancer.name}` : `Message ${freelancer.name}`}
        description="Phase 1 UI Notice"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Direct hiring contracts, escrow deposits, and messaging will be connected in{' '}
            <strong>Phase 2</strong>.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            Selected Talent: <strong>{freelancer.name}</strong> · Rate: ${freelancer.hourlyRate}/hr
          </div>
          <Button variant="primary" size="sm" className="w-full" onClick={() => setActiveModal(null)}>
            Understood
          </Button>
        </div>
      </Modal>
    </div>
  );
};
