# Agent Instructions

You're working inside the **WAT framework** (Workflows, Agents, Tools). This architecture separates concerns so that probabilistic AI handles reasoning while deterministic code handles execution. That separation is what makes this system reliable.

## The WAT Architecture

**Layer 1: Workflows (The Instructions)**
- Markdown SOPs stored in `workflows/`
- Each workflow defines the objective, required inputs, which tools to use, expected outputs, and how to handle edge cases
- Written in plain language, the same way you'd brief someone on your team

**Layer 2: Agents (The Decision-Maker)**
- This is your role. You're responsible for intelligent coordination.
- Read the relevant workflow, run tools in the correct sequence, handle failures gracefully, and ask clarifying questions when needed
- You connect intent to execution without trying to do everything yourself
- Example: If you need to enrich data, don't parse HTML directly. Read `workflows/data-import.md`, figure out the required inputs, then execute `python3 -m tools.enricher enrich -s <plugin>`

**Layer 3: Tools (The Execution)**
- Active framework: `tools/enricher/` — async Python pipeline for data enrichment, dedup, matching
- Historical scripts: `tools/legacy/` — one-shot import/dedup scripts from Phases 1–3 (reference only)
- Credentials and API keys are stored in `.env`
- These scripts are consistent, testable, and fast

**Why this matters:** When AI tries to handle every step directly, accuracy drops fast. If each step is 90% accurate, you're down to 59% success after just five steps. By offloading execution to deterministic scripts, you stay focused on orchestration and decision-making where you excel.

## How to Operate

**1. Look for existing tools first**
Before building anything new, check `tools/enricher/` based on what your workflow requires. Only create new scripts when nothing exists for that task.

**2. Learn and adapt when things fail**
When you hit an error:
- Read the full error message and trace
- Fix the script and retest (if it uses paid API calls or credits, check with me before running again)
- Document what you learned in the workflow (rate limits, timing quirks, unexpected behavior)

**3. Keep workflows current**
Workflows should evolve as you learn. When you find better methods, discover constraints, or encounter recurring issues, update the workflow. That said, don't create or overwrite workflows without asking unless I explicitly tell you to.

## The Self-Improvement Loop

Every failure is a chance to make the system stronger:
1. Identify what broke
2. Fix the tool
3. Verify the fix works
4. Update the workflow with the new approach
5. Move on with a more robust system

---

## What Is This?

A digital memorial for the victims of the Islamic Republic of Iran (1979–present). Every victim gets their own Wikipedia-style page, embedded in a chronological timeline. Trilingual (Farsi, English, German). Open source, community-driven.

