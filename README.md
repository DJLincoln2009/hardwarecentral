# HardwareCentral

Site vitrine et catalogue de matériel informatique professionnel (serveurs, réseau, sécurité,
vidéosurveillance) pour **ETS HARDWARE CENTRAL**, Yaoundé — Cameroun.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, React 19, TypeScript)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Zustand](https://zustand.docs.pmnd.rs) (panier de devis et favoris, persistés en `localStorage`)
- [Vitest](https://vitest.dev) (tests unitaires) + [Playwright](https://playwright.dev) (e2e & audits axe)

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

| Commande            | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Serveur de développement                     |
| `npm run build`     | Build de production                          |
| `npm run start`     | Serveur de production                        |
| `npm run lint`      | ESLint (zéro warning toléré)                 |
| `npm run typecheck` | Vérification TypeScript                      |
| `npm test`          | Tests unitaires (Vitest)                     |
| `npm run test:e2e`  | Tests e2e (Playwright, build + start inclus) |
| `npm run format`    | Vérification du formatage Prettier           |

## Architecture

- `src/app` — routes App Router (catalogue, produit, marques, devis, favoris, pages légales)
- `src/components` — composants UI, sections, formulaires, produits
- `src/lib/data` — catalogue produits (données statiques typées)
- `src/lib/stores` — stores Zustand (devis, favoris)

Les formulaires (devis, contact, newsletter) n'envoient aucune donnée à un serveur : ils ouvrent
un e-mail pré-rempli vers `contact@hardware-central.com` via `mailto:`.

Les visuels produits sont des placeholders générés côté client (`ProductVisual`) aux couleurs de
chaque marque, mentionnant « Photo à venir ».

## Déploiement

Le site est statique (aucune route API, aucun secret). `npm run build` puis hébergement du dossier
`.next` — prévu pour Hostinger.
