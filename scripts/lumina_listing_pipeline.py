#!/usr/bin/env python3
"""Lumina demo listing pipeline.

Manual trigger:
  python3 scripts/lumina_listing_pipeline.py

Cron-ready:
  cd /mnt/q/World/projects/lumina && python3 scripts/lumina_listing_pipeline.py

Signal-only/test-mode safeguards:
- Uses public listing pages only.
- Writes demo listings marked DEMO / VERIFICATION REQUIRED.
- Uses general area only.
- Uses Lumina placeholder image unless a public image URL is explicitly validated elsewhere.
"""

from __future__ import annotations

import html
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "website" / "data" / "lumina-demo-leads.json"
PLACEHOLDER_IMAGE = "/assets/images/hero-luxury-villa.jpg"
MAX_LISTINGS = 10
MIN_PRICE = 200_000
REQUEST_TIMEOUT = 25
USER_AGENT = "Mozilla/5.0 (compatible; LuminaDemoPipeline/1.0; +https://lumina.qutaifan.com)"

TARGET_PAGES = [
    ("OpenSooq", "Dabouq", "Villa", "https://jo.opensooq.com/en/amman/dabouq/property/villas-palaces-for-sale"),
    ("OpenSooq", "Abdoun", "Villa", "https://jo.opensooq.com/en/amman/abdoun/property/villas-palaces-for-sale"),
    ("OpenSooq", "Abdali", "Apartment", "https://jo.opensooq.com/en/amman/abdali/property/apartments-for-sale"),
    ("OpenSooq", "Dead Sea", "Chalet", "https://jo.opensooq.com/en/jordan-valley/dead-sea/property/farms-chalets-for-sale"),
    ("OpenSooq", "Aqaba", "Apartment", "https://jo.opensooq.com/en/aqaba/property/apartments-for-sale"),
]

SECONDARY_PAGES = [
    ("Bayut", "Dabouq", "Villa", "https://www.bayut.jo/en/amman/villas-for-sale-in-dabouq"),
    ("Bayut", "Abdoun", "Villa", "https://www.bayut.jo/en/amman/villas-for-sale-in-abdun"),
    ("Bayut", "Dead Sea", "Chalet", "https://www.bayut.jo/en/al-ghor/properties-for-sale-in-dead-sea"),
    ("Dubizzle", "Dabouq", "Villa", "https://www.dubizzle.jo/en/properties/properties-for-sale/villas-for-sale/dabouq"),
]


@dataclass(frozen=True)
class Lead:
    source: str
    source_rank: int
    source_url: str
    raw_title: str
    property_type: str
    location_area: str
    price_jod_raw: int
    size_sqm: int | None
    land_area_sqm: int | None
    bedrooms: str | None
    bathrooms: str | None
    contact_signal: str
    image_count: int
    quality_score: int


def fetch(url: str) -> str:
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    return response.text


def parse_int(value: Any) -> int | None:
    if value is None:
        return None
    match = re.search(r"\d[\d,]*", str(value))
    return int(match.group(0).replace(",", "")) if match else None


def clean_source_url(value: str) -> str | None:
    value = html.unescape(str(value))
    match = re.search(r"(?:https://jo\.opensooq\.com)?/search/(\d+)", value)
    if not match:
        return None
    return f"https://jo.opensooq.com/search/{match.group(1)}"


def cp_value(cps: list[str], key: str) -> str | None:
    for item in cps:
        text = str(item).strip()
        if key.lower() in text.lower():
            return text
    return None


def compact_bedrooms(cps: list[str]) -> str | None:
    for item in cps:
        text = str(item).strip()
        if "bedroom" in text.lower():
            return re.sub(r"\s+bedrooms?\b", "", text, flags=re.I)
    return None


def compact_bathrooms(cps: list[str]) -> str | None:
    for item in cps:
        text = str(item).strip()
        if "bathroom" in text.lower():
            return re.sub(r"\s+bathrooms?\b", "", text, flags=re.I)
    return None


