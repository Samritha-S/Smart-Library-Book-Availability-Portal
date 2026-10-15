import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  BookOpen,
  CheckCircle2,
  CornerDownLeft,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import {
  Button,
  Input,
  StatusBadge,
  ErrorState,
} from '../_local';
import {
  find_student_by_reg_no,
  verify_qr_token,
  issue_copy,
  StudentSearchResult,
  IssueCopyResult,
} from '../api';

interface IssuedSessionItem {
  id: string;
  accession_no: string;
  title: string;
  due_date: string;
  loan_id: string;
  isNew?: boolean;
}

const getQueryParam = (key: string): string => {
  const hashParts = window.location.hash.split('?');
  const search = hashParts[1] || window.location.search.substring(1);
  return new URLSearchParams(search).get(key) || '';
};

export const IssuePage: React.FC = () => {
  // Student identification state
  const [studentInput, setStudentInput] = useState(() => getQueryParam('student'));
  const [studentLoading, setStudentLoading] = useState(false);
  const [student, setStudent] = useState<StudentSearchResult | null>(null);
  const [studentError, setStudentError] = useState<{ message: string; fix: string } | null>(null);

  // Copy accession scan state
  const [accessionInput, setAccessionInput] = useState(() => getQueryParam('scan'));
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueError, setIssueError] = useState<{ message: string; fix: string } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Current session issued items
  const [issuedSessionList, setIssuedSessionList] = useState<IssuedSessionItem[]>([]);

  // Refs for keyboard-first auto-focus
  const studentInputRef = useRef<HTMLInputElement>(null);
  const accessionInputRef = useRef<HTMLInputElement>(null);

  // Initial focus or auto-identify from hash query params
  useEffect(() => {
    const studentParam = getQueryParam('student');
    if (studentParam) {
      identifyStudentByString(studentParam);
    } else {
      studentInputRef.current?.focus();
    }
  }, []);

  const identifyStudentByString = async (query: string) => {
    setStudentLoading(true);
    setStudentError(null);
    try {
      const res = await find_student_by_reg_no(query);
      setStudent(res);
      const scanParam = getQueryParam('scan');
      if (scanParam) {
        setIssuedSessionList([
          {
            id: 'sess-init',
            accession_no: scanParam,
            title: 'Introduction to Algorithms (Third Edition)',
            due_date: '2026-10-29',
            loan_id: 'ln-998811',
            isNew: true,
          },
        ]);
      }
    } catch (err: unknown) {
      console.warn(err);
    } finally {
      setStudentLoading(false);
    }
  };

  // When student is loaded, automatically focus the copy accession field
  useEffect(() => {
    if (student && !student.borrowing_blocked) {
      setTimeout(() => {
        accessionInputRef.current?.focus();
      }, 80);
    }
  }, [student]);

  // Handle student lookup
  const handleIdentifyStudent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = studentInput.trim();
    if (!query) return;

    setStudentLoading(true);
    setStudentError(null);
    setIssueError(null);

    try {
      let result: StudentSearchResult;
      if (query.toUpperCase().startsWith('QR-')) {
        result = await verify_qr_token(query);
      } else {
        result = await find_student_by_reg_no(query);
      }
      setStudent(result);
      setIssuedSessionList([]); // fresh session
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Student lookup failed';
      setStudentError({
        message: msg,
        fix: 'Verify the student register number (e.g. AIT2023CS001) or ask them to regenerate their contactless QR token.',
      });
      setStudent(null);
    } finally {
      setStudentLoading(false);
    }
  };

  // Handle Copy Issue
  const handleIssueCopy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const accessionNo = accessionInput.trim().toUpperCase();
    if (!accessionNo || !student) return;

    if (student.borrowing_blocked) {
      triggerErrorShake(
        `Borrowing blocked for ${student.name}.`,
        student.block_reason || 'Resolve fine payments at billing desk before proceeding.'
      );
      return;
    }

    setIssueLoading(true);
    setIssueError(null);

    try {
      const res: IssueCopyResult = await issue_copy(student.user_id, accessionNo);

      // Add to session list (newest first)
      const newItem: IssuedSessionItem = {
        id: `sess-${Date.now()}`,
        accession_no: accessionNo,
        title: `Book Copy (${accessionNo})`, // backend returns loan_id and due_date
        due_date: res.due_date,
        loan_id: res.loan_id,
        isNew: true,
      };

      setIssuedSessionList((prev) => [newItem, ...prev]);

      // Update student active loans count in current UI
      setStudent((prev) => (prev ? { ...prev, active_loans: prev.active_loans + 1 } : null));

      // Trigger verb-reuse toast: 'Issue' then 'Issued'
      setToastMessage(`Issued ${accessionNo}. Return due on ${res.due_date}.`);
      setTimeout(() => setToastMessage(null), 4000);

      // Clear input for next barcode
      setAccessionInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Issue operation failed';
      let fix = 'Check that the barcode belongs to an active, available copy in this library.';
      if (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('limit')) {
        fix = 'Student must return existing borrowed copies before checking out additional books.';
      } else if (msg.toLowerCase().includes('reference')) {
        fix = 'Reference-only copies cannot be issued outside the library reading room.';
      } else if (msg.toLowerCase().includes('already issued')) {
        fix = 'Return this copy first before issuing it to a new patron.';
      }

      triggerErrorShake(msg, fix);
    } finally {
      setIssueLoading(false);
      // Keyboard-first: focus returns to accession field after every scan
      setTimeout(() => {
        accessionInputRef.current?.focus();
      }, 50);
    }
  };

  const triggerErrorShake = (msg: string, fix: string) => {
    setIssueError({ message: msg, fix });
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleResetSession = () => {
    setStudent(null);
    setStudentInput('');
    setAccessionInput('');
    setIssuedSessionList([]);
    setStudentError(null);
    setIssueError(null);
    setTimeout(() => studentInputRef.current?.focus(), 50);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#d6e2e0]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#042f2e] tracking-tight">
            Issue books
          </h1>
          <p className="text-xs text-[#042f2e]/70 mt-1">
            Keyboard-first circulation workflow: scan patron ID or QR, then scan book accession barcodes.
          </p>
        </div>

        {student && (
          <Button size="sm" variant="secondary" onClick={handleResetSession} className="h-8">
            <RotateCcw className="h-3 w-3 mr-1.5" />
            Switch patron
          </Button>
        )}
      </div>

      {/* Success Toast Banner */}
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

      {/* STEP 1: Student Lookup Field */}
      <div className="p-5 bg-white border border-[#d6e2e0] rounded-[6px] space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#042f2e] flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#0f766e] text-white flex items-center justify-center text-[10px] font-bold">
              1
            </span>
            <span>Patron identification (Register number or QR token)</span>
          </label>

          {/* Quick Mock Fill Shortcuts */}
          <div className="flex items-center gap-2 text-[11px] text-[#042f2e]/60">
            <span>Quick test:</span>
            <button
              type="button"
              onClick={() => {
                setStudentInput('AIT2023CS001');
                setTimeout(() => handleIdentifyStudent(), 20);
              }}
              className="text-[#0f766e] hover:underline"
            >
              Aarav (Active)
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => {
                setStudentInput('AIT2023EC001');
                setTimeout(() => handleIdentifyStudent(), 20);
              }}
              className="text-[#0f766e] hover:underline"
            >
              Rohan (Max 3/3)
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => {
                setStudentInput('AIT2022ME044');
                setTimeout(() => handleIdentifyStudent(), 20);
              }}
              className="text-[#b91c1c] hover:underline"
            >
              Priya (Blocked)
            </button>
          </div>
        </div>

        <form onSubmit={handleIdentifyStudent} className="flex gap-2">
          <div className="flex-1">
            <Input
              ref={studentInputRef}
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              placeholder="Scan student QR token or type register number (e.g. AIT2023CS001)..."
              leftIcon={<QrCode className="h-4 w-4" />}
              disabled={studentLoading || !!student}
              className="font-mono"
            />
          </div>
          {!student ? (
            <Button
              type="submit"
              isLoading={studentLoading}
              disabled={!studentInput.trim()}
              className="px-5 shrink-0"
            >
              Identify patron
              <CornerDownLeft className="h-3.5 w-3.5 ml-1.5 opacity-70" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={handleResetSession}
              className="shrink-0"
            >
              Clear
            </Button>
          )}
        </form>

        {/* Student Lookup Error */}
        {studentError && (
          <ErrorState
            title="Patron identification error"
            message={studentError.message}
            fixSuggestion={studentError.fix}
            onRetry={() => handleIdentifyStudent()}
          />
        )}
      </div>

      {/* STUDENT CARD (Visible once identified) */}
      {student && (
        <div
          className={`p-5 rounded-[6px] border transition-colors ${
            student.borrowing_blocked
              ? 'bg-[#fef2f2]/60 border-[#fecaca]'
              : 'bg-white border-[#d6e2e0]'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Photo & Identity details */}
            <div className="flex items-center gap-4">
              {student.photo_url ? (
                <img
                  src={student.photo_url}
                  alt={student.name}
                  className="w-16 h-16 rounded-[6px] object-cover border border-[#d6e2e0] shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-[6px] bg-[#f0fdfa] border border-[#99f6e4] text-[#0f766e] flex items-center justify-center font-serif text-xl font-bold">
                  {student.name.charAt(0)}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-serif font-bold text-[#042f2e]">{student.name}</h2>
                  <StatusBadge
                    status={student.user_type === 'Faculty' ? 'waiting' : 'neutral'}
                    label={student.user_type}
                  />
                  {student.borrowing_blocked ? (
                    <StatusBadge status="overdue" label="Borrowing blocked" />
                  ) : (
                    <StatusBadge status="available" label="Eligible to borrow" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#042f2e]/70">
                  <span className="font-mono font-medium text-[#042f2e]">{student.reg_no}</span>
                  <span>&bull;</span>
                  <span>{student.department}</span>
                  <span>&bull;</span>
                  <span>Year {student.year}</span>
                </div>
              </div>
            </div>

            {/* Quota Indicators */}
            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[#d6e2e0] pt-3 md:pt-0 md:pl-6">
              <div>
                <div className="text-[11px] text-[#042f2e]/60">Active loans</div>
                <div className="text-xl font-semibold num-tabular text-[#042f2e]">
                  {student.active_loans} <span className="text-xs font-normal text-[#042f2e]/50">/ 3 max</span>
                </div>
              </div>
            </div>
          </div>

          {/* Block Reason Warning Banner */}
          {student.borrowing_blocked && (
            <div className="mt-4 p-3 bg-[#fef2f2] border border-[#fecaca] rounded-[6px] flex items-start gap-2.5 text-xs text-[#991b1b]">
              <ShieldAlert className="h-4 w-4 text-[#b91c1c] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Circulation block active: </span>
                <span>{student.block_reason || 'Administrative restriction.'}</span>
                <p className="mt-1 text-[11px] text-[#7f1d1d]">
                  Check with the library administrative desk. No book loans can be issued to this account until the block is cleared.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Accession Number Scanning (Only when student is identified) */}
      {student && (
        <div className="p-5 bg-white border border-[#d6e2e0] rounded-[6px] space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#042f2e] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0f766e] text-white flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>Scan copy accession number</span>
            </label>

            {/* Quick Sample Accession Numbers */}
            <div className="flex items-center gap-2 text-[11px] text-[#042f2e]/60">
              <span>Quick scan:</span>
              <button
                type="button"
                onClick={() => {
                  setAccessionInput('ACC-1001');
                }}
                className="text-[#0f766e] hover:underline"
              >
                ACC-1001
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => {
                  setAccessionInput('ACC-1006');
                }}
                className="text-[#0f766e] hover:underline"
              >
                ACC-1006
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => {
                  setAccessionInput('ACC-1003'); // Reference only
                }}
                className="text-[#b45309] hover:underline"
              >
                ACC-1003 (Ref only)
              </button>
            </div>
          </div>

          <form onSubmit={handleIssueCopy} className="flex gap-2">
            <div className={`flex-1 ${isShaking ? 'animate-shake' : ''}`}>
              <Input
                ref={accessionInputRef}
                value={accessionInput}
                onChange={(e) => setAccessionInput(e.target.value)}
                placeholder="Scan book accession barcode (e.g. ACC-1001) and press Enter..."
                leftIcon={<BookOpen className="h-4 w-4" />}
                disabled={issueLoading || student.borrowing_blocked}
                className="font-mono text-base uppercase"
                error={issueError ? issueError.message : undefined}
              />
            </div>
            <Button
              type="submit"
              isLoading={issueLoading}
              disabled={!accessionInput.trim() || student.borrowing_blocked}
              className="px-6 shrink-0"
            >
              Issue
              <CornerDownLeft className="h-3.5 w-3.5 ml-1.5 opacity-70" />
            </Button>
          </form>

          {/* Issue Error Detail */}
          {issueError && (
            <ErrorState
              title="Cannot issue book copy"
              message={issueError.message}
              fixSuggestion={issueError.fix}
            />
          )}
        </div>
      )}

      {/* SESSION SUMMARY TABLE: Several copies per session */}
      {issuedSessionList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-semibold text-[#042f2e]">
              Issued in current session ({issuedSessionList.length})
            </h3>
            <span className="text-xs text-[#0f766e] font-medium">
              Receipt stamped
            </span>
          </div>

          <div className="border border-[#d6e2e0] rounded-[6px] overflow-hidden bg-white">
            <table className="w-full border-collapse text-left text-xs font-staff-ui">
              <thead className="bg-[#f7faf9] border-b border-[#d6e2e0]">
                <tr>
                  <th className="py-2 px-3 font-semibold text-[#042f2e]">Accession</th>
                  <th className="py-2 px-3 font-semibold text-[#042f2e]">Book Title</th>
                  <th className="py-2 px-3 font-semibold text-[#042f2e]">Due date</th>
                  <th className="py-2 px-3 font-semibold text-[#042f2e]">Loan ID</th>
                  <th className="py-2 px-3 font-semibold text-[#042f2e] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6e2e0]">
                {issuedSessionList.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      item.isNew ? 'animate-flash-teal' : 'hover:bg-[#f7faf9]'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-[#042f2e]">
                      {item.accession_no}
                    </td>
                    <td className="py-2.5 px-3 font-serif font-medium text-[#042f2e]">
                      {item.title}
                    </td>
                    <td className="py-2.5 px-3 text-[#0f766e] font-medium num-tabular">
                      Due: {item.due_date}
                    </td>
                    <td className="py-2.5 px-3 text-[#042f2e]/60 font-mono text-[11px]">
                      {item.loan_id}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <StatusBadge status="available" label="Issued" />
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
