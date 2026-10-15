// TODO-swap with src/design/Button once available from Agent B
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium font-staff-ui transition-colors duration-150 rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const sizeClasses = {
      sm: 'h-8 px-2.5 text-xs gap-1.5',
      md: 'h-9 px-3.5 text-sm gap-2',
      lg: 'h-11 px-5 text-base gap-2.5',
    }[size];

    const variantClasses = {
      primary:
        'bg-[#0f766e] text-white hover:bg-[#115e59] focus-visible:ring-[#0f766e] active:bg-[#134e4a]',
      secondary:
        'bg-white text-[#042f2e] border border-[#d6e2e0] hover:bg-[#f7faf9] hover:border-[#042f2e]/30 focus-visible:ring-[#0f766e]',
      ghost:
        'bg-transparent text-[#042f2e] hover:bg-[#042f2e]/5 focus-visible:ring-[#0f766e]',
      danger:
        'bg-[#b91c1c] text-white hover:bg-[#991b1b] focus-visible:ring-[#b91c1c] active:bg-[#7f1d1d]',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseClasses, sizeClasses, variantClasses, className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
