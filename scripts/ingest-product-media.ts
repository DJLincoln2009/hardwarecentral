import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

import { createAmazonScraperClient } from '../src/lib/amazon-scraper-client';
import { createIcecatClient } from '../src/lib/icecat-client';
import { createMediaStorage } from '../src/lib/media-storage';
import { products } from '../src/lib/data/products';

interface SyncReport {
  productId: string;
  sku: string;
  name: string;
  asin?: string;
  images: { status: 'ok' | 'missing' | 'error'; url?: string; error?: string }[];
  datasheets: { status: 'ok' | 'missing' | 'error'; url?: string; error?: string }[];
}

async function run() {
  console.log('=== Pipeline d\'ingestion HardwareCentral ===\n');

  const config = {
    amazonScraperUrl: process.env.AMAZON_SCRAPER_URL ?? 'http://127.0.0.1:8000',
    imageKit: {
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY ?? '***REMOVED***',
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT ?? 'https://ik.imagekit.io/3sihhe4l4',
    },
    icecat: {
      username: process.env.ICECAT_USERNAME ?? '***REMOVED***',
      password: process.env.ICECAT_PASSWORD ?? '***REMOVED***',
    },
  };

  if (!config.imageKit.privateKey) {
    console.error('ERREUR: IMAGEKIT_PRIVATE_KEY non définie dans .env.local');
    process.exit(1);
  }

  const amazonClient = createAmazonScraperClient({ baseUrl: config.amazonScraperUrl });
  const icecatClient = createIcecatClient(config.icecat);
  const storage = createMediaStorage(config.imageKit);

  const report: SyncReport[] = [];

  for (const product of products) {
    console.log(`\n--- ${product.sku} — ${product.name} ---`);
    const entry: SyncReport = {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      images: [],
      datasheets: [],
    };

    if (product.asin) {
      console.log(`  ASIN configuré: ${product.asin}`);
    }

    if (product.asin) {
      entry.asin = product.asin;
      try {
        const data = await amazonClient.fetchProduct(product.asin);
        if (data && data.images.length > 0) {
          console.log(`  Images trouvées: ${data.images.length}`);
          for (const img of data.images.slice(0, 1)) {
            try {
              const res = await fetch(img.url);
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const buffer = Buffer.from(await res.arrayBuffer());
              const uploaded = await storage.uploadImage(product.id, 'primary.webp', buffer);
              entry.images.push({ status: 'ok', url: uploaded.url });
              console.log(`  ✓ Image uploadée: ${uploaded.url}`);
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              entry.images.push({ status: 'error', error: msg });
              console.error(`  ✗ Échec image: ${msg}`);
            }
          }
        } else {
          entry.images.push({ status: 'missing', error: 'Aucune image retournée par le scraper' });
          console.log('  ⚠ Aucune image trouvée');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        entry.images.push({ status: 'error', error: msg });
        console.error(`  ✗ Erreur scraping: ${msg}`);
      }
    } else {
      entry.images.push({ status: 'missing', error: 'ASIN non résolu' });
      console.log('  ⚠ ASIN non résolu');
    }

    try {
      const datasheets = await icecatClient.fetchDatasheets(product.brand, product.sku);
      if (datasheets.length > 0) {
        for (const ds of datasheets) {
          entry.datasheets.push({ status: 'ok', url: ds.pdfUrl });
          console.log(`  ✓ Datasheet: ${ds.pdfUrl}`);
        }
      } else {
        entry.datasheets.push({ status: 'missing', error: 'Aucune datasheet trouvée sur Icecat' });
        console.log('  ⚠ Aucune datasheet Icecat');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      entry.datasheets.push({ status: 'error', error: msg });
      console.error(`  ✗ Erreur Icecat: ${msg}`);
    }

    report.push(entry);
  }

  console.log('\n========================================');
  console.log('RAPPORT DE SYNCHRONISATION');
  console.log('========================================\n');
  for (const entry of report) {
    console.log(`${entry.sku} — ${entry.name}`);
    console.log(`  ASIN: ${entry.asin ?? 'N/A'}`);
    console.log(`  Images: ${entry.images.map((i) => i.status).join(', ')}`);
    console.log(`  Datasheets: ${entry.datasheets.map((d) => d.status).join(', ')}`);
  }

  const totalImages = report.reduce((s, r) => s + r.images.length, 0);
  const okImages = report.reduce((s, r) => s + r.images.filter((i) => i.status === 'ok').length, 0);
  const totalDatasheets = report.reduce((s, r) => s + r.datasheets.length, 0);
  const okDatasheets = report.reduce(
    (s, r) => s + r.datasheets.filter((d) => d.status === 'ok').length,
    0,
  );

  console.log('\n--- Résumé ---');
  console.log(`Images: ${okImages}/${totalImages} OK`);
  console.log(`Datasheets: ${okDatasheets}/${totalDatasheets} OK`);
  console.log(`\n⚠ Ce rapport doit être relu par un humain avant commit dans products.ts`);
}

run().catch((err) => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
