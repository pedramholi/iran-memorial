# 260209 — Iran Memorial: Gesamtplanung

> Erstellt: 2026-02-09
> Status: Phase 1 abgeschlossen, Phase 2–4 geplant

---

## Aktueller Stand (Baseline nach Phase 1)

| Metrik | Wert |
|--------|------|
| Code-Dateien (TS/TSX/CSS) | 22 |
| Zeilen Code (TS/TSX/CSS) | 1.927 |
| Zeilen gesamt (inkl. JSON, YAML, Config) | 2.928 |
| Seiten (page.tsx) | 8 |
| Komponenten | 5 |
| API-Routes | 2 |
| Prisma-Models | 4 (Victim, Event, Source, Submission) |
| DB-Felder Victim | 44 |
| DB-Felder Event | 17 |
| Sprachen | 3 (Farsi RTL, Englisch, Deutsch) |
| Übersetzungs-Keys/Sprache | ~102 |
| Seed-Daten: Opfer | 3 |
| Seed-Daten: Ereignisse | 12 |
| Test Coverage | 0% (keine Tests) |
| Build | Erfolgreich (Next.js 16, Turbopack) |
| Commits | 1 |
| Docker Services | 2 (PostgreSQL, App) |

---

## Erfolgskriterien Gesamtprojekt

| Kriterium | Vorher | Ziel | Status |
|-----------|--------|------|--------|
| Opfer in DB | 3 (Seed) | 1.000+ (Phase 2), 10.000+ (Phase 3) | ⏳ |
| Seiten funktional | 8 Basis-Seiten | Alle mit echten Daten + Interaktivität | ⏳ |
| Suche funktional | API vorhanden, ohne DB | Volltext Farsi+Latin, Fuzzy, Filter | ⏳ |
| Test Coverage | 0% | >60% (Phase 2), >80% (Phase 3) | ⏳ |
| Lighthouse Performance | Ungemessen | >90 | ⏳ |
| Lighthouse Accessibility | Ungemessen | >95 | ⏳ |
| Admin-Panel | Nicht vorhanden | CRUD für Editoren mit Auth | ⏳ |
| Offener Datenexport | Nicht vorhanden | JSON/CSV Download, API Docs | ⏳ |
| Interaktiver Zeitstrahl | Statisch | Zoom, Filter, Responsive | ⏳ |
| Karte | Nicht vorhanden | Todesorte, Massengräber, Begräbnisse | ⏳ |
| Deployment | Nur lokal | Produktiv auf VPS mit Domain | ⏳ |

---

## Constraints

```
┌──────────────────────────────────────────────────────────────┐
│  ⚠️  KEIN DOCKER LOKAL                                       │
│                                                              │
│  Docker ist auf dem Entwicklungsrechner nicht installiert.    │
│  PostgreSQL muss zum Testen entweder:                        │
│  A) Lokal via Homebrew installiert werden                    │
│  B) Auf dem VPS getestet werden                              │
│  C) Docker Desktop installiert werden                        │
│                                                              │
│  → Entscheidung: Bei Deployment auf VPS klären               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ⚠️  FARSI-VOLLTEXT-SUCHE                                     │
│                                                              │
│  PostgreSQL hat keinen eingebauten Farsi-Stemmer.            │
│  `simple`-Config tokenisiert zwar korrekt, aber ohne         │
│  morphologische Analyse. pg_trgm hilft bei Fuzzy-Suche.     │
│                                                              │
│  → Für Phase 1–2 ausreichend, Phase 3+ evtl. eigener        │
│    Tokenizer oder Meilisearch evaluieren                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ⚠️  DATENVOLUMEN                                             │
│                                                              │
│  Ziel: 500.000+ Opfer. Das erfordert:                        │
│  - ISR statt SSG (keine 500k Seiten zur Build-Zeit)          │
│  - Paginated Queries (kein findMany ohne Limit)              │
│  - DB-Indexe auf allen Suchfeldern (bereits angelegt)        │
│  - CDN für Fotos bei >10.000 Einträgen                       │
│                                                              │
│  → ISR + Pagination bereits implementiert                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ⚠️  SICHERHEIT / POLITISCHE SENSIBILITÄT                     │
│                                                              │
│  - Einreicher müssen anonym bleiben können                   │
│  - Server darf nicht in Iran oder bei US-Cloud stehen        │
│  - Kein Analytics-Tool, das User-Daten an Dritte sendet      │
│  - DDoS-Schutz nötig (Regime-nahe Akteure)                   │
│                                                              │
│  → Self-hosted + Cloudflare (kostenlos) als Schutzschicht    │
└──────────────────────────────────────────────────────────────┘
```

---

## Was NICHT gemacht wird (Out of Scope)

