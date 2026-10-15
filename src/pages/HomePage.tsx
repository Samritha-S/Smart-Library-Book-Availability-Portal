import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getStudentActiveLoans } from '@/lib/supabase';
import { WorkingDaysDueRing } from '@/components/WorkingDaysDueRing';
import { BookCoverPlaceholder } from '@/components/BookCoverPlaceholder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id || '30000000-0000-0000-0000-000000000001';

  // Live query for active loans with 15s polling, paused in background
  const {
    data: loans = [],
    isLoading,
    isError,
    refetch,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['student_loans', studentId],
    queryFn: () => getStudentActiveLoans(studentId),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  // Calculate seconds ago for live feel
  const [secondsAgo, setSecondsAgo] = React.useState(0);
  React.useEffect(() => {
    setSecondsAgo(0);
    const interval = setInterval(() => {
      if (dataUpdatedAt) {
        setSecondsAgo(Math.floor((Date.now() - dataUpdatedAt) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  // Find nearest due loan (loans are sorted by due_date ASC)
  const nearestLoan = loans.length > 0 ? loans[0] : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Hello, {user?.name.split(' ')[0] || 'Student'} 👋
          </h2>
          <p className="text-xs text-slate-500">
            {user?.department || 'Academic Portal'} • Year {user?.year || '1'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>Updated {secondsAgo}s ago</span>
        </div>
      </div>

      {/* Working Days Due Ring */}
      {isLoading ? (
        <div className="h-56 rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-xs">
          Loading loan schedule...
        </div>
      ) : isError ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <span>Failed to load active loan data.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <WorkingDaysDueRing nearestLoan={nearestLoan} />
      )}

      {/* Active Loans Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              My Active Borrowings ({loans.length})
            </h3>
          </div>
          <Link
            to="/search"
            className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
          >
            Find Books
            <Search className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loans.length === 0 ? (
          <div className="p-6 bg-white rounded-xl border border-slate-200 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
              <Sparkles className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                You have no active book loans
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Explore thousands of copies in the central library collection.
              </p>
            </div>
            <Link to="/search">
              <Button size="sm" className="mt-2">
                Browse Book Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => {
              const isOverdue = loan.is_overdue;
              const daysDiff = loan.working_days_diff;

              let badgeVariant: 'default' | 'secondary' | 'destructive' = 'default';
              let badgeText = `${daysDiff} working days left`;
              if (isOverdue) {
                badgeVariant = 'destructive';
                badgeText = `${daysDiff} days overdue`;
              } else if (daysDiff <= 3) {
                badgeVariant = 'secondary';
                badgeText = `${daysDiff} working days left`;
              }

              return (
                <div
                  key={loan.loan_id}
                  className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-sm hover:border-teal-300 transition-all flex gap-3.5"
                >
                  {/* Book Cover */}
                  <div className="w-16 h-22 shrink-0 rounded-lg overflow-hidden border border-slate-200/80 bg-slate-100 shadow-xs">
                    {loan.cover_url ? (
                      <img
                        src={loan.cover_url}
                        alt={loan.book_title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <BookCoverPlaceholder title={loan.book_title} author={loan.book_author} />
                    )}
                  </div>

                  {/* Loan Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          to={`/work/${loan.work_id}`}
                          className="font-semibold text-sm text-slate-900 hover:text-teal-700 line-clamp-1 transition-colors"
                        >
                          {loan.book_title}
                        </Link>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {loan.book_author} • Ed. {loan.edition_no}
                      </p>
                    </div>

                    <div className="space-y-1.5 my-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Due: <strong className="text-slate-800">{loan.due_date}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-700">{loan.shelf_location}</span>
                        <span className="text-slate-400">({loan.accession_no})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <Badge variant={badgeVariant} className="text-[10px] font-semibold py-0.5 px-2">
                        {isOverdue ? (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            {badgeText}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {badgeText}
                          </span>
                        )}
                      </Badge>

                      {isOverdue && loan.computed_fine > 0 && (
                        <span className="text-[11px] font-bold text-rose-600">
                          Fine: ₹{loan.computed_fine.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
