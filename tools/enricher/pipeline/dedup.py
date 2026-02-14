"""Database deduplication — find and merge duplicate victim records."""

from __future__ import annotations

import logging
import re
import time
from typing import Optional

from ..db.models import DedupStats
from ..db.pool import close_pool, get_pool
from ..db.queries import (
    delete_victim,
    load_all_victims_with_counts,
    merge_victim_data,
    migrate_photos,
    migrate_sources,
)
from ..utils.farsi import normalize_farsi
from ..utils.latin import name_word_set

log = logging.getLogger("enricher")

# Regex to strip parenthetical content like (ژینا) or (Jina)
_PARENS = re.compile(r"\s*\([^)]*\)\s*")

# Thresholds
AUTO_THRESHOLD = 50
REVIEW_THRESHOLD = 30

# Fields to count for completeness scoring
SCORED_FIELDS = [
    "name_farsi", "aliases", "date_of_birth", "place_of_birth",
    "gender", "ethnicity", "religion", "photo_url",
    "occupation_en", "occupation_fa", "education",
    "date_of_death", "age_at_death", "place_of_death", "province",
    "cause_of_death", "circumstances_en", "circumstances_fa",
    "event_context", "responsible_forces", "witnesses", "last_seen",
    "burial_location", "family_info", "dreams_en", "beliefs_en",
    "personality_en", "quotes", "tributes",
]


def _score_pair(a: dict, b: dict) -> tuple[int, list[str]]:
    """Score how likely two DB victims are the same person.

    Returns (score, reasons). High score = likely same person.
    Negative = definitely different people.
    """
    score = 0
    reasons = []

    # Farsi name match
    a_farsi = normalize_farsi(a.get("name_farsi"))
    b_farsi = normalize_farsi(b.get("name_farsi"))
    if a_farsi and b_farsi:
        if a_farsi == b_farsi:
            score += 50
            reasons.append("farsi match (+50)")
        else:
            score -= 10
            reasons.append("farsi mismatch (-10)")

    # Death date — CRITICAL
    a_dod = a.get("date_of_death")
    b_dod = b.get("date_of_death")
    if a_dod and b_dod:
        diff = abs((a_dod - b_dod).days)
        if diff == 0:
            score += 50
            reasons.append("date match (+50)")
        elif diff <= 1:
            score += 40
            reasons.append("date ±1 day (+40)")
        else:
            score -= 100
            reasons.append(f"DIFFERENT dates (-100)")
    elif a_dod or b_dod:
        # One has date, one doesn't — neutral to slight positive
        score += 5
        reasons.append("one has date (+5)")

    # Province
    a_prov = (a.get("province") or "").lower().strip()
    b_prov = (b.get("province") or "").lower().strip()
    if a_prov and b_prov:
        if a_prov == b_prov:
            score += 20
            reasons.append("province match (+20)")
        else:
            score -= 20
            reasons.append("province mismatch (-20)")

    # Age
    a_age = a.get("age_at_death")
    b_age = b.get("age_at_death")
    if a_age and b_age:
        diff = abs(a_age - b_age)
        if diff == 0:
            score += 15
            reasons.append("age match (+15)")
        elif diff <= 2:
            score += 5
            reasons.append("age close (+5)")
        else:
            score -= 30
            reasons.append("age mismatch (-30)")

    # Place of death
    a_pod = (a.get("place_of_death") or "").lower().strip()
    b_pod = (b.get("place_of_death") or "").lower().strip()
    if a_pod and b_pod and a_pod == b_pod:
        score += 10
        reasons.append("place match (+10)")

    # Cause of death
    a_cod = (a.get("cause_of_death") or "").lower().strip()
    b_cod = (b.get("cause_of_death") or "").lower().strip()
    if a_cod and b_cod and a_cod == b_cod:
        score += 10
        reasons.append("cause match (+10)")

    return score, reasons


def _completeness_score(v: dict) -> int:
    """Score a victim by data completeness (higher = richer record)."""
    score = 0

    # Verified status is the strongest signal
    if v.get("verification_status") == "verified":
        score += 100

    # Non-null fields
    for f in SCORED_FIELDS:
        val = v.get(f)
        if val is not None and val != "" and val != "unknown":
            score += 1

    # Sources and photos (from LOAD_VICTIMS_WITH_COUNTS)
    score += v.get("source_count", 0) * 5
    score += v.get("photo_count", 0) * 3

    # Having a death date is critical
    if v.get("date_of_death"):
        score += 20

    # Having a photo is valuable
    if v.get("photo_url"):
        score += 10

    return score


def _dedup_farsi_key(name_farsi: str | None) -> str:
    """Normalize Farsi name for grouping: strip parens, then normalize."""
    if not name_farsi:
        return ""
    cleaned = _PARENS.sub(" ", name_farsi).strip()
    return normalize_farsi(cleaned)


