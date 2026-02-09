# Learnings — Zentrale Wissensdatenbank

> Lebendes Dokument. Wächst mit jeder gelösten Herausforderung. Nie löschen, nur ergänzen.

---

## Process Learnings

### PL-001: Vision vor Planung vor Implementierung (2026-02-09)

- **Learning:** Nie direkt von einer Idee zur Implementierung springen. Der korrekte Dreischritt ist: **Vision → Planung → Implementierung**.
- **Kontext:** Phase 1 wurde technisch korrekt umgesetzt, aber ohne vorherige umfassende Ideensammlung und Visionsentwicklung. Bei einem Projekt dieser Tragweite und Sensibilität — einer Gedenkstätte für Hunderttausende Opfer — können unnötige Fehler, Fehlentscheidungen oder verpasste Aspekte nicht einfach nachgebessert werden. Jede Designentscheidung beeinflusst, wie die Opfer erinnert werden.
- **Regel:**
  1. **Vision** — Ideensammlung, Zielgruppen, Wirkung, Inspiration, offene Fragen. Was wollen wir in der Welt verändern?
  2. **Planung** — Constraints, Optionen, Phasen, Risiken, Metriken. Wie setzen wir die Vision um?
  3. **Implementierung** — Zielgerichteter Code. Kein Code ohne klaren Auftrag aus der Planung.
- **Warum entscheidend:** Eine umfassende Vision spart doppelte Arbeit und entscheidet über die Qualität. Features die aus einer Vision entstehen, passen zusammen. Features die ad-hoc entstehen, kollidieren.
- **Anpassung:** `docs/PLANNING_GUIDE.md` um "Teil 0: Die Vision" erweitert. `docs/VISION.md` als lebendes Dokument eingeführt.

---

## Architecture Decisions

### AD-001: PostgreSQL als Source of Truth (nicht YAML in Git)

- **Decision:** Datenbank ist die einzige Wahrheitsquelle, YAML nur als initialer Seed
- **Alternatives:** YAML-Dateien in Git als Source of Truth, Headless CMS (Strapi, Sanity)
- **Rationale:** 500k+ Einträge sind als einzelne YAML-Dateien nicht handhabbar — Git wird langsam, Volltextsuche unmöglich, Relationen (Opfer ↔ Event ↔ Source) nicht abbildbar
- **Outcome:** Schema mit 4 Models (Victim 44 Felder, Event 17 Felder, Source, Submission), ISR für on-demand Rendering

### AD-002: Self-hosted PostgreSQL statt Cloud-DB

- **Decision:** PostgreSQL auf eigenem VPS, kein AWS RDS / Supabase / PlanetScale
- **Alternatives:** Supabase (managed PostgreSQL), PlanetScale (MySQL), Cloudflare D1
- **Rationale:** Datensouveränität bei politisch sensiblen Daten. Kein US-Cloud-Anbieter soll auf die Daten zugreifen oder den Dienst kündigen können
- **Outcome:** Docker Compose mit PostgreSQL 16 Alpine, volle Kontrolle über Backups und Zugang

### AD-003: Dreisprachig von Anfang an (FA + EN + DE)

- **Decision:** Farsi (RTL) + Englisch + Deutsch als Startsprachen, URL-basiertes Routing `/fa/`, `/en/`, `/de/`
- **Alternatives:** Nur Englisch, Englisch + Farsi, Sprachen nachträglich ergänzen
- **Rationale:** Nachträgliche i18n ist 10x schwieriger als von Anfang an. Farsi für Opfer/Familien, Englisch für internationale Öffentlichkeit, Deutsch für die große iranische Diaspora in DACH
- **Outcome:** next-intl mit 102 UI-Keys pro Sprache, `localized()` Helper für DB-Felder, RTL-Support über Tailwind logical properties

### AD-004: Next.js 16 mit ISR statt SSG

- **Decision:** Incremental Static Regeneration (revalidate: 3600) für Opfer-/Event-Seiten
- **Alternatives:** Full SSG (Astro), Full SSR, SvelteKit
- **Rationale:** 500k+ Seiten können nicht alle zur Build-Zeit generiert werden. ISR generiert on-demand beim ersten Aufruf und cached danach
- **Outcome:** Build in 831ms (nur statische Seiten), dynamische Seiten on-demand, Dev-Start in 454ms

