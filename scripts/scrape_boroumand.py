#!/usr/bin/env python3
"""
Scrape and import victims from the Boroumand Foundation / Omid Memorial (iranrights.org).

Phases:
  1. browse  — Crawl browse pages, extract victim IDs + names → master list
  2. match   — Match master list against existing YAML files
  3. detail  — Fetch EN + FA detail pages for matches
  4. enrich  — Update YAML files with Farsi names, photos, sources

Usage:
  python scripts/scrape_boroumand.py browse [--start N] [--end N] [--resume]
  python scripts/scrape_boroumand.py match
  python scripts/scrape_boroumand.py detail [--limit N] [--force]
  python scripts/scrape_boroumand.py enrich [--dry-run]

Year → Page mapping (ascending by date):
  Pages   1– 15: Unknown date
  Pages  16–221: 1979–1987
  Pages 222–293: 1988 (massacre — ~3,600 victims!)
  Pages 294–513: 1989–2021
  Pages 514–524: 2022 (WLF)
  Pages 525–545: 2023–2026
"""

import argparse
import json
import os
import re
import ssl
import sys
import time
import random
from datetime import datetime
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

# macOS Python doesn't trust system certs by default
SSL_CTX = ssl.create_default_context()
try:
    import certifi
    SSL_CTX.load_verify_locations(certifi.where())
except ImportError:
    SSL_CTX.check_hostname = False
    SSL_CTX.verify_mode = ssl.CERT_NONE

# --- Configuration ---
BASE_URL = "https://www.iranrights.org"
BROWSE_URL = BASE_URL + "/memorial/browse/date/{page}"
DETAIL_URL = BASE_URL + "/memorial/story/{id}/{slug}"
DETAIL_FA_URL = BASE_URL + "/fa/memorial/story/{id}/{slug}"

SCRIPT_DIR = Path(__file__).parent
CACHE_DIR = SCRIPT_DIR / ".boroumand_cache"
MASTER_FILE = SCRIPT_DIR / "boroumand_master.json"
MATCHES_FILE = SCRIPT_DIR / "boroumand_matches.json"
DETAILS_FILE = SCRIPT_DIR / "boroumand_details.json"
DETAIL_CACHE = CACHE_DIR / "detail"
VICTIMS_DIR = SCRIPT_DIR.parent / "data" / "victims"

TOTAL_PAGES = 545
MIN_DELAY = 1.5
MAX_DELAY = 2.5

HEADERS = {
    "User-Agent": "iran-memorial-project/1.0 (human-rights-research; github.com/pedramholi/iran-memorial)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9,fa;q=0.8",
}


def fetch(url, retries=3):
    """Fetch URL with retries and exponential backoff."""
    for attempt in range(retries):
        try:
            req = Request(url, headers=HEADERS)
            with urlopen(req, timeout=30, context=SSL_CTX) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except (HTTPError, URLError, TimeoutError, OSError) as e:
            wait = (attempt + 1) * 5
            if attempt < retries - 1:
                print(f"  ⚠ Retry {attempt+1}/{retries}: {e} (waiting {wait}s)")
                time.sleep(wait)
            else:
                print(f"  ✗ FAILED after {retries} attempts: {url}: {e}")
                return None
    return None


def delay():
    """Random delay between requests."""
    time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))


# ============================================================
# Phase 1: Browse — crawl browse/date pages → master list
# ============================================================

