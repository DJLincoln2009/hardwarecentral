"""Scraper sysllc.ae (Magento) — produits HPE/Aruba, HP, Fortinet, Cisco, Huawei, Hikvision.

Usage:
    python scrapers/scrape_sysllc.py --sitemap <path> --out <path> [--max-per-brand N]

Sauvegarde incrementielle dans un JSON brut (source, url, nom, marque, sku, specs, images...).
"""

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import bs4

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402

EXCLUDE = [
    "-bdl-", "bdl950", "forticare", "fortiguard", "renewal", "fc-10-", "fc-20-", "fc-30-",
    "support", "-sub-", "-r-12", "-r-36", "-r-60", "-r-1y", "-r-3y", "maintenance",
    "-in-dubai", "-in-uae", "-store", "partner", "-products.html", "shop-by-category",
    "top-selling", "deal-of-the-day", "best-seller", "new-arrival", "special-offer",
    "featured-products", "electro", "faq", "trackorder", "terms", "return-exchange",
    "privacy", "catalogsearch", "customer", "checkout", "/home", "blog", "category",
    "license", "licence", "upgrade", "quote", "demo", "trial", "spare", "part",
]

BRAND_URL_KWS = {
    "FORTINET": "fortinet",
    "CISCO": "cisco",
    "HIKVISION": "hikvision",
    "HPE": "hpe-",
    "HPE": "aruba",   # Aruba (marque HPE) — clé dédiée ci-dessous
    "HP": "hp-",
    "HUAWEI": "huawei",
}

NAME_SUFFIXES = [
    " in dubai, uae", " in dubai uae", " in dubai", " - dubai", " dubai uae", " uae",
    " price in dubai uae", " price in dubai", " at low cost", " at best price",
    " | syscom", " syscom", " in uae", " - price in dubai", " price", " best price",
]


def clean_name(raw: str) -> str:
    name = common.norm(raw)
    changed = True
    while changed:
        changed = False
        low = name.lower()
        for suf in NAME_SUFFIXES:
            if low.endswith(suf):
                name = name[: -len(suf)].rstrip(" |,:-")
                changed = True
                break
    name = re.sub(r"\s+", " ", name).strip()
    return name


def select_urls(locs, max_per_brand):
    """Sélectionne les URLs produits par marque, en excluant bundles/services/CMS."""
    per_brand = {}
    for code, kw in [("FORTINET", "fortinet"), ("CISCO", "cisco"), ("HIKVISION", "hikvision"),
                     ("HPE", "hpe-"), ("HPE", "aruba"), ("HP", "hp-"), ("HUAWEI", "huawei")]:
        urls = []
        for u in locs:
            low = u.lower()
            if not low.endswith(".html"):
                continue
            if kw not in low:
                continue
            if any(x in low for x in EXCLUDE):
                continue
            urls.append(u)
        # dedup par slug de base (on garde la 1ere occurrence, sans suffixe numerique)
        seen = {}
        for u in urls:
            base = re.sub(r"-\d+\.html$", ".html", u)
            if base not in seen:
                seen[base] = u
        chosen = list(seen.values())[: max_per_brand]
        per_brand.setdefault(code, []).extend(chosen)
        print(f"  {code:10s}: {len(chosen)} urls choisies (sur {len(seen)})")
    # dedup global (aruba/hp-hpe se chevauchent parfois)
    out, seen = [], set()
    for code in ["FORTINET", "CISCO", "HIKVISION", "HPE", "HP", "HUAWEI"]:
        for u in per_brand.get(code, []):
            if u not in seen:
                seen.add(u)
                out.append((code, u))
    return out


def parse_specs_table(soup):
    specs = []
    table = soup.find("table", class_="additional-attributes")
    if table:
        for tr in table.find_all("tr"):
            th = tr.find("th", class_="col label")
            td = tr.find("td", class_="col data")
            if th and td:
                label = common.norm(th.get_text(" ", strip=True))
                value = common.norm(td.get_text(" ", strip=True))
                if label and value:
                    specs.append({"label": label, "value": value})
    return specs


def parse_gallery(soup, base_images):
    """Images de la galerie produit (placeholder + gallimg), hors produits lies."""
    urls = []
    ph = soup.find(attrs={"data-gallery-role": "gallery-placeholder"})
    segments = []
    if ph:
        segments.append(str(ph))
    gi = soup.find(id="gallimg")
    if gi:
        segments.append(str(gi))
    blob = " ".join(segments)
    found = re.findall(r'(?:data-src|src)\s*=\s*(?:["\'])?(https://www\.sysllc\.ae/media/catalog/product/[^\s"\'<>]+)', blob)
    for u in found:
        u = u.rstrip(",.;")
        # privilégie la version originale (non cache) quand dispo
        if u not in urls:
            urls.append(u)
    for b in base_images:
        if b and b not in urls:
            urls.append(b)
    # dedup: meme fichier sous differentes caches
    out, seen_file = [], set()
    for u in urls:
        key = re.sub(r"cache/[a-f0-9]+/", "", u)
        if key in seen_file:
            continue
        seen_file.add(key)
        out.append(u)
    return out


