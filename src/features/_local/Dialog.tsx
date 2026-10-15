// TODO-swap with src/design/Dialog once Agent B merges
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
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
  className = '',
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
        className="fixed inset-0 bg-ink/50 transition-opacity motion-reduce:transition-none"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal Card: 12px radius, no gradient, crisp border */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full max-w-lg bg-paper border border-rule text-ink rounded-[12px] shadow-dialog p-5 md:p-6 overflow-hidden transition-all motion-reduce:transition-none ${className}`}
      >
        <div className="flex items-start justify-between pb-3 border-b border-rule mb-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-ink font-heading leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs text-grey leading-normal">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            className="p-1 rounded-[6px] text-grey hover:text-ink hover:bg-rule/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
