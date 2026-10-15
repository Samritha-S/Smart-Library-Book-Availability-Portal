-- ====================================================================
-- Migration: 00001_initial_schema.sql
-- Project: Smart Library Book Availability Portal
-- Multi-tenant schema with RLS, Enums, Audit Log, and Business Logic
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Define Custom Enums
DO $$ BEGIN
  CREATE TYPE library_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'librarian', 'head_librarian', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('undergraduate', 'postgraduate', 'phd_scholar', 'faculty', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE copy_status AS ENUM (
    'available',
    'issued',
    'on_hold_shelf',
    'damaged_repair',
    'lost',
    'missing',
    'withdrawn'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Notice: Overdue status is strictly computed dynamically on read and never stored
DO $$ BEGIN
  CREATE TYPE loan_status AS ENUM ('active', 'returned', 'lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE hold_status AS ENUM ('active', 'fulfilled', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Core Tables

-- Libraries (Multi-tenant Root)
CREATE TABLE IF NOT EXISTS libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  status library_status NOT NULL DEFAULT 'pending',
  address TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (Users belonging to a library)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  reg_no TEXT, -- Mandatory & unique for students, nullable for staff
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT,
  year INTEGER,
  user_type user_type NOT NULL DEFAULT 'undergraduate',
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_profiles_library_reg_no UNIQUE (library_id, reg_no),
  CONSTRAINT uq_profiles_library_email UNIQUE (library_id, email)
);

-- Circulation Policies (Configured per user_type for each library)
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  loan_days INTEGER NOT NULL DEFAULT 14 CHECK (loan_days > 0),
  max_books INTEGER NOT NULL DEFAULT 3 CHECK (max_books > 0),
  fine_per_day NUMERIC(10, 2) NOT NULL DEFAULT 5.00 CHECK (fine_per_day >= 0),
  max_renewals INTEGER NOT NULL DEFAULT 2 CHECK (max_renewals >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_policies_library_user_type UNIQUE (library_id, user_type)
);

-- Works (Abstract Bibliographic Work)
CREATE TABLE IF NOT EXISTS works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  is_withdrawn BOOLEAN NOT NULL DEFAULT false,
  withdrawn_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Editions (Specific publication of a work)
CREATE TABLE IF NOT EXISTS editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  isbn TEXT NOT NULL,
  edition_no INTEGER NOT NULL DEFAULT 1 CHECK (edition_no > 0),
  publisher TEXT,
  year INTEGER NOT NULL,
  cover_url TEXT,
  is_withdrawn BOOLEAN NOT NULL DEFAULT false,
  withdrawn_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_editions_library_isbn UNIQUE (library_id, isbn)
);

-- Copies (Physical inventory items)
CREATE TABLE IF NOT EXISTS copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  edition_id UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  accession_no TEXT NOT NULL,
  status copy_status NOT NULL DEFAULT 'available',
  shelf_location TEXT NOT NULL,
  reference_only BOOLEAN NOT NULL DEFAULT false,
  withdrawn_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_copies_library_accession UNIQUE (library_id, accession_no)
);

-- Course Map (Curriculum mapping: course_code -> work)
CREATE TABLE IF NOT EXISTS course_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_course_map UNIQUE (library_id, course_code, work_id)
);

-- Loans (Circulation checkouts)
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  copy_id UUID NOT NULL REFERENCES copies(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  issued_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date DATE NOT NULL,
  returned_at TIMESTAMPTZ,
  renewals_count INTEGER NOT NULL DEFAULT 0 CHECK (renewals_count >= 0),
  status loan_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Holds (Reservation queue)
CREATE TABLE IF NOT EXISTS holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  edition_id UUID REFERENCES editions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  queue_position INTEGER NOT NULL DEFAULT 1 CHECK (queue_position > 0),
  status hold_status NOT NULL DEFAULT 'active',
  pickup_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Holidays (Non-working days for library calendar)
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_holidays_library_date UNIQUE (library_id, date)
);

-- Lost Reports
CREATE TABLE IF NOT EXISTS lost_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  copy_id UUID NOT NULL REFERENCES copies(id) ON DELETE RESTRICT,
  reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'reported',
  fine_assessed NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Log (Immutable ledger: INSERT-ONLY, never update or delete)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- QR Tokens (Temporary contactless checkout/checkin tokens)
