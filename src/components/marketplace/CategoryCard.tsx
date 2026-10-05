import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Category } from '../../types';

export interface CategoryCardProps {
  category: Category;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, className = '' }) => {
  // Dynamically resolve icon from lucide-react with fallback
  const iconKey = category.iconName || category.icon || 'Folder';
  const IconComponent =
    ((Icons as unknown) as Record<string, React.ElementType>)[iconKey] || Icons.Folder;


  return (
    <Link
      to={`/categories/${category.slug}`}
      className={`group bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-xs transition-all duration-150 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-150">
          <IconComponent className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
          {category.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {category.description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-700 tabular-nums">
          {category.projectCount.toLocaleString()}
          <span className="font-normal text-slate-500 ml-1">projects</span>
        </span>
        <span className="text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform text-xs">
          Explore →
        </span>
      </div>
    </Link>
  );
};
