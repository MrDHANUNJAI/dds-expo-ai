import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import { freelancers } from '../../data/freelancers';
import { categories } from '../../data/categories';
import { FreelancerCard } from '../../components/marketplace/FreelancerCard';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Freelancer } from '../../types';

export const FindFreelancersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || '');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [minRating, setMinRating] = useState('all');
  const [maxHourlyRate, setMaxHourlyRate] = useState<string>('200');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<Freelancer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredFreelancers = useMemo(() => {
    return freelancers.filter((fl) => {
      // Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = fl.name.toLowerCase().includes(q);
        const matchesTitle = fl.title.toLowerCase().includes(q);
        const matchesSkills = fl.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesTitle && !matchesSkills) return false;
      }

      // Category
      if (selectedCategory && fl.category !== selectedCategory) {
        return false;
      }

      // Availability
      if (selectedAvailability !== 'all' && fl.availability !== selectedAvailability) {
        return false;
      }

      // Rating
      if (minRating !== 'all' && fl.rating < parseFloat(minRating)) {
        return false;
      }

      // Hourly Rate
      if (maxHourlyRate && fl.hourlyRate > parseInt(maxHourlyRate, 10)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedAvailability, minRating, maxHourlyRate]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedAvailability('all');
    setMinRating('all');
    setMaxHourlyRate('200');
  };

  const triggerRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumbs items={[{ label: 'Find Freelancers' }]} />

      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find skilled freelancers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Hire vetted independent professionals with specialized technical expertise and verified delivery track records.
        </p>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-800"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filter Freelancers</span>
          </button>
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            {filteredFreelancers.length} talent found
          </span>
        </div>

        {/* Sidebar Filters */}
        <aside
          className={`lg:block ${
            mobileFiltersOpen
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto'
              : 'hidden bg-white p-5 rounded-xl border border-slate-200 space-y-6'
          }`}
        >
          {mobileFiltersOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h2 className="text-base font-bold text-slate-900">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Filter Talent
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Discipline</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                triggerRefresh();
              }}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="">All Disciplines</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Availability</label>
            <div className="space-y-1.5 text-xs text-slate-700">
              {[
                { id: 'all', label: 'Any Availability' },
                { id: 'Available Now', label: 'Available Now (Full-time)' },
                { id: 'Part-time', label: 'Part-time' },
              ].map((av) => (
                <label key={av.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={selectedAvailability === av.id}
                    onChange={() => {
                      setSelectedAvailability(av.id);
                      triggerRefresh();
                    }}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{av.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Hourly Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Max Hourly Rate</span>
              <span className="tabular-nums text-indigo-600">${maxHourlyRate}/hr</span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              step="10"
              value={maxHourlyRate}
              onChange={(e) => {
                setMaxHourlyRate(e.target.value);
                triggerRefresh();
              }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Min Rating */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                triggerRefresh();
              }}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none"
            >
              <option value="all">Any Rating</option>
              <option value="4.8">4.8 Stars and up</option>
              <option value="4.9">4.9 Stars and up</option>
            </select>
          </div>

          {mobileFiltersOpen && (
            <div className="pt-4">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Apply Filters ({filteredFreelancers.length})
              </Button>
            </div>
          )}
        </aside>

        {/* Results */}
        <section className="lg:col-span-3 space-y-4">
          {/* Search Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by skill, role or service (e.g. React, UI/UX, Cloud)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800 tabular-nums">{filteredFreelancers.length}</strong> top professionals
            </span>
          </div>

          {/* Grid / Skeletons / Empty */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filteredFreelancers.length === 0 ? (
            <EmptyState
              icon={<Search className="w-6 h-6" />}
              title="No freelancers found"
              description="Try broadening your criteria or reset the search query."
              actionLabel="Reset All Filters"
              onAction={resetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredFreelancers.map((fl) => (
                <FreelancerCard
                  key={fl.id}
                  freelancer={fl}
                  onMessage={(f) => setMessageTarget(f)}
                />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={1}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </section>
      </div>

      {/* Message Modal Placeholder */}
      <Modal
        isOpen={Boolean(messageTarget)}
        onClose={() => setMessageTarget(null)}
        title={messageTarget ? `Contact ${messageTarget.name}` : 'Direct Contact'}
        description="Phase 1 UI Notice"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Direct real-time messaging with talent will be active in <strong>Phase 2</strong>.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            <strong>{messageTarget?.name}</strong> · {messageTarget?.title} (${messageTarget?.hourlyRate}/hr)
          </div>
          <Button variant="primary" size="sm" className="w-full" onClick={() => setMessageTarget(null)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};
