import React, { useState } from 'react';
import {
  BookOpen,
  ArrowLeftRight,
  BookCopy,
  Users,
  BarChart3,
  Search,
  Settings,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { CommandBar, type CommandBarItem } from './CommandBar';

export interface StaffShellProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  staffName?: string;
  staffRole?: string;
  libraryName?: string;
  commandItems?: CommandBarItem[];
  actions?: React.ReactNode;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

const STAFF_NAV: NavSection[] = [
  { id: 'circulation', label: 'Circulation desk', icon: ArrowLeftRight },
  { id: 'catalog', label: 'Catalog & copies', icon: BookCopy },
  { id: 'members', label: 'Enrolled students', icon: Users },
  { id: 'analytics', label: 'Reports & fines', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const StaffShell: React.FC<StaffShellProps> = ({
  children,
  activeSection = 'circulation',
  onSectionChange,
  staffName = 'Rahul Verma',
  staffRole = 'Circulation librarian',
  libraryName = 'Central Library Desk',
  commandItems = [],
  actions,
}) => {
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper text-ink flex antialiased">
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP LEFT SIDEBAR                                          */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-rule shrink-0 select-none">
        {/* Header Branding */}
        <div className="h-14 px-5 border-b border-rule flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-brand text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif font-semibold text-sm text-ink truncate">
              {libraryName}
            </h2>
            <span className="text-[10px] text-brand font-medium flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Staff portal
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Staff Navigation">
          {STAFF_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange?.(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[6px] transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-paper text-brand font-semibold border border-rule'
                    : 'text-grey hover:text-ink hover:bg-paper/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Staff Profile Footer */}
        <div className="p-3 border-t border-rule bg-paper flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white border border-rule text-brand font-serif font-bold text-xs flex items-center justify-center shrink-0">
            {staffName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-ink truncate leading-tight">
              {staffName}
            </span>
            <span className="block text-[11px] text-grey truncate leading-tight">
              {staffRole}
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay (< 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#042f2e]/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-64 max-w-[80vw] bg-white h-full flex flex-col border-r border-rule shadow-sheet">
            <div className="h-14 px-4 border-b border-rule flex items-center justify-between">
              <span className="font-serif font-semibold text-sm text-ink truncate">
                {libraryName}
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-grey hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {STAFF_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSectionChange?.(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[6px] text-left ${
                      isActive
                        ? 'bg-paper text-brand font-semibold border border-rule'
                        : 'text-grey hover:text-ink'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with Ctrl+K Command Bar trigger */}
        <header className="h-14 px-4 md:px-6 bg-white border-b border-rule flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-[6px] text-grey hover:text-ink hover:bg-paper"
              aria-label="Open staff menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>

            {/* Ctrl+K Search Pill */}
            <button
              type="button"
              onClick={() => setCommandBarOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-paper border border-rule hover:border-brand/40 text-grey hover:text-ink transition-colors text-xs w-48 sm:w-72"
            >
              <Search className="w-3.5 h-3.5 shrink-0 text-grey" strokeWidth={1.75} />
              <span className="truncate flex-1 text-left">Search catalog or commands...</span>
              <kbd className="hidden sm:inline-flex items-center h-4 px-1 text-[10px] font-mono text-grey bg-white border border-rule rounded">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-rule text-xs">
              <span className="w-2 h-2 rounded-full bg-brand" title="System operational" />
              <span className="text-grey font-medium">Terminal live</span>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Command Bar */}
      <CommandBar
        open={commandBarOpen}
        onOpenChange={setCommandBarOpen}
        items={commandItems}
      />
    </div>
  );
};
