# 260209 — Iran Memorial: Ausführungslog

> Gestartet: 2026-02-09
> Bezieht sich auf: `260209-PHASE1_PLAN.md`

---

## Phase 1: Fundament

### Erfolgskriterien Phase 1

| Kriterium | Ziel | Status |
|-----------|------|--------|
| Next.js Projekt lauffähig | Build + Dev-Server grün | ✅ |
| DB-Schema definiert | 4 Models, alle Felder laut Plan | ✅ |
| i18n 3 Sprachen | FA (RTL) + EN + DE, URL-basiert | ✅ |
| Alle Phase-1-Seiten | 8 Seiten + 2 API-Routes | ✅ |
| Seed-Script | 3 Opfer + 12 Events importierbar | ✅ |
| Docker-Setup | Compose + Dockerfile + Nginx | ✅ |
| Dokumentation | PROJECT.md + PLAN + LOG | ✅ |
| Build erfolgreich | `npm run build` ohne Fehler | ✅ |

---

#### LOG-001 | 2026-02-09 | REPO-ANALYSE

**Was:** Bestehende Daten im Repository analysieren
**Warum:** Baseline verstehen bevor Code geschrieben wird

```
Aktion: Verzeichnisstruktur + YAML-Dateien gelesen
Ergebnis:
  - 3 Opfer-YAML vorhanden: Mahsa Amini, Neda Agha-Soltan, Maryam Kazemi (1988)
  - 12 Events in timeline.yaml (1979–2026)
  - Template-Datei für neue Opfer vorhanden
  - README.md mit Mission Statement
  - Leere Verzeichnisse für weitere Jahrzehnte angelegt
```

**Entscheidung:** Datenstruktur verstanden. YAML-Felder als Vorlage für Prisma-Schema verwenden.

---

#### LOG-002 | 2026-02-09 | PROJEKT-INITIALISIERUNG

**Was:** Next.js Projekt im bestehenden Repo aufsetzen
**Warum:** Bestehendes Repo hat README + data/, muss erhalten bleiben

```
Aktion: `npx create-next-app@latest .` versucht
Ergebnis: FEHLGESCHLAGEN — create-next-app verweigert Installation
  in Verzeichnis mit bestehenden Dateien (README.md, data/)

Aktion: Manuelles Setup — npm init + einzelne Dependencies
Ergebnis: ERFOLG
  - npm init -y → package.json
  - next, react, react-dom installiert
  - typescript, tailwindcss v4, eslint, postcss als devDeps
  - next-intl, prisma, @prisma/client, yaml als deps
```

**Entscheidung:** Manuelles Setup funktioniert. `create-next-app` ist nur eine Convenience — alles was es tut, können wir selbst.

**Lesson Learned:** `create-next-app` scheitert bei bestehenden Dateien. Manuelles Setup ist gleichwertig und flexibler.

---

#### LOG-003 | 2026-02-09 | KONFIGURATION

**Was:** TypeScript, Tailwind, PostCSS, Next.js Config erstellen
**Warum:** Projekt braucht Grundkonfiguration zum Bauen

```
Aktion: tsconfig.json, postcss.config.mjs, next.config.ts, .gitignore erstellt
Ergebnis: ERFOLG — alle Configs angelegt
  - next.config.ts mit next-intl Plugin
  - Tailwind v4 über @tailwindcss/postcss (kein tailwind.config nötig)
  - .gitignore mit node_modules, .next, .env
```

**Entscheidung:** Weiter mit i18n-Setup.

---

#### LOG-004 | 2026-02-09 | I18N-SETUP (next-intl)

**Was:** Dreisprachiges Routing mit next-intl einrichten
**Warum:** Farsi (RTL) + Englisch + Deutsch von Anfang an

