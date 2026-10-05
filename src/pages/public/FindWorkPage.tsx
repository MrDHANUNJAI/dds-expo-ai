import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, Search, RotateCcw, BookmarkCheck } from 'lucide-react';
import { projects as fallbackProjects } from '../../data/projects';
import { categories as fallbackCategories } from '../../data/categories';
import { ProjectCard } from '../../components/marketplace/ProjectCard';
import { Button } from '../../components/common/Button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { CardSkeleton } from '../../components/common/Skeleton';
import { marketplaceApi } from '../../services/marketplaceApi';
import { useAuth } from '../../context/AuthContext';
import { Project, Category } from '../../types';

export const FindWorkPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCat = searchParams.get('cat') || '';

  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>(fallbackCategories);
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedBudgetType, setSelectedBudgetType] = useState<string>('all');
  const [onlyRemote, setOnlyRemote] = useState<boolean>(false);
  const [minBudget, setMinBudget] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories and projects
  const fetchMarketplaceData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch categories
      try {
        const cats = await marketplaceApi.getCategories();
        if (cats && cats.length > 0) setCategoriesList(cats);
      } catch (err) {
        console.warn('Using fallback categories');
      }

      // 2. Fetch projects
      try {
        const { projects } = await marketplaceApi.getProjects({
          category: selectedCategory || undefined,
          budgetType: selectedBudgetType !== 'all' ? selectedBudgetType : undefined,
          experienceLevel: selectedExperience !== 'all' ? selectedExperience : undefined,
          search: searchQuery || undefined,
          status: 'PUBLISHED',
        });
        if (projects && projects.length > 0) {
          setProjectsList(projects);
        } else {
          setProjectsList([]);
        }
      } catch (err) {
        console.warn('Falling back to static projects dataset', err);
        setProjectsList(fallbackProjects);
      }

      // 3. Fetch saved projects if logged in as freelancer
      if (user && user.role === 'FREELANCER') {
        try {
          const { savedProjectIds: ids } = await marketplaceApi.getSavedProjects();
          setSavedProjectIds(ids || []);
        } catch {
          // ignore
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceData();
  }, [selectedCategory, selectedBudgetType, selectedExperience, searchQuery]);

  // Extract skills for filter pill selection
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    projectsList.forEach((p) => p.skills?.forEach((s) => set.add(s)));
    if (set.size === 0) {
      fallbackProjects.forEach((p) => p.skills?.forEach((s) => set.add(s)));
    }
    return Array.from(set);
  }, [projectsList]);

  // Client-side additional filtering and sorting
  const processedProjects = useMemo(() => {
    let result = [...projectsList];

    if (onlyRemote) {
      result = result.filter((p) => p.isRemote !== false);
    }

    if (minBudget) {
      const min = parseInt(minBudget, 10);
      if (!isNaN(min)) {
        result = result.filter((p) => p.budgetMin >= min || p.budgetMax >= min);
      }
    }

    if (selectedSkill !== 'all') {
      result = result.filter((p) => p.skills?.includes(selectedSkill));
    }

    // Sort
    if (sortBy === 'budget-high') {
      result.sort((a, b) => b.budgetMax - a.budgetMax);
    } else if (sortBy === 'budget-low') {
      result.sort((a, b) => a.budgetMin - b.budgetMin);
    } else if (sortBy === 'proposals') {
      result.sort((a, b) => (b.proposalCount || 0) - (a.proposalCount || 0));
    }

    return result;
  }, [projectsList, onlyRemote, minBudget, selectedSkill, sortBy]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(processedProjects.length / itemsPerPage) || 1;
  const paginatedProjects = processedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedExperience('all');
    setSelectedBudgetType('all');
    setOnlyRemote(false);
    setMinBudget('');
    setSelectedSkill('all');
    setSearchParams({});
    setCurrentPage(1);
  };

  const handleSaveToggle = async (projectId: string, isSavedNow: boolean) => {
    if (user && user.role === 'FREELANCER') {
      try {
        await marketplaceApi.toggleSaveProject(projectId);
      } catch (err) {
        console.error('Save toggle failed:', err);
      }
    }
    setSavedProjectIds((prev) =>
      isSavedNow ? [...prev, projectId] : prev.filter((id) => id !== projectId)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: 'Find Work' }]} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find your next project
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified opportunities from leading businesses, startups, and clients.
          </p>
        </div>

        {savedProjectIds.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 shrink-0 self-start md:self-auto">
            <BookmarkCheck className="w-4 h-4" />
            <span>{savedProjectIds.length} Saved Projects</span>
          </div>
        )}
      </div>

      {/* Main Grid: Filters Sidebar + Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-800"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filter Results</span>
          </button>
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            {processedProjects.length} results
          </span>
        </div>

        {/* Sidebar Filters (Desktop & Mobile Drawer) */}
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
              Filter Projects
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="">All Categories</option>
              {categoriesList.map((c) => (
                <option key={c.id} value={c.slug || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Experience Level</label>
            <div className="space-y-1.5 text-xs text-slate-700">
              {['all', 'Entry', 'Intermediate', 'Expert'].map((exp) => (
                <label key={exp} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="experience"
                    checked={selectedExperience === exp}
                    onChange={() => {
                      setSelectedExperience(exp);
                      setCurrentPage(1);
                    }}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{exp === 'all' ? 'All Experience Levels' : exp}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Project Type / Budget Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Budget Type</label>
            <div className="space-y-1.5 text-xs text-slate-700">
              {[
                { id: 'all', label: 'Any Budget Type' },
                { id: 'fixed', label: 'Fixed Price' },
                { id: 'hourly', label: 'Hourly Rate' },
              ].map((b) => (
                <label key={b.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="budgetType"
                    checked={selectedBudgetType === b.id}
                    onChange={() => {
                      setSelectedBudgetType(b.id);
                      setCurrentPage(1);
                    }}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{b.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location Preferences */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">Location</label>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyRemote}
                onChange={(e) => setOnlyRemote(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Remote Only</span>
            </label>
          </div>

          {/* Min Budget */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">Minimum Budget ($)</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={minBudget}
              onChange={(e) => {
                setMinBudget(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Skill Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">Specific Skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => {
                setSelectedSkill(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">Any Skill</option>
              {allSkills.slice(0, 15).map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Results Column (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search bar & Sort Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, keywords, or required skill..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
              <span className="text-xs text-slate-500 whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="newest">Newest First</option>
                <option value="budget-high">Highest Budget</option>
                <option value="budget-low">Lowest Budget</option>
                <option value="proposals">Most Proposals</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800 tabular-nums">{paginatedProjects.length}</strong> of{' '}
              <strong className="text-slate-800 tabular-nums">{processedProjects.length}</strong> projects
            </span>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : paginatedProjects.length > 0 ? (
            /* Cards List */
            <div className="space-y-4">
              {paginatedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSaved={savedProjectIds.includes(project.id)}
                  onSaveToggle={handleSaveToggle}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pt-4 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => {
                      setCurrentPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No projects match your criteria"
              description="Try adjusting your filters, clearing search terms, or checking back soon for new client listings."
              actionLabel="Reset All Filters"
              onAction={resetFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
};