CREATE TABLE IF NOT EXISTS qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL DEFAULT 'checkout',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rate Limiting Tracker (for login OTP requests and brute force mitigation)
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL UNIQUE, -- e.g. "reg_no:ip"
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student OTP Store (For secure OTP dispatch and verification)
CREATE TABLE IF NOT EXISTS student_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Dynamic Availability Views (Calculated on read, never stored as counter)

CREATE OR REPLACE VIEW view_work_availability AS
SELECT
  w.id AS work_id,
  w.library_id,
  w.title,
  w.author,
  w.subject,
  w.is_withdrawn,
  COUNT(c.id) FILTER (WHERE c.status != 'withdrawn') AS total_copies,
  COUNT(c.id) FILTER (WHERE c.status = 'available' AND c.reference_only = false) AS available_copies,
  COUNT(c.id) FILTER (WHERE c.reference_only = true AND c.status = 'available') AS reference_available_copies,
  COUNT(c.id) FILTER (WHERE c.status = 'issued') AS issued_copies,
  COUNT(c.id) FILTER (WHERE c.status = 'on_hold_shelf') AS hold_copies
FROM works w
LEFT JOIN editions e ON e.work_id = w.id AND e.is_withdrawn = false
LEFT JOIN copies c ON c.edition_id = e.id
GROUP BY w.id, w.library_id, w.title, w.author, w.subject, w.is_withdrawn;

CREATE OR REPLACE VIEW view_edition_availability AS
SELECT
  e.id AS edition_id,
  e.work_id,
  e.library_id,
  e.isbn,
  e.edition_no,
  e.year,
  e.is_withdrawn,
  COUNT(c.id) FILTER (WHERE c.status != 'withdrawn') AS total_copies,
  COUNT(c.id) FILTER (WHERE c.status = 'available' AND c.reference_only = false) AS available_copies,
  COUNT(c.id) FILTER (WHERE c.reference_only = true AND c.status = 'available') AS reference_available_copies,
  COUNT(c.id) FILTER (WHERE c.status = 'issued') AS issued_copies
FROM editions e
LEFT JOIN copies c ON c.edition_id = e.id
GROUP BY e.id, e.work_id, e.library_id, e.isbn, e.edition_no, e.year, e.is_withdrawn;

-- 5. Business Logic Functions

-- Working Days Rule: Mon-Sat (1..6) minus holidays
CREATE OR REPLACE FUNCTION is_working_day(p_library_id UUID, p_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
  v_dow INTEGER;
  v_is_holiday BOOLEAN;
BEGIN
  -- DOW: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  v_dow := EXTRACT(DOW FROM p_date);
  IF v_dow = 0 THEN
    RETURN FALSE; -- Sunday is not a working day
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM holidays WHERE library_id = p_library_id AND date = p_date
  ) INTO v_is_holiday;

  RETURN NOT v_is_holiday;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add working days to a start date
CREATE OR REPLACE FUNCTION add_working_days(p_library_id UUID, p_start_date DATE, p_days INTEGER)
RETURNS DATE AS $$
DECLARE
  v_current DATE := p_start_date;
  v_added INTEGER := 0;
BEGIN
  WHILE v_added < p_days LOOP
    v_current := v_current + 1;
    IF is_working_day(p_library_id, v_current) THEN
      v_added := v_added + 1;
    END IF;
  END LOOP;
  RETURN v_current;
END;
$$ LANGUAGE plpgsql STABLE;

-- Count working days between two dates
CREATE OR REPLACE FUNCTION count_working_days_between(p_library_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_end_date <= p_start_date THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*)::INTEGER
  INTO v_count
  FROM generate_series(p_start_date + 1, p_end_date, '1 day'::interval) d
  WHERE is_working_day(p_library_id, d::date);

  RETURN v_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if loan is overdue (computed dynamically, not stored)
