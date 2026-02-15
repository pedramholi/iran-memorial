# Iran Memorial — Statusbericht 2026-02-15 (v0.7.1)

> Snapshot nach v0.7.1: SEO, Comments API, Photo Upload, Province DB, CI/CD, E2E Tests, Telegram RTN Enricher Run.

---

## 1. Projekt-Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| Version | v0.7.1 |
| Opfer in DB | **30.798** |
| Fotos | **6.995** (+42% durch Telegram RTN) |
| Quellen | **43.481** |
| Provinzen | **31** (DB-driven) |
| Städte | **63** (DB-driven) |
| Opfer mit Stadt-Zuordnung | **21.363** (69%) |
| Seiten (Routes) | 22 |
| API-Endpoints | 6 (search, submit, export, comments, upload, admin) |
| Sprachen | 3 (Farsi, Englisch, Deutsch) |
| Tests | **224** (124 Vitest + 100 pytest) |
| Live | [memorial.n8ncloud.de](https://memorial.n8ncloud.de) |

---

## 2. Neue Features (v0.7.1)

### SEO
- Dynamische `sitemap.xml` mit allen Opfern + Events × 3 Sprachen (~90K URLs)
- `robots.txt` mit Admin-Disallow
- Open Graph + Twitter Card Meta-Tags auf Opfer- und Event-Detailseiten
- `metadataBase` im Root-Layout

### Community Comments API
- `POST /api/comments` — Rate-limited (10/h), max 2000 chars, pending Moderation
- `GET /api/comments?victimId=` — Nur approved Comments
- Prisma Comment Model mit FK zu Victim (cascade delete)

### Photo Upload API
- `POST /api/upload` — Auth via X-Forwarded-User
- Validierung: JPEG/PNG/WebP, max 5MB
- Auto-isPrimary wenn erstes Foto

### Province/City DB-Schema
- 31 Provinzen + 63 Städte mit Koordinaten (lat/lng)
- 21.363 Opfer (69%) automatisch via 5-Step Backfill verknüpft
- IranMap + FilterBar refactored auf DB-driven Daten

### CI/CD Pipeline
- GitHub Actions: 3 Jobs (Vitest, pytest, Build)
- Läuft auf push/PR gegen main

### E2E Tests
- Playwright Setup mit Navigation-, Search-, Submit- und API-Tests

---

## 3. Telegram RTN Enricher — Produktions-Ergebnisse

| Metrik | Wert |
|--------|------|
| Verarbeitete Posts | 2.709 |
| Seiten gescraped | 137 |
| Matches | 2.070 (76%) |
| Enriched | 413 (432 Felder) |
| Fotos hinzugefügt | 2.070 |
| Sources hinzugefügt | 642 |
| Neue Opfer importiert | 1 |
| Ambiguous (nicht gemergt) | 48 |
| Unmatched | 591 |

**Foto-Wachstum:** 4.925 → 6.995 (+42%)

---

## 4. DB-Migrationen (auf Server angewandt)

1. `20260214180000_add_german_victim_fields` — 7 `_de` Spalten
2. `20260215120000_add_province_city_tables` — Provinces + Cities + Seed + Victim Backfill
3. `20260215150000_add_comments` — Comments Tabelle

---

## 5. Test Suite

### Vitest (Frontend)
| Datei | Tests |
|-------|-------|
| `lib/utils.test.ts` | 17 |
| `lib/queries.test.ts` | 13 |
| `lib/rate-limit.test.ts` | 13 |
| `api/submit-schema.test.ts` | 15 |
| `api/search-route.test.ts` | 10 |
| `api/submit-route.test.ts` | 10 |
| `components/VictimCard.test.tsx` | 16 |
| `components/SearchBar.test.tsx` | 8 |
| `components/LanguageSwitcher.test.tsx` | 6 |
| `components/Header.test.tsx` | 6 |
| `components/FilterBar.test.tsx` | 10 |
| **Gesamt** | **124** |

### pytest (Enricher)
| Datei | Tests |
|-------|-------|
| `test_provinces.py` | 8 |
| `test_iranvictims.py` | 26 |
| `test_iranrevolution.py` | 10 |
| `test_enricher_pipeline.py` | 9 |
| `test_telegram_rtn.py` | 47 |
| **Gesamt** | **100** |

**Alle 224 Tests bestanden.** Laufzeit: <1.3s kombiniert.

---

## 6. Phasen-Status

### Phase 2 — Wachstum: **7/7 erledigt** ✅
- [x] Admin-Panel
- [x] Bulk-Import (7 Quellen)
- [x] Deutsche Übersetzungen
- [x] Foto-Upload API
- [x] Erweiterte Suchfilter
- [x] Datenexport API
- [x] API-Dokumentation

### Phase 3 — Interaktivität: **4/5 erledigt**
- [x] Interaktiver Zeitstrahl
- [x] Kartenvisualisierung (DB-driven)
- [x] Statistische Dashboards
- [x] Community Comments API
- [ ] Benachrichtigungssystem

### Phase 4 — Reichweite: **0/5 offen**
- [ ] Weitere Sprachen
- [ ] Partnerschaften
- [ ] Langzeitarchivierung
- [ ] Bildungsmaterialien
- [ ] Mobile App

---

## 7. Infrastruktur

| Komponente | Status |
|------------|--------|
| Docker Build | ✅ Erfolgreich (22 Routen) |
| Docker Prune | ✅ 2.4 GB freigegeben |
| DB-Migrationen | ✅ 3 Migrationen angewandt |
| Sitemap | ✅ /sitemap.xml live |
| robots.txt | ✅ /robots.txt live |
| CI/CD | ✅ GitHub Actions konfiguriert |
| E2E Tests | ✅ Playwright konfiguriert |

---

*Erstellt: 2026-02-15 | Version: v0.7.1*
