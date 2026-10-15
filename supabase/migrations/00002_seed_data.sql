-- ====================================================================
-- Migration: 00002_seed_data.sql
-- Seed Data for Apex Institute of Technology Central Library
-- 1 Approved Library, Policies, Holidays, 3 Librarians, 10 Students,
-- and 200 Physical Copies across 14 Works with Multi-Editions
-- ====================================================================

-- 1. Insert Apex Institute of Technology Central Library (Status: approved)
INSERT INTO libraries (id, name, code, status, address, contact_email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Apex Institute of Technology Central Library',
  'AIT-CENTRAL',
  'approved',
  'Campus Academic Block A, Level 2, Tech Valley',
  'library-helpdesk@ait.edu'
) ON CONFLICT (code) DO NOTHING;

-- 2. Insert Policies per user_type
INSERT INTO policies (library_id, user_type, loan_days, max_books, fine_per_day, max_renewals)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'undergraduate', 14, 3, 5.00, 2),
  ('00000000-0000-0000-0000-000000000001', 'postgraduate', 21, 5, 5.00, 3),
  ('00000000-0000-0000-0000-000000000001', 'phd_scholar', 30, 8, 3.00, 4),
  ('00000000-0000-0000-0000-000000000001', 'faculty', 60, 10, 0.00, 5),
  ('00000000-0000-0000-0000-000000000001', 'staff', 30, 5, 2.00, 3)
ON CONFLICT (library_id, user_type) DO NOTHING;

-- 3. Insert Academic Holidays (Working days exclude these dates)
INSERT INTO holidays (library_id, date, name)
VALUES
  ('00000000-0000-0000-0000-000000000001', '2026-01-26', 'Republic Day'),
  ('00000000-0000-0000-0000-000000000001', '2026-03-04', 'Holi Festival'),
  ('00000000-0000-0000-0000-000000000001', '2026-04-14', 'Ambedkar Jayanti'),
  ('00000000-0000-0000-0000-000000000001', '2026-05-01', 'May Day'),
  ('00000000-0000-0000-0000-000000000001', '2026-08-15', 'Independence Day'),
  ('00000000-0000-0000-0000-000000000001', '2026-10-02', 'Gandhi Jayanti'),
  ('00000000-0000-0000-0000-000000000001', '2026-10-20', 'Dussehra'),
  ('00000000-0000-0000-0000-000000000001', '2026-11-08', 'Diwali Festival of Lights'),
  ('00000000-0000-0000-0000-000000000001', '2026-12-25', 'Christmas Day')
ON CONFLICT (library_id, date) DO NOTHING;

-- 4. Insert Staff Profiles (1 Head Librarian, 2 Librarians)
INSERT INTO profiles (id, library_id, role, name, email, department, user_type, photo_url)
VALUES ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'head_librarian', 'Dr. Priya Sharma', 'priya.sharma@library.ait.edu', 'Central Library Administration', 'faculty', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
INSERT INTO profiles (id, library_id, role, name, email, department, user_type, photo_url)
VALUES ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'librarian', 'Rahul Verma', 'rahul.verma@library.ait.edu', 'Circulation & Cataloging Desk', 'staff', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
INSERT INTO profiles (id, library_id, role, name, email, department, user_type, photo_url)
VALUES ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'librarian', 'Ananya Sen', 'ananya.sen@library.ait.edu', 'Reference & Digital Acquisitions', 'staff', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

