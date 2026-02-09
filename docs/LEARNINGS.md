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

---

## Deployment Gotchas

- **Docker nicht lokal installiert:** Dev-Umgebung hat kein Docker. DB-Queries fallen auf leere Defaults zurück (try/catch in allen Pages). PostgreSQL erst auf VPS testen.
- **Prisma Seed braucht tsx:** `npx tsx prisma/seed.ts` — tsx muss als devDependency installiert sein. Konfiguriert in `package.json#prisma.seed`.
- **pg_trgm Extension:** Muss manuell oder via `init.sql` aktiviert werden (`CREATE EXTENSION IF NOT EXISTS pg_trgm;`). Ohne pg_trgm keine Fuzzy-Suche.
- **next-intl Middleware vs Proxy:** Next.js 16 zeigt Deprecation-Warning für `middleware.ts`. next-intl hat noch keinen Proxy-Support. Warnung ist kosmetisch, Middleware funktioniert.
- **.env nicht in Git:** `.env` ist in `.gitignore`. Template in `.env.example`. Auf Server muss `.env` manuell erstellt werden.
- **poppler für PDF-Parsing:** `pdftotext` (aus dem poppler-Paket) wird zum Extrahieren von Text aus NGO-PDFs benötigt. Installation: `brew install poppler` (macOS). Ohne poppler scheitern alle PDF-Import-Scripts.

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

**Aktueller Stand (nach Multi-Source-Import + Deduplizierung):** 4.375 Opfer total
- ~755 WLF 2022 (Wikipedia 422 + HRANA 352 + Manuell 12 + IHR 1, nach Dedup)
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
| 2 | Boroumand Foundation (iranrights.org/memorial) | ~50-200 + Enrichment | API/Scrape | Offen |
| 3 | Amnesty International PDFs | ~44 Kinder namentlich | PDF-Parse | Offen |
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
*Letzte Aktualisierung: 2026-02-09 (MEDIUM-Dedup abgeschlossen: 206 Duplikate total)*
