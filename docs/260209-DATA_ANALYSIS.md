# Phase 2A: Data Analysis Report — WLF Victims

> **Hinweis (2026-02-14):** `scripts/` wurde zu `tools/` umbenannt (WAT-Framework). Historische Referenzen in diesem Dokument beziehen sich auf den alten Pfad.

**Date:** 2026-02-09
**Source:** Wikipedia "Deaths during the Mahsa Amini protests"
**Method:** Automated parsing via `scripts/parse_wikipedia_wlf.py`

---

## Executive Summary

We parsed the Wikipedia article "Deaths during the Mahsa Amini protests" and extracted **421 individual victim records** (plus 1 existing Mahsa Amini entry = 422 total YAML files). The data confirms that Wikipedia alone provides a solid structural skeleton but lacks the depth needed for a meaningful memorial. Enrichment from HRANA, IHR, and Amnesty is essential.

---

## 1. Field Coverage Analysis

### From Wikipedia (automated parse)

| Field | Filled | Total | Coverage | Notes |
|-------|--------|-------|----------|-------|
| `name_latin` | 422 | 422 | **100%** | Always available; some have multiple transliterations |
| `date_of_death` | 418 | 422 | **99%** | 4 entries marked "dateless" |
| `place_of_death` | 418 | 422 | **99%** | City-level; usually no specific location within city |
| `province` | 408 | 422 | **96%** | Auto-mapped from city names |
| `age_at_death` | 127 | 422 | **30%** | Often missing, especially for Zahedan victims |
| `cause_of_death` | 115 | 422 | **27%** | "Gunshot" dominant; many just have no detail |
| `circumstances` | 122 | 422 | **29%** | Detailed narratives for notable cases only |

### Not available from Wikipedia at all (0%)

| Field | Expected Source |
|-------|----------------|
| `name_farsi` | HRANA, IHR, Hengaw |
| `gender` | Can be inferred from names (semi-automated) |
| `ethnicity` | HRANA, Hengaw (Kurdish, Baluch, etc.) |
| `photo` | HRANA, IranWire, Iran International, social media |
| `occupation` | Amnesty reports, HRANA detailed profiles |
| `education` | Amnesty, IranWire feature stories |
| `family` | Amnesty, news features |
| `dreams` | Feature stories, family interviews |
| `beliefs` | Feature stories |
| `personality` | Feature stories |
| `quotes` | Social media, family interviews |
| `burial` | HRANA, news reports |
| `family_persecution` | Amnesty, HRANA |
| `legal_proceedings` | IHR, Amnesty |
| `tributes` | News, social media |
| `responsible_forces` | Amnesty, HRANA, IHR |

---

## 2. Geographic Distribution

### Top 15 Locations

| City | Count | % of Total | Province |
|------|-------|-----------|----------|
| **Zahedan** | 129 | 30.6% | Sistan-Baluchestan |
| Tehran | 45 | 10.7% | Tehran |
| Sanandaj | 16 | 3.8% | Kurdistan |
| Karaj | 15 | 3.6% | Alborz |
| Khash | 15 | 3.6% | Sistan-Baluchestan |
| Rasht | 11 | 2.6% | Gilan |
| Kermanshah | 9 | 2.1% | Kermanshah |
| Nowshahr | 9 | 2.1% | Mazandaran |
| Mahabad | 8 | 1.9% | West Azerbaijan |
| Saqqez | 7 | 1.7% | Kurdistan |
| Amol | 6 | 1.4% | Mazandaran |
| Balo/Urmia | 4 | 0.9% | West Azerbaijan |
| Piranshahr | 4 | 0.9% | West Azerbaijan |
| Babol | 4 | 0.9% | Mazandaran |
| Zanjan | 4 | 0.9% | Zanjan |

### Key Insight: Zahedan Dominance

