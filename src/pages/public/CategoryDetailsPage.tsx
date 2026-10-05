import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { categories } from '../../data/categories';
import { freelancers } from '../../data/freelancers';
import { projects } from '../../data/projects';
import { FreelancerCard } from '../../components/marketplace/FreelancerCard';
import { ProjectCard } from '../../components/marketplace/ProjectCard';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Button } from '../../components/common/Button';

export const CategoryDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');
  const [searchWord, setSearchWord] = useState('');

  const category = categories.find((c) => c.slug === slug) || categories[0];

  const categoryFreelancers = freelancers.filter(
    (f) => f.category === category.slug || category.slug === 'web-development'
  );

  const categoryProjects = projects.filter(
    (p) => p.category === category.slug || category.slug === 'web-development'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs
        items={[
          { label: 'Categories', href: '/categories' },
          { label: category.name },
        ]}
      />

      {/* Hero Banner for Category */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 space-y-4">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Marketplace Category
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find {category.name} professionals
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {category.description} Connect with top-tier verified talent specializing in {category.name.toLowerCase()} and modern industry workflows.
          </p>
        </div>

        {/* Subcategories Horizontal Scroll */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Popular Subcategories
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSubcategory('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeSubcategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All {category.name}
            </button>
            {category.subcategories.map((sub, idx) => {
              const subName = typeof sub === 'string' ? sub : sub.name;
              const subKey = typeof sub === 'string' ? sub : sub.id || `${sub.name}-${idx}`;
              return (
                <button
                  key={subKey}
                  onClick={() => setActiveSubcategory(subName)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activeSubcategory === subName
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {subName}
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {/* Featured Freelancers in this Category */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Featured {category.name} Specialists
            </h2>
            <p className="text-xs text-slate-500">
              Vetted professionals with verified ratings in this discipline
            </p>
          </div>
          <Link to={`/find-freelancers?cat=${category.slug}`}>
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              See All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoryFreelancers.slice(0, 3).map((fl) => (
            <FreelancerCard key={fl.id} freelancer={fl} />
          ))}
        </div>
      </section>

      {/* Latest Projects in this Category */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Latest {category.name} Projects
            </h2>
            <p className="text-xs text-slate-500">
              Open contracts seeking experienced talent
            </p>
          </div>
          <Link to={`/find-work?cat=${category.slug}`}>
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Projects
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categoryProjects.slice(0, 4).map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>
      </section>
    </div>
  );
};
