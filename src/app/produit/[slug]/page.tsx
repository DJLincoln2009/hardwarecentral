import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Shield } from 'lucide-react';
import { products, getProductById } from '@/lib/data/products';
import { getBrandByCode } from '@/lib/data/brands';
import { getCategoryById } from '@/lib/data/categories';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSpecsTable from '@/components/product/ProductSpecsTable';
import ProductAvailabilityBadge from '@/components/product/ProductAvailabilityBadge';
import QuoteToggleButton from '@/components/product/QuoteToggleButton';
import ProductWhatsAppMessage from '@/components/product/ProductWhatsAppMessage';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return products.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductById(slug);
  if (!product) return { title: 'Produit introuvable' };
  const brand = getBrandByCode(product.brand);
  const brandName = brand?.name ?? product.brand;
  return {
    title: `${product.name} – ${brandName}`,
    description: product.shortDescription.slice(0, 160),
    openGraph: {
      title: `${product.name} – ${brandName}`,
      description: product.shortDescription.slice(0, 160),
    },
    alternates: { canonical: `/produit/${slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductById(slug);
  if (!product) notFound();

  const brand = getBrandByCode(product.brand);
  const category = getCategoryById(product.category);

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: category?.name ?? product.category, href: `/catalogue?categorie=${product.category}` },
    { label: product.name },
  ];

  const availabilityMap: Record<string, string> = {
    available: 'https://schema.org/InStock',
    limited: 'https://schema.org/LimitedAvailability',
    'on-order': 'https://schema.org/PreOrder',
    discontinued: 'https://schema.org/Discontinued',
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: brand?.name ?? product.brand,
    },
    image: product.primaryImage.url || undefined,
    category: category?.name ?? product.category,
    availability: availabilityMap[product.availability.status] ?? 'https://schema.org/InStock',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <ProductWhatsAppMessage productName={product.name} sku={product.sku} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="w-full lg:w-[400px] lg:flex-shrink-0">
          <ProductGallery images={[product.primaryImage, ...product.gallery]} productName={product.name} />
          {product.primaryImage.imageSource === 'ai-render' && (
            <p className="mt-2 text-xs italic text-graphite-600">
              Visuel généré, produit réel non contractuel sur cette image.
            </p>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-graphite-600">
              {brand?.name ?? product.brand}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-graphite-900 font-display lg:text-3xl">
              {product.name}
            </h1>
            <p className="mt-0.5 font-mono text-xs text-graphite-600">SKU: {product.sku}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ProductAvailabilityBadge status={product.availability.status} />
            {product.availability.status !== 'available' && (
              <span className="text-sm text-graphite-500">
                Délai : {product.availability.leadTimeDays} jours
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-graphite-600">
            <Shield className="h-4 w-4 text-teal-600" aria-hidden="true" />
            <span>{product.warranty.durationLabel}</span>
          </div>

          <p className="text-sm text-graphite-700 leading-relaxed">{product.shortDescription}</p>

          <div className="flex gap-3">
            <QuoteToggleButton product={product} size="lg" className="flex-1 justify-center" />
          </div>

          {product.datasheets.length > 0 && (
            <div className="rounded-lg border border-graphite-200 p-4">
              <p className="mb-2 text-sm font-semibold text-graphite-900">Fiches techniques</p>
              <ul className="space-y-1">
                {product.datasheets.map((ds, i) => (
                  <li key={i}>
                    <a
                      href={ds.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-teal-600 hover:text-teal-800 underline underline-offset-2 transition-colors"
                    >
                      {ds.name} ({ds.fileSizeLabel})
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-bold text-graphite-900 font-display">Caractéristiques techniques</h2>
          <ProductSpecsTable specs={product.specs} />
        </section>

        {(product.certifications.length > 0 || product.compatibility.length > 0) && (
          <div className="grid gap-6 sm:grid-cols-2">
            {product.certifications.length > 0 && (
              <div className="rounded-lg border border-graphite-200 p-4">
                <h3 className="mb-2 text-sm font-semibold text-graphite-900">Certifications</h3>
                <ul className="space-y-1">
                  {product.certifications.map((cert) => (
                    <li key={cert} className="text-sm text-graphite-600">
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.compatibility.length > 0 && (
              <div className="rounded-lg border border-graphite-200 p-4">
                <h3 className="mb-2 text-sm font-semibold text-graphite-900">Compatibilité</h3>
                <ul className="space-y-1">
                  {product.compatibility.map((comp) => (
                    <li key={comp} className="text-sm text-graphite-600">
                      {comp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {product.fullDescription && (
          <section>
            <h2 className="mb-3 text-xl font-bold text-graphite-900 font-display">Description</h2>
            <p className="text-sm text-graphite-700 leading-relaxed whitespace-pre-line">
              {product.fullDescription}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
