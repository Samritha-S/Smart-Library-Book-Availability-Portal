import React from 'react';
import type { StudentLoan } from '@/types/database';
import { BookCheck, AlertCircle, Clock } from 'lucide-react';

interface WorkingDaysDueRingProps {
  nearestLoan: StudentLoan | null;
}

export const WorkingDaysDueRing: React.FC<WorkingDaysDueRingProps> = ({ nearestLoan }) => {
  // SVG Dimensions
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (!nearestLoan) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#0d9488"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={0}
              strokeLinecap="round"
              fill="transparent"
              className="opacity-20"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-1 border border-teal-200">
              <BookCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">No books due</span>
            <span className="text-[11px] text-slate-500 mt-0.5">All clear for now</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3 text-center">
          You currently have no active checkouts. Search catalog to borrow books.
        </p>
      </div>
    );
  }

  const { is_overdue, working_days_diff, due_date } = nearestLoan;

  // Determine styling based on working days remaining
  // Rules: Teal > 3 days, Amber 1-3 days, Red when overdue
  let color = '#0d9488'; // Teal
  let trackColor = '#ccfbf1';
  let badgeText = 'Working days left';
  let statusText = 'On Schedule';
  let textColorClass = 'text-teal-700';
  let badgeClass = 'bg-teal-50 text-teal-800 border-teal-200';

  if (is_overdue) {
    color = '#e11d48'; // Red / Rose
    trackColor = '#ffe4e6';
    badgeText = 'Days overdue';
    statusText = 'Overdue Alert';
    textColorClass = 'text-rose-600';
    badgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (working_days_diff <= 3) {
    color = '#d97706'; // Warm Amber
    trackColor = '#fef3c7';
    badgeText = 'Working days left';
    statusText = 'Due Soon';
    textColorClass = 'text-amber-600';
    badgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
  }

  // Calculate arc percentage: based on standard 14 working day loan period
  const progressRatio = is_overdue
    ? 1.0
    : Math.max(0.08, Math.min(1.0, working_days_diff / 14));
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden">
      {/* Decorative top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Nearest Due Date
        </span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}>
          {statusText}
        </span>
      </div>

      <div className="relative flex items-center justify-center my-1" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Central Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          {is_overdue ? (
            <AlertCircle className="w-5 h-5 text-rose-600 mb-1 animate-pulse" />
          ) : (
            <Clock className="w-5 h-5 text-slate-400 mb-1" />
          )}
          <span className={`text-4xl font-extrabold tracking-tight ${textColorClass}`}>
            {working_days_diff}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 max-w-[100px] leading-tight">
            {badgeText}
          </span>
        </div>
      </div>

      {/* Due date and book details preview */}
      <div className="mt-4 pt-3 border-t border-slate-100 w-full text-center">
        <p className="text-xs text-slate-600">
          Due by: <strong className="text-slate-900 font-semibold">{due_date}</strong> (Excl. Sundays & Holidays)
        </p>
        <p className="text-xs font-medium text-teal-800 line-clamp-1 mt-0.5">
          {nearestLoan.book_title}
        </p>
      </div>
    </div>
  );
};
