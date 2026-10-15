import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWorkDetail } from '@/lib/supabase';
import { BookCoverPlaceholder } from '@/components/BookCoverPlaceholder';
import { StatusBadge } from '@/design/StatusBadge';
import { Button } from '@/design/Button';
import { Sheet } from '@/design/Sheet';
import { Skeleton } from '@/design/Skeleton';
import { AnimatedNumber } from '@/design/AnimatedNumber';
import { PlaceHoldButton } from '@/features/holds/PlaceHoldButton';
import type { EditionDetail } from '@/types/database';
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Sparkles,
  Layers,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';

export const WorkDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Selected edition for Sheet (bottom sheet on mobile, right panel on desktop)
  const [selectedEdition, setSelectedEdition] = useState<EditionDetail | null>(null);

  // Query work detail with 15s live polling, paused when tab is hidden
  const {
    data: work,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['work_detail', id],
    queryFn: () => (id ? getWorkDetail(id) : null),
    enabled: Boolean(id),
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

  if (isLoading) {
    return (
      <div className="space-y-5 py-4">
        <Skeleton width="120px" height="32px" />
        <Skeleton width="100%" height="240px" radius="sheet" />
        <div className="space-y-3">
          <Skeleton width="100%" height="90px" radius="sheet" />
          <Skeleton width="100%" height="90px" radius="sheet" />
        </div>
      </div>
    );
  }

  if (isError || !work) {
    return (
      <div className="p-8 text-center bg-white rounded-[12px] border border-rule space-y-4 my-6">
        <h2 className="font-serif text-lg font-bold text-ink">Work Not Found</h2>
        <p className="text-xs text-grey max-w-xs mx-auto">
          We could not locate this bibliographic record in the library collection.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button onClick={() => refetch()} size="sm" variant="secondary">
            Try again
          </Button>
          <Button onClick={() => navigate('/search')} variant="primary" size="sm">
            Return to catalog
          </Button>
        </div>
      </div>
    );
  }

  const latestEdition = work.editions[0];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Navigation & Live Polling Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-rule">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-grey hover:text-ink transition-colors py-1 px-2 rounded-[6px] hover:bg-white border border-transparent hover:border-rule cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          <span>Back to catalog</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-grey font-sans">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="font-mono tabular-nums">
              Updated <AnimatedNumber value={secondsAgo} />s ago
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-grey hover:text-ink text-xs h-7"
          >
            Sync
          </Button>
        </div>
      </div>

      {/* Main Bibliographic Work Summary Card */}
      <div className="bg-white rounded-[12px] border border-rule p-5 sm:p-7 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Cover Image or Monogram */}
          <div className="w-28 h-40 sm:w-32 sm:h-44 shrink-0 rounded-[6px] overflow-hidden border border-rule bg-paper shadow-sm mx-auto sm:mx-0">
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

          {/* Metadata Block */}
          <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
            {/* Course tags if mapped */}
            {work.course_codes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                {work.course_codes.map((code) => (
                  <span
                    key={code}
                    className="font-mono text-[10px] font-semibold text-accentink bg-accent/15 px-2 py-0.5 rounded-[4px] border border-accent/30 inline-flex items-center gap-1"
                  >
                    <GraduationCap className="w-3 h-3 inline" />
                    <span>{code}</span>
                  </span>
                ))}
              </div>
            )}

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight leading-snug">
              {work.title}
            </h1>

            <p className="text-sm font-medium text-grey">
              By <span className="text-ink font-semibold">{work.author}</span> •{' '}
              <span className="font-sans text-xs bg-paper px-2 py-0.5 rounded-[4px] border border-rule text-grey">
                {work.subject}
              </span>
            </p>

            {work.description && (
              <p className="text-xs text-grey leading-relaxed max-w-2xl font-sans">
                {work.description}
              </p>
            )}

            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <PlaceHoldButton
                workId={work.work_id}
                title={work.title}
                author={work.author}
              />
            </div>
          </div>
        </div>

        {/* OVERALL AVAILABILITY ACROSS ALL EDITIONS */}
        <div className="pt-4 border-t border-rule space-y-3">
          <div className="text-[11px] font-medium text-grey uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand" strokeWidth={1.75} />
            <span>Overall Availability across all editions</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-[6px] bg-paper border border-rule text-center">
              <span className="block font-serif text-2xl font-bold text-brand tabular-nums">
                <AnimatedNumber value={work.available_copies} />
              </span>
              <span className="text-[11px] text-grey font-medium uppercase tracking-wider block mt-1">
                Available to issue
              </span>
            </div>

            <div className="p-3.5 rounded-[6px] bg-paper border border-rule text-center">
              <span className="block font-serif text-2xl font-bold text-ink tabular-nums">
                <AnimatedNumber value={work.total_copies} />
              </span>
              <span className="text-[11px] text-grey font-medium uppercase tracking-wider block mt-1">
                Total copies
              </span>
            </div>

            <div className="p-3.5 rounded-[6px] bg-paper border border-rule text-center">
              <span className="block font-serif text-2xl font-bold text-accentink tabular-nums">
                <AnimatedNumber value={work.reference_only_copies} />
              </span>
              <span className="text-[11px] text-grey font-medium uppercase tracking-wider block mt-1">
                Reference only
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ALL EDITIONS LIST (Newest First) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-rule">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand" strokeWidth={1.75} />
            <h2 className="font-serif text-base font-bold text-ink">
              All editions ({work.editions.length})
            </h2>
          </div>
          <span className="text-xs text-grey">Sorted newest first</span>
        </div>

        <div className="space-y-3.5">
          {work.editions.map((edition) => {
            return (
              <div
                key={edition.edition_id}
                className="bg-white rounded-[12px] border border-rule p-4 sm:p-5 space-y-4 shadow-sm hover:border-brand/40 transition-colors"
              >
                {/* Edition Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-base font-bold text-ink">
                        Edition {edition.edition_no} ({edition.year})
                      </h3>
                      {edition.is_latest && (
                        <span className="text-[10px] font-semibold text-accentink bg-accent/20 px-2 py-0.5 rounded-[4px] border border-accent/40 inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-accent" strokeWidth={2} />
                          Latest edition
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-grey font-mono">
                      ISBN: {edition.isbn} • Publisher: {edition.publisher || 'Academic Press'}
                      {edition.price ? ` • Price: ₹${edition.price}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge
                      status={edition.available_copies > 0 ? 'available' : 'due_soon'}
                      label={`${edition.available_copies} of ${edition.total_copies} available`}
                      size="sm"
                    />

                    {/* View Edition Details (Sheet Trigger) */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedEdition(edition)}
                      className="text-xs h-8"
                    >
                      View edition copies
                    </Button>
                  </div>
                </div>

                {/* Copies Preview Grouped by Shelf Location */}
                <div className="space-y-2 pt-3 border-t border-rule text-xs">
                  <span className="text-[10px] font-semibold text-grey uppercase tracking-wider block">
                    Copies & Shelf Locations ({edition.copies.length})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {edition.copies.map((copy) => {
                      const isRef = copy.reference_only;
                      const isAvail = copy.status === 'available' && !isRef;

                      return (
                        <div
                          key={copy.id}
                          className="p-2.5 rounded-[6px] bg-paper border border-rule flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 font-mono text-ink font-medium">
                              <MapPin className="w-3.5 h-3.5 text-brand shrink-0" strokeWidth={1.75} />
                              <span className="truncate">{copy.shelf_location}</span>
                            </div>
                            <span className="text-[10px] text-grey font-mono pl-5 block">
                              Acc: {copy.accession_no}
                            </span>
                          </div>

                          <div className="shrink-0">
                            {isRef ? (
                              <StatusBadge status="reference" label="Reference" size="sm" />
                            ) : isAvail ? (
                              <StatusBadge status="available" label="Available" size="sm" />
                            ) : (
                              <StatusBadge
                                status="waiting"
                                label={copy.status.replace('_', ' ')}
                                size="sm"
                              />
                            )}
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

      {/* ------------------------------------------------------------- */}
      {/* EDITION DETAILS SHEET: Bottom sheet on phone (< 768px),       */}
      {/* Slide-in right panel on desktop (>= 768px). Same component.    */}
      {/* ------------------------------------------------------------- */}
      <Sheet
        open={Boolean(selectedEdition)}
        onOpenChange={(open) => {
          if (!open) setSelectedEdition(null);
        }}
        title={`Edition ${selectedEdition?.edition_no} (${selectedEdition?.year})`}
        description={`ISBN ${selectedEdition?.isbn} • ${selectedEdition?.publisher || 'Academic Press'}`}
      >
        {selectedEdition && (
          <div className="p-4 sm:p-6 space-y-6 font-sans">
            {/* Quick Availability Badge */}
            <div className="p-4 rounded-[6px] bg-paper border border-rule flex items-center justify-between">
              <div>
                <span className="text-xs text-grey block">Edition availability</span>
                <span className="font-serif text-lg font-bold text-ink">
                  {selectedEdition.available_copies} of {selectedEdition.total_copies} copies ready
                </span>
              </div>
              <StatusBadge
                status={selectedEdition.available_copies > 0 ? 'available' : 'due_soon'}
                label={selectedEdition.available_copies > 0 ? 'Available' : 'Reserved'}
                size="md"
              />
            </div>

            {/* Hold action */}
            <div className="space-y-1">
              <PlaceHoldButton
                workId={work.work_id}
                title={work.title}
                author={work.author}
              />
            </div>

            {/* Copies Detailed List */}
            <div className="space-y-3">
              <h3 className="font-serif text-sm font-semibold text-ink border-b border-rule pb-1.5">
                Physical Copy Inventory
              </h3>

              <div className="space-y-2">
                {selectedEdition.copies.map((copy) => (
                  <div
                    key={copy.id}
                    className="p-3 rounded-[6px] bg-white border border-rule space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-ink flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand" strokeWidth={1.75} />
                        Shelf {copy.shelf_location}
                      </span>
                      {copy.reference_only ? (
                        <StatusBadge status="reference" label="Reference only" size="sm" />
                      ) : copy.status === 'available' ? (
                        <StatusBadge status="available" label="Available" size="sm" />
                      ) : (
                        <StatusBadge
                          status="waiting"
                          label={copy.status.replace('_', ' ')}
                          size="sm"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-grey font-mono pt-1">
                      <span>Accession: {copy.accession_no}</span>
                      <span>{copy.reference_only ? 'In-library use only' : 'Circulating'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
};

export default WorkDetailPage;
