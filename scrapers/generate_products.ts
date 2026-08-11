/**
 * Genere les fichiers src/lib/data/products/<brand>.ts a partir de catalog-media.json.
 *
 * Lecture  : catalog-media.json (sortie de upload_images.py)
 * Sortie   : src/lib/data/products/{hpe,hp,dell,fortinet,cisco,huawei,hikvision}.ts
 *
 * Regles :
 * - name conserve en anglais (source), descriptions/specs generes en francais.
 * - statut "on-order" partout, leadTimeDays 21, aucune garantie.
 * - provenance retailer-scrape (images uploadees sur ImageKit).
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BRAND_FR: Record<string, string> = {
  HPE: 'Hewlett Packard Enterprise',
  HP: 'HP Inc.',
  DELL: 'Dell Technologies',
  FORTINET: 'Fortinet',
  CISCO: 'Cisco',
  HUAWEI: 'Huawei',
  HIKVISION: 'Hikvision',
};

const CATEGORY_FR: Record<string, string> = {
  'server-storage': 'un serveur ou une solution de stockage de données',
  networking: 'un équipement réseau',
  security: 'une solution de sécurité réseau',
  cctv: 'une solution de vidéosurveillance',
  laptop: 'un ordinateur portable ou une station de travail',
  datacenter: "un composant d'infrastructure pour datacenter",
  wireless: 'un équipement réseau sans fil',
  monitor: 'un écran professionnel',
  printers: 'une imprimante ou une solution d’impression',
};

const FR_LABELS: Record<string, string> = {
  'Part No': 'Référence',
  Brand: 'Marque',
  'Country of Manufacture': 'Pays de fabrication',
  'Dimensions Height (inch)': 'Hauteur (pouces)',
  UPC: 'UPC',
  'Dimensions Length (inch)': 'Longueur (pouces)',
  'Dimensions Width (inch)': 'Largeur (pouces)',
  'GTIN-/EAN-Code': 'GTIN/EAN',
  'Switching Capacity': 'Capacité de commutation',
  Throughput: 'Débit',
  ASIN: 'ASIN',
  'Print Color': 'Couleur d’impression',
  'Paper Tray Capacity': 'Capacité du bac papier',
  Switches: 'Commutateurs',
  'Print Speed': 'Vitesse d’impression',
  'Form Factor': 'Facteur de forme',
  Memory: 'Mémoire',
  connectivity: 'Connectivité',
  duplex_printing: 'Impression recto-verso',
  market_positioning: 'Positionnement marché',
  max_print_size: 'Format d’impression maximal',
  print_technology: 'Technologie d’impression',
  'Port Count': 'Nombre de ports',
  document_feeder: 'Chargeur de documents',
  function: 'Fonction',
  output_colour: 'Couleur de sortie',
  screen_size_range: 'Taille d’écran',
  'PoE Power': 'Alimentation PoE',
  WiFi: 'Wi-Fi',
  'Total Number of Phone Lines': 'Nombre de lignes téléphoniques',
  'Display Color': 'Couleur d’affichage',
  'Product Series': 'Série',
  'Soft Keys': 'Touches programmables',
  Bluetooth: 'Bluetooth',
  DECT: 'DECT',
  'HD 720p Video': 'Vidéo HD 720p',
  'Voice Prompts': 'Invites vocales',
  'Smart Phone Integration': 'Intégration smartphone',
  'Network Ports': 'Ports réseau',
  'Power over Ethernet': 'Power over Ethernet',
  'Wall Mountable': 'Montage mural',
  'Power Supply': 'Alimentation',
  warranty: 'Garantie',
  display_resolution: 'Résolution d’affichage',
  amd_freesync: 'AMD FreeSync',
  display_brightness: 'Luminosité d’affichage',
  display_technology: 'Technologie d’affichage',
  height_adjustment: 'Réglage en hauteur',
  native_aspect_ratio: 'Format natif',
  nvidia_g_sync: 'NVIDIA G-Sync',
  panel_type: 'Type de dalle',
  pivot: 'Pivot',
  pixels: 'Pixels',
  refresh_rate_range: 'Taux de rafraîchissement',
  refresh_rate: 'Taux de rafraîchissement',
  resolution: 'Résolution',
  screen_shape: 'Forme de l’écran',
  screen_size: 'Taille de l’écran',
  Licence: 'Licence',
  cpu_speed: 'Vitesse du processeur',
  cpu_type: 'Type de processeur',
  ram: 'Mémoire vive (RAM)',
  operating_system_full: 'Système d’exploitation',
  'Storage Capacity': 'Capacité de stockage',
  'Uplink Ports': 'Ports de liaison montante',
  total_storage_capacity: 'Capacité de stockage totale',
  graphics_processor: 'Processeur graphique',
  Interface: 'Interface',
  cpu_cores: 'Nombre de cœurs',
  touchscreen: 'Écran tactile',
  Processors: 'Processeurs',
  'Processor Speed': 'Vitesse du processeur',
  'Processor Type': 'Type de processeur',
  Generation: 'Génération',
  Workload: 'Charge de travail',
  'Data Transfer Rate': 'Débit de transfert',
  'Product Type': 'Type de produit',
  'USB Port': 'Port USB',
  'Key Expansion Modules': 'Modules d’extension',
  Application: 'Application',
  Antennas: 'Antennes',
  'Storage Expansion': 'Extension de stockage',
  'Storage Controller': 'Contrôleur de stockage',
  'SAN Backup Support': 'Support sauvegarde SAN',
  'Insight Manager Support': 'Support Insight Manager',
  'Clustering Support': 'Support clustering',
  cpu_manufacturer: 'Fabricant du processeur',
  ssd_capacity: 'Capacité SSD',
  storage_type: 'Type de stockage',
  'Dual PCI Slots': 'Emplacements PCI doubles',
  'U Rack Type of Storage': 'Type de stockage rack (U)',
  'TB Power Supply': 'Alimentation (W)',
  Frequency: 'Fréquence',
  Ports: 'Ports',
  internal_storage_capacity: 'Capacité de stockage interne',
  product_line: 'Gamme',
  'Max Supported Storage': 'Stockage maximal pris en charge',
  'TB Maximum Supported Memory': 'Mémoire maximale prise en charge (To)',
  'Max Supported Memory': 'Mémoire maximale prise en charge',
  'CPU Speed': 'Vitesse du processeur',
  'Hard Disk Drive': 'Disque dur',
  'Temperature Operating': 'Température de fonctionnement',
  'Dual Form Factor': 'Double facteur de forme',
  'SSD Drive Type': 'Type de SSD',
  'Supported OS': 'Systèmes d’exploitation pris en charge',
  'Max Number Of Drives': 'Nombre maximal de disques',
  'DIMMS Slots': 'Emplacements DIMM',
  'AMD EPYC Form Factor': 'Facteur de forme AMD EPYC',
  'TB Maximum RAM': 'RAM maximale (To)',
  'Single No of Processors': 'Nombre de processeurs',
  'Type of Storage': 'Type de stockage',
  'DIMM Slots': 'Emplacements DIMM',
  Processor: 'Processeur',
  Security: 'Sécurité',
  'Modular Chassis Models': 'Modèles de châssis modulaire',
  'Max Storage': 'Stockage maximal',
  'Raid Controller': 'Contrôleur RAID',
  'RAM': 'Mémoire vive (RAM)',
  'Max Supported Memory Supported CPU': 'Mémoire maximale prise en charge',
};

const JUNK_LABEL_STARTS = [
  'uitable',
  'pport',
  'ection',
  'nd service',
  'aximum supported memory',
  'aided storage',
  'imensions',
];

// Produits mis en avant sur l'accueil (par SKU source)
const FEATURED_SKUS = new Set([
  'FC-10-0040F-950-02-36', // FortiGate 40F UTP
  'Catalyst 3850-48XS-F-E', // Cisco Catalyst 3850
  'P19779-B21', // HPE ProLiant DL360 Gen10
  '7KW64A', // HP Color LaserJet Pro M255dw
  'R7525', // Dell PowerEdge R7525
  'DS-2CD7A85G0-IZ(H)S', // Hikvision 4K DeepinView
  '98011343', // Huawei S5735-L48P4X-A1
  '1FH48AA', // HP EliteDisplay E243m
  'N001L541014EMEA', // Dell Latitude 5410
]);

const PRODUCT_OUT_DIR = resolve(__dirname, '../src/lib/data/products');

interface Spec {
  label: string;
  value: string;
}
interface Media {
  url: string;
  alt: string;
  width: number;
  height: number;
  imageSource: string;
  provenance: {
    sourceProvider: string;
    sourceUrl: string | null;
    sourceIdentifier: string | null;
    fetchedAt: string;
    checksum: string;
  };
}
interface CatalogRec {
  name: string;
  brand: string;
  sku: string;
  category: string;
  specs: Spec[];
  description?: string;
  source: string;
  source_url: string;
  media: Media[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function q(value: string): string {
  return (
    "'" +
    value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') +
    "'"
  );
}

function cleanSpecs(specs: Spec[]): Spec[] {
  const out: Spec[] = [];
  const seen = new Set<string>();
  for (const s of specs) {
    const label = s.label.trim().replace(/\s+/g, ' ');
    const value = s.value.trim().replace(/\s+/g, ' ');
    if (!label || !value) continue;
    if (label.length > 45) continue;
    if (JUNK_LABEL_STARTS.some((j) => label.startsWith(j))) continue;
    if (!/^[A-ZÀ-Þ0-9]/.test(label)) continue;
    if (seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    const fr = FR_LABELS[label] ?? label;
    out.push({ label: fr, value });
    if (out.length >= 8) break;
  }
  return out;
}

function inferFormFactor(rec: CatalogRec): string | undefined {
  const n = rec.name.toLowerCase();
  if (n.includes('tower')) return 'tower';
  if (
    n.includes('desktop') ||
    n.includes('mini') ||
    n.includes('compact') ||
    n.includes('all-in-one')
  ) {
    return 'desktop';
  }
  if (n.includes('rack') || n.includes('mount') || /(\d+u)\b/.test(n)) return 'rack';
  const byCat: Record<string, string> = {
    'server-storage': 'rack',
    networking: 'rack',
    security: 'appliance',
    datacenter: 'rack',
    wireless: 'desktop',
    monitor: 'desktop',
    printers: 'desktop',
    laptop: 'desktop',
    cctv: 'desktop',
  };
  return byCat[rec.category];
}

function inferChassis(rec: CatalogRec): string | undefined {
  const n = rec.name;
  const u = n.match(/\b([1-4])U\b/i);
  if (u) return `${u[1].toUpperCase()}U`;
  if (n.toLowerCase().includes('tower')) return 'Tower';
  if (n.toLowerCase().includes('mini')) return 'Compact';
  if (n.toLowerCase().includes('desktop')) return 'Desktop';
  return undefined;
}

function buildDescriptions(rec: CatalogRec): { short: string; full: string } {
  const brandFr = BRAND_FR[rec.brand] ?? rec.brand;
  const catFr = CATEGORY_FR[rec.category] ?? 'un équipement professionnel';
  const short = `Le ${rec.name} de ${brandFr} est ${catFr} destiné aux environnements professionnels.`;
  let full: string;
  if (rec.specs.length > 0) {
    const list = rec.specs
      .slice(0, 5)
      .map((s) => `${s.label} : ${s.value}`)
      .join(' ; ');
    full =
      `Le ${rec.name} de ${brandFr} est ${catFr} conçu pour répondre aux besoins des entreprises. ` +
      `Principales caractéristiques : ${list}. ` +
      `Ce produit est disponible sur commande ; contactez notre équipe commerciale pour un devis personnalisé.`;
  } else {
    full =
      `Le ${rec.name} de ${brandFr} est ${catFr} conçu pour répondre aux besoins des entreprises. ` +
      `Il est disponible sur commande et configurable selon vos besoins. ` +
      `Contactez notre équipe commerciale pour un devis personnalisé.`;
  }
  return { short, full };
}

function toProduct(rec: CatalogRec, id: string): unknown {
  const media = rec.media ?? [];
  const primary = media[0];
  if (!primary) {
    throw new Error(`produit sans media: ${rec.name}`);
  }
  const specs = cleanSpecs(rec.specs ?? []);
  const { short, full } = buildDescriptions({ ...rec, specs });
  const formFactor = inferFormFactor(rec);
  const chassis = inferChassis(rec);

  return {
    id,
    sku: rec.sku,
    name: rec.name,
    brand: rec.brand,
    category: rec.category,
    primaryImage: primary,
    gallery: media.slice(1),
    shortDescription: short,
    fullDescription: full,
    specs,
    attributes: {
      ...(chassis ? { chassisFormat: chassis } : {}),
      ...(formFactor ? { formFactor } : {}),
    },
    availability: { status: 'on-order', stockQuantity: 0, leadTimeDays: 21 },
    warranty: { durationLabel: 'Sans garantie' },
    certifications: [],
    compatibility: [],
    datasheets: [],
    isFeatured: FEATURED_SKUS.has(rec.sku),
    publishedAt: new Date().toISOString(),
  };
}

function emitValue(value: unknown, indent: number): string {
  const pad = '  '.repeat(indent);
  const childPad = '  '.repeat(indent + 1);
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return q(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((v) => `${childPad}${emitValue(v, indent + 1)},`);
    return `[\n${items.join('\n')}\n${pad}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== undefined,
    );
    if (entries.length === 0) return '{}';
    const lines = entries.map(([k, v]) => `${childPad}${k}: ${emitValue(v, indent + 1)},`);
    return `{\n${lines.join('\n')}\n${pad}}`;
  }
  return 'null';
}

function renderProduct(product: unknown): string {
  return emitValue(product, 1);
}

function main(): void {
  const input = process.argv[2] ?? join(__dirname, '..', 'catalog-media.json');
  const catalog = JSON.parse(readFileSync(input, 'utf-8')) as CatalogRec[];

  const byBrand = new Map<string, CatalogRec[]>();
  for (const rec of catalog) {
    if (!rec.media || rec.media.length === 0) {
      console.warn(`WARN sans media: ${rec.name}`);
      continue;
    }
    const list = byBrand.get(rec.brand) ?? [];
    list.push(rec);
    byBrand.set(rec.brand, list);
  }

  const usedIds = new Set<string>();
  mkdirSync(PRODUCT_OUT_DIR, { recursive: true });

  for (const [brand, recs] of byBrand) {
    const body: string[] = ["import type { Product } from '@/types';", ''];
    for (const rec of recs) {
      const base = `${brand.toLowerCase()}-${slugify(rec.sku) || slugify(rec.name)}`;
      let id = base;
      let n = 2;
      while (usedIds.has(id)) {
        id = `${base}-${n}`;
        n += 1;
      }
      usedIds.add(id);
      const product = renderProduct(toProduct(rec, id));
      body.push(`${product},`);
    }
    const content = `${body[0]}\n\n\nexport const ${brand.toLowerCase()}Products: Product[] = [\n${body
      .slice(1)
      .join('\n')}\n];\n`;
    const file = join(PRODUCT_OUT_DIR, `${brand.toLowerCase()}.ts`);
    writeFileSync(file, content, 'utf-8');
    console.log(`ecrit: ${file} (${recs.length} produits)`);
  }
  console.log(`total produits: ${usedIds.size}`);
}

main();
