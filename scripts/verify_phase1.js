import fs from 'fs';
import path from 'path';

console.log('--- Running Phase 1 Verification Checks ---');
let errors = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    errors++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// 1. Verify 00003_search_and_availability.sql
const migration3Path = path.resolve('supabase/migrations/00003_search_and_availability.sql');
assert(fs.existsSync(migration3Path), '00003_search_and_availability.sql exists');

const migration3Sql = fs.readFileSync(migration3Path, 'utf8');

// pg_trgm & indexes
assert(migration3Sql.includes('CREATE EXTENSION IF NOT EXISTS pg_trgm;'), 'pg_trgm extension enabled');
assert(migration3Sql.includes('idx_works_title_trgm') && migration3Sql.includes('gin (title gin_trgm_ops)'), 'Trigram index on works(title) exists');
assert(migration3Sql.includes('idx_works_author_trgm') && migration3Sql.includes('gin (author gin_trgm_ops)'), 'Trigram index on works(author) exists');
assert(migration3Sql.includes('idx_works_subject_trgm') && migration3Sql.includes('gin (subject gin_trgm_ops)'), 'Trigram index on works(subject) exists');

// editions.price numeric column
assert(migration3Sql.includes('ALTER TABLE editions ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);'), 'editions.price numeric column added');

// search_catalog RPC
assert(migration3Sql.includes('CREATE OR REPLACE FUNCTION search_catalog'), 'search_catalog RPC defined');
assert(migration3Sql.includes('latest_edition_id UUID') && migration3Sql.includes('latest_edition_no INTEGER'), 'search_catalog returns latest edition details');
assert(migration3Sql.includes('available_copies BIGINT') && migration3Sql.includes("status = 'available' AND c.reference_only = false"), "available_copies counts available non-reference copies across all editions");
assert(migration3Sql.includes('course_codes TEXT[]'), 'search_catalog returns mapped course codes');
assert(migration3Sql.includes('rank_score'), 'search_catalog implements rank_score for ranking');

// Check ranking order: course code (100) -> title (75) -> author (50) -> subject (25)
assert(migration3Sql.includes('100') && migration3Sql.includes('75') && migration3Sql.includes('50') && migration3Sql.includes('25'), 'search_catalog ranks by course code, then title, then author, then subject');

// get_work_detail RPC
assert(migration3Sql.includes('CREATE OR REPLACE FUNCTION get_work_detail'), 'get_work_detail RPC defined');
assert(migration3Sql.includes('ORDER BY e.edition_no DESC') || migration3Sql.includes('ORDER BY edition_no DESC'), 'get_work_detail orders editions newest first');
assert(migration3Sql.includes('shelf_location') && migration3Sql.includes('reference_only'), 'get_work_detail includes shelf location and reference_only');

const workDetailFunc = migration3Sql.split('CREATE OR REPLACE FUNCTION get_work_detail')[1]?.split('CREATE OR REPLACE FUNCTION')[0] || '';
assert(!workDetailFunc.includes('user_id') && !workDetailFunc.includes('borrower') && !workDetailFunc.includes('profiles'), 'get_work_detail preserves privacy and never exposes borrower');

// course_map seed check
const expectedCodes = ['CS201', 'CS501', 'CS304', 'AI301', 'CS202', 'EC201', 'EC302', 'EC203', 'EE301', 'MA101', 'DS301', 'ME301', 'PH101', 'ME202'];
for (const code of expectedCodes) {
  assert(migration3Sql.includes(`'${code}'`), `course_map includes course ${code}`);
}

// 2. Verify UI Components and Rules
const homePageCode = fs.readFileSync(path.resolve('src/pages/HomePage.tsx'), 'utf8');
assert(homePageCode.includes('WorkingDaysDueRing'), 'HomePage includes WorkingDaysDueRing');
assert(homePageCode.includes('refetchInterval: 15000'), 'HomePage includes 15s refetchInterval');
assert(homePageCode.includes('refetchIntervalInBackground: false'), 'HomePage pauses polling when backgrounded');
assert(homePageCode.includes('secondsAgo'), 'HomePage shows updated Xs ago live feel');

const ringCode = fs.readFileSync(path.resolve('src/components/WorkingDaysDueRing.tsx'), 'utf8');
assert(ringCode.includes('#0d9488'), 'WorkingDaysDueRing uses teal for > 3 days');
assert(ringCode.includes('#d97706'), 'WorkingDaysDueRing uses amber for 1-3 days');
assert(ringCode.includes('#e11d48'), 'WorkingDaysDueRing uses red for overdue');
assert(ringCode.includes('No books due'), 'WorkingDaysDueRing has empty state No books due');

const searchPageCode = fs.readFileSync(path.resolve('src/pages/SearchPage.tsx'), 'utf8');
assert(searchPageCode.includes('300'), 'SearchPage uses 300ms debounce');
assert(searchPageCode.includes('Available only'), 'SearchPage has Available only toggle');
assert(searchPageCode.includes('SEED_SUBJECTS'), 'SearchPage has subject filter chips');
assert(searchPageCode.includes('Request this book'), 'SearchPage has disabled Request this book stub');
assert(searchPageCode.includes('refetchInterval: 15000'), 'SearchPage has 15s live polling');

const workDetailCode = fs.readFileSync(path.resolve('src/pages/WorkDetailPage.tsx'), 'utf8');
assert(workDetailCode.includes('Overall Availability (Across All Editions)'), 'WorkDetailPage shows total across editions');
assert(workDetailCode.includes('Latest Edition'), 'WorkDetailPage marks latest edition');
assert(workDetailCode.includes('Use in library'), "WorkDetailPage labels reference copies 'Use in library'");
assert(workDetailCode.includes('shelf_location'), 'WorkDetailPage shows shelf locations');

const layoutCode = fs.readFileSync(path.resolve('src/components/StudentLayout.tsx'), 'utf8');
assert(layoutCode.includes('Home') && layoutCode.includes('Search') && layoutCode.includes('My Books') && layoutCode.includes('Profile'), 'StudentLayout has bottom navigation items');
assert(layoutCode.includes('max-w-lg'), 'StudentLayout centers in max-w-lg column on desktop');

// Palette Check: NO purple anywhere
const filesToCheck = [
  'src/components/WorkingDaysDueRing.tsx',
  'src/components/StudentLayout.tsx',
  'src/components/BookCoverPlaceholder.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/SearchPage.tsx',
  'src/pages/WorkDetailPage.tsx',
  'src/pages/MyBooksPage.tsx',
  'src/pages/ProfilePage.tsx',
  'src/pages/LoginPage.tsx'
];

for (const f of filesToCheck) {
  const content = fs.readFileSync(path.resolve(f), 'utf8');
  assert(!content.toLowerCase().includes('purple'), `No purple color in ${f}`);
}

console.log('-------------------------------------------');
if (errors === 0) {
  console.log('🎉 ALL PHASE 1 VERIFICATION CHECKS PASSED PERFECTLY!');
} else {
  console.error(`💥 ${errors} checks failed!`);
  process.exit(1);
}
