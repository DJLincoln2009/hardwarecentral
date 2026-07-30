# Rapport de couverture d'images
**Date** : 2026-07-30

## Résumé

| Métrique | Valeur |
|---|---|
| Total produits | 240 |
| Images réelles | 1 |
| Placeholders de marque | 239 |
| Couverture réelle | 0,4 % |

## Par marque

| Marque | Réelles | Total | % |
|---|---|---|---|
| HPE | 0 | 40 | 0% |
| DELL | 0 | 40 | 0% |
| FORTINET | 0 | 40 | 0% |
| CISCO | 0 | 40 | 0% |
| HUAWEI | 0 | 40 | 0% |
| HIKVISION | 1 | 40 | 3% |

## Image réelle unique
- **hikvision-ds-2cd2t47g2-l** — source ImageKit (provenance: amazon-scraper, ASIN: B08SNWG3LC)

## Actions réalisées

1. **Nouveau champ `imageSource`** ajouté à `MediaAsset` dans les types (`'real' | 'placeholder'`)
2. **Nouveau provider `branded-placeholder'** ajouté à `ImageProvider`
3. **240 SVG placeholders** générés dans `public/assets/images/branded/` — chaque SVG affiche :
   - La couleur officielle de la marque
   - Une icône vectorielle représentant la catégorie produit
   - Le nom du produit
   - La mention « Image non disponible »
4. **Fichiers produits mis à jour** : `primaryImage` de chaque produit remplacé par l'image correspondante (ImageKit pour la réelle, SVG local pour les placeholders)
5. **ImageKit nettoyé** : 96 fichiers "generic-" supprimés, 2 images réelles conservées

## Prochaines étapes recommandées

Pour augmenter la couverture réelle au-delà de 0,4 % :
- Débloquer l'API Amazon Product Advertising (PAAPI) pour récupérer les images par ASIN
- Utiliser Icecat pour les datasheets et potentiellement les images catalogue
- Scraper les sites constructeurs (HPE, Dell, Fortinet, Cisco, Huawei) via Oxylabs
- Contacter directement les fournisseurs pour des assets média officiels
