// TODO-swap with src/design/Dialog once available from Agent B
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#042f2e]/45 backdrop-blur-[1px] transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Dialog Card (12px rounded as per DESIGN.md) */}
      <div
        className={cn(
          'relative z-50 w-full max-w-lg bg-white rounded-[12px] border border-[#d6e2e0] p-6 shadow-xl font-staff-ui animate-in zoom-in-95',
          className
        )}
      >
        <div className="flex items-start justify-between pb-3 border-b border-[#d6e2e0]">
          <div>
            <h2 className="text-lg font-serif font-semibold text-[#042f2e]">{title}</h2>
            {description && (
              <p className="text-xs text-[#042f2e]/70 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-[6px] text-[#042f2e]/60 hover:text-[#042f2e] hover:bg-[#f7faf9] transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