def scrape_product(url):
    html = common.get_html(url, delay=0.4)
    ld = common.find_product_ld(html)
    soup = bs4.BeautifulSoup(html, "html.parser")

    h1 = soup.find("h1")
    raw_name = common.norm(h1.get_text(" ", strip=True)) if h1 else ""

    name = raw_name
    sku = None
    mpn = None
    gtin = None
    description = None
    price = None
    currency = None
    availability = None
    brand_raw = None
    ld_images = []

    if ld:
        name = common.norm(ld.get("name", "")) or name
        sku = ld.get("sku")
        mpn = ld.get("mpn")
        gtin = ld.get("gtin") or ld.get("upc")
        description = common.norm(ld.get("description", "")) or None
        brand_raw = (ld.get("brand") or {}).get("name") if isinstance(ld.get("brand"), dict) else None
        img = ld.get("image")
        if isinstance(img, list):
            ld_images = [common.norm(i) for i in img if common.norm(i)]
        elif img:
            ld_images = [common.norm(img)]
        offers = ld.get("offers") or {}
        if isinstance(offers, list):
            offers = offers[0] if offers else {}
        if isinstance(offers, dict):
            price = offers.get("price")
            currency = offers.get("priceCurrency")
            availability = offers.get("availability")
        if price is None and ld.get("aggregateRating"):
            pass

    # fallback sku depuis la table specs (Part No) ou itemprop
    specs = parse_specs_table(soup)
    if not sku:
        for s in specs:
            if s["label"].lower() in ("part no", "sku", "model", "partnumber", "mpn"):
                sku = s["value"]
                break
    if not sku:
        m = re.search(r'itemprop="sku" content="([^"]+)"', html)
        if m:
            sku = m.group(1)
    if not sku:
        m = re.search(r'<span class="value" itemprop="sku">([^<]+)</span>', html)
        if m:
            sku = common.norm(m.group(1))

    name = clean_name(name or raw_name)
    brand = common.normalize_brand(brand_raw) if brand_raw else None
    if not brand:
        # fallback: marque inferée depuis l'URL
        for code, kw in [("FORTINET", "fortinet"), ("CISCO", "cisco"), ("HIKVISION", "hikvision"),
                         ("HPE", "aruba"), ("HPE", "hpe-"), ("HP", "hp-"), ("HUAWEI", "huawei")]:
            if kw in url.lower():
                brand = code
                break

    images = parse_gallery(soup, ld_images)
    if not images and ld_images:
        images = ld_images

    return {
        "source": "sysllc",
        "url": url,
        "raw_name": raw_name,
        "name": name,
        "raw_brand": brand_raw,
        "brand": brand,
        "sku": sku,
        "mpn": mpn,
        "gtin": gtin,
        "description": description,
        "price": price,
        "currency": currency,
        "availability_raw": availability,
        "specs": specs,
        "images": images,
        "category_hint": common.infer_category(name, url),
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sitemap", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--max-per-brand", type=int, default=150)
    args = ap.parse_args()

    sitemap_path = Path(args.sitemap)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    xml = sitemap_path.read_text(encoding="utf-8", errors="replace")
    locs = common.parse_sitemap_locs(xml)
    print(f"sitemap locs: {len(locs)}")

    targets = select_urls(locs, args.max_per_brand)
    print(f"total urls a traiter: {len(targets)}")

    records = common.load_json(out_path)
    done = {r["url"] for r in records}
    print(f"deja fait: {len(done)}")

    ok, fail = 0, 0
    for code, url in targets:
        if url in done:
            ok += 1
            continue
        try:
            rec = scrape_product(url)
            # filtre : doit etre un vrai produit (nom + marque + au moins une image ou sku)
            if not rec["brand"]:
                print(f"  SKIP (marque inconnue): {url}")
                fail += 1
                continue
            if not rec["name"]:
                print(f"  SKIP (nom vide): {url}")
                fail += 1
                continue
            records.append(rec)
            common.save_json(out_path, records)
            done.add(url)
            ok += 1
            print(f"  [{len(done)}/{len(targets)}] {rec['brand']:8s} {rec['name'][:70]}")
        except Exception as e:
            fail += 1
            print(f"  ERR {url}: {e}")
            # on memorise l'url pour ne pas la retenter inutilement
            records.append({"source": "sysllc", "url": url, "error": str(e)})
            common.save_json(out_path, records)
            done.add(url)

    print(f"\nTermine. ok={ok} fail={fail} total_records={len(records)}")


if __name__ == "__main__":
    main()
