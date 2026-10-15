import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEED_LIBRARY, isDemoMode, SEED_PROFILES } from '@/lib/supabase';
import {
  LogOut,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Member Profile
        </h2>
        <p className="text-xs text-slate-500">
          Institutional identity and borrowing authorization
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-teal-600 via-teal-500 to-amber-500" />

        <div className="p-5 sm:p-6 space-y-5">
          {/* Top Identity Block */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full ring-2 ring-teal-500/30 overflow-hidden bg-slate-100 shrink-0">
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-teal-700 font-bold text-xl">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <Badge variant="default" className="text-[10px] uppercase font-semibold mb-1">
                {user.role.replace('_', ' ')}
              </Badge>
              <h3 className="text-lg font-bold text-slate-900 leading-snug truncate">
                {user.name}
              </h3>
              <p className="text-xs font-mono text-teal-800">
                {user.reg_no || user.email}
              </p>
            </div>
          </div>

          {/* User Profile Attributes */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                Department
              </span>
              <span className="font-semibold text-slate-900">{user.department || 'General'}</span>
            </div>

            {user.year && (
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Academic Year
                </span>
                <span className="font-medium text-slate-800">Year {user.year}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                User Type
              </span>
              <span className="capitalize font-semibold text-teal-800">{user.user_type.replace('_', ' ')}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Library
              </span>
              <span className="font-medium text-slate-800">{SEED_LIBRARY.name}</span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center gap-2.5 text-xs text-teal-900">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Authorized active member. Multi-tenant RLS active.</span>
          </div>

          {/* Sign Out Button */}
          <Button
            variant="outline"
            className="w-full text-slate-700 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Demo Quick-Switch in Demo Mode */}
      {isDemoMode && (
        <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs text-slate-600 shadow-sm space-y-2">
          <p className="font-semibold text-amber-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Demo Mode: Switch Student Profile
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SEED_PROFILES.filter(p => p.role === 'student').slice(0, 5).map(p => (
              <button
                key={p.id}
                onClick={() => switchDemoUser(p.id)}
                className={`px-2.5 py-1 rounded border text-[11px] font-medium transition ${
                  p.id === user.id
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                }`}
              >
                {p.name.split(' ')[0]} ({p.reg_no})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
