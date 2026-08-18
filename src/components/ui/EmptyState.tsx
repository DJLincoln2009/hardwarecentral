import Link from 'next/link';
import { SearchX, FilterX, Heart, FileText, Package } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center sm:px-6 sm:py-20">
      <div className="relative">
        <div className="absolute -inset-3 rounded-full bg-radial-accent" aria-hidden="true" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
          <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-2 font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:bg-teal-700 hover:shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
