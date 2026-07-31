import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getProductById } from '@/lib/data/products';
import { getBrandByCode } from '@/lib/data/brands';
import { SITE_CONFIG } from '@/lib/site-config';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${SITE_CONFIG.companyName} — fiche produit`;

interface Props {
  params: Promise<{ slug: string }>;
}

async function loadFont(fileName: string): Promise<ArrayBuffer> {
  const data = await readFile(path.join(process.cwd(), 'public', 'fonts', fileName));
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

export default async function OpengraphImage({ params }: Props) {
  const { slug } = await params;
  const product = getProductById(slug);
  const brand = product ? getBrandByCode(product.brand) : undefined;
  const brandName = brand?.name ?? product?.brand ?? SITE_CONFIG.companyName;

  const [
    sansSemiBoldExt,
    sansSemiBold,
    sansBoldExt,
    sansBold,
    monoSemiBoldExt,
    monoSemiBold,
  ] = await Promise.all([
    loadFont('IBMPlexSans-SemiBold-latin-ext.woff'),
    loadFont('IBMPlexSans-SemiBold.woff'),
    loadFont('IBMPlexSans-Bold-latin-ext.woff'),
    loadFont('IBMPlexSans-Bold.woff'),
    loadFont('IBMPlexMono-SemiBold-latin-ext.woff'),
    loadFont('IBMPlexMono-SemiBold.woff'),
  ]);

  const fonts = [
    { name: 'IBMPlexSans', data: sansSemiBoldExt, weight: 600 as const },
    { name: 'IBMPlexSans', data: sansSemiBold, weight: 600 as const },
    { name: 'IBMPlexSansBold', data: sansBoldExt, weight: 700 as const },
    { name: 'IBMPlexSansBold', data: sansBold, weight: 700 as const },
    { name: 'IBMPlexMono', data: monoSemiBoldExt, weight: 600 as const },
    { name: 'IBMPlexMono', data: monoSemiBold, weight: 600 as const },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#ffffff',
          fontFamily: 'IBMPlexSans, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            padding: '64px 72px',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', width: '14px', height: '14px', backgroundColor: '#0F6E56', borderRadius: '9999px' }} />
            <div style={{ display: 'flex', fontSize: '28px', fontWeight: 700, color: '#2C2C2A' }}>
              HardwareCentral
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '1000px' }}>
            <div
              style={{
                display: 'flex',
                fontSize: '30px',
                fontWeight: 600,
                color: '#0F6E56',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '16px',
              }}
            >
              {brandName}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '64px',
                fontWeight: 700,
                color: '#2C2C2A',
                lineHeight: 1.1,
                marginBottom: '24px',
              }}
            >
              {product?.name ?? SITE_CONFIG.companyName}
            </div>
            {product && (
              <div
                style={{
                  display: 'flex',
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#5F5E5A',
                  fontFamily: 'IBMPlexMono',
                }}
              >
                {`SKU: ${product.sku}`}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '8px',
              backgroundColor: '#0F6E56',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    },
  );
}
