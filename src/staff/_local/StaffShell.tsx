// TODO-swap with src/design/StaffShell once available from Agent B
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  Search,
  Upload,
  Command,
  Database,
  Library,
} from 'lucide-react';
import { CommandBar } from './CommandBar';
import '../staff.css';

export interface StaffShellProps {
  children: React.ReactNode;
}

export const StaffShell: React.FC<StaffShellProps> = ({ children }) => {
  const [commandOpen, setCommandOpen] = useState(false);

  const navItems = [
    {
      to: '/staff',
      end: true,
      label: 'Dashboard',
      icon: LayoutDashboard,
      shortcut: '',
    },
    {
      to: '/staff/issue',
      label: 'Issue',
      icon: BookOpen,
      shortcut: 'Ctrl+I',
    },
    {
      to: '/staff/return',
      label: 'Return',
      icon: RotateCcw,
      shortcut: 'Ctrl+R',
    },
    {
      to: '/staff/catalogue',
      label: 'Catalogue',
      icon: Search,
      shortcut: 'Ctrl+K',
    },
    {
      to: '/staff/import',
      label: 'Import',
      icon: Upload,
      shortcut: '',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#042f2e] font-staff-ui flex flex-col selection:bg-[#ccfbf1] selection:text-[#042f2e]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#d6e2e0] h-14 px-6 flex items-center justify-between">
        {/* Brand / Library Title */}
        <div className="flex items-center gap-6">
          <Link
            to="/staff"
            className="flex items-center gap-2.5 text-[#042f2e] hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-[6px] bg-[#0f766e] text-white flex items-center justify-center font-serif font-bold text-base shadow-sm">
              <Library className="h-4 w-4" />
            </div>
            <div>
              <div className="font-serif text-sm font-semibold tracking-tight text-[#042f2e] leading-tight">
                Apex Central Library
              </div>
              <div className="text-[11px] text-[#042f2e]/60 font-medium">
                Librarian desk
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-[#d6e2e0]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#0f766e] text-white font-semibold'
                        : 'text-[#042f2e]/80 hover:bg-[#f7faf9] hover:text-[#042f2e]'
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-black/10 text-inherit/80 num-tabular">
                      {item.shortcut}
                    </kbd>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Quick Command Bar Trigger */}
          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 h-8 px-2.5 text-xs text-[#042f2e]/70 bg-[#f7faf9] border border-[#d6e2e0] rounded-[6px] hover:border-[#042f2e]/40 transition-colors cursor-pointer"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Commands</span>
            <kbd className="text-[10px] bg-white text-[#042f2e]/60 px-1 py-0.5 rounded border border-[#d6e2e0] num-tabular">
              Ctrl+K
            </kbd>
          </button>

          {/* In-Memory Mock Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-[6px] bg-[#fffbeb] border border-[#fde68a] text-[11px] text-[#b45309]">
            <Database className="h-3 w-3" />
            <span className="font-medium">Mock data mode</span>
          </div>

          {/* Librarian Info */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#d6e2e0]">
            <div className="w-7 h-7 rounded-full bg-[#0f766e]/10 text-[#0f766e] border border-[#0f766e]/30 flex items-center justify-center text-xs font-semibold">
              LB
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-[#042f2e] leading-none">Desk 01</div>
              <div className="text-[10px] text-[#042f2e]/60">Staff circulation</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-6 md:p-8">
        {children}
      </main>

      {/* Global Command Bar Palette */}
      <CommandBar open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
};
