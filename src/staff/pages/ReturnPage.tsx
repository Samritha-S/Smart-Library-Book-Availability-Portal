import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  CornerDownLeft,
  BookOpen,
} from 'lucide-react';
import {
  Button,
  Input,
  StatusBadge,
  ErrorState,
} from '../_local';
import {
  return_copy,
  mark_fine_paid,
  ReturnCopyResult,
} from '../api';

interface ReturnedSessionItem extends ReturnCopyResult {
  session_id: string;
}

const getQueryParam = (key: string): string => {
  const hashParts = window.location.hash.split('?');
  const search = hashParts[1] || window.location.search.substring(1);
  return new URLSearchParams(search).get(key) || '';
};

export const ReturnPage: React.FC = () => {
  const [accessionInput, setAccessionInput] = useState(() => getQueryParam('scan'));
  const [isLoading, setIsLoading] = useState(false);
  const [lastReturned, setLastReturned] = useState<ReturnCopyResult | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ message: string; fix: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sessionList, setSessionList] = useState<ReturnedSessionItem[]>([]);
  const [paidLoanIds, setPaidLoanIds] = useState<Set<string>>(new Set());
  const [isPayingFine, setIsPayingFine] = useState(false);

  const handleMarkPaid = async (loanId: string, amount: number) => {
    setIsPayingFine(true);
    try {
      await mark_fine_paid(loanId, amount);
      setPaidLoanIds((prev) => new Set(prev).add(loanId));
      setToastMessage(`Fine ₹${amount} marked as paid successfully at desk.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: unknown) {
      console.warn('Mark fine paid error:', err);
    } finally {
      setIsPayingFine(false);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus scan field on mount or process query scan
  useEffect(() => {
    const scanParam = getQueryParam('scan');
    if (scanParam) {
      handleReturnAccession(scanParam);
    } else {
      inputRef.current?.focus();
    }
  }, []);

  const handleReturnAccession = async (accessionNo: string) => {
    setIsLoading(true);
    setErrorInfo(null);
    try {
      const result: ReturnCopyResult = await return_copy(accessionNo);
      setLastReturned(result);
      setSessionList((prev) => [
        { ...result, session_id: `ret-${Date.now()}` },
        ...prev,
      ]);
    } catch (err: unknown) {
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const accessionNo = accessionInput.trim().toUpperCase();
    if (!accessionNo) return;

    setIsLoading(true);
    setErrorInfo(null);

    try {
      const result: ReturnCopyResult = await return_copy(accessionNo);
      setLastReturned(result);

      // Add to session history
      setSessionList((prev) => [
        { ...result, session_id: `ret-${Date.now()}` },
        ...prev,
      ]);

      // Toast: reuses button verb ('Return' -> 'Returned')
      setToastMessage(`Returned ${accessionNo} (${result.title}). Next status: ${result.next_status}.`);
      setTimeout(() => setToastMessage(null), 4000);

      // Clear input
      setAccessionInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Return failed';
      let fix = 'Confirm that the accession barcode was checked out and not already returned.';
      if (msg.toLowerCase().includes('not marked as issued')) {
        fix = 'This copy is already marked as available or in maintenance on the shelf.';
      }
      setErrorInfo({ message: msg, fix });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#d6e2e0]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#042f2e] tracking-tight">
            Process returns
          </h1>
          <p className="text-xs text-[#042f2e]/70 mt-1">
            Scan copy accession barcodes to check in books, compute working days overdue, and route reserved holds.
          </p>
        </div>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <div className="p-3 bg-[#f0fdfa] border border-[#99f6e4] rounded-[6px] text-xs text-[#0f766e] flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-[#0f766e] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[11px] underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Barcode Scan Field */}
      <div className="p-5 bg-white border border-[#d6e2e0] rounded-[6px] space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#042f2e] flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-[#0f766e]" />
            <span>Scan copy accession number</span>
          </label>

          {/* Quick Mock Sample Barcodes */}
          <div className="flex items-center gap-2 text-[11px] text-[#042f2e]/60">
            <span>Quick test:</span>
            <button
              type="button"
              onClick={() => {
                setAccessionInput('ACC-1004'); // Issued to Aarav
              }}
              className="text-[#0f766e] hover:underline"
            >
              ACC-1004 (On-time)
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => {
                setAccessionInput('ACC-1007'); // Overdue by 4 days, fine ₹20
              }}
              className="text-[#b91c1c] hover:underline"
            >
              ACC-1007 (Overdue)
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => {
                setAccessionInput('ACC-1010'); // Next: Held for Ananya
              }}
              className="text-[#b45309] hover:underline"
            >
              ACC-1010 (Hold route)
            </button>
          </div>
        </div>

        <form onSubmit={handleReturn} className="flex gap-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={accessionInput}
              onChange={(e) => setAccessionInput(e.target.value)}
              placeholder="Scan or enter book accession number (e.g. ACC-1007)..."
              leftIcon={<BookOpen className="h-4 w-4" />}
              disabled={isLoading}
              className="font-mono text-base uppercase"
            />
          </div>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!accessionInput.trim()}
            className="px-6 shrink-0"
          >
            Return
            <CornerDownLeft className="h-3.5 w-3.5 ml-1.5 opacity-70" />
          </Button>
        </form>

        {/* Error State */}
        {errorInfo && (
          <ErrorState
            title="Return check-in error"
            message={errorInfo.message}
            fixSuggestion={errorInfo.fix}
          />
        )}
      </div>

      {/* LATEST RETURN CARD: shows book, student, days overdue, fine due, next_status */}
      {lastReturned && (
        <div className="p-5 bg-white border border-[#d6e2e0] rounded-[6px] space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#d6e2e0]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0f766e]">
                Returned item verified
              </span>
              <span className="text-xs text-[#042f2e]/40">&bull;</span>
              <span className="text-xs text-[#042f2e]/60 num-tabular">
                {new Date(lastReturned.returned_at).toLocaleTimeString()}
              </span>
            </div>

            {/* Next status badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#042f2e]/60">Next routing:</span>
              <StatusBadge
                status={lastReturned.next_status.includes('Held') ? 'waiting' : 'available'}
                label={lastReturned.next_status}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Book title */}
            <div className="md:col-span-2 space-y-1">
              <div className="text-[11px] text-[#042f2e]/60">Book title</div>
              <div className="font-serif font-bold text-base text-[#042f2e]">
                {lastReturned.title}
              </div>
            </div>

            {/* Borrower Patron */}
            <div className="space-y-1">
              <div className="text-[11px] text-[#042f2e]/60">Returned by</div>
              <div className="font-medium text-xs text-[#042f2e]">
                {lastReturned.student_name}
              </div>
              <div className="text-[11px] font-mono text-[#042f2e]/60">
                {lastReturned.reg_no}
              </div>
            </div>

            {/* Overdue & Fines */}
            <div className="space-y-1 bg-[#f7faf9] p-2.5 rounded-[6px] border border-[#d6e2e0]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#042f2e]/70">Days overdue:</span>
                <span
                  className={`font-semibold num-tabular ${
                    lastReturned.working_days_overdue > 0 ? 'text-[#b91c1c]' : 'text-[#0f766e]'
                  }`}
                >
                  {lastReturned.working_days_overdue} days
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#d6e2e0]">
                <span className="text-[#042f2e]/70">Fine due:</span>
                <span
                  className={`font-bold num-tabular ${
                    paidLoanIds.has(lastReturned.loan_id)
                      ? 'text-[#0f766e]'
                      : lastReturned.fine_amount > 0
                      ? 'text-[#b91c1c]'
                      : 'text-[#0f766e]'
                  }`}
                >
                  {paidLoanIds.has(lastReturned.loan_id) ? 'Paid (₹0.00)' : `₹${lastReturned.fine_amount}`}
                </span>
              </div>
              {lastReturned.fine_amount > 0 && (
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant={paidLoanIds.has(lastReturned.loan_id) ? 'secondary' : 'primary'}
                    disabled={paidLoanIds.has(lastReturned.loan_id) || isPayingFine}
                    isLoading={isPayingFine}
                    onClick={() => handleMarkPaid(lastReturned.loan_id, lastReturned.fine_amount)}
                    className="w-full text-xs h-7"
                  >
                    {paidLoanIds.has(lastReturned.loan_id) ? '✓ Paid at desk' : `Mark fine ₹${lastReturned.fine_amount} paid`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SESSION RETURN HISTORY */}
      {sessionList.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-serif font-semibold text-[#042f2e]">
            Returns in this desk session ({sessionList.length})
          </h3>

          <div className="border border-[#d6e2e0] rounded-[6px] overflow-hidden bg-white">
            <table className="w-full border-collapse text-left text-xs font-staff-ui">
              <thead className="bg-[#f7faf9] border-b border-[#d6e2e0]">
                <tr>
                  <th className="py-2 px-3 font-semibold text-[#042f2e]">Title</th>
                  <th className="py-2 px-3 font-semibold text-[#042f2e]">Patron</th>
                  <th className="py-2 px-3 font-semibold text-[#042f2e]">Due date</th>
                  <th className="py-2 px-3 font-semibold text-[#042f2e]">Overdue</th>
                  <th className="py-2 px-3 font-semibold text-[#042f2e]">Fine</th>
                  <th className="py-2 px-3 font-semibold text-[#042f2e] text-right">Next Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6e2e0]">
                {sessionList.map((item) => (
                  <tr key={item.session_id} className="hover:bg-[#f7faf9]">
                    <td className="py-2 px-3 font-serif font-medium text-[#042f2e]">
                      {item.title}
                    </td>
                    <td className="py-2 px-3 text-[#042f2e]">
                      {item.student_name} <span className="text-[#042f2e]/50 font-mono text-[10px]">({item.reg_no})</span>
                    </td>
                    <td className="py-2 px-3 text-[#042f2e]/70 num-tabular">
                      {item.due_date}
                    </td>
                    <td
                      className={`py-2 px-3 num-tabular font-medium ${
                        item.working_days_overdue > 0 ? 'text-[#b91c1c]' : 'text-[#0f766e]'
                      }`}
                    >
                      {item.working_days_overdue > 0 ? `${item.working_days_overdue} days` : 'On time'}
                    </td>
                    <td
                      className={`py-2 px-3 num-tabular font-semibold ${
                        item.fine_amount > 0 ? 'text-[#b91c1c]' : 'text-[#0f766e]'
                      }`}
                    >
                      {item.fine_amount > 0 ? `₹${item.fine_amount}` : '₹0'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <StatusBadge
                        status={item.next_status.includes('Held') ? 'waiting' : 'available'}
                        label={item.next_status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
