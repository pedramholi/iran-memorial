"""iranvictims.com — community victim database with photos."""

from __future__ import annotations

import logging
import re
from typing import AsyncIterator, Optional

from ..db.models import ExternalVictim
from ..utils.http import fetch_with_retry
from . import register
from .base import SourcePlugin

log = logging.getLogger("enricher.iranvictims")

SITE_URL = "https://iranvictims.com"


def parse_victim_cards(html: str) -> list[dict]:
    """Parse all victim cards from the single-page HTML."""
    cards = []

    card_pattern = re.compile(
        r"<div\s+class=[\"']?victim-card[\"']?\s+"
        r"data-card-id=[\"']?(\d+)[\"']?\s+"
        r"data-search=[\"']([^\"']+)[\"']",
        re.IGNORECASE,
    )

    for match in card_pattern.finditer(html):
        card_id = int(match.group(1))
        search_text = match.group(2).strip()

        # Find photo in the next ~500 chars
        img_start = match.end()
        img_end = min(img_start + 1000, len(html))
        card_html = html[img_start:img_end]

        img_match = re.search(r"data-src=[\"']([^\"']+)[\"']", card_html)
        if not img_match:
            img_match = re.search(r"data-src=([^\s>]+)", card_html)
        if not img_match:
            img_match = re.search(
                r"src=[\"']?([^\s\"'>,]+\.(?:jpg|jpeg|png|webp))[\"']?",
                card_html,
                re.I,
            )

        photo_url = img_match.group(1) if img_match else None
        if photo_url and ("placeholder" in photo_url.lower() or "default" in photo_url.lower()):
            photo_url = None

        # Split English/Farsi names from search text
        farsi_match = re.search(r"[\u0600-\u06FF]", search_text)
        if farsi_match:
            name_en = search_text[: farsi_match.start()].strip()
            rest = search_text[farsi_match.start() :].strip()
            farsi_parts = re.findall(r"[\u0600-\u06FF\u200c\s]+", rest)
            name_fa = farsi_parts[0].strip() if farsi_parts else None
        else:
            name_en = search_text.strip()
            name_fa = None

        if not name_en:
            continue

        cards.append({
            "card_id": card_id,
            "name_en": name_en,
            "name_fa": name_fa,
            "photo_url": photo_url,
        })

    return cards


@register
class IranvictimsPlugin(SourcePlugin):
    """iranvictims.com community database."""

    @property
    def name(self) -> str:
        return "iranvictims"

    @property
    def full_name(self) -> str:
        return "iranvictims.com"

    @property
    def base_url(self) -> str:
        return SITE_URL

    async def fetch_all(self) -> AsyncIterator[ExternalVictim]:
        """Single page load, parse all victim cards."""
        log.info("Loading iranvictims.com (single page)...")
        html = await fetch_with_retry(
            self.session,
            SITE_URL,
            rate_limit=(2.0, 4.0),
            cache_dir=self.cache_dir,
        )
        if not html:
            log.error("Failed to load iranvictims.com")
            return

        cards = parse_victim_cards(html)
        log.info(f"Parsed {len(cards)} victim cards")

        for card in cards:
            source_id = f"iranvictims_{card['card_id']}"
            if self.progress.is_processed(source_id):
                continue

            yield ExternalVictim(
                source_id=source_id,
                source_name=f"iranvictims.com — Victim #{card['card_id']}",
                source_url=SITE_URL,
                source_type="community_database",
                name_latin=card["name_en"],
                name_farsi=card.get("name_fa"),
                photo_url=card.get("photo_url"),
            )

            self.progress.mark_processed(source_id)

    async def fetch_detail(self, source_id: str) -> Optional[ExternalVictim]:
        return None  # iranvictims has no detail pages
