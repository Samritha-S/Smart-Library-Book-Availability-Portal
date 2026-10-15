// In-memory implementation of the Staff API functions for testing and demo mode
import {
  StudentSearchResult,
  CopySearchResult,
  IssueCopyResult,
  ReturnCopyResult,
  ImportCatalogResult,
  CatalogueSearchParams,
  CatalogueSearchResult,
  CatalogueItem,
  CopyUpdates,
  ImportBatchRow,
  ImportReviewItem,
  ImportResolution,
  StaffActivityItem,
  StaffOverviewStats,
} from './types';

// ====================================================================
// In-Memory Database Stores
// ====================================================================

interface MockUser {
  user_id: string;
  name: string;
  photo_url: string | null;
  reg_no: string;
  department: string;
  year: number;
  user_type: string;
  active_loans: number;
  max_loans: number;
  borrowing_blocked: boolean;
  block_reason: string | null;
}

interface MockCopy {
  copy_id: string;
  accession_no: string;
  work_id: string;
  edition_id: string;
  title: string;
  author: string;
  isbn?: string;
  subject?: string;
  edition_no?: string | number | null;
  year?: number | null;
  cover_url: string | null;
  shelf_location: string;
  status: 'available' | 'issued' | 'on_hold_shelf' | 'damaged_repair' | 'lost' | 'missing' | 'withdrawn';
  reference_only: boolean;
  withdrawn_reason?: string | null;
  current_borrower_id?: string | null;
  current_borrower_name?: string | null;
  current_borrower_reg?: string | null;
  due_date?: string | null;
  hold_for_name?: string | null;
  updated_at: string;
}

interface MockLoan {
  loan_id: string;
  copy_id: string;
  user_id: string;
  issued_at: string;
  due_date: string;
  returned_at?: string | null;
  working_days_overdue: number;
  fine_amount: number;
}

interface MockQrRecord {
  token: string;
  user_id: string;
  expires_at: number; // timestamp
}

// Initial Mock Students
const MOCK_STUDENTS: MockUser[] = [
  {
    user_id: 'usr-001',
    name: 'Aarav Sharma',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    reg_no: 'AIT2023CS001',
    department: 'Computer Science & Engineering',
    year: 3,
    user_type: 'Undergraduate',
    active_loans: 1,
    max_loans: 3,
    borrowing_blocked: false,
    block_reason: null,
  },
  {
    user_id: 'usr-002',
    name: 'Diya Patel',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    reg_no: 'AIT2023CS002',
    department: 'Computer Science & Engineering',
    year: 3,
    user_type: 'Undergraduate',
    active_loans: 0,
    max_loans: 3,
    borrowing_blocked: false,
    block_reason: null,
  },
  {
    user_id: 'usr-003',
    name: 'Rohan Iyer',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    reg_no: 'AIT2023EC001',
    department: 'Electronics & Communication',
    year: 2,
    user_type: 'Undergraduate',
    active_loans: 3,
    max_loans: 3,
    borrowing_blocked: false,
    block_reason: null,
  },
  {
    user_id: 'usr-004',
    name: 'Priya Nair',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    reg_no: 'AIT2022ME044',
    department: 'Mechanical Engineering',
    year: 4,
    user_type: 'Undergraduate',
    active_loans: 1,
    max_loans: 3,
    borrowing_blocked: true,
    block_reason: 'Account suspended: Outstanding late return penalty of ₹320 unpaid.',
  },
  {
    user_id: 'usr-005',
    name: 'Dr. Vikram Seth',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    reg_no: 'FAC2019CS007',
    department: 'Computer Science & Engineering',
    year: 1,
    user_type: 'Faculty',
    active_loans: 2,
    max_loans: 10,
    borrowing_blocked: false,
    block_reason: null,
  },
];

