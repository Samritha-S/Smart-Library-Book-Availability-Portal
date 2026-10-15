import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWorkDetail } from '@/lib/supabase';
import { BookCoverPlaceholder } from '@/components/BookCoverPlaceholder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  GraduationCap,
  Info
} from 'lucide-react';

export const WorkDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Query work detail with 15s live polling, paused when tab is hidden
  const {
    data: work,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['work_detail', id],
    queryFn: () => (id ? getWorkDetail(id) : null),
    enabled: Boolean(id),
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

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-md" />
        <div className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
        <div className="h-40 bg-slate-200 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (isError || !work) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-4 my-6">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Work Not Found</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          We could not locate this bibliographic record in the library collection.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button onClick={() => refetch()} size="sm">
            Try Again
          </Button>
          <Button onClick={() => navigate('/search')} variant="outline" size="sm">
            Return to Search
          </Button>
        </div>
      </div>
    );
  }

  const latestEdition = work.editions[0];

  return (
    <div className="space-y-6 pb-6">
      {/* Top Navigation Bar & Live Poll Indicator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>Updated {secondsAgo}s ago</span>
        </div>
      </div>

      {/* Main Work Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-teal-600 via-teal-500 to-amber-500" />

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Latest Edition Cover or Initials Placeholder */}
            <div className="w-28 h-40 shrink-0 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-sm mx-auto sm:mx-0">
              {latestEdition?.cover_url ? (
                <img
                  src={latestEdition.cover_url}
                  alt={work.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <BookCoverPlaceholder title={work.title} author={work.author} />
              )}
            </div>

            {/* Work Details */}
            <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
              {/* Course codes mapped */}
              {work.course_codes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {work.course_codes.map((code) => (
                    <Badge
                      key={code}
                      variant="secondary"
                      className="font-mono text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300"
                    >
                      <GraduationCap className="w-3 h-3 mr-1 inline" />
                      {code}
                    </Badge>
                  ))}
                </div>
              )}

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {work.title}
              </h1>

              <p className="text-sm font-medium text-slate-600">
                By {work.author}
              </p>

              <Badge variant="outline" className="text-xs text-teal-800 bg-teal-50 border-teal-200">
                {work.subject}
              </Badge>

              {work.description && (
                <p className="text-xs text-slate-600 leading-relaxed pt-1 line-clamp-3 sm:line-clamp-none">
                  {work.description}
                </p>
              )}
            </div>
          </div>

          {/* TOTAL SUMMARY ACROSS ALL EDITIONS */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-700" />
              <span>Overall Availability (Across All Editions)</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200 text-center">
                <span className="block text-xl font-extrabold text-teal-800">
                  {work.available_copies}
                </span>
                <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider block mt-0.5">
                  Available to Issue
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="block text-xl font-extrabold text-slate-800">
                  {work.total_copies}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mt-0.5">
                  Total Copies
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-center">
                <span className="block text-xl font-extrabold text-amber-900">
                  {work.reference_only_copies}
                </span>
                <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block mt-0.5">
                  Use in Library
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDITIONS BREAKDOWN (Newest First) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-700" />
            <span>All Editions ({work.editions.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Sorted newest first</span>
        </div>

        <div className="space-y-4">
          {work.editions.map((edition) => {
            return (
              <div
                key={edition.edition_id}
                className={`bg-white rounded-xl border p-4.5 space-y-3.5 shadow-sm transition-all ${
                  edition.is_latest
                    ? 'border-teal-400/90 ring-1 ring-teal-500/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Edition Title Banner */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900">
                        Edition {edition.edition_no} ({edition.year})
                      </h4>
                      {edition.is_latest && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-bold py-0.5 px-2 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Latest Edition
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Publisher: {edition.publisher || 'Academic Press'} • ISBN: <span className="font-mono">{edition.isbn}</span>
                      {edition.price ? ` • Price: ₹${edition.price}` : ''}
                    </p>
                  </div>

                  {/* Edition Availability Pill */}
                  <Badge
                    variant={edition.available_copies > 0 ? 'default' : 'secondary'}
                    className="shrink-0 text-xs font-semibold py-1 px-2.5"
                  >
                    {edition.available_copies} of {edition.total_copies} available
                  </Badge>
                </div>

                {/* Copies Grouped by Shelf Location */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Physical Copies & Shelf Locations
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {edition.copies.map((copy) => {
                      const isRef = copy.reference_only;
                      const isAvailable = copy.status === 'available' && !isRef;

                      let statusBadge = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Available
                        </span>
                      );

                      if (isRef) {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                            <Info className="w-3 h-3 text-amber-600" />
                            Use in library
                          </span>
                        );
                      } else if (copy.status === 'issued') {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            On Loan
                          </span>
                        );
                      } else if (copy.status === 'on_hold_shelf') {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Hold Shelf
                          </span>
                        );
                      } else if (copy.status === 'damaged_repair') {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            In Repair
                          </span>
                        );
                      }

                      return (
                        <div
                          key={copy.id}
                          className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                            isAvailable
                              ? 'bg-white border-teal-200/80 shadow-2xs'
                              : 'bg-slate-50/70 border-slate-200'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 font-mono font-medium text-slate-800">
                              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span className="truncate">{copy.shelf_location}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono pl-5 block">
                              Acc: {copy.accession_no}
                            </span>
                          </div>

                          <div className="shrink-0">
                            {statusBadge}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
