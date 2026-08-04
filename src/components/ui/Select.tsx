'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

const selectBase = cn(
  'w-full appearance-none rounded-md border border-border bg-surface px-3 py-2 pr-9 text-base text-foreground',
  'transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-background focus:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
);

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, id, className, ...props }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    if (options.length <= 1 && !placeholder) {
      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="px-3 py-2 text-base text-muted">
            {options[0]?.label}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${selectId}-error` : undefined}
            className={cn(
              selectBase,
              error && 'border-danger-border focus:border-danger-text focus:ring-danger-text',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
            role="alert"
            className="flex items-center gap-1 text-xs text-danger-text"
          >
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
