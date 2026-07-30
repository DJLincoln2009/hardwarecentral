'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const textareaBase =
  'w-full rounded-md border border-graphite-200 bg-white px-3 py-2 text-base text-graphite-900 placeholder:text-graphite-400 transition-colors duration-150 focus:border-teal-600 focus:ring-2 focus:ring-teal-600 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-graphite-50 min-h-24 resize-y';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const textareaId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={textareaId} className="text-sm font-medium text-graphite-900">
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          className={`${textareaBase} ${error ? 'border-danger-border ring-danger-border focus:border-danger-text focus:ring-danger-text' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} role="alert" className="text-xs text-danger-text flex items-center gap-1">
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
