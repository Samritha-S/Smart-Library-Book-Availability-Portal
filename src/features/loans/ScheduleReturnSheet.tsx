import React, { useState } from 'react';
import { Sheet, Button, toast } from '../_local';
import { Calendar as CalendarIcon, AlertCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { INITIAL_HOLIDAYS } from '../mock/data';
import type { LoanItem } from '../mock/types';
import { schedule_return } from './api';

interface ScheduleReturnSheetProps {
  loan: LoanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onScheduled?: (date: string) => void;
}

export const ScheduleReturnSheet: React.FC<ScheduleReturnSheetProps> = ({
  loan,
  isOpen,
  onClose,
  onScheduled,
}) => {
  // Calendar state starting in October 2026
  const currentYear = 2026;
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-22');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loan) return null;

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 9) return; // don't go before October 2026
    setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth >= 11) return;
    setCurrentMonth((m) => m + 1);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar dates generation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${currentYear}-${mm}-${dd}`;
    const dayOfWeek = new Date(currentYear, currentMonth, d).getDay();
    const isSunday = dayOfWeek === 0;
    const holiday = INITIAL_HOLIDAYS.find((h) => h.date === dateStr);
    const isPast = new Date(currentYear, currentMonth, d) < new Date(2026, 9, 15);

    days.push({
      day: d,
      dateStr,
      isSunday,
      isHoliday: Boolean(holiday),
      holidayName: holiday?.name,
      isPast,
      isDisabled: isSunday || Boolean(holiday) || isPast,
    });
  }

  const handleConfirm = async () => {
    if (!selectedDate) return;
    setIsSubmitting(true);
    try {
      const res = await schedule_return(loan.loan_id, selectedDate);
      if (res.success) {
        toast.success(`Scheduled: Return reminder set for ${selectedDate}`);
        if (onScheduled) onScheduled(selectedDate);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule return reminder"
      description={`Plan your drop-off for "${loan.title}"`}
    >
      <div className="space-y-4">
        {/* Strict required legal/policy copy */}
        <div className="p-3 bg-paper border border-rule rounded-[6px] flex items-start gap-2.5 text-xs text-grey">
          <AlertCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-ink">Please note:</span> This is only a reminder. Your return counts when the librarian scans the book.
          </p>
        </div>

        {/* Calendar Card */}
        <div className="border border-rule rounded-[6px] p-3 bg-white">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-rule">
            <div className="flex items-center gap-1.5 font-serif font-semibold text-ink text-sm">
              <CalendarIcon className="w-4 h-4 text-brand" />
              <span>{monthNames[currentMonth]} {currentYear}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                disabled={currentMonth <= 9}
                className="p-1 rounded-[4px] text-grey hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                disabled={currentMonth >= 11}
                className="p-1 rounded-[4px] text-grey hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-grey uppercase tracking-wider mb-1">
            <span className="text-alert/80">Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs tabular-nums">
            {days.map((item, index) => {
              if (!item) {
                return <div key={`empty-${index}`} className="h-8" />;
              }

              const isSelected = selectedDate === item.dateStr;

              return (
                <button
                  key={item.dateStr}
                  type="button"
                  disabled={item.isDisabled}
                  onClick={() => setSelectedDate(item.dateStr)}
                  title={
                    item.isSunday
                      ? 'Library closed on Sundays'
                      : item.isHoliday
                      ? `Library closed: ${item.holidayName}`
                      : item.isPast
                      ? 'Past date'
                      : item.dateStr
                  }
                  className={`h-8 rounded-[4px] flex flex-col items-center justify-center relative font-medium transition-colors select-none ${
                    isSelected
                      ? 'bg-brand text-white font-bold ring-2 ring-brand ring-offset-1'
                      : item.isDisabled
                      ? 'text-grey/40 bg-paper/60 cursor-not-allowed line-through'
                      : 'text-ink hover:bg-brand/10 hover:text-brand'
                  }`}
                >
                  <span>{item.day}</span>
                  {item.isHoliday && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-alert" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-rule text-[11px] text-grey flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-alert shrink-0" />
              <span>Library holidays & Sundays are closed</span>
            </span>
            <span className="tabular-nums text-ink font-semibold">
              Selected: {selectedDate}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleConfirm}
            loading={isSubmitting}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Confirm schedule
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
