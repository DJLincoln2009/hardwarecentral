'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import FieldError from './FieldError';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const inputBase = cn(
  'w-full rounded-md border bg-surface px-3.5 py-2.5 text-base text-foreground shadow-xs',
  'placeholder:text-faint transition-all duration-200',
  'border-border hover:border-border-strong',
  'focus:border-accent focus:shadow-focus focus:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
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
              'border-danger-border hover:border-danger-border focus:border-danger-text focus:shadow-focus-danger',
            className,
          )}
          {...props}
        />
        <FieldError id={`${inputId}-error`} message={error} />
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
