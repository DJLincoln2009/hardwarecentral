"""Telecharge les images du catalogue, les uploade sur ImageKit et produit un JSON enrichi.

Lecture : catalog.json (sortie de build_catalog.py)
Sortie  : catalog-media.json (memes produits + champ `media` avec URL ImageKit,
           dimensions, checksum, provenance retailer-scrape).

Re-executable : les images deja uploadees sont reutilisees (cache par URL source).
"""

import argparse
import base64
import hashlib
import json
import os
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402

MAX_IMAGES_PER_PRODUCT = 5
WORKERS = 3

_upload_lock = threading.Lock()


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def upload_image(private_key: str, folder: str, filename: str, data: bytes):
    """Upload un buffer sur ImageKit. Retourne le dict de reponse (url, width, height)."""
    b64 = base64.b64encode(data).decode("ascii")
    payload = {
        "file": b64,
        "fileName": filename,
        "folder": f"/products/{folder}",
        "useUniqueFileName": "false",
    }
    auth = base64.b64encode(f"{private_key}:".encode("ascii")).decode("ascii")
    headers = {
        "Authorization": f"Basic {auth}",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    resp = common._session.post(
        "https://upload.imagekit.io/api/v1/files/upload",
        data=payload,
        headers=headers,
        timeout=90,
    )
    if resp.status_code == 429:
        time.sleep(10)
        resp = common._session.post(
            "https://upload.imagekit.io/api/v1/files/upload",
            data=payload,
            headers=headers,
            timeout=90,
        )
    if resp.status_code != 200:
        raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:200]}")
    return resp.json()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--catalog", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--private-key", default=os.environ.get("IMAGEKIT_PRIVATE_KEY"))
    args = ap.parse_args()

    if not args.private_key:
        sys.exit("ERREUR: IMAGEKIT_PRIVATE_KEY non definie (env ou --private-key)")

    catalog = common.load_json(Path(args.catalog))
    print(f"produits a traiter: {len(catalog)}")

    # cache des uploads deja faits (par URL source) pour re-execution partielle
    cache = {}
    out_path = Path(args.out)
    dl_cache = out_path.parent / "dl-cache"
    dl_cache.mkdir(parents=True, exist_ok=True)
    if out_path.exists():
        for rec in common.load_json(out_path):
            for m in rec.get("media") or []:
                cache[m["provenance"]["sourceUrl"]] = m
        print(f"uploads en cache: {len(cache)}")

    def process(rec):
        images = rec.get("images") or []
        if not images:
            return rec, None
        media = []
        for idx, src_url in enumerate(images[:MAX_IMAGES_PER_PRODUCT]):
            if src_url in cache:
                media.append(cache[src_url])
                continue
            dl_file = dl_cache / (hashlib.sha256(src_url.encode("utf-8")).hexdigest()[:24])
            data = None
            if dl_file.exists():
                data = dl_file.read_bytes()
            if data is None:
                try:
                    data = common.fetch_binary(src_url)
                    dl_file.write_bytes(data)
                except Exception as exc:  # noqa: BLE001
                    print(f"  DOWNLOAD ERR {src_url[:80]}: {exc}")
                    continue
            if not data or len(data) < 200:
                print(f"  FICHIER TROP PETIT/VIDE {src_url[:80]}")
                continue
            m = re.match(r"^(\.[A-Za-z0-9]{2,5})$", os.path.splitext(src_url.split("?")[0])[1])
            ext = (m.group(1) if m else ".jpg").lower()
            folder = rec["brand"].lower()
            filename = f"{rec['sku']}__{idx}{ext}"
            try:
                resp = upload_image(args.private_key, folder, filename, data)
            except Exception as exc:  # noqa: BLE001
                print(f"  UPLOAD ERR {filename}: {exc}")
                continue
            media.append({
                "url": resp["url"],
                "alt": rec["name"],
                "width": int(resp.get("width") or 0) or 600,
                "height": int(resp.get("height") or 0) or 600,
                "imageSource": "real",
                "provenance": {
                    "sourceProvider": "retailer-scrape",
                    "sourceUrl": src_url,
                    "sourceIdentifier": src_url,
                    "fetchedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                    "checksum": sha256_hex(data),
                },
            })
        return rec, media

    results = []
    out_path.parent.mkdir(parents=True, exist_ok=True)

    def save_checkpoint():
        out_path.write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(process, rec): rec for rec in catalog}
        done = 0
        for fut in as_completed(futures):
            done += 1
            rec, media = fut.result()
            if media:
                rec["media"] = media
            results.append(rec)
            if done % 25 == 0 or done == len(futures):
                save_checkpoint()
                print(f"  traites: {done}/{len(futures)} (checkpoint sauvegarde)")

    n_with = sum(1 for r in results if r.get("media"))
    n_media = sum(len(r.get("media") or []) for r in results)
    print(f"produits avec image uploadee: {n_with}/{len(results)} (total medias: {n_media})")
    save_checkpoint()
    print(f"ecrit: {out_path}")


if __name__ == "__main__":
    main()