// Initial Mock Book Copies
const MOCK_COPIES: MockCopy[] = [
  {
    copy_id: 'cpy-1001',
    accession_no: 'ACC-1001',
    work_id: 'wrk-01',
    edition_id: 'ed-01',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
    isbn: '9780262033848',
    subject: 'Computer Science',
    edition_no: 3,
    year: 2009,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg',
    shelf_location: 'CS-01-A',
    status: 'available',
    reference_only: false,
    updated_at: '2026-10-14T10:15:00Z',
  },
  {
    copy_id: 'cpy-1002',
    accession_no: 'ACC-1002',
    work_id: 'wrk-01',
    edition_id: 'ed-01',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
    isbn: '9780262033848',
    subject: 'Computer Science',
    edition_no: 3,
    year: 2009,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg',
    shelf_location: 'CS-01-A',
    status: 'available',
    reference_only: false,
    updated_at: '2026-10-12T09:20:00Z',
  },
  {
    copy_id: 'cpy-1003',
    accession_no: 'ACC-1003',
    work_id: 'wrk-01',
    edition_id: 'ed-01',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
    isbn: '9780262033848',
    subject: 'Computer Science',
    edition_no: 3,
    year: 2009,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg',
    shelf_location: 'CS-REF-01',
    status: 'available',
    reference_only: true,
    updated_at: '2026-10-10T08:00:00Z',
  },
  {
    copy_id: 'cpy-1004',
    accession_no: 'ACC-1004',
    work_id: 'wrk-02',
    edition_id: 'ed-02',
    title: 'The C Programming Language',
    author: 'Brian W. Kernighan, Dennis M. Ritchie',
    isbn: '9780131103627',
    subject: 'Computer Science',
    edition_no: 2,
    year: 1988,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780131103627-M.jpg',
    shelf_location: 'CS-02-B',
    status: 'issued',
    reference_only: false,
    current_borrower_id: 'usr-001',
    current_borrower_name: 'Aarav Sharma',
    current_borrower_reg: 'AIT2023CS001',
    due_date: '2026-10-22',
    updated_at: '2026-10-08T11:45:00Z',
  },
  {
    copy_id: 'cpy-1006',
    accession_no: 'ACC-1006',
    work_id: 'wrk-03',
    edition_id: 'ed-03',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    subject: 'Software Engineering',
    edition_no: 1,
    year: 2008,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg',
    shelf_location: 'CS-03-C',
    status: 'available',
    reference_only: false,
    updated_at: '2026-10-14T14:30:00Z',
  },
  {
    copy_id: 'cpy-1007',
    accession_no: 'ACC-1007',
    work_id: 'wrk-04',
    edition_id: 'ed-04',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt, David Thomas',
    isbn: '9780201616224',
    subject: 'Software Engineering',
    edition_no: 1,
    year: 1999,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780201616224-M.jpg',
    shelf_location: 'CS-03-C',
    status: 'issued',
    reference_only: false,
    current_borrower_id: 'usr-003',
    current_borrower_name: 'Rohan Iyer',
    current_borrower_reg: 'AIT2023EC001',
    due_date: '2026-10-10', // overdue by 5 days
    updated_at: '2026-09-26T16:00:00Z',
  },
  {
    copy_id: 'cpy-1010',
    accession_no: 'ACC-1010',
    work_id: 'wrk-05',
    edition_id: 'ed-05',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '9781449373320',
    subject: 'Database Systems',
    edition_no: 1,
    year: 2017,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9781449373320-M.jpg',
    shelf_location: 'DB-01-A',
    status: 'issued',
    reference_only: false,
    current_borrower_id: 'usr-005',
    current_borrower_name: 'Dr. Vikram Seth',
    current_borrower_reg: 'FAC2019CS007',
    due_date: '2026-10-18',
    hold_for_name: 'Ananya Rao', // Next status will be 'Held for Ananya Rao'
    updated_at: '2026-10-01T10:00:00Z',
  },
  {
    copy_id: 'cpy-1011',
    accession_no: 'ACC-1011',
    work_id: 'wrk-06',
    edition_id: 'ed-06',
    title: 'Operating Systems: Internals and Design Principles',
    author: 'William Stallings',
    isbn: '9780133594140',
    subject: 'Operating Systems',
    edition_no: 9,
    year: 2017,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780133594140-M.jpg',
    shelf_location: 'OS-01-A',
    status: 'available',
    reference_only: false,
    updated_at: '2026-10-11T12:00:00Z',
  },
  {
    copy_id: 'cpy-1012',
    accession_no: 'ACC-1012',
    work_id: 'wrk-07',
    edition_id: 'ed-07',
    title: 'Operating System Concepts',
    author: 'Abraham Silberschatz, Peter B. Galvin',
    isbn: '9781119456339',
    subject: 'Operating Systems',
    edition_no: 10,
    year: 2018,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9781119456339-M.jpg',
    shelf_location: 'REPAIR-BAY',
    status: 'damaged_repair',
    reference_only: false,
    withdrawn_reason: 'Binding loosened during monsoon circulation',
    updated_at: '2026-10-05T09:10:00Z',
  },
  {
    copy_id: 'cpy-1016',
    accession_no: 'ACC-1016',
    work_id: 'wrk-08',
    edition_id: 'ed-08',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    isbn: '9780134093413',
    subject: 'Artificial Intelligence',
    edition_no: 4,
    year: 2020,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780134093413-M.jpg',
    shelf_location: 'AI-01-A',
    status: 'available',
    reference_only: false,
    updated_at: '2026-10-13T15:20:00Z',
  },
];