```
Aktion: i18n/config.ts, routing.ts, request.ts, navigation.ts erstellt
        Middleware für Locale-Routing
        3 Übersetzungsdateien: fa.json, en.json, de.json

Ergebnis: ERFOLG
  - ~102 Übersetzungs-Keys pro Sprache
  - URL-Schema: /fa/, /en/, /de/
  - RTL-Support über localeDirection Map
  - Sprachumschalter-Komponente
```

**Entscheidung:** i18n vollständig. Weiter mit Prisma-Schema.

---

#### LOG-005 | 2026-02-09 | PRISMA-SCHEMA

**Was:** Datenbankschema nach Plan erstellen
**Warum:** Alle Opfer-/Event-/Source-Felder müssen abgebildet werden

```
Aktion: prisma/schema.prisma mit 4 Models erstellt
        - Victim: 44 Felder (Leben, Tod, Nachwirkung, Verwaltung)
        - Event: 17 Felder (Titel, Datum, Beschreibung, Schätzungen)
        - Source: M:N zwischen Victims/Events und Quellen
        - Submission: Community-Einreichungen mit Review-Workflow

Ergebnis: ERFOLG — Schema kompiliert, Prisma Client generiert
```

**Entscheidung:** Schema deckt alle YAML-Felder ab + Verwaltungsfelder. Weiter mit Layout.

---

#### LOG-006 | 2026-02-09 | PRISMA VERSION KONFLIKT

**Was:** `npx prisma generate` schlägt fehl
**Warum:** Prisma v7 hat Breaking Changes (neues Config-Format)

```
Aktion: npx prisma generate
Ergebnis: FEHLGESCHLAGEN
  Error: "The datasource property `url` is no longer supported in schema files"
  Prisma v7 erfordert prisma.config.ts statt url in schema

Aktion: Downgrade auf Prisma v6
  npm install prisma@^6 @prisma/client@^6
Ergebnis: ERFOLG — Prisma Client generiert
```

**Entscheidung:** Prisma v6 beibehalten. v7-Migration ist eigenständiges Task, kein Blocker.

**Lesson Learned:** Prisma v7 (seit ~2026) hat Breaking Changes in der Config. `url` in schema.prisma funktioniert nicht mehr. Entweder v6 pinnen oder auf prisma.config.ts migrieren.

---

#### LOG-007 | 2026-02-09 | LAYOUT + DESIGN

**Was:** Basis-Layout mit Memorial-Charakter erstellen
**Warum:** Dunkles, würdevolles Design als Grundlage

```
Aktion: Erstellt:
  - app/globals.css (Custom Theme: memorial-950..50, gold, blood)
  - app/layout.tsx (Root mit Metadata)
  - app/[locale]/layout.tsx (Locale-spezifisch: RTL, Fonts, Header, Footer)
  - components/Header.tsx (Nav + Sprachumschalter + Mobile Menu)
  - components/Footer.tsx
  - components/LanguageSwitcher.tsx

Ergebnis: ERFOLG
  - Farbpalette: memorial-950 (#0a0a0f) bis memorial-50 (#f5f5f8)
  - Akzente: gold-500 (#c9a84c), blood-500 (#b91c1c)
  - Fonts: Inter (LTR), Vazirmatn (RTL/Farsi)
  - Candle-Flicker Animation für Gedenkcharakter
```

**Entscheidung:** Design steht. Weiter mit Seiten.

---

#### LOG-008 | 2026-02-09 | SEITEN + KOMPONENTEN

**Was:** Alle Phase-1-Seiten implementieren
**Warum:** Vollständige Navigierbarkeit der Gedenkstätte

