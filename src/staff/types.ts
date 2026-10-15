export interface StudentSearchResult {
  user_id: string;
  name: string;
  photo_url: string | null;
  reg_no: string;
  department: string;
  year: number;
  user_type: string;
  active_loans: number;
  borrowing_blocked: boolean;
  block_reason: string | null;
}

export interface CopySearchResult {
  copy_id: string;
  accession_no: string;
  title: string;
  author: string;
  edition_no?: string | number | null;
  cover_url: string | null;
  shelf_location: string;
  status: string;
  reference_only: boolean;
  current_borrower_name: string | null;
}

export interface IssueCopyResult {
  loan_id: string;
  due_date: string;
}

export interface ReturnCopyResult {
  loan_id: string;
  student_name: string;
  reg_no: string;
  title: string;
  due_date: string;
  returned_at: string;
  working_days_overdue: number;
  fine_amount: number;
  next_status: string; // e.g., 'Available' or 'Held for Ananya'
}

export interface ImportCatalogResult {
  works_created: number;
  editions_created: number;
  copies_created: number;
  copies_skipped: number;
  sent_to_review: number;
}

export interface CatalogueSearchParams {
  query?: string;
  status?: string;
  shelf_location?: string;
  reference_only?: boolean;
  page?: number;
  page_size?: number;
  sort_by?: 'accession_no' | 'title' | 'author' | 'shelf_location' | 'status';
  sort_order?: 'asc' | 'desc';
}

export interface CatalogueItem {
  copy_id: string;
  accession_no: string;
  work_id: string;
  edition_id: string;
  title: string;
  author: string;
  isbn?: string;
  subject?: string;
  edition_no?: number | string | null;
  year?: number | null;
  cover_url?: string | null;
  shelf_location: string;
  status: 'available' | 'issued' | 'on_hold_shelf' | 'damaged_repair' | 'lost' | 'missing' | 'withdrawn';
  reference_only: boolean;
  withdrawn_reason?: string | null;
  current_borrower_name?: string | null;
  due_date?: string | null;
  updated_at: string;
}

export interface CatalogueSearchResult {
  items: CatalogueItem[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface CopyUpdates {
  shelf_location?: string;
  status?: 'available' | 'issued' | 'on_hold_shelf' | 'damaged_repair' | 'lost' | 'missing' | 'withdrawn';
  reference_only?: boolean;
}

export interface ImportBatchRow {
  accession_no: string;
  isbn?: string;
  title: string;
  author: string;
  subject?: string;
  edition_no?: string | number;
  year?: string | number;
  shelf_location?: string;
  reference_only?: boolean | string;
}

export interface ImportReviewItem {
  id: string;
  accession_no: string;
  isbn?: string;
  title: string;
  author: string;
  suggested_title?: string;
  suggested_author?: string;
  suggested_cover_url?: string;
  suggested_year?: number;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface ImportResolution {
  title?: string;
  author?: string;
  isbn?: string;
  shelf_location?: string;
  action: 'accept' | 'override' | 'dismiss';
}

export interface StaffActivityItem {
  id: string;
  type: 'issue' | 'return' | 'update' | 'withdraw';
  accession_no: string;
  title: string;
  student_name?: string;
  reg_no?: string;
  timestamp: string;
  details?: string;
}

export interface StaffOverviewStats {
  issues_today: number;
  returns_today: number;
  overdue_count: number;
  holds_waiting: number;
  total_catalogued: number;
}
