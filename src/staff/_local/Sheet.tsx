// TODO-swap with src/design/Sheet once available from Agent B
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: 'right' | 'bottom';
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = 'right',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#042f2e]/40 backdrop-blur-[1px] transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet Content Panel */}
      <div
        className={cn(
          'relative z-50 w-full bg-white border border-[#d6e2e0] shadow-xl overflow-y-auto font-staff-ui transition-all',
          side === 'right'
            ? 'h-full md:max-w-md md:rounded-l-[12px] p-6'
            : 'rounded-t-[12px] max-h-[90vh] p-6',
          className
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#d6e2e0]">
          <div>
            {title && (
              <h2 className="text-lg font-serif font-semibold text-[#042f2e]">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-[#042f2e]/70 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-[6px] text-[#042f2e]/60 hover:text-[#042f2e] hover:bg-[#f7faf9] transition-colors"
            aria-label="Close sheet"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
