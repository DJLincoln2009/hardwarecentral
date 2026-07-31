# Rapport de couverture d'images
**Date** : 2026-07-31

## Résumé

| Métrique | Valeur |
|---|---|
| Total produits | 356 |
| Images réelles | 0 |
| Placeholders de marque | 356 |
| Couverture réelle | 0 % |
| Rendu 3D (`ai-render`) | 0 |

## Par marque

| Marque | Réelles | Total | % |
|---|---|---|---|
| HPE | 0 | 40 | 0% |
| HP | 0 | 20 | 0% |
| DELL | 0 | 60 | 0% |
| FORTINET | 0 | 58 | 0% |
| CISCO | 0 | 60 | 0% |
| HUAWEI | 0 | 58 | 0% |
| HIKVISION | 0 | 60 | 0% |

## Historique
- **2026-07-31** : dernière image réelle retirée (hikvision-ds-2cd2t47g2-l) → placeholder SVG. Les 20 produits HP Inc. passent au branding HP (bleu `#0096D6`) au lieu de HPE. Le fichier ImageKit distant n'est pas supprimé (action ImageKit manuelle facultative).

## Pipeline 3D — état (section 6 du plan d'audit)

| Étape | Statut |
|---|---|
| Types étendus (`ImageSource 'ai-render'`, `ImageProvider 'ai-3d-render'`) | ✅ |
| Micro-mention « Visuel généré » sur fiche produit | ✅ |
| `3d-pipeline/products.yaml` (27 produits featured) | ✅ |
| `3d-pipeline/scripts/` (download_refs, generate_3d, render_blender, orchestrate, sync_to_catalog) | ✅ |
| `scripts/upload-3d-renders.ts` (upload ImageKit + rapport de sync) | ✅ |
| `.gitignore` (`/3d-pipeline/work`, `/3d-pipeline/outputs`) | ✅ |
| `reference_images` (URLs officielles constructeur) | ⏳ TODO — à renseigner dans `products.yaml` |
| Génération TRELLIS (HF Space) | ⏳ Blocé : Blender non installé + API du Space à vérifier |
| Rendu Blender EEVEE Next | ⏳ Blocé : Blender non installé |

## Prochaines étapes
1. Renseigner les `reference_images` officielles (hpe.com, dell.com, fortinet.com, cisco.com, huawei.com, hikvision.com, hp.com) dans `products.yaml`.
2. Installer Blender 4.x et exécuter le cas-test (`dell-poweredge-r760`) via `3d-pipeline/scripts/orchestrate.py`.
3. Relire le rapport `upload-3d-renders` puis committer manuellement les ajouts `gallery` dans les fichiers produits (section 6.5.1 du spec).
