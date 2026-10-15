import {
  StudentLoan,
  StudentHold,
  StudentNotification,
  INITIAL_STUDENT_LOANS,
  INITIAL_STUDENT_HOLDS,
  INITIAL_STUDENT_HISTORY,
  INITIAL_STUDENT_NOTIFICATIONS,
  LIBRARY_HOLIDAYS_2026,
} from './mockData';

class MockStudentStore {
  private loans: StudentLoan[];
  private holds: StudentHold[];
  private history: StudentLoan[];
  private notifications: StudentNotification[];

  constructor() {
    this.loans = [...INITIAL_STUDENT_LOANS];
    this.holds = [...INITIAL_STUDENT_HOLDS];
    this.history = [...INITIAL_STUDENT_HISTORY];
    this.notifications = [...INITIAL_STUDENT_NOTIFICATIONS];
  }

  // --- Loans ---
  async getLoans(): Promise<StudentLoan[]> {
    await this.delay(120);
    return JSON.parse(JSON.stringify(this.loans));
  }

  async getHistory(): Promise<StudentLoan[]> {
    await this.delay(120);
    return JSON.parse(JSON.stringify(this.history));
  }

  async renewLoan(
    loanId: string
  ): Promise<{ success: boolean; reason?: string; loan?: StudentLoan }> {
    await this.delay(200);
    const index = this.loans.findIndex((l) => l.loan_id === loanId);
    if (index === -1) {
      return { success: false, reason: 'Loan record not found' };
    }

    const loan = this.loans[index];

    // Explicit business rules specified in prompt:
    if (loan.working_days_overdue > 0) {
      return {
        success: false,
        reason: 'Overdue books cannot be renewed',
      };
    }

    if (loan.renewals_count >= loan.max_renewals) {
      return {
        success: false,
        reason: `You have used ${loan.renewals_count} of ${loan.max_renewals} renewals`,
      };
    }

    if (loan.is_reserved_by_other) {
      return {
        success: false,
        reason: 'Someone is waiting for this book',
      };
    }

    // Perform renewal
    const updatedLoan: StudentLoan = {
      ...loan,
      renewals_count: loan.renewals_count + 1,
      due_date: '2026-10-31',
      working_days_left: 14,
    };
    this.loans[index] = updatedLoan;
    return { success: true, loan: updatedLoan };
  }

  async scheduleReturn(
    loanId: string,
    date: string
  ): Promise<{ success: boolean; message: string; date: string }> {
    await this.delay(150);
    const index = this.loans.findIndex((l) => l.loan_id === loanId);
    if (index === -1) {
      return { success: false, message: 'Loan not found', date };
    }
    this.loans[index].scheduled_return_date = date;
    return {
      success: true,
      message: 'Return scheduled. This is only a reminder; return counts upon librarian scan.',
      date,
    };
  }

  async reportLost(
    loanId: string,
    resolution: 'pay_fee' | 'replace_copy'
  ): Promise<{ success: boolean; message: string }> {
    await this.delay(200);
    const index = this.loans.findIndex((l) => l.loan_id === loanId);
    if (index === -1) {
      return { success: false, message: 'Loan not found' };
    }
    const loan = this.loans[index];
    loan.status = 'lost';
    // Fines stop on report date
    return {
      success: true,
      message:
        resolution === 'pay_fee'
          ? 'Book reported lost. Fine accrual frozen. Visit circulation desk to settle replacement fee.'
          : 'Book reported lost. Fine accrual frozen. You may submit an identical replacement copy.',
    };
  }

  // --- Holds ---
  async getHolds(): Promise<StudentHold[]> {
    await this.delay(120);
    return JSON.parse(JSON.stringify(this.holds));
  }

  async placeHold(
    workId: string,
    title: string,
    author: string = 'Unknown Author'
  ): Promise<{ success: boolean; reason?: string; hold?: StudentHold }> {
    await this.delay(250);
    // Check if student already holds this work
    const existing = this.holds.find((h) => h.work_id === workId);
    if (existing) {
      return {
        success: false,
        reason: 'You already hold an active reservation for this book',
      };
    }

    const newHold: StudentHold = {
      hold_id: `hold-${Date.now()}`,
      work_id: workId,
      title: title,
      author: author,
      queue_position: 1, // optimistic queue position
      status: 'waiting',
      pickup_deadline: null,
      placed_at: new Date().toISOString().split('T')[0],
    };

    this.holds.unshift(newHold);
    return { success: true, hold: newHold };
  }

  async cancelHold(
    holdId: string
  ): Promise<{ success: boolean; hold?: StudentHold }> {
    await this.delay(150);
    const index = this.holds.findIndex((h) => h.hold_id === holdId);
    if (index === -1) {
      return { success: false };
    }
    const [removed] = this.holds.splice(index, 1);
    return { success: true, hold: removed };
  }

  async restoreHold(hold: StudentHold): Promise<boolean> {
    await this.delay(100);
    this.holds.push(hold);
    return true;
  }

  // --- Notifications ---
  async getNotifications(): Promise<StudentNotification[]> {
    await this.delay(100);
    return JSON.parse(JSON.stringify(this.notifications));
  }

  async markNotificationRead(id: string): Promise<boolean> {
    await this.delay(80);
    const item = this.notifications.find((n) => n.id === id);
    if (item) {
      item.read = true;
      return true;
    }
    return false;
  }

  async markAllNotificationsRead(): Promise<boolean> {
    await this.delay(100);
    this.notifications.forEach((n) => {
      n.read = true;
    });
    return true;
  }

  getHolidays() {
    return LIBRARY_HOLIDAYS_2026;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }
}

export const mockStudentService = new MockStudentStore();