// Initial Active Loans
const MOCK_LOANS: MockLoan[] = [
  {
    loan_id: 'ln-001',
    copy_id: 'cpy-1004',
    user_id: 'usr-001',
    issued_at: '2026-10-08T11:45:00Z',
    due_date: '2026-10-22',
    working_days_overdue: 0,
    fine_amount: 0,
  },
  {
    loan_id: 'ln-002',
    copy_id: 'cpy-1007',
    user_id: 'usr-003',
    issued_at: '2026-09-26T16:00:00Z',
    due_date: '2026-10-10',
    working_days_overdue: 4,
    fine_amount: 20, // 4 days * ₹5
  },
  {
    loan_id: 'ln-003',
    copy_id: 'cpy-1010',
    user_id: 'usr-005',
    issued_at: '2026-10-01T10:00:00Z',
    due_date: '2026-10-18',
    working_days_overdue: 0,
    fine_amount: 0,
  },
];

// Initial Recent Activity
const MOCK_ACTIVITY: StaffActivityItem[] = [
  {
    id: 'act-1',
    type: 'issue',
    accession_no: 'ACC-1004',
    title: 'The C Programming Language',
    student_name: 'Aarav Sharma',
    reg_no: 'AIT2023CS001',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    details: 'Due on 22 Oct 2026 (14 working days)',
  },
  {
    id: 'act-2',
    type: 'return',
    accession_no: 'ACC-1001',
    title: 'Introduction to Algorithms',
    student_name: 'Diya Patel',
    reg_no: 'AIT2023CS002',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    details: 'Returned on time (Zero fine)',
  },
  {
    id: 'act-3',
    type: 'update',
    accession_no: 'ACC-1016',
    title: 'Artificial Intelligence: A Modern Approach',
    timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
    details: 'Shelf relocated to AI-01-A',
  },
  {
    id: 'act-4',
    type: 'withdraw',
    accession_no: 'ACC-1012',
    title: 'Operating System Concepts',
    timestamp: new Date(Date.now() - 1000 * 60 * 340).toISOString(),
    details: 'Flagged damaged_repair: Binding loosened',
  },
];

