import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/design/Button';
import { StatusBadge } from '@/design/StatusBadge';
import { SEED_LIBRARY, isDemoMode, SEED_PROFILES } from '@/lib/supabase';
import { ShowQr } from '@/features/qr/ShowQr';
import {
  LogOut,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const [showQr, setShowQr] = useState(false);

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Editorial Header */}
      <div className="pb-2 border-b border-rule">
        <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">
          Member Profile
        </h1>
        <p className="text-xs text-grey font-sans mt-0.5">
          Institutional identity, membership credentials, and library borrowing rules.
        </p>
      </div>

      {/* Main Profile Card (12px radius, hairline border) */}
      <div className="rounded-[12px] bg-white border border-rule p-6 space-y-6 shadow-sm">
        {/* Top Identity Block */}
        <div className="flex items-start justify-between pb-4 border-b border-rule">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-rule overflow-hidden bg-paper shrink-0 flex items-center justify-center font-serif font-bold text-xl text-brand shadow-sm">
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

            <div className="min-w-0">
              <StatusBadge
                status="available"
                label={user.role.replace('_', ' ')}
                size="sm"
              />
              <h2 className="font-serif text-xl font-bold text-ink mt-1.5 leading-tight truncate">
                {user.name}
              </h2>
              <p className="text-xs font-mono tabular-nums text-brand mt-0.5">
                {user.reg_no || user.email}
              </p>
            </div>
          </div>

          {/* Quick Action: Open QR pass */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowQr(true)}
            className="text-xs h-8 hidden sm:inline-flex"
            leftIcon={<QrCode className="w-3.5 h-3.5" strokeWidth={1.75} />}
          >
            Digital pass
          </Button>
        </div>

        {/* Member Attribute Rows (Sentence-case, tabular numbers) */}
        <div className="rounded-[6px] bg-paper border border-rule p-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-rule">
            <span className="text-grey flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-grey" strokeWidth={1.75} />
              Department
            </span>
            <span className="font-semibold text-ink">{user.department || 'General'}</span>
          </div>

          {user.year && (
            <div className="flex justify-between items-center py-1.5 border-b border-rule">
              <span className="text-grey flex items-center gap-2">
                <Calendar className="w-4 h-4 text-grey" strokeWidth={1.75} />
                Academic year
              </span>
              <span className="font-medium text-ink tabular-nums">Year {user.year}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-1.5 border-b border-rule">
            <span className="text-grey flex items-center gap-2">
              <Layers className="w-4 h-4 text-grey" strokeWidth={1.75} />
              Member category
            </span>
            <span className="capitalize font-semibold text-brand">
              {user.user_type.replace('_', ' ')}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span className="text-grey flex items-center gap-2">
              <Building2 className="w-4 h-4 text-grey" strokeWidth={1.75} />
              Library tenant
            </span>
            <span className="font-medium text-ink">{SEED_LIBRARY.name}</span>
          </div>
        </div>

        {/* Institutional Policy Notice */}
        <div className="p-3.5 rounded-[6px] bg-[#f0fdfa] border border-brand/20 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 font-medium text-brand">
            <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Circulation rules & borrowing entitlement</span>
          </div>
          <ul className="text-[11px] text-ink/80 space-y-1 pl-6 list-disc">
            <li>Loan period: 14 working days (Sundays and institutional holidays excluded).</li>
            <li>Maximum active quota: 3 physical copies simultaneously.</li>
            <li>Overdue fine: ₹10 per working day, calculated upon front-desk return.</li>
          </ul>
        </div>

        {/* Mobile-only QR pass button */}
        <div className="sm:hidden pt-1">
          <Button
            variant="secondary"
            className="w-full text-xs h-9"
            onClick={() => setShowQr(true)}
            leftIcon={<QrCode className="w-4 h-4" strokeWidth={1.75} />}
          >
            Show contactless QR pass
          </Button>
        </div>

        {/* Sign Out Button */}
        <div className="pt-2 border-t border-rule">
          <Button
            variant="danger"
            className="w-full h-10 text-xs"
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4" strokeWidth={1.75} />}
          >
            Sign out of library portal
          </Button>
        </div>
      </div>

      {/* Demo Profile Switcher in Demo Mode */}
      {isDemoMode && (
        <div className="p-4 rounded-[12px] bg-white border border-accent/40 text-xs text-ink space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-accentink flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
              Demo mode: switch active student
            </span>
            <span className="text-[10px] font-mono text-grey px-1.5 py-0.5 rounded bg-paper border border-rule">
              Test accounts
            </span>
          </div>
          <p className="text-[11px] text-grey leading-normal">
            Select a student to test active borrowings, holds, and overdue states:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {SEED_PROFILES.filter((p) => p.role === 'student')
              .slice(0, 6)
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => switchDemoUser(p.id)}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors cursor-pointer border ${
                    p.id === user.id
                      ? 'bg-brand text-white border-brand font-semibold shadow-sm'
                      : 'bg-paper hover:bg-[#fffbeb] border-rule text-ink'
                  }`}
                >
                  {p.name.split(' ')[0]} ({p.reg_no})
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Contactless QR Pass Sheet */}
      <ShowQr
        open={showQr}
        onOpenChange={setShowQr}
        userId={user.id}
        regNo={user.reg_no || undefined}
        studentName={user.name}
      />
    </div>
  );
};

export default ProfilePage;
