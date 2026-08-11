"""Fusionne les 3 sources scrapees, normalise, deduplique et selectionne le catalogue final.

Sortie : un JSON propre avec des produits (name, brand, sku, category, specs, images,
description, source, source_url) pret pour le pipeline d'upload + generation TS.
"""

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402

CONSUMABLE = ["toner", "cartridge", "ink", "drum", "paper", "photo paper", "labels",
              "cleaning kit", "maintenance kit", "ribbon"]

# Marques NON distribuees (le brand detecte via l'URL peut etre faux) -> exclure
OTHER_BRANDS = ["ubiquiti", "airmax", "airfiber", "airgrid", "mikrotik", "ruckus", "tplink",
                "tp-link", "netgear", "juniper", "extreme networks", "arista", "zyxel",
                "draytek", "sophos", "watchguard", "paloalto", "palo alto",
                "linksys", "dlink", "d-link", "datavideo", "avtech"]

SERVERBASKET_JUNK = ["accessories", "add-ons", "add ons", "graphics card", "graphics cards",
                     "bezel", "spare", "spares", "parts", "processor", "raid cards", "raid card",
                     "raid controller", "power supplies for", "power supply for",
                     "caddy", "heatsink", "heat sink", "used dell servers", "refurbished dell servers",
                     "rent", "amc", "price list", "price-list", "hard drive", "hard-disk",
                     "hard disk", "fan", "memory", "ssd", "hdd", "servers on rent",
                     "second hand", "used ", "refurbished", "on rent", "server-rental"]

# Produits serverbasket a conserver en priorite (noms approximatifs)
SERVEBASKET_KEEP = ["powervault", "poweredge", "nx430", "nx3200", "me40", "md3", "md1",
                    "dl2200", "t430", "t630", "t440", "t640", "r550", "r650", "r660", "r750",
                    "r7625", "r6625", "r6525", "r250", "r350", "r450", "r540", "r740",
                    "t320", "t330", "t340", "t20", "t110", "r220", "r230", "r240",
                    "proliant", "proliant dl", "proliant ml", "storeeasy", "storevirtual",
                    "storeonce", "nimble", "msa", "backup", "cloudengine", "netengine", "usg",
                    "ma5600", "cx320", "cx310", "s5720", "s5700", "s5320", "s12700", "s6700"]

# Accessoires (sacoches, housses...) qui ne sont PAS des ordinateurs -> exclure
LAPTOP_ACCESSORY = ["notebook case", "laptop case", "carrying case", "briefcase", "backpack",
                    "sleeve", "toploader", "messenger", "fundas", "targus", "notebook bag",
                    "laptop bag", "notebook stand", "laptop stand", "premier slim",
                    "in value topload", "executive notebook"]

# Override de categorie par mot-cle de nom (les regles generiques se trompent ici)
NAME_CATEGORY_OVERRIDES = {
    "digital sender": "printers",
    "document capture": "printers",
    "desktop switch": "networking",
    "mesh extender": "wireless",
    "cloudengine": "networking",
    "netengine": "networking",
}

SKU_LIKE_FIELDS = ["part no", "part number", "partno", "sku", "model no", "model number",
                   "model", "mpn", "order code", "product number", "product code"]


def norm_sku(sku: str | None) -> str:
    if not sku:
        return ""
    return re.sub(r"[^a-z0-9]", "", sku.lower())


def extract_sku_from_specs(specs):
    for s in specs:
        if s["label"].lower() in SKU_LIKE_FIELDS:
            v = s["value"].strip()
            if v and len(v) <= 40:
                return v
    return None


GENERIC_WORDS = {"server", "servers", "tower", "rack", "workstation", "storage", "router",
                 "routers", "switch", "switches", "buy", "online", "dell", "hp", "hpe", "cisco",
                 "huawei", "refurbished", "used", "second", "hand", "series", "v2", "gen", "g2",
                 "g3", "g4", "g5", "g6", "g7", "g8", "g9", "systems", "system", "edition",
                 "card", "cards", "adapter", "adapters", "new", "sealed", "box", "module",
                 "modules", "servers", "server", "for", "of", "the", "and", "with", "3yr",
                 "prosupport", "nbd", "24", "7", "8gb", "16gb", "10k", "2.5", "3.5", "7.2tb",
                 "20tb", "12", "24", "48", "with", "5", "10", "40", "100", "tb", "gb", "mb"}