// Initial Import Review Items
const MOCK_REVIEWS: ImportReviewItem[] = [
  {
    id: 'rev-01',
    accession_no: 'ACC-1026',
    title: 'Principles of Digital Communication',
    author: 'Robert Gallager',
    suggested_title: 'Principles of Digital Communication (Cambridge Core)',
    suggested_author: 'Robert G. Gallager',
    suggested_year: 2008,
    reason: 'Missing ISBN in batch row; closest title matched in library records',
    status: 'pending',
    created_at: '2026-10-15T08:30:00Z',
  },
  {
    id: 'rev-02',
    accession_no: 'ACC-1028',
    isbn: '9780000000000',
    title: 'Unverified Rare Manuscript on Graph Theory',
    author: 'Euler Archive',
    suggested_title: 'Foundations of Graph Theory (1736-1936)',
    suggested_author: 'N. Biggs, E. Lloyd, R. Wilson',
    reason: 'Open Library returned 404 for placeholder ISBN; manual metadata required',
    status: 'pending',
    created_at: '2026-10-15T09:15:00Z',
  },
];

// Active QR tokens store
const MOCK_QR_TOKENS: MockQrRecord[] = [
  {
    token: 'QR-STU-AARAV-SECURE-99',
    user_id: 'usr-001',
    expires_at: Date.now() + 60 * 1000,
  },
];

// ====================================================================
// Implementation of Typed Staff Functions
// ====================================================================

/**
 * 1. verify_qr_token
 */
export async function verify_qr_token(token: string): Promise<StudentSearchResult> {
  await new Promise((r) => setTimeout(r, 120)); // realistic latency

  // Check active QR registry or match direct token format
  const qrRecord = MOCK_QR_TOKENS.find(
    (q) => q.token.trim().toLowerCase() === token.trim().toLowerCase()
  );

  let targetUserId = qrRecord?.user_id;

  // Fallback pattern matching for mock flexibility (e.g. token containing reg no)
  if (!targetUserId) {
    const studentByReg = MOCK_STUDENTS.find(
      (s) =>
        token.toLowerCase().includes(s.reg_no.toLowerCase()) ||
        token.toLowerCase().includes(s.user_id.toLowerCase())
    );
    if (studentByReg) {
      targetUserId = studentByReg.user_id;
    }
  }

  if (!targetUserId) {
    throw new Error('QR token expired or invalid. Ask student to generate a fresh QR code.');
  }

  const student = MOCK_STUDENTS.find((s) => s.user_id === targetUserId);
  if (!student) {
    throw new Error('Student profile associated with QR token not found in library directory.');
  }

  return {
    user_id: student.user_id,
    name: student.name,
    photo_url: student.photo_url,
    reg_no: student.reg_no,
    department: student.department,
    year: student.year,
    user_type: student.user_type,
    active_loans: student.active_loans,
    borrowing_blocked: student.borrowing_blocked,
    block_reason: student.block_reason,
  };
}

/**
 * 2. find_student_by_reg_no
 */
export async function find_student_by_reg_no(reg_no: string): Promise<StudentSearchResult> {
  await new Promise((r) => setTimeout(r, 120));

  const clean = reg_no.trim().toLowerCase();
  const student = MOCK_STUDENTS.find(
    (s) => s.reg_no.toLowerCase() === clean || s.name.toLowerCase().includes(clean)
  );

  if (!student) {
    throw new Error(`No student found with register number "${reg_no}". Please verify the register number.`);
  }

  return {
    user_id: student.user_id,
    name: student.name,
    photo_url: student.photo_url,
    reg_no: student.reg_no,
    department: student.department,
    year: student.year,
    user_type: student.user_type,
    active_loans: student.active_loans,
    borrowing_blocked: student.borrowing_blocked,
    block_reason: student.block_reason,
  };
}

/**
 * 3. find_copy_by_accession
 */
export async function find_copy_by_accession(accession_no: string): Promise<CopySearchResult> {
  await new Promise((r) => setTimeout(r, 100));

  const clean = accession_no.trim().toLowerCase();
  const copy = MOCK_COPIES.find((c) => c.accession_no.toLowerCase() === clean);

  if (!copy) {
    throw new Error(`Copy not found with accession number "${accession_no}". Check the barcode label.`);
  }

  return {
    copy_id: copy.copy_id,
    accession_no: copy.accession_no,
    title: copy.title,
    author: copy.author,
    edition_no: copy.edition_no,
    cover_url: copy.cover_url,
    shelf_location: copy.shelf_location,
    status: copy.status,
    reference_only: copy.reference_only,
    current_borrower_name: copy.current_borrower_name || null,
  };
}

