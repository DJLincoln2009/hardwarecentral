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
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-graphite-50">
        <Icon className="h-7 w-7 text-graphite-400" aria-hidden="true" />
      </div>
      <p className="text-lg font-semibold text-graphite-900">{title}</p>
      {description && <p className="max-w-sm text-sm text-graphite-600">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-2 inline-flex rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
