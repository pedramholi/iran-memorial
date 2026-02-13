# Iran Memorial — Claude Reference Guide

## What is this?

A digital memorial for the victims of the Islamic Republic of Iran (1979–present). Every victim gets their own Wikipedia-style page, embedded in a chronological timeline. Trilingual (Farsi, English, German). Open source, community-driven.

**Repository:** [github.com/pedramholi/iran-memorial](https://github.com/pedramholi/iran-memorial)
**Status:** Phase 2C complete — Live at memorial.n8ncloud.de

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
| Victims | ~32,500 | `data/victims/{year}/slug.yaml` |

**Victims:** ~32,500 YAML files across 8 sources (Wikipedia, HRANA, IHR, iranvictims.com, Amnesty International, Boroumand Foundation historical, Boroumand Foundation enrichment, manual). Deduplicated via `scripts/dedup_victims.py` (206) + `scripts/dedup_2026_internal.py` (254) + `-2` suffix dedup (939) = 1,410 total duplicates removed. 35,152 victims in production DB.
**Events:** Revolution 1979, Reign of Terror 1981–85, Iran-Iraq War, 1988 Massacre, Chain Murders, Student Protests 1999, Green Movement 2009, Bloody November 2019, Woman Life Freedom 2022, 2026 Massacres

---

## Known Issues

| Issue | Status | Details |
|-------|--------|---------|
| No local PostgreSQL | ⚠️ Open | Docker not installed on dev machine. DB queries fall back to empty state. SSH tunnel to server: `ssh -L 5434:localhost:5434 root@188.245.96.212` |
| Middleware deprecation | ⚠️ Cosmetic | Next.js 16 warns about middleware → proxy migration. next-intl still uses middleware. Functional. |
| No tests | ⚠️ Open | 0% coverage. |
| Server disk at 90% | ⚠️ Monitor | 3.9 GB free. Docker build cache reclaimable: ~3.8 GB. Prune regularly. |
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
| v0.4.0 | 2026-02-13 | Phase 3: Boroumand historical import — 35,152 victims in DB, 1,410 duplicates removed, parallel scraper (8× faster) |

**Current:** v0.4.0 | Next.js 16 | TypeScript | Prisma 6 | Tailwind v4 | 3 languages | 35,152 victims | Live at memorial.n8ncloud.de

---

## Data Pipeline Scripts

| Script | Purpose | Output |
|--------|---------|--------|
| `scripts/parse_wiki_wlf.py` | Wikipedia WLF table parser | 422 YAML files |
| `scripts/parse_hrana_82day.py` | HRANA 82-Day PDF parser | 352 new victims |
| `scripts/import_iranvictims_csv.py` | iranvictims.com CSV import | 3,752 victims |
| `scripts/parse_amnesty_children.py` | Amnesty children report | 41 enriched + 3 new |
| `scripts/dedup_victims.py` | Deduplication (3 strategies) | -206 duplicates |
| `scripts/dedup_2026_internal.py` | Internal 2026 dedup (Farsi name) | -254 duplicates |
| `scripts/scrape_boroumand.py` | Boroumand Foundation scraper (4 workers) | 26,815 entries (all processed) |
| `scripts/extract-fields.ts` | AI field extraction (GPT-4o-mini) | 15,787 fields from 8,051 victims |
| `scripts/dedup-sources.ts` | Source deduplication | -221,800 duplicate sources |
| `scripts/seed-new-only.ts` | Create-only DB seed (no upsert) | Incremental DB population |
| `scripts/sync-gender-to-db.ts` | Sync gender YAML → DB | 6,271 gender updates |
| `scripts/infer_gender.py` | Gender inference from first names | ~500 Persian names, 100% coverage on named victims |

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
| AI Field Extraction | GPT-4o-mini | 0 | 15,787 fields from 8,051 victims | DONE |
| Source Dedup | SQL script | 0 | -221,800 duplicate sources | DONE |
| Event Death Tolls | Research | 0 | Corrected with diaspora/NGO sources | DONE |
| **Total in DB** | | **35,152** | | |

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

**Last Updated:** 2026-02-13
**Maintainer:** Pedram Holi