def parse_browse_page(html):
    """Extract victim entries from a browse page HTML."""
    entries = []

    # Each entry is a <div class='memorial-list clearfix'> block
    blocks = re.split(r"<div class='memorial-list clearfix'>", html)

    for block in blocks[1:]:  # skip first (before first entry)
        # Photo
        photo_match = re.search(r'<img src="(/actorphotos/[^"]+)"', block)
        photo_url = photo_match.group(1) if photo_match else None

        # Name + link
        link_match = re.search(
            r"<a href='/memorial/story/(-?\d+)/([^']+)'>([^<]+)</a>", block
        )
        if not link_match:
            continue

        victim_id = int(link_match.group(1))
        slug = link_match.group(2)
        name = link_match.group(3).strip()

        # Mode of killing
        mode_match = re.search(
            r"<strong>Mode of Killing</strong>:\s*([^<]+)", block
        )
        mode = mode_match.group(1).strip().rstrip(";").strip() if mode_match else None

        entries.append({
            "id": victim_id,
            "slug": slug,
            "name": name,
            "photo_url": photo_url,
            "mode": mode,
        })

    return entries


def cmd_browse(args):
    """Crawl browse pages and build master list."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Resume support
    progress_file = CACHE_DIR / "browse_progress.json"
    master = []
    seen_ids = set()
    last_page = 0

    if args.resume and progress_file.exists():
        with open(progress_file) as f:
            progress = json.load(f)
        master = progress.get("entries", [])
        last_page = progress.get("last_page", 0)
        seen_ids = {e["id"] for e in master}
        print(f"Resuming from page {last_page + 1}, {len(master)} entries loaded")

    start = args.start or (last_page + 1)
    end = args.end or TOTAL_PAGES

    print(f"Scraping browse pages {start}–{end} ...")

    for page in range(start, end + 1):
        url = BROWSE_URL.format(page=page)
        html = fetch(url)

        if html is None:
            print(f"  Page {page}: FAILED — skipping")
            continue

        entries = parse_browse_page(html)
        new = [e for e in entries if e["id"] not in seen_ids]
        master.extend(new)
        seen_ids.update(e["id"] for e in new)

        print(f"  Page {page}/{end}: {len(entries)} entries ({len(new)} new) — total {len(master)}")

        # Save progress every 10 pages
        if page % 10 == 0:
            with open(progress_file, "w") as f:
                json.dump({"last_page": page, "entries": master}, f)

        delay()

    # Save final
    with open(MASTER_FILE, "w") as f:
        json.dump(master, f, indent=2, ensure_ascii=False)
    with open(progress_file, "w") as f:
        json.dump({"last_page": end, "entries": master}, f)

    with_photo = sum(1 for e in master if e.get("photo_url"))
    print(f"\nDone: {len(master)} victims → {MASTER_FILE}")
    print(f"  With photo: {with_photo}")
    print(f"  Without photo: {len(master) - with_photo}")


# ============================================================
# Phase 2: Match — compare master list against existing YAMLs
# ============================================================

def normalize(name):
    """Normalize name for matching."""
    name = name.lower().strip()
    name = re.sub(r'[\u200c\u200d]', ' ', name)  # zero-width joiners
    name = re.sub(r"[-'`]", '', name)
    name = re.sub(r'\s+', ' ', name)
    return name


def load_existing_victims():
    """Load name + metadata from all YAML files."""
    victims = {}
    for yf in VICTIMS_DIR.rglob("*.yaml"):
        if yf.name == "_template.yaml":
            continue
        content = yf.read_text(errors="replace")

        name_m = re.search(r'^name_latin:\s*"?([^"\n]+)"?', content, re.M)
        farsi_m = re.search(r'^name_farsi:\s*"?([^"\n]+)"?', content, re.M)
        date_m = re.search(r'^date_of_death:\s*(\S+)', content, re.M)

        name = name_m.group(1).strip() if name_m else None
        if not name or name == "null":
            continue

        farsi = farsi_m.group(1).strip() if farsi_m else None
        if farsi == "null":
            farsi = None

        date = date_m.group(1).strip() if date_m else None
        if date == "null":
            date = None

        victims[str(yf)] = {
            "name": name,
            "name_farsi": farsi,
            "date_of_death": date,
            "file": str(yf),
            "slug": yf.stem,
        }
    return victims


def cmd_match(args):
    """Match master list against existing YAML files."""
    if not MASTER_FILE.exists():
        print(f"Error: {MASTER_FILE} not found. Run 'browse' first.")
        sys.exit(1)

    with open(MASTER_FILE) as f:
        master = json.load(f)
    print(f"Loaded {len(master)} Boroumand entries")

    existing = load_existing_victims()
    print(f"Loaded {len(existing)} existing YAML victims")

    # Build lookup by normalized name
    by_norm = {}
    for path, info in existing.items():
        norm = normalize(info["name"])
        by_norm.setdefault(norm, []).append(info)

    matches = []
    unmatched = []

    for entry in master:
        norm = normalize(entry["name"])

        if norm in by_norm:
            for ex in by_norm[norm]:
                matches.append({
                    "boroumand_id": entry["id"],
                    "boroumand_slug": entry["slug"],
                    "boroumand_name": entry["name"],
                    "boroumand_photo": entry.get("photo_url"),
                    "yaml_file": ex["file"],
                    "yaml_name": ex["name"],
                    "has_farsi": ex["name_farsi"] is not None,
                    "match_type": "exact",
                })
        else:
            # Try partial: check if all name parts appear in any existing name
            parts = set(norm.split())
            found = False
            if len(parts) >= 2:
                for path, info in existing.items():
                    ex_parts = set(normalize(info["name"]).split())
                    if parts == ex_parts:
                        matches.append({
                            "boroumand_id": entry["id"],
                            "boroumand_slug": entry["slug"],
                            "boroumand_name": entry["name"],
                            "boroumand_photo": entry.get("photo_url"),
                            "yaml_file": info["file"],
                            "yaml_name": info["name"],
                            "has_farsi": info["name_farsi"] is not None,
                            "match_type": "reorder",
                        })
                        found = True
                        break
            if not found:
                unmatched.append(entry)

    result = {
        "matches": matches,
        "unmatched_count": len(unmatched),
    }
    with open(MATCHES_FILE, "w") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    exact = sum(1 for m in matches if m["match_type"] == "exact")
    reorder = sum(1 for m in matches if m["match_type"] == "reorder")
    need_farsi = sum(1 for m in matches if not m["has_farsi"])
    has_photo = sum(1 for m in matches if m.get("boroumand_photo"))

    print(f"\nResults:")
    print(f"  Matches: {len(matches)} (exact: {exact}, reorder: {reorder})")
    print(f"  Unmatched (potential new): {len(unmatched)}")
    print(f"  Matches needing Farsi name: {need_farsi}")
    print(f"  Matches with Boroumand photo: {has_photo}")
    print(f"\nSaved to {MATCHES_FILE}")


# ============================================================
# Phase 3: Detail — fetch EN + FA detail pages for matches
# ============================================================

def parse_detail_en(html):
    """Parse English detail page → dict of fields."""
    data = {}

    # Name from <h1 class='page-top'>
    h1_m = re.search(r"<h1 class='page-top'>([^<]+)</h1>", html)
    if h1_m:
        data["name"] = h1_m.group(1).strip()

    # Photo (real photo, not placeholder)
    photo_m = re.search(r'<img[^>]+src="(/actorphotos/[^"]+)"', html)
    if photo_m:
        data["photo_url"] = photo_m.group(1)

    # Fields from <div><em>Label:</em> Value</div>
    field_map = {
        "Age": "age",
        "Nationality": "nationality",
        "Religion": "religion",
        "Civil Status": "civil_status",
        "Date of Killing": "date_of_killing",
        "Location of Killing": "location",
        "Mode of Killing": "mode_of_killing",
        "Charges": "charges",
        "Date of Birth": "date_of_birth",
        "Place of Birth": "place_of_birth",
        "Occupation": "occupation",
        "Gravesite location is known": "gravesite_known",
    }

    for m in re.finditer(r'<em>([^<]+)</em>\s*([^<]+)', html):
        label = m.group(1).strip().rstrip(':')
        value = m.group(2).strip()
        if value and value != "---" and label in field_map:
            data[field_map[label]] = value

    # Narrative: "About this Case" section
    narr_m = re.search(
        r'<h2[^>]*>About this Case</h2>\s*(.*?)(?=<h2|<footer|<div\s+id=)',
        html, re.DOTALL
    )
    if narr_m:
        text = re.sub(r'<[^>]+>', ' ', narr_m.group(1))
        text = re.sub(r'&\w+;', ' ', text)  # HTML entities
        text = re.sub(r'\s+', ' ', text).strip()
        if len(text) > 50:
            data["narrative"] = text[:5000]

    return data


def parse_detail_fa(html):
    """Parse Farsi detail page → extract Farsi name."""
    data = {}

    # Farsi name from <h1 class='page-top'>
    h1_m = re.search(r"<h1 class='page-top'>([^<]+)</h1>", html)
    if h1_m:
        text = h1_m.group(1).strip()
        if re.search(r'[\u0600-\u06FF]', text):
            data["name_farsi"] = text

    return data


def cmd_detail(args):
    """Fetch detail pages for unique matched Boroumand IDs."""
    if not MATCHES_FILE.exists():
        print(f"Error: {MATCHES_FILE} not found. Run 'match' first.")
        sys.exit(1)

    with open(MATCHES_FILE) as f:
        match_data = json.load(f)

    matches = match_data["matches"]

    # Deduplicate: only fetch each Boroumand ID once
    seen = set()
    unique = []
    for m in matches:
        if m["boroumand_id"] not in seen:
            seen.add(m["boroumand_id"])
            unique.append(m)

    # Prioritize: those needing Farsi names first
    unique = sorted(unique, key=lambda m: (m.get("has_farsi", False),))

    if args.limit:
        unique = unique[:args.limit]

    print(f"Fetching detail pages for {len(unique)} unique Boroumand IDs "
          f"(from {len(matches)} match pairs)...")

    DETAIL_CACHE.mkdir(parents=True, exist_ok=True)

    fetched = 0
    cached = 0
    for i, match in enumerate(unique):
        vid = match["boroumand_id"]
        slug = match["boroumand_slug"]
        cache_file = DETAIL_CACHE / f"{vid}.json"

        if cache_file.exists() and not args.force:
            cached += 1
            continue

        # Fetch English
        en_html = fetch(DETAIL_URL.format(id=vid, slug=slug))
        delay()

        # Fetch Farsi
        fa_html = fetch(DETAIL_FA_URL.format(id=vid, slug=slug))
        delay()

        detail = {"boroumand_id": vid, "slug": slug}
        if en_html:
            detail["en"] = parse_detail_en(en_html)
        if fa_html:
            detail["fa"] = parse_detail_fa(fa_html)

        # Cache
        with open(cache_file, "w") as f:
            json.dump(detail, f, indent=2, ensure_ascii=False)

        fetched += 1
        fa_name = detail.get("fa", {}).get("name_farsi", "—")
        print(f"  [{i+1}/{len(unique)}] {match['boroumand_name']} → {fa_name}")

    print(f"\nDone: {fetched} fetched, {cached} cached, {len(unique)} total")


# ============================================================
# Phase 4: Enrich — update existing YAML files
# ============================================================

def update_yaml_null_field(content, field, value):
    """Replace a null field in YAML with a value. Only updates if currently null."""
    if value is None:
        return content

    # Match field: null or field: ""
    pattern = rf'^({re.escape(field)}:\s*)(?:null|""|\'\')\s*$'
    match = re.search(pattern, content, re.M)
    if not match:
        return content  # field not null or doesn't exist

    # Quote the value
    if isinstance(value, str) and any(c in value for c in ':"#{}[]&*!|>\''):
        safe = '"' + value.replace('\\', '\\\\').replace('"', '\\"') + '"'
    elif isinstance(value, str):
        safe = f'"{value}"'
    else:
        safe = str(value)

    return content[:match.start()] + match.group(1) + safe + content[match.end():]


def add_source(content, url, name):
    """Add a source entry if not already present."""
    if url in content:
        return content

    block = f'\n  - url: "{url}"\n    name: "{name}"\n    type: memorial_database'

    # Find sources section
    m = re.search(r'^sources:\s*$', content, re.M)
    if m:
        return content[:m.end()] + block + content[m.end():]
    return content


MONTH_MAP = {
    "January": "01", "February": "02", "March": "03", "April": "04",
    "May": "05", "June": "06", "July": "07", "August": "08",
    "September": "09", "October": "10", "November": "11", "December": "12",
}


def parse_boroumand_date(date_str):
    """Convert 'September 21, 2022' → '2022-09-21'. Returns None on failure."""
    if not date_str:
        return None
    m = re.match(r'(\w+)\s+(\d{1,2}),?\s+(\d{4})', date_str)
    if m and m.group(1) in MONTH_MAP:
        return f"{m.group(3)}-{MONTH_MAP[m.group(1)]}-{int(m.group(2)):02d}"
    # Try year-only
    m = re.match(r'(\d{4})', date_str)
    if m:
        return m.group(1)
    return None


def dates_match(yaml_date, boroumand_date_str):
    """Check if YAML date and Boroumand date refer to the same death.

    Allows ±1 day tolerance (common in cross-source reporting).
    Returns: True (confirmed match), False (confirmed mismatch), None (can't tell).
    """
    if not yaml_date or not boroumand_date_str:
        return None  # can't validate

    b_date = parse_boroumand_date(boroumand_date_str)
    if not b_date:
        return None

    # Both are full dates (YYYY-MM-DD)
    if len(yaml_date) >= 10 and len(b_date) >= 10:
        if yaml_date[:10] == b_date[:10]:
            return True
        # Allow ±1 day tolerance
        try:
            from datetime import timedelta
            y = datetime.strptime(yaml_date[:10], "%Y-%m-%d")
            b = datetime.strptime(b_date[:10], "%Y-%m-%d")
            return abs((y - b).days) <= 1
        except ValueError:
            pass

    # At least compare years
    return yaml_date[:4] == b_date[:4]


def cmd_enrich(args):
    """Enrich existing YAML files with date-validated Boroumand data."""
    if not MATCHES_FILE.exists():
        print(f"Error: {MATCHES_FILE} not found. Run 'match' first.")
        sys.exit(1)

    with open(MATCHES_FILE) as f:
        match_data = json.load(f)

    matches = match_data["matches"]

    # Load detail cache for each Boroumand ID
    detail_by_id = {}
    for cache_file in DETAIL_CACHE.glob("*.json"):
        with open(cache_file) as f:
            d = json.load(f)
        detail_by_id[d["boroumand_id"]] = d

    print(f"Processing {len(matches)} match pairs ({len(detail_by_id)} details loaded)...")

    enriched = 0
    total_changes = 0
    skipped_date = 0
    skipped_no_detail = 0

    for match in matches:
        vid = match["boroumand_id"]
        yaml_file = match["yaml_file"]

        if not os.path.exists(yaml_file):
            continue

        detail = detail_by_id.get(vid)
        if not detail:
            skipped_no_detail += 1
            continue

        # Date validation: skip if dates are confirmed different
        en = detail.get("en", {})
        content = Path(yaml_file).read_text()

        yaml_date_m = re.search(r'^date_of_death:\s*(\S+)', content, re.M)
        yaml_date = yaml_date_m.group(1) if yaml_date_m else None
        if yaml_date == "null":
            yaml_date = None

        date_ok = dates_match(yaml_date, en.get("date_of_killing"))
        if date_ok is False:
            skipped_date += 1
            if args.dry_run:
                b_date = parse_boroumand_date(en.get("date_of_killing", ""))
                print(f"  SKIP: {Path(yaml_file).name} — date mismatch "
                      f"(YAML: {yaml_date}, Boroumand: {b_date})")
            continue

        original = content
        changes = []

        # 1. Farsi name
        fa_name = detail.get("fa", {}).get("name_farsi")
        if fa_name:
            old = content
            content = update_yaml_null_field(content, "name_farsi", fa_name)
            if content != old:
                changes.append(f"name_farsi={fa_name}")

        # 2. Fields from EN detail
        if en.get("religion"):
            old = content
            content = update_yaml_null_field(content, "religion", en["religion"])
            if content != old:
                changes.append(f"religion={en['religion']}")

        if en.get("occupation"):
            old = content
            content = update_yaml_null_field(content, "occupation", en["occupation"])
            if content != old:
                changes.append(f"occupation={en['occupation']}")

        if en.get("place_of_birth"):
            old = content
            content = update_yaml_null_field(content, "place_of_birth", en["place_of_birth"])
            if content != old:
                changes.append(f"place_of_birth={en['place_of_birth']}")

        if en.get("date_of_birth"):
            old = content
            content = update_yaml_null_field(content, "date_of_birth", en["date_of_birth"])
            if content != old:
                changes.append(f"date_of_birth={en['date_of_birth']}")

        # 3. Photo URL
        photo = en.get("photo_url") or match.get("boroumand_photo")
        if photo:
            full_url = BASE_URL + photo if photo.startswith("/") else photo
            old = content
            content = update_yaml_null_field(content, "photo", full_url)
            if content != old:
                changes.append("photo")

        # 4. Boroumand source
        b_slug = detail.get("slug", match["boroumand_slug"])
        boroumand_url = f"{BASE_URL}/memorial/story/{vid}/{b_slug}"
        old = content
        content = add_source(content, boroumand_url, "Abdorrahman Boroumand Center — Omid Memorial")
        if content != old:
            changes.append("source=boroumand")

        # 5. Update metadata
        if changes:
            content = re.sub(
                r'^last_updated:.*$',
                f'last_updated: {datetime.now().strftime("%Y-%m-%d")}',
                content, count=1, flags=re.M
            )
            content = re.sub(
                r'^updated_by:.*$',
                'updated_by: "boroumand-import"',
                content, count=1, flags=re.M
            )

        if content != original:
            if args.dry_run:
                print(f"  DRY: {Path(yaml_file).name}: {', '.join(changes)}")
            else:
                Path(yaml_file).write_text(content)
                print(f"  UPD: {Path(yaml_file).name}: {', '.join(changes)}")
            enriched += 1
            total_changes += len(changes)

    prefix = "DRY RUN — " if args.dry_run else ""
    print(f"\n{prefix}Done: {enriched} files, {total_changes} field changes")
    print(f"  Skipped (date mismatch): {skipped_date}")
    print(f"  Skipped (no detail): {skipped_no_detail}")


# ============================================================
# Main
# ============================================================

def main():
    p = argparse.ArgumentParser(description="Scrape Boroumand Foundation memorial")
    sub = p.add_subparsers(dest="cmd", required=True)

    b = sub.add_parser("browse", help="Crawl browse pages → master list")
    b.add_argument("--start", type=int, help="Start page (default: 1)")
    b.add_argument("--end", type=int, help="End page (default: 545)")
    b.add_argument("--resume", action="store_true", help="Resume from last progress")

    sub.add_parser("match", help="Match against existing YAMLs")

    d = sub.add_parser("detail", help="Fetch EN + FA detail pages")
    d.add_argument("--limit", type=int, help="Max victims to fetch")
    d.add_argument("--force", action="store_true", help="Re-fetch cached")

    e = sub.add_parser("enrich", help="Update YAML files")
    e.add_argument("--dry-run", action="store_true", help="Don't write files")

    args = p.parse_args()

    {"browse": cmd_browse, "match": cmd_match, "detail": cmd_detail, "enrich": cmd_enrich}[args.cmd](args)


if __name__ == "__main__":
    main()
