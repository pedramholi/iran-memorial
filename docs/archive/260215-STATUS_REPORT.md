# Iran Memorial — Statusbericht 2026-02-15

> Snapshot nach v0.7.0 Feature-Batch: Map, Export, API Docs, Admin, Interactive Timeline.
> Basiert auf 260213-STATUS_REPORT.md mit aktualisierten Feature- und Test-Daten.

---

## 1. Projekt-Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Name** | Iran Memorial |
| **URL** | memorial.n8ncloud.de |
| **Zweck** | Digitale Gedenkseite für Opfer der Islamischen Republik Iran (1979–heute) |
| **Sprachen** | Farsi, English, Deutsch |
| **Repository** | github.com/pedramholi/iran-memorial |
| **Version** | v0.7.0 |
| **Gestartet** | 2026-02-09 |
| **Tech Stack** | Next.js 16, TypeScript, Prisma 6, PostgreSQL 16, Tailwind v4, Leaflet, Docker |

---

## 2. Datenbank-Kennzahlen

| Tabelle | Einträge |
|---------|----------|
| **Victims** | **30.795** (nach Dedup) |
| Sources | 43.000+ |
| Events | 12 |
| Photos | 4.999 |
| Submissions | 0 |

---

## 3. Neue Features (v0.7.0)

| Feature | Route | Beschreibung |
|---------|-------|--------------|
| **Interaktive Karte** | `/[locale]/map` | Leaflet-Karte mit 31 Provinzen, proportionale Marker, Schweregrad-Farbcodierung |
| **Datenexport API** | `/api/export` | JSON + CSV Download, Rate Limit 10/h, CC BY-SA 4.0 Lizenz |
| **API-Dokumentation** | `/[locale]/api-docs` | Endpoint-Referenz mit Beispielen und Live-Stats |
| **Admin Review Panel** | `/[locale]/admin` | Tab-UI (Pending/Approved/Rejected), Approve/Reject Workflow |
| **Interaktiver Zeitstrahl** | `/[locale]/timeline` | Zoom 50%–300%, Click-to-Expand Events |
| **Navigation** | Header | 2 neue Items: Map, API (6 → 8 Nav-Links) |

### 3.1 Seiten-Übersicht (13 Seiten)

| Route | Beschreibung |
|-------|--------------|
| `/[locale]` | Homepage (Stats, Events, Recent Victims) |
| `/[locale]/victims` | Suche + paginierte Liste (FilterBar) |
| `/[locale]/victims/[slug]` | Opfer-Detailseite + PhotoGallery |
| `/[locale]/events` | Alle Events |
| `/[locale]/events/[slug]` | Event-Detail + verlinkte Opfer |
| `/[locale]/timeline` | Interaktiver Zeitstrahl (Zoom + Expand) |
| `/[locale]/map` | Provinz-Karte (Leaflet) |
| `/[locale]/statistics` | Charts und Statistiken |
| `/[locale]/api-docs` | API-Dokumentation |
| `/[locale]/admin` | Admin Submission-Review |
| `/[locale]/submit` | Community-Einreichung |
| `/[locale]/about` | Über das Projekt |

### 3.2 API-Routen (4 Endpoints)

| Route | Methode | Zweck | Rate Limit |
|-------|---------|-------|------------|
| `/api/search` | GET | Volltextsuche (tsvector + trgm) | 100/min |
| `/api/submit` | POST | Einreichung (Zod-validiert) | 5/h |
| `/api/export` | GET | Datenexport JSON/CSV | 10/h |
| `/api/admin/submissions` | GET/PATCH | Admin Review | Auth required |

---

## 4. Test Suite

| Suite | Framework | Tests | Zeit | Status |
|-------|-----------|-------|------|--------|
| Frontend | Vitest + Testing Library | 124 | 1.13s | ✅ Alle bestanden |
| Enricher | pytest | 100 | 0.10s | ✅ Alle bestanden |
| **Gesamt** | | **224** | **<1.3s** | ✅ |

### 4.1 Vitest-Aufschlüsselung (11 Dateien)

