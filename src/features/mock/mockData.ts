export interface StudentLoan {
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
  status: 'active' | 'returned' | 'lost';
  returned_at?: string | null;
  scheduled_return_date?: string | null;
  is_reserved_by_other?: boolean;
}

export interface StudentHold {
  hold_id: string;
  work_id: string;
  title: string;
  author: string;
  cover_url?: string | null;
  queue_position: number;
  status: 'waiting' | 'ready';
  pickup_deadline?: string | null;
  placed_at: string;
}

export interface StudentNotification {
  id: string;
  type: 'hold_ready' | 'due_soon' | 'overdue_notice' | 'general';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  link?: string;
  hold_id?: string;
  loan_id?: string;
}

export const LIBRARY_HOLIDAYS_2026: { date: string; name: string }[] = [
  { date: '2026-10-20', name: 'Valmiki Jayanti' },
  { date: '2026-10-24', name: 'Institutional Sports Day' },
  { date: '2026-11-01', name: 'State Formation Day' },
  { date: '2026-11-08', name: 'Diwali' },
];

export const INITIAL_STUDENT_LOANS: StudentLoan[] = [
  {
    loan_id: 'loan-001',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    edition_no: 4,
    accession_no: 'CS-2024-0412',
    issued_at: '2026-10-03',
    due_date: '2026-10-17',
    renewals_count: 0,
    max_renewals: 2,
    working_days_left: 2,
    working_days_overdue: 0,
    fine_amount: 0,
    status: 'active',
    is_reserved_by_other: false,
  },
  {
    loan_id: 'loan-002',
    title: 'Computer Networks: A Systems Approach',
    author: 'Larry L. Peterson, Bruce S. Davie',
    edition_no: 6,
    accession_no: 'CS-2023-0189',
    issued_at: '2026-10-10',
    due_date: '2026-10-26',
    renewals_count: 1,
    max_renewals: 2,
    working_days_left: 9,
    working_days_overdue: 0,
    fine_amount: 0,
    status: 'active',
    is_reserved_by_other: true, // will refuse renewal with "Someone is waiting for this book"
  },
  {
    loan_id: 'loan-003',
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry F. Korth',
    edition_no: 7,
    accession_no: 'CS-2022-0941',
    issued_at: '2026-09-21',
    due_date: '2026-10-09',
    renewals_count: 2,
    max_renewals: 2,
    working_days_left: 0,
    working_days_overdue: 4,
    fine_amount: 20,
    status: 'active',
    is_reserved_by_other: false,
  },
];

export const INITIAL_STUDENT_HOLDS: StudentHold[] = [
  {
    hold_id: 'hold-001',
    work_id: 'work-ddia',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    queue_position: 2,
    status: 'waiting',
    pickup_deadline: null,
    placed_at: '2026-10-12',
  },
  {
    hold_id: 'hold-002',
    work_id: 'work-osc',
    title: 'Operating System Concepts',
    author: 'Abraham Silberschatz, Peter B. Galvin',
    queue_position: 1,
    status: 'ready',
    pickup_deadline: '2026-10-17T17:00:00Z',
    placed_at: '2026-10-08',
  },
];

export const INITIAL_STUDENT_HISTORY: StudentLoan[] = [
  {
    loan_id: 'hist-001',
    title: 'Clean Architecture: A Craftsman\'s Guide',
    author: 'Robert C. Martin',
    edition_no: 1,
    accession_no: 'CS-2021-0201',
    issued_at: '2026-09-10',
    due_date: '2026-09-24',
    returned_at: '2026-09-23',
    renewals_count: 0,
    max_renewals: 2,
    working_days_left: 0,
    working_days_overdue: 0,
    fine_amount: 0,
    status: 'returned',
  },
  {
    loan_id: 'hist-002',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    edition_no: 4,
    accession_no: 'AI-2023-0104',
    issued_at: '2026-08-25',
    due_date: '2026-09-15',
    returned_at: '2026-09-14',
    renewals_count: 1,
    max_renewals: 2,
    working_days_left: 0,
    working_days_overdue: 0,
    fine_amount: 0,
    status: 'returned',
  },
  {
    loan_id: 'hist-003',
    title: 'Compilers: Principles, Techniques, and Tools',
    author: 'Alfred V. Aho, Monica S. Lam',
    edition_no: 2,
    accession_no: 'CS-2020-0087',
    issued_at: '2026-08-12',
    due_date: '2026-09-02',
    returned_at: '2026-08-30',
    renewals_count: 1,
    max_renewals: 2,
    working_days_left: 0,
    working_days_overdue: 0,
    fine_amount: 0,
    status: 'returned',
  },
  {
    loan_id: 'hist-004',
    title: 'Software Engineering: A Practitioner\'s Approach',
    author: 'Roger S. Pressman',
    edition_no: 9,
    accession_no: 'SE-2022-0442',
    issued_at: '2026-07-20',
    due_date: '2026-08-10',
    returned_at: '2026-08-08',
    renewals_count: 0,
    max_renewals: 2,
    working_days_left: 0,
    working_days_overdue: 0,
    fine_amount: 0,
    status: 'returned',
  },
  {
    loan_id: 'hist-005',
    title: 'Discrete Mathematics and Its Applications',
    author: 'Kenneth H. Rosen',
    edition_no: 8,
    accession_no: 'MA-2023-0519',
    issued_at: '2026-07-01',
    due_date: '2026-07-22',
    returned_at: '2026-07-21',
    renewals_count: 1,
    max_renewals: 2,
    working_days_left: 0,
    working_days_overdue: 0,
    fine_amount: 0,
    status: 'returned',
  },
  {
    loan_id: 'hist-006',
    title: 'Digital Design and Computer Architecture',
    author: 'David Harris, Sarah Harris',
    edition_no: 2,
    accession_no: 'EC-2021-0312',
    issued_at: '2026-06-10',
    due_date: '2026-07-01',
    returned_at: '2026-06-30',
    renewals_count: 1,
    max_renewals: 2,
    working_days_left: 0,
    working_days_overdue: 0,
    fine_amount: 0,
    status: 'returned',
  },
];

export const INITIAL_STUDENT_NOTIFICATIONS: StudentNotification[] = [
  {
    id: 'notif-001',
    type: 'hold_ready',
    title: 'Hold ready for pickup',
    message: 'Operating System Concepts is held for you at the front desk. Pick up by Oct 17.',
    created_at: '2026-10-15T09:30:00Z',
    read: false,
    hold_id: 'hold-002',
  },
  {
    id: 'notif-002',
    type: 'due_soon',
    title: 'Book due in 2 days',
    message: 'Introduction to Algorithms is due on Saturday, Oct 17. Renew now or schedule a return.',
    created_at: '2026-10-15T08:00:00Z',
    read: false,
    loan_id: 'loan-001',
  },
  {
    id: 'notif-003',
    type: 'overdue_notice',
    title: 'Overdue loan notice',
    message: 'Database System Concepts is 4 working days overdue. Current fine: ₹20. Please return promptly.',
    created_at: '2026-10-14T11:00:00Z',
    read: false,
    loan_id: 'loan-003',
  },
  {
    id: 'notif-004',
    type: 'general',
    title: 'Extended library hours',
    message: 'Reading halls and circulation desk remain open until 9:00 PM during mid-term exams.',
    created_at: '2026-10-13T14:15:00Z',
    read: true,
  },
];