/**
 * 4. issue_copy
 */
export async function issue_copy(user_id: string, copy_id: string): Promise<IssueCopyResult> {
  await new Promise((r) => setTimeout(r, 180));

  const student = MOCK_STUDENTS.find((s) => s.user_id === user_id);
  if (!student) {
    throw new Error('Student account not found in active session.');
  }

  if (student.borrowing_blocked) {
    throw new Error(`Borrowing blocked: ${student.block_reason || 'Administrative hold on card'}`);
  }

  if (student.active_loans >= student.max_loans) {
    throw new Error(
      `Borrowing limit reached: ${student.name} currently holds ${student.active_loans} of maximum ${student.max_loans} allowed books.`
    );
  }

  const copy = MOCK_COPIES.find((c) => c.copy_id === copy_id || c.accession_no.toLowerCase() === copy_id.toLowerCase());
  if (!copy) {
    throw new Error('Book copy not found.');
  }

  if (copy.reference_only) {
    throw new Error('This copy is designated Reference Only and cannot be issued outside the library.');
  }

  if (copy.status === 'issued') {
    throw new Error(`Copy is already issued to ${copy.current_borrower_name || 'another borrower'}.`);
  }

  if (copy.status === 'withdrawn' || copy.status === 'damaged_repair') {
    throw new Error(`Cannot issue copy: current status is "${copy.status}".`);
  }

  // Calculate due date (14 working days)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateStr = dueDate.toISOString().split('T')[0];

  const loanId = `ln-${Date.now()}`;

  // Update copy status
  copy.status = 'issued';
  copy.current_borrower_id = student.user_id;
  copy.current_borrower_name = student.name;
  copy.current_borrower_reg = student.reg_no;
  copy.due_date = dueDateStr;
  copy.updated_at = new Date().toISOString();

  // Update student loans count
  student.active_loans += 1;

  // Insert loan
  MOCK_LOANS.push({
    loan_id: loanId,
    copy_id: copy.copy_id,
    user_id: student.user_id,
    issued_at: new Date().toISOString(),
    due_date: dueDateStr,
    working_days_overdue: 0,
    fine_amount: 0,
  });

  // Log activity
  MOCK_ACTIVITY.unshift({
    id: `act-${Date.now()}`,
    type: 'issue',
    accession_no: copy.accession_no,
    title: copy.title,
    student_name: student.name,
    reg_no: student.reg_no,
    timestamp: new Date().toISOString(),
    details: `Due on ${dueDateStr}`,
  });

  return {
    loan_id: loanId,
    due_date: dueDateStr,
  };
}

/**
 * 5. return_copy
 */