| Element | Grund |
|---------|-------|
| Mobile App | Web-First reicht, PWA als Alternative in Phase 4 |
| User-Accounts für Besucher | Kein Social-Media-Feature, reine Gedenkseite |
| Kommentar-System (Phase 1–2) | Moderationsaufwand zu hoch ohne Team |
| Echtzeit-Benachrichtigungen | Kein WebSocket nötig, statische Inhalte |
| Machine-Learning Gesichtserkennung | Ethisch problematisch, manuell verifizieren |
| Automatischer Scraper für NGO-Daten | Rechtlich/ethisch erst mit Partnerschaften |
| Multi-Tenant (mehrere Memorials) | Nur Iran, kein generisches Framework |
| Payment / Spenden-Integration | Kein Fundraising, Community-Projekt |

---

## Phasenplan

```
┌────────────────────────────────────────────────────────┐
│  PHASE 1: Fundament                          ✅ FERTIG │
│  Aufwand: 1 Tag | Risiko: Niedrig                      │
├────────────────────────────────────────────────────────┤
│  ✓ Next.js 16 + TypeScript + Tailwind v4               │
│  ✓ PostgreSQL Schema (Prisma)                           │
│  ✓ i18n (Farsi RTL, Englisch, Deutsch)                  │
│  ✓ Dunkles Memorial-Design                              │
│  ✓ 8 Seiten (Home, Victims, Events, Timeline, etc.)    │
│  ✓ Seed-Script (3 Opfer, 12 Events)                    │
│  ✓ Docker Compose + Dockerfile + Nginx                  │
│  ✓ Projektdokumentation (docs/PROJECT.md)              │
│  ✓ Build erfolgreich, Dev-Server läuft                  │
└────────────────────┬───────────────────────────────────┘
                     ▼
              [BEWERTUNG]
  Phase 1 vollständig. Solide Basis für alles Weitere.
  Nächster Engpass: Kein produktives Deployment,
  keine echte DB, keine Tests.
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 2: Produktiv-fähig                    ⏳ OFFEN  │
│  Aufwand: 3–5 Tage | Risiko: Mittel                    │
├────────────────────────────────────────────────────────┤
│  □ 2.1 VPS Deployment (Docker Compose auf Server)       │
│  □ 2.2 Domain + SSL + Cloudflare                        │
│  □ 2.3 PostgreSQL mit echten Daten (Seed laufen lassen) │
│  □ 2.4 Admin-Panel (NextAuth + GitHub OAuth)            │
│  □ 2.5 Bulk-Import Pipeline (CSV/JSON → DB)             │
│  □ 2.6 Offener Datenexport (JSON/CSV Download-Route)    │
│  □ 2.7 API-Dokumentation (öffentliche Endpunkte)        │
│  □ 2.8 Tests: DB-Queries, API-Routes, Seed-Script       │
│  □ 2.9 CI/CD Pipeline (GitHub Actions: Lint + Test)     │
│  □ 2.10 Lighthouse Audit + Optimierung                  │
│                                                         │
│  Erfolgskriterium Phase 2:                              │
│  Website unter eigener Domain live, Seed-Daten sichtbar,│
│  Admin kann Einträge bearbeiten, Export downloadbar.     │
└────────────────────┬───────────────────────────────────┘
                     ▼
              [BEWERTUNG]
  Ist die Seite stabil? Kommen erste Community-Beiträge?
  Wenn ja → Phase 3. Wenn nicht → erst Daten sammeln.
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 3: Skalierung + Interaktivität        ⏳ OFFEN  │
│  Aufwand: 1–2 Wochen | Risiko: Mittel                  │
├────────────────────────────────────────────────────────┤
│  □ 3.1 Bulk-Import: Boroumand Foundation Daten          │
│  □ 3.2 Bulk-Import: Iran Human Rights (IHR) Daten       │
│  □ 3.3 Interaktiver Zeitstrahl (Zoom, Filter, Touch)    │
│  □ 3.4 Kartenvisualisierung (Leaflet/MapLibre)          │
│  □ 3.5 Erweiterte Suche (Facetten, Autocomplete)        │
│  □ 3.6 Statistische Dashboards (Charts)                 │
│  □ 3.7 Deutsche Opfer-Inhalte (Übersetzung)             │
│  □ 3.8 Foto-Upload + CDN (Cloudflare R2)                │
│  □ 3.9 Review-Workflow für Einreichungen                 │
│  □ 3.10 Performance-Optimierung für 10.000+ Einträge    │
│                                                         │
│  Erfolgskriterium Phase 3:                              │
│  >1.000 Opfer in DB, Zeitstrahl + Karte interaktiv,     │
│  Suche findet Farsi + Latin fehlertolerant.              │
└────────────────────┬───────────────────────────────────┘
                     ▼
              [BEWERTUNG]
  Hat das Projekt Traktion? Community aktiv?
  Wenn ja → Phase 4. Wenn nicht → Daten konsolidieren.
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 4: Reichweite + Resilienz             ⏳ OFFEN  │
│  Aufwand: 2–4 Wochen | Risiko: Niedrig                 │
├────────────────────────────────────────────────────────┤
│  □ 4.1 Weitere Sprachen (Arabisch, Kurdisch, Türkisch)  │
│  □ 4.2 Mirror-System (GitLab, Codeberg als Backup)      │
│  □ 4.3 Internet Archive Archivierung                    │
│  □ 4.4 Bildungsmaterialien                               │
│  □ 4.5 Partnerschaften mit Universitäten/NGOs            │
│  □ 4.6 PWA für Offline-Zugang                            │
│  □ 4.7 Barrierefreiheit (WCAG 2.1 AA)                   │
│  □ 4.8 SEO-Optimierung für 500k+ Seiten                 │
│                                                         │
│  Erfolgskriterium Phase 4:                              │
│  Internationale Wahrnehmung, >10.000 Opfer dokumentiert, │
│  Seite in >3 Sprachen, resilient gegen Zensur.           │
└────────────────────────────────────────────────────────┘
```