def derive_sku(name: str) -> str:
    """SKU derive du nom : token modele contenant lettres+chiffres (preference initiale lettre)."""
    candidates = re.findall(r"[A-Za-z0-9][A-Za-z0-9.\-]{1,30}", name)
    by_prefix = {"letter": [], "any": []}
    for t in candidates:
        t = t.strip("().-")
        if not t or len(t) < 3:
            continue
        low = t.lower()
        if low in GENERIC_WORDS:
            continue
        if re.match(r"^[0-9.]+$", t):
            continue
        if not any(ch.isdigit() for ch in t):
            continue
        if t[0].isalpha():
            by_prefix["letter"].append(t)
        by_prefix["any"].append(t)
    if by_prefix["letter"]:
        return by_prefix["letter"][-1]
    if by_prefix["any"]:
        return by_prefix["any"][-1]
    return re.sub(r"[^A-Za-z0-9]", "-", name)[:40]


def parse_sb_specs(description: str) -> list:
    """Parse les 'Label : value' d'une description serverbasket en specs."""
    specs = []
    if not description:
        return specs
    for m in re.finditer(r"([A-Za-z][A-Za-z ]{2,40}?)\s*:\s*([^;:\n]{1,80})", description):
        label = m.group(1).strip()
        value = m.group(2).strip()
        if label.lower().startswith(("http", "www", "buy", "order", "why", "fast", "easy",
                                     "free", "warranty", "exclusive", "shipping")):
            continue
        if len(label) < 3 or label.lower() in ("dell", "poweredge", "server", "buy", "order"):
            continue
        specs.append({"label": label, "value": value})
        if len(specs) >= 12:
            break
    # dedup labels
    out, seen = [], set()
    for s in specs:
        if s["label"].lower() not in seen:
            seen.add(s["label"].lower())
            out.append(s)
    return out


def normalize_records(sources, url_overrides):
    """Applique les regles de normalisation communes."""
    out = []
    for rec in sources:
        if "error" in rec:
            continue
        name = (rec.get("name") or "").strip()
        brand = rec.get("brand")
        images = rec.get("images") or []
        if not name or brand not in ("HPE", "HP", "DELL", "FORTINET", "CISCO", "HUAWEI", "HIKVISION"):
            continue
        if any(b in name.lower() for b in OTHER_BRANDS):
            continue
        low_name = name.lower()
        if any(a in low_name for a in LAPTOP_ACCESSORY):
            continue
        # exclusion consommables HP
        if brand == "HP" and any(c in name.lower() for c in CONSUMABLE):
            continue
        # exclusion serverbasket junk
        if rec.get("source") == "serverbasket":
            low = name.lower()
            if any(j in low for j in SERVERBASKET_JUNK):
                continue
            if not any(k in low for k in SERVEBASKET_KEEP):
                continue
        # images HTTPS uniquement
        images = [u for u in images if u.startswith("https://")
                  and any(d in u for d in ("cdn.shopify.com", "sysllc", "serverbasket", "firstshop", "ik.imagekit"))]
        images = [u.split("?")[0] for u in images]
        # spec dedup
        specs = rec.get("specs") or []
        if rec.get("source") == "serverbasket" and not specs and rec.get("description"):
            specs = parse_sb_specs(rec["description"])
        sku = rec.get("sku")
        if not sku:
            sku = extract_sku_from_specs(specs)
        if not sku:
            sku = derive_sku(name)
        # categorie
        cat = None
        for k, v in NAME_CATEGORY_OVERRIDES.items():
            if k in low_name:
                cat = v
                break
        if cat is None:
            cat = url_overrides.get(rec.get("url")) or common.infer_category(name, f"{rec.get('product_type') or ''} {rec.get('url') or ''}")
        if not cat:
            continue
        # re-classement HP enterprise networking -> HPE
        if brand == "HP" and cat in ("networking", "wireless", "datacenter"):
            brand = "HPE"
        out.append({
            "name": name,
            "brand": brand,
            "sku": sku,
            "category": cat,
            "specs": specs,
            "images": images,
            "description": rec.get("description"),
            "source": rec.get("source"),
            "source_url": rec.get("url"),
        })
    return out


