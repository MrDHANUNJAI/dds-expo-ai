import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, CheckCircle2, Briefcase, DollarSign, Building } from 'lucide-react';
import { sellers } from '../../data/sellers';
import { projects } from '../../data/projects';
import { reviews } from '../../data/reviews';
import { Avatar } from '../../components/common/Avatar';
import { Rating } from '../../components/common/Rating';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { ProjectCard } from '../../components/marketplace/ProjectCard';

export const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const seller = sellers.find((s) => s.id === id) || sellers[0];

  const sellerProjects = projects.filter((p) => p.sellerId === seller.id);
  const sellerReviews = reviews.filter((r) => r.role === 'freelancer');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Clients & Sellers' },
          { label: seller.company || seller.name },
        ]}
      />

      {/* Top Seller Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar name={seller.company || seller.name} size="xl" />
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {seller.company}
                </h1>
                {seller.isVerified && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Payment</span>
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 font-medium">
                {seller.name} · {seller.title}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-1">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{seller.industry}</span>
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{seller.location}</span>
                </span>
                <span className="text-slate-300">·</span>
                <span>Member since {seller.memberSince}</span>
              </div>

              <div className="pt-2">
                <Rating rating={seller.rating} reviewCount={seller.reviewCount} size="md" />
              </div>
            </div>
          </div>

          {/* Stats Cluster */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center shrink-0">
            <div>
              <span className="text-slate-400 text-xs block">Posted</span>
              <span className="font-bold text-slate-900 text-base tabular-nums">
                {seller.projectsPosted}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Completed</span>
              <span className="font-bold text-slate-900 text-base tabular-nums">
                {seller.projectsCompleted}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Total Spent</span>
              <span className="font-bold text-slate-900 text-base tabular-nums">
                ${seller.totalSpent.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left (Projects) + Right (About & Reviews) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active & Recent Projects */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Open Projects by {seller.company} ({sellerProjects.length})
            </h2>

            {sellerProjects.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                No open projects currently available from this client.
              </div>
            ) : (
              <div className="space-y-4">
                {sellerProjects.map((proj) => (
                  <ProjectCard key={proj.id} project={proj} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: About and Freelancer Testimonials */}
        <div className="lg:col-span-4 space-y-6">
          {/* About */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              About the Organization
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {seller.bio}
            </p>
          </div>

          {/* Reviews by Freelancers */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Feedback from Freelancers
            </h3>

            <div className="divide-y divide-slate-100">
              {sellerReviews.map((rev) => (
                <div key={rev.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">{rev.authorName}</span>
                    <Rating rating={rev.rating} showText={false} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                  <p className="text-[11px] text-slate-400">{rev.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