export async function return_copy(accession_no: string): Promise<ReturnCopyResult> {
  await new Promise((r) => setTimeout(r, 180));

  const clean = accession_no.trim().toLowerCase();
  const copy = MOCK_COPIES.find((c) => c.accession_no.toLowerCase() === clean);

  if (!copy) {
    throw new Error(`Accession number "${accession_no}" not found in catalogue.`);
  }

  if (copy.status !== 'issued') {
    throw new Error(`Copy "${copy.accession_no}" is not marked as issued (current status: ${copy.status}).`);
  }

  const borrowerName = copy.current_borrower_name || 'Registered borrower';
  const borrowerReg = copy.current_borrower_reg || 'N/A';
  const dueDateStr = copy.due_date || new Date().toISOString().split('T')[0];

  // Overdue calculation
  const dueDate = new Date(dueDateStr);
  const now = new Date();
  const diffDays = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
  const fineAmount = diffDays * 5; // ₹5 per day

  // Find next status: check holds
  let nextStatus = 'Available';
  if (copy.hold_for_name) {
    nextStatus = `Held for ${copy.hold_for_name}`;
    copy.status = 'on_hold_shelf';
  } else {
    copy.status = 'available';
  }

  // Update student loan count
  if (copy.current_borrower_id) {
    const student = MOCK_STUDENTS.find((s) => s.user_id === copy.current_borrower_id);
    if (student && student.active_loans > 0) {
      student.active_loans -= 1;
    }
  }

  const loanId = `ret-${Date.now()}`;
  const returnedAtStr = new Date().toISOString();

  // Reset copy borrower info
  copy.current_borrower_id = null;
  copy.current_borrower_name = null;
  copy.current_borrower_reg = null;
  copy.due_date = null;
  copy.updated_at = returnedAtStr;

  // Log activity
  MOCK_ACTIVITY.unshift({
    id: `act-${Date.now()}`,
    type: 'return',
    accession_no: copy.accession_no,
    title: copy.title,
    student_name: borrowerName,
    reg_no: borrowerReg,
    timestamp: returnedAtStr,
    details: fineAmount > 0 ? `Overdue by ${diffDays} days (Fine: ₹${fineAmount})` : 'Returned on time',
  });

  return {
    loan_id: loanId,
    student_name: borrowerName,
    reg_no: borrowerReg,
    title: copy.title,
    due_date: dueDateStr,
    returned_at: returnedAtStr,
    working_days_overdue: diffDays,
    fine_amount: fineAmount,
    next_status: nextStatus,
  };
}

/**
 * 6. catalogue_search
 */
