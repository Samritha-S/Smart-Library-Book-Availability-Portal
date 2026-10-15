import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface SheetProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen: isOpenProp,
  open: openProp,
  onClose,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className = '',
}) => {
  const isOpen = isOpenProp !== undefined ? isOpenProp : Boolean(openProp);
  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sheet-title' : undefined}
    >
      {/* Dim backdrop */}
      <div
        className="fixed inset-0 bg-[#042f2e]/40 transition-opacity motion-reduce:transition-none"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet Content: Bottom sheet below 768px, Right-hand panel from 768px up */}
      <div
        ref={contentRef}
        className={`relative z-10 w-full bg-white flex flex-col text-ink border-rule
          /* Mobile: Bottom Sheet */
          mt-auto max-h-[85vh] rounded-t-[12px] border-t shadow-sheet
          /* Tablet/Desktop (>= 768px): Right-Hand Panel */
          md:mt-0 md:h-full md:max-h-full md:max-w-md md:rounded-none md:rounded-l-[12px] md:border-t-0 md:border-l
          transition-transform motion-reduce:transition-none ${className}`}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-4 md:p-6 border-b border-rule">
            <div className="space-y-1 pr-6">
              {title && (
                <h2
                  id="sheet-title"
                  className="font-serif text-lg font-semibold text-ink leading-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-grey leading-normal">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-[6px] p-1.5 text-grey hover:text-ink hover:bg-rule/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 transition-colors"
              aria-label="Close sheet"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 md:p-6 border-t border-rule bg-paper flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
