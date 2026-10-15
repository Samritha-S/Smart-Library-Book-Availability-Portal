import {
  INITIAL_LOANS,
  INITIAL_HOLDS,
  INITIAL_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_HOLIDAYS,
} from './data';
import type {
  LoanItem,
  HoldItem,
  ReturnedLoanItem,
  NotificationItem,
  LibraryHoliday,
} from './types';

const STORAGE_KEY = 'smart_library_student_state_v1';

interface StudentMockStore {
  loans: LoanItem[];
  holds: HoldItem[];
  history: ReturnedLoanItem[];
  notifications: NotificationItem[];
  cancelledHolds: HoldItem[];
}

function loadState(): StudentMockStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse student mock state from localStorage', e);
  }
  return {
    loans: JSON.parse(JSON.stringify(INITIAL_LOANS)),
    holds: JSON.parse(JSON.stringify(INITIAL_HOLDS)),
    history: JSON.parse(JSON.stringify(INITIAL_HISTORY)),
    notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
    cancelledHolds: [],
  };
}

let state: StudentMockStore = loadState();
const listeners = new Set<() => void>();

function saveAndNotify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save student mock state', e);
  }
  listeners.forEach((fn) => fn());
}

export const mockStorage = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  getLoans(): LoanItem[] {
    return state.loans;
  },

  getLoan(id: string): LoanItem | undefined {
    return state.loans.find((l) => l.loan_id === id);
  },

  renewLoan(loanId: string): { success: boolean; reason?: string; loan?: LoanItem } {
    const loan = state.loans.find((l) => l.loan_id === loanId);
    if (!loan) {
      return { success: false, reason: 'Loan not found' };
    }

    // Refusal rule 1: Overdue books cannot be renewed
    if (loan.status === 'overdue' || loan.working_days_overdue > 0) {
      return { success: false, reason: 'Overdue books cannot be renewed' };
    }

    // Refusal rule 2: Someone is waiting for this book
    if (loan.has_hold_queue) {
      return { success: false, reason: 'Someone is waiting for this book' };
    }

    // Refusal rule 3: Used max renewals
    if (loan.renewals_count >= loan.max_renewals) {
      return {
        success: false,
        reason: `You have used ${loan.renewals_count} of ${loan.max_renewals} renewals`,
      };
    }

    // Successful renewal
    const updated: LoanItem = {
      ...loan,
      renewals_count: loan.renewals_count + 1,
      working_days_left: loan.working_days_left + 14,
      due_date: new Date(Date.now() + (loan.working_days_left + 14) * 86400000).toISOString(),
    };

    state.loans = state.loans.map((l) => (l.loan_id === loanId ? updated : l));
    saveAndNotify();
    return { success: true, loan: updated };
  },

  scheduleReturn(loanId: string, date: string): { success: boolean; message?: string } {
    const loan = state.loans.find((l) => l.loan_id === loanId);
    if (!loan) return { success: false, message: 'Loan not found' };

    loan.scheduled_return_date = date;
    saveAndNotify();
    return { success: true, message: `Scheduled return for ${date}` };
  },

  reportLost(
    loanId: string,
    resolutionChoice: 'pay_fee' | 'replace_book'
  ): { success: boolean; loan?: LoanItem } {
    const loan = state.loans.find((l) => l.loan_id === loanId);
    if (!loan) return { success: false };

    loan.status = 'lost';
    loan.lost_resolution = resolutionChoice;
    loan.lost_reported_at = new Date().toISOString();
    // Fines stop accumulating on report date
    saveAndNotify();
    return { success: true, loan };
  },

  getHolds(): HoldItem[] {
    return state.holds;
  },

  placeHold(book: {
    work_id?: string;
    title: string;
    author?: string;
    cover_url?: string;
  }): { success: boolean; hold?: HoldItem; reason?: string } {
    // Check if student is blocked (has overdue items)
    const hasOverdue = state.loans.some(
      (l) => l.status === 'overdue' && l.working_days_overdue > 0
    );
    if (hasOverdue) {
      return {
        success: false,
        reason: 'Hold blocked: You have overdue books and unpaid fines',
      };
    }

    const newHold: HoldItem = {
      hold_id: `hold-${Date.now()}`,
      title: book.title,
      author: book.author || 'Author',
      cover_url: book.cover_url || null,
      queue_position: state.holds.filter((h) => h.status === 'waiting').length + 1,
      status: 'waiting',
      pickup_deadline: null,
      created_at: new Date().toISOString(),
    };

    state.holds = [newHold, ...state.holds];
    saveAndNotify();
    return { success: true, hold: newHold };
  },

  cancelHold(holdId: string): { success: boolean; hold?: HoldItem } {
    const index = state.holds.findIndex((h) => h.hold_id === holdId);
    if (index === -1) return { success: false };

    const [removed] = state.holds.splice(index, 1);
    state.cancelledHolds.push(removed);
    saveAndNotify();
    return { success: true, hold: removed };
  },

  undoCancelHold(holdId: string): { success: boolean; hold?: HoldItem } {
    const index = state.cancelledHolds.findIndex((h) => h.hold_id === holdId);
    if (index === -1) return { success: false };

    const [restored] = state.cancelledHolds.splice(index, 1);
    state.holds.push(restored);
    saveAndNotify();
    return { success: true, hold: restored };
  },

  getHistory(): ReturnedLoanItem[] {
    return state.history;
  },

  getNotifications(): NotificationItem[] {
    return state.notifications;
  },

  markNotificationRead(id: string): { success: boolean } {
    const notif = state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      saveAndNotify();
    }
    return { success: true };
  },

  markAllNotificationsRead(): { success: boolean } {
    state.notifications.forEach((n) => {
      n.read = true;
    });
    saveAndNotify();
    return { success: true };
  },

  getHolidays(): LibraryHoliday[] {
    return INITIAL_HOLIDAYS;
  },

  reset(): void {
    state = {
      loans: JSON.parse(JSON.stringify(INITIAL_LOANS)),
      holds: JSON.parse(JSON.stringify(INITIAL_HOLDS)),
      history: JSON.parse(JSON.stringify(INITIAL_HISTORY)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      cancelledHolds: [],
    };
    saveAndNotify();
  },
};
