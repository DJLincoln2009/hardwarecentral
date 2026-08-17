import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { createHash } from 'crypto';
import { readFile, writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const IMAGE_SOURCES_PATH = path.resolve(__dirname, 'image-sources.json');

interface DuplicateEntry {
  brand: string;
  id: string;
  sku: string;
  name: string;
  oldUrl: string;
  checksum: string;
  keepImage: string;
}

interface ReportEntry {
  brand: string;
  id: string;
  sku: string;
  status: 'ok' | 'no-source' | 'download-error' | 'upload-error' | 'file-error' | 'delete-error';
  newUrl?: string;
  error?: string;
}

function getImageKitPath(url: string): string | null {
  const match = url.match(/ik\.imagekit\.io\/3sihhe4l4\/(.+?)(?:\?|$)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (!res.ok) {
      console.log(`    HTTP ${res.status}`);
      return null;
    }
    const ct = res.headers.get('content-type') ?? '';
    const arrayBuf = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    if (buf.length < 500) {
      console.log(`    Trop petit (${buf.length} bytes)`);
      return null;
    }
    if (buf[0] === 0xFF || buf[0] === 0x89 || buf[0] === 0x50) return buf;
    console.log(`    Pas une image (first byte: 0x${buf[0].toString(16)}, content-type: ${ct})`);
    return null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`    Erreur download: ${msg}`);
    return null;
  }
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

async function deleteImageKitFile(privateKey: string, filePath: string): Promise<boolean> {
  try {
    const auth = Buffer.from(`${privateKey}:`).toString('base64');
    const encodedPath = encodeURIComponent(filePath);
    const res = await fetch(`https://upload.imagekit.io/api/v1/files?fileName=${encodedPath}`, {
      method: 'DELETE',
      headers: { Authorization: `Basic ${auth}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

function getFilePath(brand: string): string {
  return path.resolve(__dirname, '..', 'src', 'lib', 'data', 'products', `${brand}.ts`);
}

async function updateProductFile(
  filePath: string,
  productId: string,
  newImageUrl: string,
  newChecksum: string,
  sourceUrl: string,
): Promise<void> {
  let content = await readFile(filePath, 'utf-8');

  const altText = productId.replace(/-/g, ' ');
  const now = new Date().toISOString();

  const escapedId = productId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const idRegex = new RegExp(`id: '${escapedId}'`);
  const idMatch = content.match(idRegex);
  if (!idMatch) {
    throw new Error(`Product ID '${productId}' not found in file`);
  }
  const idIdx = idMatch.index!;

  const afterId = content.slice(idIdx);
  const piIdx = afterId.indexOf('primaryImage: {');
  if (piIdx === -1) {
    throw new Error(`primaryImage not found for '${productId}'`);
  }

  const absPiStart = idIdx + piIdx;
  const lines = content.split('\n');
  let piStartLine = -1;
  let charCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (charCount + lines[i].length >= absPiStart) {
      piStartLine = i;
      break;
    }
    charCount += lines[i].length + 1;
  }

  if (piStartLine === -1) {
    throw new Error(`Could not find primaryImage line for '${productId}'`);
  }

  let braceDepth = 0;
  let piEndLine = -1;
  for (let i = piStartLine; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }
    if (braceDepth === 0) {
      piEndLine = i;
      break;
    }
  }

  if (piEndLine === -1) {
    throw new Error(`Could not find end of primaryImage for '${productId}'`);
  }

  const newLines = [
    `    primaryImage: {`,
    `      url: '${newImageUrl}',`,
    `      alt: '${altText}',`,
    `      width: 500,`,
    `      height: 500,`,
    `      imageSource: 'real',`,
    `      provenance: {`,
    `        sourceProvider: 'retailer-scrape',`,
    `        sourceUrl: '${sourceUrl}',`,
    `        sourceIdentifier: '${sourceUrl}',`,
    `        fetchedAt: '${now}',`,
    `        checksum: '${newChecksum}',`,
    `      },`,
    `    },`,
  ];

  lines.splice(piStartLine, piEndLine - piStartLine + 1, ...newLines);

  const newContent = lines.join('\n');
  if (newContent === content) {
    throw new Error(`No changes made for ${productId}`);
  }
  await writeFile(filePath, newContent, 'utf-8');
}

async function main() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    console.error('ERREUR: IMAGEKIT_PRIVATE_KEY non définie');
    process.exit(1);
  }

  const IMAGE_SOURCES: Record<string, string | null> = JSON.parse(
    await readFile(IMAGE_SOURCES_PATH, 'utf-8'),
  );

  const data = JSON.parse(
    await readFile(path.resolve(__dirname, 'reports', 'duplicate-images.json'), 'utf-8'),
  ) as DuplicateEntry[];

  const report: ReportEntry[] = [];
  let processed = 0;

  for (const entry of data) {
    processed++;

    const filePath = getFilePath(entry.brand);
    const fileContent = await readFile(filePath, 'utf-8');
    const escapedId = entry.id.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const checkMatch = fileContent.match(new RegExp(`id: '${escapedId}'[\\s\\S]{0,2000}?url: '([^']+)'`));
    if (checkMatch && checkMatch[1].includes(`/products/${entry.id}/images/`)) {
      console.log(`\n[${processed}/${data.length}] [${entry.sku}] DÉJÀ REMPLACÉ — skip`);
      report.push({ brand: entry.brand, id: entry.id, sku: entry.sku, status: 'ok', newUrl: checkMatch[1] });
      continue;
    }

    console.log(`\n[${processed}/${data.length}] [${entry.sku}] ${entry.name.slice(0, 60)}`);

    const sourceUrl = IMAGE_SOURCES[entry.id] ?? null;
    if (!sourceUrl) {
      console.log('  Pas de source trouvée');
      report.push({ brand: entry.brand, id: entry.id, sku: entry.sku, status: 'no-source' });
      continue;
    }

    console.log(`  Source: ${sourceUrl.slice(0, 80)}...`);
    const buffer = await downloadImage(sourceUrl);

    if (!buffer) {
      console.log('  Image non accessible');
      report.push({ brand: entry.brand, id: entry.id, sku: entry.sku, status: 'download-error', error: 'Image not accessible' });
      continue;
    }

    console.log(`  Téléchargé: ${(buffer.length / 1024).toFixed(1)} KB`);

    const ext = sourceUrl.includes('.png') ? 'png' : 'jpg';
    const filename = `${entry.sku.replace(/[^a-zA-Z0-9-]/g, '_')}__0.${ext}`;

    try {
      const { url: newUrl, checksum } = await uploadToImageKit(privateKey, entry.id, filename, buffer);
      console.log(`  Uploadé: ${newUrl.slice(0, 80)}...`);

      const file = getFilePath(entry.brand);
      await updateProductFile(file, entry.id, newUrl, checksum, sourceUrl);
      console.log(`  Fichier mis à jour`);

      const oldPath = getImageKitPath(entry.oldUrl);
      if (oldPath) {
        const deleted = await deleteImageKitFile(privateKey, oldPath);
        console.log(`  Ancienne image ${deleted ? 'supprimée' : 'échec suppression'}`);
      }

      report.push({ brand: entry.brand, id: entry.id, sku: entry.sku, status: 'ok', newUrl });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`  ERREUR: ${msg}`);
      report.push({ brand: entry.brand, id: entry.id, sku: entry.sku, status: 'upload-error', error: msg });
    }
  }

  const reportPath = path.resolve(__dirname, 'reports', `fix-duplicates-${Date.now()}.json`);
  await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nRapport: ${reportPath}`);

  const ok = report.filter((r) => r.status === 'ok').length;
  const noSrc = report.filter((r) => r.status === 'no-source').length;
  const fail = report.filter((r) => r.status !== 'ok' && r.status !== 'no-source').length;
  console.log(`\nTerminé: ${ok} remplacés, ${noSrc} sans source, ${fail} échoués`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