export async function catalogue_search(params: CatalogueSearchParams = {}): Promise<CatalogueSearchResult> {
  await new Promise((r) => setTimeout(r, 140));

  let results = [...MOCK_COPIES];

  if (params.query) {
    const q = params.query.toLowerCase().trim();
    results = results.filter(
      (c) =>
        c.accession_no.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        (c.isbn && c.isbn.toLowerCase().includes(q)) ||
        (c.shelf_location && c.shelf_location.toLowerCase().includes(q))
    );
  }

  if (params.status && params.status !== 'all') {
    results = results.filter((c) => c.status === params.status);
  }

  if (params.shelf_location) {
    results = results.filter((c) =>
      c.shelf_location.toLowerCase().includes(params.shelf_location!.toLowerCase())
    );
  }

  if (params.reference_only !== undefined) {
    results = results.filter((c) => c.reference_only === params.reference_only);
  }

  // Sorting
  const sortBy = params.sort_by || 'accession_no';
  const sortOrder = params.sort_order || 'asc';
  results.sort((a, b) => {
    const valA = (a as unknown as Record<string, string | number>)[sortBy] ?? '';
    const valB = (b as unknown as Record<string, string | number>)[sortBy] ?? '';
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalCount = results.length;
  const page = params.page || 1;
  const pageSize = params.page_size || 20;
  const start = (page - 1) * pageSize;
  const paginated = results.slice(start, start + pageSize);

  return {
    items: paginated as CatalogueItem[],
    total_count: totalCount,
    page,
    page_size: pageSize,
  };
}

/**
 * 7. update_copy
 */
export async function update_copy(copy_id: string, updates: CopyUpdates): Promise<CatalogueItem> {
  await new Promise((r) => setTimeout(r, 150));

  const copy = MOCK_COPIES.find((c) => c.copy_id === copy_id);
  if (!copy) {
    throw new Error(`Copy with ID "${copy_id}" not found.`);
  }

  if (updates.shelf_location !== undefined) {
    copy.shelf_location = updates.shelf_location.trim().toUpperCase();
  }
  if (updates.status !== undefined) {
    copy.status = updates.status;
  }
  if (updates.reference_only !== undefined) {
    copy.reference_only = updates.reference_only;
  }

  copy.updated_at = new Date().toISOString();

  MOCK_ACTIVITY.unshift({
    id: `act-${Date.now()}`,
    type: 'update',
    accession_no: copy.accession_no,
    title: copy.title,
    timestamp: copy.updated_at,
    details: `Updated: shelf ${copy.shelf_location}, status ${copy.status}`,
  });

  return copy as CatalogueItem;
}

/**
 * 8. withdraw_record
 */
export async function withdraw_record(copy_id: string, reason: string): Promise<{ success: boolean; copy_id: string }> {
  await new Promise((r) => setTimeout(r, 160));

  if (!reason || reason.trim().length < 5) {
    throw new Error('A valid reason of at least 5 characters is strictly required to withdraw a book record.');
  }

  const copy = MOCK_COPIES.find((c) => c.copy_id === copy_id);
  if (!copy) {
    throw new Error(`Copy with ID "${copy_id}" not found.`);
  }

  if (copy.status === 'issued') {
    throw new Error('Cannot withdraw a copy that is currently issued to a borrower. Return the copy first.');
  }

  copy.status = 'withdrawn';
  copy.withdrawn_reason = reason.trim();
  copy.updated_at = new Date().toISOString();

  MOCK_ACTIVITY.unshift({
    id: `act-${Date.now()}`,
    type: 'withdraw',
    accession_no: copy.accession_no,
    title: copy.title,
    timestamp: copy.updated_at,
    details: `Withdrawn: ${reason.trim()}`,
  });

  return { success: true, copy_id };
}

/**
 * 9. import_catalog_batch
 */
export async function import_catalog_batch(rows: ImportBatchRow[]): Promise<ImportCatalogResult> {
  await new Promise((r) => setTimeout(r, 350));

  let worksCreated = 0;
  let editionsCreated = 0;
  let copiesCreated = 0;
  let copiesSkipped = 0;
  let sentToReview = 0;

  for (const row of rows) {
    if (!row.accession_no || !row.title) {
      copiesSkipped++;
      continue;
    }

    // Check existing accession
    const exists = MOCK_COPIES.some(
      (c) => c.accession_no.toLowerCase() === row.accession_no.trim().toLowerCase()
    );
    if (exists) {
      copiesSkipped++;
      continue;
    }

    // If missing ISBN or flagged
    if (!row.isbn || row.isbn.trim() === '' || row.isbn.startsWith('000')) {
      sentToReview++;
      MOCK_REVIEWS.push({
        id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        accession_no: row.accession_no,
        isbn: row.isbn || undefined,
        title: row.title,
        author: row.author,
        suggested_title: row.title,
        reason: !row.isbn ? 'Missing ISBN in batch data' : 'ISBN lookup returned unverified record',
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      continue;
    }

    // Add to mock copies
    const newCopyId = `cpy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    MOCK_COPIES.push({
      copy_id: newCopyId,
      accession_no: row.accession_no.trim(),
      work_id: `wrk-${row.title.toLowerCase().replace(/\s+/g, '-')}`,
      edition_id: `ed-${row.isbn}`,
      title: row.title.trim(),
      author: row.author.trim(),
      isbn: row.isbn.trim(),
      subject: row.subject || 'General',
      edition_no: row.edition_no || 1,
      year: typeof row.year === 'number' ? row.year : parseInt(String(row.year) || '2024', 10),
      cover_url: `https://covers.openlibrary.org/b/isbn/${row.isbn.trim()}-M.jpg`,
      shelf_location: row.shelf_location || 'UNASSIGNED',
      status: 'available',
      reference_only: String(row.reference_only) === 'true',
      updated_at: new Date().toISOString(),
    });

    worksCreated++;
    editionsCreated++;
    copiesCreated++;
  }

  MOCK_ACTIVITY.unshift({
    id: `act-${Date.now()}`,
    type: 'update',
    accession_no: `BATCH-${rows.length}`,
    title: `Catalog batch imported (${copiesCreated} copies added)`,
    timestamp: new Date().toISOString(),
    details: `${worksCreated} works, ${sentToReview} to review, ${copiesSkipped} skipped`,
  });

  return {
    works_created: worksCreated,
    editions_created: editionsCreated,
    copies_created: copiesCreated,
    copies_skipped: copiesSkipped,
    sent_to_review: sentToReview,
  };
}

/**
 * 10. list_import_review
 */
export async function list_import_review(): Promise<ImportReviewItem[]> {
  await new Promise((r) => setTimeout(r, 100));
  return [...MOCK_REVIEWS];
}

/**
 * 11. resolve_import_review
 */
export async function resolve_import_review(
  review_id: string,
  resolution: ImportResolution
): Promise<{ success: boolean; review_id: string }> {
  await new Promise((r) => setTimeout(r, 150));

  const index = MOCK_REVIEWS.findIndex((r) => r.id === review_id);
  if (index === -1) {
    throw new Error(`Review item "${review_id}" not found.`);
  }

  const item = MOCK_REVIEWS[index];

  if (resolution.action === 'dismiss') {
    item.status = 'dismissed';
  } else {
    item.status = 'resolved';
    // If accepted or overridden, add copy into catalog
    MOCK_COPIES.push({
      copy_id: `cpy-rev-${Date.now()}`,
      accession_no: item.accession_no,
      work_id: `wrk-${(resolution.title || item.title).toLowerCase().replace(/\s+/g, '-')}`,
      edition_id: `ed-${resolution.isbn || item.isbn || 'none'}`,
      title: resolution.title || item.suggested_title || item.title,
      author: resolution.author || item.suggested_author || item.author,
      isbn: resolution.isbn || item.isbn,
      shelf_location: resolution.shelf_location || 'CS-NEW-01',
      status: 'available',
      reference_only: false,
      cover_url: item.suggested_cover_url || null,
      updated_at: new Date().toISOString(),
    });
  }

  return { success: true, review_id };
}

/**
 * 12. staff_recent_activity
 */
export async function staff_recent_activity(limit: number = 15): Promise<StaffActivityItem[]> {
  await new Promise((r) => setTimeout(r, 80));
  return MOCK_ACTIVITY.slice(0, limit);
}

/**
 * Extra: staff_overview_stats
 */
export async function staff_overview_stats(): Promise<StaffOverviewStats> {
  const issuesToday = MOCK_ACTIVITY.filter(
    (a) => a.type === 'issue'
  ).length;
  const returnsToday = MOCK_ACTIVITY.filter(
    (a) => a.type === 'return'
  ).length;
  const overdueCount = MOCK_LOANS.filter((l) => l.working_days_overdue > 0).length;
  const holdsWaiting = MOCK_COPIES.filter((c) => c.status === 'on_hold_shelf').length;
  const totalCatalogued = MOCK_COPIES.length;

  return {
    issues_today: issuesToday,
    returns_today: returnsToday,
    overdue_count: overdueCount,
    holds_waiting: holdsWaiting,
    total_catalogued: totalCatalogued,
  };
}

/**
 * Helper for QR creation (used by ShowQr.tsx)
 */
export async function create_qr_token(user_id?: string): Promise<{ token: string; expires_at: string; valid_seconds: number }> {
  await new Promise((r) => setTimeout(r, 120));
  const targetUser = user_id
    ? MOCK_STUDENTS.find((s) => s.user_id === user_id || s.reg_no === user_id)
    : MOCK_STUDENTS[0];

  const uid = targetUser ? targetUser.user_id : 'usr-001';
  const regNo = targetUser ? targetUser.reg_no : 'AIT2023CS001';
  const token = `QR-${regNo}-${Date.now().toString(36).toUpperCase()}`;

  const expiresTimestamp = Date.now() + 60 * 1000;
  MOCK_QR_TOKENS.push({
    token,
    user_id: uid,
    expires_at: expiresTimestamp,
  });

  return {
    token,
    expires_at: new Date(expiresTimestamp).toISOString(),
    valid_seconds: 60,
  };
}
