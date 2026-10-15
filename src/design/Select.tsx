import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options = [],
      id,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-ink"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-desc` : undefined}
            className={`w-full h-9 rounded-[6px] bg-white pl-3 pr-8 text-sm text-ink border appearance-none transition-colors outline-none motion-reduce:transition-none disabled:bg-paper disabled:text-grey disabled:cursor-not-allowed cursor-pointer ${
              error
                ? 'border-alert focus-visible:ring-2 focus-visible:ring-alert focus-visible:ring-offset-1'
                : 'border-rule hover:border-brand/60 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1'
            } ${className}`}
            {...props}
          >
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3 pointer-events-none text-grey flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p id={`${selectId}-error`} className="text-xs text-alert font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-desc`} className="text-xs text-grey">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
