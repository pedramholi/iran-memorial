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

### BUG-005: Seed-Script ignoriert `province` aus YAML (2026-02-09)

- **Symptom:** Alle Opfer haben `province: null` in der Datenbank, obwohl die YAML-Dateien ein `province`-Feld enthalten.
- **Root Cause:** Im Seed-Script (`prisma/seed.ts`) wurde `province` nicht aus dem YAML gemappt, sondern fehlte im Mapping komplett.
- **Fix:** `province: data.province || null` im Victim-Mapping ergänzt.
- **Prevention:** Bei jedem neuen YAML-Feld: Seed-Script 1:1 gegen das YAML-Schema prüfen. Checkliste: Jedes Feld im YAML muss ein Mapping im Seed-Script haben.

### BUG-006: HRANA Parser fand 0 Opfer — ToC vs Content Section-Header (2026-02-09)

- **Symptom:** `parse_hrana_82day.py` parste 0 Opfer aus einem 15.233-Zeilen-Dokument, obwohl 481 erwartet.
- **Root Cause:** Der Section-Marker "First category – identity of 481 people" erschien zweimal im pdftotext-Output — einmal im Inhaltsverzeichnis (mit Punktlinie), einmal im eigentlichen Content. `text.find(marker)` traf das ToC-Vorkommen, wo keine Opfer-Einträge folgen.
- **Fix:** Zweites Vorkommen nutzen: `first_idx = text.find(marker); start_idx = text.find(marker, first_idx + 1)`
- **Prevention:** Bei PDF-Parsing immer prüfen ob Section-Header auch im ToC vorkommen. `text.find()` liefert das erste Vorkommen — bei strukturierten Dokumenten ist das oft das falsche.

### BUG-007: SQL Injection via $queryRawUnsafe + String-Interpolation (2026-02-12)

- **Symptom:** Security Audit deckte auf: `$queryRawUnsafe()` mit `${filters.sql}` Template-String-Interpolation — Attacker konnte via `province` oder `gender` Query-Parameter SQL injizieren
- **Root Cause:** `buildFilterParams()` gab einen Raw-SQL-String zurück der direkt in Template-Literals interpoliert wurde. Prisma `$queryRawUnsafe` escaped Template-Strings NICHT — nur positional `$1`, `$2` Parameter sind sicher.
- **Fix:** Komplett umgestellt auf `$queryRaw` (tagged template) + `Prisma.sql` Fragments. Neue `buildFilterFragment()` gibt `Prisma.Sql` zurück statt String. Gender whitelisted, Year range-validiert, Search auf 200 chars limitiert.
- **Prevention:** NIEMALS `$queryRawUnsafe()` verwenden. Immer `$queryRaw` tagged template oder Prisma ORM. Bei Raw SQL: alle User-Inputs über `Prisma.sql` parametrisieren.

### BUG-008: Source-Duplikate durch nicht-idempotentes Seed-Script (2026-02-12)

- **Symptom:** 251.118 Source-Einträge in DB, aber nur 29.318 unique (221.800 Duplikate)
- **Root Cause:** `prisma/seed.ts` Zeile 184 — Source-Creation-Loop ohne vorheriges deleteMany. Jeder Seed-Run fügte alle Sources erneut hinzu.
- **Fix:** (a) `scripts/dedup-sources.ts` für Cleanup (221.800 gelöscht), (b) `prisma/seed.ts`: `deleteMany({ where: { victimId } })` vor Source-Creation
- **Prevention:** Seed-Scripts müssen idempotent sein. Immer `deleteMany` vor Create-Loop.

---

## Deployment Gotchas

- **Docker nicht lokal installiert:** Dev-Umgebung hat kein Docker. DB-Queries fallen auf leere Defaults zurück (try/catch in allen Pages). PostgreSQL erst auf VPS testen.
- **Prisma Seed braucht tsx:** `npx tsx prisma/seed.ts` — tsx muss als devDependency installiert sein. Konfiguriert in `package.json#prisma.seed`.
- **pg_trgm Extension:** Muss manuell oder via `init.sql` aktiviert werden (`CREATE EXTENSION IF NOT EXISTS pg_trgm;`). Ohne pg_trgm keine Fuzzy-Suche.
- **next-intl Middleware vs Proxy:** Next.js 16 zeigt Deprecation-Warning für `middleware.ts`. next-intl hat noch keinen Proxy-Support. Warnung ist kosmetisch, Middleware funktioniert.
- **.env nicht in Git:** `.env` ist in `.gitignore`. Template in `.env.example`. Auf Server muss `.env` manuell erstellt werden.
- **poppler für PDF-Parsing:** `pdftotext` (aus dem poppler-Paket) wird zum Extrahieren von Text aus NGO-PDFs benötigt. Installation: `brew install poppler` (macOS). Ohne poppler scheitern alle PDF-Import-Scripts.
- **Server package-lock.json Divergenz:** `npm install` auf Server erzeugt lokale Änderungen in `package-lock.json` (andere npm-Version). `git stash` vor `git pull` nötig.
- **Docker Disk-Usage:** Build-Cache wächst schnell. Vor `docker compose up --build` prüfen: `df -h /`. Bei >90% erst `docker system prune -a -f && docker builder prune --all -f`.
- **tsconfig exclude für scripts/:** `scripts/` muss in `tsconfig.json` `exclude` stehen — OpenAI SDK Types sind mit ES2017 Target inkompatibel und brechen den Next.js Build.
- **.next/standalone/.env:** Build-Output kopiert `.env` in `.next/standalone/` — nie dieses Verzeichnis direkt deployen.

