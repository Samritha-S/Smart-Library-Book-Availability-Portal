import React, { useState } from 'react';
import { Button, StatusBadge, DueRing, AnimatedNumber, toast } from '../_local';
import {
  Calendar,
  RotateCw,
  AlertOctagon,
  AlertCircle,
  FileText,
  BookmarkCheck,
  ShieldAlert,
} from 'lucide-react';
import type { LoanItem } from '../mock/types';
import { renew_loan } from './api';
import { ScheduleReturnSheet } from './ScheduleReturnSheet';
import { ReportLostDialog } from './ReportLostDialog';

interface LoanDetailCardProps {
  loan: LoanItem | null;
  onUpdate?: () => void;
}

export const LoanDetailCard: React.FC<LoanDetailCardProps> = ({ loan, onUpdate }) => {
  const [isRenewing, setIsRenewing] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isReportLostOpen, setIsReportLostOpen] = useState(false);

  if (!loan) {
    return (
      <div className="h-full min-h-[380px] rounded-[12px] border border-dashed border-rule bg-white flex flex-col items-center justify-center p-8 text-center">
        <FileText className="w-10 h-10 text-grey/50 mb-3" />
        <h4 className="font-serif font-semibold text-ink text-base">
          No loan selected
        </h4>
        <p className="text-xs text-grey max-w-xs mt-1 leading-normal">
          Select a borrowed book from the list on the left to view loan terms, due schedule, and renewal actions.
        </p>
      </div>
    );
  }

  const isOverdue = loan.status === 'overdue' || loan.working_days_overdue > 0;
  const isLost = loan.status === 'lost';

  const formattedDueDate = new Date(loan.due_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedIssueDate = new Date(loan.issued_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate refusal reason if any
  let refusalReason = '';
  if (isOverdue) refusalReason = 'Overdue books cannot be renewed';
  else if (loan.has_hold_queue) refusalReason = 'Someone is waiting for this book';
  else if (loan.renewals_count >= loan.max_renewals) refusalReason = `You have used ${loan.renewals_count} of ${loan.max_renewals} renewals`;

  const handleRenew = async () => {
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
      toast.error('Renewal failed: Could not connect to service');
    } finally {
      setIsRenewing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-[12px] border border-rule overflow-hidden shadow-sm sticky top-4 flex flex-col">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-rule bg-paper/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-brand" />
            <span className="text-xs font-semibold uppercase tracking-wider text-grey">
              Loan detail & actions
            </span>
          </div>
          <div>
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

        {/* Book overview & DueRing */}
        <div className="p-6 border-b border-rule flex items-start gap-5">
          <div className="w-20 h-28 rounded-[6px] overflow-hidden bg-paper border border-rule shrink-0 shadow-sm">
            {loan.cover_url ? (
              <img
                src={loan.cover_url}
                alt={loan.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-grey">
                <FileText className="w-8 h-8 text-grey" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-bold text-ink leading-snug">
              {loan.title}
            </h3>
            <p className="text-xs text-grey mt-1 font-sans">
              by <span className="text-ink font-medium">{loan.author}</span>
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-grey">
              <span className="font-mono bg-paper px-2 py-0.5 rounded border border-rule text-ink font-medium">
                {loan.accession_no}
              </span>
              <span>Edition #{loan.edition_no}</span>
            </div>
          </div>

          {/* Prominent SVG DueRing */}
          <div className="shrink-0 flex flex-col items-center">
            <DueRing
              daysLeft={loan.working_days_left}
              isOverdue={isOverdue}
              overdueDays={loan.working_days_overdue}
              size={64}
              strokeWidth={5}
            />
          </div>
        </div>

        {/* Due & Fine Status Breakdown */}
        <div className="p-6 space-y-4 flex-1">
          {isOverdue && (
            <div className="p-3.5 bg-[#fef2f2] border border-alert/30 rounded-[6px] flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-alert shrink-0 mt-0.5" />
              <div className="text-xs text-ink leading-relaxed">
                <div className="font-semibold text-alert flex items-center justify-between">
                  <span>Overdue by {loan.working_days_overdue} working days</span>
                  <span className="tabular-nums font-bold text-sm">
                    Fine: ₹{loan.fine_amount}
                  </span>
                </div>
                <p className="text-grey mt-1">
                  Overdue items freeze renewals and hold requests across your account. Return book or report lost to halt further daily charges.
                </p>
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-paper rounded-[6px] border border-rule text-xs">
            <div>
              <span className="text-grey text-[11px] block">Issued date</span>
              <span className="font-medium text-ink tabular-nums">{formattedIssueDate}</span>
            </div>
            <div>
              <span className="text-grey text-[11px] block">Due date</span>
              <span className={`font-semibold tabular-nums ${isOverdue ? 'text-alert' : 'text-ink'}`}>
                {formattedDueDate}
              </span>
            </div>
            <div>
              <span className="text-grey text-[11px] block">Renewals used</span>
              <span className="font-medium text-ink tabular-nums">
                <AnimatedNumber value={loan.renewals_count} /> of {loan.max_renewals}
              </span>
            </div>
            <div>
              <span className="text-grey text-[11px] block">Working days left</span>
              <span className={`font-semibold tabular-nums ${isOverdue ? 'text-alert' : 'text-brand'}`}>
                {isOverdue ? `-${loan.working_days_overdue}` : loan.working_days_left}
              </span>
            </div>
          </div>

          {loan.scheduled_return_date && (
            <div className="p-3 bg-[#f0fdfa] border border-brand/30 rounded-[6px] flex items-center justify-between text-xs text-brand font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand" />
                <span>Return scheduled for:</span>
              </span>
              <span className="font-semibold tabular-nums text-ink">
                {loan.scheduled_return_date}
              </span>
            </div>
          )}

          {/* Refusal Reason banner if renewal disabled */}
          {refusalReason && !isLost && (
            <div className="p-2.5 bg-paper border border-rule rounded-[6px] flex items-center gap-2 text-xs text-grey">
              <AlertCircle className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>{refusalReason}</span>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="p-6 border-t border-rule bg-paper/30 flex items-center gap-2.5">
          {!isLost ? (
            <>
              <Button
                variant="primary"
                size="md"
                onClick={handleRenew}
                loading={isRenewing}
                disabled={Boolean(refusalReason)}
                leftIcon={<RotateCw className="w-4 h-4" />}
                className="flex-1"
              >
                Renew
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsScheduleOpen(true)}
                leftIcon={<Calendar className="w-4 h-4" />}
                className="flex-1"
              >
                Schedule return
              </Button>

              <Button
                variant="ghost"
                size="md"
                onClick={() => setIsReportLostOpen(true)}
                leftIcon={<AlertOctagon className="w-4 h-4 text-alert" />}
                className="text-alert hover:bg-alert/10 shrink-0"
              >
                Report lost
              </Button>
            </>
          ) : (
            <div className="w-full text-center py-1 text-xs text-grey font-medium">
              Reported lost • Visit front desk to pay fee or supply replacement book
            </div>
          )}
        </div>
      </div>

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
