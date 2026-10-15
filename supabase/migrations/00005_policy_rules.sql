-- ============================================================================
-- Migration 00005: Phase 3 Policy Rules
-- Implements:
-- 1. Table: return_schedules, fine_payments
-- 2. Alter policies: hold_pickup_days, hold_limit, processing_fee
-- 3. Alter lost_reports: loan_id, resolution, replacement_accession_no, resolved_at
-- 4. Hold status 'ready' enum support
-- 5. SQL View: loans_with_fine (fines computed on read via working days)
-- 6. RPCs: place_hold, cancel_hold, process_expired_holds
-- 7. RPCs: return_copy, issue_copy (with hold shelf integration & blockers)
-- 8. RPCs: renew_loan, schedule_return, mark_fine_paid, report_lost, resolve_lost
-- ============================================================================

-- 1. Add 'ready' to hold_status enum if not present
DO $$
BEGIN
  ALTER TYPE hold_status ADD VALUE IF NOT EXISTS 'ready';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Extend policies table
ALTER TABLE policies 
  ADD COLUMN IF NOT EXISTS hold_pickup_days INTEGER NOT NULL DEFAULT 2 CHECK (hold_pickup_days > 0),
  ADD COLUMN IF NOT EXISTS hold_limit INTEGER NOT NULL DEFAULT 3 CHECK (hold_limit > 0),
  ADD COLUMN IF NOT EXISTS processing_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00 CHECK (processing_fee >= 0);

-- 3. Return Schedules (Student-set reminders, no fine waivers)
CREATE TABLE IF NOT EXISTS return_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_return_schedules_loan UNIQUE (loan_id)
);

-- 4. Fine Payments (Desk payments recorded by staff)
CREATE TABLE IF NOT EXISTS fine_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  marked_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Extend lost_reports table
ALTER TABLE lost_reports
  ADD COLUMN IF NOT EXISTS loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resolution TEXT CHECK (resolution IN ('fee', 'replaced')),
  ADD COLUMN IF NOT EXISTS replacement_accession_no TEXT,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- 6. Enable RLS on new tables
ALTER TABLE return_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fine_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own return schedules"
  ON return_schedules
  FOR ALL
  USING (student_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Staff can view and record fine payments"
  ON fine_payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('librarian', 'head_librarian')
    ) OR auth.uid() IS NULL
  );

-- 7. SQL View: loans_with_fine (Computed dynamically on read)
CREATE OR REPLACE VIEW loans_with_fine AS
SELECT
  l.id AS loan_id,
  l.library_id,
  l.copy_id,
  l.user_id AS student_id,
  p.name AS student_name,
  p.reg_no,
  p.email AS student_email,
  l.issued_at,
  l.due_date,
  l.returned_at,
  l.renewals_count,
  l.status AS loan_status,
  c.accession_no,
  c.shelf_location,
  c.status AS copy_status,
  w.id AS work_id,
  w.title,
  w.author,
  e.id AS edition_id,
  e.edition_no,
  e.cover_url,
  e.price AS edition_price,
  p.user_type,
  pol.fine_per_day,
  pol.max_renewals,
  rs.scheduled_date AS return_schedule_date,
  -- Dynamic calculation of working days overdue
  CASE
    WHEN l.status = 'returned' AND l.returned_at::date > l.due_date THEN
      count_working_days_between(l.library_id, l.due_date + 1, l.returned_at::date)
    WHEN l.status = 'active' AND CURRENT_DATE > l.due_date THEN
      count_working_days_between(l.library_id, l.due_date + 1, CURRENT_DATE)
    WHEN l.status = 'lost' THEN
      CASE
        WHEN lr.created_at::date > l.due_date THEN
          count_working_days_between(l.library_id, l.due_date + 1, lr.created_at::date)
        ELSE 0
      END
    ELSE 0
  END AS working_days_overdue,
  -- Working days left until due date
  CASE
    WHEN l.status = 'active' AND CURRENT_DATE <= l.due_date THEN
      count_working_days_between(l.library_id, CURRENT_DATE, l.due_date)
    ELSE 0
  END AS working_days_left,
  -- Gross accrued fine before payments
  CASE
    WHEN l.status = 'returned' AND l.returned_at::date > l.due_date THEN
      count_working_days_between(l.library_id, l.due_date + 1, l.returned_at::date) * pol.fine_per_day
    WHEN l.status = 'active' AND CURRENT_DATE > l.due_date THEN
      count_working_days_between(l.library_id, l.due_date + 1, CURRENT_DATE) * pol.fine_per_day
    WHEN l.status = 'lost' THEN
      CASE
        WHEN lr.created_at::date > l.due_date THEN
          count_working_days_between(l.library_id, l.due_date + 1, lr.created_at::date) * pol.fine_per_day
        ELSE 0.00
      END
    ELSE 0.00
  END AS gross_fine,
  -- Total fine payments recorded
  COALESCE((SELECT SUM(fp.amount) FROM fine_payments fp WHERE fp.loan_id = l.id), 0.00) AS total_paid,
  -- Net outstanding fine payable
  GREATEST(0.00,
    (CASE
      WHEN l.status = 'returned' AND l.returned_at::date > l.due_date THEN
        count_working_days_between(l.library_id, l.due_date + 1, l.returned_at::date) * pol.fine_per_day
      WHEN l.status = 'active' AND CURRENT_DATE > l.due_date THEN
        count_working_days_between(l.library_id, l.due_date + 1, CURRENT_DATE) * pol.fine_per_day
      WHEN l.status = 'lost' THEN
        CASE
          WHEN lr.created_at::date > l.due_date THEN
            count_working_days_between(l.library_id, l.due_date + 1, lr.created_at::date) * pol.fine_per_day
          ELSE 0.00
        END
      ELSE 0.00
    END) - COALESCE((SELECT SUM(fp.amount) FROM fine_payments fp WHERE fp.loan_id = l.id), 0.00)
  ) AS net_fine,
  -- Is overdue boolean flag
  CASE
    WHEN (l.status = 'active' AND CURRENT_DATE > l.due_date)
      OR (l.status = 'returned' AND l.returned_at::date > l.due_date) THEN TRUE
    ELSE FALSE
  END AS is_overdue
