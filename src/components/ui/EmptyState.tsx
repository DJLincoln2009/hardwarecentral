import Link from 'next/link';
import { SearchX, FilterX, Heart, FileText, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  search: SearchX,
  filter: FilterX,
  favorites: Heart,
  quote: FileText,
  empty: Package,
};

interface EmptyStateProps {
  variant?: keyof typeof icons;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

function EmptyState({ variant = 'empty', title, description, action }: EmptyStateProps) {
  const Icon = icons[variant] ?? icons.empty;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted ring-1 ring-border">
        <Icon className="h-7 w-7 text-faint" aria-hidden="true" />
      </div>
      <p className="text-lg font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className={cn(
            'mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-medium text-white',
            'shadow-sm transition-colors duration-150 hover:bg-teal-800 active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
