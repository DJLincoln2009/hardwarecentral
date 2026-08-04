'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import FieldError from './FieldError';

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
  'w-full appearance-none rounded-md border border-border bg-surface px-3.5 py-2.5 pr-9 text-base text-foreground shadow-xs',
  'transition-all duration-200 hover:border-border-strong',
  'focus:border-accent focus:shadow-focus focus:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
);

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, id, className, ...props }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    if (options.length <= 1 && !placeholder) {
      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="px-3.5 py-2.5 text-base text-muted">{options[0]?.label}</span>
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
              error &&
                'border-danger-border hover:border-danger-border focus:border-danger-text focus:shadow-focus-danger',
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
        <FieldError id={`${selectId}-error`} message={error} />
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
