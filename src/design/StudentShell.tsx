import React from 'react';
import { BookOpen, Search, BookCheck, History, User } from 'lucide-react';

export interface StudentShellProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  userName?: string;
  userRegNo?: string;
  libraryName?: string;
  actions?: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'search', label: 'Catalog', icon: Search },
  { id: 'loans', label: 'My books', icon: BookCheck },
  { id: 'history', label: 'History', icon: History },
  { id: 'profile', label: 'Account', icon: User },
];

export const StudentShell: React.FC<StudentShellProps> = ({
  children,
  activeTab = 'search',
  onTabChange,
  userName = 'Student',
  userRegNo,
  libraryName = 'Central Library',
  actions,
}) => {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col md:flex-row antialiased">
      {/* ------------------------------------------------------------- */}
      {/* TABLET / DESKTOP (>= 768px): Slim Left Rail                    */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden md:flex flex-col items-center w-16 lg:w-20 bg-white border-r border-rule py-5 shrink-0 select-none z-20">
        {/* Brand Icon */}
        <div className="w-10 h-10 rounded-[6px] bg-brand text-white flex items-center justify-center mb-6">
          <BookOpen className="w-5 h-5" strokeWidth={1.75} />
        </div>

        {/* Rail Navigation Links */}
        <nav className="flex-1 flex flex-col gap-2 w-full px-2" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange?.(item.id)}
                className={`w-full py-2.5 px-1 rounded-[6px] flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isActive
                    ? 'bg-paper text-brand font-semibold border border-rule'
                    : 'text-grey hover:text-ink hover:bg-paper/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
                <span className="truncate max-w-[64px]">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Avatar Stamp */}
        <div className="mt-auto pt-4 flex flex-col items-center">
          <div
            className="w-9 h-9 rounded-full bg-paper border border-rule text-brand font-serif font-bold text-sm flex items-center justify-center"
            title={userName}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ------------------------------------------------------------- */}
        {/* TABLET / DESKTOP (>= 768px): Top Header Bar                   */}
        {/* ------------------------------------------------------------- */}
        <header className="hidden md:flex items-center justify-between h-14 px-6 bg-white border-b border-rule shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-lg font-semibold text-ink">
              {libraryName}
            </h1>
            {userRegNo && (
              <span className="text-xs font-mono tabular-nums text-grey px-2 py-0.5 rounded-[6px] bg-paper border border-rule">
                {userRegNo}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <div className="text-right text-xs">
              <span className="block font-medium text-ink">{userName}</span>
              <span className="block text-[11px] text-grey">Enrolled member</span>
            </div>
          </div>
        </header>

        {/* Mobile Header (< 768px) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-rule shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-brand text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <span className="font-serif font-semibold text-sm text-ink block leading-tight">
                {libraryName}
              </span>
              <span className="text-[11px] text-grey block">Book availability</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <div className="w-7 h-7 rounded-full bg-paper border border-rule text-brand font-serif font-bold text-xs flex items-center justify-center">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content Viewport (max-width 1120px) */}
        <main className="flex-1 w-full max-w-[1120px] mx-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE (< 768px): Bottom Tab Bar (Never shown on >= 768px)    */}
      {/* ------------------------------------------------------------- */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-rule flex items-center justify-around px-2 z-30 select-none shadow-sheet"
        aria-label="Mobile Navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange?.(item.id)}
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                isActive ? 'text-brand font-semibold' : 'text-grey hover:text-ink'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
