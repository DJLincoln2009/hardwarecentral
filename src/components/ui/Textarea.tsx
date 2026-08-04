'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const textareaBase = cn(
  'w-full min-h-24 resize-y rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground',
  'placeholder:text-faint transition-colors duration-150',
  'focus:border-accent focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-background focus:outline-none',
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
              'border-danger-border focus:border-danger-text focus:ring-danger-text',
            className,
          )}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
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

Textarea.displayName = 'Textarea';

export default Textarea;
