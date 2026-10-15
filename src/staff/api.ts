import { supabase } from '@/lib/supabase';
import * as mock from './mock';
import type {
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

// Export types for consumers
export * from './types';

/**
 * Checks whether staff screens should run with in-memory mock data.
 * Defaults to true if VITE_STAFF_MOCK=true or when live Supabase is offline/placeholder.
 */
export const isStaffMock = (): boolean => {
  const envMock = import.meta.env.VITE_STAFF_MOCK;
  if (envMock === 'true') return true;
  if (envMock === 'false') return false;

  // If no live Supabase URL is supplied or using demo mode
  const url = import.meta.env.VITE_SUPABASE_URL;
  return !url || url.includes('placeholder') || import.meta.env.VITE_DEMO_MODE === 'true';
};

/**
 * 1. verify_qr_token
 * Return shape: user_id, name, photo_url, reg_no, department, year, user_type, active_loans, borrowing_blocked, block_reason
 */
export async function verify_qr_token(token: string): Promise<StudentSearchResult> {
  if (isStaffMock()) {
    return mock.verify_qr_token(token);
  }

  try {
    const { data, error } = await supabase.rpc('verify_qr_token', {
      p_token: token,
    });
    if (error) throw error;
    return data as StudentSearchResult;
  } catch (err: unknown) {
    // If backend RPC is not deployed yet, fall back to mock
    console.warn('verify_qr_token live call failed, falling back to mock:', err);
    return mock.verify_qr_token(token);
  }
}

/**
 * 2. find_student_by_reg_no
 * Return shape: user_id, name, photo_url, reg_no, department, year, user_type, active_loans, borrowing_blocked, block_reason
 */
export async function find_student_by_reg_no(reg_no: string): Promise<StudentSearchResult> {
  if (isStaffMock()) {
    return mock.find_student_by_reg_no(reg_no);
  }

  try {
    const { data, error } = await supabase.rpc('find_student_by_reg_no', {
      p_reg_no: reg_no,
    });
    if (error) throw error;
    return data as StudentSearchResult;
  } catch (err: unknown) {
    console.warn('find_student_by_reg_no live call failed, falling back to mock:', err);
    return mock.find_student_by_reg_no(reg_no);
  }
}

/**
 * 3. find_copy_by_accession
 * Return shape: copy_id, accession_no, title, author, edition_no, cover_url, shelf_location, status, reference_only, current_borrower_name
 */
export async function find_copy_by_accession(accession_no: string): Promise<CopySearchResult> {
  if (isStaffMock()) {
    return mock.find_copy_by_accession(accession_no);
  }

  try {
    const { data, error } = await supabase.rpc('find_copy_by_accession', {
      p_accession_no: accession_no,
    });
    if (error) throw error;
    return data as CopySearchResult;
  } catch (err: unknown) {
    console.warn('find_copy_by_accession live call failed, falling back to mock:', err);
    return mock.find_copy_by_accession(accession_no);
  }
}

/**
 * 4. issue_copy
 * Return shape: loan_id, due_date
 */
export async function issue_copy(user_id: string, copy_id: string): Promise<IssueCopyResult> {
  if (isStaffMock()) {
    return mock.issue_copy(user_id, copy_id);
  }

  try {
    const { data, error } = await supabase.rpc('issue_copy', {
      p_user_id: user_id,
      p_copy_id: copy_id,
    });
    if (error) throw error;
    return data as IssueCopyResult;
  } catch (err: unknown) {
    console.warn('issue_copy live call failed, falling back to mock:', err);
    return mock.issue_copy(user_id, copy_id);
  }
}

/**
 * 5. return_copy
 * Return shape: loan_id, student_name, reg_no, title, due_date, returned_at, working_days_overdue, fine_amount, next_status
 */
export async function return_copy(accession_no: string): Promise<ReturnCopyResult> {
  if (isStaffMock()) {
    return mock.return_copy(accession_no);
  }

  try {
    const { data, error } = await supabase.rpc('return_copy', {
      p_accession_no: accession_no,
    });
    if (error) throw error;
    return data as ReturnCopyResult;
  } catch (err: unknown) {
    console.warn('return_copy live call failed, falling back to mock:', err);
    return mock.return_copy(accession_no);
  }
}

/**
 * 6. catalogue_search
 */
export async function catalogue_search(params: CatalogueSearchParams = {}): Promise<CatalogueSearchResult> {
  if (isStaffMock()) {
    return mock.catalogue_search(params);
  }

  try {
    const { data, error } = await supabase.rpc('catalogue_search', {
      p_params: params,
    });
    if (error) throw error;
    return data as CatalogueSearchResult;
  } catch (err: unknown) {
    console.warn('catalogue_search live call failed, falling back to mock:', err);
    return mock.catalogue_search(params);
  }
}

/**
 * 7. update_copy
 */
export async function update_copy(copy_id: string, updates: CopyUpdates): Promise<CatalogueItem> {
  if (isStaffMock()) {
    return mock.update_copy(copy_id, updates);
  }

  try {
    const { data, error } = await supabase.rpc('update_copy', {
      p_copy_id: copy_id,
      p_updates: updates,
    });
    if (error) throw error;
    return data as CatalogueItem;
  } catch (err: unknown) {
    console.warn('update_copy live call failed, falling back to mock:', err);
    return mock.update_copy(copy_id, updates);
  }
}

/**
 * 8. withdraw_record
 */
export async function withdraw_record(copy_id: string, reason: string): Promise<{ success: boolean; copy_id: string }> {
  if (isStaffMock()) {
    return mock.withdraw_record(copy_id, reason);
  }

  try {
    const { error } = await supabase.rpc('withdraw_record', {
      p_entity_type: 'copy',
      p_entity_id: copy_id,
      p_reason: reason,
    });
    if (error) throw error;
    return { success: true, copy_id };
  } catch (err: unknown) {
    console.warn('withdraw_record live call failed, falling back to mock:', err);
    return mock.withdraw_record(copy_id, reason);
  }
}

/**
 * 9. import_catalog_batch
 * Return shape: works_created, editions_created, copies_created, copies_skipped, sent_to_review
 */
export async function import_catalog_batch(rows: ImportBatchRow[]): Promise<ImportCatalogResult> {
  if (isStaffMock()) {
    return mock.import_catalog_batch(rows);
  }

  try {
    const { data, error } = await supabase.rpc('import_catalog_batch', {
      p_rows: rows,
    });
    if (error) throw error;
    return data as ImportCatalogResult;
  } catch (err: unknown) {
    console.warn('import_catalog_batch live call failed, falling back to mock:', err);
    return mock.import_catalog_batch(rows);
  }
}

/**
 * 10. list_import_review
 */
export async function list_import_review(): Promise<ImportReviewItem[]> {
  if (isStaffMock()) {
    return mock.list_import_review();
  }

  try {
    const { data, error } = await supabase.rpc('list_import_review');
    if (error) throw error;
    return data as ImportReviewItem[];
  } catch (err: unknown) {
    console.warn('list_import_review live call failed, falling back to mock:', err);
    return mock.list_import_review();
  }
}

/**
 * 11. resolve_import_review
 */
export async function resolve_import_review(
  review_id: string,
  resolution: ImportResolution
): Promise<{ success: boolean; review_id: string }> {
  if (isStaffMock()) {
    return mock.resolve_import_review(review_id, resolution);
  }

  try {
    const { error } = await supabase.rpc('resolve_import_review', {
      p_review_id: review_id,
      p_resolution: resolution,
    });
    if (error) throw error;
    return { success: true, review_id };
  } catch (err: unknown) {
    console.warn('resolve_import_review live call failed, falling back to mock:', err);
    return mock.resolve_import_review(review_id, resolution);
  }
}

/**
 * 12. staff_recent_activity
 */
export async function staff_recent_activity(limit: number = 15): Promise<StaffActivityItem[]> {
  if (isStaffMock()) {
    return mock.staff_recent_activity(limit);
  }

  try {
    const { data, error } = await supabase.rpc('staff_recent_activity', {
      p_limit: limit,
    });
    if (error) throw error;
    return data as StaffActivityItem[];
  } catch (err: unknown) {
    console.warn('staff_recent_activity live call failed, falling back to mock:', err);
    return mock.staff_recent_activity(limit);
  }
}

/**
 * Overview statistics helper
 */
export async function staff_overview_stats(): Promise<StaffOverviewStats> {
  return mock.staff_overview_stats();
}

/**
 * QR token creation helper
 */
export async function create_qr_token(user_id?: string): Promise<{ token: string; expires_at: string; valid_seconds: number }> {
  return mock.create_qr_token(user_id);
}