---

### AD-011: Security Hardening für API-Routen (2026-02-12)

- **Decision:** Alle Raw-SQL-Queries auf Prisma `$queryRaw` tagged templates umgestellt, Rate Limiting + Zod-Validation auf API-Routen, Security Headers via `next.config.ts`
- **Alternatives:** WAF (Cloudflare Pro), separate API-Gateway, NextAuth für alle Routen
- **Rationale:** Minimaler Aufwand, maximaler Impact. `$queryRawUnsafe` mit String-Interpolation war ein echtes SQL-Injection-Risiko. In-Memory Rate Limiter reicht für unseren Traffic.
- **Outcome:**
  - `lib/queries.ts`: `$queryRawUnsafe()` → `$queryRaw` mit `Prisma.sql` tagged templates
  - `lib/rate-limit.ts`: In-Memory Sliding Window (submit: 5/hr, search: 100/min per IP)
  - `/api/submit`: Zod-Schema-Validation + Rate Limiting + 429 Retry-After
  - `/api/search`: Rate Limiting
  - `next.config.ts`: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
- **Revisit:** Bei höherem Traffic auf Redis-basiertes Rate Limiting umsteigen

---

## Patterns That Work

- **Graceful DB Fallback:** Alle Seiten-Komponenten wrappen DB-Queries in try/catch und zeigen statischen Content wenn die DB nicht erreichbar ist. Ermöglicht Entwicklung ohne laufende PostgreSQL.
- **`localized()` Helper:** Einheitlicher Zugriff auf mehrsprachige Felder: `localized(victim, 'circumstances', 'fa')` → `victim.circumstancesFa || victim.circumstancesEn`. Fallback auf Englisch wenn Farsi fehlt.
- **Tailwind Logical Properties:** `start`/`end` statt `left`/`right` überall — funktioniert automatisch für RTL (Farsi) und LTR (Englisch, Deutsch). Beispiel: `ps-4` statt `pl-4`, `border-s-2` statt `border-l-2`.
- **ISR mit stündlicher Revalidierung:** `export const revalidate = 3600` auf Detail-Seiten. Seiten werden beim ersten Aufruf generiert und dann stündlich aktualisiert. Skaliert auf 500k+ Seiten.
- **Upsert im Seed-Script:** `prisma.victim.upsert()` statt `create()` — Seed kann mehrfach laufen ohne Duplikate zu erzeugen.
- **Event-Context Mapping im Seed:** Hardcoded Map von YAML `event_context` Strings zu Event-Slugs. Ermöglicht automatische Verknüpfung von Opfern mit Ereignissen beim Import.
- **Iterative Namenslisten für Gender-Inferenz:** Gender-Abdeckung von 64% → 100% in 6 Iterationen über 2 Sessions. Methode: Unknowns analysieren → häufigste Namen identifizieren → Liste erweitern → erneut laufen lassen. Jede Iteration liefert abnehmende Erträge. ~500 persische/kurdische/baluchische Vornamen decken 4.581 Opfer zu 100% ab. Tippfehler-Varianten (aboalfzl, behruz, fa'zh) müssen explizit aufgenommen werden.
- **Font-Strategie:** Inter (Google Fonts) für LTR, Vazirmatn für Farsi RTL — geladen via `<link>` im Locale-Layout, kein @font-face nötig.
- **Multi-Source-Import vor PDF-Parsing:** Immer zuerst nach maschinenlesbaren Quellen suchen (CSVs, APIs, Wikitables). Community-Projekte wie iranvictims.com haben oft Download-Buttons. PDFs nur als letzte Option — pdftotext + Regex funktioniert aber gut für strukturierte NGO-Reports.
- **Prisma.sql Tagged Templates statt $queryRawUnsafe:** `$queryRaw\`...\`` auto-parametrisiert alle `${variable}` Interpolationen. `Prisma.sql` für Fragments, `Prisma.raw()` nur für trusted Column-Lists, `Prisma.join()` für AND/OR-Ketten. Nie `$queryRawUnsafe` mit Template-Strings verwenden.
- **In-Memory Rate Limiter mit Auto-Cleanup:** Sliding Window Counter pro IP+Endpoint, `setInterval().unref()` für Garbage Collection. Reicht für moderate Traffic-Mengen, bei Scale auf Redis umsteigen.
- **Zod Schema Validation an API-Grenzen:** `z.object({...}).safeParse(body)` statt manuelle Checks. Gibt strukturierte Fehlermeldungen zurück (`fieldErrors`). Immer `.max()` auf Strings setzen um Memory-Exhaustion zu verhindern.
- **Security Headers in next.config.ts:** `headers()` async function gibt Array von Header-Rules zurück. CSP muss `'unsafe-inline'` für Next.js enthalten (Inline-Styles). `frame-ancestors 'none'` ist stärker als X-Frame-Options.
- **splitCircumstances() für lange Boroumand-Texte:** 3-Tier Paragraph-Splitting: (1) `\n\n`, (2) Section-Headers (Arrest, Trial, Charges...), (3) Satz-Grenzen alle ~500 Zeichen. Verhindert Wall-of-Text auf Opfer-Detailseiten.
- **Name-based Dedup reicht für Erstimport:** `name.lower()` Matching fängt ~95% der Duplikate. Für die restlichen 5% (Transliterations-Varianten wie "Shirouzi" vs "Shirouzehi") braucht es ein dediziertes Dedup-Script. → Erledigt: `scripts/dedup_victims.py` hat 206 Duplikate in 4.581 Dateien gefunden (4.5%).
- **Dedup-Scoring mit negativen Signalen:** Verschiedene Todesdaten (beide non-null) = -100 verhindert zuverlässig falsche Merges bei Namenszwillingen (z.B. "Mohammad Amini" in 2022 und 2026 — verschiedene Personen). Gleiches Farsi-Name (+50) + gleiches Todesdatum (+50) = fast sichere Duplikate.
- **Union-Find für transitive Duplikat-Cluster:** Paarweise Duplikat-Erkennung erzeugt transitive Ketten (A≈B, B≈C → A,B,C sind ein Cluster). Union-Find gruppiert diese korrekt und verhindert Konflikte beim Merge (z.B. "Nima Khan Ahmadi" existierte 4x → 1 Cluster, 3 gelöscht).
- **Province-Diskrepanz als Warnsignal:** iranvictims.com listet viele Opfer mit falscher/generischer Provinz (oft "Tehran" als Default). Gleicher Farsi-Name + verschiedene Provinz (score 35) ist kein sicherer Match — manuelle Prüfung aller 55 Paare ergab 27 echte Duplikate und 28 verschiedene Personen (49% false positive rate bei Score 30-49).
- **Wayback Machine als Cloudflare-Bypass:** Wenn eine Website (z.B. iranhr.net) hinter Cloudflare blockiert ist, kann `web.archive.org/web/URL` oft noch auf gecachte Versionen zugreifen. Hat funktioniert um IHRs 22 Suspicious Deaths zu extrahieren, obwohl die Live-Site 403 zurückgab.

---

## Patterns That Failed

- **create-next-app in bestehendem Repo:** Verweigert Installation bei vorhandenen Dateien. Manuelles Setup ist gleichwertig und flexibler. (→ BUG-001)
- **Prisma v7 ohne Migration:** Breaking Change bei Config-Format. Downgrade auf v6 war die richtige Entscheidung. (→ BUG-002)
- **`"type": "commonjs"` mit Next.js:** Inkompatibel mit ESM-Syntax die TypeScript/Next.js verwenden. (→ BUG-003)
- **Wikipedia-Parser erfasst nur Protest-Tote, keine Hingerichteten:** Der Parser für "Deaths during the Mahsa Amini protests" extrahiert nur während der Proteste Getötete (erschossen, geschlagen). Juristisch Hingerichtete stehen auf einer separaten Wikipedia-Seite ("Death sentences during the Mahsa Amini protests"). Mindestens 12 Hingerichtete (Shekari, Rahnavard, Karami, Hosseini, Mirhashemi, Kazemi, Yaghoubi, Ghobadlou, Rasaei, u.a.) fehlten komplett. **Lesson:** Vor jedem Datenimport prüfen, ob die Quelle den gesamten Scope abdeckt. Bei Wikipedia: verwandte Artikel systematisch identifizieren.
- **Einzelne Quelle = systematische Blindspots:** Eine einzelne Wikipedia-Seite erfasst nur eine Kategorie von Opfern. Tatsächlich gibt es mindestens 5 Opferkategorien die jeweils eigene Quellen brauchen: (1) Protest-Tote, (2) Juristisch Hingerichtete, (3) Tode in Haft / unter Folter, (4) Verdächtige "Suizide" nach Freilassung, (5) Hijab-Enforcement-Tode. **Lesson:** Bei jedem Datenimport eine Vollständigkeits-Checkliste gegen alle Opferkategorien durchgehen. Nie annehmen dass eine Quelle den gesamten Scope abdeckt.

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
- 100%: Geschlecht (via `scripts/infer_gender.py`, ~500 Namen in 6 Passes)
- 0%: Farsi-Name, Ethnie, Foto, Beruf, Familie, alle "Life"-Felder

**City-to-Province Mapping:** Manuell gepflegt in `determine_province()` — ~80 Städte gemappt. Bei neuen Importen erweitern.

### Fehlende WLF-Opfer: Lückenanalyse und Strategie (2026-02-09)

**Aktueller Stand (nach Multi-Source-Import + Deduplizierung + Amnesty-Enrichment):** 4.378 Opfer total
- ~758 WLF 2022 (Wikipedia 422 + HRANA 352 + Manuell 12 + IHR 1 + Amnesty 3 neue, nach Dedup)
- 26 WLF 2023 (Hinrichtungen + Hafttode + IHR Suspicious Deaths 3)
- 2 WLF 2024 (Hinrichtungen)
- 20 in 2025 (3 WLF-Hinrichtungen + 17 aus iranvictims.com)
- ~3.570 in 2026 (iranvictims.com CSV-Import, nach Dedup)
- 2 historisch (1988, 2009)

**Zur Einordnung der Zahlen:**
Die 551 Toten (IHR, Stand Sept. 2023) sind das **verifizierte Minimum**, nicht die Realität. IHR zählt nur Fälle die durch zwei unabhängige Quellen, Sterbeurkunden oder Bildmaterial belegbar sind. HRANA meldete bereits Jan. 2023 über 512 Tote. Interne Quellen (Gesundheitsministerium, Gerichtsmedizin) sprechen von 1.500-3.000 Toten. Die wahre Zahl liegt mit hoher Wahrscheinlichkeit im vierstelligen Bereich.

**Warum die Dunkelziffer so hoch ist:**
- Sicherheitskräfte erzwingen Schweigen der Familien im Austausch für Herausgabe der Leichen
- Krankenhäuser waren Gefahrenzonen (Verhaftung drohte) — viele Verletzte starben zu Hause und tauchen in keiner Statistik auf
- Internet-Blackouts während der heftigsten Protestwellen verhinderten Echtzeit-Dokumentation
- Familien wurden gezwungen, Todesursache als "Unfall" oder "natürlich" anzugeben

**Konsequenz für das Projekt:** Unser Ziel kann nicht "alle Opfer erfassen" sein — das ist unter diesen Umständen unmöglich. Stattdessen: so viele namentlich Identifizierte wie möglich dokumentieren, und die Dunkelziffer als Teil der Erzählung sichtbar machen ("Mindestens 551 verifiziert — die wahre Zahl liegt im vierstelligen Bereich").

**Bereits erfasste Kategorien (nach manueller Recherche 2026-02-09):**
1. **Hingerichtete Protestler:** Alle 12 bestätigten erfasst (Shekari, Rahnavard, Karami, Hosseini, Mirhashemi, Kazemi, Yaghoubi, Zohrevand, Ghobadlou, Rasaei, Kourkour, Bahramian)
2. **Tode in Haft / unter Folter:** 7 Fälle erfasst (Rouhi, Rigi, Fuladiwanda, Ahmadinejad, Esmaili, Galvani, Rakhshani)
3. **Verdächtige "Suizide" nach Freilassung:** 10 Fälle erfasst (Aghafazli, Emamgholizadeh, Naami, Mansouri, u.a.)
4. **Hijab-Enforcement:** 1 Fall (Armita Geravand)
5. **2025/2026-Proteste:** 9 namentlich identifizierte Opfer erfasst (Aminian, Fallahpour, u.a.)

**Erledigte Quellen-Importe:**
1. ~~Wikipedia "Deaths during" — Re-Parse auf Lücken~~ → ERLEDIGT: Nur 1 Tabelle mit 422 Zeilen, Parser hat alles erfasst
2. ~~HRANA 82-Day Report~~ → ERLEDIGT: 352 neue Opfer importiert (scripts/parse_hrana_82day.py)
3. ~~iranvictims.com CSV~~ → ERLEDIGT: 3.752 Opfer der 2025-2026 Proteste (scripts/import_iranvictims_csv.py)
4. ~~IHR One-Year Report~~ → BLOCKIERT: Cloudflare, aber Coverage bereits > IHR 551
5. ~~Deduplizierung~~ → ERLEDIGT: 206 Duplikate entfernt (scripts/dedup_victims.py), 4.581 → 4.375

**Noch offene Quellen:**

| Prio | Quelle | Erwartete neue Opfer | Aufwand | Status |
|------|--------|---------------------|---------|--------|
| 1 | IHR (iranhr.net) — Direktkontakt | ~0-50 Enrichment | E-Mail senden | Offen |
| 2 | ~~Boroumand Foundation (iranrights.org/memorial)~~ | ~~203 enriched (64 FA-Namen, 33 Fotos, 202 Sources)~~ | ~~HTML-Scrape~~ | **ERLEDIGT** |
| 3 | ~~Amnesty International MDE 13/6104/2022~~ | ~~41 enriched + 3 neue~~ | ~~PDF-Parse~~ | **ERLEDIGT** |
| 4 | HRANA 20-Day Report (archive.org) | ~0-20 | PDF-Parse | Offen |
| 5 | ~~Deduplizierung & Name-Normalisierung~~ | ~~206 Duplikate entfernt~~ | ~~Script~~ | **ERLEDIGT** |
| 5 | KHRN + IHR für 2025/2026-Proteste | Tausende | Laufend | Mittel |
| 6 | Amnesty International Berichte | ~10-30 | 2-3 Tage | Hoch |

**Vollständigkeits-Checkliste für jeden Datenimport:**
Vor jedem Import gegen diese 5 Opferkategorien prüfen:
- [ ] Protest-Tote (erschossen, geschlagen während Demos)
- [ ] Juristisch Hingerichtete (nach Festnahme bei Protesten)
- [ ] Tode in Haft (Folter, medizinische Vernachlässigung, "verdächtige" Tode)
- [ ] Verdächtige Tode nach Freilassung (erzwungene "Suizide", Überdosen, Morde)
- [ ] Hijab-Enforcement-Tode (Sittenpolizei, außerhalb von Protesten)

### Deduplizierung: Ergebnisse und Erkenntnisse (2026-02-09)

**Script:** `scripts/dedup_victims.py` — findet und merged Duplikate via 3 Strategien + Scoring.

**Ergebnis:** 4.581 → 4.375 Opfer (206 Duplikate entfernt, 0 Fehler)
- 158 Cluster in Runde 1 (davon 14 mit 3+ Dateien, z.B. Nika Shakarami 3x, Mohammad Mehdi Karami 3x)
- Runde 1: 172 HIGH-confidence Merges (score ≥ 50, automatisch)
- Runde 2: 6 manuelle Transliterations-Merges (MEDIUM, manuell geprüft)
- Runde 3: 27 manuelle MEDIUM-Merges nach Datei-für-Datei-Review (55 Paare geprüft, 27 gemergt, 28 als verschiedene Personen bestätigt)

**3 Matching-Strategien:**
1. **Gleicher Familienname + ähnliche Vornamen** (Levenshtein ≤ 1 pro Namensteil, erster Buchstabe muss übereinstimmen)
2. **Normalisierter Vollname-Match** (Transliterations-Mapping: mohammad→muhammad, hossein→husayn, ou→u, ee→i, etc.)
3. **Cross-Year Slug-Match** (gleicher Dateiname in verschiedenen Jahresverzeichnissen)

**Scoring-Tabelle:**

| Signal | Score | Begründung |
|--------|-------|------------|
| Gleiches Todesdatum | +50 | Starker Match |
| Gleicher Farsi-Name | +50 | Definitiver Match |
| Gleiche Provinz | +20 | Unterstützend |
| Gleiches Alter | +15 | Unterstützend |
| Gleicher Ort | +10 | Unterstützend |
| Gleiche Todesursache | +10 | Unterstützend |
| **Verschiedenes Todesdatum (beide non-null)** | **-100** | **Verhindert falsche Merges** |
| Verschiedenes Alter (Diff >2) | -30 | Warnsignal |
| Verschiedene Provinz | -20 | Warnsignal |
| Verschiedener Farsi-Name | -10 | Warnsignal |

**Merge-Priorität:** verified > HRANA > Wikipedia > iranvictims.com. Bei Merge: Quellen werden kombiniert, fehlende Felder aus der dünneren Datei ergänzt.

**Hauptursachen der Duplikate:**
1. **iranvictims.com Doppellistungen** (~120): Gleiche Person mit leicht verschiedener Transliteration oder mit/ohne Geburtsjahr im Slug
2. **Cross-Source-Überlappung** (~35): Bekannte WLF-Opfer (Nika Shakarami, Mohsen Shekari, Mahsa Amini, etc.) waren in Wikipedia UND iranvictims.com
3. **Cross-Year-Slugs** (~15): Gleicher Dateiname in 2022/ und 2026/ — aber verschiedene Todesdaten = verschiedene Personen (korrekt NICHT gemergt)

**Überraschende Erkenntnis:** iranvictims.com listet WLF-2022-Opfer (Nika Shakarami, Karami, Hosseini, Shekari, etc.) erneut in ihrem 2025-2026-Datensatz — vermutlich als "heroes" ohne separates Todesdatum. Das Scoring-System hat diese korrekt erkannt und in die bestehenden, detaillierteren 2022/2023-Einträge gemergt.

**Offene Fälle (28 SKIP-Paare):** Nach manueller Prüfung aller 55 MEDIUM-Paare bestätigt als verschiedene Personen — unterschiedliche Todesdaten, Provinzen oder Umstände trotz ähnlicher Namen. Typisch: häufige Namen wie Ali Moradi, Mehdi Ahmadi existieren mehrfach als tatsächlich verschiedene Opfer.

**Erkenntnisse aus MEDIUM-Review:**
- **"Killed in city A, memorialized in city B"**: iranvictims.com listet oft den Begräbnis-/Gedenkort, andere Quellen den Todesort. Das erklärt Provinz-Diskrepanzen bei echten Duplikaten.
- **`javidnamhamedan` Telegram-Kanal** als Quelle in iranvictims.com erzeugt systematisch Duplikate mit Tehran-Region-Einträgen.
- **Score 30-49 erfordert Datei-Prüfung**: Automatisches Mergen in diesem Bereich würde ~50% falsche Merges erzeugen.

### Boroumand Foundation Import (2026-02-09)

**Script:** `scripts/scrape_boroumand.py` — 4-Phasen HTML-Scraper für iranrights.org/memorial.

**Ergebnis:** 203 YAML-Dateien angereichert (64 Farsi-Namen, 33 Fotos, 202 Source-Links)
- 27.202 Opfer in Boroumand-DB (6× unsere DB), aber Overlap nur ~419 Name-Matches
- Date-Validation reduzierte 419 Matches auf 203 (216 = verschiedene Personen, gleicher Name)
- Boroumand hat massive historische Daten (1979–2021), aber unsere DB fokussiert auf 2022–2026

**Technische Erkenntnisse:**
- iranrights.org hat keine API, kein Sitemap — nur HTML-Scraping über Browse-Pagination
- HTML-Struktur: `<div><em>Label:</em> Value</div>` (nicht dt/dd wie in WebFetch-Markdown-Konvertierung angezeigt!)
- macOS Python urllib braucht SSL-Context-Fix (CERT_NONE) wegen fehlender System-Zertifikate
- Browse-Seiten zeigen kein Datum — nur Name + Mode of Killing. Datum erst auf Detail-Seiten.
- Jahr→Seiten-Mapping: 2022 ab Seite 514, 1988 ab Seite 222 (Massaker: ~3.600 Einträge!)

**Offenes Potenzial:** 27.202 - 419 Matches = ~26.783 potentielle neue Opfer, vor allem historische (1979–2021). 1988-Massaker allein = ~3.600 Einträge. Erfordert eigene Import-Phase.

### Zukünftige Imports

IHR und HRANA haben eigene Datenformate. Pro Import-Quelle ein eigenes Mapping-Script erstellen, dokumentiert mit Plan + Log. Boroumand historische Daten (1979–2021) als separates Projekt.

---

## Performance Notes

| Metrik | Zielwert | Aktuell |
|--------|----------|---------|
| Build-Zeit | < 5s | 831ms |
| Dev-Server Start | < 2s | 454ms |
| Lighthouse Performance | > 90 | Ungemessen |
| Lighthouse Accessibility | > 95 | Ungemessen |
| Event-Seite (warm) | < 500ms | ~320ms (nach Pagination-Fix) |
| ISR Revalidation | 3600s | Konfiguriert |

### Performance-Fixes (2026-02-12)
- **Event-Seiten:** `getEventBySlug` lud alle 44 Victim-Spalten → nur 7 für VictimCard nötig. `select` statt `include` spart ~80% Daten.
- **Pagination:** WLF 2022 hat 794 Victims, 2026 hat 4.380 → 50 pro Seite mit `?page=` Query-Parameter. Response: 1.8s → 0.32s (warm).

---

### BUG-009: iranvictims.com listet historische Opfer als 2026-Protestopfer (2026-02-13)

- **Symptom:** Navid Afkari (hingerichtet 2020), Armita Geravand (gestorben 2023), Pouya Bakhtiari (erschossen 2019) u.a. unter `event_context: "2025-2026 Iranian nationwide protests"` in `data/victims/2026/`
- **Root Cause:** iranvictims.com listet historische Opfer als "Helden" in ihrem 2026-Datensatz. Der CSV-Import hat sie blind als 2026-Opfer importiert.
- **Fix:** Manueller Cross-Year-Abgleich: 13 Duplikate identifiziert, 3 als Falsch-Positive wiederhergestellt (verschiedene Personen mit gleichem Namen), 10 gelöscht + Sources in Originale gemergt
- **Prevention:** Bei CSV-Imports mit `date_of_death: null` immer gegen existierende DB prüfen. Historische Referenzen ≠ neue Opfer.

### BUG-010: Gleicher Name ≠ gleiche Person — False-Positive-Duplikate (2026-02-13)

- **Symptom:** `masoud.yaml` (2026, erschossen bei Protesten) und `masud-2010.yaml` (hingerichtet für Drogenhandel) als Duplikate markiert. Ebenso `noshin.yaml` (Kopfschuss 2026) vs `nushin-2018.yaml` (Hinrichtung für Mord).
- **Root Cause:** Gleicher Farsi-Name führte zur Duplikat-Erkennung, aber die Personen hatten völlig verschiedene Todesursachen, -daten und -kontexte.
- **Fix:** 3 fälschlich gelöschte Dateien aus Git wiederhergestellt.
- **Prevention:** Bei Name-only-Matching (ohne Todesdatum) IMMER `cause_of_death` und `circumstances` vergleichen. Hinrichtung ≠ Erschießung bei Protesten = andere Person.

### BUG-011: YAML-ID als negative Zahl geparst (2026-02-13)

- **Symptom:** `seed-new-only.ts --dry-run` zeigte 15 "neue" Einträge die eigentlich in der DB existierten. Prisma-Fehler: `slug: -1989` (Zahl statt String).
- **Root Cause:** YAML parst `-1989` als negative Integer statt als String. Betrifft alle IDs die mit `-` und einer Jahreszahl beginnen (Boroumand-Konvention).
- **Fix:** `const slug = String(v.id)` Coercion in seed-new-only.ts und sync-gender-to-db.ts.
- **Prevention:** YAML-IDs immer in Anführungszeichen oder explizit zu String konvertieren.

### BUG-012: iranrights.org Fotos nicht angezeigt — Cloudflare Bot Protection (2026-02-13)

- **Symptom:** Alle Opfer-Fotos von `iranrights.org/actorphotos/` waren auf der Website nicht sichtbar (leerer Kreis statt Foto). Betraf ~200+ Boroumand-Einträge mit Fotos.
- **Root Cause:** Next.js `<Image>` Komponente optimiert Bilder serverseitig über `/_next/image?url=...`. Der Server (Hetzner-IP) wird von iranrights.org's Cloudflare mit `cf-mitigated: challenge` blockiert → 403 Forbidden. Next.js gibt dann "url parameter is valid but upstream response is invalid" zurück.
- **Diagnose:** `curl -sI` von lokaler Maschine → 200 OK. `curl -sI` vom Server → 403 mit `cf-mitigated: challenge`. Auch mit Browser-User-Agent blockiert → IP-basierte Blockade, nicht User-Agent.
- **Fix:** `unoptimized` Prop auf alle `<Image>` Komponenten (VictimCard.tsx + victims/[slug]/page.tsx). Browser fetcht Bilder direkt von iranrights.org statt über den Server-Proxy.
- **Prevention:** Bei externen Bild-URLs immer testen ob der Server die Quelle erreichen kann. Datacenter-IPs werden oft von Cloudflare geblockt. `unoptimized` als Fallback für nicht-erreichbare Quellen.

### BUG-013: Scraper `-2` Suffix erzeugt Massen-Duplikate (2026-02-13)

- **Symptom:** 4.433 YAML-Dateien mit `-2` Suffix (z.B. `ahmadi-mohammad-2.yaml`), davon 3.800 echte Duplikate
- **Root Cause:** `scrape_boroumand.py` erstellt `slug-2` wenn `slug.yaml` bereits existiert. Bei 26.815 Entries unvermeidlich — viele Opfer haben gleiche latinisierte Namen.
- **Fix:** Merge-Script: Farsi-Name + Todesdatum vergleichen → wenn identisch: Felder + Sources in Original mergen → Duplikat-Datei + DB-Eintrag löschen. 939 Merges nach strenger Prüfung (Original muss existieren + exakter Match).
- **Prevention:** Scraper sollte beim Import direkt gegen DB prüfen statt blind `-2` Dateien zu erstellen. Alternativ: Dedup als fester Pipeline-Schritt nach jedem Batch-Import.

### BUG-014: Mehrfach-Seed erzeugt DB-Duplikate ohne YAML-Gegenstück (2026-02-13)

- **Symptom:** 3.786 Duplikate in DB, aber nur 1.176 davon hatten YAML-Dateien. ~2.610 Duplikate existierten nur in der DB.
- **Root Cause:** Mehrere Runs von `seed-new-only.ts` und `prisma db seed` (upsert) gegen dieselbe DB. Boroumand-Einträge mit leicht verschiedenen Slugs aus verschiedenen Scrape-Runs → gleiche Person, verschiedene DB-Einträge.
- **Fix:** `scripts/dedup-db.ts` — Scoring-basiertes Dedup: Non-null-Felder zählen, besten Eintrag behalten, Felder + Sources mergen, Rest löschen. 3.100 Named-Gruppen (Farsi-Name + Todesdatum) + 117 Unknown-Gruppen (gleicher Text).
- **Prevention:** DB-Level-Dedup als fester Pipeline-Schritt nach jedem Batch-Import. Scraper sollte vor dem Erstellen neuer Einträge die DB auf Farsi-Name + Todesdatum prüfen.

---

## Patterns That Work (Ergänzung 2026-02-13)

- **Create-only Seed (seed-new-only.ts):** Bei inkrementellen Imports nie `upsert` verwenden — das überschreibt AI-extrahierte Felder die nur in der DB, nicht im YAML existieren. Stattdessen: alle existierenden Slugs laden → `findUnique` → nur `create` für neue.
- **Farsi-Name-basierte Duplikat-Erkennung:** Lateinische Transliterationen haben zu viele Varianten (Bayat/Bayati, Menbari/Monbari). Farsi-Name normalisieren (ZWNJ, Diacritics, Kaf/Yeh-Varianten entfernen) → zuverlässigste Matching-Methode. Implementiert in `scripts/dedup_2026_internal.py`.
- **Parallel Scraping mit ThreadPoolExecutor:** 4 Worker × 1s Delay = ~100 Entries/min statt 13/min (8× schneller). Fetch parallel, YAML-Erstellung sequentiell (Slug-Eindeutigkeit). Batch-Größe = Worker × 4.
- **Source-Merge bei Duplikat-Löschung:** Beim Löschen von Duplikaten immer unique Sources (Twitter/Telegram-Links) in das Original mergen. iranvictims.com hat oft Primärquellen die Boroumand nicht hat.
- **`unoptimized` für externe Bilder hinter Cloudflare:** Next.js Image Optimization proxied Bilder serverseitig — Datacenter-IPs werden von Cloudflare geblockt (`cf-mitigated: challenge`). Mit `unoptimized` Prop fetcht der Browser direkt → Cloudflare-Challenge wird im Browser gelöst. Trade-off: keine WebP/AVIF-Konvertierung, aber Bilder werden überhaupt angezeigt.
- **Merge statt Delete bei Duplikaten:** Duplikate können unique Sources (Twitter, Telegram-Links) oder ausgefüllte Felder haben die dem Original fehlen. Pipeline: (1) Felder aus Duplikat ins Original kopieren (nur wenn Original-Feld leer), (2) Unique Sources anhängen, (3) YAML + DB parallel aktualisieren, (4) erst dann Duplikat löschen.
- **Event Death Tolls aus Diaspora-Quellen:** Offizielle iranische Zahlen und von ihnen beeinflusste UN-Berichte sind systematisch zu niedrig. Diaspora-NGOs (HRANA, IHR, Boroumand, Amnesty) liefern konservative verifizierte Minima. Geleakte interne Dokumente zeigen oft 2-3× höhere Zahlen. Immer `estimated_killed_low` (verifiziertes Minimum) und `estimated_killed_high` (Schätzung auf Basis interner Quellen) getrennt führen.

---

*Erstellt: 2026-02-09*
- **Scoring-basiertes Dedup (dedup-db.ts):** Bei Duplikat-Gruppen den "besten" Eintrag per Scoring bestimmen: Non-null-Felder (+1), Photo (+10), Circumstances-Länge (+0-10), Event-Link (+5), Non-Boroumand-Source (+3). Höchster Score = Keeper. Sicherer als Heuristiken wie "erster Eintrag" oder "ältester".
- **Unknown/ناشناس Dedup nur mit Text-Match:** Unbenannte Opfer (name_farsi = 'ناشناس') mit gleichem Datum sind NICHT automatisch Duplikate — es können verschiedene Personen sein. Nur dedupen wenn auch `circumstances_en` Text identisch ist (LEFT 200 chars). Ohne Text: nicht anfassen.
- **Farsi-Normalisierung für Dedup (dedup-round5.ts):** Persisch hat unsichtbare Zeichenvarianten die zu falschen "Unterschieden" führen: ZWNJ (U+200C), Arabic Kaf ك vs Persian Kaf ک, Arabic Yeh ي vs Persian Yeh ی, Hamza-auf-Yeh ئ → ی, Ta Marbuta ة → ه, Alef Madda آ → ا, Arabic Diacritics (Fathatan–Hamza). Normalisierungsfunktion entfernt diese → zuverlässiges Matching. ABER: unterschiedliche normalisierte Farsi-Namen bei gleichem Latin-Namen = verschiedene Personen (23 korrekt übersprungen).
- **Fallback-Daten synchron halten (lib/fallback-data.ts):** Docker-Build hat keinen DB-Zugang → nutzt statische Fallback-Daten. Wenn Event-Opferzahlen oder Victim-Count in der DB geändert werden, MUSS `fallback-data.ts` manuell aktualisiert werden. Sonst zeigt die Website nach jedem Docker-Build alte Zahlen bis ISR die Seiten neu generiert.
- **ISR-Cache: Nie `.next/server/app/` komplett löschen:** ISR-Cache in `/app/.next/server/app/` persists across container restarts. Einzelne Cache-Dateien löschen ist OK, aber das gesamte Verzeichnis löschen verursacht 500-Fehler (Route-Handler fehlen). Stattdessen: `docker compose up -d --build --force-recreate` für sauberen Rebuild.

- **OpenAI Rate-Limit bei Massen-Extraktion:** GPT-4o-mini hat ein tägliches Token-Limit (10K RPD pro Org). Nach ~12.000 Calls in einer Session wird jeder Request mit 429 geblockt. Zweiter API-Key hilft NICHT wenn er in derselben Organisation ist (shared rate limits). Retry-Delay auf mindestens 60s setzen (nicht 5s — erzeugt Endlos-Loop ohne Fortschritt). Am besten: Extraktion über mehrere Tage verteilen, `--resume` Flag für Wiederaufnahme, oder auf Claude Haiku umstellen.
- **pg_dump für DB-Sync statt Seed:** Wenn lokale DB stark veraltet ist, ist `pg_dump` → `psql -f` schneller und vollständiger als Seed-Scripts. Seed kann nur Einträge erstellen die als YAML existieren; pg_dump überträgt auch DB-only Einträge. Wichtig: Plain-SQL-Format (`-F p`) verwenden wenn pg_dump/pg_restore Versionen nicht matchen.
- **Regex vor AI für strukturierte Extraktion:** Für Felder mit klaren Mustern (Pronomen → Gender, Organisationsnamen → responsibleForces, bekannte Events → eventContext, Berufsbezeichnungen → occupation) ist Pattern-basierte Extraktion 1000× schneller, kostenlos und genauso genau wie AI. Script: `extract-fields-regex.ts` hat 4.164 Felder aus 1.980 Victims in 10 Sekunden extrahiert (vs. ~3h und ~$20 für API). AI nur für nuancierte Felder (personality, beliefs, quotes) einsetzen die Kontext-Verständnis brauchen.

---

*Letzte Aktualisierung: 2026-02-13 (Dedup ×6 + AI+Regex-Extraktion 35.764 Felder + Prod-DB sync: 31.203 Victims)*
