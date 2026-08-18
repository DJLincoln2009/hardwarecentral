import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getFeaturedProducts } from '@/lib/data/products';
import ProductCard from '@/components/product/ProductCard';

function FeaturedProducts() {
  const products = getFeaturedProducts();

  if (products.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface-muted px-4 py-10 md:py-20 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-9 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow mb-2">Sélection</p>
            <h2 className="font-display text-title font-extrabold tracking-tight text-foreground">
              Nouveautés &amp; incontournables
            </h2>
          </div>
          <Link
            href="/catalogue"
            className="group inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-xs transition-all duration-200 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Tout le catalogue
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
