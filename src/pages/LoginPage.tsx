import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isDemoMode, SEED_PROFILES, SEED_LIBRARY } from '@/lib/supabase';
import { Button } from '@/design/Button';
import { Input } from '@/design/Input';
import { StatusBadge } from '@/design/StatusBadge';
import {
  BookOpen,
  ArrowRight,
  RotateCcw,
  LogOut,
  Mail,
  UserCheck,
  Building2,
  KeyRound,
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, requestOtp, loginStudent, loginStaff, logout, switchDemoUser } = useAuth();

  // Student login states
  const [regNo, setRegNo] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedName, setMaskedName] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);

  // Staff login states
  const [staffEmail, setStaffEmail] = useState('');

  // UI status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');

  // Handle student register number lookup & OTP request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanReg = regNo.trim().toUpperCase();
    if (!cleanReg) {
      setErrorMessage('Please enter your student register number.');
      return;
    }

    setLoading(true);
    try {
      const response = await requestOtp(cleanReg);
      if (!response.success && response.error) {
        setErrorMessage(response.error);
        return;
      }

      setMaskedEmail(response.masked_email || 's***@student.ait.edu');
      setMaskedName(response.masked_name || 'Enrolled student');
      if (isDemoMode && response.demo_otp) {
        setDemoOtpCode(response.demo_otp);
      }
      setOtpStep(true);
      setSuccessNotice(response.message);
    } catch {
      setErrorMessage('Network error while requesting OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle student OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpValue.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginStudent(regNo.trim(), otpValue.trim());
      if (!response.success) {
        setErrorMessage(response.error || 'Invalid verification code.');
      }
    } catch {
      setErrorMessage('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle staff direct email login
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!staffEmail.trim()) {
      setErrorMessage('Please enter your institutional staff email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginStaff(staffEmail.trim());
      if (!response.success) {
        setErrorMessage(response.error || 'Authentication failed.');
      }
    } catch {
      setErrorMessage('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetStudentFlow = () => {
    setOtpStep(false);
    setOtpValue('');
    setDemoOtpCode(null);
    setErrorMessage(null);
    setSuccessNotice(null);
  };

  // ====================================================================
  // Render: Authenticated State
  // ====================================================================
  if (user) {
    const isStudent = user.role === 'student';
    return (
      <div className="min-h-screen bg-paper flex flex-col justify-center items-center p-4 sm:p-6 text-ink antialiased">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-[6px] bg-brand text-white mb-3">
              <BookOpen className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">
              {SEED_LIBRARY.name}
            </h1>
            <p className="text-xs text-grey mt-1">
              Smart library book availability portal
            </p>
          </div>

          <div className="rounded-[12px] bg-white border border-rule p-6 space-y-5">
            <div className="flex items-start justify-between pb-4 border-b border-rule">
              <div>
                <StatusBadge
                  status={isStudent ? 'available' : 'waiting'}
                  label={user.role.replace('_', ' ')}
                  size="sm"
                />
                <h2 className="font-serif text-xl font-bold text-ink mt-2">
                  Authentication verified
                </h2>
                <p className="text-xs text-grey mt-0.5">
                  Logged in as an authorized institutional member.
                </p>
              </div>

              {/* Avatar: Full radius permitted */}
              <div className="w-12 h-12 rounded-full border border-rule overflow-hidden bg-paper shrink-0 flex items-center justify-center text-brand font-serif font-bold text-base">
                {user.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-rule">
                <span className="text-grey">Full name</span>
                <span className="font-semibold text-ink">{user.name}</span>
              </div>

              {user.reg_no && (
                <div className="flex justify-between items-center py-1.5 border-b border-rule">
                  <span className="text-grey">Register number</span>
                  <span className="font-mono tabular-nums font-medium text-brand bg-paper px-2 py-0.5 rounded-[6px] border border-rule">
                    {user.reg_no}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-1.5 border-b border-rule">
                <span className="text-grey">Department</span>
                <span className="font-medium text-ink">{user.department || 'General'}</span>
              </div>

              {user.year && (
                <div className="flex justify-between items-center py-1.5 border-b border-rule">
                  <span className="text-grey">Academic year</span>
                  <span className="font-medium text-ink">Year {user.year}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-1.5 border-b border-rule">
                <span className="text-grey">Member category</span>
                <span className="capitalize font-medium text-ink">
                  {user.user_type.replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-grey">Library tenant</span>
                <span className="font-medium text-ink flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand" strokeWidth={1.75} />
                  {SEED_LIBRARY.code}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={logout}
                leftIcon={<LogOut className="w-4 h-4 text-grey" strokeWidth={1.75} />}
              >
                Sign out
              </Button>
            </div>
          </div>

          {/* Quick profile switch for review */}
          {isDemoMode && (
            <div className="mt-4 p-4 rounded-[6px] bg-white border border-accent/40 text-xs text-ink space-y-2">
              <span className="font-semibold text-accentink flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                Demo mode: switch active profile
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SEED_PROFILES.slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => switchDemoUser(p.id)}
                    className="px-2.5 py-1 rounded-[6px] bg-paper hover:bg-[#fffbeb] border border-rule text-ink font-medium transition-colors text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
                  >
                    {p.name.split(' ')[0]} ({p.reg_no || p.role})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ====================================================================
  // Render: Unauthenticated Login Screen
  // Centered narrow form on all sizes; from 1024px up add a plain left panel
  // with library name and one line on what the app does. No illustration.
  // ====================================================================
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col lg:flex-row antialiased">
      {/* --------------------------------------------------------------- */}
      {/* LEFT PANEL (Visible from 1024px up): Plain typographic overview   */}
      {/* --------------------------------------------------------------- */}
      <aside className="hidden lg:flex flex-col justify-between w-5/12 max-w-md bg-ink text-paper p-12 border-r border-rule select-none">
        <div className="space-y-6">
          <div className="w-10 h-10 rounded-[6px] bg-brand text-white flex items-center justify-center">
            <BookOpen className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="space-y-3">
            <span className="text-xs font-mono text-rule tracking-wider block">
              {SEED_LIBRARY.code}
            </span>
            <h1 className="font-serif text-3xl font-bold text-white tracking-tight leading-tight">
              {SEED_LIBRARY.name}
            </h1>
            <p className="text-sm text-rule/90 leading-relaxed font-sans">
              Check real-time book availability, reserve copies, and track return dates.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-8 border-t border-rule/20 text-xs text-rule/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand" />
            <span>Circulation system active</span>
          </div>
          <p className="text-[11px] leading-relaxed text-rule/60">
            Working days: Monday to Saturday. Sundays and declared holidays are excluded from loan periods.
          </p>
        </div>
      </aside>

      {/* --------------------------------------------------------------- */}
      {/* RIGHT PANEL / MAIN COLUMN: Centred narrow form on all sizes       */}
      {/* --------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Mobile/Tablet top title (< 1024px) */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-[6px] bg-brand text-white mb-2.5">
              <BookOpen className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">
              {SEED_LIBRARY.name}
            </h1>
            <p className="text-xs text-grey mt-0.5">
              Check real-time book availability, reserve copies, and track return dates.
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-[12px] bg-white border border-rule p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-ink">
                Member sign in
              </h2>
              <p className="text-xs text-grey">
                Access your account, borrow physical copies, and view active loans.
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-[6px] bg-paper border border-rule gap-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('student');
                  handleResetStudentFlow();
                }}
                className={`py-2 px-3 rounded-[6px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand ${
                  activeTab === 'student'
                    ? 'bg-white text-brand font-semibold shadow-sm border border-rule'
                    : 'text-grey hover:text-ink'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('staff');
                  handleResetStudentFlow();
                }}
                className={`py-2 px-3 rounded-[6px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand ${
                  activeTab === 'staff'
                    ? 'bg-white text-brand font-semibold shadow-sm border border-rule'
                    : 'text-grey hover:text-ink'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>Library staff</span>
              </button>
            </div>

            {/* --------------------------------------------------------- */}
            {/* TAB 1: STUDENT LOGIN                                      */}
            {/* --------------------------------------------------------- */}
            {activeTab === 'student' && (
              <div>
                {!otpStep ? (
                  /* Step 1: Register Number Lookup */
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <Input
                      label="Student register number"
                      type="text"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="e.g. AIT2023CS001"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                      className="font-mono uppercase tracking-wider"
                      disabled={loading}
                      autoFocus
                      helperText="Your university enrollment number issued at admission."
                      leftIcon={<KeyRound className="w-4 h-4" strokeWidth={1.75} />}
                    />

                    {errorMessage && (
                      <div
                        role="alert"
                        className="p-3 rounded-[6px] bg-[#fef2f2] border border-alert/30 text-alert text-xs flex items-start gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full h-10"
                      disabled={loading || !regNo.trim()}
                      loading={loading}
                      rightIcon={!loading ? <ArrowRight className="w-4 h-4" strokeWidth={1.75} /> : undefined}
                    >
                      Request email verification code
                    </Button>
                  </form>
                ) : (
                  /* Step 2: 6-Digit OTP Verification */
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {/* Dispatched Notice */}
                    <div className="rounded-[6px] bg-[#f0fdfa] border border-brand/30 p-3 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-brand">
                        <Mail className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                        <span>{successNotice || 'Verification code sent to registered address:'}</span>
                      </div>
                      <div className="pl-5 space-y-0.5">
                        <span className="font-mono font-medium text-ink block">{maskedEmail}</span>
                        <span className="text-[11px] text-grey block">Student: {maskedName}</span>
                      </div>
                    </div>

                    {/* Demo Mode helper code display */}
                    {isDemoMode && demoOtpCode && (
                      <div className="p-3 rounded-[6px] bg-[#fffbeb] border border-accent/40 text-xs text-accentink space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                          <span>Demo mode active</span>
                        </div>
                        <p className="text-[11px] leading-normal">
                          Generated code:{' '}
                          <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-accent/40 text-ink">
                            {demoOtpCode}
                          </span>
                        </p>
                      </div>
                    )}

                    <Input
                      label="Enter 6-digit verification code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="••••••"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                      className="text-center font-mono tabular-nums text-lg tracking-[0.3em]"
                      disabled={loading}
                      autoFocus
                    />

                    {errorMessage && (
                      <div
                        role="alert"
                        className="p-3 rounded-[6px] bg-[#fef2f2] border border-alert/30 text-alert text-xs flex items-start gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full h-10"
                      disabled={loading || otpValue.length < 6}
                      loading={loading}
                      leftIcon={!loading ? <UserCheck className="w-4 h-4" strokeWidth={1.75} /> : undefined}
                    >
                      Verify and enter portal
                    </Button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={handleResetStudentFlow}
                        className="text-grey hover:text-ink inline-flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:underline"
                      >
                        <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
                        <span>Change register number</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        className="text-brand hover:underline font-medium cursor-pointer focus-visible:outline-none"
                      >
                        Resend code
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* TAB 2: STAFF LOGIN                                        */}
            {/* --------------------------------------------------------- */}
            {activeTab === 'staff' && (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <Input
                  label="Staff institutional email"
                  type="email"
                  placeholder="e.g. rahul.verma@library.ait.edu"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  disabled={loading}
                  autoFocus
                  helperText="Restricted to librarians, catalogers, and system administrators."
                  leftIcon={<Mail className="w-4 h-4" strokeWidth={1.75} />}
                />

                {errorMessage && (
                  <div
                    role="alert"
                    className="p-3 rounded-[6px] bg-[#fef2f2] border border-alert/30 text-alert text-xs flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-10"
                  disabled={loading || !staffEmail.trim()}
                  loading={loading}
                >
                  Sign in to staff desk
                </Button>
              </form>
            )}

            {/* Card Footer Info */}
            <div className="pt-3 border-t border-rule flex items-center justify-between text-[11px] text-grey">
              <span>Working days: Monday – Saturday</span>
              <span>Fines calculated on return</span>
            </div>
          </div>

          {/* Demo mode quick picker */}
          {isDemoMode && (
            <div className="mt-4 p-4 rounded-[6px] bg-white border border-accent/40 text-xs text-ink space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-accentink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                  Demo quick picker
                </span>
                <span className="text-[10px] font-mono text-grey px-1.5 py-0.5 rounded bg-paper border border-rule">
                  Seed data
                </span>
              </div>
              <p className="text-[11px] text-grey leading-normal">
                Click any profile to test register number lookup or staff login:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('student');
                    setRegNo('AIT2023CS001');
                    setOtpStep(false);
                  }}
                  className="text-left p-2.5 rounded-[6px] bg-paper hover:bg-[#fffbeb] border border-rule transition-colors cursor-pointer"
                >
                  <div className="font-medium text-ink">Aarav Sharma</div>
                  <div className="text-[11px] font-mono text-brand">AIT2023CS001</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('student');
                    setRegNo('AIT2023EC001');
                    setOtpStep(false);
                  }}
                  className="text-left p-2.5 rounded-[6px] bg-paper hover:bg-[#fffbeb] border border-rule transition-colors cursor-pointer"
                >
                  <div className="font-medium text-ink">Rohan Iyer</div>
                  <div className="text-[11px] font-mono text-brand">AIT2023EC001</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('staff');
                    setStaffEmail('priya.sharma@library.ait.edu');
                  }}
                  className="text-left p-2.5 rounded-[6px] bg-paper hover:bg-[#fffbeb] border border-rule transition-colors cursor-pointer"
                >
                  <div className="font-medium text-ink">Dr. Priya Sharma</div>
                  <div className="text-[11px] text-grey">Head librarian</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('staff');
                    setStaffEmail('rahul.verma@library.ait.edu');
                  }}
                  className="text-left p-2.5 rounded-[6px] bg-paper hover:bg-[#fffbeb] border border-rule transition-colors cursor-pointer"
                >
                  <div className="font-medium text-ink">Rahul Verma</div>
                  <div className="text-[11px] text-grey">Circulation librarian</div>
                </button>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <footer className="text-center text-xs text-grey mt-6 pb-4">
            <p>© 2026 {SEED_LIBRARY.name}</p>
            <p className="text-[11px] text-grey/80 mt-0.5">
              Book availability and circulation management platform
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};
