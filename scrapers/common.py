"""Helpers partages pour les scrapers HardwareCentral.

Sources : sysllc.ae (Magento), firstshop.co.za (Shopify), serverbasket.com (WooCommerce).
Les trois sites autorisent le crawl public (robots.txt). Utilisation ponctuelle,
respectueuse (delais + retry), uniquement pour alimenter un catalogue B2B.
"""

import hashlib
import html as html_lib
import json
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

_session = requests.Session()
_session.headers.update(HEADERS)


def get_html(url: str, timeout: int = 40, retries: int = 3, delay: float = 0.6) -> str:
    """GET avec retry + backoff. Renvoie le HTML (ou leve une exception)."""
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            r = _session.get(url, timeout=timeout)
            if r.status_code == 200 and r.text:
                return r.text
            if r.status_code in (403, 429, 503):
                # respect : on attend plus longtemps et on retente une fois
                wait = 3 + (attempt - 1) * 4
                time.sleep(wait)
                last_err = f"HTTP {r.status_code}"
                continue
            last_err = f"HTTP {r.status_code}"
        except requests.RequestException as e:
            last_err = str(e)
            time.sleep(2 * attempt)
    raise RuntimeError(f"GET {url} failed: {last_err}")


def fetch_binary(url: str, timeout: int = 60, retries: int = 3) -> bytes:
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            r = _session.get(url, timeout=timeout)
            if r.status_code == 200:
                return r.content
            last_err = f"HTTP {r.status_code}"
        except requests.RequestException as e:
            last_err = str(e)
            time.sleep(2 * attempt)
    raise RuntimeError(f"GET {url} failed: {last_err}")


def extract_jsonld(html: str):
    """Extrait tous les blocs application/ld+json d'une page."""
    blocks = []
    for m in re.finditer(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S):
        raw = m.group(1).strip()
        if not raw:
            continue
        try:
            blocks.append(json.loads(raw))
        except json.JSONDecodeError:
            continue
    return blocks


def find_product_ld(html: str):
    """Cherche un bloc Product dans les JSON-LD (avec gestion @graph)."""
    for block in extract_jsonld(html):
        items = block if isinstance(block, list) else block.get("@graph", []) if isinstance(block, dict) else []
        if isinstance(block, dict) and block.get("@type") == "Product":
            return block
        for it in items:
            if isinstance(it, dict) and it.get("@type") == "Product":
                return it
    return None


def norm(html_or_text) -> str:
    """Nettoie un texte HTML (tags, entities, espaces multiples). Accepte str / int / float."""
    if html_or_text is None:
        return ""
    if not isinstance(html_or_text, str):
        html_or_text = str(html_or_text)
    text = re.sub(r"<[^>]+>", " ", html_or_text)
    text = html_lib.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


BRAND_ALIASES = {
    "fortinet": "FORTINET",
    "cisco": "CISCO",
    "cisco systems": "CISCO",
    "hikvision": "HIKVISION",
    "hpe": "HPE",
    "hewlett packard enterprise": "HPE",
    "hewlett-packard enterprise": "HPE",
    "hp enterprise": "HPE",
    "hpe aruba": "HPE",
    "aruba": "HPE",
    "aruba networks": "HPE",
    "hp": "HP",
    "hewlett-packard": "HP",
    "hewlett packard": "HP",
    "hp inc.": "HP",
    "hp inc": "HP",
    "dell": "DELL",
    "dell technologies": "DELL",
    "huawei": "HUAWEI",
    "lenovo": "LENOVO",
}


def normalize_brand(raw: str | None):
    """Renvoie le BrandCode de la marque (None si inconnue / hors perimetre)."""
    if not raw:
        return None
    key = re.sub(r"[^a-z ]", "", raw.lower()).strip()
    if key in BRAND_ALIASES:
        return BRAND_ALIASES[key]
    for alias, code in BRAND_ALIASES.items():
        if alias in key:
            return code
    return None


