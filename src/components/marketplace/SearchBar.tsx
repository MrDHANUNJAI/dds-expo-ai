import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ArrowRight } from 'lucide-react';
import { categories } from '../../data/categories';

export interface SearchBarProps {
  placeholder?: string;
  initialQuery?: string;
  initialCategory?: string;
  onSearch?: (query: string, category: string) => void;
  className?: string;
  compact?: boolean;
}

const POPULAR_SEARCHES = [
  'React Developer',
  'UI/UX Design Systems',
  'Full Stack Node.js',
  'Mobile App Flutter',
  'LLM AI Engineer',
  'Brand Identity & Logo',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'What service or skill are you looking for?',
  initialQuery = '',
  initialCategory = '',
  onSearch,
  className = '',
  compact = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isFocused, setIsFocused] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsFocused(false);
    setIsCategoryOpen(false);
    if (onSearch) {
      onSearch(query, selectedCategory);
    } else {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (selectedCategory) params.set('cat', selectedCategory);
      navigate(`/find-work?${params.toString()}`);
    }
  };

  const selectSuggestion = (text: string) => {
    setQuery(text);
    setIsFocused(false);
    if (onSearch) {
      onSearch(text, selectedCategory);
    } else {
      navigate(`/find-work?q=${encodeURIComponent(text)}`);
    }
  };

  const filteredCategories = categories.slice(0, 8);

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={handleSearchSubmit}
        className={`flex flex-col sm:flex-row items-stretch bg-white border rounded-xl transition-all shadow-xs ${
          isFocused ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {/* Category Picker Dropdown (Desktop/Tablet) */}
        {!compact && (
          <div className="relative border-b sm:border-b-0 sm:border-r border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="h-12 px-4 flex items-center justify-between gap-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors w-full sm:w-auto"
            >
              <span className="truncate max-w-[130px]">
                {selectedCategory
                  ? categories.find((c) => c.slug === selectedCategory)?.name || 'All Categories'
                  : 'All Categories'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isCategoryOpen && (
              <div className="absolute top-full left-0 z-30 w-56 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('');
                    setIsCategoryOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100"
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-100 flex items-center justify-between ${
                      selectedCategory === cat.slug ? 'text-indigo-600 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input Field */}
        <div className="flex-1 flex items-center px-3.5 h-12">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="w-full h-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search CTA */}
        <div className="p-1.5 sm:pl-0">
          <button
            type="submit"
            className="w-full sm:w-auto h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Auto-suggestions & Popular Searches Flyout */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-30">
          <div className="mb-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={() => selectSuggestion(item)}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Explore by Category
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onMouseDown={() => {
                    setSelectedCategory(cat.slug);
                    setIsFocused(false);
                    navigate(`/categories/${cat.slug}`);
                  }}
                  className="text-left py-1 text-xs text-slate-600 hover:text-indigo-600 transition-colors truncate"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