### AD-005: Prisma 6 statt Prisma 7

- **Decision:** Prisma 6.19 beibehalten, v7 nicht migriert
- **Alternatives:** Prisma 7 mit neuem `prisma.config.ts` Format
- **Rationale:** v7 hat Breaking Change — `url` in `schema.prisma` nicht mehr erlaubt, erfordert neues Config-Format. Kein Mehrwert für unseren Use Case
- **Outcome:** Funktioniert stabil, Deprecation-Warning bei `package.json#prisma` (harmlos)
- **Revisit:** Bei nächstem Major Prisma-Feature das wir brauchen

### AD-006: Tailwind CSS v4 mit Custom Theme

- **Decision:** Tailwind v4 über `@tailwindcss/postcss`, Custom Colors in `@theme` Block
- **Alternatives:** CSS Modules, Styled Components, vanilla CSS
- **Rationale:** Eingebaute RTL-Unterstützung (logical properties `start`/`end`), kein separates tailwind.config nötig (v4), dunkles Memorial-Design als Custom Theme
- **Outcome:** `memorial-950..50` (dunkle Grautöne), `gold-500` (Akzent), `blood-500` (Tod-Markierung), `font-farsi` für RTL

### AD-007: Dunkles Memorial-Design

- **Decision:** Dunkler Hintergrund (#0a0a0f), gedämpfte Farben, Gold-Akzente, Kerzenschein-Animation
- **Alternatives:** Helles/neutrales Design, anpassbares Theme
- **Rationale:** Memorial-Charakter — Würde, Ernsthaftigkeit, Trauer. Helle Designs wirken für eine Gedenkstätte unangemessen
- **Outcome:** Konsistentes dunkles Design, `candle-flicker` Animation, `timeline-line` Gradient

---

## Bugs & Root Causes

### BUG-001: create-next-app verweigert bestehende Dateien

- **Symptom:** `npx create-next-app@latest .` bricht ab mit "The directory contains files that could conflict"
- **Root Cause:** create-next-app prüft auf bestehende Dateien (README.md, data/) und verweigert die Installation
- **Fix:** Manuelles Setup: `npm init` + einzelne Dependencies installieren + Config-Dateien selbst erstellen
- **Prevention:** Bei bestehenden Repos immer manuell aufsetzen statt create-next-app

### BUG-002: Prisma v7 Breaking Change bei Config

- **Symptom:** `npx prisma generate` schlägt fehl — "datasource property url is no longer supported in schema files"
- **Root Cause:** Prisma v7 (seit ~2026) hat Breaking Change: `url = env("DATABASE_URL")` in schema.prisma wird nicht mehr unterstützt, erfordert `prisma.config.ts`
- **Fix:** Downgrade auf Prisma v6 (`npm install prisma@^6 @prisma/client@^6`)
- **Prevention:** Prisma-Version in package.json pinnen. Vor Major-Updates LEARNINGS.md prüfen

### BUG-003: ESM vs CommonJS Modulkonflikt

- **Symptom:** Build schlägt fehl mit 25 Fehlern — "Specified module format (CommonJs) is not matching the module format of the source code (EcmaScript Modules)"
- **Root Cause:** `npm init` setzt `"type": "commonjs"` in package.json, aber alle .ts/.tsx Dateien verwenden ESM `import/export` Syntax
- **Fix:** `"type": "commonjs"` → `"type": "module"` in package.json
- **Prevention:** Nach `npm init` immer `"type"` Feld prüfen. Next.js Projekte brauchen `"module"`

---

## Deployment Gotchas

- **Docker nicht lokal installiert:** Dev-Umgebung hat kein Docker. DB-Queries fallen auf leere Defaults zurück (try/catch in allen Pages). PostgreSQL erst auf VPS testen.
- **Prisma Seed braucht tsx:** `npx tsx prisma/seed.ts` — tsx muss als devDependency installiert sein. Konfiguriert in `package.json#prisma.seed`.
- **pg_trgm Extension:** Muss manuell oder via `init.sql` aktiviert werden (`CREATE EXTENSION IF NOT EXISTS pg_trgm;`). Ohne pg_trgm keine Fuzzy-Suche.
- **next-intl Middleware vs Proxy:** Next.js 16 zeigt Deprecation-Warning für `middleware.ts`. next-intl hat noch keinen Proxy-Support. Warnung ist kosmetisch, Middleware funktioniert.
- **.env nicht in Git:** `.env` ist in `.gitignore`. Template in `.env.example`. Auf Server muss `.env` manuell erstellt werden.

---

## Patterns That Work

- **Graceful DB Fallback:** Alle Seiten-Komponenten wrappen DB-Queries in try/catch und zeigen statischen Content wenn die DB nicht erreichbar ist. Ermöglicht Entwicklung ohne laufende PostgreSQL.
- **`localized()` Helper:** Einheitlicher Zugriff auf mehrsprachige Felder: `localized(victim, 'circumstances', 'fa')` → `victim.circumstancesFa || victim.circumstancesEn`. Fallback auf Englisch wenn Farsi fehlt.
- **Tailwind Logical Properties:** `start`/`end` statt `left`/`right` überall — funktioniert automatisch für RTL (Farsi) und LTR (Englisch, Deutsch). Beispiel: `ps-4` statt `pl-4`, `border-s-2` statt `border-l-2`.
- **ISR mit stündlicher Revalidierung:** `export const revalidate = 3600` auf Detail-Seiten. Seiten werden beim ersten Aufruf generiert und dann stündlich aktualisiert. Skaliert auf 500k+ Seiten.
- **Upsert im Seed-Script:** `prisma.victim.upsert()` statt `create()` — Seed kann mehrfach laufen ohne Duplikate zu erzeugen.
- **Event-Context Mapping im Seed:** Hardcoded Map von YAML `event_context` Strings zu Event-Slugs. Ermöglicht automatische Verknüpfung von Opfern mit Ereignissen beim Import.
- **Font-Strategie:** Inter (Google Fonts) für LTR, Vazirmatn für Farsi RTL — geladen via `<link>` im Locale-Layout, kein @font-face nötig.

---

## Patterns That Failed

- **create-next-app in bestehendem Repo:** Verweigert Installation bei vorhandenen Dateien. Manuelles Setup ist gleichwertig und flexibler. (→ BUG-001)
- **Prisma v7 ohne Migration:** Breaking Change bei Config-Format. Downgrade auf v6 war die richtige Entscheidung. (→ BUG-002)
- **`"type": "commonjs"` mit Next.js:** Inkompatibel mit ESM-Syntax die TypeScript/Next.js verwenden. (→ BUG-003)

---

## Data Import Notes

### YAML-Format der Seed-Daten

Die bestehenden YAML-Dateien verwenden ein flaches Format mit verschachtelten Objekten für `family` und `burial`:

```yaml
# Identität: name_latin, name_farsi, aliases[], date_of_birth, etc.
# Leben: occupation, education, family{}, dreams, beliefs, personality, quotes[]
# Tod: date_of_death, cause_of_death, circumstances, responsible_forces, witnesses[]
# Nachwirkung: burial{}, family_persecution, legal_proceedings, tributes[]
# Quellen: sources[{url, name, date, type}]
```

**Mapping YAML → Prisma:**
- `occupation` → `occupationEn` (kein Farsi in Seed-Daten)
- `circumstances` → `circumstancesEn`
- `family{}` → `familyInfo` (JSON)
- `burial.location` → `burialLocation`
- `burial.circumstances` → `burialCircumstancesEn`
- `status` → `verificationStatus`
- `event_context` → wird über Mapping-Tabelle zu `eventId` aufgelöst

### Zukünftige Imports

Boroumand Foundation, Iran Human Rights (IHR) und HRANA haben eigene Datenformate. Pro Import-Quelle ein eigenes Mapping-Script erstellen, dokumentiert mit Plan + Log.

---

## Performance Notes

| Metrik | Zielwert | Aktuell (Phase 1) |
|--------|----------|-------------------|
| Build-Zeit | < 5s | 831ms |
| Dev-Server Start | < 2s | 454ms |
| Lighthouse Performance | > 90 | Ungemessen |
| Lighthouse Accessibility | > 95 | Ungemessen |
| DB Queries | < 50ms | Nicht testbar (kein lokaler PG) |
| ISR Revalidation | 3600s | Konfiguriert |

---

*Erstellt: 2026-02-09*
*Letzte Aktualisierung: 2026-02-09*