def dedup(records):
    """Deduplique par SKU normalise. Priorite: plus de specs/images, sysllc > firstshop > serverbasket."""
    priority = {"sysllc": 0, "firstshop": 1, "serverbasket": 2}
    best = {}
    for r in records:
        key = f"{r['brand']}:{norm_sku(r['sku'])}"
        cur = best.get(key)
        if cur is None:
            best[key] = r
            continue
        # score de qualite
        def score(x):
            return (len(x["specs"]) * 2 + len(x["images"]) * 3 + (10 - priority[x["source"]]),
                    len(x["name"]))
        if score(r) > score(cur):
            best[key] = r
    return list(best.values())


# Quotas cibles : nombre de produits par (marque, categorie). Total ~425.
QUOTAS = {
    "HPE": {"server-storage": 22, "networking": 22, "wireless": 12, "datacenter": 14},
    "HP": {"printers": 40, "laptop": 14, "monitor": 16},
    "DELL": {"laptop": 15, "monitor": 5, "server-storage": 20, "networking": 12, "datacenter": 3},
    "FORTINET": {"security": 45, "wireless": 10, "networking": 10, "datacenter": 5},
    "CISCO": {"networking": 40, "security": 5, "wireless": 10, "datacenter": 8, "server-storage": 7},
    "HUAWEI": {"networking": 10, "wireless": 4, "security": 3, "datacenter": 3},
    "HIKVISION": {"cctv": 70},
}
CATS = ["server-storage", "networking", "security", "cctv", "laptop",
        "datacenter", "wireless", "monitor", "printers"]


def select_catalog(records, quotas):
    """Selection guidee par quotas (marque, categorie), puis remplit le budget marque
    restant avec les produits du pool non encore choisis."""
    by_brand = defaultdict(list)
    for r in records:
        by_brand[r["brand"]].append(r)
    chosen, used = [], defaultdict(int)
    for brand, cats in quotas.items():
        pool = by_brand.get(brand, [])
        by_cat = defaultdict(list)
        for r in pool:
            by_cat[r["category"]].append(r)
        picked = []
        for cat, want in cats.items():
            for r in by_cat.get(cat, [])[:want]:
                picked.append(r)
        budget = sum(cats.values())
        if len(picked) < budget:
            picked_keys = {(r["brand"], norm_sku(r["sku"])) for r in picked}
            for r in pool:
                if len(picked) >= budget:
                    break
                if (r["brand"], norm_sku(r["sku"])) not in picked_keys:
                    picked.append(r)
                    picked_keys.add((r["brand"], norm_sku(r["sku"])))
        chosen.extend(picked)
        used[brand] = len(picked)
    return chosen


def print_matrix(records, title):
    m = defaultdict(Counter)
    for r in records:
        m[r["brand"]][r["category"]] += 1
    print(title)
    print("  " + " ".join(c[:9].ljust(10) for c in CATS) + "TOTAL")
    for b in ["HPE", "HP", "DELL", "FORTINET", "CISCO", "HUAWEI", "HIKVISION"]:
        row = " ".join(str(m[b][c]).ljust(10) for c in CATS)
        print(f"  {b:8s} {row} {sum(m[b].values())}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sysllc", required=True)
    ap.add_argument("--firstshop", required=True)
    ap.add_argument("--serversbasket", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    url_overrides = {}
    override_file = Path(__file__).resolve().parent / "category_overrides.json"
    if override_file.exists():
        url_overrides = json.loads(override_file.read_text(encoding="utf-8"))

    sources = (common.load_json(Path(args.sysllc))
               + common.load_json(Path(args.firstshop))
               + common.load_json(Path(args.serversbasket)))
    print(f"sources brutes: {len(sources)}")

    records = normalize_records(sources, url_overrides)
    print(f"apres normalisation: {len(records)}")
    print("  marques:", dict(Counter(r["brand"] for r in records)))
    print("  categories:", dict(Counter(r["category"] for r in records)))

    records = dedup(records)
    print(f"apres dedup: {len(records)}")
    print_matrix(records, "matrice du pool deduplique:")

    chosen = select_catalog(records, QUOTAS)
    print(f"\nselection: {len(chosen)}")
    print_matrix(chosen, "matrice selectionnee:")
    print("  categories:", dict(Counter(r["category"] for r in chosen)))

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(chosen, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
