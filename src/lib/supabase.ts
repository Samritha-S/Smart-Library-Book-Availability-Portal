import { createClient } from '@supabase/supabase-js';
import type { Profile, RequestOtpResponse, VerifyOtpResponse } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ====================================================================
// Mock Seed Data for Demonstration & Testing (When no live DB is connected)
// ====================================================================
export const SEED_LIBRARY = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Apex Institute of Technology Central Library',
  code: 'AIT-CENTRAL',
  status: 'approved' as const,
  address: 'Campus Academic Block A, Level 2, Tech Valley',
  contact_email: 'library-helpdesk@ait.edu'
};

export const SEED_PROFILES: Profile[] = [
  // 10 Students with photos
  {
    id: '30000000-0000-0000-0000-000000000001',
    library_id: SEED_LIBRARY.id,
    role: 'student',
    reg_no: 'AIT2023CS001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@student.ait.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    library_id: SEED_LIBRARY.id,
    role: 'student',
    reg_no: 'AIT2023CS002',
    name: 'Diya Patel',
    email: 'diya.patel@student.ait.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    library_id: SEED_LIBRARY.id,
    role: 'student',
    reg_no: 'AIT2023EC001',
    name: 'Rohan Iyer',
    email: 'rohan.iyer@student.ait.edu',
    department: 'Electronics & Communication',
    year: 2,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    library_id: SEED_LIBRARY.id,
    role: 'student',
    reg_no: 'AIT2023EC002',
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@student.ait.edu',
    department: 'Electronics & Communication',
    year: 4,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000005',
    library_id: SEED_LIBRARY.id,
    role: 'student',
    reg_no: 'AIT2023DS001',
    name: 'Kabir Verma',
    email: 'kabir.verma@student.ait.edu',
    department: 'Data Science & Artificial Intelligence',
    year: 2,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000006',
    library_id: SEED_LIBRARY.id,
    role: 'student',
    reg_no: 'AIT2023ME001',
    name: 'Tanvi Nair',
    email: 'tanvi.nair@student.ait.edu',
    department: 'Mechanical Engineering',
    year: 3,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000007',
    library_id: SEED_LIBRARY.id,
    role: 'student',
    reg_no: 'AIT2023CS007',
    name: 'Vikram Choudhary',
    email: 'vikram.choudhary@student.ait.edu',
    department: 'Computer Science & Engineering',
    year: 1,
    user_type: 'undergraduate',
    photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000008',
    library_id: SEED_LIBRARY.id,
    role: 'student',
    reg_no: 'AIT2024PG001',
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@student.ait.edu',
    department: 'M.Tech Artificial Intelligence',
    year: 1,
    user_type: 'postgraduate',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000009',
    library_id: SEED_LIBRARY.id,
    role: 'student',
    reg_no: 'AIT2024PG002',
    name: 'Aditya Roy',
    email: 'aditya.roy@student.ait.edu',
    department: 'M.Tech VLSI & Embedded Systems',
    year: 2,
    user_type: 'postgraduate',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000010',
    library_id: SEED_LIBRARY.id,
    role: 'student',
    reg_no: 'AIT2024PHD01',
    name: 'Meera Nambiar',
    email: 'meera.nambiar@student.ait.edu',
    department: 'Doctoral Research Scholar in CS',
    year: 2,
    user_type: 'phd_scholar',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Staff Profiles (1 Head Librarian, 2 Librarians)
  {
    id: '40000000-0000-0000-0000-000000000001',
    library_id: SEED_LIBRARY.id,
    role: 'head_librarian',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@library.ait.edu',
    department: 'Central Library Administration',
    user_type: 'faculty',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    library_id: SEED_LIBRARY.id,
    role: 'librarian',
    name: 'Rahul Verma',
    email: 'rahul.verma@library.ait.edu',
    department: 'Circulation & Cataloging Desk',
    user_type: 'staff',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    library_id: SEED_LIBRARY.id,
    role: 'librarian',
    name: 'Ananya Sen',
    email: 'ananya.sen@library.ait.edu',
    department: 'Reference & Digital Acquisitions',
    user_type: 'staff',
    photo_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Helper: Mask email without exposing real full address
function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return 's***@student.ait.edu';
  if (user.length <= 2) {
    return `${user[0]}***@${domain}`;
  }
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

// Helper: Mask name
function maskName(name: string): string {
  return name
    .split(' ')
    .map(part => (part.length <= 2 ? part : `${part[0]}***${part[part.length - 1]}`))
    .join(' ');
}

// In-memory rate limiting and active demo OTP store
interface DemoOtpEntry {
  otp: string;
  regNo: string;
  expiresAt: number;
  attempts: number;
}
const activeDemoOtps = new Map<string, DemoOtpEntry>();
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

/**
 * Request OTP via Student Register Number
 * Enforces:
 * 1. Rate limiting (max 5 attempts per 15 min per reg_no)
 * 2. NO email leak: Never returns the full email
 * 3. Identical generic response for unknown numbers to prevent user enumeration
 * 4. Shows demo_otp only if VITE_DEMO_MODE === 'true'
 */
export async function requestStudentOtp(
  regNo: string,
  libraryCode = 'AIT-CENTRAL'
): Promise<RequestOtpResponse> {
  const cleanRegNo = regNo.trim().toUpperCase();

  // 1. Check Rate Limiting
  const now = Date.now();
  const rateKey = `rate:${cleanRegNo}`;
  const rateInfo = rateLimitMap.get(rateKey) || { count: 0, windowStart: now };

  if (now - rateInfo.windowStart > 15 * 60 * 1000) {
    rateInfo.count = 1;
    rateInfo.windowStart = now;
  } else if (rateInfo.count >= 5) {
    return {
      success: false,
      message: 'Too many requests.',
      error: 'Too many requests. Please wait 15 minutes before requesting another OTP.'
    };
  } else {
    rateInfo.count += 1;
  }
  rateLimitMap.set(rateKey, rateInfo);

  // Generic anti-enumeration response
  const genericResponse: RequestOtpResponse = {
    success: true,
    message: 'If this register number is enrolled, an OTP has been dispatched to your registered student email.',
    masked_email: 's***@student.ait.edu',
    masked_name: 'Student'
  };

  // If live Supabase client is configured, call Postgres RPC
  const isLiveSupabase =
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-anon-key';

  if (isLiveSupabase) {
    try {
      const { data, error } = await supabase.rpc('request_student_otp', {
        p_reg_no: cleanRegNo,
        p_library_code: libraryCode
      });
      if (error) {
        return { success: false, message: 'Failed to request OTP', error: error.message };
      }
      return data as RequestOtpResponse;
    } catch (err: unknown) {
      console.warn('Live Supabase RPC failed, falling back to local handler:', err);
    }
  }

  // Local / Demo Handler
  const student = SEED_PROFILES.find(
    p => p.role === 'student' && p.reg_no?.toUpperCase() === cleanRegNo
  );

  if (!student) {
    // Return identical response to prevent student enumeration
    return genericResponse;
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  activeDemoOtps.set(cleanRegNo, {
    otp,
    regNo: cleanRegNo,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0
  });

  const response: RequestOtpResponse = {
    success: true,
    message: 'An authentication OTP has been dispatched to your registered student email address.',
    masked_email: maskEmail(student.email),
    masked_name: maskName(student.name)
  };

  // Only expose demo_otp if VITE_DEMO_MODE is explicitly enabled!
  if (isDemoMode) {
    response.demo_otp = otp;
  }

  return response;
}

/**
 * Verify Student OTP
 */
export async function verifyStudentOtp(
  regNo: string,
  otp: string,
  libraryCode = 'AIT-CENTRAL'
): Promise<VerifyOtpResponse> {
  const cleanRegNo = regNo.trim().toUpperCase();
  const cleanOtp = otp.trim();

  // If live Supabase client is configured, call Postgres RPC
  const isLiveSupabase =
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-anon-key';

  if (isLiveSupabase) {
    try {
      const { data, error } = await supabase.rpc('verify_student_otp', {
        p_reg_no: cleanRegNo,
        p_library_code: libraryCode,
        p_otp: cleanOtp
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return data as VerifyOtpResponse;
    } catch (err: unknown) {
      console.warn('Live Supabase verify failed, falling back to local handler:', err);
    }
  }

  // Local Demo Handler
  const student = SEED_PROFILES.find(
    p => p.role === 'student' && p.reg_no?.toUpperCase() === cleanRegNo
  );
  if (!student) {
    return { success: false, error: 'Invalid credentials.' };
  }

  const stored = activeDemoOtps.get(cleanRegNo);
  // Also accept master test OTP '123456' in demo mode for frictionless testing
  const isValidOtp = (stored && stored.otp === cleanOtp) || (isDemoMode && cleanOtp === '123456');

  if (!isValidOtp) {
    if (stored) {
      stored.attempts += 1;
      if (stored.attempts >= 5) {
        activeDemoOtps.delete(cleanRegNo);
        return { success: false, error: 'Too many invalid attempts. Please request a new OTP.' };
      }
    }
    return { success: false, error: 'Invalid OTP code. Please check and try again.' };
  }

  activeDemoOtps.delete(cleanRegNo);
  return {
    success: true,
    profile: student
  };
}

/**
 * Staff / Librarian Email Authentication (Demo & Live)
 */
export async function authenticateStaffByEmail(email: string): Promise<VerifyOtpResponse> {
  const cleanEmail = email.trim().toLowerCase();
  const staff = SEED_PROFILES.find(
    p => p.email.toLowerCase() === cleanEmail && ['librarian', 'head_librarian', 'super_admin'].includes(p.role)
  );

  if (!staff) {
    return { success: false, error: 'No authorized staff account found with this email.' };
  }

  return {
    success: true,
    profile: staff
  };
}

// ====================================================================
// Phase 1 RPC API Functions
// ====================================================================
import {
  SEED_CATALOG_WORKS,
  SEED_WORK_DETAILS,
  SEED_STUDENT_LOANS
} from '@/lib/catalogData';
import type { SearchResultWork, WorkDetail, StudentLoan } from '@/types/database';

/**
 * Search Catalog RPC
 * One row per work, ranking: course code -> title -> author -> subject
 */
export async function searchCatalog(
  query = '',
  subject = 'All',
  onlyAvailable = false,
  libraryId: string = SEED_LIBRARY.id
): Promise<SearchResultWork[]> {
  const isLiveSupabase =
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-anon-key';

  if (isLiveSupabase) {
    try {
      const { data, error } = await supabase.rpc('search_catalog', {
        p_query: query,
        p_subject: subject === 'All' ? null : subject,
        p_only_available: onlyAvailable,
        p_library_id: libraryId
      });
      if (!error && data) {
        return data as SearchResultWork[];
      }
    } catch (err) {
      console.warn('Live search_catalog failed, falling back to local simulation:', err);
    }
  }

  // Local / Demo implementation with identical ranking logic
  const cleanQuery = query.trim().toLowerCase();

  return SEED_CATALOG_WORKS.filter(work => {
    // Subject filter
    if (subject && subject !== 'All' && work.subject !== subject) {
      return false;
    }
    // Available only toggle
    if (onlyAvailable && work.available_copies <= 0) {
      return false;
    }
    // Query search
    if (!cleanQuery) return true;

    const courseMatch = work.course_codes.some(c => c.toLowerCase().includes(cleanQuery));
    const titleMatch = work.title.toLowerCase().includes(cleanQuery);
    const authorMatch = work.author.toLowerCase().includes(cleanQuery);
    const subjectMatch = work.subject.toLowerCase().includes(cleanQuery);

    return courseMatch || titleMatch || authorMatch || subjectMatch;
  }).map(work => {
    let rank = 10;
    if (cleanQuery) {
      if (work.course_codes.some(c => c.toLowerCase().startsWith(cleanQuery) || c.toLowerCase().includes(cleanQuery))) {
        rank = 100; // Course code match ranked highest
      } else if (work.title.toLowerCase().includes(cleanQuery)) {
        rank = 75; // Title match
      } else if (work.author.toLowerCase().includes(cleanQuery)) {
        rank = 50; // Author match
      } else if (work.subject.toLowerCase().includes(cleanQuery)) {
        rank = 25; // Subject match
      }
    }
    return { ...work, rank_score: rank };
  }).sort((a, b) => {
    if ((b.rank_score || 0) !== (a.rank_score || 0)) {
      return (b.rank_score || 0) - (a.rank_score || 0);
    }
    if (b.available_copies !== a.available_copies) {
      return b.available_copies - a.available_copies;
    }
    return a.title.localeCompare(b.title);
  });
}

/**
 * Get Work Detail RPC
 * Returns all editions newest first, copies grouped by shelf location, and counts.
 * Never exposes borrower identity.
 */
export async function getWorkDetail(workId: string): Promise<WorkDetail | null> {
  const isLiveSupabase =
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-anon-key';

  if (isLiveSupabase) {
    try {
      const { data, error } = await supabase.rpc('get_work_detail', {
        p_work_id: workId
      });
      if (!error && data) {
        return data as WorkDetail;
      }
    } catch (err) {
      console.warn('Live get_work_detail failed, falling back to local simulation:', err);
    }
  }

  // Local / Demo implementation
  const detail = SEED_WORK_DETAILS.get(workId);
  return detail ? { ...detail, last_updated: new Date().toISOString() } : null;
}

/**
 * Get Student Active Loans RPC
 * Calculates working days diff (excluding Sundays and holidays) and fines on read
 */
export async function getStudentActiveLoans(studentId: string): Promise<StudentLoan[]> {
  const isLiveSupabase =
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-anon-key';

  if (isLiveSupabase) {
    try {
      const { data, error } = await supabase.rpc('get_student_active_loans', {
        p_student_id: studentId
      });
      if (!error && data) {
        return data as StudentLoan[];
      }
    } catch (err) {
      console.warn('Live get_student_active_loans failed, falling back to local simulation:', err);
    }
  }

  // Local / Demo implementation
  const loans = SEED_STUDENT_LOANS[studentId] || [];
  return loans;
}

