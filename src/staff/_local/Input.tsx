// TODO-swap with src/design/Input once available from Agent B
import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 font-staff-ui">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[#042f2e]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#042f2e]/60">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-9 px-3 text-sm rounded-[6px] bg-white border border-[#d6e2e0] text-[#042f2e] placeholder:text-[#042f2e]/40 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:border-transparent',
              'disabled:bg-[#f7faf9] disabled:text-[#042f2e]/40 disabled:cursor-not-allowed',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-[#b91c1c] focus-visible:ring-[#b91c1c]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-[#042f2e]/60">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#b91c1c]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#042f2e]/60">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
