'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';

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

const selectBase =
  'w-full rounded-md border border-graphite-200 bg-white px-3 py-2 text-base text-graphite-900 transition-colors duration-150 focus:border-teal-600 focus:ring-2 focus:ring-teal-600 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-graphite-50';

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, id, className = '', ...props }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    if (options.length <= 1 && !placeholder) {
      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-graphite-900">{label}</span>
          <span className="text-base text-graphite-600 px-3 py-2">
            {options[0]?.label}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-graphite-900">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={`${selectBase} ${error ? 'border-danger-border ring-danger-border focus:border-danger-text focus:ring-danger-text' : ''} ${className}`}
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
        {error && (
          <p id={`${selectId}-error`} role="alert" className="text-xs text-danger-text flex items-center gap-1">
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
