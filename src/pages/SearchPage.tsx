import React, { useState, useEffect, useDeferredValue, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { searchCatalog, getWorkDetail } from '@/lib/supabase';
import { SEED_SUBJECTS } from '@/lib/catalogData';
import { BookCoverPlaceholder } from '@/components/BookCoverPlaceholder';
import { Button } from '@/design/Button';
import { StatusBadge } from '@/design/StatusBadge';
import { Skeleton } from '@/design/Skeleton';
import { EmptyState } from '@/design/EmptyState';
import { AnimatedNumber } from '@/design/AnimatedNumber';
import { PlaceHoldButton } from '@/features/holds/PlaceHoldButton';
import {
  Search as SearchIcon,
  Filter,
  AlertCircle,
  ArrowRight,
  MapPin,
  GraduationCap,
  X,
  ExternalLink,
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedWorkId = searchParams.get('workId');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // 300ms debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const deferredQuery = useDeferredValue(debouncedQuery);

  // TanStack Query for catalog search with 15s live polling
  const {
    data: works = [],
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['catalog_search', deferredQuery, selectedSubject, availableOnly],
    queryFn: () => searchCatalog(deferredQuery, selectedSubject, availableOnly),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  // Calculate live seconds elapsed
  const [secondsAgo, setSecondsAgo] = useState(0);
  useEffect(() => {
    setSecondsAgo(0);
    const interval = setInterval(() => {
      if (dataUpdatedAt) {
        setSecondsAgo(Math.max(0, Math.floor((Date.now() - dataUpdatedAt) / 1000)));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  // Master-Detail on desktop (1024px+): auto-select first item if none selected and on desktop
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  useEffect(() => {
    if (isDesktop && !selectedWorkId && works.length > 0) {
      setSearchParams(
        (prev) => {
          prev.set('workId', works[0].work_id);
          return prev;
        },
        { replace: true }
      );
    }
  }, [works, selectedWorkId, isDesktop, setSearchParams]);

  // Detail query for selected work in master-detail
  const {
    data: selectedWork,
    isLoading: isDetailLoading,
  } = useQuery({
    queryKey: ['work_detail', selectedWorkId],
    queryFn: () => (selectedWorkId ? getWorkDetail(selectedWorkId) : null),
    enabled: Boolean(selectedWorkId),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  // Keyboard Navigation:
  // '/' focuses search input
  // ArrowDown/ArrowUp moves through search results
  // Enter opens/selects current item
  // Escape clears search / closes detail
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea';

      // '/' to focus search input
      if (e.key === '/' && !isInputActive) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      // 'Escape' closes detail or blurs search
      if (e.key === 'Escape') {
        if (isInputActive) {
          searchInputRef.current?.blur();
        } else if (selectedWorkId) {
          setSearchParams((prev) => {
            prev.delete('workId');
            return prev;
          });
        }
        return;
      }

      // If typing in search, let ArrowDown jump to results
      if (isInputActive && e.key === 'ArrowDown') {
        e.preventDefault();
        searchInputRef.current?.blur();
        setFocusedIndex(0);
        return;
      }

      // Arrow navigation over results
      if (!isInputActive && works.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, works.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const targetWork = works[focusedIndex];
          if (targetWork) {
            handleSelectWork(targetWork.work_id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [works, focusedIndex, selectedWorkId, setSearchParams]);

  const handleSelectWork = (workId: string) => {
    if (window.innerWidth >= 1024) {
      setSearchParams(
        (prev) => {
          prev.set('workId', workId);
          return prev;
        },
        { replace: false }
      );
    } else {
      navigate(`/work/${workId}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-rule">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">
            Library Catalog
          </h1>
          <p className="text-xs text-grey font-sans mt-0.5">
            Search physical books by title, author, course code (e.g. CS201, MA101), or subject.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-grey">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="font-mono tabular-nums">
              Updated <AnimatedNumber value={secondsAgo} />s ago
            </span>
          </div>

          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-grey bg-white border border-rule rounded-[6px]">
            / to focus
          </kbd>
        </div>
      </div>

      {/* Search Input Bar (6px radius, clear focus ring) */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search by title, author, course code (e.g. CS201, MA101)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-white border border-rule rounded-[6px] text-ink placeholder:text-grey/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 transition-all"
        />
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey pointer-events-none">
          <SearchIcon className="w-4 h-4" strokeWidth={1.75} />
        </div>
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey hover:text-ink w-5 h-5 flex items-center justify-center rounded-[6px] cursor-pointer"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter Controls: Subject Chips & Available Only Switch */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            <Filter className="w-3.5 h-3.5 text-brand" strokeWidth={1.75} />
            <span>Subject Category</span>
          </div>

          {/* Available Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-medium text-grey">Available only</span>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded text-brand focus:ring-brand border-rule"
            />
          </label>
        </div>

        {/* Scrollable Subject Filter Chips (6px radius) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar select-none">
          {SEED_SUBJECTS.map((subject) => {
            const isSelected = selectedSubject === subject;
            return (
              <button
                key={subject}
                type="button"
                onClick={() => setSelectedSubject(subject)}
                className={`whitespace-nowrap px-3 py-1 rounded-[6px] text-xs transition-colors font-medium shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-brand text-white border-brand font-semibold shadow-sm'
                    : 'bg-white text-grey border-rule hover:bg-paper hover:text-ink'
                }`}
              >
                {subject}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-grey pt-1">
        <span>
          Showing <strong className="text-ink font-semibold tabular-nums"><AnimatedNumber value={works.length} /></strong> {works.length === 1 ? 'work' : 'works'}
          {selectedSubject !== 'All' ? ` in ${selectedSubject}` : ''}
        </span>
        {availableOnly && (
          <span className="text-[11px] font-medium text-brand bg-paper px-2 py-0.5 rounded-[6px] border border-rule">
            Available copies only
          </span>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MASTER-DETAIL VIEW (1024px+): Left 40-45%, Right 55-60%        */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Master Results Column (lg:col-span-5) */}
        <div
          ref={resultsContainerRef}
          className={`${
            selectedWorkId ? 'lg:col-span-5' : 'lg:col-span-12'
          } space-y-3 min-w-0`}
        >
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-[12px] bg-white border border-rule space-y-2">
                  <Skeleton width="60%" height="18px" />
                  <Skeleton width="40%" height="12px" />
                  <Skeleton width="30%" height="14px" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-6 rounded-[12px] bg-[#fef2f2] border border-alert/30 text-center space-y-3">
              <AlertCircle className="w-6 h-6 text-alert mx-auto" />
              <p className="text-xs font-semibold text-alert">Failed to load catalog results</p>
              <Button size="sm" variant="secondary" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : works.length === 0 ? (
            <EmptyState
              title="No matching books found"
              description={`We couldn't find any books matching "${searchTerm}". Try checking for spelling or adjusting filters.`}
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSubject('All');
                    setAvailableOnly(false);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {works.map((work, index) => {
                const isSelected = selectedWorkId === work.work_id;
                const isFocused = focusedIndex === index;
                const hasMultipleEditions = work.edition_count > 1;
                const isAllReference =
                  work.reference_only_copies === work.total_copies && work.total_copies > 0;
                const hasAvailable = work.available_copies > 0;

                return (
                  <div
                    key={work.work_id}
                    onClick={() => handleSelectWork(work.work_id)}
                    className={`group p-3.5 rounded-[12px] bg-white border transition-all cursor-pointer relative overflow-hidden select-none ${
                      isSelected
                        ? 'border-brand ring-1 ring-brand bg-paper/40 shadow-sm'
                        : isFocused
                        ? 'border-brand/60 bg-paper/20'
                        : 'border-rule hover:border-brand/40'
                    }`}
                  >
                    <div className="flex gap-3.5">
                      {/* Edition Cover */}
                      <div className="w-16 h-22 sm:w-18 sm:h-24 shrink-0 rounded-[6px] overflow-hidden border border-rule bg-paper relative">
                        {work.cover_url ? (
                          <img
                            src={work.cover_url}
                            alt={work.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <BookCoverPlaceholder title={work.title} author={work.author} />
                        )}

                        {hasMultipleEditions && (
                          <span className="absolute bottom-1 right-1 bg-ink/80 text-white font-mono text-[9px] font-semibold px-1 py-0.2 rounded">
                            {work.edition_count} eds
                          </span>
                        )}
                      </div>

                      {/* Work Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          {/* Course tags if present */}
                          {work.course_codes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {work.course_codes.slice(0, 2).map((code) => (
                                <span
                                  key={code}
                                  className="font-mono text-[10px] font-semibold text-accentink bg-accent/15 px-1.5 py-0.2 rounded-[4px] border border-accent/30"
                                >
                                  {code}
                                </span>
                              ))}
                              {work.course_codes.length > 2 && (
                                <span className="text-[10px] text-grey font-mono">
                                  +{work.course_codes.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          <h2 className="font-serif font-bold text-sm text-ink group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                            {work.title}
                          </h2>
                          <p className="text-xs text-grey line-clamp-1 mt-0.5">
                            {work.author}
                          </p>
                          <p className="text-[11px] text-grey line-clamp-1 mt-0.5 font-sans">
                            {work.latest_edition_no ? `Edition ${work.latest_edition_no}` : 'Standard Edition'}
                          </p>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center justify-between pt-2 border-t border-rule mt-2">
                          {isAllReference ? (
                            <StatusBadge status="reference" label="Reference only" size="sm" />
                          ) : hasAvailable ? (
                            <StatusBadge
                              status="available"
                              label={`${work.available_copies} of ${work.total_copies} available`}
                              size="sm"
                            />
                          ) : (
                            <StatusBadge
                              status="due_soon"
                              label={`0 of ${work.total_copies} available`}
                              size="sm"
                            />
                          )}

                          <ArrowRight className="w-3.5 h-3.5 text-grey group-hover:text-brand transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------- */}
        {/* Detail Panel Column on Desktop (lg:col-span-7)              */}
        {/* ----------------------------------------------------------- */}
        {selectedWorkId && (
          <div className="hidden lg:block lg:col-span-7 sticky top-4">
            <div className="bg-white rounded-[12px] border border-rule p-6 space-y-5 shadow-sm max-h-[calc(100vh-100px)] overflow-y-auto">
              {/* Header with Close Action */}
              <div className="flex items-start justify-between pb-3 border-b border-rule gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-mono text-grey uppercase tracking-wider block">
                    Catalog details
                  </span>
                  <h2 className="font-serif text-xl font-bold text-ink leading-snug">
                    {selectedWork?.title || 'Loading book details...'}
                  </h2>
                  <p className="text-xs text-grey">
                    By {selectedWork?.author} • {selectedWork?.subject}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    to={`/work/${selectedWorkId}`}
                    className="p-1.5 rounded-[6px] text-grey hover:text-ink hover:bg-paper transition-colors"
                    title="Open full page"
                  >
                    <ExternalLink className="w-4 h-4" strokeWidth={1.75} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchParams((prev) => {
                        prev.delete('workId');
                        return prev;
                      });
                    }}
                    className="p-1.5 rounded-[6px] text-grey hover:text-ink hover:bg-paper transition-colors cursor-pointer"
                    title="Close preview (Esc)"
                  >
                    <X className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              {isDetailLoading || !selectedWork ? (
                <div className="space-y-3 py-6">
                  <Skeleton width="100%" height="80px" />
                  <Skeleton width="70%" height="24px" />
                  <Skeleton width="100%" height="120px" />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Summary row */}
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-28 shrink-0 rounded-[6px] overflow-hidden border border-rule bg-paper">
                      {selectedWork.editions[0]?.cover_url ? (
                        <img
                          src={selectedWork.editions[0].cover_url}
                          alt={selectedWork.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookCoverPlaceholder
                          title={selectedWork.title}
                          author={selectedWork.author}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {selectedWork.course_codes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedWork.course_codes.map((code) => (
                            <span
                              key={code}
                              className="font-mono text-[10px] font-semibold text-accentink bg-accent/15 px-2 py-0.5 rounded-[4px] border border-accent/30"
                            >
                              <GraduationCap className="w-3 h-3 mr-1 inline" />
                              {code}
                            </span>
                          ))}
                        </div>
                      )}

                      {selectedWork.description && (
                        <p className="text-xs text-grey leading-relaxed line-clamp-3">
                          {selectedWork.description}
                        </p>
                      )}

                      <div className="pt-2">
                        <PlaceHoldButton
                          workId={selectedWork.work_id}
                          title={selectedWork.title}
                          author={selectedWork.author}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Availability Stamp Card */}
                  <div className="p-3.5 rounded-[6px] bg-paper border border-rule grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="block font-serif text-xl font-bold text-brand tabular-nums">
                        {selectedWork.available_copies}
                      </span>
                      <span className="text-[10px] text-grey uppercase tracking-wider block mt-0.5">
                        Available
                      </span>
                    </div>
                    <div>
                      <span className="block font-serif text-xl font-bold text-ink tabular-nums">
                        {selectedWork.total_copies}
                      </span>
                      <span className="text-[10px] text-grey uppercase tracking-wider block mt-0.5">
                        Total copies
                      </span>
                    </div>
                    <div>
                      <span className="block font-serif text-xl font-bold text-accentink tabular-nums">
                        {selectedWork.reference_only_copies}
                      </span>
                      <span className="text-[10px] text-grey uppercase tracking-wider block mt-0.5">
                        Reference only
                      </span>
                    </div>
                  </div>

                  {/* Editions List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-rule">
                      <span className="text-xs font-semibold text-ink">
                        All editions ({selectedWork.editions.length})
                      </span>
                      <span className="text-[11px] text-grey">Newest first</span>
                    </div>

                    <div className="space-y-3">
                      {selectedWork.editions.map((edition) => (
                        <div
                          key={edition.edition_id}
                          className="p-3.5 rounded-[6px] border border-rule space-y-2 bg-white"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-xs text-ink flex items-center gap-1.5">
                                <span>Edition {edition.edition_no} ({edition.year})</span>
                                {edition.is_latest && (
                                  <span className="text-[10px] font-medium text-accentink bg-accent/20 px-1.5 py-0.2 rounded border border-accent/40">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-grey font-mono mt-0.5">
                                ISBN: {edition.isbn} • {edition.publisher || 'Academic Press'}
                              </p>
                            </div>

                            <StatusBadge
                              status={edition.available_copies > 0 ? 'available' : 'due_soon'}
                              label={`${edition.available_copies}/${edition.total_copies} avail`}
                              size="sm"
                            />
                          </div>

                          {/* Shelf locations */}
                          <div className="space-y-1.5 pt-2 border-t border-rule text-xs">
                            <span className="text-[10px] font-semibold text-grey uppercase tracking-wider block">
                              Copies & Shelves
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {edition.copies.map((copy) => (
                                <div
                                  key={copy.id}
                                  className="p-2 rounded-[4px] bg-paper border border-rule flex items-center justify-between text-[11px]"
                                >
                                  <div className="font-mono text-ink flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-brand shrink-0" />
                                    <span>{copy.shelf_location}</span>
                                  </div>
                                  <div>
                                    {copy.reference_only ? (
                                      <span className="text-[10px] text-grey font-medium">
                                        Reference
                                      </span>
                                    ) : copy.status === 'available' ? (
                                      <span className="text-[10px] text-brand font-semibold">
                                        Available
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-grey">
                                        {copy.status.replace('_', ' ')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
