// TODO-swap with src/design/CommandBar once available from Agent B
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, RotateCcw, Upload, LayoutDashboard, CornerDownLeft } from 'lucide-react';

export interface CommandBarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({ open: externalOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (isControlled) {
      onOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!isOpen);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        navigate('/staff/issue');
        setOpen(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        navigate('/staff/return');
        setOpen(false);
      } else if (e.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, navigate]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const commands = [
    {
      id: 'issue',
      title: 'Issue book',
      subtitle: 'Scan student register number or QR, then book copy',
      icon: BookOpen,
      shortcut: 'Ctrl+I',
      action: () => {
        navigate('/staff/issue');
        setOpen(false);
      },
    },
    {
      id: 'return',
      title: 'Return book',
      subtitle: 'Process return by accession number, calculate fines',
      icon: RotateCcw,
      shortcut: 'Ctrl+R',
      action: () => {
        navigate('/staff/return');
        setOpen(false);
      },
    },
    {
      id: 'catalogue',
      title: 'Search catalogue',
      subtitle: 'View, edit shelf locations, or withdraw damaged copies',
      icon: Search,
      shortcut: 'Ctrl+K',
      action: () => {
        navigate('/staff/catalogue');
        setOpen(false);
      },
    },
    {
      id: 'import',
      title: 'Import catalog batch',
      subtitle: 'Upload CSV, fetch Open Library data, and review',
      icon: Upload,
      shortcut: '',
      action: () => {
        navigate('/staff/import');
        setOpen(false);
      },
    },
    {
      id: 'dashboard',
      title: 'Staff dashboard',
      subtitle: 'Recent issues, returns, and updated copies',
      icon: LayoutDashboard,
      shortcut: '',
      action: () => {
        navigate('/staff');
        setOpen(false);
      },
    },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 font-staff-ui">
      <div
        className="fixed inset-0 bg-[#042f2e]/45 backdrop-blur-[1px] transition-opacity"
        onClick={() => setOpen(false)}
      />

      <div className="relative z-50 w-full max-w-xl bg-white rounded-[12px] border border-[#d6e2e0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center px-4 border-b border-[#d6e2e0]">
          <Search className="h-4 w-4 text-[#042f2e]/50 shrink-0 mr-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or jump to screen..."
            className="w-full h-12 text-sm text-[#042f2e] placeholder:text-[#042f2e]/40 bg-transparent focus:outline-none"
          />
          <kbd className="text-[10px] bg-[#f7faf9] text-[#042f2e]/60 px-1.5 py-0.5 rounded border border-[#d6e2e0]">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#042f2e]/50">
              No matching commands
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-2.5 rounded-[6px] cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#f0fdfa] text-[#0f766e]' : 'hover:bg-[#f7faf9] text-[#042f2e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-[#0f766e]' : 'text-[#042f2e]/60'}`} />
                    <div>
                      <div className="text-xs font-semibold">{item.title}</div>
                      <div className="text-[11px] text-[#042f2e]/60">{item.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.shortcut && (
                      <kbd className="text-[10px] bg-[#f7faf9] text-[#042f2e]/60 px-1.5 py-0.5 rounded border border-[#d6e2e0] num-tabular">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && <CornerDownLeft className="h-3 w-3 text-[#0f766e]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-[#f7faf9] border-t border-[#d6e2e0] text-[11px] text-[#042f2e]/60">
          <span>Use &uarr; &darr; to navigate, Enter to select</span>
          <span>Press <kbd className="font-semibold">Ctrl+I</kbd> for Issue, <kbd className="font-semibold">Ctrl+R</kbd> for Return</span>
        </div>
      </div>
    </div>
  );
};
