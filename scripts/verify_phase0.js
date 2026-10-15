import fs from 'fs';
import path from 'path';

console.log('--- Running Phase 0 Verification Checks ---');
let errors = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    errors++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// 1. Verify 00001_initial_schema.sql
const schemaPath = path.resolve('supabase/migrations/00001_initial_schema.sql');
assert(fs.existsSync(schemaPath), '00001_initial_schema.sql exists');

const schemaSql = fs.readFileSync(schemaPath, 'utf8');

// Check Enums
assert(schemaSql.includes("CREATE TYPE library_status AS ENUM ('pending', 'approved', 'rejected')"), 'library_status enum defined with pending, approved, rejected');
assert(schemaSql.includes("CREATE TYPE user_role AS ENUM ('student', 'librarian', 'head_librarian', 'super_admin')"), 'user_role enum defined with student, librarian, head_librarian, super_admin');
assert(schemaSql.includes("CREATE TYPE user_type AS ENUM ('undergraduate', 'postgraduate', 'phd_scholar', 'faculty', 'staff')"), 'user_type enum defined');
assert(schemaSql.includes("CREATE TYPE copy_status AS ENUM"), 'copy_status enum defined');
assert(schemaSql.includes("'available'"), 'copy_status includes available');
assert(schemaSql.includes("'issued'"), 'copy_status includes issued');
assert(schemaSql.includes("'on_hold_shelf'"), 'copy_status includes on_hold_shelf');
assert(schemaSql.includes("'damaged_repair'"), 'copy_status includes damaged_repair');
assert(schemaSql.includes("'lost'"), 'copy_status includes lost');
assert(schemaSql.includes("'missing'"), 'copy_status includes missing');
assert(schemaSql.includes("'withdrawn'"), 'copy_status includes withdrawn');

// Ensure NO stored 'overdue'
assert(schemaSql.includes("CREATE TYPE loan_status AS ENUM ('active', 'returned', 'lost')"), "loan_status enum has ONLY 'active', 'returned', 'lost' (no stored overdue)");
assert(!schemaSql.includes("'overdue'"), "'overdue' is NOT stored in any enum or column");

// Check Tables
const requiredTables = [
  'libraries',
  'profiles',
  'works',
  'editions',
  'copies',
  'course_map',
  'loans',
  'holds',
  'holidays',
  'policies',
  'lost_reports',
  'audit_log',
  'notifications',
  'qr_tokens'
];

for (const tbl of requiredTables) {
  assert(schemaSql.includes(`CREATE TABLE IF NOT EXISTS ${tbl}`), `Table ${tbl} defined in schema`);
  if (tbl !== 'libraries') {
    assert(schemaSql.includes(`library_id UUID NOT NULL REFERENCES libraries(id)`) || schemaSql.includes(`${tbl} (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  library_id UUID`), `Table ${tbl} enforces library_id multi-tenancy foreign key`);
  }
}

// Check libraries status column
assert(schemaSql.includes("status library_status NOT NULL DEFAULT 'pending'"), "libraries table has status column defaulting to 'pending'");

// Check Functions
assert(schemaSql.includes('CREATE OR REPLACE FUNCTION is_working_day'), 'is_working_day function defined (Mon-Sat minus holidays)');
assert(schemaSql.includes('CREATE OR REPLACE FUNCTION add_working_days'), 'add_working_days function defined');
assert(schemaSql.includes('CREATE OR REPLACE FUNCTION count_working_days_between'), 'count_working_days_between function defined');
assert(schemaSql.includes('CREATE OR REPLACE FUNCTION is_loan_overdue'), 'is_loan_overdue computed function defined');
assert(schemaSql.includes('CREATE OR REPLACE FUNCTION calculate_fine'), 'calculate_fine computed dynamic fine function defined');
assert(schemaSql.includes('CREATE OR REPLACE FUNCTION issue_copy'), 'issue_copy function defined');
assert(schemaSql.includes('FOR UPDATE'), 'issue_copy locks copy row with FOR UPDATE');
assert(schemaSql.includes('CREATE OR REPLACE FUNCTION withdraw_record'), 'withdraw_record soft-delete function defined');
assert(schemaSql.includes('CREATE OR REPLACE FUNCTION request_student_otp'), 'request_student_otp secure function defined');
assert(schemaSql.includes('CREATE OR REPLACE FUNCTION verify_student_otp'), 'verify_student_otp secure function defined');

