import React, { useState, useEffect, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { searchCatalog } from '@/lib/supabase';
import { SEED_SUBJECTS } from '@/lib/catalogData';
import { BookCoverPlaceholder } from '@/components/BookCoverPlaceholder';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search as SearchIcon,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  BookX
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);

  // 300ms debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const deferredQuery = useDeferredValue(debouncedQuery);

  // TanStack Query with 15s live polling, paused when tab is hidden
  const {
    data: works = [],
    isLoading,
    isError,
    refetch,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['catalog_search', deferredQuery, selectedSubject, availableOnly],
    queryFn: () => searchCatalog(deferredQuery, selectedSubject, availableOnly),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  // Calculate live "Updated Xs ago" indicator
  const [secondsAgo, setSecondsAgo] = useState(0);
  useEffect(() => {
    setSecondsAgo(0);
    const interval = setInterval(() => {
      if (dataUpdatedAt) {
        setSecondsAgo(Math.floor((Date.now() - dataUpdatedAt) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Library Catalog
          </h2>
          <p className="text-xs text-slate-500">
            Search 200 copies by title, author, subject, or course code
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>Updated {secondsAgo}s ago</span>
        </div>
      </div>

      {/* Search Input Bar (300ms debounced) */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search by title, author, course code (e.g. CS201, MA101)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 h-12 text-sm shadow-sm"
          autoFocus
        />
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon className="w-4 h-4" />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter Controls: Subject Chips & Available Only Switch */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>Subject Category</span>
          </div>

          {/* Available Only Toggle Switch */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-medium text-slate-700">Available only</span>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
            </div>
          </label>
        </div>

        {/* Scrollable Subject Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {SEED_SUBJECTS.map((subject) => {
            const isSelected = selectedSubject === subject;
            return (
              <button
                key={subject}
                type="button"
                onClick={() => setSelectedSubject(subject)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition-all font-medium select-none shrink-0 border ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-900/10 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {subject}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Showing <strong className="text-slate-900">{works.length}</strong> {works.length === 1 ? 'work' : 'works'}
          {selectedSubject !== 'All' ? ` in ${selectedSubject}` : ''}
        </span>
        {availableOnly && (
          <Badge variant="outline" className="text-[10px] text-teal-800 bg-teal-50 border-teal-200 font-medium">
            Available Copies Only
          </Badge>
        )}
      </div>

      {/* Book Results List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse border border-slate-200/60" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
          <p className="text-sm font-semibold text-rose-900">Failed to load catalog results</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : works.length === 0 ? (
        /* Zero Results Empty State with Disabled 'Request this book' Stub */
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm my-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <BookX className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No matching books found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              We couldn't find any books matching &ldquo;{searchTerm}&rdquo; in our catalog collection.
              Try adjusting your query or filters.
            </p>
          </div>

          {/* Disabled 'Request this book' stub */}
          <div className="pt-2">
            <Button
              disabled
              variant="outline"
              className="text-xs opacity-60 cursor-not-allowed border-dashed"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
              Request this book (Stub - Coming in Phase 2)
            </Button>
          </div>
        </div>
      ) : (
        /* Work Cards List */
        <div className="space-y-3">
          {works.map((work) => {
            const hasMultipleEditions = work.edition_count > 1;
            const isAllReference =
              work.reference_only_copies === work.total_copies && work.total_copies > 0;
            const hasAvailable = work.available_copies > 0;

            return (
              <Link
                key={work.work_id}
                to={`/work/${work.work_id}`}
                className="group block bg-white rounded-xl border border-slate-200 hover:border-teal-400/80 hover:shadow-md hover:shadow-teal-900/5 transition-all p-3.5 relative overflow-hidden"
              >
                <div className="flex gap-3.5">
                  {/* Latest Edition Cover or Initials Fallback */}
                  <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-xs relative">
                    {work.cover_url ? (
                      <img
                        src={work.cover_url}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <BookCoverPlaceholder title={work.title} author={work.author} />
                    )}

                    {hasMultipleEditions && (
                      <span className="absolute bottom-1 right-1 bg-slate-900/85 text-white font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded backdrop-blur">
                        {work.edition_count} Eds
                      </span>
                    )}
                  </div>

                  {/* Work Information */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Course tags if mapped */}
                      {work.course_codes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {work.course_codes.slice(0, 2).map((code) => (
                            <span
                              key={code}
                              className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300/80 px-1.5 py-0.2 rounded"
                            >
                              {code}
                            </span>
                          ))}
                          {work.course_codes.length > 2 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              +{work.course_codes.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
                        {work.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {work.author}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        Latest: {work.latest_edition_no ? `Edition ${work.latest_edition_no}` : 'Standard Edition'}
                      </p>
                    </div>

                    {/* Bottom Status & Availability Badge */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                      {isAllReference ? (
                        /* All copies reference only */
                        <Badge
                          variant="outline"
                          className="bg-slate-100 text-slate-700 border-slate-300 text-[11px] font-semibold px-2 py-0.5"
                        >
                          Reference only
                        </Badge>
                      ) : hasAvailable ? (
                        /* Available > 0 -> Teal badge */
                        <Badge
                          variant="default"
                          className="bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-semibold px-2 py-0.5 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-teal-700" />
                          <span>Available: {work.available_copies} of {work.total_copies} copies</span>
                        </Badge>
                      ) : (
                        /* Available = 0 -> Warm Amber badge */
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold px-2 py-0.5 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3 text-amber-700" />
                          <span>Available: 0 of {work.total_copies} copies</span>
                        </Badge>
                      )}

                      <span className="text-slate-400 group-hover:text-teal-600 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