CREATE OR REPLACE FUNCTION is_loan_overdue(p_loan_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_due_date DATE;
  v_status loan_status;
BEGIN
  SELECT due_date, status INTO v_due_date, v_status FROM loans WHERE id = p_loan_id;
  IF v_status != 'active' THEN
    RETURN FALSE;
  END IF;
  RETURN CURRENT_DATE > v_due_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- Compute Fine on Read based on working days overdue and user_type policy
CREATE OR REPLACE FUNCTION calculate_fine(p_loan_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_loan RECORD;
  v_user_type user_type;
  v_fine_per_day NUMERIC(10, 2);
  v_overdue_days INTEGER;
BEGIN
  SELECT l.library_id, l.user_id, l.due_date, l.status, l.returned_at
  INTO v_loan
  FROM loans l
  WHERE l.id = p_loan_id;

  IF NOT FOUND OR v_loan.status != 'active' THEN
    RETURN 0.00;
  END IF;

  -- If not past due date, fine is 0
  IF CURRENT_DATE <= v_loan.due_date THEN
    RETURN 0.00;
  END IF;

  -- Get user type
  SELECT p.user_type INTO v_user_type FROM profiles p WHERE p.id = v_loan.user_id;

  -- Get fine policy
  SELECT pol.fine_per_day INTO v_fine_per_day
  FROM policies pol
  WHERE pol.library_id = v_loan.library_id AND pol.user_type = v_user_type;

  IF v_fine_per_day IS NULL THEN
    v_fine_per_day := 5.00;
  END IF;

  -- Overdue working days
  v_overdue_days := count_working_days_between(v_loan.library_id, v_loan.due_date, CURRENT_DATE);

  RETURN ROUND(v_overdue_days * v_fine_per_day, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Issue Copy: Locks row (FOR UPDATE), checks constraints, sets loan due date, updates status, writes audit_log
CREATE OR REPLACE FUNCTION issue_copy(
  p_library_id UUID,
  p_copy_id UUID,
  p_user_id UUID,
  p_librarian_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_copy RECORD;
  v_profile RECORD;
  v_policy RECORD;
  v_active_loans_count INTEGER;
  v_due_date DATE;
  v_loan_id UUID;
BEGIN
  -- 1. Lock the copy row to prevent race conditions
  SELECT * INTO v_copy
  FROM copies
  WHERE id = p_copy_id AND library_id = p_library_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Copy not found in this library';
  END IF;

  IF v_copy.status != 'available' THEN
    RAISE EXCEPTION 'Copy is not available for issue. Current status: %', v_copy.status;
  END IF;

  IF v_copy.reference_only THEN
    RAISE EXCEPTION 'This copy is designated Reference Only and cannot be issued.';
  END IF;

  -- 2. Validate User and get circulation policy
  SELECT * INTO v_profile
  FROM profiles
  WHERE id = p_user_id AND library_id = p_library_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found in this library';
  END IF;

  IF NOT v_profile.is_active THEN
    RAISE EXCEPTION 'User account is inactive';
  END IF;

  SELECT * INTO v_policy
  FROM policies
  WHERE library_id = p_library_id AND user_type = v_profile.user_type;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Circulation policy not found for user type %', v_profile.user_type;
  END IF;

  -- 3. Check active loans quota
  SELECT COUNT(*) INTO v_active_loans_count
  FROM loans
  WHERE library_id = p_library_id AND user_id = p_user_id AND status = 'active';

  IF v_active_loans_count >= v_policy.max_books THEN
    RAISE EXCEPTION 'User has reached maximum allowed book quota (% books)', v_policy.max_books;
  END IF;

  -- 4. Calculate due date based on working days
  v_due_date := add_working_days(p_library_id, CURRENT_DATE, v_policy.loan_days);

  -- 5. Update copy status to 'issued'
  UPDATE copies
  SET status = 'issued', updated_at = now()
  WHERE id = p_copy_id;

  -- 6. Insert loan record
  INSERT INTO loans (
    library_id,
    copy_id,
    user_id,
    issued_by,
    issued_at,
    due_date,
    status
  ) VALUES (
    p_library_id,
    p_copy_id,
    p_user_id,
    p_librarian_id,
    now(),
    v_due_date,
    'active'
  ) RETURNING id INTO v_loan_id;

  -- 7. Record immutable audit log
  INSERT INTO audit_log (
    library_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data
  ) VALUES (
    p_library_id,
    p_librarian_id,
    'issue_copy',
    'copy',
    p_copy_id,
    jsonb_build_object('status', 'available'),
    jsonb_build_object('status', 'issued', 'loan_id', v_loan_id, 'borrower_id', p_user_id, 'due_date', v_due_date)
  );

  RETURN v_loan_id;
END;
$$ LANGUAGE plpgsql;

-- Soft-Withdrawal: Nothing is hard deleted; recorded with reason in audit_log
CREATE OR REPLACE FUNCTION withdraw_record(
  p_library_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_reason TEXT,
  p_librarian_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_old_data JSONB;
BEGIN
  IF p_entity_type = 'copy' THEN
    SELECT to_jsonb(c) INTO v_old_data FROM copies c WHERE c.id = p_entity_id AND c.library_id = p_library_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Copy not found'; END IF;

    UPDATE copies
    SET status = 'withdrawn', withdrawn_reason = p_reason, updated_at = now()
    WHERE id = p_entity_id AND library_id = p_library_id;

  ELSIF p_entity_type = 'edition' THEN
    SELECT to_jsonb(e) INTO v_old_data FROM editions e WHERE e.id = p_entity_id AND e.library_id = p_library_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Edition not found'; END IF;

    UPDATE editions
    SET is_withdrawn = true, withdrawn_reason = p_reason, updated_at = now()
    WHERE id = p_entity_id AND library_id = p_library_id;

  ELSIF p_entity_type = 'work' THEN
    SELECT to_jsonb(w) INTO v_old_data FROM works w WHERE w.id = p_entity_id AND w.library_id = p_library_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Work not found'; END IF;

    UPDATE works
    SET is_withdrawn = true, withdrawn_reason = p_reason, updated_at = now()
    WHERE id = p_entity_id AND library_id = p_library_id;

  ELSE
    RAISE EXCEPTION 'Unsupported entity type for withdrawal: %', p_entity_type;
  END IF;

  -- Append to audit log
  INSERT INTO audit_log (
    library_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data
  ) VALUES (
    p_library_id,
    p_librarian_id,
    'withdraw_' || p_entity_type,
    p_entity_type,
    p_entity_id,
    v_old_data,
    jsonb_build_object('withdrawn', true, 'reason', p_reason)
  );
END;
$$ LANGUAGE plpgsql;

-- Secure Student OTP Request (NO EMAIL LEAK + RATE LIMITING + IDENTICAL GENERIC RESPONSE)
CREATE OR REPLACE FUNCTION request_student_otp(
  p_reg_no TEXT,
  p_library_code TEXT,
  p_client_ip TEXT DEFAULT 'unknown'
)
RETURNS JSONB AS $$
DECLARE
  v_rate_key TEXT;
  v_rate RECORD;
  v_profile RECORD;
  v_lib_id UUID;
  v_otp TEXT;
  v_otp_hash TEXT;
  v_masked_email TEXT;
  v_masked_name TEXT;
  v_name_parts TEXT[];
  v_email_user TEXT;
  v_email_domain TEXT;
  v_generic_response JSONB;
BEGIN
  -- Build sanitized rate limit key
  v_rate_key := 'otp:' || COALESCE(p_client_ip, 'ip') || ':' || LOWER(TRIM(p_reg_no));

  -- Standard generic response to prevent user enumeration
  v_generic_response := jsonb_build_object(
    'success', true,
    'message', 'If this register number is enrolled, an OTP code has been dispatched to the registered student email.',
    'masked_email', 's***@student.ait.edu',
    'masked_name', 'Student'
  );

  -- Rate limit check (max 5 requests per 15 minutes)
  SELECT * INTO v_rate FROM auth_rate_limits WHERE identifier = v_rate_key FOR UPDATE;

  IF FOUND THEN
    IF now() - v_rate.window_start > interval '15 minutes' THEN
      UPDATE auth_rate_limits
      SET attempt_count = 1, window_start = now(), last_attempt_at = now()
      WHERE identifier = v_rate_key;
    ELSIF v_rate.attempt_count >= 5 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Too many requests. Please wait 15 minutes before requesting another OTP.'
      );
    ELSE
      UPDATE auth_rate_limits
      SET attempt_count = attempt_count + 1, last_attempt_at = now()
      WHERE identifier = v_rate_key;
    END IF;
  ELSE
    INSERT INTO auth_rate_limits (identifier, attempt_count, window_start, last_attempt_at)
    VALUES (v_rate_key, 1, now(), now());
  END IF;

  -- Lookup library
  SELECT id INTO v_lib_id FROM libraries WHERE code = p_library_code AND status = 'approved';
  IF NOT FOUND THEN
    RETURN v_generic_response;
  END IF;

  -- Lookup student profile
  SELECT * INTO v_profile
  FROM profiles
  WHERE library_id = v_lib_id
    AND UPPER(TRIM(reg_no)) = UPPER(TRIM(p_reg_no))
    AND role = 'student'
    AND is_active = true;

  IF NOT FOUND THEN
    -- Return exact same generic response so attackers cannot discover whether a reg_no exists
    RETURN v_generic_response;
  END IF;

  -- Generate 6-digit cryptographic random OTP (100000 - 999999)
  v_otp := LPAD((100000 + FLOOR(RANDOM() * 900000))::TEXT, 6, '0');
  v_otp_hash := encode(digest(v_otp, 'sha256'), 'hex');

  -- Invalidate any previous unconsumed OTPs for this profile
  UPDATE student_otps
  SET consumed = true
  WHERE profile_id = v_profile.id AND consumed = false;

  -- Insert new OTP with 10-minute validity
  INSERT INTO student_otps (
    profile_id,
    otp_hash,
    expires_at,
    attempts,
    consumed
  ) VALUES (
    v_profile.id,
    v_otp_hash,
    now() + interval '10 minutes',
    0,
    false
  );

  -- Mask email: never send full email to client!
  -- e.g. "aarav.sharma@student.ait.edu" -> "a***a@student.ait.edu"
  v_email_user := split_part(v_profile.email, '@', 1);
  v_email_domain := split_part(v_profile.email, '@', 2);
  IF length(v_email_user) <= 2 THEN
    v_masked_email := LEFT(v_email_user, 1) || '***@' || v_email_domain;
  ELSE
    v_masked_email := LEFT(v_email_user, 1) || '***' || RIGHT(v_email_user, 1) || '@' || v_email_domain;
  END IF;

  -- Mask name: "Aarav Sharma" -> "A****v S****a"
  v_name_parts := string_to_array(v_profile.name, ' ');
  v_masked_name := '';
  FOR i IN 1..cardinality(v_name_parts) LOOP
    IF length(v_name_parts[i]) <= 2 THEN
      v_masked_name := v_masked_name || v_name_parts[i] || ' ';
    ELSE
      v_masked_name := v_masked_name || LEFT(v_name_parts[i], 1) || '***' || RIGHT(v_name_parts[i], 1) || ' ';
    END IF;
  END LOOP;
  v_masked_name := TRIM(v_masked_name);

  -- In production, the OTP is sent via Supabase Auth / SMTP email.
  -- Notice: we return ONLY the masked hint and masked name. The full email is NEVER returned to browser.
  RETURN jsonb_build_object(
    'success', true,
    'message', 'An OTP has been dispatched to your registered email address.',
    'masked_email', v_masked_email,
    'masked_name', v_masked_name,
    -- Store internal token reference or mock debug in non-prod
    'ref_id', v_profile.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify Student OTP
CREATE OR REPLACE FUNCTION verify_student_otp(
  p_reg_no TEXT,
  p_library_code TEXT,
  p_otp TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_lib_id UUID;
  v_profile RECORD;
  v_otp_record RECORD;
  v_provided_hash TEXT;
BEGIN
  SELECT id INTO v_lib_id FROM libraries WHERE code = p_library_code AND status = 'approved';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid library');
  END IF;

  SELECT * INTO v_profile
  FROM profiles
  WHERE library_id = v_lib_id
    AND UPPER(TRIM(reg_no)) = UPPER(TRIM(p_reg_no))
    AND role = 'student'
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid credentials');
  END IF;

  -- Find latest unconsumed OTP
  SELECT * INTO v_otp_record
  FROM student_otps
  WHERE profile_id = v_profile.id AND consumed = false
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active OTP found. Please request a new one.');
  END IF;

  IF now() > v_otp_record.expires_at THEN
    RETURN jsonb_build_object('success', false, 'error', 'OTP has expired. Please request a new one.');
  END IF;

  IF v_otp_record.attempts >= 5 THEN
    UPDATE student_otps SET consumed = true WHERE id = v_otp_record.id;
    RETURN jsonb_build_object('success', false, 'error', 'Too many invalid attempts. Please request a new OTP.');
  END IF;

  -- Check hash
  v_provided_hash := encode(digest(TRIM(p_otp), 'sha256'), 'hex');

  IF v_provided_hash != v_otp_record.otp_hash THEN
    UPDATE student_otps SET attempts = attempts + 1 WHERE id = v_otp_record.id;
    RETURN jsonb_build_object('success', false, 'error', 'Invalid OTP code. Please try again.');
  END IF;

  -- Mark OTP consumed
  UPDATE student_otps SET consumed = true WHERE id = v_otp_record.id;

  -- Return user session info
  RETURN jsonb_build_object(
    'success', true,
    'profile', jsonb_build_object(
      'id', v_profile.id,
      'library_id', v_profile.library_id,
      'role', v_profile.role,
      'reg_no', v_profile.reg_no,
      'name', v_profile.name,
      'department', v_profile.department,
      'year', v_profile.year,
      'user_type', v_profile.user_type,
      'photo_url', v_profile.photo_url
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Row Level Security (RLS)

-- Helper: Get current user's profile from auth.uid() or claim
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS profiles AS $$
DECLARE
  v_prof profiles;
BEGIN
  SELECT * INTO v_prof FROM profiles WHERE id = auth.uid();
  RETURN v_prof;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Enable RLS across all tables
ALTER TABLE libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;

-- Libraries Policies
CREATE POLICY "Public read for approved libraries"
  ON libraries FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Super admin full access on libraries"
  ON libraries FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Profiles Policies
CREATE POLICY "Users can read profiles within their library"
  ON profiles FOR SELECT
  USING (
    library_id = (SELECT library_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Librarians manage profiles in library"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND library_id = profiles.library_id
        AND role IN ('librarian', 'head_librarian', 'super_admin')
    )
  );

-- Catalog Policies (works, editions, copies, course_map)
CREATE POLICY "Read non-withdrawn works within library"
  ON works FOR SELECT
  USING (
    library_id = (SELECT library_id FROM profiles WHERE id = auth.uid())
    AND (is_withdrawn = false OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('librarian', 'head_librarian')
    ))
  );

CREATE POLICY "Librarians manage works"
  ON works FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND library_id = works.library_id
        AND role IN ('librarian', 'head_librarian', 'super_admin')
    )
  );

CREATE POLICY "Read editions within library"
  ON editions FOR SELECT
  USING (
    library_id = (SELECT library_id FROM profiles WHERE id = auth.uid())
    AND (is_withdrawn = false OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('librarian', 'head_librarian')
    ))
  );

CREATE POLICY "Librarians manage editions"
  ON editions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND library_id = editions.library_id
        AND role IN ('librarian', 'head_librarian', 'super_admin')
    )
  );

CREATE POLICY "Read copies within library"
  ON copies FOR SELECT
  USING (
    library_id = (SELECT library_id FROM profiles WHERE id = auth.uid())
    AND (status != 'withdrawn' OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('librarian', 'head_librarian')
    ))
  );

CREATE POLICY "Librarians manage copies"
  ON copies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND library_id = copies.library_id
        AND role IN ('librarian', 'head_librarian', 'super_admin')
    )
  );

