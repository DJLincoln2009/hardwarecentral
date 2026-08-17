import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { createHash } from 'crypto';
import { readFile, writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

interface MonitorImage {
  sku: string;
  sourceUrl: string;
  ext: string;
}

const MONITORS: MonitorImage[] = [
  {
    sku: '210-AXDG',
    sourceUrl: 'https://i.dell.com/is/image/DellContent//content/dam/ss2/product-images/peripherals/output-devices/dell/monitors/p-series/p2419h/spi/storm/monitor-p2419h-relsize-500-ng.jpg?fmt=jpg',
    ext: 'jpg',
  },
  {
    sku: '210-ASCN',
    sourceUrl: 'https://i.dell.com/is/image/DellContent//content/dam/ss2/product-images/peripherals/output-devices/dell/monitors/u-series/u2419hc/global-spi/monitor-u2419hc-relsize-500-ng.psd?fmt=jpg',
    ext: 'jpg',
  },
  {
    sku: '210-AVVF',
    sourceUrl: 'https://i.dell.com/is/image/DellContent//content/dam/ss2/product-images/peripherals/output-devices/dell/monitors/p2719h/spi/monitor-p2719h-relsize-500-ng.psd?fmt=png-alpha',
    ext: 'png',
  },
  {
    sku: '210-BNKF',
    sourceUrl: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/u-series/u2723qe/media-gallery/monitor-u2723qe-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=804&wid=1346&qlt=100,1&resMode=sharp2&size=1346,804&chrss=full',
    ext: 'png',
  },
  {
    sku: '3ML60AA',
    sourceUrl: 'https://hp.widen.net/content/viksla2gfo/png/viksla2gfo.png?w=400&h=400&dpi=72&color=ffffff00',
    ext: 'png',
  },
  {
    sku: '3ML63AA',
    sourceUrl: 'https://hp.widen.net/content/voqtwdzrse/png/voqtwdzrse.png?w=400&h=400&dpi=72&color=ffffff00',
    ext: 'png',
  },
  {
    sku: '1AA81A4',
    sourceUrl: 'https://hp.widen.net/content/y9v5k9se9d/png/y9v5k9se9d.png?w=400&h=400&dpi=72&color=ffffff00',
    ext: 'png',
  },
];

interface ReportEntry {
  sku: string;
  status: 'ok' | 'error';
  imageKitUrl?: string;
  checksum?: string;
  error?: string;
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function uploadToImageKit(
  privateKey: string,
  productId: string,
  filename: string,
  buffer: Buffer,
): Promise<{ url: string; checksum: string }> {
  const b64 = buffer.toString('base64');
  const formData = new URLSearchParams();
  formData.set('file', b64);
  formData.set('fileName', `products/${productId}/images/${filename}`);
  formData.set('useUniqueFileName', 'false');
  formData.set('folder', `/products/${productId}/images`);

  const auth = Buffer.from(`${privateKey}:`).toString('base64');
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
    throw new Error(`ImageKit upload failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const checksum = createHash('sha256').update(buffer).digest('hex');
  return { url: data.url as string, checksum };
}

function getProductId(sku: string): string {
  const map: Record<string, string> = {
    '210-AXDG': 'dell-210-axdg',
    '210-ASCN': 'dell-210-ascn',
    '210-AVVF': 'dell-210-avvf',
    '210-BNKF': 'dell-210-bnkf',
    '3ML60AA': 'hp-3ml60aa',
    '3ML63AA': 'hp-3ml63aa',
    '1AA81A4': 'hp-1aa81a4',
  };
  return map[sku] ?? `unknown-${sku}`;
}

function getFilePath(sku: string): string {
  if (sku.startsWith('210-')) {
    return path.resolve(__dirname, '..', 'src', 'lib', 'data', 'products', 'dell.ts');
  }
  return path.resolve(__dirname, '..', 'src', 'lib', 'data', 'products', 'hp.ts');
}

function getAltText(sku: string): string {
  const alts: Record<string, string> = {
    '210-AXDG': 'Dell P2419H 24-inch 1920x1080 FHD 16:9 60Hz 5ms IPS LED Monitor',
    '210-ASCN': 'Dell U2419HC 24-inch 1920x1080 FHD IPS USB-C Hub Monitor',
    '210-AVVF': 'Dell P2719H 27-inch 1920x1080 FHD 16:9 60Hz 8ms IPS LED Monitor',
    '210-BNKF': 'Dell U2723QE 27-inch 3840x2160 4K IPS USB-C Hub Monitor',
    '3ML60AA': 'HP E243m 24-inch 1920x1080 FHD IPS LED Monitor',
    '3ML63AA': 'HP E273m 27-inch 1920x1080 FHD IPS LED Monitor',
    '1AA81A4': 'HP Z32 32-inch 3840x2160 4K UHD IPS LED Monitor',
  };
  return alts[sku] ?? `Monitor ${sku}`;
}

async function updateProductFile(
  filePath: string,
  sku: string,
  imageKitUrl: string,
  checksum: string,
): Promise<void> {
  const content = await readFile(filePath, 'utf-8');

  // Find the product block by SKU and replace the placeholder primaryImage
  const skuPattern = new RegExp(
    `(id: '${getProductId(sku)}'[\\s\\S]*?sku: '${sku}'[\\s\\S]*?primaryImage:\\s*\\{[\\s\\S]*?)` +
    `url: 'https://ik\\.imagekit\\.io/3sihhe4l4/products/[^']+',` +
    `[\\s\\S]*?alt: '[^']+',` +
    `[\\s\\S]*?width: \\d+,` +
    `[\\s\\S]*?height: \\d+,` +
    `[\\s\\S]*?imageSource: 'placeholder',` +
    `[\\s\\S]*?provenance:\\s*\\{[\\s\\S]*?sourceProvider: 'branded-placeholder',[\\s\\S]*?sourceUrl: null,[\\s\\S]*?sourceIdentifier: null,[\\s\\S]*?fetchedAt: '[^']+',[\\s\\S]*?checksum: 'placeholder-[^']+',` +
    `[\\s\\S]*?\\},`,
  );

  const replacement =
    `url: '${imageKitUrl}',\n` +
    `      alt: '${getAltText(sku)}',\n` +
    `      width: 800,\n` +
    `      height: 800,\n` +
    `      imageSource: 'real',\n` +
    `      provenance: {\n` +
    `        sourceProvider: 'retailer-scrape',\n` +
    `        sourceUrl: '${MONITORS.find((m) => m.sku === sku)?.sourceUrl ?? ''}',\n` +
    `        sourceIdentifier: '${MONITORS.find((m) => m.sku === sku)?.sourceUrl ?? ''}',\n` +
    `        fetchedAt: '${new Date().toISOString()}',\n` +
    `        checksum: '${checksum}',\n` +
    `      },`;

  const newContent = content.replace(skuPattern, `$1${replacement}`);
  if (newContent === content) {
    throw new Error(`Failed to match placeholder for SKU ${sku} in ${filePath}`);
  }
  await writeFile(filePath, newContent, 'utf-8');
}

async function main() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    console.error('ERREUR: IMAGEKIT_PRIVATE_KEY non définie dans .env.local');
    process.exit(1);
  }

  const report: ReportEntry[] = [];

  for (const monitor of MONITORS) {
    const productId = getProductId(monitor.sku);
    console.log(`\n[${monitor.sku}] Downloading from ${monitor.sourceUrl.slice(0, 80)}...`);

    let buffer: Buffer;
    try {
      buffer = await downloadImage(monitor.sourceUrl);
      console.log(`  Downloaded ${(buffer.length / 1024).toFixed(1)} KB`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`  FAILED download: ${msg}`);
      report.push({ sku: monitor.sku, status: 'error', error: msg });
      continue;
    }

    const filename = `${monitor.sku}__0.${monitor.ext}`;
    console.log(`  Uploading ${filename} to ImageKit...`);

    let imageKitUrl: string;
    let checksum: string;
    try {
      const result = await uploadToImageKit(privateKey, productId, filename, buffer);
      imageKitUrl = result.url;
      checksum = result.checksum;
      console.log(`  Uploaded: ${imageKitUrl}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`  FAILED upload: ${msg}`);
      report.push({ sku: monitor.sku, status: 'error', error: msg });
      continue;
    }

    const filePath = getFilePath(monitor.sku);
    console.log(`  Updating ${path.basename(filePath)}...`);
    try {
      await updateProductFile(filePath, monitor.sku, imageKitUrl, checksum);
      console.log(`  Updated product file`);
      report.push({ sku: monitor.sku, status: 'ok', imageKitUrl, checksum });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`  FAILED file update: ${msg}`);
      report.push({ sku: monitor.sku, status: 'error', error: msg });
    }
  }

  const reportPath = path.resolve(__dirname, 'reports', `fetch-monitor-images-${Date.now()}.json`);
  await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nReport written to ${reportPath}`);

  const ok = report.filter((r) => r.status === 'ok').length;
  const fail = report.filter((r) => r.status === 'error').length;
  console.log(`\nDone: ${ok} succeeded, ${fail} failed`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
