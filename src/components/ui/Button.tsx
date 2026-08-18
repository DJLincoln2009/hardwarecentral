'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  /** Halo accent sous le bouton — réservé aux surfaces sombres */
  glow?: boolean;
}

const baseStyles = cn(
  'inline-flex items-center justify-center rounded-lg font-medium whitespace-nowrap',
  'transition-[transform,background-color,border-color,box-shadow,color] duration-200',
  'ease-[var(--ease-out-expo)] active:scale-[0.97]',
  'disabled:pointer-events-none disabled:opacity-50',
  'focus-visible:outline-none focus-visible:shadow-focus focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
);

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-teal-600 text-white shadow-sm hover:bg-teal-700 hover:shadow-md active:bg-teal-800',
  secondary:
    'bg-surface-muted text-foreground hover:bg-surface-strong active:bg-surface-strong',
  outline:
    'border border-border-strong bg-transparent text-foreground hover:border-accent hover:text-accent active:bg-surface-muted',
  ghost: 'bg-transparent text-foreground hover:bg-surface-muted active:bg-surface-strong',
  destructive:
    'bg-danger-text text-white hover:opacity-90 shadow-sm hover:shadow-md',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 min-h-[44px] sm:min-h-0 px-3 text-sm gap-1.5',
  md: 'h-10 min-h-[44px] sm:min-h-0 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
  icon: 'h-10 min-h-[44px] sm:min-h-0 w-10 p-0',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      glow = false,
      icon,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          glow && 'shadow-glow hover:shadow-glow',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
        ) : icon ? (
          <span aria-hidden="true">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
