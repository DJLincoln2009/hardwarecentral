import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { readdirSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT ?? 'https://ik.imagekit.io/3sihhe4l4';

const srcRoot = path.resolve(__dirname, '..', 'src');
const auth = Buffer.from(`${privateKey ?? ''}:`).toString('base64');

interface ImageKitFile {
  fileId: string;
  name: string;
  filePath: string;
}

function stripQuery(url: string): string {
  return url.split('?')[0];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractReferencedPaths(): Set<string> {
  const referenced = new Set<string>();
  const prefix = escapeRegExp(`${urlEndpoint}/`);
  const pattern = new RegExp(`${prefix}([^'"\`)\\s]+)`, 'g');
  const stack = [srcRoot];
  while (stack.length > 0) {
    const dir = stack.pop() as string;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') stack.push(full);
        continue;
      }
      if (!/\.(ts|tsx|js|css)$/.test(entry.name)) continue;
      const content = readFileSync(full, 'utf8');
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(content)) !== null) {
        referenced.add('/' + stripQuery(m[1]));
      }
    }
  }
  return referenced;
}

async function listAllFiles(): Promise<ImageKitFile[]> {
  const files: ImageKitFile[] = [];
  let skip = 0;
  const limit = 1000;
  for (;;) {
    const res = await fetch(
      `https://api.imagekit.io/v1/files?limit=${limit}&skip=${skip}`,
      { headers: { Authorization: `Basic ${auth}` } },
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ImageKit list failed: ${res.status} ${err}`);
    }
    const page = (await res.json()) as ImageKitFile[];
    files.push(...page);
    if (page.length < limit) break;
    skip += limit;
  }
  return files;
}

async function deleteFiles(fileIds: string[]): Promise<void> {
  for (let i = 0; i < fileIds.length; i += 200) {
    const batch = fileIds.slice(i, i + 200);
    const res = await fetch(
      `https://api.imagekit.io/v1/files/${encodeURIComponent(batch.join(','))}`,
      { method: 'DELETE', headers: { Authorization: `Basic ${auth}` } },
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ImageKit delete failed (${res.status}): ${err}`);
    }
  }
}

async function run() {
  const shouldDelete = process.argv.includes('--delete');

  if (!privateKey) {
    console.error('ERREUR: IMAGEKIT_PRIVATE_KEY non définie dans .env.local');
    process.exit(1);
  }

  const referenced = extractReferencedPaths();
  console.log(`URLs référencées dans src/: ${referenced.size}`);

  const files = await listAllFiles();
  console.log(`Fichiers présents sur ImageKit: ${files.length}`);

  const unused = files.filter((f) => !referenced.has(f.filePath));
  const used = files.length - unused.length;

  console.log(`Référencés: ${used} · Non référencés: ${unused.length}`);
  if (unused.length > 0) {
    console.log('\nFichiers non référencés (candidats à la suppression):');
    for (const f of unused) {
      console.log(`  ${f.filePath}  [${f.fileId}]`);
    }
  }

  if (!shouldDelete) {
    console.log('\nMode rapport (dry-run) — relancez avec --delete pour supprimer.');
    return;
  }

  if (unused.length === 0) {
    console.log('Rien à supprimer.');
    return;
  }

  await deleteFiles(unused.map((f) => f.fileId));
  console.log(`\nSupprimés: ${unused.length} fichier(s) non référencé(s).`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
