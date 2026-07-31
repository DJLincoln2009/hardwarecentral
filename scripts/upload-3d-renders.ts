import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

import { products } from '../src/lib/data/products';

interface UploadReport {
  slug: string;
  productId: string | null;
  status: 'ok' | 'missing-render' | 'unknown-product' | 'error';
  url?: string;
  checksum?: string;
  error?: string;
  proposal?: string;
}

function renderPath(slug: string): string {
  return path.resolve(__dirname, '..', '3d-pipeline', 'outputs', `${slug}_v1.png`);
}

async function run(slug: string) {
  const config = {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY ?? '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT ?? 'https://ik.imagekit.io/3sihhe4l4',
  };

  if (!config.privateKey) {
    console.error('ERREUR: IMAGEKIT_PRIVATE_KEY non définie dans .env.local');
    process.exit(1);
  }

  const product = products.find((p) => p.id === slug);
  const entry: UploadReport = {
    slug,
    productId: product ? product.id : null,
    status: 'unknown-product',
  };

  if (!product) {
    console.error(`Produit inconnu: ${slug}`);
    console.log(JSON.stringify([entry], null, 2));
    process.exit(1);
  }

  const file = renderPath(slug);
  let buffer: Buffer;
  try {
    buffer = await readFile(file);
  } catch {
    entry.status = 'missing-render';
    console.error(`Rendu introuvable: ${file}`);
    console.log(JSON.stringify([entry], null, 2));
    process.exit(1);
  }

  const b64 = buffer.toString('base64');
  const formData = new URLSearchParams();
  formData.set('file', b64);
  formData.set('fileName', `products/${product.id}/images/3d-${slug}-v1.png`);
  formData.set('useUniqueFileName', 'false');
  formData.set('folder', `/products/${product.id}/images`);

  const auth = Buffer.from(`${config.privateKey}:`).toString('base64');
  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    entry.status = 'error';
    entry.error = `ImageKit upload failed: ${res.status} ${err}`;
  } else {
    const data = await res.json();
    entry.status = 'ok';
    entry.url = data.url;
    entry.checksum = createHash('sha256').update(buffer).digest('hex');
    entry.proposal =
      `Ajouter en gallery de '${product.id}': ` +
      `{ url: '${data.url}', alt: 'Rendu 3D de ${product.name}', ` +
      `width: 512, height: 512, imageSource: 'ai-render', ` +
      `provenance: { sourceProvider: 'ai-3d-render', sourceUrl: null, ` +
      `sourceIdentifier: 'trellis-v1', fetchedAt: '${new Date().toISOString()}' } }`;
  }

  console.log(JSON.stringify([entry], null, 2));
}

const slugArg = process.argv[2];
if (!slugArg) {
  console.error('Usage: npx tsx scripts/upload-3d-renders.ts <slug>');
  process.exit(1);
}
run(slugArg).catch((e) => {
  console.error(e);
  process.exit(1);
});
