import React, { useState } from 'react';
import { Button, StatusBadge, DueRing, toast } from '../_local';
import {
  Calendar,
  RotateCw,
  AlertOctagon,
  ChevronDown,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { LoanItem } from '../mock/types';
import { renew_loan } from './api';
import { ScheduleReturnSheet } from './ScheduleReturnSheet';
import { ReportLostDialog } from './ReportLostDialog';

interface LoanRowProps {
  loan: LoanItem;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: () => void;
  isDesktop?: boolean;
}

export const LoanRow: React.FC<LoanRowProps> = ({
  loan,
  isSelected = false,
  onSelect,
  onUpdate,
  isDesktop = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isReportLostOpen, setIsReportLostOpen] = useState(false);

  const isOverdue = loan.status === 'overdue' || loan.working_days_overdue > 0;
  const isLost = loan.status === 'lost';

  // Format due date in readable sentence-case style
  const formattedDueDate = new Date(loan.due_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleRenew = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenewing(true);

    try {
      const res = await renew_loan(loan.loan_id);
      if (res.success) {
        toast.success('Renewed: Due date extended by 14 days');
        if (onUpdate) onUpdate();
      } else {
        toast.error(`Renewal refused: ${res.reason || 'Not permitted'}`);
      }
    } catch {
      toast.error('Renewal failed: Could not connect to library service');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleRowClick = () => {
    if (isDesktop && onSelect) {
      onSelect();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <>
      <div
        className={`border-b border-rule transition-colors select-none ${
          isDesktop && isSelected
            ? 'bg-[#f0fdfa] border-l-2 border-l-brand'
            : isOverdue
            ? 'bg-[#fff5f5]/50 hover:bg-[#fff5f5]'
            : 'bg-white hover:bg-paper'
        }`}
      >
        <div
          onClick={handleRowClick}
          className="p-3.5 sm:p-4 cursor-pointer flex items-start gap-3 sm:gap-4"
        >
          {/* Cover Thumbnail */}
          <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-[4px] overflow-hidden bg-paper border border-rule shrink-0 relative">
            {loan.cover_url ? (
              <img
                src={loan.cover_url}
                alt={loan.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-grey">
                <FileText className="w-5 h-5 text-grey" />
              </div>
            )}
            {/* Small status indicator ribbon on thumbnail */}
            {isOverdue && (
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-alert rounded-bl-[4px]" />
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-serif font-semibold text-ink text-sm sm:text-base leading-snug line-clamp-1">
                {loan.title}
              </h4>
              <div className="shrink-0 flex items-center gap-1.5">
                {isLost ? (
                  <StatusBadge status="unavailable" label="Reported lost" />
                ) : isOverdue ? (
                  <StatusBadge status="overdue" label="Overdue" />
                ) : loan.working_days_left <= 3 ? (
                  <StatusBadge status="due_soon" label="Due soon" />
                ) : (
                  <StatusBadge status="available" label="Active loan" />
                )}
              </div>
            </div>

            <p className="text-xs text-grey font-sans truncate mt-0.5">
              {loan.author} • Edition #{loan.edition_no}
            </p>

            {/* Overdue Alert details or Due date */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {isOverdue ? (
                <div className="flex items-center gap-1.5 text-alert font-semibold tabular-nums">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {loan.working_days_overdue} working days overdue • Fine: ₹{loan.fine_amount}
                  </span>
                </div>
              ) : isLost ? (
                <span className="text-grey text-xs">
                  Fines frozen • Awaiting resolution
                </span>
              ) : (
                <div className="flex items-center gap-1.5 text-grey tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-grey shrink-0" />
                  <span>
                    Due {formattedDueDate} (
                    <span className="font-semibold text-ink">
                      {loan.working_days_left} working days left
                    </span>
                    )
                  </span>
                </div>
              )}

              {loan.scheduled_return_date && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand bg-brand/10 px-1.5 py-0.5 rounded-[4px]">
                  <Calendar className="w-3 h-3" />
                  Scheduled {loan.scheduled_return_date}
                </span>
              )}
            </div>
          </div>

          {/* Right-hand DueRing stamp or expand arrow */}
          <div className="shrink-0 flex items-center gap-2 self-center">
            {!isDesktop && (
              <DueRing
                daysLeft={loan.working_days_left}
                isOverdue={isOverdue}
                overdueDays={loan.working_days_overdue}
                size={40}
                strokeWidth={3.5}
              />
            )}
            <ChevronDown
              className={`w-4 h-4 text-grey transition-transform duration-200 ${
                isExpanded ? 'rotate-180 text-brand' : ''
              } ${isDesktop ? 'hidden' : 'block'}`}
            />
          </div>
        </div>

        {/* In-place Expandable Actions (Active on Mobile/Tablet) */}
        {!isDesktop && isExpanded && (
          <div className="px-4 pb-4 pt-1 bg-paper/60 border-t border-rule space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs text-grey pt-1">
              <div>
                <span className="block text-[10px] text-grey uppercase tracking-wider">
                  Accession
                </span>
                <span className="font-mono text-ink font-semibold">
                  {loan.accession_no}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-grey uppercase tracking-wider">
                  Renewals used
                </span>
                <span className="text-ink font-semibold tabular-nums">
                  {loan.renewals_count} of {loan.max_renewals}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {!isLost ? (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rule">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRenew}
                  loading={isRenewing}
                  leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                  disabled={isOverdue || loan.renewals_count >= loan.max_renewals}
                  title={
                    isOverdue
                      ? 'Overdue books cannot be renewed'
                      : loan.renewals_count >= loan.max_renewals
                      ? 'You have used 2 of 2 renewals'
                      : 'Renew loan by 14 days'
                  }
                >
                  Renew
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsScheduleOpen(true);
                  }}
                  leftIcon={<Calendar className="w-3.5 h-3.5" />}
                >
                  Schedule return
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReportLostOpen(true);
                  }}
                  leftIcon={<AlertOctagon className="w-3.5 h-3.5 text-alert" />}
                  className="text-alert hover:bg-alert/10 ml-auto"
                >
                  Report lost
                </Button>
              </div>
            ) : (
              <div className="p-2.5 bg-paper border border-rule rounded-[6px] text-xs text-grey">
                Reported lost on {new Date().toLocaleDateString()}. Fines stopped. Please visit front desk with resolution.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sheets & Dialogs */}
      <ScheduleReturnSheet
        loan={loan}
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onScheduled={onUpdate}
      />

      <ReportLostDialog
        loan={loan}
        isOpen={isReportLostOpen}
        onClose={() => setIsReportLostOpen(false)}
        onReported={onUpdate}
      />
    </>
  );
};
