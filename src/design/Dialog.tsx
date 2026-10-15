import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  className = '',
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll
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

  const maxWidthStyles: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
    >
      {/* Dim backdrop */}
      <div
        className="fixed inset-0 bg-[#042f2e]/40 transition-opacity motion-reduce:transition-none"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog card: 12px radius, crisp 1px border, subtle elevation */}
      <div
        ref={contentRef}
        className={`relative z-10 w-full ${maxWidthStyles[maxWidth]} rounded-[12px] bg-white border border-rule text-ink shadow-dialog overflow-hidden flex flex-col my-auto transition-transform motion-reduce:transition-none ${className}`}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 md:p-6 border-b border-rule">
            <div className="space-y-1 pr-6">
              {title && (
                <h2
                  id="dialog-title"
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
              onClick={onClose}
              className="rounded-[6px] p-1.5 text-grey hover:text-ink hover:bg-rule/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        )}

        {/* Body content */}
        <div className="p-5 md:p-6 text-sm text-ink overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 md:px-6 border-t border-rule bg-paper flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