-- 5. Insert 10 Student Profiles (with register numbers and photos)
INSERT INTO profiles (id, library_id, role, reg_no, name, email, department, year, user_type, photo_url)
VALUES ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'student', 'AIT2023CS001', 'Aarav Sharma', 'aarav.sharma@student.ait.edu', 'Computer Science & Engineering', 3, 'undergraduate', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, reg_no) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;
INSERT INTO profiles (id, library_id, role, reg_no, name, email, department, year, user_type, photo_url)
VALUES ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'student', 'AIT2023CS002', 'Diya Patel', 'diya.patel@student.ait.edu', 'Computer Science & Engineering', 3, 'undergraduate', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, reg_no) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;
INSERT INTO profiles (id, library_id, role, reg_no, name, email, department, year, user_type, photo_url)
VALUES ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'student', 'AIT2023EC001', 'Rohan Iyer', 'rohan.iyer@student.ait.edu', 'Electronics & Communication', 2, 'undergraduate', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, reg_no) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;
INSERT INTO profiles (id, library_id, role, reg_no, name, email, department, year, user_type, photo_url)
VALUES ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'student', 'AIT2023EC002', 'Sneha Kulkarni', 'sneha.kulkarni@student.ait.edu', 'Electronics & Communication', 4, 'undergraduate', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, reg_no) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;
INSERT INTO profiles (id, library_id, role, reg_no, name, email, department, year, user_type, photo_url)
VALUES ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'student', 'AIT2023DS001', 'Kabir Verma', 'kabir.verma@student.ait.edu', 'Data Science & Artificial Intelligence', 2, 'undergraduate', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, reg_no) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;
INSERT INTO profiles (id, library_id, role, reg_no, name, email, department, year, user_type, photo_url)
VALUES ('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'student', 'AIT2023ME001', 'Tanvi Nair', 'tanvi.nair@student.ait.edu', 'Mechanical Engineering', 3, 'undergraduate', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, reg_no) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;
INSERT INTO profiles (id, library_id, role, reg_no, name, email, department, year, user_type, photo_url)
VALUES ('30000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'student', 'AIT2023CS007', 'Vikram Choudhary', 'vikram.choudhary@student.ait.edu', 'Computer Science & Engineering', 1, 'undergraduate', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, reg_no) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;
INSERT INTO profiles (id, library_id, role, reg_no, name, email, department, year, user_type, photo_url)
VALUES ('30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'student', 'AIT2024PG001', 'Ananya Deshmukh', 'ananya.deshmukh@student.ait.edu', 'M.Tech Artificial Intelligence', 1, 'postgraduate', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, reg_no) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;
INSERT INTO profiles (id, library_id, role, reg_no, name, email, department, year, user_type, photo_url)
VALUES ('30000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'student', 'AIT2024PG002', 'Aditya Roy', 'aditya.roy@student.ait.edu', 'M.Tech VLSI & Embedded Systems', 2, 'postgraduate', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, reg_no) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;
INSERT INTO profiles (id, library_id, role, reg_no, name, email, department, year, user_type, photo_url)
VALUES ('30000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'student', 'AIT2024PHD01', 'Meera Nambiar', 'meera.nambiar@student.ait.edu', 'Doctoral Research Scholar in CS', 2, 'phd_scholar', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80')
ON CONFLICT (library_id, reg_no) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;

-- 6. Insert Works, Editions, Course Maps, and 200 Copies

-- Work: Introduction to Algorithms
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Introduction to Algorithms', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', 'Computer Science & AI', 'Comprehensive modern textbook on computer algorithms, covering data structures, graph algorithms, and dynamic programming.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'CS201', 'Curriculum CS201', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'CS501', 'Curriculum CS501', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '9780262033848', 3, 'MIT Press', 2009, 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ACC-001', 'available', 'CS-ALGO-03-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ACC-002', 'available', 'CS-ALGO-03-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ACC-003', 'available', 'CS-ALGO-03-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ACC-004', 'available', 'CS-ALGO-03-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ACC-005', 'issued', 'CS-ALGO-03-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ACC-006', 'available', 'CS-ALGO-03-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ACC-007', 'available', 'CS-ALGO-03-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ACC-008', 'available', 'CS-ALGO-03-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '9780262046305', 4, 'MIT Press', 2022, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'ACC-009', 'on_hold_shelf', 'CS-ALGO-04-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'ACC-010', 'available', 'CS-ALGO-04-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'ACC-011', 'available', 'CS-ALGO-04-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'ACC-012', 'issued', 'CS-ALGO-04-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'ACC-013', 'available', 'CS-ALGO-04-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'ACC-014', 'damaged_repair', 'CS-ALGO-04-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'ACC-015', 'available', 'CS-ALGO-04-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'ACC-016', 'available', 'CS-ALGO-04-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'ACC-017', 'available', 'CS-ALGO-04-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'ACC-018', 'issued', 'CS-ALGO-04-S03-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'ACC-019', 'lost', 'CS-ALGO-04-S03-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'ACC-020', 'available', 'CS-ALGO-04-S03-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Computer Networking: A Top-Down Approach
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Computer Networking: A Top-Down Approach', 'James F. Kurose, Keith W. Ross', 'Computer Science & AI', 'Premier textbook focusing on Internet protocols and network architectural layers from the application down.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'CS304', 'Curriculum CS304', '10000000-0000-0000-0000-000000000002')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '9780133594140', 7, 'Pearson', 2016, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'ACC-021', 'available', 'CS-NET-07-S01-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'ACC-022', 'available', 'CS-NET-07-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'ACC-023', 'available', 'CS-NET-07-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'ACC-024', 'available', 'CS-NET-07-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'ACC-025', 'issued', 'CS-NET-07-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'ACC-026', 'available', 'CS-NET-07-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'ACC-027', 'available', 'CS-NET-07-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '9780136681557', 8, 'Pearson', 2020, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'ACC-028', 'available', 'CS-NET-08-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'ACC-029', 'on_hold_shelf', 'CS-NET-08-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'ACC-030', 'available', 'CS-NET-08-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'ACC-031', 'available', 'CS-NET-08-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'ACC-032', 'issued', 'CS-NET-08-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'ACC-033', 'available', 'CS-NET-08-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'ACC-034', 'damaged_repair', 'CS-NET-08-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'ACC-035', 'available', 'CS-NET-08-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'ACC-036', 'available', 'CS-NET-08-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'ACC-037', 'available', 'CS-NET-08-S03-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'ACC-038', 'issued', 'CS-NET-08-S03-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Artificial Intelligence: A Modern Approach
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', 'Computer Science & AI', 'The standard and most cited synthesis of foundational and contemporary artificial intelligence concepts.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'AI301', 'Curriculum AI301', '10000000-0000-0000-0000-000000000003')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'CS602', 'Curriculum CS602', '10000000-0000-0000-0000-000000000003')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '9780136042594', 3, 'Prentice Hall', 2009, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'ACC-039', 'lost', 'CS-AI-03-S01-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'ACC-040', 'available', 'CS-AI-03-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'ACC-041', 'available', 'CS-AI-03-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'ACC-042', 'available', 'CS-AI-03-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'ACC-043', 'available', 'CS-AI-03-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'ACC-044', 'available', 'CS-AI-03-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'ACC-045', 'issued', 'CS-AI-03-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '9780134610993', 4, 'Pearson', 2020, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'ACC-046', 'available', 'CS-AI-04-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'ACC-047', 'available', 'CS-AI-04-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'ACC-048', 'available', 'CS-AI-04-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'ACC-049', 'on_hold_shelf', 'CS-AI-04-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'ACC-050', 'available', 'CS-AI-04-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'ACC-051', 'available', 'CS-AI-04-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'ACC-052', 'issued', 'CS-AI-04-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'ACC-053', 'available', 'CS-AI-04-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'ACC-054', 'damaged_repair', 'CS-AI-04-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'ACC-055', 'available', 'CS-AI-04-S03-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 'ACC-056', 'available', 'CS-AI-04-S03-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Operating System Concepts
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Operating System Concepts', 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne', 'Computer Science & AI', 'Classic dinosaur book exploring process management, threads, memory paging, storage systems, and protection.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'CS202', 'Curriculum CS202', '10000000-0000-0000-0000-000000000004')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '9781118063330', 9, 'Wiley', 2012, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'ACC-057', 'available', 'CS-OS-09-S01-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'ACC-058', 'issued', 'CS-OS-09-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'ACC-059', 'lost', 'CS-OS-09-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'ACC-060', 'available', 'CS-OS-09-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'ACC-061', 'available', 'CS-OS-09-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'ACC-062', 'available', 'CS-OS-09-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'ACC-063', 'available', 'CS-OS-09-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '9781119800361', 10, 'Wiley', 2018, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'ACC-064', 'available', 'CS-OS-10-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'ACC-065', 'issued', 'CS-OS-10-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'ACC-066', 'available', 'CS-OS-10-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'ACC-067', 'available', 'CS-OS-10-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'ACC-068', 'available', 'CS-OS-10-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'ACC-069', 'on_hold_shelf', 'CS-OS-10-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'ACC-070', 'available', 'CS-OS-10-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'ACC-071', 'available', 'CS-OS-10-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'ACC-072', 'issued', 'CS-OS-10-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Designing Data-Intensive Applications
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Designing Data-Intensive Applications', 'Martin Kleppmann', 'Computer Science & AI', 'The definitive guide to distributed databases, consensus, event streams, and reliable architecture.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'CS405', 'Curriculum CS405', '10000000-0000-0000-0000-000000000005')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', '9781449373320', 1, 'O'Reilly Media', 2017, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 'ACC-073', 'available', 'CS-DATA-01-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 'ACC-074', 'damaged_repair', 'CS-DATA-01-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 'ACC-075', 'available', 'CS-DATA-01-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 'ACC-076', 'available', 'CS-DATA-01-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 'ACC-077', 'available', 'CS-DATA-01-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 'ACC-078', 'issued', 'CS-DATA-01-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 'ACC-079', 'lost', 'CS-DATA-01-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 'ACC-080', 'available', 'CS-DATA-01-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 'ACC-081', 'available', 'CS-DATA-01-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Microelectronic Circuits
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Microelectronic Circuits', 'Adel S. Sedra, Kenneth C. Smith', 'Electronics & Electrical Engineering', 'Gold standard textbook for analog and digital integrated circuit design and semiconductor physics.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'EC201', 'Curriculum EC201', '10000000-0000-0000-0000-000000000006')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'EC302', 'Curriculum EC302', '10000000-0000-0000-0000-000000000006')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', '9780199339136', 7, 'Oxford University Press', 2014, 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', 'ACC-082', 'available', 'EE-MIC-07-S01-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', 'ACC-083', 'available', 'EE-MIC-07-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', 'ACC-084', 'available', 'EE-MIC-07-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', 'ACC-085', 'issued', 'EE-MIC-07-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', 'ACC-086', 'available', 'EE-MIC-07-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', 'ACC-087', 'available', 'EE-MIC-07-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', 'ACC-088', 'available', 'EE-MIC-07-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', '9780190853464', 8, 'Oxford University Press', 2019, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', 'ACC-089', 'on_hold_shelf', 'EE-MIC-08-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', 'ACC-090', 'available', 'EE-MIC-08-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', 'ACC-091', 'available', 'EE-MIC-08-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', 'ACC-092', 'issued', 'EE-MIC-08-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', 'ACC-093', 'available', 'EE-MIC-08-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', 'ACC-094', 'damaged_repair', 'EE-MIC-08-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', 'ACC-095', 'available', 'EE-MIC-08-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', 'ACC-096', 'available', 'EE-MIC-08-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', 'ACC-097', 'available', 'EE-MIC-08-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Signals and Systems
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Signals and Systems', 'Alan V. Oppenheim, Alan S. Willsky, S. Hamid Nawab', 'Electronics & Electrical Engineering', 'Continuous-time and discrete-time signals, Fourier transforms, Laplace, and Z-transform foundational analysis.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'EC203', 'Curriculum EC203', '10000000-0000-0000-0000-000000000007')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', '9780138147570', 2, 'Prentice Hall', 1996, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', 'ACC-098', 'issued', 'EE-SIG-02-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', 'ACC-099', 'lost', 'EE-SIG-02-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', 'ACC-100', 'available', 'EE-SIG-02-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', 'ACC-101', 'available', 'EE-SIG-02-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', 'ACC-102', 'available', 'EE-SIG-02-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', 'ACC-103', 'available', 'EE-SIG-02-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', 'ACC-104', 'available', 'EE-SIG-02-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', 'ACC-105', 'issued', 'EE-SIG-02-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', 'ACC-106', 'available', 'EE-SIG-02-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', 'ACC-107', 'available', 'EE-SIG-02-S03-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Modern Control Engineering
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Modern Control Engineering', 'Katsuhiko Ogata', 'Electronics & Electrical Engineering', 'Comprehensive coverage of classical control, root locus, Bode frequency response, and state-space equations.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'EE301', 'Curriculum EE301', '10000000-0000-0000-0000-000000000008')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', '9780136156734', 5, 'Prentice Hall', 2009, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000013', 'ACC-108', 'available', 'EE-CTRL-05-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000013', 'ACC-109', 'on_hold_shelf', 'EE-CTRL-05-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000013', 'ACC-110', 'available', 'EE-CTRL-05-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000013', 'ACC-111', 'available', 'EE-CTRL-05-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000013', 'ACC-112', 'issued', 'EE-CTRL-05-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000013', 'ACC-113', 'available', 'EE-CTRL-05-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000013', 'ACC-114', 'damaged_repair', 'EE-CTRL-05-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000013', 'ACC-115', 'available', 'EE-CTRL-05-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Linear Algebra and Its Applications
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Linear Algebra and Its Applications', 'Gilbert Strang', 'Mathematics & Data Science', 'Foundational text emphasizing vector spaces, matrix factorizations, eigenvalues, and SVD in engineering.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'MA101', 'Curriculum MA101', '10000000-0000-0000-0000-000000000009')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'DS201', 'Curriculum DS201', '10000000-0000-0000-0000-000000000009')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', '9780030105678', 4, 'Cengage Learning', 2006, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014', 'ACC-116', 'available', 'MA-LIN-04-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014', 'ACC-117', 'available', 'MA-LIN-04-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014', 'ACC-118', 'issued', 'MA-LIN-04-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014', 'ACC-119', 'lost', 'MA-LIN-04-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014', 'ACC-120', 'available', 'MA-LIN-04-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014', 'ACC-121', 'available', 'MA-LIN-04-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014', 'ACC-122', 'available', 'MA-LIN-04-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014', 'ACC-123', 'available', 'MA-LIN-04-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014', 'ACC-124', 'available', 'MA-LIN-04-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000014', 'ACC-125', 'issued', 'MA-LIN-04-S03-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', '9780980232776', 5, 'Wellesley-Cambridge Press', 2016, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', 'ACC-126', 'available', 'MA-LIN-05-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', 'ACC-127', 'available', 'MA-LIN-05-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', 'ACC-128', 'available', 'MA-LIN-05-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', 'ACC-129', 'on_hold_shelf', 'MA-LIN-05-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', 'ACC-130', 'available', 'MA-LIN-05-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', 'ACC-131', 'available', 'MA-LIN-05-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', 'ACC-132', 'issued', 'MA-LIN-05-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', 'ACC-133', 'available', 'MA-LIN-05-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', 'ACC-134', 'damaged_repair', 'MA-LIN-05-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', 'ACC-135', 'available', 'MA-LIN-05-S03-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', 'ACC-136', 'available', 'MA-LIN-05-S03-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000015', 'ACC-137', 'available', 'MA-LIN-05-S03-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Pattern Recognition and Machine Learning
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Pattern Recognition and Machine Learning', 'Christopher M. Bishop', 'Mathematics & Data Science', 'Rigorous Bayesian perspective on statistical learning, neural networks, graphical models, and kernel methods.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'DS301', 'Curriculum DS301', '10000000-0000-0000-0000-000000000010')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', '9780387310732', 1, 'Springer', 2006, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000016', 'ACC-138', 'issued', 'MA-ML-01-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000016', 'ACC-139', 'lost', 'MA-ML-01-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000016', 'ACC-140', 'available', 'MA-ML-01-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000016', 'ACC-141', 'available', 'MA-ML-01-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000016', 'ACC-142', 'available', 'MA-ML-01-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000016', 'ACC-143', 'available', 'MA-ML-01-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000016', 'ACC-144', 'available', 'MA-ML-01-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000016', 'ACC-145', 'issued', 'MA-ML-01-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000016', 'ACC-146', 'available', 'MA-ML-01-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000016', 'ACC-147', 'available', 'MA-ML-01-S03-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Deep Learning
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Deep Learning', 'Ian Goodfellow, Yoshua Bengio, Aaron Courville', 'Mathematics & Data Science', 'The standard reference for deep feedforward networks, convolution, recurrent nets, optimization and generative models.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'DS402', 'Curriculum DS402', '10000000-0000-0000-0000-000000000011')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'AI402', 'Curriculum AI402', '10000000-0000-0000-0000-000000000011')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', '9780262035613', 1, 'MIT Press', 2016, 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000017', 'ACC-148', 'available', 'MA-DL-01-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000017', 'ACC-149', 'on_hold_shelf', 'MA-DL-01-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000017', 'ACC-150', 'available', 'MA-DL-01-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000017', 'ACC-151', 'available', 'MA-DL-01-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000017', 'ACC-152', 'issued', 'MA-DL-01-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000017', 'ACC-153', 'available', 'MA-DL-01-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000017', 'ACC-154', 'damaged_repair', 'MA-DL-01-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000017', 'ACC-155', 'available', 'MA-DL-01-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000017', 'ACC-156', 'available', 'MA-DL-01-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000017', 'ACC-157', 'available', 'MA-DL-01-S03-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000017', 'ACC-158', 'issued', 'MA-DL-01-S03-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Shigley''s Mechanical Engineering Design
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Shigley''s Mechanical Engineering Design', 'Richard G. Budynas, J. Keith Nisbett', 'Mechanical Engineering & Physics', 'Core benchmark in machine element design, fatigue strength, gear trains, fasteners, and finite element principles.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'ME301', 'Curriculum ME301', '10000000-0000-0000-0000-000000000012')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', '9780073398204', 10, 'McGraw-Hill', 2014, 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000018', 'ACC-159', 'lost', 'ME-DES-10-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000018', 'ACC-160', 'available', 'ME-DES-10-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000018', 'ACC-161', 'available', 'ME-DES-10-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000018', 'ACC-162', 'available', 'ME-DES-10-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000018', 'ACC-163', 'available', 'ME-DES-10-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000018', 'ACC-164', 'available', 'ME-DES-10-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000018', 'ACC-165', 'issued', 'ME-DES-10-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000018', 'ACC-166', 'available', 'ME-DES-10-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', '9780073398211', 11, 'McGraw-Hill', 2020, 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', 'ACC-167', 'available', 'ME-DES-11-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', 'ACC-168', 'available', 'ME-DES-11-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', 'ACC-169', 'on_hold_shelf', 'ME-DES-11-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', 'ACC-170', 'available', 'ME-DES-11-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', 'ACC-171', 'available', 'ME-DES-11-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', 'ACC-172', 'issued', 'ME-DES-11-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', 'ACC-173', 'available', 'ME-DES-11-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', 'ACC-174', 'damaged_repair', 'ME-DES-11-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', 'ACC-175', 'available', 'ME-DES-11-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', 'ACC-176', 'available', 'ME-DES-11-S03-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Fundamentals of Physics
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Fundamentals of Physics', 'David Halliday, Robert Resnick, Jearl Walker', 'Mechanical Engineering & Physics', 'Renowned engineering physics text covering Newtonian mechanics, thermodynamics, electromagnetism, and optics.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'PH101', 'Curriculum PH101', '10000000-0000-0000-0000-000000000013')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000013', '9781118230718', 10, 'Wiley', 2013, 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000020', 'ACC-177', 'available', 'PH-FUND-10-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000020', 'ACC-178', 'issued', 'PH-FUND-10-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000020', 'ACC-179', 'lost', 'PH-FUND-10-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000020', 'ACC-180', 'available', 'PH-FUND-10-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000020', 'ACC-181', 'available', 'PH-FUND-10-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000020', 'ACC-182', 'available', 'PH-FUND-10-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000020', 'ACC-183', 'available', 'PH-FUND-10-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000020', 'ACC-184', 'available', 'PH-FUND-10-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000020', 'ACC-185', 'issued', 'PH-FUND-10-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000020', 'ACC-186', 'available', 'PH-FUND-10-S03-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000020', 'ACC-187', 'available', 'PH-FUND-10-S03-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000020', 'ACC-188', 'available', 'PH-FUND-10-S03-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- Work: Thermodynamics: An Engineering Approach
INSERT INTO works (id, library_id, title, author, subject, description)
VALUES ('10000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Thermodynamics: An Engineering Approach', 'Yunus A. Cengel, Michael A. Boles', 'Mechanical Engineering & Physics', 'First and second laws of thermodynamics, Carnot cycles, entropy generation, gas power cycles, and refrigeration.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO course_map (library_id, course_code, course_name, work_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'ME202', 'Curriculum ME202', '10000000-0000-0000-0000-000000000014')
ON CONFLICT (library_id, course_code, work_id) DO NOTHING;
INSERT INTO editions (id, library_id, work_id, isbn, edition_no, publisher, year, cover_url)
VALUES ('20000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', '9780073398174', 8, 'McGraw-Hill', 2014, 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (library_id, isbn) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', 'ACC-189', 'on_hold_shelf', 'ME-THERM-08-S01-R2', true)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', 'ACC-190', 'available', 'ME-THERM-08-S01-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', 'ACC-191', 'available', 'ME-THERM-08-S01-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', 'ACC-192', 'issued', 'ME-THERM-08-S01-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', 'ACC-193', 'available', 'ME-THERM-08-S02-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', 'ACC-194', 'damaged_repair', 'ME-THERM-08-S02-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', 'ACC-195', 'available', 'ME-THERM-08-S02-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', 'ACC-196', 'available', 'ME-THERM-08-S02-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', 'ACC-197', 'available', 'ME-THERM-08-S03-R2', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', 'ACC-198', 'issued', 'ME-THERM-08-S03-R3', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', 'ACC-199', 'lost', 'ME-THERM-08-S03-R4', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;
INSERT INTO copies (library_id, edition_id, accession_no, status, shelf_location, reference_only)
VALUES ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', 'ACC-200', 'available', 'ME-THERM-08-S03-R1', false)
ON CONFLICT (library_id, accession_no) DO NOTHING;

-- 7. Insert active sample loans for issued copies (issued to students by librarians)
DO $$
DECLARE
  v_issued_copy RECORD;
  v_student_ids UUID[] := ARRAY[
    '30000000-0000-0000-0000-000000000001'::UUID,
    '30000000-0000-0000-0000-000000000002'::UUID,
    '30000000-0000-0000-0000-000000000003'::UUID,
    '30000000-0000-0000-0000-000000000004'::UUID,
    '30000000-0000-0000-0000-000000000005'::UUID
  ];
  v_librarian_id UUID := '40000000-0000-0000-0000-000000000002';
  v_idx INTEGER := 1;
BEGIN
  FOR v_issued_copy IN SELECT id FROM copies WHERE status = 'issued' LIMIT 10 LOOP
    INSERT INTO loans (
      library_id,
      copy_id,
      user_id,
      issued_by,
      issued_at,
      due_date,
      status
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      v_issued_copy.id,
      v_student_ids[(v_idx % array_length(v_student_ids, 1)) + 1],
      v_librarian_id,
      now() - interval '5 days',
      (CURRENT_DATE + interval '9 days')::date,
      'active'
    ) ON CONFLICT DO NOTHING;
    v_idx := v_idx + 1;
  END LOOP;
END $$;
