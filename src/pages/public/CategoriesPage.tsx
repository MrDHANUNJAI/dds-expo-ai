import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { categories } from '../../data/categories';
import { CategoryCard } from '../../components/marketplace/CategoryCard';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const CategoriesPage: React.FC = () => {
  const [query, setQuery] = useState('');

  const filtered = categories.filter((c) => {
    const q = query.toLowerCase();
    const matchesName = c.name.toLowerCase().includes(q);
    const matchesDesc = c.description.toLowerCase().includes(q);
    const matchesSub = c.subcategories.some((sub) => {
      const subName = typeof sub === 'string' ? sub : sub.name;
      return subName.toLowerCase().includes(q);
    });
    return matchesName || matchesDesc || matchesSub;
  });

  const totalProjects = categories.reduce((acc, c) => acc + (c.projectCount || 0), 0);
  const totalTalent = categories.reduce((acc, c) => acc + (c.freelancerCount || 0), 0);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Categories' }]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Marketplace Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse {totalProjects.toLocaleString()} active projects and {totalTalent.toLocaleString()} vetted specialists across {categories.length} digital disciplines.
          </p>
        </div>

        {/* Filter input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
};
