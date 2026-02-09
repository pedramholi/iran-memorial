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

### PL-002: Datengetriebener Ansatz schlägt Feature-getriebenen Ansatz (2026-02-09)

- **Learning:** Erst Daten sammeln und analysieren, dann Features bauen. Nicht umgekehrt.
- **Kontext:** Phase 2A hat mit einem einfachen Python-Script in ~2 Stunden 421 Opfereinträge aus Wikipedia extrahiert. Die Analyse der echten Daten hat gezeigt, dass unser Schema keine Änderungen braucht — was ohne diesen Test eine reine Annahme gewesen wäre.
- **Regel:** Vor jedem größeren Feature/Deployment: echte Daten sammeln → analysieren → erst dann implementieren.
- **Evidenz:** 2h Script-Arbeit statt geschätzt 80-150h manueller Erfassung für den gleichen Basis-Datensatz.

### PL-003: Schema-Validierung durch echte Daten (2026-02-09)

- **Learning:** Ein Schema erst als "fertig" betrachten, wenn es mit echten Daten getestet wurde.
- **Kontext:** Das Victim-Schema (44 Felder) wurde in Phase 1 theoretisch entworfen. Phase 2A hat gezeigt: Kein Feld muss entfernt oder hinzugefügt werden. Die Felder `dreams`, `beliefs`, `personality` werden selten gefüllt sein — aber das ist gewollt (sie repräsentieren den Verlust).
- **Outcome:** Schema ist validiert. Keine Migration nötig vor Deployment.

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

### AD-008: Isolierte PostgreSQL-Instanz für Gedenkportal (2026-02-09)

- **Decision:** Eigene Docker-PostgreSQL-Instanz (Port 5433) auf dem bestehenden Hetzner VPS, komplett getrennt vom SmartLivings-Server (Port 5432)
- **Alternatives:** (a) Neue Datenbank auf dem bestehenden SmartLivings-PostgreSQL, (b) Separater VPS
- **Rationale:** Maximale Isolation ohne zusätzliche Kosten. SmartLivings-Server hat 5 DBs (AiPhoneAgent, mailserver, postgres, smsgatewaydb, staydb) — kein Crossover mit dem Gedenkportal erwünscht. Docker-Container sind auf Netzwerkebene vollständig voneinander isoliert.
- **Umsetzung (Phase 2C):**
  - Eigenes Docker-Netzwerk (`memorial-net`)
  - Eigener PostgreSQL-Container (Port 5433, eigene Credentials, eigenes Volume)
  - Eigene `docker-compose.yml` im iran-memorial Projekt
  - Kein shared Docker network mit SmartLivings
- **Outcome:** Noch nicht umgesetzt — dokumentiert für Phase 2C Deployment

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

### AD-009: UI muss für Sparse Data designt werden (2026-02-09)

- **Decision:** Opfer-Detailseiten müssen auch mit nur 3 Feldern (Name, Datum, Ort) würdevoll aussehen
- **Rationale:** 70% der WLF-Opfer haben nur Minimaldaten. Eine leere Seite mit 40 leeren Feldern wirkt respektlos. Stattdessen: kompaktes Layout das vorhandene Daten prominent zeigt und fehlende Felder nicht als "leer" darstellt.
- **Implikation für Phase 2B/C:** Die Opfer-Detailseite (`/victims/[slug]`) muss conditional rendering haben — Sections nur zeigen wenn Daten vorhanden. "Kein Foto" sollte ein würdevoller Platzhalter sein, kein gebrochenes Bild.

### AD-010: Aspirational Fields bewusst beibehalten (2026-02-09)

- **Decision:** `dreams`, `beliefs`, `personality`, `quotes` im Schema belassen, obwohl sie für >95% der Opfer leer bleiben werden
- **Alternatives:** Felder entfernen um Schema zu vereinfachen
- **Rationale:** Diese Felder repräsentieren genau das, was das Regime zerstört hat — die Träume, Überzeugungen und Persönlichkeit der Opfer. Dass sie leer sind, IST die Aussage. Sie werden durch Community-Einreichungen und Familienangehörige nach und nach gefüllt.

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

### BUG-004: Python SSL-Zertifikatsfehler auf macOS (2026-02-09)

- **Symptom:** `urllib.request.urlopen()` schlägt fehl mit `SSL: CERTIFICATE_VERIFY_FAILED` beim Zugriff auf Wikipedia API
- **Root Cause:** macOS Python-Installation hat keine System-Zertifikate konfiguriert. Bekanntes Problem bei `python.org`-Installationen.
- **Fix:** `curl` als Fallback nutzen (hat eigene CA-Zertifikate), Output als Cache-File speichern, dann in Python einlesen.
- **Prevention:** Parser-Scripts immer mit Cache-File-Fallback bauen (`scripts/.wiki_cache.txt`, in `.gitignore`).

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

### Wikipedia-Import: Erkenntnisse aus Phase 2A (2026-02-09)

**Script:** `scripts/parse_wikipedia_wlf.py` — parst Wikipedia-Wikitext via API → YAML-Dateien.

**Namens-Transliteration ist das größte Datenqualitätsproblem:**
- Viele Opfer haben 2-3 Schreibvarianten (z.B. "Shirouzi / Shiroozehi", "Mohammadpour / Mahmoudpour")
- Wikipedia speichert Varianten mit "/" getrennt — Parser extrahiert die erste als `name_latin`, Rest als `aliases`
- Ohne Farsi-Originalname (`name_farsi`) ist die "richtige" Transliteration nicht bestimmbar
- Priorität für Phase 2B: Farsi-Namen aus HRANA ergänzen

**Zahedan "Bloody Friday" dominiert den Datensatz:**
- 129 von 422 Opfern (30.6%) stammen vom 30. September 2022 in Zahedan
- Diese Einträge haben die niedrigste Datenqualität (oft nur Name + Ort)
- Empfehlung: Sammel-Narrativ-Seite für "Bloody Friday" zusätzlich zu Einzelseiten

**Feldabdeckung aus Wikipedia allein:**
- 100%: Name, 99%: Datum + Ort, 96%: Provinz (auto-gemappt)
- 30%: Alter, 27%: Todesursache, 29%: Umstände
- 0%: Farsi-Name, Geschlecht, Ethnie, Foto, Beruf, Familie, alle "Life"-Felder

**City-to-Province Mapping:** Manuell gepflegt in `determine_province()` — ~80 Städte gemappt. Bei neuen Importen erweitern.

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
