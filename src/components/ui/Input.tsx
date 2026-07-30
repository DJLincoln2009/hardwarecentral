'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const inputBase =
  'w-full rounded-md border border-graphite-200 bg-white px-3 py-2 text-base text-graphite-900 placeholder:text-graphite-400 transition-colors duration-150 focus:border-teal-600 focus:ring-2 focus:ring-teal-600 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-graphite-50';

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-graphite-900">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`${inputBase} ${error ? 'border-danger-border ring-danger-border focus:border-danger-text focus:ring-danger-text' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-danger-text flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
