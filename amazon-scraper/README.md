# Amazon Scraper API

API légère (FastAPI) pour récupérer titre, images haute résolution, description
et infos de base d'une fiche produit Amazon.

## ⚠️ Avant d'utiliser en production

Amazon **interdit le scraping** dans ses CGU et bloque activement les bots
(CAPTCHA, rate limiting, bannissement d'IP selon volume/fréquence). Ce projet
convient à un usage personnel/interne à faible volume (quelques requêtes,
espacées). Pour un usage soutenu ou commercial, privilégie :

- **Amazon Product Advertising API** (officielle, nécessite un compte
  Associates/Affilié) — https://webservices.amazon.com/paapi5/documentation/
- Des APIs tierces qui gèrent déjà l'anti-bot : Rainforest API, Oxylabs,
  ScraperAPI, Bright Data — payantes mais fiables à l'échelle.

## Installation

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Configuration (obligatoire pour Oxylabs)

Les identifiants Oxylabs sont lus depuis les variables d'environnement
(`OXYLABS_USERNAME`, `OXYLABS_PASSWORD`). Le scraper charge automatiquement le
fichier `.env.local` à la racine du dépôt s'il existe (jamais de mot de passe
en dur dans le code). Sans ces variables, les appels Oxylabs échouent avec un
message explicite.

## Lancer l'API

```bash
uvicorn main:app --reload --port 8000
```

Documentation interactive : http://localhost:8000/docs

## Utilisation

```bash
# Par URL complète
curl "http://localhost:8000/scrape?url=https://www.amazon.fr/dp/B0CX23V2ZK"

# Par ASIN direct
curl "http://localhost:8000/scrape?asin=B0CX23V2ZK&domain=fr"

# Avec un proxy (recommandé si tu scrapes plus qu'occasionnellement)
curl "http://localhost:8000/scrape?asin=B0CX23V2ZK&proxy=http://user:pass@host:port"
```

### Réponse type

```json
{
  "asin": "B0CX23V2ZK",
  "url": "https://www.amazon.fr/dp/B0CX23V2ZK",
  "title": "Nom du produit...",
  "brand": "Marque",
  "price": "129,99 €",
  "currency": "€",
  "rating": "4,5",
  "reviews_count": "1 234 évaluations",
  "availability": "En stock",
  "description": "Description longue du produit...",
  "bullet_points": ["Point clé 1", "Point clé 2", "..."],
  "images": [
    "https://m.media-amazon.com/images/I/71abc._SL1500_.jpg",
    "https://m.media-amazon.com/images/I/71xyz._SL1500_.jpg"
  ],
  "main_image": "https://m.media-amazon.com/images/I/71abc._SL1500_.jpg"
}
```

## Comment ça marche

- `scraper.py` fait la requête HTTP (via `httpx`) et parse le HTML avec
  `BeautifulSoup`.
- Le titre, prix, note, disponibilité et bullet points sont extraits via
  sélecteurs CSS sur les IDs stables d'Amazon (`#productTitle`,
  `#feature-bullets`, etc.).
- Les **images haute résolution** ne sont pas dans de simples balises
  `<img>` : Amazon les stocke dans un objet JavaScript embarqué
  (`colorImages`). Le scraper extrait ce JSON par regex et upscale les URLs
  vers la résolution `_SL1500_` (la plus grande généralement disponible).

## Limites connues

- **Pas de rendu JS** : cette version utilise `httpx` (requêtes HTTP brutes),
  donc si Amazon sert une page nécessitant du JS pour afficher le contenu
  (rare pour les fiches produit, mais possible selon marché/A-B test), il
  faudrait basculer vers Playwright — plus lourd, à éviter sur une machine
  avec peu de RAM.
- **Sélecteurs fragiles** : Amazon change régulièrement son HTML. Si un champ
  revient `null`, c'est probablement qu'un sélecteur CSS a changé — inspecte
  la page et ajuste `scraper.py`.
- **CAPTCHA/blocage** : si tu scrapes plusieurs produits d'affilée sans
  proxy, attends-toi à te faire bloquer après quelques dizaines de requêtes.

## Idées d'évolution

- Cache Redis pour éviter de re-scraper le même ASIN en boucle
- File d'attente (Celery/RQ) + proxies tournants pour du scraping en masse
- Endpoint `/scrape/batch` acceptant une liste d'ASINs
- Export direct vers ton catalogue HardwareCentral (si pertinent pour
  comparer/enrichir des fiches produit fournisseur)
