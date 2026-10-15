import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';

export interface CommandBarItem {
  id: string;
  label: string;
  group?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect?: () => void;
  keywords?: string[];
}

export interface CommandBarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  items?: CommandBarItem[];
  placeholder?: string;
  onSelectItem?: (item: CommandBarItem) => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  open: controlledOpen,
  onOpenChange,
  items = [],
  placeholder = 'Type a command or search books...',
  onSelectItem,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(val);
    }
    onOpenChange?.(val);
  };

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Group items
  const groups = items.reduce<Record<string, CommandBarItem[]>>((acc, item) => {
    const group = item.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={setOpen}
      label="Global command palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4"
    >
      {/* Dim backdrop */}
      <div
        className="fixed inset-0 bg-[#042f2e]/40 transition-opacity motion-reduce:transition-none"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Command palette card */}
      <div className="relative z-10 w-full max-w-xl rounded-[12px] bg-white border border-rule text-ink shadow-dialog overflow-hidden flex flex-col">
        {/* Input bar */}
        <div className="flex items-center px-4 border-b border-rule">
          <Search className="w-4 h-4 text-grey shrink-0 mr-2.5" strokeWidth={1.75} />
          <Command.Input
            placeholder={placeholder}
            className="w-full h-11 bg-transparent text-sm text-ink placeholder:text-grey/70 outline-none border-none font-sans"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 text-[10px] font-mono text-grey bg-paper border border-rule rounded-[4px] select-none">
            Esc
          </kbd>
        </div>

        {/* Command list */}
        <Command.List className="max-h-72 overflow-y-auto p-2 divide-y divide-transparent">
          <Command.Empty className="p-4 text-center text-xs text-grey">
            No results found.
          </Command.Empty>

          {Object.entries(groups).map(([groupName, groupItems]) => (
            <Command.Group
              key={groupName}
              heading={groupName}
              className="text-[11px] font-semibold text-grey px-2 py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-grey [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1"
            >
              {groupItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                  onSelect={() => {
                    item.onSelect?.();
                    onSelectItem?.(item);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 text-xs text-ink rounded-[6px] cursor-pointer select-none transition-colors data-[selected=true]:bg-paper data-[selected=true]:text-brand hover:bg-paper"
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon && (
                      <span className="text-grey shrink-0">{item.icon}</span>
                    )}
                    <span className="font-medium text-ink">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <kbd className="font-mono text-[10px] text-grey bg-paper px-1.5 py-0.5 rounded border border-rule">
                      {item.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>

        <div className="flex items-center justify-between px-4 py-2 bg-paper border-t border-rule text-[11px] text-grey">
          <span>Navigate with arrow keys</span>
          <span>Press Enter to select</span>
        </div>
      </div>
    </Command.Dialog>
  );
};