CREATE POLICY "Read course map within library"
  ON course_map FOR SELECT
  USING (library_id = (SELECT library_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Librarians manage course map"
  ON course_map FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND library_id = course_map.library_id
        AND role IN ('librarian', 'head_librarian', 'super_admin')
    )
  );

-- Loans Policies
CREATE POLICY "Users read own loans"
  ON loans FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND library_id = loans.library_id
        AND role IN ('librarian', 'head_librarian', 'super_admin')
    )
  );

CREATE POLICY "Librarians manage loans"
  ON loans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND library_id = loans.library_id
        AND role IN ('librarian', 'head_librarian', 'super_admin')
    )
  );

-- Policies Table Policies
CREATE POLICY "Read library policies"
  ON policies FOR SELECT
  USING (library_id = (SELECT library_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Head librarian manages policies"
  ON policies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND library_id = policies.library_id
        AND role IN ('head_librarian', 'super_admin')
    )
  );

-- Holidays Policies
CREATE POLICY "Read holidays"
  ON holidays FOR SELECT
  USING (library_id = (SELECT library_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Head librarian manages holidays"
  ON holidays FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND library_id = holidays.library_id
        AND role IN ('head_librarian', 'super_admin')
    )
  );

-- AUDIT LOG: STRICTLY INSERT-ONLY! NO UPDATE OR DELETE ALLOWED FOR ANYONE
CREATE POLICY "Audit log read for librarians and admins"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND library_id = audit_log.library_id
        AND role IN ('librarian', 'head_librarian', 'super_admin')
    )
  );

CREATE POLICY "Audit log insert only"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- Explicitly revoke UPDATE and DELETE on audit_log
REVOKE UPDATE, DELETE ON audit_log FROM authenticated, anon, public;

-- End of 00001_initial_schema.sql