---

## Risiko-Analyse

| Risiko | Phase | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------|-------------------|--------|------------|
| DB-Verlust | 2 | Niedrig | Kritisch | Tägliche Backups, Seed-Daten in Git als Fallback |
| DDoS-Angriff | 2+ | Mittel | Hoch | Cloudflare Free Tier, Rate Limiting |
| Falsche Daten eingeschleust | 2+ | Mittel | Hoch | Review-Workflow, Verifizierungsstatus, Edit-History |
| Farsi-Suche ungenau | 2 | Mittel | Mittel | pg_trgm als Fallback, Phase 3 Meilisearch evaluieren |
| Scope Creep (Features statt Daten) | 2–3 | Hoch | Mittel | Out-of-Scope Liste pflegen, Daten > Features |
| Kein Community-Engagement | 3 | Mittel | Mittel | Aktive Outreach zu NGOs, Social Media |
| Server-Beschlagnahmung | 2+ | Niedrig | Hoch | Git-Mirrors, Datenexport, multiple Hosting-Standorte |
| Prisma-Version Breaking Change | 2 | Niedrig | Mittel | Version pinnen, vor Upgrade testen |
| next-intl Breaking Change (Middleware→Proxy) | 2 | Mittel | Niedrig | Deprecation-Warning beobachten, bei Bedarf migrieren |

---

## Rollback-Strategie

| Phase | Rollback-Methode |
|-------|------------------|
| Phase 1 | ✅ Abgeschlossen — Baseline-Commit `557e1a8` |
| Phase 2 | `git branch backup-pre-phase2` VOR Start. DB-Dump vor Migrationen. |
| Phase 3 | Branch + DB-Dump. Jedes Feature als eigener Branch, einzeln revertbar. |
| Phase 4 | Rein additiv (neue Sprachen, neue Integrationen) — einzeln abschaltbar. |

---

## Technische Entscheidungen (Decision Log)

| # | Entscheidung | Optionen | Gewählt | Begründung |
|---|---|---|---|---|
| D-001 | Source of Truth | A) YAML in Git, B) PostgreSQL | B | 500k+ Einträge, Relationen, Volltextsuche — YAML skaliert nicht |
| D-002 | Hosting | A) Vercel, B) Self-hosted VPS, C) Cloudflare Pages | B | Datensouveränität, keine Abhängigkeit von US-Cloud |
| D-003 | Sprachen | A) Nur Englisch, B) EN+FA, C) EN+FA+DE | C | Diaspora-Reichweite, DE als drittwichtigste Community |
| D-004 | Framework | A) Astro, B) Next.js, C) SvelteKit | B | ISR für 500k Seiten, Ökosystem, next-intl für i18n |
| D-005 | Prisma-Version | A) v7 (Breaking Changes), B) v6 (stabil) | B | v7 erfordert neues Config-Format, v6 funktioniert |
| D-006 | CSS Framework | A) Tailwind v4, B) CSS Modules, C) Styled Components | A | RTL-Support, kein Build-Overhead, Dark Theme |
| D-007 | Design-Charakter | A) Hell/neutral, B) Dunkel/würdevoll | B | Memorial-Charakter, Würde, Ernsthaftigkeit |
| D-008 | Middleware | next-intl Middleware (deprecated in Next 16) | Beibehalten | Funktioniert, next-intl hat noch keinen Proxy-Support |

---

## Nächste Schritte (unmittelbar)

```
Priorität 1: VPS Deployment (Phase 2.1–2.3)
  → Docker Compose auf Server bringen
  → Domain + SSL konfigurieren
  → Seed-Daten importieren
  → Erste öffentlich erreichbare Version

Priorität 2: Admin-Panel (Phase 2.4)
  → Ohne Admin können keine neuen Opfer hinzugefügt werden
  → Bottleneck für Wachstum der Datenbank

Priorität 3: Datenimport (Phase 2.5)
  → Boroumand Foundation hat tausende Einträge
  → Skript schreiben für CSV/JSON → Prisma Import
```
