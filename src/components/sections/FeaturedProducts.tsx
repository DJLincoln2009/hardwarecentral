import Link from 'next/link';
import { getFeaturedProducts } from '@/lib/data/products';
import ProductCard from '@/components/product/ProductCard';

function FeaturedProducts() {
  const products = getFeaturedProducts();

  if (products.length === 0) return null;

  return (
    <section className="bg-graphite-50 px-4 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-graphite-900 font-display md:text-3xl">
            Produits récents
          </h2>
          <Link
            href="/catalogue"
            className="text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none rounded-sm"
          >
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
