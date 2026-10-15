export type LoanStatus = 'active' | 'overdue' | 'returned' | 'lost';

export interface LoanItem {
  loan_id: string;
  title: string;
  author: string;
  edition_no: number;
  cover_url?: string | null;
  accession_no: string;
  issued_at: string;
  due_date: string;
  renewals_count: number;
  max_renewals: number;
  working_days_left: number;
  working_days_overdue: number;
  fine_amount: number;
  status: LoanStatus;
  scheduled_return_date?: string | null;
  lost_resolution?: 'pay_fee' | 'replace_book' | null;
  lost_reported_at?: string | null;
  has_hold_queue?: boolean;
}

export type HoldStatus = 'waiting' | 'ready' | 'cancelled';

export interface HoldItem {
  hold_id: string;
  title: string;
  author?: string;
  cover_url?: string | null;
  queue_position: number;
  status: HoldStatus;
  pickup_deadline?: string | null;
  created_at: string;
}

export interface ReturnedLoanItem {
  loan_id: string;
  title: string;
  author: string;
  edition_no: number;
  cover_url?: string | null;
  accession_no: string;
  issued_at: string;
  returned_at: string;
  status: 'returned';
}

export type NotificationType = 'hold_ready' | 'due_soon' | 'overdue_notice';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  link_tab?: 'borrowed' | 'holds' | 'history';
  related_id?: string;
}

export interface LibraryHoliday {
  date: string; // YYYY-MM-DD
  name: string;
}
