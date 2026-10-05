import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MapPin, Briefcase, MessageSquare, ArrowUpRight } from 'lucide-react';
import { Freelancer } from '../../types';
import { Avatar } from '../common/Avatar';
import { Rating } from '../common/Rating';
import { Button } from '../common/Button';

export interface FreelancerCardProps {
  freelancer: Freelancer;
  onMessage?: (freelancer: Freelancer) => void;
  className?: string;
}

export const FreelancerCard: React.FC<FreelancerCardProps> = ({
  freelancer,
  onMessage,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all duration-150 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-start gap-3">
            <Link to={`/freelancer/${freelancer.id}`} className="shrink-0 group">
              <Avatar name={freelancer.name} size="lg" isOnline={freelancer.availability === 'Available Now'} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={`/freelancer/${freelancer.id}`}
                  className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate"
                >
                  {freelancer.name}
                </Link>
                {freelancer.isVerified && (
                  <span title="Verified Professional" className="inline-flex text-indigo-600">
                    <CheckCircle2 className="w-4 h-4 fill-indigo-100" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                {freelancer.title}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{freelancer.location}</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-base font-bold text-slate-900 tabular-nums">
              ${freelancer.hourlyRate}
              <span className="text-xs font-normal text-slate-500">/hr</span>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {freelancer.availability}
            </span>
          </div>
        </div>

        {/* Rating and Experience Metrics */}
        <div className="flex items-center gap-3 py-2.5 border-y border-slate-100 text-xs text-slate-600">
          <Rating rating={freelancer.rating} reviewCount={freelancer.reviewCount} />
          <span className="text-slate-300" aria-hidden="true">·</span>
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900 tabular-nums">{freelancer.completedProjects}</span>
            <span className="text-slate-500">projects</span>
          </div>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <div className="text-slate-600">
            <span className="font-semibold text-slate-900 tabular-nums">{freelancer.successRate}%</span> success
          </div>
        </div>

        {/* Bio preview */}
        <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
          {freelancer.bio}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {freelancer.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
          {freelancer.skills.length > 4 && (
            <span className="text-[11px] font-medium text-slate-400 px-1 py-0.5">
              +{freelancer.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
        <Link to={`/freelancer/${freelancer.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
            View Profile
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMessage && onMessage(freelancer)}
          aria-label={`Message ${freelancer.name}`}
          className="px-2.5 text-slate-600 hover:text-slate-900"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