def safe_location(area: str, city: str | None = None) -> str:
    area = area.strip() or "Amman"
    if area.lower() == "dead sea":
        return "Dead Sea — Jordan Valley"
    if area.lower() == "aqaba":
        return "Aqaba"
    return f"{area} — {city or 'Amman'}"


def premium_title(lead: Lead) -> str:
    area = lead.location_area.split("—", 1)[0].strip()
    ptype = lead.property_type
    if lead.price_jod_raw >= 4_000_000 and "Villa" in ptype:
        return f"Private {area} Palace Estate"
    if lead.price_jod_raw >= 2_000_000 and "Villa" in ptype:
        return f"Landmark Villa in {area}"
    if "Chalet" in ptype:
        return f"Dead Sea Private Chalet"
    if "Apartment" in ptype:
        return f"Premium Residence in {area}"
    return f"Grand Villa in {area}"


def description(lead: Lead) -> str:
    area = lead.location_area.split("—", 1)[0].strip()
    if "Chalet" in lead.property_type:
        return "A demo chalet lead for Lumina workflow testing. Availability, pricing, and media require verification."
    if "Apartment" in lead.property_type:
        return f"A high-end {area} residence lead for Lumina workflow testing. Availability and media require verification."
    return f"A luxury {area} villa lead with substantial scale. Demo listing for workflow testing only."


def quality_score(source: str, area: str, ptype: str, price: int, size: int | None, images: int) -> int:
    score = 3
    if source == "OpenSooq":
        score += 1
    if area in {"Dabouq", "Abdoun"} and "Villa" in ptype:
        score += 1
    if price >= 1_000_000:
        score += 1
    if price >= 2_000_000:
        score += 1
    if size and size >= 700:
        score += 1
    if images >= 8:
        score += 1
    return max(1, min(5, score))


def parse_opensooq_page(source: str, area: str, property_type: str, url: str) -> list[Lead]:
    text = fetch(url)
    match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', text, re.S)
    if not match:
        return []
    payload = json.loads(html.unescape(match.group(1)))
    items = payload.get("props", {}).get("pageProps", {}).get("serpApiResponse", {}).get("listings", {}).get("items", [])
    leads: list[Lead] = []
    for item in items:
        price = parse_int(item.get("price_amount"))
        if not price or price < MIN_PRICE:
            continue
        source_url = clean_source_url(item.get("post_url", ""))
        if not source_url:
            continue
        cps = [str(x) for x in item.get("cps", [])]
        size = parse_int(cp_value(cps, "Surface Area"))
        land = parse_int(cp_value(cps, "Land Area"))
        title = str(item.get("title") or "").strip()
        if not title:
            continue
        images = int(item.get("image_count") or 0)
        contact_signal = "Direct phone available" if item.get("has_phone") else "Contact available via source"
        q = quality_score(source, area, property_type, price, size, images)
        if q < 3:
            continue
        leads.append(
            Lead(
                source=source,
                source_rank=1,
                source_url=source_url,
                raw_title=title,
                property_type=property_type,
                location_area=safe_location(str(item.get("nhood_label") or area), str(item.get("city_label") or "Amman")),
                price_jod_raw=price,
                size_sqm=size,
                land_area_sqm=land,
                bedrooms=compact_bedrooms(cps),
                bathrooms=compact_bathrooms(cps),
                contact_signal=contact_signal,
                image_count=images,
                quality_score=q,
            )
        )
    return leads


def parse_secondary_page(source: str, area: str, property_type: str, url: str) -> list[Lead]:
    """Conservative fallback parser.

    Keeps only listings with explicit JOD price and area-size signals visible in HTML.
    Does not invent URLs; non-OpenSooq source URLs stay as the source page URL.
    """
    try:
        text = fetch(url)
    except Exception:
        return []
    if "JOD" not in text:
        return []
    leads: list[Lead] = []
    for match in re.finditer(r"JOD\s*([\d,]+).*?(\d[\d,]*)\s*Sq\.\s*M\.", text, re.S | re.I):
        price = parse_int(match.group(1))
        size = parse_int(match.group(2))
        if not price or price < MIN_PRICE:
            continue
        q = quality_score(source, area, property_type, price, size, 0) - 1
        if q < 3:
            continue
        leads.append(
            Lead(
                source=source,
                source_rank=2 if source == "Bayut" else 3,
                source_url=url,
                raw_title=f"{property_type} for sale in {area}",
                property_type=property_type,
                location_area=safe_location(area),
                price_jod_raw=price,
                size_sqm=size,
                land_area_sqm=None,
                bedrooms=None,
                bathrooms=None,
                contact_signal="Contact available via source",
                image_count=0,
                quality_score=q,
            )
        )
    return leads[:5]