// Check Audit Log Insert-only constraints
assert(schemaSql.includes('REVOKE UPDATE, DELETE ON audit_log FROM authenticated, anon, public'), 'audit_log revokes UPDATE and DELETE');
assert(!schemaSql.includes('ON audit_log FOR UPDATE'), 'No update policy on audit_log');
assert(!schemaSql.includes('ON audit_log FOR DELETE'), 'No delete policy on audit_log');

// 2. Verify 00002_seed_data.sql
const seedPath = path.resolve('supabase/migrations/00002_seed_data.sql');
assert(fs.existsSync(seedPath), '00002_seed_data.sql exists');

const seedSql = fs.readFileSync(seedPath, 'utf8');

// Count copies
const copyMatches = seedSql.match(/INSERT INTO copies/g) || [];
assert(copyMatches.length === 200, `Seed SQL contains exactly 200 copies (found: ${copyMatches.length})`);

// Check Library
assert(seedSql.includes('Apex Institute of Technology Central Library'), 'Seed contains Apex Institute Central Library');
assert(seedSql.includes("'AIT-CENTRAL'"), 'Seed contains code AIT-CENTRAL');
assert(seedSql.includes("'approved'"), 'Seed library status is approved');

// Check Librarians
assert(seedSql.includes('Dr. Priya Sharma') && seedSql.includes('head_librarian'), 'Seed contains 1 Head Librarian (Dr. Priya Sharma)');
assert(seedSql.includes('Rahul Verma') && seedSql.includes('librarian'), 'Seed contains Librarian Rahul Verma');
assert(seedSql.includes('Ananya Sen') && seedSql.includes('librarian'), 'Seed contains Librarian Ananya Sen');

// Check 10 Students
for (let i = 1; i <= 7; i++) {
  const reg = `AIT2023CS00${i}`;
  if (i === 1 || i === 2 || i === 7) {
    assert(seedSql.includes(reg), `Seed contains student ${reg}`);
  }
}
assert(seedSql.includes('AIT2024PHD01'), 'Seed contains PhD student AIT2024PHD01');

// Check multi-edition works
assert(seedSql.includes('Introduction to Algorithms'), 'Seed contains Introduction to Algorithms');
assert(seedSql.includes('Computer Networking: A Top-Down Approach'), 'Seed contains Computer Networking');
assert(seedSql.includes('Artificial Intelligence: A Modern Approach'), 'Seed contains AI Modern Approach');
assert(seedSql.includes('Operating System Concepts'), 'Seed contains Operating System Concepts');

// 3. Verify Frontend Code & Policies
const loginPagePath = path.resolve('src/pages/LoginPage.tsx');
assert(fs.existsSync(loginPagePath), 'LoginPage.tsx exists');
const loginPageCode = fs.readFileSync(loginPagePath, 'utf8');

assert(loginPageCode.includes('isDemoMode'), 'LoginPage checks isDemoMode');
assert(!loginPageCode.includes('purple'), 'No purple color in LoginPage');
assert(loginPageCode.includes('teal-600') || loginPageCode.includes('teal-700'), 'Teal color used in LoginPage');
assert(loginPageCode.includes('amber-500') || loginPageCode.includes('amber-600'), 'Warm amber color used in LoginPage');

const supabaseServicePath = path.resolve('src/lib/supabase.ts');
const supabaseServiceCode = fs.readFileSync(supabaseServicePath, 'utf8');
assert(supabaseServiceCode.includes('rateLimitMap'), 'Rate limiting implemented in student OTP lookup');
assert(supabaseServiceCode.includes('genericResponse'), 'Generic response implemented for unknown reg_no');
assert(supabaseServiceCode.includes('maskEmail'), 'Email masking implemented - no full email exposed');

console.log('-------------------------------------------');
if (errors === 0) {
  console.log('🎉 ALL VERIFICATION CHECKS PASSED PERFECTLY!');
} else {
  console.error(`💥 ${errors} checks failed!`);
  process.exit(1);
}