**129 of 422 victims (30.6%)** are from Zahedan — the "Bloody Friday" massacre of September 30, 2022. These entries have the **least data quality**: most lack age, cause of death, and circumstances. They represent the single largest event but also the biggest data gap.

### Province Breakdown

| Province | Count | Notable |
|----------|-------|---------|
| Sistan-Baluchestan | 146 | Zahedan + Khash + others; Baluch minority |
| Tehran | 50 | Capital; includes Shahr-e Rey, Pakdasht |
| Kurdistan | 27 | Sanandaj, Saqqez, Marivan; Kurdish minority |
| Alborz | 17 | Karaj, Hashtgerd |
| West Azerbaijan | 22 | Mahabad, Urmia, Piranshahr; Kurdish/Azerbaijani |
| Mazandaran | 20 | Amol, Babol, Nowshahr, Sari |
| Gilan | 17 | Rasht, Rezvanshahr, Langroud |
| Kermanshah | 13 | Kermanshah, Eslamabad-e Gharb |
| Other | 110 | Distributed across remaining provinces |

---

## 3. Age Distribution

Of the 127 victims with known ages:

| Metric | Value |
|--------|-------|
| Youngest | 2 years* |
| Oldest | 70 years |
| Average | 21.8 years |
| Median | ~19 years |
| Children (<18) | **57** (45% of known ages) |

*The age "2" is for Mirshekar(i), a toddler killed in Zahedan.

### Age Brackets

| Age Range | Count | % of Known |
|-----------|-------|-----------|
| 0-12 | 10 | 8% |
| 13-17 | 47 | 37% |
| 18-25 | 38 | 30% |
| 26-35 | 22 | 17% |
| 36-50 | 7 | 6% |
| 50+ | 3 | 2% |

### Key Insight: Children & Youth

**45% of victims with known ages were children under 18.** This aligns with Amnesty International's special reports on the killing of children. The young age profile underscores the movement's character as primarily a youth-led uprising.

---

## 4. Cause of Death Analysis

| Cause | Count | % of Known |
|-------|-------|-----------|
| Gunshot | 99 | 86% |
| Beating | 10 | 9% |
| Prison fire (Evin) | 4 | 3% |
| Other/Unclear | 2 | 2% |
| **Unknown** | **307** | — |

### Key Insight

The vast majority of documented killings were by gunshot. Most entries without a specific cause are from the Zahedan massacre where the Wikipedia sources simply list names without details. The "beating" category notably includes high-profile cases (Nika Shakarami, Sarina Esmailzadeh, Asra Panahi).

---

## 5. Temporal Distribution

| Date | Deaths | Notable Event |
|------|--------|---------------|
| Sep 16 | 1 | Mahsa Amini dies |
| Sep 18 | 1 | First protest death |
| Sep 19-20 | 19 | Protests spread nationwide |
| Sep 21 | 52 | Bloodiest early day |
| Sep 22 | 20 | Continued crackdown |
| Sep 23 | 12 | |
| Sep 24-29 | 16 | |
| **Sep 30** | **114** | **"Bloody Friday" — Zahedan massacre** |
| Oct 1-15 | 44 | Continued nationwide protests |
| Oct 16-31 | 50 | 40th day anniversary protests |
| Nov 1-16 | 42 | Including Khash massacre, Kian Pirfalak |
| Nov 23, 2023 | 1 | Execution of Milad Zohrevand |

### Key Insight

September 30 ("Bloody Friday") accounts for **27% of all listed deaths** in a single day. The protests peaked in late September/early October, with a secondary spike around October 26 (40th day anniversary).

---

## 6. Data Quality Assessment

### Quality Tiers

**Tier 1 — Well Documented (5-8 fields filled):** ~30 victims
- High-profile cases: Mahsa Amini, Nika Shakarami, Hadis Najafi, Sarina Esmailzadeh, Kian Pirfalak
- Have: name, age, date, location, detailed circumstances, multiple sources
- Often have Wikipedia articles of their own

