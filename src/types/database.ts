export type LibraryStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'student' | 'librarian' | 'head_librarian' | 'super_admin';
export type UserType = 'undergraduate' | 'postgraduate' | 'phd_scholar' | 'faculty' | 'staff';
export type CopyStatus = 'available' | 'issued' | 'on_hold_shelf' | 'damaged_repair' | 'lost' | 'missing' | 'withdrawn';
export type LoanStatus = 'active' | 'returned' | 'lost'; // Note: Overdue is computed on read!
export type HoldStatus = 'active' | 'fulfilled' | 'cancelled' | 'expired';

export interface Library {
  id: string;
  name: string;
  code: string;
  status: LibraryStatus;
  address?: string;
  contact_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  library_id: string;
  role: UserRole;
  reg_no?: string | null;
  name: string;
  email: string;
  department?: string | null;
  year?: number | null;
  user_type: UserType;
  photo_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Policy {
  id: string;
  library_id: string;
  user_type: UserType;
  loan_days: number;
  max_books: number;
  fine_per_day: number;
  max_renewals: number;
  created_at: string;
  updated_at: string;
}

export interface Work {
  id: string;
  library_id: string;
  title: string;
  author: string;
  subject: string;
  description?: string | null;
  is_withdrawn: boolean;
  withdrawn_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Edition {
  id: string;
  library_id: string;
  work_id: string;
  isbn: string;
  edition_no: number;
  publisher?: string | null;
  year: number;
  cover_url?: string | null;
  is_withdrawn: boolean;
  withdrawn_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Copy {
  id: string;
  library_id: string;
  edition_id: string;
  accession_no: string;
  status: CopyStatus;
  shelf_location: string;
  reference_only: boolean;
  withdrawn_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseMap {
  id: string;
  library_id: string;
  course_code: string;
  course_name: string;
  work_id: string;
  created_at: string;
}

export interface Loan {
  id: string;
  library_id: string;
  copy_id: string;
  user_id: string;
  issued_by?: string | null;
  issued_at: string;
  due_date: string;
  returned_at?: string | null;
  renewals_count: number;
  status: LoanStatus;
  notes?: string | null;
  created_at: string;
  // Computed fields (on read):
  is_overdue?: boolean;
  computed_fine?: number;
}

export interface Holiday {
  id: string;
  library_id: string;
  date: string;
  name: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  library_id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
  created_at: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  masked_email?: string;
  masked_name?: string;
  error?: string;
  demo_otp?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  profile?: Profile;
  error?: string;
}

// ====================================================================
// Phase 1 RPC Types
// ====================================================================

export interface SearchResultWork {
  work_id: string;
  title: string;
  author: string;
  subject: string;
  description?: string | null;
  latest_edition_id: string;
  latest_edition_no: number;
  cover_url?: string | null;
  edition_count: number;
  total_copies: number;
  available_copies: number;
  reference_only_copies: number;
  last_updated: string;
  course_codes: string[];
  rank_score?: number;
}

export interface CopyDetail {
  id: string;
  accession_no: string;
  shelf_location: string;
  reference_only: boolean;
  status: CopyStatus;
}

export interface EditionDetail {
  edition_id: string;
  isbn: string;
  edition_no: number;
  publisher?: string | null;
  year: number;
  price?: number | null;
  cover_url?: string | null;
  is_latest: boolean;
  total_copies: number;
  available_copies: number;
  reference_copies: number;
  issued_copies: number;
  copies: CopyDetail[];
}

export interface WorkDetail {
  work_id: string;
  library_id: string;
  title: string;
  author: string;
  subject: string;
  description?: string | null;
  total_copies: number;
  available_copies: number;
  reference_only_copies: number;
  course_codes: string[];
  editions: EditionDetail[];
  last_updated: string;
}

export interface StudentLoan {
  loan_id: string;
  library_id: string;
  issued_at: string;
  due_date: string;
  renewals_count: number;
  is_overdue: boolean;
  working_days_diff: number; // working days left or overdue working days
  computed_fine: number;
  accession_no: string;
  shelf_location: string;
  isbn: string;
  edition_no: number;
  cover_url?: string | null;
  work_id: string;
  book_title: string;
  book_author: string;
  book_subject: string;
}