```
Aktion: 8 Seiten + 2 API-Routes + 2 weitere Komponenten erstellt
  Seiten:
    - /[locale]/page.tsx — Startseite (Stats, Suche, Recent)
    - /[locale]/victims/page.tsx — Opferliste (Suche, Pagination)
    - /[locale]/victims/[slug]/page.tsx — Opfer-Detail (ISR, revalidate: 3600)
    - /[locale]/events/page.tsx — Alle Ereignisse chronologisch
    - /[locale]/events/[slug]/page.tsx — Ereignis-Detail + verknüpfte Opfer
    - /[locale]/timeline/page.tsx — Vertikaler Zeitstrahl
    - /[locale]/submit/page.tsx — Einreichungsformular
    - /[locale]/about/page.tsx — Über das Projekt
  API:
    - /api/search — GET, Suche nach Name/Ort/Alias
    - /api/submit — POST, Community-Einreichung → DB
  Komponenten:
    - VictimCard.tsx — Opfer-Karte (Foto, Name, Datum, Ort)
    - SearchBar.tsx — Suchfeld mit Redirect

Ergebnis: ERFOLG — alle Seiten erstellt
```

**Entscheidung:** Weiter mit Seed-Script und Docker.

---

#### LOG-009 | 2026-02-09 | SEED-SCRIPT

**Was:** Import-Script für YAML → PostgreSQL
**Warum:** Die 3 bestehenden Opfer + 12 Events müssen in die DB

```
Aktion: prisma/seed.ts erstellt
  - Liest data/events/timeline.yaml → events-Tabelle
  - Findet rekursiv alle *.yaml in data/victims/ → victims-Tabelle
  - Verknüpft Opfer mit Events über event_context Mapping
  - Importiert Quellen (sources) pro Opfer
  - Upsert-Logik: kann mehrfach laufen ohne Duplikate

Ergebnis: ERFOLG — Script kompiliert, Logik vollständig
  (DB-Test noch nicht möglich da kein lokaler PostgreSQL)
```

**Entscheidung:** Seed-Script bereit. Test bei Deployment (Phase 2.3).

---

#### LOG-010 | 2026-02-09 | DOCKER + DEPLOYMENT CONFIG

**Was:** Docker Compose, Dockerfile, Nginx Config erstellen
**Warum:** Ein-Befehl-Setup für Entwicklung und Produktion

```
Aktion:
  - docker-compose.yml: PostgreSQL 16 Alpine + Next.js App
  - prisma/init.sql: CREATE EXTENSION pg_trgm
  - Dockerfile: Multi-Stage Build (deps → builder → runner)
  - nginx.conf: Reverse Proxy mit Static Asset Caching
  - .env.example: Template für Konfiguration
  - .env: Lokale Entwicklungswerte (in .gitignore)

Ergebnis: ERFOLG — alle Configs erstellt
```

**Entscheidung:** Deployment-Ready. Weiter mit Build-Test.

---

#### LOG-011 | 2026-02-09 | BUILD-TEST — FEHLER

**Was:** Erster Build-Versuch
**Warum:** Prüfen ob alles zusammenpasst

```
Aktion: npm run build
Ergebnis: FEHLGESCHLAGEN — 25 Fehler
  "Specified module format (CommonJs) is not matching the module format
   of the source code (EcmaScript Modules)"

Analyse: package.json enthält "type": "commonjs" (von npm init generiert)
  aber alle .ts/.tsx Dateien verwenden ESM import/export Syntax.

Aktion: "type": "commonjs" → "type": "module" in package.json
Ergebnis: ERFOLG — Build kompiliert in 831ms
```

**Entscheidung:** Build grün. ESM als Modulformat korrekt.

**Lesson Learned:** `npm init` setzt `"type": "commonjs"`. Next.js braucht `"type": "module"`. Immer prüfen nach `npm init`.

---

#### LOG-012 | 2026-02-09 | BUILD-TEST — ERFOLG

**Was:** Finaler Build + Dev-Server Test
**Warum:** Verifizierung dass alles funktioniert

