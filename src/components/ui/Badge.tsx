import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  success: 'bg-success-bg text-success-text border-success-border',
  warning: 'bg-warning-bg text-warning-text border-warning-border',
  danger: 'bg-danger-bg text-danger-text border-danger-border',
  neutral: 'bg-graphite-50 text-graphite-800 border-graphite-200',
};

function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium font-mono border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