def find_duplicate_groups(
    victims: list[dict],
) -> list[list[dict]]:
    """Group victims by normalized Farsi name (with parenthetical alias stripping)
    and Latin word-set fallback. Returns groups with 2+ members."""
    by_farsi: dict[str, list[dict]] = {}
    seen_ids: set[str] = set()

    for v in victims:
        # Skip "unknown" and very short names
        name = (v.get("name_latin") or "").lower()
        if name in ("unknown", "unknwon", ""):
            continue
        raw_farsi = (v.get("name_farsi") or "").strip()
        if len(raw_farsi) < 4:
            continue

        key = _dedup_farsi_key(v.get("name_farsi"))
        if not key:
            continue
        by_farsi.setdefault(key, []).append(v)

    groups = []
    for group in by_farsi.values():
        if len(group) > 1:
            groups.append(group)
            for v in group:
                seen_ids.add(str(v["id"]))

    # Secondary pass: Latin word-set grouping for victims not yet grouped
    by_latin: dict[frozenset, list[dict]] = {}
    for v in victims:
        vid = str(v["id"])
        if vid in seen_ids:
            continue
        name = (v.get("name_latin") or "").lower()
        if name in ("unknown", "unknwon", "") or len(name) < 6:
            continue
        words = name_word_set(v.get("name_latin"))
        if words and len(words) >= 2:
            by_latin.setdefault(words, []).append(v)

    for group in by_latin.values():
        if len(group) > 1:
            groups.append(group)

    return groups


def analyze_group(
    group: list[dict], threshold: int = AUTO_THRESHOLD
) -> Optional[tuple[dict, list[tuple[dict, int, list[str]]]]]:
    """Analyze a duplicate group. Returns (winner, [(loser, score, reasons), ...]) or None.

    Only returns groups where ALL losers score >= threshold against the winner.
    """
    if len(group) < 2:
        return None

    # Score all pairs to find mergeable ones
    # For each pair, check if they're likely the same person
    mergeable: list[tuple[int, int, int, list[str]]] = []  # (i, j, score, reasons)

    for i in range(len(group)):
        for j in range(i + 1, len(group)):
            score, reasons = _score_pair(group[i], group[j])
            if score >= threshold:
                mergeable.append((i, j, score, reasons))

    if not mergeable:
        return None

    # Find connected components (victims linked by mergeable pairs)
    connected = set()
    for i, j, _, _ in mergeable:
        connected.add(i)
        connected.add(j)

    # Pick winner: highest completeness score
    candidates = [group[i] for i in connected]
    candidates.sort(key=_completeness_score, reverse=True)
    winner = candidates[0]
    winner_id = str(winner["id"])

    # All others in the connected set are losers
    losers = []
    for v in candidates[1:]:
        score, reasons = _score_pair(winner, v)
        if score >= threshold:
            losers.append((v, score, reasons))

    if not losers:
        return None

    return winner, losers


async def run_dedup(
    database_url: str,
    dry_run: bool = True,
    include_review: bool = False,
    limit: Optional[int] = None,
    verbose: bool = False,
) -> DedupStats:
    """Run the deduplication pipeline.

    Args:
        database_url: PostgreSQL connection string
        dry_run: Preview without writing (default True for safety)
        include_review: Also merge 30-49 score pairs
        limit: Max groups to process
        verbose: Show per-group details
    """
    stats = DedupStats()
    threshold = REVIEW_THRESHOLD if include_review else AUTO_THRESHOLD

    pool = await get_pool(database_url)

    try:
        # 1. Load all victims with counts
        log.info("Loading all victims with counts...")
        t0 = time.time()
        victims = await load_all_victims_with_counts(pool)
        log.info(f"Loaded {len(victims)} victims ({time.time()-t0:.1f}s)")

        # 2. Find duplicate groups
        groups = find_duplicate_groups(victims)
        stats.groups_found = len(groups)
        log.info(f"Found {len(groups)} potential duplicate groups")

        # 3. Analyze each group
        processed = 0
        for group in groups:
            if limit and processed >= limit:
                break

            result = analyze_group(group, AUTO_THRESHOLD)
            result_review = None
            if result is None and include_review:
                result_review = analyze_group(group, REVIEW_THRESHOLD)

            if result:
                stats.auto_merge += 1
            elif result_review:
                result = result_review
                stats.review += 1
            else:
                stats.skipped += 1
                continue

            winner, losers = result
            processed += 1

            if verbose:
                log.info(
                    f"\n  GROUP: {winner.get('name_latin')} / "
                    f"{winner.get('name_farsi')}"
                )
                log.info(
                    f"  WINNER: {winner['slug']} "
                    f"(completeness={_completeness_score(winner)}, "
                    f"sources={winner.get('source_count', 0)}, "
                    f"photos={winner.get('photo_count', 0)}, "
                    f"status={winner.get('verification_status')})"
                )

            # 4. Merge each loser into winner
            for loser, score, reasons in losers:
                if verbose:
                    log.info(
                        f"  MERGE: {loser['slug']} → {winner['slug']} "
                        f"(score={score}: {', '.join(reasons)})"
                    )

                if not dry_run:
                    winner_id = str(winner["id"])
                    loser_id = str(loser["id"])

                    # Merge data (fill NULLs)
                    await merge_victim_data(pool, winner_id, loser)

                    # Migrate sources
                    src_count = await migrate_sources(pool, winner_id, loser_id)
                    stats.sources_migrated += src_count

                    # Migrate photos
                    photo_count = await migrate_photos(pool, winner_id, loser_id)
                    stats.photos_migrated += photo_count

                    # Delete loser
                    await delete_victim(pool, loser_id)

                stats.victims_merged += 1
                stats.victims_deleted += 1

        log.info(f"\nProcessed {processed} groups")

    finally:
        await close_pool()

    return stats
