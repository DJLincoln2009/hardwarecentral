import Link from 'next/link';
import { Server, Network, Shield, Camera, Monitor, Building2, Wifi, Printer, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { getActiveCategories } from '@/lib/data/categories';

const iconMap: Record<string, LucideIcon> = {
  Server,
  Network,
  Shield,
  Camera,
  Monitor,
  Building2,
  Wifi,
  Printer,
};

function CategoryGrid() {
  const categories = getActiveCategories();

  return (
    <section className="px-4 py-14 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 text-center">
          <p className="eyebrow mb-2">Catalogue</p>
          <h2 className="font-display text-title font-extrabold tracking-tight text-foreground">
            Explorer par catégorie
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon];
            return (
          <Link
                key={cat.id}
                href={`/catalogue?categorie=${cat.id}`}
                className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center shadow-xs transition-all duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:border-teal-600/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent max-sm:p-4 max-sm:gap-2"
              >
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-teal-500/0 to-teal-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-teal-400/0 dark:to-teal-400/5" aria-hidden="true" />
                <span className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:bg-teal-600 group-hover:text-white group-hover:shadow-glow dark:bg-teal-500/15 dark:text-teal-300 dark:group-hover:bg-teal-500 max-sm:h-11 max-sm:w-11">
                  {Icon && <Icon className="h-6 w-6 max-sm:h-5 max-sm:w-5" aria-hidden="true" />}
                </span>
                <span className="relative text-sm font-semibold text-foreground max-sm:text-xs">{cat.name}</span>
                <span className="relative hidden sm:inline-flex items-center gap-0.5 text-xs font-medium text-muted transition-colors duration-200 group-hover:text-accent">
                  Explorer
                  <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
