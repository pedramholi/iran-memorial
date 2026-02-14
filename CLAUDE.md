# Iran Memorial — Claude Reference Guide

## What is this?

A digital memorial for the victims of the Islamic Republic of Iran (1979–present). Every victim gets their own Wikipedia-style page, embedded in a chronological timeline. Trilingual (Farsi, English, German). Open source, community-driven.

**Repository:** [github.com/pedramholi/iran-memorial](https://github.com/pedramholi/iran-memorial)
**Status:** Phase 2C complete — Live at memorial.n8ncloud.de

---

## WAT Architecture (Workflows, Agents, Tools)

This project follows the WAT framework, which separates concerns so that probabilistic AI handles reasoning while deterministic code handles execution.

**Layer 1: Workflows** — Markdown SOPs in `workflows/`. Each workflow defines objectives, required inputs, which tools to use, expected outputs, and edge case handling. Written in plain language.

**Layer 2: Agents** — The AI (you). Read the relevant workflow, run tools in the correct sequence, handle failures gracefully, ask clarifying questions when needed. Connect intent to execution without trying to do everything yourself.

**Layer 3: Tools** — Python and TypeScript scripts in `tools/` that do actual work: API calls, data transformations, scraping, database operations. These scripts are consistent, testable, and fast.

**Why this matters:** When AI tries to handle every step directly, accuracy drops. By offloading execution to deterministic scripts, the AI stays focused on orchestration and decision-making.

**Self-Improvement Loop:** Every failure improves the system: (1) identify what broke, (2) fix the tool, (3) verify the fix, (4) update the workflow, (5) move on with a more robust system.

---

## AI Working Principles

1. **Analyze First** — Search codebase for relevant files before suggesting changes
2. **Discuss Before Major Changes** — Get approval before larger implementations
3. **Explain Concisely** — Brief explanations of what and why
4. **Keep It Simple** — Minimal code, avoid over-engineering
5. **Maintain This Doc** — Update CLAUDE.md with architectural changes
6. **Never Speculate** — Always read files before making statements about them
7. **Follow Documentation Governance** — YYMMDD prefix for temporal docs, update LEARNINGS.md after resolving issues
8. **Plan Before Implementing** — Non-trivial changes need Plan + Log documents (see `docs/PLANNING_GUIDE.md`)
9. **Data Over Features** — More documented victims is always higher priority than new UI features
10. **Respect Sensitivity** — This documents real people who were killed. Every code change affects how their stories are told.
11. **Use Existing Tools First** — Before building anything new, check `tools/` for existing scripts. Only create new tools when nothing exists for the task.
12. **Learn From Failures** — When a tool fails: read the full error, fix the script, verify, and update the workflow so it never happens again. Check before re-running if it uses paid API credits.
13. **Keep Workflows Current** — Update workflow SOPs when you find better methods, discover constraints, or encounter recurring issues. Never overwrite workflows without asking.

---

## Documentation Governance

### Naming Convention

| Doc Type | Format | Example |
|----------|--------|---------|
| Permanent (living docs) | `NAME.md` | `LEARNINGS.md`, `CLAUDE.md` |
| Temporal (plans, reviews) | `YYMMDD-NAME.md` | `260209-PHASE1_PLAN.md` |

### Living Documents (never delete, always update)

| Document | Purpose |
|----------|---------|
| `CLAUDE.md` | AI reference — project overview, stack, patterns, commands |
| `docs/VISION.md` | Ideensammlung, Zielgruppen, Wirkung, Inspiration — lebendes Visionsdokument |
| `docs/LEARNINGS.md` | Zentrale Wissensdatenbank — Bugs, Decisions, Patterns |
| `docs/PROJECT.md` | Ausführliche Projektdokumentation (Was/Warum/Wer/Wie) |
| `docs/PLANNING_GUIDE.md` | Plan + Log Template und Prinzipien |

### When to Create Which Doc

| Situation | Action |
|-----------|--------|
| Bug behoben | Eintrag in `docs/LEARNINGS.md` (Bugs & Root Causes) |
| Architektur-Entscheidung getroffen | Eintrag in `docs/LEARNINGS.md` (Architecture Decisions) |
| Deployment-Fallstrick gelernt | Eintrag in `docs/LEARNINGS.md` (Deployment Gotchas) |
| Neues Feature / Refactoring (>100 Zeilen) | Plan + Log erstellen (siehe `docs/PLANNING_GUIDE.md`) |
| Datenimport durchgeführt | LOG-Eintrag in aktiver Log-Datei |

### Archiving

Erledigte temporale Dokumente nach `docs/archive/` verschieben:
```bash
git mv docs/YYMMDD-NAME.md docs/archive/YYMMDD-NAME.md
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Database | PostgreSQL 16 (self-hosted) |
| ORM | Prisma 6 |
| Search | PostgreSQL `tsvector` (simple config) + `pg_trgm` |
| i18n | next-intl (URL-based: `/fa/`, `/en/`, `/de/`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Validation | Zod (API input validation) |
| Rate Limiting | In-memory sliding window (`lib/rate-limit.ts`) |
| Container | Docker Compose (PostgreSQL + App) |
| Webserver | Nginx (reverse proxy, Cloudflare) |

---

## Project Structure

```
iran-memorial/
├── app/
│   ├── [locale]/                # /fa/, /en/, /de/
│   │   ├── page.tsx             # Homepage (stats, search, recent victims)
│   │   ├── layout.tsx           # RTL/LTR per locale, fonts, header/footer
│   │   ├── timeline/page.tsx    # Chronological timeline
│   │   ├── victims/
│   │   │   ├── page.tsx         # Search + paginated list
│   │   │   └── [slug]/page.tsx  # Victim detail (ISR, revalidate: 3600)
│   │   ├── events/
│   │   │   ├── page.tsx         # All events
│   │   │   └── [slug]/page.tsx  # Event detail + linked victims
│   │   ├── submit/page.tsx      # Community submission form
│   │   └── about/page.tsx       # About the project
│   ├── api/
│   │   ├── search/route.ts      # GET /api/search?q=...
│   │   └── submit/route.ts      # POST submission
│   └── layout.tsx               # Root layout
├── components/                  # Header, Footer, LanguageSwitcher, VictimCard, SearchBar
├── i18n/                        # config, routing, request, navigation
├── lib/
│   ├── db.ts                    # Prisma client singleton
│   ├── queries.ts               # Reusable DB queries + localized() helper
│   ├── rate-limit.ts            # In-memory rate limiter for API routes
│   └── utils.ts                 # formatDate, formatNumber, formatKilledRange
├── messages/                    # fa.json, en.json, de.json (~102 keys each)
├── prisma/
│   ├── schema.prisma            # 4 models: Victim, Event, Source, Submission
│   ├── seed.ts                  # YAML → PostgreSQL import
│   └── init.sql                 # pg_trgm extension
├── data/                        # Seed data (YAML)
│   ├── events/timeline.yaml     # 12 historical events
│   └── victims/                 # 4,378 victim YAML files + template
├── tools/                       # WAT: Data pipeline scripts (Python + TypeScript)
│   ├── parse_wiki_wlf.py        # Wikipedia WLF parser
│   ├── scrape_boroumand.py      # Boroumand Foundation scraper
│   ├── extract-fields.ts        # AI field extraction
│   └── ...                      # 20+ data processing scripts
├── workflows/                   # WAT: Markdown SOPs for repeatable processes
├── .tmp/                        # Temporary processing files (gitignored, disposable)
├── docs/                        # All documentation
├── docker-compose.yml           # PostgreSQL 16 + Next.js app
├── Dockerfile                   # Multi-stage production build
└── nginx.conf                   # Reverse proxy config
```

---

## Database Schema

**ORM:** Prisma 6 | **Schema:** `prisma/schema.prisma`

| Model | Fields | Purpose |
|-------|--------|---------|
| `Victim` | 44 | Complete life record (identity, life, death, aftermath, admin) |
| `Event` | 17 | Timeline events with titles in 3 languages |
| `Source` | 7 | M:N between victims/events and sources |
| `Submission` | 8 | Community submissions with review workflow |

**Key Relations:** Victim → Event (many-to-one), Victim → Source (one-to-many), Event → Source (one-to-many)

**Localized Fields Pattern:** `fieldEn`, `fieldFa`, `fieldDe` — accessed via `localized(item, 'field', locale)` helper in `lib/queries.ts`

**Critical:** German content fields (`titleDe`, `descriptionDe`, etc.) exist in schema but are null — to be filled in Phase 3.

---

## Essential Commands

```bash
# Development
npm run dev                    # Next.js dev server (Turbopack, port 3000)
npm run build                  # Production build
npm run lint                   # ESLint

# Testing
npm test                       # Run all 124 tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report (v8)

# Database
npx prisma generate            # Generate Prisma client after schema changes
npx prisma migrate dev         # Create + apply migration
npx prisma db seed             # Import YAML seed data
npx prisma studio              # Visual DB editor (port 5555)

# Docker
docker compose up -d db        # Start PostgreSQL only
docker compose up              # Start PostgreSQL + App
docker compose down            # Stop everything

# Git
git add . && git commit        # Stage + commit
git push                       # Push to GitHub
```

---

## Configuration

**Environment (.env):**
```bash
DATABASE_URL="postgresql://memorial:PASSWORD@localhost:5432/iran_memorial"
POSTGRES_PASSWORD=memorial_dev_password
NEXTAUTH_SECRET=change-this-to-a-random-string
NEXTAUTH_URL=http://localhost:3000
```

**Important:** `.env` is in `.gitignore`. Template in `.env.example`.

---

## Common Patterns

### Localized Content
```typescript
// lib/queries.ts — get field by locale with English fallback
localized(victim, "circumstances", locale)
// → victim.circumstancesFa || victim.circumstancesEn (for fa locale)
```

### Page with Locale
```typescript
// All pages receive locale from params
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // ...
}
```

### DB Query with Graceful Fallback
```typescript
// Pages handle missing DB gracefully (for dev without PostgreSQL)
let data = defaultValue;
try {
  data = await queryFunction();
} catch {
  // DB not available — show static content
}
```

### ISR for Detail Pages
```typescript
export const revalidate = 3600; // Re-generate page every hour
```

### RTL-Safe CSS
```css
/* Use logical properties, never left/right */
margin-inline-start: 1rem;   /* NOT margin-left */
padding-inline-end: 0.5rem;  /* NOT padding-right */
border-start: 2px solid;     /* NOT border-left */
```

---

## Seed Data

| Type | Count | Files |
|------|-------|-------|
| Events | 12 | `data/events/timeline.yaml` |
| Victims | ~28,400 | `data/victims/{year}/slug.yaml` |

**Victims:** ~28,400 YAML files across 8 sources (Wikipedia, HRANA, IHR, iranvictims.com, Amnesty International, Boroumand Foundation historical, Boroumand Foundation enrichment, manual). Deduplicated via `tools/dedup_victims.py` (206) + `tools/dedup_2026_internal.py` (254) + `-2` suffix dedup (939) + `tools/dedup-db.ts` (3,786) + `tools/dedup-round5.ts` (102) + `-2` suffix round 6 (20) = 5,318 total duplicates removed. 31,203 victims in production DB.
**Events:** Revolution 1979, Reign of Terror 1981–85, Iran-Iraq War, 1988 Massacre, Chain Murders, Student Protests 1999, Green Movement 2009, Bloody November 2019, Woman Life Freedom 2022, 2026 Massacres

---

## Known Issues

| Issue | Status | Details |
|-------|--------|---------|
| No local PostgreSQL | ✅ Fixed | Local PostgreSQL synced from production via pg_dump. 31,203 victims. |
| Middleware deprecation | ⚠️ Cosmetic | Next.js 16 warns about middleware → proxy migration. next-intl still uses middleware. Functional. |
| Tests | ✅ Done | Vitest suite — 124 tests (lib, API, components). Run: `npm test`. SOP: `workflows/testing.md` |
| Server disk at 95% | ⚠️ Critical | 2.0 GB free. Docker reclaimable: ~6.2 GB (images 2.4 GB + build cache 3.9 GB). Prune ASAP. |
| Neda Soltan duplicate | ⚠️ Low | Two YAML entries for same person (different slugs). Low priority. |
| Boroumand fetch | ✅ Complete | All 26,815 entries processed. 12,290 new in final run. Pipeline: gender → seed → dedup → deploy done. |
| External image optimization | ✅ Fixed | iranrights.org Cloudflare blocks server IP → `unoptimized` prop on `<Image>`. Browser fetches directly. |

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| v0.1.0 | 2026-02-09 | Phase 1: Full project setup — Next.js 16, Prisma, i18n, 8 pages, seed script, Docker, docs |
| v0.2.0 | 2026-02-09 | Phase 2A/B: Multi-source data collection — 7 sources, 4,378 victims, dedup, enrichment |
| v0.3.0 | 2026-02-12 | Phase 2C: Deployment + AI enrichment (14K fields), source dedup (222K removed), pagination, security hardening |
| v0.4.0 | 2026-02-13 | Phase 3: Boroumand historical import — 31,203 victims in DB, 5,318 duplicates removed, parallel scraper (8× faster), AI+regex extraction (35,764 fields) |

**Current:** v0.4.0 | Next.js 16 | TypeScript | Prisma 6 | Tailwind v4 | 3 languages | 31,203 victims | Live at memorial.n8ncloud.de

---

## Data Pipeline Scripts

| Script | Purpose | Output |
|--------|---------|--------|
| `tools/parse_wiki_wlf.py` | Wikipedia WLF table parser | 422 YAML files |
| `tools/parse_hrana_82day.py` | HRANA 82-Day PDF parser | 352 new victims |
| `tools/import_iranvictims_csv.py` | iranvictims.com CSV import | 3,752 victims |
| `tools/parse_amnesty_children.py` | Amnesty children report | 41 enriched + 3 new |
| `tools/dedup_victims.py` | Deduplication (3 strategies) | -206 duplicates |
| `tools/dedup_2026_internal.py` | Internal 2026 dedup (Farsi name) | -254 duplicates |
| `tools/scrape_boroumand.py` | Boroumand Foundation scraper (4 workers) | 26,815 entries (all processed) |
| `tools/extract-fields.ts` | AI field extraction (Claude Haiku / GPT-4o-mini) | 31,600 fields from 12,200 victims |
| `tools/extract-fields-regex.ts` | Pattern-based field extraction (no API) | 4,164 fields from 1,980 victims |
| `tools/dedup-sources.ts` | Source deduplication | -221,800 duplicate sources |
| `tools/seed-new-only.ts` | Create-only DB seed (no upsert) | Incremental DB population |
| `tools/sync-gender-to-db.ts` | Sync gender YAML → DB | 6,271 gender updates |
| `tools/infer_gender.py` | Gender inference from first names | ~500 Persian names, 100% coverage on named victims |
| `tools/dedup-db.ts` | DB-level dedup (named + Unknown text) | -3,786 duplicates (493 sources moved) |
| `tools/dedup-round5.ts` | Farsi normalization dedup (NULL-date + char variants) | -102 duplicates (68 sources moved) |

## Data Collection Status

| Source | Type | New Victims | Enrichment | Status |
|--------|------|-------------|------------|--------|
| Wikipedia WLF | Table parse | 422 | — | DONE |
| HRANA 82-Day Report | PDF parse | 352 | — | DONE |
| iranvictims.com CSV | CSV import | 3,752 | — | DONE |
| IHR Suspicious Deaths | Manual | 4 | 18 cross-validated | DONE |
| Amnesty Children Report | PDF parse | 3 | 41 enriched (155 fields) | DONE |
| Boroumand Enrichment | HTML scrape | 0 | 203 enriched (64 FA, 33 photos) | DONE |
| Boroumand Historical | HTML scrape | ~26,815 processed | Full biographical text | **DONE** |
| Deduplication (Round 1) | Script | -206 | — | DONE |
| Deduplication (Round 2) | Script | -265 | Sources merged into originals | DONE |
| Deduplication (Round 3) | Script | -939 | -2 suffix duplicates merged | DONE |
| Deduplication (Round 4) | Script | -3,786 | Named + Unknown text dedup | DONE |
| Deduplication (Round 5) | Script | -102 | Farsi normalization + NULL-date | DONE |
| Deduplication (Round 6) | SQL | -20 | -2 suffix merge (Farsi+date match) | DONE |
| AI Field Extraction R1 | GPT-4o-mini | 0 | 15,787 fields from 8,051 victims | DONE |
| AI Field Extraction R2 | GPT-4o-mini | 0 | 31,600 fields from 12,200 victims | DONE |
| Regex Field Extraction | Pattern-based | 0 | 4,164 fields from 1,980 victims | DONE |
| Source Dedup | SQL script | 0 | -221,800 duplicate sources | DONE |
| Event Death Tolls | Research | 0 | Corrected with diaspora/NGO sources | DONE |
| UI: Show highest estimate | Code change | 0 | formatKilledRange → only high | DONE |
| Fallback data sync | Code change | 0 | All death tolls + counts updated | DONE |
| Event Linking | SQL mapping | 0 | 13,704 new event links (15% → 59%) | DONE |
| **Total in DB** | | **31,203** | | |

**Open:** HRANA 20-Day (~0–20), Amnesty other reports (~10–30), IHR direct contact, KHRN 2025/2026

## Detailed Documentation

| Document | Purpose |
|----------|---------|
| `docs/VISION.md` | Vision, Ideensammlung, Zielgruppen, Inspiration, Design-Prinzipien |
| `docs/PROJECT.md` | Ausführliche Projektdokumentation (14 Kapitel) |
| `docs/PLANNING_GUIDE.md` | Plan + Log Templates, 9 Prinzipien |
| `docs/LEARNINGS.md` | Bugs, Architecture Decisions, Patterns |
| `docs/260209-PHASE1_PLAN.md` | Phase 1–4 Roadmap mit Metriken |
| `docs/260209-PHASE1_LOG.md` | Phase 1 Ausführungslog (14 Einträge) |
| `docs/260209-PHASE2_LOG.md` | Phase 2+3 Ausführungslog (42 Einträge) |

---

## Git Commit Format

```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude <model> <noreply@anthropic.com>
```

**Types:** feat, fix, refactor, perf, test, docs, chore, data
**Scopes:** victims, events, search, i18n, db, ui, api, deploy, seed

---

**Last Updated:** 2026-02-14
**Maintainer:** Pedram Holi
