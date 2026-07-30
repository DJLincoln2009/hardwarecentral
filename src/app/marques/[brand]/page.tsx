import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getActiveBrands, getBrandByCode } from '@/lib/data/brands';
import { getProductsByBrand } from '@/lib/data/products';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';

interface Props {
  params: Promise<{ brand: string }>;
}

export async function generateStaticParams(): Promise<{ brand: string }[]> {
  return getActiveBrands().map((b) => ({ brand: b.code.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: code } = await params;
  const brand = getBrandByCode(code.toUpperCase());
  if (!brand) return { title: 'Marque introuvable | HardwareCentral' };
  return {
    title: brand.name,
    description: brand.shortDescription.slice(0, 160),
    alternates: { canonical: `/marques/${code}` },
    openGraph: {
      title: `${brand.name} | HardwareCentral`,
      description: brand.shortDescription.slice(0, 160),
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { brand: code } = await params;
  const brand = getBrandByCode(code.toUpperCase());
  if (!brand) notFound();

  const brandProducts = getProductsByBrand(brand.code);
  const brandName = brand.name;

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Marques', href: '/marques' },
    { label: brandName },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="mb-8 flex items-center gap-4 rounded-lg border border-graphite-200 bg-graphite-50 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
          <span className="text-xl font-bold font-display text-graphite-600">
            {brandName.charAt(0)}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-graphite-900 font-display">{brandName}</h1>
          <p className="mt-1 text-sm text-graphite-600">{brand.shortDescription}</p>
        </div>
      </div>

      <p className="mb-4 text-sm text-graphite-600">
        {brandProducts.length} produit{brandProducts.length !== 1 ? 's' : ''} {brandName}
      </p>

      {brandProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {brandProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          variant="empty"
          title="Aucun produit disponible"
          description={`Les produits ${brandName} arrivent bientôt.`}
          action={{ label: 'Voir toutes les marques', href: '/marques' }}
        />
      )}
    </div>
  );
}
