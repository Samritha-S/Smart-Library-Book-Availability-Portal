-- ====================================================================
-- Migration: 00003_search_and_availability.sql
-- Phase 1: Student Search and Availability
-- ====================================================================

-- 1. Enable pg_trgm for typo-tolerant trigram search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add price column to editions table
ALTER TABLE editions ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);

-- 3. Create Trigram and GIN indexes on works and course_map
CREATE INDEX IF NOT EXISTS idx_works_title_trgm ON works USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_works_author_trgm ON works USING gin (author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_works_subject_trgm ON works USING gin (subject gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_course_map_code_prefix ON course_map (course_code text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_course_map_name_trgm ON course_map USING gin (course_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_copies_work_status ON copies (edition_id, status, reference_only);

-- 4. RPC: search_catalog
-- Returns one row per work matching query across title, author, subject, course code, course name
-- Ranking: course code match (1), title match (2), author match (3), subject match (4)
CREATE OR REPLACE FUNCTION search_catalog(
  p_query TEXT DEFAULT '',
  p_subject TEXT DEFAULT NULL,
  p_only_available BOOLEAN DEFAULT FALSE,
  p_library_id UUID DEFAULT NULL
)
RETURNS TABLE (
  work_id UUID,
  title TEXT,
  author TEXT,
  subject TEXT,
  description TEXT,
  latest_edition_id UUID,
  latest_edition_no INTEGER,
  cover_url TEXT,
  edition_count BIGINT,
  total_copies BIGINT,
  available_copies BIGINT,
  reference_only_copies BIGINT,
  last_updated TIMESTAMPTZ,
  course_codes TEXT[],
  rank_score INTEGER
) AS $$
DECLARE
  v_clean_query TEXT := TRIM(COALESCE(p_query, ''));
  v_pattern TEXT;
BEGIN
  v_pattern := '%' || v_clean_query || '%';

  RETURN QUERY
  WITH work_editions AS (
    -- Group editions per work and identify the newest edition
    SELECT
      e.work_id,
      COUNT(e.id) AS edition_count,
      (ARRAY_AGG(e.id ORDER BY e.edition_no DESC, e.year DESC))[1] AS latest_edition_id,
      (ARRAY_AGG(e.edition_no ORDER BY e.edition_no DESC, e.year DESC))[1] AS latest_edition_no,
      (ARRAY_AGG(e.cover_url ORDER BY e.edition_no DESC, e.year DESC))[1] AS latest_cover_url
    FROM editions e
    WHERE e.is_withdrawn = false
    GROUP BY e.work_id
  ),
  work_copies AS (
    -- Count copies across all editions of each work
    SELECT
      e.work_id,
      COUNT(c.id) FILTER (WHERE c.status != 'withdrawn') AS total_copies,
      COUNT(c.id) FILTER (WHERE c.status = 'available' AND c.reference_only = false) AS available_copies,
      COUNT(c.id) FILTER (WHERE c.reference_only = true AND c.status != 'withdrawn') AS reference_only_copies,
      MAX(c.updated_at) AS last_copy_updated
    FROM editions e
    LEFT JOIN copies c ON c.edition_id = e.id
    WHERE e.is_withdrawn = false
    GROUP BY e.work_id
  ),
  work_courses AS (
    -- Aggregate course codes associated with work
    SELECT
      cm.work_id,
      ARRAY_AGG(DISTINCT cm.course_code ORDER BY cm.course_code) AS course_codes,
      BOOL_OR(
        cm.course_code ILIKE v_clean_query || '%' OR
        cm.course_name ILIKE v_pattern
      ) AS course_matched
    FROM course_map cm
    GROUP BY cm.work_id
  )
  SELECT
    w.id AS work_id,
    w.title,
    w.author,
    w.subject,
    w.description,
    we.latest_edition_id,
    COALESCE(we.latest_edition_no, 1) AS latest_edition_no,
    we.latest_cover_url AS cover_url,
    COALESCE(we.edition_count, 0) AS edition_count,
    COALESCE(wc.total_copies, 0) AS total_copies,
    COALESCE(wc.available_copies, 0) AS available_copies,
    COALESCE(wc.reference_only_copies, 0) AS reference_only_copies,
    GREATEST(w.updated_at, wc.last_copy_updated) AS last_updated,
    COALESCE(wcourses.course_codes, ARRAY[]::TEXT[]) AS course_codes,
    -- Ranking calculation: Course code match (100) -> Title (75) -> Author (50) -> Subject (25)
    (
      CASE
        WHEN v_clean_query = '' THEN 10
        WHEN COALESCE(wcourses.course_matched, false) THEN 100
        WHEN w.title ILIKE v_pattern OR similarity(w.title, v_clean_query) > 0.3 THEN 75
        WHEN w.author ILIKE v_pattern OR similarity(w.author, v_clean_query) > 0.3 THEN 50
        WHEN w.subject ILIKE v_pattern OR similarity(w.subject, v_clean_query) > 0.3 THEN 25
        ELSE 1
      END
    )::INTEGER AS rank_score
  FROM works w
  JOIN work_editions we ON we.work_id = w.id
  LEFT JOIN work_copies wc ON wc.work_id = w.id
  LEFT JOIN work_courses wcourses ON wcourses.work_id = w.id
  WHERE w.is_withdrawn = false
    AND (p_library_id IS NULL OR w.library_id = p_library_id)
    AND (p_subject IS NULL OR p_subject = '' OR w.subject = p_subject)
    AND (
      NOT p_only_available OR COALESCE(wc.available_copies, 0) > 0
    )
    AND (
      v_clean_query = '' OR
      COALESCE(wcourses.course_matched, false) OR
      w.title ILIKE v_pattern OR
      w.author ILIKE v_pattern OR
      w.subject ILIKE v_pattern OR
      similarity(w.title, v_clean_query) > 0.25 OR
      similarity(w.author, v_clean_query) > 0.25
    )
  ORDER BY
    rank_score DESC,
    available_copies DESC,
    w.title ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. RPC: get_work_detail
-- Returns complete work metadata, all editions newest first,
-- each edition with copy counts and physical copies grouped by shelf location.
-- CRITICAL PRIVACY: Never exposes who borrowed any copy.
CREATE OR REPLACE FUNCTION get_work_detail(p_work_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_work RECORD;
  v_editions JSONB;
  v_total_copies BIGINT;
  v_available_copies BIGINT;
  v_reference_only_copies BIGINT;
  v_courses TEXT[];
BEGIN
  -- 1. Fetch work
  SELECT * INTO v_work FROM works WHERE id = p_work_id AND is_withdrawn = false;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- 2. Fetch associated course codes
  SELECT COALESCE(ARRAY_AGG(course_code ORDER BY course_code), ARRAY[]::TEXT[])
  INTO v_courses
  FROM course_map
  WHERE work_id = p_work_id;

  -- 3. Fetch all editions, newest first, with their copy counts and shelf locations
  SELECT jsonb_agg(ed_row) INTO v_editions
  FROM (
    SELECT
      e.id AS edition_id,
      e.isbn,
      e.edition_no,
      e.publisher,
      e.year,
      e.price,
      e.cover_url,
      (e.edition_no = MAX(e.edition_no) OVER()) AS is_latest,
      COUNT(c.id) FILTER (WHERE c.status != 'withdrawn') AS total_copies,
      COUNT(c.id) FILTER (WHERE c.status = 'available' AND c.reference_only = false) AS available_copies,
      COUNT(c.id) FILTER (WHERE c.reference_only = true AND c.status != 'withdrawn') AS reference_copies,
      COUNT(c.id) FILTER (WHERE c.status = 'issued') AS issued_copies,
      -- Copies list: Privacy preserved! Only accession_no, shelf_location, reference_only, and status
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', cp.id,
              'accession_no', cp.accession_no,
              'shelf_location', cp.shelf_location,
              'reference_only', cp.reference_only,
              'status', cp.status
            )
            ORDER BY cp.shelf_location, cp.accession_no
          )
          FROM copies cp
          WHERE cp.edition_id = e.id AND cp.status != 'withdrawn'
        ),
        '[]'::jsonb
      ) AS copies
    FROM editions e
    LEFT JOIN copies c ON c.edition_id = e.id
    WHERE e.work_id = p_work_id AND e.is_withdrawn = false
    GROUP BY e.id, e.isbn, e.edition_no, e.publisher, e.year, e.price, e.cover_url
    ORDER BY e.edition_no DESC, e.year DESC
  ) ed_row;

  -- 4. Calculate aggregates across all editions
  SELECT
    COALESCE(SUM((elem->>'total_copies')::BIGINT), 0),
    COALESCE(SUM((elem->>'available_copies')::BIGINT), 0),
    COALESCE(SUM((elem->>'reference_copies')::BIGINT), 0)
  INTO v_total_copies, v_available_copies, v_reference_only_copies
  FROM jsonb_array_elements(COALESCE(v_editions, '[]'::jsonb)) AS elem;

  RETURN jsonb_build_object(
    'work_id', v_work.id,
    'library_id', v_work.library_id,
    'title', v_work.title,
    'author', v_work.author,
    'subject', v_work.subject,
    'description', v_work.description,
    'total_copies', v_total_copies,
    'available_copies', v_available_copies,
    'reference_only_copies', v_reference_only_copies,
    'course_codes', v_courses,
    'editions', COALESCE(v_editions, '[]'::jsonb),
    'last_updated', now()
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. RPC: get_student_active_loans
-- Returns active loans for a student with computed working days remaining,
-- status (overdue calculated on read), book title, cover, and fine.
CREATE OR REPLACE FUNCTION get_student_active_loans(p_student_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_loans JSONB;
BEGIN
  SELECT jsonb_agg(loan_row) INTO v_loans
  FROM (
    SELECT
      l.id AS loan_id,
      l.library_id,
      l.issued_at,
      l.due_date,
      l.renewals_count,
      -- Check if overdue dynamically
      (CURRENT_DATE > l.due_date) AS is_overdue,
      -- Calculate working days remaining if not overdue, or overdue working days if overdue
      CASE
        WHEN CURRENT_DATE <= l.due_date THEN
          count_working_days_between(l.library_id, CURRENT_DATE, l.due_date)
        ELSE
          count_working_days_between(l.library_id, l.due_date, CURRENT_DATE)
      END AS working_days_diff,
      calculate_fine(l.id) AS computed_fine,
      c.accession_no,
      c.shelf_location,
      e.isbn,
      e.edition_no,
      e.cover_url,
      w.id AS work_id,
      w.title AS book_title,
      w.author AS book_author,
      w.subject AS book_subject
    FROM loans l
    JOIN copies c ON c.id = l.copy_id
    JOIN editions e ON e.id = c.edition_id
    JOIN works w ON w.id = e.work_id
    WHERE l.user_id = p_student_id AND l.status = 'active'
    ORDER BY l.due_date ASC
  ) loan_row;

  RETURN COALESCE(v_loans, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Seed enhancements: Course mappings for 12 works & prices on editions
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'CS201', 'Data Structures and Algorithms', '10000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', 'CS501', 'Advanced Algorithm Design', '10000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', 'CS304', 'Computer Networks and Protocols', '10000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000001', 'AI301', 'Introduction to Artificial Intelligence', '10000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000001', 'CS602', 'Knowledge Systems and AI', '10000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000001', 'CS202', 'Operating Systems Principles', '10000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000001', 'CS405', 'Distributed Systems Architecture', '10000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0000-000000000001', 'EC201', 'Analog Electronic Circuits', '10000000-0000-0000-0000-000000000006'),
  ('00000000-0000-0000-0000-000000000001', 'EC302', 'Integrated Circuit Engineering', '10000000-0000-0000-0000-000000000006'),
  ('00000000-0000-0000-0000-000000000001', 'EC203', 'Signals and Linear Systems', '10000000-0000-0000-0000-000000000007'),
  ('00000000-0000-0000-0000-000000000001', 'EE301', 'Control Systems Engineering', '10000000-0000-0000-0000-000000000008'),
  ('00000000-0000-0000-0000-000000000001', 'MA101', 'Linear Algebra for Engineers', '10000000-0000-0000-0000-000000000009'),
  ('00000000-0000-0000-0000-000000000001', 'DS201', 'Matrix Methods in Data Science', '10000000-0000-0000-0000-000000000009'),
  ('00000000-0000-0000-0000-000000000001', 'DS301', 'Machine Learning Foundations', '10000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000001', 'DS402', 'Deep Neural Networks', '10000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000001', 'ME301', 'Mechanical Element Design', '10000000-0000-0000-0000-000000000012'),
  ('00000000-0000-0000-0000-000000000001', 'PH101', 'Engineering Physics', '10000000-0000-0000-0000-000000000013'),
  ('00000000-0000-0000-0000-000000000001', 'ME202', 'Applied Thermodynamics', '10000000-0000-0000-0000-000000000014')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;

-- Set realistic academic textbook prices on editions
UPDATE editions SET price = 850.00 WHERE isbn = '9780262033848';
UPDATE editions SET price = 1195.00 WHERE isbn = '9780262046305';
UPDATE editions SET price = 799.00 WHERE isbn = '9780133594140';
UPDATE editions SET price = 945.00 WHERE isbn = '9780136681557';
UPDATE editions SET price = 890.00 WHERE isbn = '9780136042594';
UPDATE editions SET price = 1050.00 WHERE isbn = '9780134610993';
UPDATE editions SET price = 720.00 WHERE isbn = '9781118063330';
UPDATE editions SET price = 899.00 WHERE isbn = '9781119800361';
UPDATE editions SET price = 1100.00 WHERE isbn = '9781449373320';
UPDATE editions SET price = 875.00 WHERE isbn = '9780199339136';
UPDATE editions SET price = 995.00 WHERE isbn = '9780190853464';
UPDATE editions SET price = 650.00 WHERE isbn = '9780138147570';
UPDATE editions SET price = 780.00 WHERE isbn = '9780136156734';
UPDATE editions SET price = 695.00 WHERE isbn = '9780030105678';
UPDATE editions SET price = 825.00 WHERE isbn = '9780980232776';
UPDATE editions SET price = 1250.00 WHERE isbn = '9780387310732';
UPDATE editions SET price = 980.00 WHERE isbn = '9780262035613';
UPDATE editions SET price = 840.00 WHERE isbn = '9780073398204';
UPDATE editions SET price = 960.00 WHERE isbn = '9780073398211';
UPDATE editions SET price = 750.00 WHERE isbn = '9781118230718';
UPDATE editions SET price = 820.00 WHERE isbn = '9780073398174';
