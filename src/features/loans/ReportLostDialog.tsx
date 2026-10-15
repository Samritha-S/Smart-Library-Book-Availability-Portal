import React, { useState } from 'react';
import { Dialog, Button, toast } from '../_local';
import { AlertTriangle, BookCheck, CreditCard, ShieldCheck } from 'lucide-react';
import type { LoanItem } from '../mock/types';
import { report_lost } from './api';

interface ReportLostDialogProps {
  loan: LoanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onReported?: (loan: LoanItem) => void;
}

export const ReportLostDialog: React.FC<ReportLostDialogProps> = ({
  loan,
  isOpen,
  onClose,
  onReported,
}) => {
  const [resolutionChoice, setResolutionChoice] = useState<'pay_fee' | 'replace_book'>('pay_fee');
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loan) return null;

  const handleReport = async () => {
    if (!hasConfirmed) return;
    setIsSubmitting(true);
    try {
      const res = await report_lost(loan.loan_id, resolutionChoice);
      if (res.success && res.loan) {
        toast.success('Reported: Book marked as lost. Fines have halted.');
        if (onReported) onReported(res.loan);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Report book as lost"
      description={`Circulation record for "${loan.title}"`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Banner about fines halting */}
        <div className="p-3.5 bg-[#fef2f2] border border-alert/30 rounded-[6px] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-alert shrink-0 mt-0.5" />
          <div className="text-xs text-ink leading-relaxed">
            <p className="font-semibold text-alert">
              Fines stop accumulating on the report date
            </p>
            <p className="text-grey mt-0.5">
              Once reported, overdue day charges freeze immediately. You can resolve the circulation hold through either of the two standard library policies below.
            </p>
          </div>
        </div>

        {/* Resolution Options */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-ink block">
            Select your preferred resolution method:
          </span>

          <label
            className={`flex items-start gap-3 p-3 rounded-[6px] border cursor-pointer transition-colors ${
              resolutionChoice === 'pay_fee'
                ? 'border-brand bg-[#f0fdfa]/60 text-ink'
                : 'border-rule hover:bg-paper text-grey'
            }`}
          >
            <input
              type="radio"
              name="resolution"
              checked={resolutionChoice === 'pay_fee'}
              onChange={() => setResolutionChoice('pay_fee')}
              className="mt-0.5 text-brand focus:ring-brand"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-medium text-xs text-ink">
                <CreditCard className="w-3.5 h-3.5 text-brand" />
                <span>Option 1: Pay the replacement fee</span>
              </div>
              <p className="text-[11px] text-grey leading-normal">
                Standard institutional replacement fee + ₹100 processing charge. Payable at the library circulation desk or online fee ledger.
              </p>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-3 rounded-[6px] border cursor-pointer transition-colors ${
              resolutionChoice === 'replace_book'
                ? 'border-brand bg-[#f0fdfa]/60 text-ink'
                : 'border-rule hover:bg-paper text-grey'
            }`}
          >
            <input
              type="radio"
              name="resolution"
              checked={resolutionChoice === 'replace_book'}
              onChange={() => setResolutionChoice('replace_book')}
              className="mt-0.5 text-brand focus:ring-brand"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-medium text-xs text-ink">
                <BookCheck className="w-3.5 h-3.5 text-brand" />
                <span>Option 2: Replace with the same book</span>
              </div>
              <p className="text-[11px] text-grey leading-normal">
                Provide an original copy in new condition matching edition #{loan.edition_no} or higher. Hand over directly to the head librarian.
              </p>
            </div>
          </label>
        </div>

        {/* Mandatory explicit confirm */}
        <div className="pt-2 border-t border-rule">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              id="confirm-report-lost"
              checked={hasConfirmed}
              onChange={(e) => setHasConfirmed(e.target.checked)}
              className="mt-0.5 rounded text-brand focus:ring-brand h-4 w-4 border-rule"
            />
            <span className="text-xs text-ink font-medium leading-relaxed">
              I confirm that I have searched thoroughly and request to mark accession <span className="font-mono text-brand font-semibold">{loan.accession_no}</span> as lost under my student account.
            </span>
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleReport}
            disabled={!hasConfirmed || isSubmitting}
            loading={isSubmitting}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Confirm report lost
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