**Tier 2 — Moderately Documented (3-4 fields):** ~90 victims
- Have: name, date, location, cause of death
- Missing: age, detailed circumstances

**Tier 3 — Minimally Documented (2-3 fields):** ~300 victims
- Have: name, date, location
- Missing: age, cause, circumstances
- Predominantly Zahedan and Khash victims

### Verification Status

All 421 newly created entries are marked `status: "unverified"`. To move to "verified":
- Cross-reference with at least 2 independent sources
- Confirm name spelling
- Confirm date and location

---

## 7. Schema Recommendations

### Fields to Consider Removing or Making Optional
None — all existing fields are valid. The issue isn't the schema; it's data availability. The schema correctly anticipates that most fields will be null for most victims.

### Fields to Consider Adding
1. **`alternative_names`** — Many entries have "/" separated name variants (already stored in `aliases`)
2. **`transliteration_notes`** — Document spelling variations explicitly
3. **`data_quality_tier`** — 1/2/3 classification to help UI display decisions

### Fields Rarely Fillable from Public Sources
- `dreams`, `beliefs`, `personality`, `quotes` — These are **aspirational** fields. They will only be filled for well-known victims or through community submissions. This is by design: they represent what we lose when someone is killed — mostly, we don't even know what they dreamed of.
- `burial` details — Available mainly for high-profile cases where burial was contested

### Schema Verdict: **No changes needed.** The schema is well-designed for progressive enrichment.

---

## 8. Effort Estimation

### Automated (Phase 2A — completed)
- **Time:** ~2 hours (script writing + debugging + execution)
- **Output:** 421 victim YAML files
- **Fields per victim:** 3-6 (name, date, location, sometimes age/cause/circumstances)
- **Cost:** Zero (Wikipedia API)

### Semi-automated enrichment (Phase 2B — projected)
- **Per victim (Tier 3):** ~5-10 minutes — search HRANA/IHR for Farsi name, verify
- **Per victim (Tier 2):** ~15-30 minutes — cross-reference, add details
- **Per victim (Tier 1):** ~1-2 hours — full narrative, sources, photos
- **Total for 421 victims:** ~80-150 hours at mixed tier levels

### Recommended Approach
1. Focus enrichment on Tier 1 first (30 victims, ~40 hours)
2. Batch-process Tier 3 for Farsi names only (300 victims, ~25-50 hours)
3. Leave Tier 2 for community contributions

---

## 9. Import Pipeline Assessment

### Current Pipeline
```
Wikipedia → Python script → YAML files → prisma seed.ts → PostgreSQL
```

### Pipeline Status
- Wikipedia → YAML: ✅ Working (`scripts/parse_wikipedia_wlf.py`)
- YAML → PostgreSQL: ⚠️ Written but untested (`prisma/seed.ts`)
- Enrichment: ❌ Manual only

### Recommendations
1. **Test seed script** with the 422 YAML files against a real PostgreSQL
2. **Build enrichment tooling** — a simple script that takes a victim slug and opens relevant search URLs (HRANA, IHR) for manual review
3. **Gender inference** — could be semi-automated from name patterns (common Persian/Kurdish/Baluch names)

---

## 10. Decision Points for Phase 2B

1. **Scope for deployment:** Deploy with 422 victims (even with thin data) — better to have names listed than to wait for perfection
2. **Enrichment priority:** Focus on the ~30 Tier 1 victims first, then gender inference for all
3. **Schema changes:** None needed — schema is solid
4. **UI consideration:** Pages with only name/date/location should still look dignified — design for sparse data
5. **Zahedan special handling:** Consider a single "Bloody Friday" narrative page that links to individual victims, since most have minimal individual data

---

## Appendix: File Statistics

```
Total YAML files in data/victims/2022/: 422
Total YAML files across all years:     425 (+ Neda 2009, Maryam 1988)
Average file size:                      ~500 bytes
Total data volume:                      ~210 KB
```

---

Last updated: 2026-02-09
