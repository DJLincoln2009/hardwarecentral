import Link from 'next/link';
import { Server, Network, Shield, Camera, Monitor, type LucideIcon } from 'lucide-react';
import { getActiveCategories } from '@/lib/data/categories';

const iconMap: Record<string, LucideIcon> = {
  Server,
  Network,
  Shield,
  Camera,
  Monitor,
};

function CategoryGrid() {
  const categories = getActiveCategories();

  return (
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon];
            return (
              <Link
                key={cat.id}
                href={`/catalogue?categorie=${cat.id}`}
                className="flex flex-col items-center gap-3 rounded-lg border border-graphite-200 p-6 text-center hover:border-teal-600 hover:shadow-md transition-all focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
                  {Icon && <Icon className="h-6 w-6 text-teal-600" aria-hidden="true" />}
                </div>
                <span className="text-sm font-semibold text-graphite-900">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
