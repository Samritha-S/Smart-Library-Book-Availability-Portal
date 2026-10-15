// TODO-swap with src/design/Sheet once Agent B merges
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
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
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 transition-opacity motion-reduce:transition-none"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Sheet Content: Bottom sheet below 768px, Right-hand panel from 768px up */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full bg-paper border-rule text-ink shadow-dialog transition-transform motion-reduce:transition-none max-h-[90vh] md:max-h-full overflow-y-auto ${
          // Mobile bottom sheet: 12px rounded top corners, desktop: 12px left corners or full right rail
          'rounded-t-[12px] md:rounded-t-none md:rounded-l-[12px] md:w-[420px] md:h-full border-t md:border-t-0 md:border-l'
        } ${className}`}
      >
        <div className="sticky top-0 z-20 flex items-start justify-between p-4 bg-paper/95 border-b border-rule backdrop-blur-none">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-ink font-heading leading-tight">
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
            aria-label="Close panel"
            className="p-1 rounded-[6px] text-grey hover:text-ink hover:bg-rule/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
