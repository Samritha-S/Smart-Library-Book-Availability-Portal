import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  retryText?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load information',
  message,
  description,
  onRetry,
  retryLabel,
  retryText,
  className = '',
}) => {
  const displayMessage =
    message ||
    description ||
    'An unexpected problem occurred while retrieving library data. Please verify your connection and try again.';
  const displayActionLabel = retryLabel || retryText || 'Try again';
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-[6px] border border-alert/30 bg-[#fef2f2]/40 ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-white border border-alert/40 flex items-center justify-center text-alert mb-3 shrink-0">
        <AlertTriangle className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <h3 className="font-serif text-base font-semibold text-ink mb-1">
        {title}
      </h3>
      <p className="text-xs text-grey max-w-sm leading-normal mb-4">
        {displayMessage}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />}
        >
          {displayActionLabel}
        </Button>
      )}
    </div>
  );
};
