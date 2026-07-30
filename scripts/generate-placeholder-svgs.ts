import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { products } from '../src/lib/data/products';

const BRAND_COLORS: Record<string, { primary: string; secondary: string; name: string }> = {
  HPE:       { primary: '#01A982', secondary: '#017E61', name: 'HPE' },
  DELL:      { primary: '#0076CE', secondary: '#005AA3', name: 'Dell Technologies' },
  FORTINET:  { primary: '#EE3124', secondary: '#C4281E', name: 'Fortinet' },
  CISCO:     { primary: '#049FD9', secondary: '#037DAE', name: 'Cisco' },
  HUAWEI:    { primary: '#CF0A2C', secondary: '#A60823', name: 'Huawei' },
  HIKVISION: { primary: '#00A0E9', secondary: '#007FBA', name: 'Hikvision' },
};

interface IconDef {
  path: string;
  label: string;
}

function getIcon(category: string): IconDef {
  switch (category) {
    case 'laptop':
      return {
        label: 'Ordinateur',
        path: 'M80,220 L280,220 Q300,220 300,240 L300,340 Q300,360 280,360 L80,360 Q60,360 60,340 L60,240 Q60,220 80,220 Z M60,360 L300,360 M140,360 L140,380 L220,380 M220,360 L220,380 M120,220 L120,160 Q120,140 140,140 L260,140 Q280,140 280,160 L280,220',
      };
    case 'server-storage':
    case 'datacenter':
      return {
        label: 'Serveur',
        path: 'M100,110 L260,110 Q280,110 280,130 L280,470 Q280,490 260,490 L100,490 Q80,490 80,470 L80,130 Q80,110 100,110 Z M120,160 L240,160 M120,200 L240,200 M120,240 L240,240 M120,380 L240,380 M120,420 L240,420 M120,460 L240,460',
      };
    case 'networking':
    case 'wireless':
      return {
        label: 'Réseau',
        path: 'M80,170 L280,170 Q300,170 300,190 L300,310 Q300,330 280,330 L80,330 Q60,330 60,310 L60,190 Q60,170 80,170 Z M170,200 L170,300 M170,230 L130,250 M170,270 L210,250 M170,250 L170,200 M170,250 L170,300 M130,250 L210,250 M170,250 A30,30 0 1,0 170,249 M170,250 A20,20 0 1,1 170,249',
      };
    case 'security':
      return {
        label: 'Sécurité',
        path: 'M180,80 L180,140 Q180,220 260,270 L280,280 L280,360 Q280,430 200,470 Q120,430 120,360 L120,270 L140,260 Q220,210 220,140 L220,80 Z M180,130 L180,90 M180,130 A40,40 0 0,0 180,210 M180,130 A20,20 0 1,1 180,170',
      };
    case 'cctv':
      return {
        label: 'Vidéosurveillance',
        path: 'M100,130 L260,130 Q280,130 280,150 L280,370 Q280,390 260,390 L100,390 Q80,390 80,370 L80,150 Q80,130 100,130 Z M170,260 M170,260 A50,50 0 1,0 170,360 A50,50 0 1,0 170,260 Z M170,280 A30,30 0 1,1 170,340 A30,30 0 1,1 170,280 Z M170,200 L170,220 M200,240 L215,225 M140,240 L125,225',
      };
    case 'monitor':
      return {
        label: 'Écran',
        path: 'M80,100 L280,100 Q300,100 300,120 L300,320 Q300,340 280,340 L80,340 Q60,340 60,320 L60,120 Q60,100 80,100 Z M170,340 L170,400 M120,400 L220,400',
      };
    default:
      return {
        label: 'Équipement',
        path: 'M80,80 L280,80 Q300,80 300,100 L300,420 Q300,440 280,440 L80,440 Q60,440 60,420 L60,100 Q60,80 80,80 Z',
      };
  }
}

const OUT_DIR = join(process.cwd(), 'public', 'assets', 'images', 'branded');

function generateSvg(id: string, name: string, brand: string, category: string): string {
  const brandCfg = BRAND_COLORS[brand] ?? { primary: '#888780', secondary: '#6B6A62', name: brand };
  const icon = getIcon(category);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FAFAFA"/>
      <stop offset="100%" stop-color="#F2F2F0"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg-${id})" rx="0"/>
  <rect x="24" y="24" width="552" height="552" rx="16" fill="none" stroke="${brandCfg.primary}" stroke-width="1.5" stroke-dasharray="8,6" opacity="0.25"/>
  <g transform="translate(300,170)" fill="none" stroke="${brandCfg.primary}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
    ${icon.path}
  </g>
  <rect x="150" y="370" width="300" height="40" rx="20" fill="${brandCfg.primary}" opacity="0.10"/>
  <text x="300" y="397" text-anchor="middle" font-family="IBM Plex Sans, system-ui, sans-serif" font-size="18" font-weight="600" fill="${brandCfg.primary}">${brandCfg.name}</text>
  <text x="300" y="440" text-anchor="middle" font-family="IBM Plex Sans, system-ui, sans-serif" font-size="14" fill="#888780">${name}</text>
  <text x="300" y="475" text-anchor="middle" font-family="IBM Plex Sans, system-ui, sans-serif" font-size="11" fill="#B0AFA6">${icon.label} · Image non disponible</text>
  <rect x="250" y="510" width="100" height="24" rx="12" fill="${brandCfg.primary}" opacity="0.12"/>
  <text x="300" y="527" text-anchor="middle" font-family="IBM Plex Sans, system-ui, sans-serif" font-size="10" font-weight="500" fill="${brandCfg.primary}">PLACEHOLDER</text>
</svg>`;
}

let generated = 0;

for (const product of products) {
  const fileName = `${product.id}.svg`;
  const filePath = join(OUT_DIR, fileName);
  if (existsSync(filePath)) continue;
  if (product.primaryImage.imageSource === 'real') continue;

  const svg = generateSvg(product.id, product.name, product.brand, product.category);
  writeFileSync(filePath, svg, 'utf-8');
  generated++;
}

console.log(`✅ ${generated} SVG placeholders générés dans ${OUT_DIR}`);
