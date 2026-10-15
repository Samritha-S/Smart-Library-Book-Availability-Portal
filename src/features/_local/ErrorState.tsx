// TODO-swap with src/design/ErrorState when available
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/design/Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'Could not load the requested information. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-[6px] border border-alert/30 bg-[#fef2f2] ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-white border border-alert/30 flex items-center justify-center text-alert mb-3 shrink-0">
        <AlertCircle className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <h3 className="font-serif text-base font-semibold text-alert mb-1">
        {title}
      </h3>
      <p className="text-xs text-grey max-w-sm leading-normal mb-4 font-sans">
        {description}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Try again
        </Button>
      )}
    </div>
  );
};
