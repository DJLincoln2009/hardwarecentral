import re
import json
import base64
import random
import urllib.parse
from typing import Optional
from dataclasses import dataclass, field, asdict

import httpx
from bs4 import BeautifulSoup


USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

DEFAULT_TIMEOUT = 30.0

AMAZON_DOMAINS = {
    "fr": "amazon.fr",
    "com": "amazon.com",
    "de": "amazon.de",
    "co.uk": "amazon.co.uk",
}

# Oxylabs Real-Time Crawler configuration
OXYLABS_URL = "https://realtime.oxylabs.io/v1/queries"
OXYLABS_USERNAME = "***REMOVED***"
OXYLABS_PASSWORD = "***REMOVED***"


@dataclass
class Product:
    asin: str
    url: str
    title: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[str] = None
    currency: Optional[str] = None
    rating: Optional[str] = None
    reviews_count: Optional[str] = None
    availability: Optional[str] = None
    description: Optional[str] = None
    bullet_points: list = field(default_factory=list)
    images: list = field(default_factory=list)
    main_image: Optional[str] = None

    def to_dict(self):
        return asdict(self)


def extract_asin(url_or_asin: str) -> str:
    if re.fullmatch(r"[A-Z0-9]{10}", url_or_asin.strip()):
        return url_or_asin.strip()
    patterns = [
        r"/dp/([A-Z0-9]{10})",
        r"/gp/product/([A-Z0-9]{10})",
        r"/product/([A-Z0-9]{10})",
        r"asin=([A-Z0-9]{10})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url_or_asin)
        if match:
            return match.group(1)
    raise ValueError(f"Impossible d'extraire un ASIN valide depuis: {url_or_asin}")


def build_product_url(asin: str, domain: str = "fr") -> str:
    tld = AMAZON_DOMAINS.get(domain, domain)
    return f"https://www.{tld}/dp/{asin}"


def upscale_image_url(url: str) -> str:
    if not url:
        return url
    cleaned = re.sub(r"\._[A-Za-z0-9,_]+_\.", ".", url)
    if cleaned == url:
        return url
    name, ext = cleaned.rsplit(".", 1)
    return f"{name}._SL1500_.{ext}"


# --------------------------------------------------------------------------
# Oxylabs Real-Time Crawler
# --------------------------------------------------------------------------

async def fetch_via_oxylabs(asin: str, domain: str = "fr") -> Optional[Product]:
    url = build_product_url(asin, domain)
    auth = base64.b64encode(f"{OXYLABS_USERNAME}:{OXYLABS_PASSWORD}".encode()).decode()

    payload = {
        "source": "amazon",
        "domain": domain,
        "query": asin,
        "parse": True,
        "render": "html",
    }

    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
        try:
            response = await client.post(
                OXYLABS_URL,
                json=payload,
                headers={
                    "Authorization": f"Basic {auth}",
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            data = response.json()

            results = data.get("results", [])
            if not results:
                return None

            content = results[0].get("content", {})
            if not content:
                return None

            product = Product(asin=asin, url=url)

            product.title = content.get("title")
            product.brand = content.get("brand")
            product.price = content.get("price")
            product.currency = content.get("currency")

            rating_info = content.get("rating", {})
            if rating_info:
                product.rating = str(rating_info.get("rating")) if isinstance(rating_info, dict) else str(rating_info)

            reviews_info = content.get("reviews_count", None)
            if reviews_info:
                product.reviews_count = str(reviews_info)

            product.availability = content.get("availability_status")
            product.bullet_points = content.get("bullet_points") or []
            product.description = content.get("description")

            images_list = content.get("images") or []
            if isinstance(images_list, list):
                product.images = [
                    img.get("url") if isinstance(img, dict) else img
                    for img in images_list
                ]
            if product.images:
                product.main_image = product.images[0]

            return product

        except Exception as e:
            print(f"Oxylabs error for {asin}: {e}")
            return None


# --------------------------------------------------------------------------
# Direct HTTP scraping (fallback)
# --------------------------------------------------------------------------

def _headers() -> dict:
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }


def _parse_images(soup: BeautifulSoup) -> tuple[list, Optional[str]]:
    images = []
    main_image = None

    scripts = soup.find_all("script", type=None)
    for script in scripts:
        text = script.string or ""
        if "colorImages" not in text and "imageGalleryData" not in text:
            continue

        hi_res_matches = re.findall(r'"hiRes":"(https://[^"]+)"', text)
        large_matches = re.findall(r'"large":"(https://[^"]+)"', text)

        found = hi_res_matches or large_matches
        for img_url in found:
            img_url = img_url.replace("\\/", "/")
            if img_url not in images:
                images.append(img_url)

        if found:
            break

    if not images:
        landing = soup.select_one("#landingImage, #imgTagWrapperId img")
        if landing:
            src = landing.get("data-old-hires") or landing.get("src")
            if src:
                images.append(upscale_image_url(src))

    if images:
        main_image = images[0]

    return images, main_image


def parse_product_page(html: str, asin: str, url: str) -> Product:
    soup = BeautifulSoup(html, "html.parser")
    product = Product(asin=asin, url=url)

    title_el = soup.select_one("#productTitle")
    if title_el:
        product.title = title_el.get_text(strip=True)

    brand_el = soup.select_one("#bylineInfo, .po-brand .po-break-word")
    if brand_el:
        product.brand = brand_el.get_text(strip=True).replace("Visit the ", "").replace(" Store", "")

    price_el = soup.select_one(
        ".a-price .a-offscreen, #corePrice_feature_div .a-offscreen, #priceblock_ourprice"
    )
    if price_el:
        raw_price = price_el.get_text(strip=True)
        product.price = raw_price
        currency_match = re.search(r"[€$£]", raw_price)
        if currency_match:
            product.currency = currency_match.group(0)

    rating_el = soup.select_one("#acrPopover, span[data-asin] .a-icon-alt")
    if rating_el:
        rating_text = rating_el.get("title") or rating_el.get_text(strip=True)
        rating_match = re.search(r"([\d,.]+)\s*(sur|out of|étoiles)", rating_text)
        if rating_match:
            product.rating = rating_match.group(1)

    reviews_el = soup.select_one("#acrCustomerReviewText")
    if reviews_el:
        product.reviews_count = reviews_el.get_text(strip=True)

    availability_el = soup.select_one("#availability span")
    if availability_el:
        product.availability = availability_el.get_text(strip=True)

    bullets = soup.select("#feature-bullets ul li span.a-list-item")
    product.bullet_points = [b.get_text(strip=True) for b in bullets if b.get_text(strip=True)]

    desc_el = soup.select_one("#productDescription")
    if desc_el:
        product.description = desc_el.get_text(separator=" ", strip=True)
    elif product.bullet_points:
        product.description = " ".join(product.bullet_points)

    images, main_image = _parse_images(soup)
    product.images = images
    product.main_image = main_image

    return product


# --------------------------------------------------------------------------
# Unified fetch with fallback
# --------------------------------------------------------------------------

class ScrapeError(Exception):
    pass


async def fetch_product_async(
    url_or_asin: str,
    domain: str = "fr",
    proxy: Optional[str] = None,
    use_oxylabs: bool = True,
) -> Product:
    asin = extract_asin(url_or_asin)
    url = build_product_url(asin, domain) if not url_or_asin.startswith("http") else url_or_asin

    # Try Oxylabs first
    if use_oxylabs:
        oxylabs_result = await fetch_via_oxylabs(asin, domain)
        if oxylabs_result and oxylabs_result.title:
            print(f"[OK] Oxylabs: {asin} -> {oxylabs_result.title[:60]}")
            return oxylabs_result
        print(f"[FALLBACK] Oxylabs failed for {asin}, trying direct HTTP...")

    # Fallback: direct HTTP scraping with httpx + BeautifulSoup
    client_kwargs = {"timeout": DEFAULT_TIMEOUT, "follow_redirects": True}
    if proxy:
        client_kwargs["proxy"] = proxy

    async with httpx.AsyncClient(**client_kwargs) as client:
        response = await client.get(url, headers=_headers())

        if response.status_code == 503 or "captcha" in response.text.lower()[:3000]:
            raise ScrapeError(
                "Amazon a renvoyé un CAPTCHA ou bloqué la requête (503). "
                "Utilise un proxy résidentiel ou réduis la fréquence des requêtes."
            )
        if response.status_code != 200:
            raise ScrapeError(f"Erreur HTTP {response.status_code} lors de la récupération de {url}")

        return parse_product_page(response.text, asin, url)


def fetch_product(
    url_or_asin: str,
    domain: str = "fr",
    proxy: Optional[str] = None,
    use_oxylabs: bool = True,
) -> Product:
    import asyncio
    return asyncio.run(fetch_product_async(url_or_asin, domain, proxy, use_oxylabs))


# --------------------------------------------------------------------------
# Amazon search
# --------------------------------------------------------------------------

async def search_amazon_async(query: str, domain: str = "fr") -> Optional[list[dict]]:
    """Search Amazon for a query and return product results."""
    tld = AMAZON_DOMAINS.get(domain, domain)

    auth = base64.b64encode(f"{OXYLABS_USERNAME}:{OXYLABS_PASSWORD}".encode()).decode()
    payload = {
        "source": "amazon_search",
        "domain": domain,
        "query": query,
        "parse": True,
    }

    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
        try:
            response = await client.post(
                OXYLABS_URL,
                json=payload,
                headers={
                    "Authorization": f"Basic {auth}",
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])
            if not results:
                return None
            content = results[0].get("content", {})
            products = []
            for item in (content.get("results") or content.get("organic") or []):
                asin = item.get("asin")
                if asin:
                    products.append({
                        "asin": asin,
                        "title": item.get("title"),
                        "price": item.get("price"),
                        "url": f"https://www.{tld}/dp/{asin}",
                        "image": item.get("image"),
                        "brand": item.get("brand"),
                    })
            return products or None
        except Exception as e:
            print(f"Oxylabs search error: {e}")

    # Fallback: direct Amazon search scraping
    try:
        search_url = f"https://www.{tld}/s?k={urllib.parse.quote(query)}"
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT, follow_redirects=True) as client:
            response = await client.get(search_url, headers=_headers())
            if response.status_code != 200:
                return None
            soup = BeautifulSoup(response.text, "html.parser")
            products = []
            for div in soup.select("[data-asin]"):
                asin = div.get("data-asin")
                if asin and asin.strip():
                    title_el = div.select_one("h2 a.a-link-normal span")
                    title = title_el.get_text(strip=True) if title_el else None
                    price_el = div.select_one(".a-price .a-offscreen")
                    price = price_el.get_text(strip=True) if price_el else None
                    img_el = div.select_one("img.s-image")
                    image = img_el.get("src") if img_el else None
                    products.append({
                        "asin": asin,
                        "title": title,
                        "price": price,
                        "url": f"https://www.{tld}/dp/{asin}",
                        "image": image,
                    })
            return products or None
    except Exception as e:
        print(f"Direct search fallback error: {e}")
        return None


if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else "B0CX23V2ZK"
    use_oxylabs = sys.argv[2].lower() != "no-oxylabs" if len(sys.argv) > 2 else True
    p = fetch_product(target, use_oxylabs=use_oxylabs)
    print(json.dumps(p.to_dict(), indent=2, ensure_ascii=False))
