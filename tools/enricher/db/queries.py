"""Database queries for the enrichment pipeline."""

from __future__ import annotations

from typing import Any

import asyncpg

# Load all victims (lightweight fields for matching)
LOAD_VICTIMS = """
    SELECT id, slug, name_latin, name_farsi, aliases,
           date_of_death, age_at_death, place_of_death, province,
           cause_of_death, photo_url, circumstances_en,
           gender, religion, place_of_birth, date_of_birth,
           occupation_en, education, responsible_forces,
           event_context, verification_status, data_source
    FROM victims
    ORDER BY slug
"""

# Load source URLs grouped by victim
LOAD_SOURCE_URLS = """
    SELECT victim_id::text, url
    FROM sources
    WHERE victim_id IS NOT NULL AND url IS NOT NULL
"""

# Enrich: update only NULL fields using COALESCE
ENRICH_VICTIM = """
    UPDATE victims SET
        name_farsi          = COALESCE(name_farsi, $2),
        date_of_birth       = COALESCE(date_of_birth, $3),
        place_of_birth      = COALESCE(place_of_birth, $4),
        gender              = CASE WHEN gender IS NULL OR gender = 'unknown' THEN COALESCE($5, gender) ELSE gender END,
        religion            = COALESCE(religion, $6),
        photo_url           = COALESCE(photo_url, $7),
        occupation_en       = COALESCE(occupation_en, $8),
        education           = COALESCE(education, $9),
        age_at_death        = COALESCE(age_at_death, $10),
        place_of_death      = COALESCE(place_of_death, $11),
        province            = COALESCE(province, $12),
        cause_of_death      = COALESCE(cause_of_death, $13),
        circumstances_en    = CASE
                                WHEN circumstances_en IS NULL THEN $14
                                WHEN $14 IS NOT NULL AND LENGTH($14) > LENGTH(circumstances_en) * 3 / 2
                                THEN $14
                                ELSE circumstances_en
                              END,
        event_context       = COALESCE(event_context, $15),
        responsible_forces  = COALESCE(responsible_forces, $16),
        updated_at          = NOW()
    WHERE id = $1
    RETURNING id, slug
"""

# Insert source if not already present (dedup by victim_id + url)
INSERT_SOURCE = """
    INSERT INTO sources (victim_id, url, name, source_type)
    SELECT $1, $2, $3, $4
    WHERE NOT EXISTS (
        SELECT 1 FROM sources WHERE victim_id = $1 AND url = $2
    )
"""

# Insert new victim
INSERT_VICTIM = """
    INSERT INTO victims (
        slug, name_latin, name_farsi, date_of_birth, place_of_birth,
        gender, religion, photo_url, occupation_en, education,
        date_of_death, age_at_death, place_of_death, province,
        cause_of_death, circumstances_en, event_context, responsible_forces,
        verification_status, data_source
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        'unverified', $19
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id, slug
"""


async def load_all_victims(pool: asyncpg.Pool) -> list[dict]:
    """Load all victims for building the match index."""
    async with pool.acquire() as conn:
        rows = await conn.fetch(LOAD_VICTIMS)
    return [dict(r) for r in rows]


async def load_all_source_urls(pool: asyncpg.Pool) -> dict[str, set[str]]:
    """Load all source URLs grouped by victim UUID."""
    async with pool.acquire() as conn:
        rows = await conn.fetch(LOAD_SOURCE_URLS)
    result: dict[str, set[str]] = {}
    for r in rows:
        result.setdefault(r["victim_id"], set()).add(r["url"])
    return result


async def batch_enrich(
    pool: asyncpg.Pool,
    updates: list[tuple[Any, ...]],
    batch_size: int = 100,
) -> int:
    """Execute enrichment updates in batches."""
    total = 0
    async with pool.acquire() as conn:
        for i in range(0, len(updates), batch_size):
            batch = updates[i : i + batch_size]
            await conn.executemany(ENRICH_VICTIM, batch)
            total += len(batch)
    return total


async def batch_insert_sources(
    pool: asyncpg.Pool,
    sources: list[tuple[str, str, str, str]],
    batch_size: int = 100,
) -> int:
    """Insert sources in batches, skipping duplicates."""
    total = 0
    async with pool.acquire() as conn:
        for i in range(0, len(sources), batch_size):
            batch = sources[i : i + batch_size]
            await conn.executemany(INSERT_SOURCE, batch)
            total += len(batch)
    return total


async def batch_insert_victims(
    pool: asyncpg.Pool,
    victims: list[tuple[Any, ...]],
) -> int:
    """Insert new victims, skipping conflicts."""
    count = 0
    async with pool.acquire() as conn:
        for v in victims:
            result = await conn.fetchrow(INSERT_VICTIM, *v)
            if result:
                count += 1
    return count