CATEGORY_RULES = [
    ("cctv", ["camera", "cctv", "nvr", "dvr", "turret", "dome camera", "bullet", "anpr",
              "video surveillance", "access control", "ds-2cd", "ds-7608", "ds-7616", "ds-7604",
              "ds-2cd", "lpr", "ipc", "viewframe", "hik-connect", "intercom", "xvr"]),
    ("laptop", ["laptop", "notebook", "latitude", "elitebook", "probook", "xps ", "thinkpad",
                "matebook", "zbook", "chromebook", "spectre", "optiplex", "prodesk", "elitedesk",
                "workstation", "dragong", "qingyun", "vostro", "ideapad", "desktop", "all-in-one"]),
    ("monitor", ["monitor", "display", "ultrasharp", "27-inch", "24-inch", "23.8", "moniteur",
                 "lcd ", "led monitor", "flat panel", "v7", "vk ", "vm series"]),
    ("printers", ["printer", "laserjet", "officejet", "deskjet", "tank", "multifunction",
                  "scanner", "toner", "ink", "plotter", "paperport", "neverstop", "smart tank",
                  "workforce", "ecotank", "colour laser", "mono laser", "a3", "a4", "laser"]),
    ("security", ["firewall", "fortigate", "fg-", "fgf", "fwb", "fortianalyzer", "fortimanager",
                  "fortiweb", "fortimail", "forticlient", "fortiedge",
                  "fortibridge", "fortisandbox", "fortideceptor", "fgt-", "fortivoice",
                  "sonicwall", "checkpoint", "paloalto", "palo alto", "asa-", "ftd", "ips ",
                  "intrusion prevention", "utm", "security appliance", "vpn appliance",
                  "next-generation firewall", "ngfw", "fortiadc", "fortiddos", "fwf-", "fwt-",
                  "fortiresponse", "fortiproxy", "fortiextender"]),
    ("wireless", ["access point", "wireless", "wifi", "wlan", "aruba instant", "unified ap",
                  "outdoor ap", "indoor ap", "point-to-point", "point-to-multipoint",
                  "uwb", "range extender", "wi-fi", "802.11", "ap-", "su-ap",
                  "omnidirectional", "smartzone", "fortiap", "airwave", "antenna"]),
    ("server-storage", ["server", "storage", "san ", "nas", "proliant", "poweredge", "alletra",
                        "primera", "storeonce", "nimble", "msa-", "synology", "qnap", "raid",
                        "dimm", "memory", "hdd", "ssd", "sas ", "hard drive", "hard drive bay",
                        "midplane", "backplane", "storage controller", "smart array", "mezzanine",
                        "processor", "cpu", "xeon", "epyc", "ethernet adapter", "hba"]),
    ("networking", ["switch", "router", "catalyst", "nexus", "sg350", "sg550", "cbs350",
                    "s5735", "s5700", "s5720", "s12700", "ethernet", "modular", "network",
                    "firewall switch", "chassis", "line card", "bridge", "gateway",
                    "stacking", "vpn concentrator", "asr", "isdn", "voice gateway",
                    "fortiswitch", "fortigate-switch", "ip phone", "phone", "voip",
                    "telephone", "headset"]),
    ("datacenter", ["cabinet", "rack", "pdu", "ups", "kvm", "power distribution", "cooling",
                    "air condition", "shelving", "rail kit", "bracket", "cable management",
                    "patch panel", "keystone", "transceiver", "sfp", "qsfp", "enclosure",
                    "accessor", "console server", "adapter", "power supply", "charger",
                    "battery", "mechanical", "blade enclosure", "ultrium", "cleaning"]),
]

CATEGORY_ID_LABELS = {
    "cctv": "cctv",
    "laptop": "laptop",
    "monitor": "monitor",
    "printers": "printers",
    "security": "security",
    "wireless": "wireless",
    "server-storage": "server-storage",
    "datacenter": "datacenter",
    "networking": "networking",
}


def infer_category(name: str, extra_hints: str = "") -> str | None:
    """Infer la CategoryId a partir du nom du produit (+ hints URL / product_type)."""
    blob = f"{name} {extra_hints}".lower()
    for cat, keywords in CATEGORY_RULES:
        for kw in keywords:
            if kw in blob:
                return CATEGORY_ID_LABELS[cat]
    return None


def parse_sitemap_locs(xml: str) -> list[str]:
    return re.findall(r"<loc>(.*?)</loc>", xml)


def checksum(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def save_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")


def load_json(path: Path):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return []
