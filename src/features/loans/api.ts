import { mockStorage } from '../mock/storage';
import type { LoanItem, ReturnedLoanItem } from '../mock/types';

export type { LoanItem, ReturnedLoanItem, LoanStatus } from '../mock/types';

const isMock =
  import.meta.env.VITE_STUDENT_MOCK === 'true' ||
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

/**
 * Returns student loans with full circulation metadata.
 * Specification: loan_id, title, author, edition_no, cover_url,
 * accession_no, issued_at, due_date, renewals_count, max_renewals, working_days_left,
 * working_days_overdue, fine_amount, status.
 */
export async function my_loans(): Promise<LoanItem[]> {
  if (isMock) {
    await new Promise((r) => setTimeout(r, 60));
    return mockStorage.getLoans();
  }
  return mockStorage.getLoans();
}

/**
 * Optimistic renew loan. Refuses if:
 * - 'Someone is waiting for this book'
 * - 'You have used 2 of 2 renewals'
 * - 'Overdue books cannot be renewed'
 */
export async function renew_loan(
  loan_id: string
): Promise<{ success: boolean; reason?: string; loan?: LoanItem }> {
  await new Promise((r) => setTimeout(r, 120));
  return mockStorage.renewLoan(loan_id);
}

/**
 * Schedule a return reminder date (Sundays and holidays excluded).
 * Copy: 'This is only a reminder. Your return counts when the librarian scans the book.'
 */
export async function schedule_return(
  loan_id: string,
  date: string
): Promise<{ success: boolean; message?: string }> {
  await new Promise((r) => setTimeout(r, 100));
  return mockStorage.scheduleReturn(loan_id, date);
}

/**
 * Report book as lost.
 * Explains two ways to resolve it: pay fee or replace book.
 * Fines stop accumulating on report date.
 */
export async function report_lost(
  loan_id: string,
  resolution_choice: 'pay_fee' | 'replace_book'
): Promise<{ success: boolean; loan?: LoanItem }> {
  await new Promise((r) => setTimeout(r, 120));
  return mockStorage.reportLost(loan_id, resolution_choice);
}

/**
 * Retrieve returned book circulation history
 */
export async function my_loan_history(): Promise<ReturnedLoanItem[]> {
  await new Promise((r) => setTimeout(r, 60));
  return mockStorage.getHistory();
}

export const my_loans_history = my_loan_history;