FROM loans l
JOIN copies c ON c.id = l.copy_id
JOIN editions e ON e.id = c.edition_id
JOIN works w ON w.id = e.work_id
JOIN profiles p ON p.id = l.user_id
JOIN policies pol ON pol.library_id = l.library_id AND pol.user_type = p.user_type
LEFT JOIN return_schedules rs ON rs.loan_id = l.id
LEFT JOIN lost_reports lr ON lr.loan_id = l.id;

-- ============================================================================
-- 8. RPC: place_hold(p_work_id, p_student_id)
-- Checks:
-- - No copy of the work is currently available
-- - Blocked if student has an overdue loan
-- - Blocked if student has an unresolved lost report
-- - Blocked if student already holds this work
-- - Blocked if student currently has this work on active loan
-- - Blocked if student has reached the hold_limit
-- Inserts hold record with FIFO queue_position
-- ============================================================================
CREATE OR REPLACE FUNCTION place_hold(
  p_work_id UUID,
  p_student_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_library_id UUID;
  v_available_copies_count INTEGER;
  v_overdue_loans_count INTEGER;
  v_unresolved_lost_count INTEGER;
  v_existing_active_loan INTEGER;
  v_existing_active_hold INTEGER;
  v_current_holds_count INTEGER;
  v_hold_limit INTEGER;
  v_max_queue_pos INTEGER;
  v_new_hold_id UUID;
  v_profile RECORD;
BEGIN
  -- Get library and user
  SELECT * INTO v_profile FROM profiles WHERE id = p_student_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student profile not found';
  END IF;
  v_library_id := v_profile.library_id;

  -- 1. Check available copies for this work
  SELECT COUNT(*) INTO v_available_copies_count
  FROM copies c
  JOIN editions e ON e.id = c.edition_id
  WHERE e.work_id = p_work_id
    AND c.status = 'available'
    AND c.reference_only = FALSE;

  IF v_available_copies_count > 0 THEN
    RAISE EXCEPTION 'Cannot place hold: copies are currently available on the shelf';
  END IF;

  -- 2. Check if student has overdue loans
  SELECT COUNT(*) INTO v_overdue_loans_count
  FROM loans_with_fine
  WHERE student_id = p_student_id
    AND loan_status = 'active'
    AND is_overdue = TRUE;

  IF v_overdue_loans_count > 0 THEN
    RAISE EXCEPTION 'Cannot place hold: you have % overdue loan(s). Return them to proceed.', v_overdue_loans_count;
  END IF;

  -- 3. Check unresolved lost reports
  SELECT COUNT(*) INTO v_unresolved_lost_count
  FROM lost_reports
  WHERE reported_by = p_student_id
    AND status = 'reported';

  IF v_unresolved_lost_count > 0 THEN
    RAISE EXCEPTION 'Cannot place hold: you have unresolved lost book reports.';
  END IF;

  -- 4. Check if student already holds this work
  SELECT COUNT(*) INTO v_existing_active_hold
  FROM holds
  WHERE user_id = p_student_id
    AND work_id = p_work_id
    AND status IN ('active', 'ready');

  IF v_existing_active_hold > 0 THEN
    RAISE EXCEPTION 'You already have an active hold reservation for this book.';
  END IF;

  -- 5. Check if student currently has this work on active loan
  SELECT COUNT(*) INTO v_existing_active_loan
  FROM loans l
  JOIN copies c ON c.id = l.copy_id
  JOIN editions e ON e.id = c.edition_id
  WHERE l.user_id = p_student_id
    AND l.status = 'active'
    AND e.work_id = p_work_id;

  IF v_existing_active_loan > 0 THEN
    RAISE EXCEPTION 'You currently have this book issued on loan.';
  END IF;

  -- 6. Check hold limit
  SELECT pol.hold_limit INTO v_hold_limit
  FROM policies pol
  WHERE pol.library_id = v_library_id AND pol.user_type = v_profile.user_type;
  IF v_hold_limit IS NULL THEN v_hold_limit := 3; END IF;

  SELECT COUNT(*) INTO v_current_holds_count
  FROM holds
  WHERE user_id = p_student_id AND status IN ('active', 'ready');

  IF v_current_holds_count >= v_hold_limit THEN
    RAISE EXCEPTION 'Hold limit reached. You can only place up to % holds simultaneously.', v_hold_limit;
  END IF;

  -- 7. Compute next FIFO queue position
  SELECT COALESCE(MAX(queue_position), 0) INTO v_max_queue_pos
  FROM holds
  WHERE work_id = p_work_id AND status = 'active';

  -- 8. Insert hold
  INSERT INTO holds (
    library_id,
    work_id,
    user_id,
    queue_position,
    status
  ) VALUES (
    v_library_id,
    p_work_id,
    p_student_id,
    v_max_queue_pos + 1,
    'active'
  ) RETURNING id INTO v_new_hold_id;

  -- Write audit log
  INSERT INTO audit_log (library_id, user_id, action, target_type, target_id, details)
  VALUES (
    v_library_id,
    p_student_id,
    'place_hold',
    'hold',
    v_new_hold_id,
    jsonb_build_object('work_id', p_work_id, 'queue_position', v_max_queue_pos + 1)
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'hold_id', v_new_hold_id,
    'queue_position', v_max_queue_pos + 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. RPC: cancel_hold(p_hold_id) & process_expired_holds()
-- ============================================================================
CREATE OR REPLACE FUNCTION cancel_hold(p_hold_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_hold RECORD;
BEGIN
  SELECT * INTO v_hold FROM holds WHERE id = p_hold_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hold not found';
  END IF;

  UPDATE holds
  SET status = 'cancelled'
  WHERE id = p_hold_id;

  -- Reorder remaining active holds for this work
  UPDATE holds h
  SET queue_position = sub.new_pos
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY queue_position ASC) AS new_pos
    FROM holds
    WHERE work_id = v_hold.work_id AND status = 'active'
  ) sub
  WHERE h.id = sub.id;

  -- If the hold was 'ready' on_hold_shelf, advance queue or free copy
  IF v_hold.status = 'ready' THEN
    PERFORM process_expired_holds();
  END IF;

  INSERT INTO audit_log (library_id, user_id, action, target_type, target_id, details)
  VALUES (v_hold.library_id, v_hold.user_id, 'cancel_hold', 'hold', p_hold_id, jsonb_build_object('work_id', v_hold.work_id));

  RETURN jsonb_build_object('success', TRUE, 'hold_id', p_hold_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION process_expired_holds()
RETURNS INTEGER AS $$
DECLARE
  v_expired RECORD;
  v_next_hold RECORD;
  v_copy_id UUID;
  v_pickup_days INTEGER;
  v_processed_count INTEGER := 0;
BEGIN
  -- Find ready holds past pickup_deadline
  FOR v_expired IN
    SELECT h.*, e.work_id AS ed_work_id
    FROM holds h
    JOIN works w ON w.id = h.work_id
    WHERE h.status = 'ready' AND h.pickup_deadline < now()
  LOOP
    -- Mark this hold expired
    UPDATE holds SET status = 'expired' WHERE id = v_expired.id;

    -- Find an on_hold_shelf copy for this work
    SELECT c.id INTO v_copy_id
    FROM copies c
    JOIN editions e ON e.id = c.edition_id
    WHERE e.work_id = v_expired.work_id AND c.status = 'on_hold_shelf'
    LIMIT 1;

    -- Look for the next active hold in queue
    SELECT * INTO v_next_hold
    FROM holds
    WHERE work_id = v_expired.work_id AND status = 'active'
    ORDER BY queue_position ASC
    LIMIT 1;

    IF FOUND THEN
      -- Get hold pickup window
      SELECT hold_pickup_days INTO v_pickup_days
      FROM policies
      WHERE library_id = v_expired.library_id LIMIT 1;
      IF v_pickup_days IS NULL THEN v_pickup_days := 2; END IF;

      -- Assign to next hold
      UPDATE holds
      SET status = 'ready',
          pickup_deadline = add_working_days(v_expired.library_id, CURRENT_DATE, v_pickup_days) + time '18:00:00'
      WHERE id = v_next_hold.id;

      -- Create notification for the student
      INSERT INTO notifications (library_id, user_id, title, message, type)
      VALUES (
        v_next_hold.library_id,
        v_next_hold.user_id,
        'Hold copy ready for pickup',
        'A copy of your reserved book is now ready on the hold shelf. Pickup deadline is 2 working days.',
        'hold_ready'
      );
    ELSE
      -- No one else waiting: release copy to 'available'
      IF v_copy_id IS NOT NULL THEN
        UPDATE copies SET status = 'available' WHERE id = v_copy_id;
      END IF;
    END IF;

    v_processed_count := v_processed_count + 1;
  END LOOP;

  RETURN v_processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. RPC: return_copy(p_copy_id, p_librarian_id)
-- Updates loan status, computes fine, routes to 'on_hold_shelf' if holds exist
-- ============================================================================
CREATE OR REPLACE FUNCTION return_copy(
  p_copy_id UUID,
  p_librarian_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_copy RECORD;
  v_loan RECORD;
  v_work_id UUID;
  v_next_hold RECORD;
  v_pickup_days INTEGER;
  v_fine_amount NUMERIC(10, 2);
  v_days_overdue INTEGER;
  v_student RECORD;
BEGIN
  -- 1. Lock copy and fetch loan
  SELECT * INTO v_copy FROM copies WHERE id = p_copy_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Copy not found';
  END IF;

  SELECT * INTO v_loan
  FROM loans
  WHERE copy_id = p_copy_id AND status = 'active'
  ORDER BY issued_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active loan found for copy %', v_copy.accession_no;
  END IF;

  SELECT * INTO v_student FROM profiles WHERE id = v_loan.user_id;

  -- 2. Mark loan returned
  UPDATE loans
  SET status = 'returned',
      returned_at = now()
  WHERE id = v_loan.id;

  -- 3. Calculate fine via working days
  SELECT
    working_days_overdue,
    net_fine
  INTO
    v_days_overdue,
    v_fine_amount
  FROM loans_with_fine
  WHERE loan_id = v_loan.id;

  -- 4. Check if work has waiting holds
  SELECT e.work_id INTO v_work_id FROM editions e WHERE e.id = v_copy.edition_id;

  SELECT * INTO v_next_hold
  FROM holds
  WHERE work_id = v_work_id AND status = 'active'
  ORDER BY queue_position ASC
  LIMIT 1;

  IF FOUND THEN
    -- Route to hold shelf
    SELECT hold_pickup_days INTO v_pickup_days
    FROM policies
    WHERE library_id = v_copy.library_id LIMIT 1;
    IF v_pickup_days IS NULL THEN v_pickup_days := 2; END IF;

    UPDATE copies
    SET status = 'on_hold_shelf'
    WHERE id = p_copy_id;

    UPDATE holds
    SET status = 'ready',
        pickup_deadline = add_working_days(v_copy.library_id, CURRENT_DATE, v_pickup_days) + time '18:00:00'
    WHERE id = v_next_hold.id;

    -- Send notification to hold recipient
    INSERT INTO notifications (library_id, user_id, title, message, type)
    VALUES (
      v_copy.library_id,
      v_next_hold.user_id,
      'Hold available for pickup',
      'A copy of your reserved book has been returned and is waiting on the hold shelf.',
      'hold_ready'
    );
  ELSE
    -- Free copy to available
    UPDATE copies
    SET status = 'available'
    WHERE id = p_copy_id;
  END IF;

  -- Audit log
  INSERT INTO audit_log (library_id, user_id, action, target_type, target_id, details)
  VALUES (
    v_copy.library_id,
    p_librarian_id,
    'return_copy',
    'loan',
    v_loan.id,
    jsonb_build_object(
      'copy_id', p_copy_id,
      'accession_no', v_copy.accession_no,
      'working_days_overdue', COALESCE(v_days_overdue, 0),
      'fine_amount', COALESCE(v_fine_amount, 0)
    )
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'loan_id', v_loan.id,
    'student_id', v_student.id,
    'student_name', v_student.name,
    'reg_no', v_student.reg_no,
    'accession_no', v_copy.accession_no,
    'working_days_overdue', COALESCE(v_days_overdue, 0),
    'fine_amount', COALESCE(v_fine_amount, 0),
    'routed_to_hold', (v_next_hold.id IS NOT NULL)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 11. RPC: return_copy_by_accession(p_accession_no, p_librarian_id)
-- Convenience wrapper for barcode scanner inputs
-- ============================================================================
CREATE OR REPLACE FUNCTION return_copy_by_accession(
  p_accession_no TEXT,
  p_librarian_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_copy_id UUID;
BEGIN
  SELECT id INTO v_copy_id FROM copies WHERE UPPER(accession_no) = UPPER(TRIM(p_accession_no));
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Accession number % not found in catalog', p_accession_no;
  END IF;

  RETURN return_copy(v_copy_id, p_librarian_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. RPC: renew_loan(p_loan_id)
-- Checks:
-- - Loan is active
-- - Not overdue (working_days_overdue == 0)
-- - renewals_count < max_renewals
-- - No waiting holds for this work
-- Updates due_date = add_working_days(GREATEST(CURRENT_DATE, due_date), loan_days)
-- ============================================================================
CREATE OR REPLACE FUNCTION renew_loan(p_loan_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_loan RECORD;
  v_policy RECORD;
  v_work_id UUID;
  v_waiting_holds INTEGER;
  v_new_due_date DATE;
  v_days_overdue INTEGER;
BEGIN
  SELECT * INTO v_loan FROM loans WHERE id = p_loan_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan record not found';
  END IF;

  IF v_loan.status != 'active' THEN
    RAISE EXCEPTION 'Only active loans can be renewed. Status: %', v_loan.status;
  END IF;

  -- 1. Check overdue
  SELECT working_days_overdue INTO v_days_overdue
  FROM loans_with_fine
  WHERE loan_id = p_loan_id;

  IF COALESCE(v_days_overdue, 0) > 0 OR CURRENT_DATE > v_loan.due_date THEN
    RAISE EXCEPTION 'Overdue books cannot be renewed. Please return the book at the circulation desk.';
  END IF;

  -- 2. Check max renewals
  SELECT pol.* INTO v_policy
  FROM policies pol
  JOIN profiles p ON p.library_id = pol.library_id AND p.user_type = pol.user_type
  WHERE p.id = v_loan.user_id;

  IF v_loan.renewals_count >= v_policy.max_renewals THEN
    RAISE EXCEPTION 'Renewal limit reached (% of % renewals used).', v_loan.renewals_count, v_policy.max_renewals;
  END IF;

  -- 3. Check waiting holds on this work
  SELECT e.work_id INTO v_work_id
  FROM copies c
  JOIN editions e ON e.id = c.edition_id
  WHERE c.id = v_loan.copy_id;

  SELECT COUNT(*) INTO v_waiting_holds
  FROM holds
  WHERE work_id = v_work_id AND status = 'active';

  IF v_waiting_holds > 0 THEN
    RAISE EXCEPTION 'Renewal blocked: another student has placed a hold on this title.';
  END IF;

  -- 4. Calculate new due date
  v_new_due_date := add_working_days(
    v_loan.library_id,
    GREATEST(CURRENT_DATE, v_loan.due_date),
    v_policy.loan_days
  );

  UPDATE loans
  SET due_date = v_new_due_date,
      renewals_count = renewals_count + 1
  WHERE id = p_loan_id;

  -- Audit log
  INSERT INTO audit_log (library_id, user_id, action, target_type, target_id, details)
  VALUES (
    v_loan.library_id,
    v_loan.user_id,
    'renew_loan',
    'loan',
    p_loan_id,
    jsonb_build_object(
      'old_due_date', v_loan.due_date,
      'new_due_date', v_new_due_date,
      'renewals_count', v_loan.renewals_count + 1
    )
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'loan_id', p_loan_id,
    'new_due_date', v_new_due_date,
    'renewals_count', v_loan.renewals_count + 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 13. RPC: schedule_return(p_loan_id, p_date)
-- Upserts reminder date in return_schedules, logs reminder notice
-- ============================================================================
CREATE OR REPLACE FUNCTION schedule_return(
  p_loan_id UUID,
  p_date DATE
)
RETURNS JSONB AS $$
DECLARE
  v_loan RECORD;
BEGIN
  SELECT * INTO v_loan FROM loans WHERE id = p_loan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan record not found';
  END IF;

  INSERT INTO return_schedules (
    library_id,
    loan_id,
    student_id,
    scheduled_date
  ) VALUES (
    v_loan.library_id,
    p_loan_id,
    v_loan.user_id,
    p_date
  )
  ON CONFLICT (loan_id)
  DO UPDATE SET scheduled_date = EXCLUDED.scheduled_date, created_at = now();

  -- Add in-app notification
  INSERT INTO notifications (library_id, user_id, title, message, type)
  VALUES (
    v_loan.library_id,
    v_loan.user_id,
    'Return reminder scheduled',
    'Reminder scheduled for ' || to_char(p_date, 'Mon DD, YYYY') || '. Remember, books must be scanned by the librarian to complete a return.',
    'schedule_return'
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'loan_id', p_loan_id,
    'scheduled_date', p_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 14. RPC: mark_fine_paid(p_loan_id, p_amount)
-- Librarian records fine paid at the desk
-- ============================================================================
CREATE OR REPLACE FUNCTION mark_fine_paid(
  p_loan_id UUID,
  p_amount NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_loan RECORD;
  v_librarian_id UUID;
  v_payment_id UUID;
BEGIN
  SELECT * INTO v_loan FROM loans WHERE id = p_loan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan record not found';
  END IF;

  v_librarian_id := auth.uid();
  IF v_librarian_id IS NULL THEN
    -- Fallback to first librarian for demo mode testing
    SELECT id INTO v_librarian_id FROM profiles WHERE role IN ('librarian', 'head_librarian') LIMIT 1;
  END IF;

  INSERT INTO fine_payments (
    library_id,
    loan_id,
    student_id,
    amount,
    marked_by
  ) VALUES (
    v_loan.library_id,
    p_loan_id,
    v_loan.user_id,
    p_amount,
    v_librarian_id
  ) RETURNING id INTO v_payment_id;

  INSERT INTO audit_log (library_id, user_id, action, target_type, target_id, details)
  VALUES (
    v_loan.library_id,
    v_librarian_id,
    'fine_payment',
    'loan',
    p_loan_id,
    jsonb_build_object('amount', p_amount, 'payment_id', v_payment_id)
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'payment_id', v_payment_id,
    'amount', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 15. RPC: report_lost(p_copy_id, p_loan_id, p_reason)
-- Marks copy 'lost', loan 'lost', freezes fine at report date
-- ============================================================================
CREATE OR REPLACE FUNCTION report_lost(
  p_copy_id UUID,
  p_loan_id UUID,
  p_reason TEXT DEFAULT 'Reported lost by student'
)
RETURNS JSONB AS $$
DECLARE
  v_copy RECORD;
  v_loan RECORD;
  v_report_id UUID;
  v_current_fine NUMERIC(10, 2);
BEGIN
  SELECT * INTO v_copy FROM copies WHERE id = p_copy_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Copy not found'; END IF;

  SELECT * INTO v_loan FROM loans WHERE id = p_loan_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Loan not found'; END IF;

  -- Calculate current fine up to today
  SELECT net_fine INTO v_current_fine FROM loans_with_fine WHERE loan_id = p_loan_id;

  -- Update copy and loan
  UPDATE copies SET status = 'lost' WHERE id = p_copy_id;
  UPDATE loans SET status = 'lost' WHERE id = p_loan_id;

  -- Create lost report
  INSERT INTO lost_reports (
    library_id,
    copy_id,
    loan_id,
    reported_by,
    status,
    fine_assessed,
    notes
  ) VALUES (
    v_loan.library_id,
    p_copy_id,
    p_loan_id,
    v_loan.user_id,
    'reported',
    COALESCE(v_current_fine, 0.00),
    p_reason
  ) RETURNING id INTO v_report_id;

  -- Audit log
  INSERT INTO audit_log (library_id, user_id, action, target_type, target_id, details)
  VALUES (
    v_loan.library_id,
    v_loan.user_id,
    'report_lost',
    'lost_report',
    v_report_id,
    jsonb_build_object('copy_id', p_copy_id, 'loan_id', p_loan_id, 'frozen_fine', v_current_fine)
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'lost_report_id', v_report_id,
    'frozen_fine', v_current_fine
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 16. RPC: resolve_lost(p_report_id, p_method, p_replacement_accession_no)
-- Resolution via 'fee' (book price + processing fee) or 'replaced' (new copy)
-- ============================================================================
CREATE OR REPLACE FUNCTION resolve_lost(
  p_report_id UUID,
  p_method TEXT,
  p_replacement_accession_no TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_report RECORD;
  v_copy RECORD;
  v_edition RECORD;
  v_policy RECORD;
  v_new_copy_id UUID;
  v_fee_total NUMERIC(10, 2);
  v_librarian_id UUID;
BEGIN
  SELECT * INTO v_report FROM lost_reports WHERE id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Lost report not found'; END IF;

  IF v_report.status = 'resolved' THEN
    RAISE EXCEPTION 'Lost report is already resolved';
  END IF;

  SELECT * INTO v_copy FROM copies WHERE id = v_report.copy_id;
  SELECT * INTO v_edition FROM editions WHERE id = v_copy.edition_id;

  SELECT pol.* INTO v_policy
  FROM policies pol
  JOIN profiles p ON p.library_id = pol.library_id AND p.user_type = pol.user_type
  WHERE p.id = v_report.reported_by;

  v_librarian_id := auth.uid();
  IF v_librarian_id IS NULL THEN
    SELECT id INTO v_librarian_id FROM profiles WHERE role IN ('librarian', 'head_librarian') LIMIT 1;
  END IF;

  IF p_method = 'fee' THEN
    v_fee_total := COALESCE(v_edition.price, 500.00) + COALESCE(v_policy.processing_fee, 50.00);

    UPDATE lost_reports
    SET status = 'resolved',
        resolution = 'fee',
        fine_assessed = fine_assessed + v_fee_total,
        paid_at = now(),
        resolved_at = now()
    WHERE id = p_report_id;

    -- Record payment
    IF v_report.loan_id IS NOT NULL THEN
      INSERT INTO fine_payments (library_id, loan_id, student_id, amount, marked_by)
      VALUES (v_report.library_id, v_report.loan_id, v_report.reported_by, v_fee_total, v_librarian_id);
    END IF;

  ELSIF p_method = 'replaced' THEN
    IF p_replacement_accession_no IS NULL OR TRIM(p_replacement_accession_no) = '' THEN
      RAISE EXCEPTION 'A replacement copy accession number must be provided';
    END IF;

    -- Insert new physical copy
    INSERT INTO copies (
      library_id,
      edition_id,
      accession_no,
      shelf_location,
      reference_only,
      status
    ) VALUES (
      v_copy.library_id,
      v_copy.edition_id,
      UPPER(TRIM(p_replacement_accession_no)),
      v_copy.shelf_location,
      v_copy.reference_only,
      'available'
    ) RETURNING id INTO v_new_copy_id;

    UPDATE lost_reports
    SET status = 'resolved',
        resolution = 'replaced',
        replacement_accession_no = UPPER(TRIM(p_replacement_accession_no)),
        resolved_at = now()
    WHERE id = p_report_id;

  ELSE
    RAISE EXCEPTION 'Invalid resolution method: %. Must be "fee" or "replaced".', p_method;
  END IF;

  -- Audit log
  INSERT INTO audit_log (library_id, user_id, action, target_type, target_id, details)
  VALUES (
    v_report.library_id,
    v_librarian_id,
    'resolve_lost',
    'lost_report',
    p_report_id,
    jsonb_build_object(
      'method', p_method,
      'replacement_accession_no', p_replacement_accession_no,
      'fee_total', v_fee_total
    )
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'lost_report_id', p_report_id,
    'resolution', p_method,
    'new_copy_id', v_new_copy_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