def dedupe(leads: list[Lead]) -> list[Lead]:
    seen: set[str] = set()
    out: list[Lead] = []
    for lead in leads:
        key = lead.source_url if lead.source == "OpenSooq" else f"{lead.source}:{lead.location_area}:{lead.price_jod_raw}:{lead.size_sqm}"
        if key in seen:
            continue
        seen.add(key)
        out.append(lead)
    return out


def to_record(index: int, lead: Lead) -> dict[str, Any]:
    return {
        "id": f"lumina-demo-{index:03d}",
        "title": premium_title(lead),
        "description": description(lead),
        "property_type": lead.property_type,
        "location_area": lead.location_area,
        "price_jod_raw": lead.price_jod_raw,
        "price_jod_test_margin": round(lead.price_jod_raw * 1.05),
        "size_sqm": lead.size_sqm,
        "land_area_sqm": lead.land_area_sqm,
        "bedrooms": lead.bedrooms,
        "bathrooms": lead.bathrooms,
        "source": lead.source,
        "source_url": lead.source_url,
        "contact_signal": lead.contact_signal,
        "verification_status": "DEMO / VERIFICATION REQUIRED",
        "image_url": PLACEHOLDER_IMAGE,
        "quality_score": lead.quality_score,
    }


def validate(records: list[dict[str, Any]]) -> None:
    if len(records) > MAX_LISTINGS:
        raise ValueError("too many records")
    html_forbidden = ("<", ">", "href", "class", "target", "rel", "title", "&quot;")
    for record in records:
        source_url = record.get("source_url")
        if not isinstance(source_url, str) or not source_url:
            raise ValueError(f"bad source_url for {record.get('id')}")
        if record.get("source") == "OpenSooq" and not re.fullmatch(r"https://jo\.opensooq\.com/search/\d+", source_url):
            raise ValueError(f"bad OpenSooq source_url: {source_url}")
        if any(token in source_url for token in html_forbidden):
            raise ValueError(f"HTML-contaminated source_url: {source_url}")
        for key in ("id", "title", "description", "property_type", "location_area", "source", "verification_status", "image_url"):
            if not record.get(key):
                raise ValueError(f"empty required field {key} for {record.get('id')}")
        if not isinstance(record.get("price_jod_raw"), int) or record["price_jod_raw"] < MIN_PRICE:
            raise ValueError(f"bad price for {record.get('id')}")


def run() -> tuple[int, list[dict[str, Any]]]:
    fetched: list[Lead] = []
    for page in TARGET_PAGES:
        try:
            fetched.extend(parse_opensooq_page(*page))
        except Exception as exc:
            print(f"WARN: failed {page[0]} {page[1]}: {exc}", file=sys.stderr)
    if len(fetched) < MAX_LISTINGS:
        for page in SECONDARY_PAGES:
            try:
                fetched.extend(parse_secondary_page(*page))
            except Exception as exc:
                print(f"WARN: failed {page[0]} {page[1]}: {exc}", file=sys.stderr)
    unique = dedupe(fetched)
    ranked = sorted(unique, key=lambda lead: (lead.quality_score, lead.price_jod_raw, lead.image_count, -lead.source_rank), reverse=True)
    records = [to_record(i + 1, lead) for i, lead in enumerate(ranked[:MAX_LISTINGS])]
    validate(records)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # Re-parse after write.
    validate(json.loads(OUTPUT.read_text(encoding="utf-8")))
    return len(fetched), records


def main() -> int:
    fetched_count, records = run()
    print(f"leads_fetched: {fetched_count}")
    print(f"leads_kept: {len(records)}")
    print("json_updated: true")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
