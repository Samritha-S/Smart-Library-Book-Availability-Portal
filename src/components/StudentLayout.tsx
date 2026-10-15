import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Search, BookMarked, User, BookOpen } from 'lucide-react';
import { SEED_LIBRARY } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export const StudentLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'My Books', path: '/my-books', icon: BookMarked },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  // Don't show top bar on sub-pages with custom back navigation like /work/:id if desired, or keep header consistent
  const isWorkDetail = location.pathname.startsWith('/work/');

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      {/* Mobile-first centered column */}
      <div className="w-full max-w-lg min-h-screen bg-slate-50 border-x border-slate-200/80 shadow-md flex flex-col relative pb-20">
        {/* Top Header */}
        {!isWorkDetail && (
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-700/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm tracking-tight block leading-none">
                  Smart Library
                </span>
                <span className="text-[10px] text-teal-700 font-medium">
                  {SEED_LIBRARY.code}
                </span>
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-semibold text-slate-800 block leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] font-mono text-teal-700">
                    {user.reg_no || user.role}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-teal-500/40 bg-teal-50 shrink-0">
                  {user.photo_url ? (
                    <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-teal-800 font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-5">
          <Outlet />
        </main>

        {/* Bottom Navigation Bar (Fixed for mobile, centered in max-w-lg column) */}
        <nav
          role="navigation"
          aria-label="Bottom Navigation"
          className="fixed bottom-0 z-40 w-full max-w-lg bg-white/95 backdrop-blur border-t border-slate-200/90 px-3 py-1.5 flex items-center justify-around shadow-lg"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all select-none ${
                  isActive
                    ? 'text-teal-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <div
                  className={`relative p-1 rounded-full transition-all ${
                    isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
