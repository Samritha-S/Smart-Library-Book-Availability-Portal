import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { isDemoMode, SEED_PROFILES, SEED_LIBRARY } from '@/lib/supabase';
import {
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  RotateCcw,
  LogOut,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  KeyRound
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
  const [activeTab, setActiveTab] = useState('student');

  // Handle student register number lookup & OTP request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanReg = regNo.trim().toUpperCase();
    if (!cleanReg) {
      setErrorMessage('Please enter your Student Register Number.');
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
      setMaskedName(response.masked_name || 'Enrolled Student');
      if (isDemoMode && response.demo_otp) {
        setDemoOtpCode(response.demo_otp);
      }
      setOtpStep(true);
      setSuccessNotice(response.message);
    } catch {
      setErrorMessage('Network or server error while requesting OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle student OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpValue.trim()) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginStudent(regNo.trim(), otpValue.trim());
      if (!response.success) {
        setErrorMessage(response.error || 'Invalid OTP code.');
      }
    } catch {
      setErrorMessage('Failed to verify OTP. Please try again.');
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
  // Render: Authenticated State (Phase 0 Completion Screen)
  // ====================================================================
  if (user) {
    const isStudent = user.role === 'student';
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50/70 via-slate-50 to-amber-50/30 flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-xl">
          {/* Header Bar */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-700/20 mb-3">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Smart Library Availability Portal
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {SEED_LIBRARY.name}
            </p>
          </div>

          <Card className="border-teal-200/80 shadow-md shadow-teal-900/5 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-teal-600 via-teal-500 to-amber-500" />
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant={isStudent ? 'default' : 'secondary'} className="mb-2 uppercase tracking-wider text-[11px]">
                    {user.role.replace('_', ' ')}
                  </Badge>
                  <CardTitle className="text-xl">Authentication Verified</CardTitle>
                  <CardDescription>
                    Logged in as an authorized institutional member.
                  </CardDescription>
                </div>
                <div className="w-12 h-12 rounded-full ring-2 ring-teal-500/30 overflow-hidden bg-slate-100 shrink-0">
                  {user.photo_url ? (
                    <img
                      src={user.photo_url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-teal-700 font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-2.5 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-semibold text-slate-900">{user.name}</span>
                </div>

                {user.reg_no && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Register Number</span>
                    <span className="font-mono font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {user.reg_no}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Department</span>
                  <span className="font-medium text-slate-800">{user.department || 'General'}</span>
                </div>

                {user.year && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Academic Year</span>
                    <span className="font-medium text-slate-800">Year {user.year}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Member Category</span>
                  <span className="capitalize font-medium text-slate-800">{user.user_type.replace('_', ' ')}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Library Tenant</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    {SEED_LIBRARY.code}
                  </span>
                </div>
              </div>

              <Alert variant="teal" className="border-teal-300">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <AlertTitle className="text-teal-900">Phase 0 Complete</AlertTitle>
                <AlertDescription className="text-teal-800 text-xs">
                  Your registration-number lookup and OTP session authentication are fully operational.
                  Screen flows for book search, copy availability tracking, holds, and circulation will be rendered in Phase 1.
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                className="w-full text-slate-700 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>

          {/* Quick profile switch for review */}
          {isDemoMode && (
            <div className="mt-6 p-4 rounded-xl bg-white/80 backdrop-blur border border-amber-200 text-xs text-slate-600 shadow-sm">
              <p className="font-semibold text-amber-900 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Demo Mode: Switch Active Profile
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SEED_PROFILES.slice(0, 5).map(p => (
                  <button
                    key={p.id}
                    onClick={() => switchDemoUser(p.id)}
                    className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-medium transition"
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
  // Render: Login Screen (Phase 0)
  // ====================================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 via-slate-50 to-amber-50/40 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Banner */}
      <header className="max-w-md mx-auto w-full pt-4 sm:pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-700/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base block leading-tight">
                Smart Library
              </span>
              <span className="text-xs text-teal-700 font-medium">Book Availability Portal</span>
            </div>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono border-teal-200 text-teal-800 bg-teal-50">
            {SEED_LIBRARY.code}
          </Badge>
        </div>
      </header>

      {/* Main Login Card (Mobile-First) */}
      <main className="max-w-md mx-auto w-full my-6">
        <Card className="border-slate-200 shadow-lg shadow-teal-950/5 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-teal-600 via-teal-500 to-amber-500" />

          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-xl sm:text-2xl text-slate-900 font-bold tracking-tight">
              Member Sign In
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500">
              Access real-time book availability, reservations, and your borrowing history.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Role Tabs */}
            <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); handleResetStudentFlow(); }}>
              <TabsList>
                <TabsTrigger value="student" className="gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>Student</span>
                </TabsTrigger>
                <TabsTrigger value="staff" className="gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Library Staff</span>
                </TabsTrigger>
              </TabsList>

              {/* ------------------------------------------------------------- */}
              {/* TAB 1: STUDENT MOBILE-FIRST LOGIN FLOW                        */}
              {/* ------------------------------------------------------------- */}
              <TabsContent value="student">
                {!otpStep ? (
                  /* Step 1: Enter Student Register Number */
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="regNo" className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                        Student Register Number
                      </label>
                      <div className="relative">
                        <Input
                          id="regNo"
                          type="text"
                          autoCapitalize="characters"
                          autoCorrect="off"
                          spellCheck={false}
                          placeholder="e.g. AIT2023CS001"
                          value={regNo}
                          onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                          className="font-mono text-base uppercase tracking-wider pr-10"
                          disabled={loading}
                          autoFocus
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <KeyRound className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Your university enrollment / roll number assigned during admission.
                      </p>
                    </div>

                    {errorMessage && (
                      <Alert variant="destructive" className="py-2.5">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold"
                      disabled={loading || !regNo.trim()}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying Register No...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Request Email OTP
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                ) : (
                  /* Step 2: Enter 6-digit OTP dispatched to Student Email */
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {/* Notice showing masked email and masked student name (No email leak!) */}
                    <div className="rounded-lg bg-teal-50 border border-teal-200 p-3.5 space-y-2">
                      <div className="flex items-center gap-2 text-teal-900 font-semibold text-xs">
                        <Mail className="w-4 h-4 text-teal-700 shrink-0" />
                        <span>{successNotice || 'OTP dispatched to registered student address:'}</span>
                      </div>
                      <div className="flex flex-col pl-6 space-y-0.5 text-xs text-teal-900">
                        <span className="font-mono font-medium text-teal-800">{maskedEmail}</span>
                        <span className="text-[11px] text-teal-700">Student: {maskedName}</span>
                      </div>
                    </div>

                    {/* DEMO MODE OTP CALLOUT: Only shown when VITE_DEMO_MODE=true */}
                    {isDemoMode && demoOtpCode && (
                      <Alert variant="amber" className="border-amber-300">
                        <Sparkles className="w-4 h-4 text-amber-700" />
                        <AlertTitle className="text-xs font-semibold text-amber-900">
                          Demo Mode Active
                        </AlertTitle>
                        <AlertDescription className="text-xs text-amber-900">
                          Generated OTP: <strong className="font-mono text-sm bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">{demoOtpCode}</strong>
                          <span className="block mt-1 text-[11px] text-amber-800 font-normal">
                            (This preview helper is completely hidden in production builds).
                          </span>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <label htmlFor="otp" className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                        Enter 6-Digit Verification Code
                      </label>
                      <Input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="••••••"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                        className="text-center font-mono text-xl tracking-[0.4em] h-12"
                        disabled={loading}
                        autoFocus
                      />
                    </div>

                    {errorMessage && (
                      <Alert variant="destructive" className="py-2.5">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold"
                      disabled={loading || otpValue.length < 6}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Authenticating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          Verify & Enter Portal
                        </span>
                      )}
                    </Button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={handleResetStudentFlow}
                        className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Change Register No
                      </button>
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        className="text-teal-700 hover:text-teal-900 font-medium"
                      >
                        Resend Code
                      </button>
                    </div>
                  </form>
                )}
              </TabsContent>

              {/* ------------------------------------------------------------- */}
              {/* TAB 2: LIBRARY STAFF LOGIN FLOW                               */}
              {/* ------------------------------------------------------------- */}
              <TabsContent value="staff">
                <form onSubmit={handleStaffLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="staffEmail" className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                      Staff Institutional Email
                    </label>
                    <div className="relative">
                      <Input
                        id="staffEmail"
                        type="email"
                        placeholder="e.g. rahul.verma@library.ait.edu"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        disabled={loading}
                        autoFocus
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Restricted to authorized Librarians, Head Librarian, and Super Admins.
                    </p>
                  </div>

                  {errorMessage && (
                    <Alert variant="destructive" className="py-2.5">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                    disabled={loading || !staffEmail.trim()}
                  >
                    {loading ? 'Authenticating Staff...' : 'Sign In to Staff Desk'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-6 py-3">
            <span>Working days: Mon-Sat</span>
            <span>Fines calculated on read</span>
          </CardFooter>
        </Card>

        {/* DEMO HELPER DRAWER: Only visible when VITE_DEMO_MODE=true */}
        {isDemoMode && (
          <div className="mt-4 p-4 rounded-xl bg-white border border-amber-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Quick Test Picker (Demo Mode Active)
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 border-amber-300">
                Seed Data
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Click any profile to test student register-lookup or staff login immediately:
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {/* Sample Students */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('student');
                  setRegNo('AIT2023CS001');
                  setOtpStep(false);
                }}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition"
              >
                <div className="font-semibold text-slate-900">Aarav Sharma</div>
                <div className="text-[11px] font-mono text-teal-700">AIT2023CS001 (CS 3rd)</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('student');
                  setRegNo('AIT2023EC001');
                  setOtpStep(false);
                }}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition"
              >
                <div className="font-semibold text-slate-900">Rohan Iyer</div>
                <div className="text-[11px] font-mono text-teal-700">AIT2023EC001 (EC 2nd)</div>
              </button>

              {/* Sample Staff */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('staff');
                  setStaffEmail('priya.sharma@library.ait.edu');
                }}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition"
              >
                <div className="font-semibold text-slate-900">Dr. Priya Sharma</div>
                <div className="text-[11px] text-amber-800">Head Librarian</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('staff');
                  setStaffEmail('rahul.verma@library.ait.edu');
                }}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition"
              >
                <div className="font-semibold text-slate-900">Rahul Verma</div>
                <div className="text-[11px] text-amber-800">Circulation Librarian</div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto w-full text-center text-xs text-slate-500 pb-2">
        <p>© 2026 {SEED_LIBRARY.name}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Multi-tenant Book Availability Platform • Phase 0
        </p>
      </footer>
    </div>
  );
};
