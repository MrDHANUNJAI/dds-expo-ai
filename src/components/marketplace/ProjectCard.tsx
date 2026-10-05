import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types';
import { Button } from '../common/Button';

export interface ProjectCardProps {
  project: Project;
  isSaved?: boolean;
  onSaveToggle?: (projectId: string, isSaved: boolean) => void;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSaved: controlledSaved = false,
  onSaveToggle,
  className = '',
}) => {
  const [isSaved, setIsSaved] = useState(controlledSaved);

  // Sync if prop updates
  React.useEffect(() => {
    setIsSaved(controlledSaved);
  }, [controlledSaved]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (onSaveToggle) onSaveToggle(project.id, nextSaved);
  };


  const formattedBudget =
    project.budgetType === 'fixed'
      ? `$${project.budgetMin.toLocaleString()} – $${project.budgetMax.toLocaleString()}`
      : `$${project.budgetMin} – $${project.budgetMax}/hr`;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-xs transition-all duration-150 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header Metadata (Unboxed text with separators per anti-slop rules) */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-slate-700">{project.subcategory || project.category}</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Posted {project.postedTime}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleBookmark}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isSaved
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save project'}
            aria-label={isSaved ? 'Saved project' : 'Save project'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <Link
          to={`/projects/${project.id}`}
          className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 block leading-snug mb-2"
        >
          {project.title}
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Key Metrics Row */}
        <div className="flex items-center gap-4 py-2 border-y border-slate-100 text-xs mb-3.5 flex-wrap">
          <div>
            <span className="text-slate-400 text-[11px] block">Budget</span>
            <span className="font-semibold text-slate-900 tabular-nums">{formattedBudget}</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 text-[11px] block">Experience</span>
            <span className="font-medium text-slate-800">{project.experienceLevel}</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 text-[11px] block">Timeline</span>
            <span className="font-medium text-slate-800">{project.deadline}</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-1 text-slate-600 mt-auto">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-900 tabular-nums">{project.proposalCount}</span>
            <span className="text-slate-500">proposals</span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
          {project.skills.length > 4 && (
            <span className="text-[11px] font-medium text-slate-400 px-1 py-0.5">
              +{project.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
          <span className="truncate font-medium text-slate-900">{project.sellerCompany || project.sellerName}</span>
          {project.isVerifiedClient && (
            <span title="Verified Client" className="text-indigo-600 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 fill-indigo-100" />
            </span>
          )}
        </div>

        <Link to={`/projects/${project.id}`}>
          <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
            View Project
          </Button>
        </Link>
      </div>
    </div>
  );
};
