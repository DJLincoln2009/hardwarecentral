import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { products } from '../src/lib/data/products';
import type { Product, MediaAsset } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ------------------------------------------------------------------ */
/*  Brand colour / product-type-icon map                               */
/* ------------------------------------------------------------------ */
const BRAND_STYLES: Record<string, { colour: string; label: string }> = {
  HPE: { colour: '#01A982', label: 'HPE' },
  HP: { colour: '#0096D6', label: 'HP' },
  DELL: { colour: '#007DB8', label: 'Dell' },
  FORTINET: { colour: '#EE3124', label: 'Fortinet' },
  CISCO: { colour: '#1BA0D7', label: 'Cisco' },
  HUAWEI: { colour: '#CF0A2C', label: 'Huawei' },
  HIKVISION: { colour: '#00A3E0', label: 'Hikvision' },
};

const CATEGORY_ICONS: Record<string, string> = {
  'server-storage':
    'M80,60 L160,60 L160,140 L80,140 Z M100,80 L140,80 M100,100 L140,100 M100,120 L120,120',
  networking:
    'M60,100 L100,60 L140,60 L180,100 L140,140 L100,140 Z M80,100 L120,100 L120,120 M160,100 L140,100',
  security:
    'M120,50 L180,70 L180,130 Q180,170 120,190 Q60,170 60,130 L60,70 Z M120,110 A10,10 0 1,0 120,130 A10,10 0 1,0 120,110',
  cctv: 'M80,70 L160,70 L160,130 L80,130 Z M120,85 A15,15 0 1,1 120,115 A15,15 0 1,1 120,85 M170,100 L190,80 L190,120 Z',
  laptop:
    'M60,80 L180,80 L180,140 L60,140 Z M90,140 L90,160 L150,160 L150,140 M60,160 L180,160',
  datacenter:
    'M60,50 L180,50 L180,190 L60,190 Z M80,70 L160,70 M80,90 L160,90 M80,110 L160,110 M80,130 L160,130 M80,150 L160,150',
  wireless:
    'M120,50 A40,40 0 0,1 180,90 M120,70 A20,20 0 0,1 160,90 M130,90 L100,170 L140,170 L120,130 L150,170 L110,170',
  monitor:
    'M60,60 L180,60 L180,140 L60,140 Z M90,140 L90,170 L150,170 L150,140 M50,170 L190,170',
  printers:
    'M70,100 L170,100 L170,150 L70,150 Z M80,150 L80,170 L160,170 L160,150 M90,80 L150,80 L150,100 L90,100 Z M130,120 A8,8 0 1,1 130,136 A8,8 0 1,1 130,120',
};

function generatePlaceholderSVG(product: Product): string {
  const style = BRAND_STYLES[product.brand] ?? { colour: '#666666', label: product.brand };
  const iconPath = CATEGORY_ICONS[product.category] ?? CATEGORY_ICONS['server-storage'];
  const escapedName = product.name
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FAFAFA"/>
      <stop offset="100%" stop-color="#F0F0F0"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <rect x="20" y="20" width="560" height="560" rx="12" fill="none" stroke="${style.colour}" stroke-width="2" stroke-dasharray="8,4" opacity="0.3"/>
  <g transform="translate(300,200)" fill="none" stroke="${style.colour}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    ${iconPath}
  </g>
  <rect x="200" y="340" width="200" height="40" rx="20" fill="${style.colour}" opacity="0.12"/>
  <text x="300" y="368" text-anchor="middle" font-family="IBM Plex Sans, system-ui, sans-serif" font-size="18" font-weight="600" fill="${style.colour}">${style.label}</text>
  <text x="300" y="420" text-anchor="middle" font-family="IBM Plex Sans, system-ui, sans-serif" font-size="13" fill="#888780">${escapedName}</text>
  <text x="300" y="455" text-anchor="middle" font-family="IBM Plex Sans, system-ui, sans-serif" font-size="11" fill="#B0AFA6">Image non disponible</text>
</svg>`;
}

/* ------------------------------------------------------------------ */
/*  Real images already on ImageKit                                    */
/* ------------------------------------------------------------------ */
const REAL_IMAGES: Record<string, string> = {};

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */
const BRANDED_DIR = resolve(__dirname, '..', 'public', 'assets', 'images', 'branded');
if (!existsSync(BRANDED_DIR)) {
  mkdirSync(BRANDED_DIR, { recursive: true });
}

interface ImageEntry {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  asin?: string;
  imageSource: 'real' | 'placeholder';
  primaryImage: MediaAsset;
}

const entries: ImageEntry[] = [];

for (const product of products) {
  const isReal = product.id in REAL_IMAGES;
  const imageSource: 'real' | 'placeholder' = isReal ? 'real' : 'placeholder';

  let url: string;
  let checksum: string;
  const sourceProvider = isReal ? 'amazon-scraper' as const : 'branded-placeholder' as const;
  const fetchedAt = new Date().toISOString();

  if (isReal) {
    url = REAL_IMAGES[product.id];
    checksum = createHash('sha256').update(url).digest('hex');
  } else {
    const svgContent = generatePlaceholderSVG(product);
    const filename = `${product.id}.svg`;
    const filepath = resolve(BRANDED_DIR, filename);
    writeFileSync(filepath, svgContent, 'utf-8');
    url = `/assets/images/branded/${filename}`;
    checksum = createHash('sha256').update(svgContent).digest('hex');
  }

  entries.push({
    productId: product.id,
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    category: product.category,
    asin: product.asin,
    imageSource,
    primaryImage: {
      url,
      alt: product.name,
      width: 600,
      height: 600,
      imageSource,
      provenance: {
        sourceProvider,
        sourceUrl: isReal ? REAL_IMAGES[product.id] : null,
        sourceIdentifier: isReal ? product.asin ?? null : null,
        fetchedAt,
        checksum,
      },
    },
  });
}

/* ---- Report ---- */
console.log('=== Rapport de génération d\'images ===\n');

let realCount = 0;
let placeholderCount = 0;
for (const e of entries) {
  if (e.imageSource === 'real') realCount++;
  else placeholderCount++;
  console.log(`${e.sku.padEnd(25)} | ${e.imageSource.padEnd(11)} | ${e.primaryImage.url}`);
}

console.log('\n--- Résumé ---');
console.log(`Total produits: ${entries.length}`);
console.log(`Images réelles:  ${realCount}`);
console.log(`Placeholders:    ${placeholderCount}`);
console.log(`Couverture:      ${((realCount / entries.length) * 100).toFixed(1)}%`);

const brandSummary: Record<string, { real: number; total: number }> = {};
for (const e of entries) {
  if (!brandSummary[e.brand]) brandSummary[e.brand] = { real: 0, total: 0 };
  brandSummary[e.brand].total++;
  if (e.imageSource === 'real') brandSummary[e.brand].real++;
}
console.log('\n--- Par marque ---');
for (const [brand, stats] of Object.entries(brandSummary)) {
  console.log(`${brand.padEnd(12)} ${stats.real}/${stats.total} réelles (${((stats.real / stats.total) * 100).toFixed(0)}%)`);
}

/* ---- Save mapping for product data update ---- */
const reportPath = resolve(__dirname, '..', 'image-mapping-report.json');
writeFileSync(reportPath, JSON.stringify(entries, null, 2), 'utf-8');
console.log(`\nMapping sauvegardé: ${reportPath}`);
