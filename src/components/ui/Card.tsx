import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outline' | 'interactive';
  as?: ElementType;
  padded?: boolean;
}

const variantStyles = {
  default: 'rounded-xl border border-border bg-surface shadow-xs',
  elevated: 'rounded-xl border border-border bg-surface shadow-lg',
  outline: 'rounded-xl border border-border bg-surface',
  interactive:
    'rounded-xl border border-border bg-surface shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
};

export function Card({
  children,
  className,
  variant = 'default',
  as: Component = 'div',
  padded = true,
}: CardProps) {
  return (
    <Component className={cn(variantStyles[variant], padded && 'p-6', className)}>
      {children}
    </Component>
  );
}

export default Card;
