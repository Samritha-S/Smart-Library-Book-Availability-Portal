import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { my_loans, type LoanItem } from '@/features/loans/api';
import { DueRing } from '@/design/DueRing';
import { AnimatedNumber } from '@/design/AnimatedNumber';
import { Button } from '@/design/Button';
import { StatusBadge } from '@/design/StatusBadge';
import { EmptyState } from '@/design/EmptyState';
import { Skeleton } from '@/design/Skeleton';
import { BookCoverPlaceholder } from '@/components/BookCoverPlaceholder';
import { ShowQr } from '@/features/qr/ShowQr';
import {
  BookOpen,
  Search,
  Calendar,
  MapPin,
  QrCode,
  RotateCcw,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [showQr, setShowQr] = useState(false);

  // Live query for active loans with 15s polling, paused in background
  const {
    data: loans = [],
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['my_loans'],
    queryFn: () => my_loans(),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  // Calculate live seconds elapsed since last poll
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

  // Aggregate stats
  const overdueLoans = loans.filter((l) => l.status === 'overdue' || l.working_days_overdue > 0);
  const activeLoans = loans.filter((l) => l.status === 'active' && l.working_days_overdue === 0);
  const totalFines = loans.reduce((acc, l) => acc + (l.fine_amount || 0), 0);

  const formatDueDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Find priority loan for DueRing: overdue first, otherwise closest due date
  let priorityLoan: LoanItem | null = null;
  let ringDays = 0;
  let ringOverdue = false;
  let ringLabel = 'No loans';

  if (overdueLoans.length > 0) {
    priorityLoan = overdueLoans[0];
    ringDays = priorityLoan.working_days_overdue;
    ringOverdue = true;
    ringLabel = 'Days overdue';
  } else if (activeLoans.length > 0) {
    const sorted = [...activeLoans].sort((a, b) => a.working_days_left - b.working_days_left);
    priorityLoan = sorted[0];
    ringDays = priorityLoan.working_days_left;
    ringOverdue = false;
    ringLabel = priorityLoan.working_days_left <= 3 ? 'Due soon' : 'Days left';
  }

  return (
    <div className="space-y-6">
      {/* Editorial Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-rule">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">
            Hello, {user?.name.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-xs text-grey font-sans mt-0.5">
            {user?.department || 'Academic Member'} • Year {user?.year || '1'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-grey">
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

      {/* Main Content: Single column below 1024px, Two Columns at 1024px+ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ----------------------------------------------------------- */}
        {/* LEFT COLUMN (lg:col-span-5): DueRing & Due Summary          */}
        {/* ----------------------------------------------------------- */}
        <div className="lg:col-span-5 space-y-5">
          {/* DueRing Hero Card */}
          <div className="bg-white rounded-[12px] border border-rule p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[11px] font-medium text-grey uppercase tracking-wider mb-4">
              Return schedule
            </span>

            {isLoading ? (
              <div className="h-36 w-36 rounded-full border-4 border-rule border-t-brand animate-spin mb-4" />
            ) : (
              <div className="mb-4">
                <DueRing
                  daysLeft={ringDays}
                  totalDays={14}
                  overdue={ringOverdue}
                  label={ringLabel}
                  size={150}
                  strokeWidth={10}
                />
              </div>
            )}

            {/* Context Summary for Priority Loan */}
            {priorityLoan ? (
              <div className="space-y-1.5 w-full pt-3 border-t border-rule text-xs">
                <div className="font-serif font-semibold text-ink line-clamp-1">
                  {priorityLoan.title}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-grey">
                  <Calendar className="w-3.5 h-3.5 text-grey shrink-0" />
                  <span>
                    Due on <strong className="text-ink font-medium">{formatDueDate(priorityLoan.due_date)}</strong>
                  </span>
                </div>

                {ringOverdue && priorityLoan.fine_amount > 0 && (
                  <div className="text-alert font-mono font-semibold text-xs pt-1">
                    Fine accrued: ₹{priorityLoan.fine_amount.toFixed(2)}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-grey pt-2 border-t border-rule w-full">
                All borrowed books are returned.
              </div>
            )}

            {/* Quick Action: Open Contactless Pass */}
            <div className="w-full pt-4 mt-2">
              <Button
                variant="primary"
                className="w-full h-10 text-xs"
                onClick={() => setShowQr(true)}
                leftIcon={<QrCode className="w-4 h-4" strokeWidth={1.75} />}
              >
                Show student pass
              </Button>
            </div>
          </div>

          {/* Borrowing Statistics Summary */}
          <div className="bg-white rounded-[12px] border border-rule p-4 space-y-3">
            <h2 className="font-serif text-sm font-semibold text-ink">
              Borrowing summary
            </h2>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-[6px] bg-paper border border-rule">
                <span className="block font-serif text-lg font-bold text-brand tabular-nums">
                  <AnimatedNumber value={loans.length} />
                </span>
                <span className="text-[11px] text-grey leading-tight block mt-0.5">
                  Active
                </span>
              </div>

              <div className="p-2.5 rounded-[6px] bg-paper border border-rule">
                <span
                  className={`block font-serif text-lg font-bold tabular-nums ${
                    overdueLoans.length > 0 ? 'text-alert' : 'text-ink'
                  }`}
                >
                  <AnimatedNumber value={overdueLoans.length} />
                </span>
                <span className="text-[11px] text-grey leading-tight block mt-0.5">
                  Overdue
                </span>
              </div>

              <div className="p-2.5 rounded-[6px] bg-paper border border-rule">
                <span
                  className={`block font-serif text-lg font-bold tabular-nums ${
                    totalFines > 0 ? 'text-alert' : 'text-ink'
                  }`}
                >
                  ₹<AnimatedNumber value={totalFines} />
                </span>
                <span className="text-[11px] text-grey leading-tight block mt-0.5">
                  Fines
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-rule flex items-center justify-between text-xs">
              <span className="text-grey">Loan allowance</span>
              <span className="font-mono text-ink">3 books max</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* RIGHT COLUMN (lg:col-span-7): Active Borrowings List        */}
        {/* ----------------------------------------------------------- */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand" strokeWidth={1.75} />
              <h2 className="font-serif text-base font-bold text-ink">
                Active borrowings (<AnimatedNumber value={loans.length} />)
              </h2>
            </div>
            <Link
              to="/search"
              className="text-xs text-brand hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Browse catalog</span>
              <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 rounded-[12px] bg-white border border-rule space-y-3">
                  <div className="flex gap-3">
                    <Skeleton width="60px" height="80px" />
                    <div className="flex-1 space-y-2">
                      <Skeleton width="70%" height="16px" />
                      <Skeleton width="40%" height="12px" />
                      <Skeleton width="50%" height="12px" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-4 rounded-[12px] bg-[#fef2f2] border border-alert/30 text-alert text-xs flex items-center justify-between">
              <span>Failed to load active loan data.</span>
              <Button size="sm" variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : loans.length === 0 ? (
            <EmptyState
              title="No active book loans"
              description="Explore thousands of textbooks, references, and monographs available at the Central Library."
              action={
                <Link to="/search">
                  <Button size="sm" variant="primary">
                    Search catalog
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => {
                const isOverdue = loan.status === 'overdue' || loan.working_days_overdue > 0;
                const isDueSoon = !isOverdue && loan.working_days_left <= 3;

                return (
                  <div
                    key={loan.loan_id}
                    className="p-4 rounded-[12px] bg-white border border-rule hover:border-brand/40 transition-colors flex gap-4 items-start"
                  >
                    {/* Cover thumbnail */}
                    <div className="w-16 h-22 shrink-0 rounded-[6px] overflow-hidden border border-rule bg-paper">
                      {loan.cover_url ? (
                        <img
                          src={loan.cover_url}
                          alt={loan.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <BookCoverPlaceholder title={loan.title} author={loan.author} />
                      )}
                    </div>

                    {/* Loan Metadata */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <Link
                          to="/my-books"
                          className="font-serif font-bold text-sm text-ink hover:text-brand line-clamp-1 transition-colors"
                        >
                          {loan.title}
                        </Link>
                        <p className="text-xs text-grey line-clamp-1">
                          {loan.author} • Ed. {loan.edition_no}
                        </p>
                      </div>

                      <div className="space-y-1 text-xs text-grey">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-grey shrink-0" />
                          <span>
                            Due:{' '}
                            <strong className="text-ink font-medium tabular-nums">
                              {formatDueDate(loan.due_date)}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-grey shrink-0" />
                          <span className="text-ink">Accession No:</span>
                          <span className="text-grey font-semibold">({loan.accession_no})</span>
                        </div>
                      </div>

                      {/* Status and fines */}
                      <div className="pt-2 border-t border-rule flex items-center justify-between gap-2 flex-wrap">
                        {isOverdue ? (
                          <StatusBadge
                            status="overdue"
                            label={`${loan.working_days_overdue} days overdue`}
                            size="sm"
                          />
                        ) : isDueSoon ? (
                          <StatusBadge
                            status="due_soon"
                            label={`${loan.working_days_left} working days left`}
                            size="sm"
                          />
                        ) : (
                          <StatusBadge
                            status="available"
                            label={`${loan.working_days_left} working days left`}
                            size="sm"
                          />
                        )}

                        <div className="flex items-center gap-2">
                          {isOverdue && loan.fine_amount > 0 && (
                            <span className="text-xs font-mono font-bold text-alert tabular-nums">
                              Fine: ₹{loan.fine_amount.toFixed(2)}
                            </span>
                          )}

                          <span className="text-[11px] text-grey">
                            {loan.renewals_count}/{loan.max_renewals} renewals
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sheet: Contactless Student Pass */}
      <ShowQr
        open={showQr}
        onOpenChange={setShowQr}
        userId={user?.id || 'usr-001'}
        regNo={user?.reg_no || 'AIT2023CS001'}
        studentName={user?.name || 'Aarav Sharma'}
      />
    </div>
  );
};

export default HomePage;
