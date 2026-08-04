'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import FieldError from './FieldError';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const textareaBase = cn(
  'w-full min-h-24 resize-y rounded-md border bg-surface px-3.5 py-2.5 text-base text-foreground shadow-xs',
  'placeholder:text-faint transition-all duration-200',
  'border-border hover:border-border-strong',
  'focus:border-accent focus:shadow-focus focus:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
);

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const textareaId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          className={cn(
            textareaBase,
            error &&
              'border-danger-border hover:border-danger-border focus:border-danger-text focus:shadow-focus-danger',
            className,
          )}
          {...props}
        />
        <FieldError id={`${textareaId}-error`} message={error} />
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
