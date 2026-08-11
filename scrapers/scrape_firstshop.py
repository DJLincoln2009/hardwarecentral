"""Scraper firstshop.co.za (Shopify) — produits DELL, HPE, HP.

Usage:
    python scrapers/scrape_firstshop.py --sitemaps <dir> --out <path> [--max-hp N]
"""

import argparse
import glob
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402

EXCLUDE_HW = ["toner", "cartridge", "ink", "drum", "paper", "supply", "cleaning kit",
              "maintenance kit", "label", "photocopier"]


def collect_urls(sitemap_dir):
    all_locs = []
    for p in glob.glob(str(Path(sitemap_dir) / "fs-*.xml")):
        xml = Path(p).read_text(encoding="utf-8", errors="replace")
        all_locs.extend(common.parse_sitemap_locs(xml))
    return sorted(set(u for u in all_locs if "/products/" in u))


def select_urls(urls, max_hp=160):
    dell = [u for u in urls if re.search(r"\b(dell|dell-)\b", u.lower())]
    hpe = [u for u in urls if re.search(r"(hpe|hewlett)", u.lower())]
    hp_all = [u for u in urls if re.search(r"/products/(hp[-.]|hp[a-z])", u.lower())]
    hp_hw = [u for u in hp_all if not any(x in u.lower() for x in EXCLUDE_HW)]
    hp = hp_hw[:max_hp]
    print(f"  DELL: {len(dell)}, HPE: {len(hpe)}, HP (hardware): {len(hp_hw)} -> {len(hp)}")
    return [("DELL", u) for u in dell] + [("HPE", u) for u in hpe] + [("HP", u) for u in hp]


def scrape_product(url):
    html = common.get_html(url, delay=0.35)
    ld = common.find_product_ld(html)
    if not ld:
        raise RuntimeError("no Product JSON-LD")

    name = common.norm(ld.get("name", ""))
    sku = ld.get("sku") or ld.get("mpn")
    mpn = ld.get("mpn")
    brand_raw = (ld.get("brand") or {}).get("name") if isinstance(ld.get("brand"), dict) else None
    description = common.norm(ld.get("description", "")) or None
    product_type = common.norm(ld.get("category", "")) or None

    img = ld.get("image")
    images = []
    if isinstance(img, list):
        images = [common.norm(i) for i in img if common.norm(i)]
    elif img:
        images = [common.norm(img)]

    # nettoyage urls images: version pleine resolution, sans parametres
    cleaned = []
    for u in images:
        u = u.split("?")[0]
        u = re.sub(r"_(grande|medium|small|compact)\.", ".", u)
        u = re.sub(r"\.png|\.jpg", lambda m: m.group(0), u)
        if u not in cleaned:
            cleaned.append(u)
    images = cleaned or images

    offers = ld.get("offers") or {}
    if isinstance(offers, list):
        offers = offers[0] if offers else {}
    availability = (offers or {}).get("availability") if isinstance(offers, dict) else None

    specs = []
    for p in ld.get("additionalProperty", []):
        if isinstance(p, dict) and p.get("name") and p.get("value"):
            label = common.norm(p.get("name", ""))
            value = common.norm(str(p.get("value", "")))
            if label and value and label.lower() not in ("product_type", "product type"):
                specs.append({"label": label, "value": value})

    return {
        "source": "firstshop",
        "url": url,
        "name": name,
        "raw_brand": brand_raw,
        "brand": common.normalize_brand(brand_raw),
        "sku": sku,
        "mpn": mpn,
        "description": description,
        "product_type": product_type,
        "availability_raw": availability,
        "specs": specs,
        "images": images,
        "category_hint": common.infer_category(name, product_type or ""),
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sitemaps", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--max-hp", type=int, default=160)
    args = ap.parse_args()

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    urls = collect_urls(args.sitemaps)
    print(f"urls produits uniques firstshop: {len(urls)}")
    targets = select_urls(urls, args.max_hp)
    print(f"total a traiter: {len(targets)}")

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
            if rec["brand"] != code:
                rec["brand"] = code  # source fiable; on force la marque cible
            if not rec["name"]:
                raise RuntimeError("nom vide")
            records.append(rec)
            common.save_json(out_path, records)
            done.add(url)
            ok += 1
            print(f"  [{len(done)}/{len(targets)}] {rec['brand']:5s} {rec['name'][:70]}")
        except Exception as e:
            fail += 1
            print(f"  ERR {url}: {e}")
            records.append({"source": "firstshop", "url": url, "error": str(e)})
            common.save_json(out_path, records)
            done.add(url)

    print(f"\nTermine. ok={ok} fail={fail} total={len(records)}")


if __name__ == "__main__":
    main()
