"""Scraper serverbasket.com (WooCommerce) — produits complets DELL, HPE, HP, CISCO, HUAWEI.

Filtre les pages "parts/spares/rental/services" pour ne garder que de vrais produits.

Usage:
    python scrapers/scrape_serverbasket.py --sitemap <path> --out <path>
"""

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402

JUNK = ["part", "spare", "accessor", "spares", "rent", "price-list", "price list", "amc",
        "service", "repair", "support", "component", "spare-parts", "server-parts",
        "hard-disk-drive", "hard disk", "hdd", "raid-card", "raid card", "bezel", "caddy",
        "heat-sink", "heatsink", "fan-for", "power-supply-for", "tray", "screws", "feeder",
        "bezel", "fuser", "battery", "cable", "kit", "rack", "enclosure", "cartridge"]

BRAND_URL_PATTERNS = [
    ("DELL", r"(dell|poweredge|optiplex|latitude|precision)"),
    ("HPE", r"(hpe|hewlett|hp-proliant|proliant)"),
    ("HP", r"(hp-z|hp-|hp |hp\b)"),
    ("CISCO", r"cisco"),
    ("HUAWEI", r"huawei"),
]


def select_urls(locs):
    out = []
    seen = set()
    for code, pat in BRAND_URL_PATTERNS:
        n = 0
        for u in locs:
            low = u.lower()
            if not re.search(pat, low):
                continue
            if any(j in low for j in JUNK):
                continue
            if u in seen:
                continue
            seen.add(u)
            out.append((code, u))
            n += 1
        print(f"  {code}: {n} candidats")
    return out


def scrape_product(url):
    html = common.get_html(url, delay=0.35)
    ld = common.find_product_ld(html)
    if not ld:
        raise RuntimeError("no Product JSON-LD")

    name = common.norm(ld.get("name", ""))
    sku = ld.get("sku")
    brand_raw = (ld.get("brand") or {}).get("name") if isinstance(ld.get("brand"), dict) else None
    description = common.norm(ld.get("description", "")) or None

    img = ld.get("image")
    images = []
    if isinstance(img, list):
        for i in img:
            if isinstance(i, dict):
                i = i.get("url") or i.get("contentUrl") or i.get("@id") or ""
            if isinstance(i, str) and "media/" in i and "#" not in i:
                images.append(common.norm(i))
            elif isinstance(i, str) and i.startswith("http") and "#" not in i:
                images.append(common.norm(i))
    elif isinstance(img, dict):
        for k in ("url", "contentUrl"):
            v = img.get(k)
            if isinstance(v, str) and v.startswith("http"):
                images.append(common.norm(v))
                break
    elif isinstance(img, str) and img.startswith("http"):
        images = [common.norm(img)]
    # fallback og:image / contentUrl / thumbnailUrl
    if not images:
        m = re.search(r'property="og:image" content="([^"]+)"', html)
        if not m:
            m = re.search(r'"thumbnailUrl":"([^"]+)"', html)
        if not m:
            m = re.search(r'"contentUrl":"([^"]+)"', html)
        if m:
            images = [common.norm(m.group(1))]

    specs = []
    soup = None
    if ld.get("additionalProperty"):
        for p in ld.get("additionalProperty", []):
            if isinstance(p, dict) and p.get("name") and p.get("value"):
                specs.append({"label": common.norm(p.get("name", "")),
                              "value": common.norm(str(p.get("value", "")))})

    offers = ld.get("offers") or {}
    if isinstance(offers, list):
        offers = offers[0] if offers else {}
    availability = (offers or {}).get("availability") if isinstance(offers, dict) else None

    return {
        "source": "serverbasket",
        "url": url,
        "name": name,
        "raw_brand": brand_raw,
        "brand": common.normalize_brand(brand_raw),
        "sku": sku,
        "description": description,
        "availability_raw": availability,
        "specs": specs,
        "images": images,
        "category_hint": common.infer_category(name, url),
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }


NAME_JUNK = ["series", "modules", "-cards", "cards:", "buy", "online", "price list",
             "collection", "catalogue", "catalog", "category", "solutions", "services",
             "types", "variants"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sitemap", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    xml = Path(args.sitemap).read_text(encoding="utf-8", errors="replace")
    locs = [u for u in common.parse_sitemap_locs(xml) if "/shop/" in u and not u.endswith("/shop/")]
    print(f"urls shop: {len(locs)}")

    targets = select_urls(locs)
    print(f"total candidats: {len(targets)}")

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
            if any(j in rec["name"].lower() for j in NAME_JUNK):
                raise RuntimeError(f"page categorie/filtre: {rec['name'][:60]}")
            if rec["brand"] not in ("DELL", "HPE", "HP", "CISCO", "HUAWEI"):
                rec["brand"] = code
            if not rec["name"] or not rec["images"]:
                raise RuntimeError(f"donnees incompletes (name={bool(rec['name'])}, imgs={len(rec['images'])})")
            records.append(rec)
            common.save_json(out_path, records)
            done.add(url)
            ok += 1
            print(f"  [{len(done)}/{len(targets)}] {rec['brand']:6s} {rec['name'][:65]}")
        except Exception as e:
            fail += 1
            print(f"  ERR {url}: {e}")
            records.append({"source": "serverbasket", "url": url, "error": str(e)})
            common.save_json(out_path, records)
            done.add(url)

    print(f"\nTermine. ok={ok} fail={fail} total={len(records)}")


if __name__ == "__main__":
    main()
