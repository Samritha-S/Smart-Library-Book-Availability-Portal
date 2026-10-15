import { supabase } from '@/lib/supabase';
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

  try {
    const { data, error } = await supabase
      .from('loans_with_fine')
      .select('*')
      .in('loan_status', ['active', 'lost'])
      .order('due_date', { ascending: true });

    if (error || !data) {
      console.warn('Fallback to mock for my_loans:', error);
      return mockStorage.getLoans();
    }

    return data.map((row) => ({
      loan_id: row.loan_id,
      title: row.title,
      author: row.author,
      edition_no: row.edition_no || 1,
      cover_url: row.cover_url,
      accession_no: row.accession_no,
      issued_at: row.issued_at,
      due_date: row.due_date,
      renewals_count: row.renewals_count || 0,
      max_renewals: row.max_renewals || 2,
      working_days_left: Number(row.working_days_left || 0),
      working_days_overdue: Number(row.working_days_overdue || 0),
      fine_amount: Number(row.net_fine || 0),
      status: row.loan_status === 'lost'
        ? 'lost'
        : (row.is_overdue || Number(row.working_days_overdue) > 0 ? 'overdue' : 'active'),
      scheduled_return_date: row.return_schedule_date || null,
      lost_reported_at: row.loan_status === 'lost' ? row.issued_at : null,
    }));
  } catch (err) {
    console.warn('Error fetching real loans:', err);
    return mockStorage.getLoans();
  }
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
  if (isMock) {
    await new Promise((r) => setTimeout(r, 120));
    return mockStorage.renewLoan(loan_id);
  }

  try {
    const { data: _data, error } = await supabase.rpc('renew_loan', { p_loan_id: loan_id });
    if (error) {
      return { success: false, reason: error.message };
    }
    const loans = await my_loans();
    const updatedLoan = loans.find((l) => l.loan_id === loan_id);
    return { success: true, loan: updatedLoan };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Renewal failed';
    return { success: false, reason: msg };
  }
}

/**
 * Schedule a return reminder date (Sundays and holidays excluded).
 * Copy: 'This is only a reminder. Your return counts when the librarian scans the book.'
 */
export async function schedule_return(
  loan_id: string,
  date: string
): Promise<{ success: boolean; message?: string }> {
  if (isMock) {
    await new Promise((r) => setTimeout(r, 100));
    return mockStorage.scheduleReturn(loan_id, date);
  }

  try {
    const { error } = await supabase.rpc('schedule_return', {
      p_loan_id: loan_id,
      p_date: date,
    });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Return reminder scheduled' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Scheduling failed';
    return { success: false, message: msg };
  }
}

/**
 * Report book as lost.
 * Explains two ways to resolve it: pay fee or replace book.
 * Fines stop accumulating on report date.
 */
export async function report_lost(
  loan_id: string,
  resolution_choice: 'pay_fee' | 'replace_book',
  copy_id?: string
): Promise<{ success: boolean; loan?: LoanItem; reason?: string }> {
  if (isMock) {
    await new Promise((r) => setTimeout(r, 120));
    return mockStorage.reportLost(loan_id, resolution_choice);
  }

  try {
    // If copy_id not provided, fetch from loan
    let targetCopyId = copy_id;
    if (!targetCopyId) {
      const { data: loanRow } = await supabase.from('loans').select('copy_id').eq('id', loan_id).single();
      targetCopyId = loanRow?.copy_id;
    }

    if (!targetCopyId) {
      return mockStorage.reportLost(loan_id, resolution_choice);
    }

    const { error } = await supabase.rpc('report_lost', {
      p_copy_id: targetCopyId,
      p_loan_id: loan_id,
      p_reason: `Reported lost by student. Preference: ${resolution_choice}`,
    });

    if (error) {
      return { success: false, reason: error.message };
    }

    const loans = await my_loans();
    const updatedLoan = loans.find((l) => l.loan_id === loan_id);
    return { success: true, loan: updatedLoan };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Report lost failed';
    return { success: false, reason: msg };
  }
}

/**
 * Retrieve returned book circulation history
 */
export async function my_loan_history(): Promise<ReturnedLoanItem[]> {
  if (isMock) {
    await new Promise((r) => setTimeout(r, 60));
    return mockStorage.getHistory();
  }

  try {
    const { data, error } = await supabase
      .from('loans_with_fine')
      .select('*')
      .eq('loan_status', 'returned')
      .order('returned_at', { ascending: false });

    if (error || !data) {
      return mockStorage.getHistory();
    }

    return data.map((row) => ({
      loan_id: row.loan_id,
      title: row.title,
      author: row.author,
      edition_no: row.edition_no || 1,
      cover_url: row.cover_url,
      accession_no: row.accession_no,
      issued_at: row.issued_at,
      returned_at: row.returned_at,
      status: 'returned',
    }));
  } catch (err) {
    console.warn('Error fetching real history:', err);
    return mockStorage.getHistory();
  }
}

export const my_loans_history = my_loan_history;