| Datei | Tests |
|-------|-------|
| rate-limit.test.ts | 8 |
| submit-schema.test.ts | 15 |
| search-route.test.ts | 10 |
| queries.test.ts | 12 |
| utils.test.ts | 23 |
| submit-route.test.ts | 10 |
| VictimCard.test.tsx | 16 |
| LanguageSwitcher.test.tsx | 6 |
| FilterBar.test.tsx | 10 |
| Header.test.tsx | 6 |
| SearchBar.test.tsx | 8 |

### 4.2 pytest-Aufschlüsselung (5 Dateien)

| Datei | Tests |
|-------|-------|
| test_provinces.py | 8 |
| test_iranvictims.py | 26 |
| test_iranrevolution.py | 10 |
| test_enricher_pipeline.py | 9 |
| test_telegram_rtn.py | 47 |

---

## 5. Abgeschlossene Phasen

| Phase | Zeitraum | Highlights |
|-------|----------|------------|
| Phase 1 | 09.02.2026 | Projekt-Setup, 8 Seiten, Docker, Seed |
| Phase 2A | 09.02.2026 | 7 Quellen, 4.378 Opfer |
| Phase 2B | 09.02.2026 | Gender-Inferenz, Dedup R1+2 |
| Phase 2C | 12.02.2026 | Deployment, AI Enrichment, Security |
| Phase 3 | 13.02.2026 | Boroumand Historical, 31K Victims |
| v0.5.0 | 14.02.2026 | Enricher Framework, Multi-Photo, Dedup (30.795), WAT |
| v0.5.1 | 14.02.2026 | iranvictims CSV, iranrevolution, circumstances_fa, 53 pytest |
| v0.6.0 | 14.02.2026 | Deutsche Übersetzung: 7 `_de` Spalten, ~22K circumstances_de |
| v0.6.1 | 15.02.2026 | Telegram RTN Plugin, Jalali-Konvertierung, 100 pytest |
| **v0.7.0** | **15.02.2026** | **Map, Export API, API Docs, Admin Panel, Interactive Timeline, 224 Tests** |

---

## 6. Phasenplan-Fortschritt

### Phase 2 — Wachstum: 6/7 ✅

- [x] Admin-Panel (Submission Review via Nginx Basic Auth)
- [x] Bulk-Import (7 Quellen, Enricher Framework)
- [x] Deutsche Übersetzungen (~22K circumstances_de)
- [ ] Foto-Upload + CDN (Upload-UI fehlt, Multi-Photo Support existiert)
- [x] Erweiterte Suchfilter (FilterBar: Provinz, Jahr, Geschlecht)
- [x] Offener Datenexport (JSON/CSV via `/api/export`)
- [x] API-Dokumentation (`/api-docs`)

### Phase 3 — Interaktivität: 3/5 ✅

- [x] Interaktiver Zeitstrahl (Zoom 50%–300%, Click-to-Expand)
- [x] Kartenvisualisierung (Provinz-Level Leaflet)
- [x] Statistische Dashboards (Statistics-Seite)
- [ ] Community-Kommentare
- [ ] Benachrichtigungssystem

### Phase 4 — Reichweite: 0/5

- [ ] Weitere Sprachen (Arabisch, Kurdisch, Türkisch)
- [ ] Partnerschaften mit Universitäten
- [ ] Internet Archive Archivierung
- [ ] Bildungsmaterialien
- [ ] Mobile App

---

## 7. Offene Items

| Priorität | Item | Status |
|-----------|------|--------|
| Hoch | Server Disk 95% — Docker Prune | ⚠️ Offen |
| Hoch | Foto-Upload + CDN UI | Fehlt |
| Mittel | Community-Kommentare | Geplant (Phase 3) |
| Mittel | Benachrichtigungssystem | Geplant (Phase 3) |
| Mittel | CI/CD Pipeline (GitHub Actions) | Fehlt |
| Niedrig | E2E Tests (Playwright) | Geplant |
| Niedrig | Weitere Sprachen | Phase 4 |

---

*Erstellt: 2026-02-15*
*Nächstes Review: Bei Beginn von Phase 4*
