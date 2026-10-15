// TODO-swap with src/design/ErrorState once available from Agent B
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  fixSuggestion?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  fixSuggestion,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-4 bg-[#fef2f2] border border-[#fecaca] rounded-[6px] font-staff-ui flex items-start gap-3',
        className
      )}
    >
      <AlertCircle className="h-5 w-5 text-[#b91c1c] shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <h4 className="text-xs font-semibold text-[#991b1b]">{title}</h4>
        <p className="text-xs text-[#b91c1c] leading-relaxed">{message}</p>
        {fixSuggestion && (
          <p className="text-[11px] text-[#7f1d1d] bg-white/70 p-2 rounded-[4px] border border-[#fecaca] mt-1.5 font-medium">
            <span className="font-semibold">How to resolve: </span>{fixSuggestion}
          </p>
        )}
        {onRetry && (
          <div className="pt-2">
            <Button size="sm" variant="secondary" onClick={onRetry} className="h-7 text-xs">
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