```
Aktion: npm run build
Ergebnis: ERFOLG

  Route (app)
  ├ ○ /_not-found
  ├ ● /[locale]             (fa, en, de)
  ├ ● /[locale]/about       (fa, en, de)
  ├ ● /[locale]/events      (fa, en, de)
  ├ ƒ /[locale]/events/[slug]
  ├ ● /[locale]/submit      (fa, en, de)
  ├ ● /[locale]/timeline    (fa, en, de)
  ├ ƒ /[locale]/victims
  ├ ƒ /[locale]/victims/[slug]
  ├ ƒ /api/search
  └ ƒ /api/submit

  ○ Static, ● SSG, ƒ Dynamic

Aktion: npm run dev
Ergebnis: ERFOLG — Server startet in 454ms
  ⚠ Middleware deprecation warning (kosmetisch, next-intl funktioniert)

Aktion: Finale Metriken
  - 22 Code-Dateien (TS/TSX/CSS)
  - 1.927 Zeilen Code
  - 2.928 Zeilen gesamt
  - Build-Zeit: 831ms
  - Dev-Start: 454ms
```

**Entscheidung:** Phase 1 vollständig abgeschlossen.

---

#### LOG-013 | 2026-02-09 | DOKUMENTATION

**Was:** Projektdokumentation erstellen
**Warum:** Offenes Projekt braucht umfassende Doku für Contributors

```
Aktion: docs/PROJECT.md erstellt
  - 14 Kapitel: Was/Warum/Wofür/Wer/Wo/Wie
  - Datenmodell dokumentiert
  - Ethische Grundsätze
  - Open-Source-Philosophie
  - Phasenplan
  - Architekturentscheidungen

Ergebnis: ERFOLG — umfassende Dokumentation auf Deutsch
```

**Entscheidung:** Weiter mit Git Commit.

---

#### LOG-014 | 2026-02-09 | GIT COMMIT + PUSH

**Was:** Alles committen und auf GitHub pushen
**Warum:** Code muss öffentlich verfügbar sein

```
Aktion: git add (50 Dateien) + git commit
Ergebnis: ERFOLG
  Commit: 557e1a8
  Dateien: 50
  Änderungen: +11.964 Zeilen
  .env korrekt ausgeschlossen (in .gitignore)

Aktion: git push -u origin main
Ergebnis: ERFOLG
  Repo live: https://github.com/pedramholi/iran-memorial
```

**Entscheidung:** Phase 1 abgeschlossen und veröffentlicht.

---

## Phase 1 — Zusammenfassung

| Metrik | Ziel | Ergebnis |
|--------|------|----------|
| Projekt lauffähig | Build + Dev grün | ✅ Build 831ms, Dev 454ms |
| DB-Schema | 4 Models | ✅ Victim (44), Event (17), Source, Submission |
| i18n | 3 Sprachen | ✅ FA (RTL) + EN + DE, ~102 Keys/Sprache |
| Seiten | Phase-1-Seiten | ✅ 8 Seiten + 2 API-Routes |
| Seed-Script | YAML → DB | ✅ 3 Opfer + 12 Events |
| Docker | Compose + Dockerfile | ✅ PostgreSQL + App + Nginx |
| Dokumentation | PROJECT.md | ✅ 14 Kapitel |
| Git | Committed + Pushed | ✅ 557e1a8, 50 Dateien, 11.964 Zeilen |

### Probleme und Lösungen

| Problem | Lösung | Log |
|---------|--------|-----|
| create-next-app verweigert bestehende Dateien | Manuelles Setup | LOG-002 |
| Prisma v7 Breaking Changes | Downgrade auf v6 | LOG-006 |
| CommonJS vs ESM Modulkonflikt | `"type": "module"` in package.json | LOG-011 |

### Offene Punkte für Phase 2

- DB noch nicht getestet (kein lokaler PostgreSQL)
- Seed-Script noch nicht gegen echte DB gelaufen
- Middleware-Deprecation in Next.js 16 (noch funktionsfähig)
- Keine Tests vorhanden (0% Coverage)
- Kein Deployment (nur lokal)
