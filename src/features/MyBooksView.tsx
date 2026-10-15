import React, { useState, useEffect } from 'react';
import { mockStorage } from './mock/storage';
import type { LoanItem, HoldItem, ReturnedLoanItem } from './mock/types';
import { LoanRow } from './loans/LoanRow';
import { LoanDetailCard } from './loans/LoanDetailCard';
import { HoldRow } from './holds/HoldRow';
import { HistoryList } from './loans/HistoryList';
import { NotificationBell } from './notifications/NotificationBell';
import { EmptyState, Button, Toaster } from './_local';
import { BookOpen, Bookmark, RotateCcw, Search } from 'lucide-react';

export type MyBooksTab = 'borrowed' | 'holds' | 'history';

interface MyBooksViewProps {
  onSearchClick?: () => void;
  className?: string;
}

export const MyBooksView: React.FC<MyBooksViewProps> = ({
  onSearchClick,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<MyBooksTab>('borrowed');
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [holds, setHolds] = useState<HoldItem[]>([]);
  const [history, setHistory] = useState<ReturnedLoanItem[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  // Sync state with mockStorage
  const loadData = () => {
    const currentLoans = [...mockStorage.getLoans()];
    const currentHolds = [...mockStorage.getHolds()];
    const currentHistory = [...mockStorage.getHistory()];

    setLoans(currentLoans);
    setHolds(currentHolds);
    setHistory(currentHistory);

    // Default select first loan if none selected or deleted
    if (!selectedLoanId && currentLoans.length > 0) {
      setSelectedLoanId(currentLoans[0].loan_id);
    } else if (
      selectedLoanId &&
      !currentLoans.some((l) => l.loan_id === selectedLoanId)
    ) {
      setSelectedLoanId(currentLoans[0]?.loan_id || null);
    }
  };

  useEffect(() => {
    loadData();
    return mockStorage.subscribe(loadData);
  }, []);

  const selectedLoan = loans.find((l) => l.loan_id === selectedLoanId) || null;

  // Tab counts
  const borrowedCount = loans.length;
  const holdsCount = holds.length;
  const historyCount = history.length;

  return (
    <div className={`min-h-screen bg-paper text-ink font-sans ${className}`}>
      {/* Toast container */}
      <Toaster />

      {/* Top Bar / Header */}
      <header className="border-b border-rule bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-ink leading-tight">
              My books
            </h1>
            <p className="text-xs text-grey font-sans mt-0.5">
              Circulation loans, reserve holds, and reading history
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => mockStorage.reset()}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              title="Reset mock data to initial believable state"
              className="text-grey hover:text-ink hidden sm:inline-flex"
            >
              Reset mock
            </Button>

            <NotificationBell onNavigateTab={(tab) => setActiveTab(tab)} />
          </div>
        </div>

        {/* Tab Navigation (Mobile-first, sentence-case, tabular figures) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 border-t border-rule/60 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('borrowed')}
            className={`py-3 px-3.5 border-b-2 text-xs font-medium transition-colors flex items-center gap-2 shrink-0 select-none ${
              activeTab === 'borrowed'
                ? 'border-brand text-brand font-semibold'
                : 'border-transparent text-grey hover:text-ink'
            }`}
          >
            <span>Borrowed</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-tabular ${
                activeTab === 'borrowed'
                  ? 'bg-brand/10 text-brand'
                  : 'bg-paper text-grey'
              }`}
            >
              {borrowedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('holds')}
            className={`py-3 px-3.5 border-b-2 text-xs font-medium transition-colors flex items-center gap-2 shrink-0 select-none ${
              activeTab === 'holds'
                ? 'border-brand text-brand font-semibold'
                : 'border-transparent text-grey hover:text-ink'
            }`}
          >
            <span>Holds</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-tabular ${
                activeTab === 'holds'
                  ? 'bg-brand/10 text-brand'
                  : 'bg-paper text-grey'
              }`}
            >
              {holdsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3.5 border-b-2 text-xs font-medium transition-colors flex items-center gap-2 shrink-0 select-none ${
              activeTab === 'history'
                ? 'border-brand text-brand font-semibold'
                : 'border-transparent text-grey hover:text-ink'
            }`}
          >
            <span>History</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-tabular ${
                activeTab === 'history'
                  ? 'bg-brand/10 text-brand'
                  : 'bg-paper text-grey'
              }`}
            >
              {historyCount}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area: Responsive Mobile-first (360px) to Desktop (1024px+) */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'borrowed' && (
          <div>
            {loans.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="w-5 h-5 text-grey" />}
                title="No borrowed books right now"
                description="Search the library catalog to find course textbooks and request copies."
                action={
                  onSearchClick ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onSearchClick}
                      leftIcon={<Search className="w-4 h-4" />}
                    >
                      Browse catalog
                    </Button>
                  ) : null
                }
              />
            ) : (
              /* Desktop Layout: 1024px and up becomes two columns */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Loan list (full width on mobile, 7 cols on desktop) */}
                <div className="lg:col-span-7 bg-white rounded-[12px] border border-rule overflow-hidden shadow-sm">
                  <div className="p-3.5 bg-paper/60 border-b border-rule flex items-center justify-between text-xs text-grey">
                    <span className="font-semibold text-ink">
                      Active circulation loans
                    </span>
                    <span className="text-[11px] hidden lg:inline-block">
                      Select a book to manage on the right
                    </span>
                  </div>

                  <div className="divide-y divide-rule">
                    {loans.map((loan) => (
                      <LoanRow
                        key={loan.loan_id}
                        loan={loan}
                        isSelected={selectedLoanId === loan.loan_id}
                        onSelect={() => setSelectedLoanId(loan.loan_id)}
                        onUpdate={loadData}
                        isDesktop={typeof window !== 'undefined' && window.innerWidth >= 1024}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Column (Desktop 1024px and up): Selected Loan Detail & Actions */}
                <div className="hidden lg:block lg:col-span-5">
                  <LoanDetailCard loan={selectedLoan} onUpdate={loadData} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'holds' && (
          <div className="max-w-3xl">
            {holds.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="w-5 h-5 text-grey" />}
                title="No active holds in queue"
                description="When a required book is checked out, you can place a hold to reserve the next available copy."
                action={
                  onSearchClick ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onSearchClick}
                      leftIcon={<Search className="w-4 h-4" />}
                    >
                      Search for books to hold
                    </Button>
                  ) : null
                }
              />
            ) : (
              <div className="bg-white rounded-[12px] border border-rule overflow-hidden shadow-sm">
                <div className="p-3.5 bg-paper/60 border-b border-rule flex items-center justify-between text-xs text-grey">
                  <span className="font-semibold text-ink">
                    Reserved queue & ready pickups ({holds.length})
                  </span>
                  <span className="text-[11px]">Front circulation desk</span>
                </div>

                <div className="divide-y divide-rule">
                  {holds.map((hold) => (
                    <HoldRow key={hold.hold_id} hold={hold} onUpdate={loadData} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl">
            <HistoryList history={history} onExplore={onSearchClick} />
          </div>
        )}
      </main>
    </div>
  );
};