**Repository:** [github.com/pedramholi/iran-memorial](https://github.com/pedramholi/iran-memorial)
**Live:** [memorial.n8ncloud.de](https://memorial.n8ncloud.de)

---

## AI Working Principles

1. **Analyze First** — Search codebase for relevant files before suggesting changes
2. **Discuss Before Major Changes** — Get approval before larger implementations
3. **Keep It Simple** — Minimal code, avoid over-engineering
4. **Never Speculate** — Always read files before making statements about them
5. **Data Over Features** — More documented victims is always higher priority than new UI features
6. **Respect Sensitivity** — This documents real people who were killed. Every code change affects how their stories are told.
7. **Use Existing Tools First** — Check `tools/enricher/` before building new scripts
8. **Keep Workflows Current** — Update SOPs when you find better methods or encounter issues

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Database | PostgreSQL 16 (Docker, 30.795 victims) |
| ORM | Prisma 6 |
| Search | PostgreSQL `tsvector` + `pg_trgm` |
| i18n | next-intl (URL-based: `/fa/`, `/en/`, `/de/`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Validation | Zod (API input validation) |
| Testing | Vitest + Testing Library (124 tests) + pytest (53 enricher tests) |
| Container | Docker Compose (PostgreSQL + App) |
| Webserver | Nginx (reverse proxy, Cloudflare) |
| Data Pipeline | Python asyncpg + aiohttp (`tools/enricher/`) |

---

## Project Structure

```
iran-memorial/
├── app/
│   ├── [locale]/                # /fa/, /en/, /de/
│   │   ├── page.tsx             # Homepage (stats, search, recent victims)
│   │   ├── layout.tsx           # RTL/LTR per locale, fonts, header/footer
│   │   ├── timeline/page.tsx    # Chronological timeline (proportional spacing)
│   │   ├── statistics/page.tsx  # Charts and statistics
│   │   ├── victims/
│   │   │   ├── page.tsx         # Search + paginated list (photos-first sort)
│   │   │   └── [slug]/page.tsx  # Victim detail with PhotoGallery
│   │   ├── events/
│   │   │   ├── page.tsx         # All events
│   │   │   └── [slug]/page.tsx  # Event detail + EventHero + linked victims
│   │   ├── submit/page.tsx      # Community submission form
│   │   └── about/page.tsx       # About the project
│   ├── api/
│   │   ├── search/route.ts      # GET /api/search?q=...
│   │   └── submit/route.ts      # POST submission
│   └── layout.tsx               # Root layout
├── components/                  # Header, Footer, LanguageSwitcher, VictimCard,
│                                # SearchBar, FilterBar, PhotoGallery, EventHero
├── i18n/                        # config, routing, request, navigation
├── lib/
│   ├── db.ts                    # Prisma client singleton
│   ├── queries.ts               # DB queries + localized() helper
│   ├── rate-limit.ts            # In-memory rate limiter
│   ├── translate.ts             # DB value translations (cause, age, source)
│   └── utils.ts                 # formatDate, formatNumber, formatKilledRange
├── messages/                    # fa.json, en.json, de.json (~102 keys each)
├── prisma/
│   ├── schema.prisma            # 5 models: Victim, Event, Source, Photo, Submission
│   ├── seed.ts                  # Event seed (timeline.yaml → DB)
│   └── init.sql                 # pg_trgm extension
├── __tests__/                   # Vitest test suite (124 tests, 11 files)
├── tools/
│   ├── enricher/                # WAT: Active data pipeline framework
│   │   ├── cli.py               # CLI: enrich, check, dedup, status, list
│   │   ├── db/                  # pool, queries, models (asyncpg)
│   │   ├── pipeline/            # orchestrator, matcher, enricher, dedup
│   │   ├── sources/             # boroumand, iranvictims, iranrevolution, wikipedia_wlf
│   │   ├── tests/               # pytest test suite (53 tests)
│   │   └── utils/               # farsi, latin, http, progress, provinces
│   ├── translate_de.py           # Batch EN→DE translation (GPT-4o-mini, asyncpg)
│   └── legacy/                  # Historical one-shot scripts (Phase 1–3)
├── workflows/                   # WAT: Markdown SOPs
│   ├── data-import.md           # Enricher-based import workflow
│   ├── dedup-pipeline.md        # Dedup workflow (enricher dedup)
│   ├── deploy.md                # Docker deployment procedure
│   └── testing.md               # Vitest test structure and guidelines
├── docs/                        # Living documentation
│   ├── LEARNINGS.md             # Bugs, decisions, patterns (520+ lines)
│   ├── PROJECT.md               # Full project documentation
│   ├── VISION.md                # Design vision and inspiration
│   ├── PLANNING_GUIDE.md        # Plan + Log templates
│   ├── IRAN_KNOWLEDGE.md        # Historical context 1979–2026
│   └── archive/                 # Completed phase plans and logs
├── data/events/timeline.yaml    # 12 historical events (seed source)
├── docker-compose.yml           # PostgreSQL 16 + Next.js app
├── Dockerfile                   # Multi-stage production build
└── nginx.conf                   # Reverse proxy config
```

---

## Database

**ORM:** Prisma 6 | **Schema:** `prisma/schema.prisma` | **30.795 Victims** (nach Dedup)

| Model | Fields | Purpose |
|-------|--------|---------|
| `Victim` | 51 | Complete life record (identity, life, death, aftermath, admin) + 7 `_de` fields |
| `Event` | 15 | Timeline events with 3-language titles/descriptions |
| `Source` | 7 | Links (victim/event → URL), cascading delete |
| `Photo` | 11 | Attached to victim/event (sort order, primary flag) |
| `Submission` | 8 | Community submissions with review workflow |

**Relations:** Victim → Event (many-to-one), Victim/Event → Source (one-to-many), Victim/Event → Photo (one-to-many)

**Localized Fields:** `fieldEn`, `fieldFa`, `fieldDe` — accessed via `localized(item, 'field', locale)` in `lib/queries.ts`

**Rendering:** All pages use `export const dynamic = "force-dynamic"` — DB queried on every request, no SSG, no ISR.

---

## Essential Commands

```bash
# Development
npm run dev                    # Next.js dev (Turbopack, port 3000)
npm run build                  # Production build
npm run lint                   # ESLint

# Testing (Frontend — Vitest)
npm test                       # 124 Vitest tests
npm run test:watch             # Watch mode
npm run test:coverage          # v8 coverage report

# Testing (Enricher — pytest)
python3 -m pytest tools/enricher/tests/ -v   # 53 pytest tests

# Database
npx prisma generate            # Regenerate client after schema changes
npx prisma migrate dev         # Create + apply migration
npx prisma studio              # Visual DB editor (port 5555)

# Enricher (Data Pipeline)
python3 -m tools.enricher list                          # Show plugins
python3 -m tools.enricher check -s wikipedia_wlf -v     # Dry-run
python3 -m tools.enricher enrich -s iranvictims --resume # Enrich
python3 -m tools.enricher dedup --dry-run -v             # Dedup preview
python3 -m tools.enricher dedup --apply                  # Execute dedup
python3 -m tools.enricher status                         # Progress

# Translation (EN → DE)
python3 tools/translate_de.py                     # Translate circumstances_en → _de
python3 tools/translate_de.py --field occupation   # Different field
python3 tools/translate_de.py --dry-run --limit 5  # Preview 5 texts
python3 tools/translate_de.py --batch-size 60      # Higher concurrency

# Docker
docker compose up -d db        # Start PostgreSQL only
docker compose up -d --build app  # Rebuild + deploy app
docker compose down            # Stop everything
```

---

## Common Patterns

### Localized Content
```typescript
// lib/queries.ts — get field by locale with English fallback
localized(victim, "circumstances", locale)
// → victim.circumstancesFa || victim.circumstancesEn (for fa locale)
```

### Page with Locale (force-dynamic)
```typescript
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = await getDataFromDB();
  return <Content data={data} locale={locale as Locale} />;
}
```

### RTL-Safe CSS
```css
/* Use logical properties, never left/right */
margin-inline-start: 1rem;   /* NOT margin-left */
padding-inline-end: 0.5rem;  /* NOT padding-right */
```

### Enricher Plugin
```python
# tools/enricher/sources/new_source.py
@register
class NewPlugin(SourcePlugin):
    name = "new_source"
    full_name = "Human-Readable Name"
    base_url = "https://example.org"
    async def fetch_all(self) -> AsyncIterator[ExternalVictim]: ...
```

---

## Configuration

**Environment (.env):**
```bash
DATABASE_URL="postgresql://memorial:PASSWORD@localhost:5432/iran_memorial"
POSTGRES_PASSWORD=memorial_dev_password
```

**Important:** `.env` is in `.gitignore`. Template in `.env.example`.

---

## Documentation

| Document | Purpose |
|----------|---------|
| `CLAUDE.md` | AI reference — WAT framework, stack, patterns, commands |
| `docs/LEARNINGS.md` | Bugs, Architecture Decisions, Patterns (520+ lines) |
| `docs/VISION.md` | Design vision, target audiences, inspiration |
| `docs/PROJECT.md` | Full project documentation (14 chapters) |
| `docs/PLANNING_GUIDE.md` | Plan + Log templates, 9 principles |
| `docs/IRAN_KNOWLEDGE.md` | Historical context 1979–2026 |
| `docs/archive/` | Completed phase plans and execution logs |

---

## File Structure Rules

| What | Where |
|------|-------|
| Deliverables | Cloud services / Docker deployment |
| Active tools | `tools/enricher/` |
| Historical scripts | `tools/legacy/` |
| Workflow SOPs | `workflows/` |
| Temporary files | `.tmp/` (gitignored, disposable) |
| API keys | `.env` (gitignored) |

---

## Known Issues

| Issue | Status | Details |
|-------|--------|---------|
| Middleware deprecation | ⚠️ Cosmetic | Next.js 16 warns about middleware → proxy migration. next-intl still uses middleware. |
| Server disk at 95% | ⚠️ Critical | Docker reclaimable: ~6.2 GB. Prune ASAP. |
| German content: victims | ✅ Done | `circumstances_de` batch-translated via GPT-4o-mini (~22K texts, ~$10) |
| German content: other fields | ⚠️ Low | `occupation_de`, `beliefs_de`, etc. — columns exist, translation pending |

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| v0.1.0 | 2026-02-09 | Phase 1: Full project setup — Next.js 16, Prisma, i18n, 8 pages, Docker |
| v0.2.0 | 2026-02-09 | Phase 2A/B: Multi-source data — 7 sources, 4,378 victims |
| v0.3.0 | 2026-02-12 | Phase 2C: Deployment + AI enrichment, security hardening |
| v0.4.0 | 2026-02-13 | Phase 3: Boroumand historical — 31,203 victims, 5,318 dedups removed |
| v0.5.0 | 2026-02-14 | Enricher framework, Multi-Photo, Dedup (30,795), Timeline, force-dynamic, WAT cleanup |
| v0.5.1 | 2026-02-14 | Enricher upgrade: iranvictims CSV, iranrevolution plugin, circumstances_fa, provinces utility, 53 pytest tests |
| v0.6.0 | 2026-02-14 | German translation: 7 `_de` columns, translate_de.py (GPT-4o-mini), semaphore concurrency, ~22K circumstances_de |

**Current:** v0.6.0 | 30,795 victims | 43K+ sources | 4,942 photos | 124 Vitest + 53 pytest tests | Live at memorial.n8ncloud.de

---

## Git Commit Format

```
<type>(<scope>): <subject>

Co-Authored-By: Claude <model> <noreply@anthropic.com>
```

**Types:** feat, fix, refactor, perf, test, docs, chore, data
**Scopes:** victims, events, search, i18n, db, ui, api, deploy, seed, enricher

---

## Bottom Line

You sit between what I want (workflows) and what actually gets done (tools). Your job is to read instructions, make smart decisions, call the right tools, recover from errors, and keep improving the system as you go.

Stay pragmatic. Stay reliable. Keep learning.

---

**Last Updated:** 2026-02-14
**Maintainer:** Pedram Holi
