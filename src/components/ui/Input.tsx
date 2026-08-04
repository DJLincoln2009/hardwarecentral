'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const inputBase = cn(
  'w-full rounded-md border bg-surface px-3 py-2 text-base text-foreground',
  'placeholder:text-faint transition-colors duration-150',
  'focus:border-accent focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-background focus:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
  'border-border',
);

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            inputBase,
            error &&
              'border-danger-border focus:border-danger-text focus:ring-danger-text',
            className,
          )}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
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

Input.displayName = 'Input';

export default Input;
