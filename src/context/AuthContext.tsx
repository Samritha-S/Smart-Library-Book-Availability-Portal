import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile, RequestOtpResponse, VerifyOtpResponse } from '@/types/database';
import {
  requestStudentOtp as apiRequestOtp,
  verifyStudentOtp as apiVerifyOtp,
  authenticateStaffByEmail as apiAuthenticateStaff,
  SEED_PROFILES
} from '@/lib/supabase';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  requestOtp: (regNo: string) => Promise<RequestOtpResponse>;
  loginStudent: (regNo: string, otp: string) => Promise<VerifyOtpResponse>;
  loginStaff: (email: string) => Promise<VerifyOtpResponse>;
  logout: () => void;
  // Quick switch helper for review/demo
  switchDemoUser: (profileId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'smart_lib_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load user session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserSession = (profile: Profile) => {
    setUser(profile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  };

  const requestOtp = async (regNo: string): Promise<RequestOtpResponse> => {
    return apiRequestOtp(regNo);
  };

  const loginStudent = async (regNo: string, otp: string): Promise<VerifyOtpResponse> => {
    const res = await apiVerifyOtp(regNo, otp);
    if (res.success && res.profile) {
      saveUserSession(res.profile);
    }
    return res;
  };

  const loginStaff = async (email: string): Promise<VerifyOtpResponse> => {
    const res = await apiAuthenticateStaff(email);
    if (res.success && res.profile) {
      saveUserSession(res.profile);
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchDemoUser = (profileId: string) => {
    const found = SEED_PROFILES.find(p => p.id === profileId);
    if (found) {
      saveUserSession(found);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        requestOtp,
        loginStudent,
        loginStaff,
        logout,
        switchDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
