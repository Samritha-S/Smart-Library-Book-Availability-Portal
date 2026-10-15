import React from 'react';
import { EmptyState } from '../_local';
import { CheckCircle2, History, BookOpen } from 'lucide-react';
import type { ReturnedLoanItem } from '../mock/types';

interface HistoryListProps {
  history: ReturnedLoanItem[];
  onExplore?: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onExplore }) => {
  if (history.length === 0) {
    return (
      <EmptyState
        icon={<History className="w-5 h-5 text-grey" />}
        title="No circulation history yet"
        description="Returned books and completed loan cycles will appear here for your academic records."
        action={
          onExplore && (
            <button
              onClick={onExplore}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Search catalog for books
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="bg-white rounded-[6px] border border-rule overflow-hidden">
      <div className="p-3.5 bg-paper/60 border-b border-rule flex items-center justify-between text-xs text-grey">
        <span className="font-medium text-ink">
          Returned books ({history.length})
        </span>
        <span className="text-[11px]">Academic Year 2026</span>
      </div>

      <div className="divide-y divide-rule">
        {history.map((item) => {
          const returnedDate = new Date(item.returned_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div
              key={item.loan_id}
              className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-paper/40 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-[4px] overflow-hidden bg-paper border border-rule shrink-0">
                  {item.cover_url ? (
                    <img
                      src={item.cover_url}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale opacity-90"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-grey">
                      <BookOpen className="w-4 h-4 text-grey" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="font-serif font-semibold text-ink text-sm sm:text-base leading-snug line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-grey truncate mt-0.5">
                    {item.author} • Edition #{item.edition_no}
                  </p>
                  <p className="text-[11px] font-mono text-grey mt-1">
                    {item.accession_no}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="flex items-center gap-1.5 text-xs font-medium text-brand">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
                  <span>Returned</span>
                </div>
                <span className="text-[11px] text-grey font-tabular mt-0.5 block">
                  {returnedDate}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
