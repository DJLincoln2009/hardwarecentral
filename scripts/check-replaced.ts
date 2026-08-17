import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DuplicateEntry {
  brand: string;
  id: string;
  sku: string;
  oldUrl: string;
}

async function main() {
  const data: DuplicateEntry[] = JSON.parse(
    await readFile(path.resolve(__dirname, 'reports', 'duplicate-images.json'), 'utf-8'),
  );

  let alreadyReplaced = 0;
  let stillOld = 0;

  for (const entry of data) {
    const filePath = path.resolve(__dirname, '..', 'src', 'lib', 'data', 'products', `${entry.brand}.ts`);
    const content = await readFile(filePath, 'utf-8');

    const escapedId = entry.id.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const idPattern = new RegExp(`id: '${escapedId}'`);
    const idMatch = content.match(idPattern);

    if (!idMatch) {
      console.log(`NOT FOUND: ${entry.id}`);
      continue;
    }

    const startIdx = idMatch.index!;
    const rest = content.slice(startIdx, startIdx + 2000);

    const hasNewUrl = rest.includes(`/products/${entry.id}/images/`);

    if (hasNewUrl) {
      alreadyReplaced++;
      console.log(`ALREADY DONE: ${entry.id}`);
    } else {
      stillOld++;
      console.log(`NEEDS UPDATE: ${entry.id}`);
    }
  }

  console.log(`\nSummary: ${alreadyReplaced} already replaced, ${stillOld} still need update`);
}

main().catch(console.error);
