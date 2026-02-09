# Iran Memorial — Claude Reference Guide

## What is this?

A digital memorial for the victims of the Islamic Republic of Iran (1979–present). Every victim gets their own Wikipedia-style page, embedded in a chronological timeline. Trilingual (Farsi, English, German). Open source, community-driven.

**Repository:** [github.com/pedramholi/iran-memorial](https://github.com/pedramholi/iran-memorial)
**Status:** Phase 1 complete (local dev), Phase 2 pending (deployment)

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
| Container | Docker Compose (PostgreSQL + App) |
| Webserver | Nginx (reverse proxy) |

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
│   └── utils.ts                 # formatDate, formatNumber, formatKilledRange
├── messages/                    # fa.json, en.json, de.json (~102 keys each)
├── prisma/
│   ├── schema.prisma            # 4 models: Victim, Event, Source, Submission
│   ├── seed.ts                  # YAML → PostgreSQL import
│   └── init.sql                 # pg_trgm extension
├── data/                        # Seed data (YAML)
│   ├── events/timeline.yaml     # 12 historical events
│   └── victims/                 # 3 exemplary entries + template
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
| Victims | 3 | `data/victims/{year}/slug.yaml` |

**Victims:** Mahsa Amini (2022), Neda Agha-Soltan (2009), Maryam Kazemi (1988 representative)
**Events:** Revolution 1979, Reign of Terror 1981–85, Iran-Iraq War, 1988 Massacre, Chain Murders, Student Protests 1999, Green Movement 2009, Bloody November 2019, Woman Life Freedom 2022, 2026 Massacres

---

## Known Issues

| Issue | Status | Details |
|-------|--------|---------|
| No local PostgreSQL | ⚠️ Open | Docker not installed on dev machine. DB queries fall back to empty state. |
| Middleware deprecation | ⚠️ Cosmetic | Next.js 16 warns about middleware → proxy migration. next-intl still uses middleware. Functional. |
| Seed script untested | ⚠️ Open | Written but not run against real DB yet. Will test in Phase 2. |
| No tests | ⚠️ Open | 0% coverage. Phase 2 priority. |

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| v0.1.0 | 2026-02-09 | Phase 1: Full project setup — Next.js 16, Prisma, i18n, 8 pages, seed script, Docker, docs |

**Current:** v0.1.0 | Next.js 16 | TypeScript | Prisma 6 | Tailwind v4 | 3 languages | 0 tests

---

## Detailed Documentation

| Document | Purpose |
|----------|---------|
| `docs/VISION.md` | Vision, Ideensammlung, Zielgruppen, Inspiration, Design-Prinzipien |
| `docs/PROJECT.md` | Ausführliche Projektdokumentation (14 Kapitel) |
| `docs/PLANNING_GUIDE.md` | Plan + Log Templates, 9 Prinzipien |
| `docs/LEARNINGS.md` | Bugs, Architecture Decisions, Patterns |
| `docs/260209-PHASE1_PLAN.md` | Phase 1–4 Roadmap mit Metriken |
| `docs/260209-PHASE1_LOG.md` | Phase 1 Ausführungslog (14 Einträge) |

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

**Last Updated:** 2026-02-09
**Maintainer:** Pedram Holi
