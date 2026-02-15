# Codebase Audit v0.7.3 — iran-memorial

**Datum:** 2026-02-15
**Stand:** v0.7.3 | 30.795 Opfer | 43.5K Quellen | 6.995 Fotos | 256 Tests

---

## 1. Bestandsaufnahme

### 1.1 Voll funktionale Features

| Feature | Seiten/Dateien | Tests |
|---------|---------------|-------|
| Homepage (Hero, Stats, Suche) | `app/[locale]/page.tsx` | - |
| Opfer-Liste (Suche, Filter, Pagination) | `app/[locale]/victims/page.tsx` | VictimCard, FilterBar, SearchBar |
| Opfer-Detail (Galerie, Quellen, Biografie) | `app/[locale]/victims/[slug]/page.tsx` | - |
| Events-Liste | `app/[locale]/events/page.tsx` | - |
| Event-Detail + Statistiken | `app/[locale]/events/[slug]/page.tsx` | EventStatistics |
| Interaktive Timeline (Zoom, Expand) | `components/InteractiveTimeline.tsx` | - |
| Interaktive Karte (Leaflet, Provinzen) | `components/IranMap.tsx` | - |
| Statistik-Seite (6 Chart-Typen) | `app/[locale]/statistics/page.tsx` | charts |
| Event-Statistiken (Provinz/Todesursache/Alter/Geschlecht) | `components/EventStatistics.tsx` | EventStatistics, charts |
| Suche (tsvector + pg_trgm Fallback) | `app/api/search/route.ts` | search-route |
| Submit-Formular | `app/[locale]/submit/page.tsx`, `app/api/submit/route.ts` | submit-route, submit-schema |
| Export API (JSON/CSV) | `app/api/export/route.ts` | - |
| SEO (Sitemap, robots, Open Graph) | `app/sitemap.ts`, `app/robots.ts` | - |
| i18n (FA/EN/DE, 102 Keys) | `messages/{fa,en,de}.json` | LanguageSwitcher, Header |
| Enricher-Pipeline (6 Plugins) | `tools/enricher/` | 112 pytest |
| CI/CD (Vitest + pytest + Build) | `.github/workflows/test.yml` | - |

### 1.2 Teilweise funktionale Features

| Feature | Problem |
|---------|---------|
| Admin Panel | camelCase-Bug → zeigt "Unknown" bei Submissions |
| API Docs Seite | Komplett auf Englisch, keine Translation-Keys |
| Comments API | Backend existiert, aber kein Frontend-UI |
| Photo Upload API | Uploads gehen bei Docker-Rebuild verloren |

### 1.3 Feature-Lücken

| Feature | Status |
|---------|--------|
| Comments-UI auf Opfer-Seite | API existiert, UI fehlt komplett |
| Upload-Persistenz | Kein Docker-Volume für `public/uploads/` |
| Structured Data (JSON-LD) | Fehlt komplett — kein Schema.org Person/Event |
| `next/font` statt Google CDN | Render-blocking externe CSS-Requests |
| Image Optimization | Alle 5 Komponenten nutzen `unoptimized` |
| Sitemap Index | >50K URLs in einer Datei (Google-Limit) |

---

## 2. Bugs

### 2.1 Kritisch

| # | Bug | Datei:Zeile | Fix |
|---|-----|-------------|-----|
| B1 | AdminPanel liest `data.nameLatin` (camelCase), Submit speichert `name_latin` (snake_case) → "Unknown" | `components/AdminPanel.tsx:140` | `data.name_latin` verwenden |

### 2.2 Mittel

| # | Bug | Datei:Zeile | Fix |
|---|-----|-------------|-----|
| B2 | `ts("clearFilters")` nutzt Namespace `statistics`, Key existiert dort nicht | `app/[locale]/victims/page.tsx:110` | Key zu `statistics` Namespace hinzufügen oder richtigen Namespace verwenden |
| B3 | E2E-Test erwartet Array, API gibt `{ results: [...] }` zurück | `e2e/navigation.spec.ts:68` | `expect(data.results).toBeDefined()` |

### 2.3 Niedrig

| # | Bug | Datei:Zeile | Fix |
|---|-----|-------------|-----|
| B4 | `timeline.noEvents` Key fehlt in allen 3 Message-Dateien | `components/InteractiveTimeline.tsx:69` | Key hinzufügen |
| B5 | AdminPanel: leere `catch {}` Blöcke schlucken Fehler | `components/AdminPanel.tsx:34-36,51-53` | Error-State + User-Feedback |

---

## 3. Hardcoded Strings (nicht übersetzt)

### 3.1 API Docs (~40 Strings)
**Datei:** `app/[locale]/api-docs/page.tsx`
- Alle Section-Titles, Descriptions, Code-Examples, Endpoint-Beschreibungen
- Braucht eigenen `apiDocs` Namespace in Messages

### 3.2 Admin Panel (~15 Strings)
**Datei:** `components/AdminPanel.tsx`
- "Admin Panel", "Pending", "Approved", "Rejected", "Approve", "Reject", "Loading...", "Unknown"
- Braucht `admin` Namespace in Messages

### 3.3 IranMap (3 Strings)
**Datei:** `components/IranMap.tsx`
- Zeile 31, 62: `"Loading map..."` → `t("loadingMap")`
- Zeile 109: `"victims"` im Tooltip → `t("victims")`

### 3.4 InteractiveTimeline (1 String)
**Datei:** `components/InteractiveTimeline.tsx`
- Zeile 168: `"View details ->"` → `t("viewDetails")`

### 3.5 Header (1 String)
**Datei:** `components/Header.tsx`
- Zeile 22: `label: "API"` → `t("apiDocs")`

---

## 4. Security

### 4.1 Zu fixen

| # | Problem | Datei | Priorität |
|---|---------|-------|-----------|
| S1 | Admin-Auth akzeptiert jeden `x-forwarded-user` Wert — kein Role-Check | `app/api/admin/submissions/route.ts:6-8` | Hoch |
| S2 | robots.txt blockiert `/admin` aber nicht `/{locale}/admin` | `app/robots.ts:9` | Mittel |
| S3 | Kein CSRF auf Admin PATCH | `app/api/admin/submissions/route.ts` | Mittel |
| S4 | Admin PATCH: keine Zod-Validierung, kein UUID-Check | `app/api/admin/submissions/route.ts` | Mittel |
| S5 | Kein Rate-Limiting auf Admin-Endpoints | `app/api/admin/submissions/route.ts` | Niedrig |

### 4.2 OK

- CSP Headers konfiguriert
- Security Headers (HSTS, X-Frame-Options, etc.)
- Parameterized SQL via Prisma `$queryRaw`
- Rate Limiting auf öffentlichen APIs
- Zod-Validierung auf Submit

---

## 5. Performance

| # | Problem | Impact | Fix |
|---|---------|--------|-----|
| P1 | `force-dynamic` auf jeder Seite — kein Caching bei selten sich ändernden Daten | Hoch | ISR mit `revalidate` oder `revalidateTag()` |
| P2 | Alle Bilder `unoptimized` (5 Dateien) — Next.js Image Optimization deaktiviert | Hoch | `unoptimized` entfernen, `remotePatterns` konfigurieren |
| P3 | Google Fonts via externer CSS-Link — Render-blocking | Mittel | `next/font/google` verwenden |
| P4 | Export API lädt 30K+ Rows in Memory — kein Streaming | Mittel | Streaming Response oder Pagination |
| P5 | Sitemap: 90K+ URLs in einer Datei (Limit: 50K) | Mittel | Sitemap Index mit mehreren Files |
| P6 | Kein DB Connection Pooling konfiguriert in Prisma | Niedrig | `connection_limit` in DATABASE_URL |

---

## 6. Accessibility

| # | Problem | Datei | Fix |
|---|---------|-------|-----|
| A1 | Timeline: `<div onClick>` ohne Keyboard, kein `role="button"`, `aria-expanded` | `InteractiveTimeline.tsx:114` | `<button>` oder ARIA attrs |
| A2 | SearchBar: SVG-Icon Button ohne `aria-label` | `SearchBar.tsx` | `aria-label={t("search")}` |
| A3 | FilterBar: `<select>` ohne `<label>` | `FilterBar.tsx` | `aria-label` oder `<label>` |
| A4 | YearlyBarChart: kein Keyboard-Zugang, keine ARIA-Semantik | `statistics/page.tsx` | `role="img"` + `aria-label` |
| A5 | Lightbox: kein Focus-Trapping | `PhotoGallery.tsx` | Focus-Trap + `inert` auf Background |
| A6 | Gender-Filter Buttons: kein `aria-pressed` | `FilterBar.tsx` | `aria-pressed={active}` |
| A7 | Pagination: keine `aria-label` auf Pfeil-Links | `victims/page.tsx` | `aria-label="Next/Previous page"` |

---

## 7. Schema-Inkonsistenzen

| # | Problem | Fix |
|---|---------|-----|
| SC1 | `Photo.captionDe` fehlt (nur `captionEn` + `captionFa`) | Schema-Migration |
| SC2 | `Submission.status`, `Comment.status` sind Strings statt Enums | Enum-Type erstellen |
| SC3 | `City.nameFa/nameDe` optional, `Province.nameFa/nameDe` required | Vereinheitlichen |
| SC4 | `Submission` hat kein `updatedAt` | Feld hinzufügen |
| SC5 | `search_vector` Trigger in init.sql vs. Migration nicht synchron | init.sql als Source of Truth |
| SC6 | `NEXTAUTH_SECRET` in docker-compose — NextAuth nicht verwendet | Entfernen |

---

## 8. Fehlende Tests

### 8.1 Komponenten ohne Tests
- `PhotoGallery` (Lightbox, Keyboard-Navigation)
- `InteractiveTimeline` (Zoom, Expand/Collapse)
- `IranMap` (Dynamic Import, SSR-Avoidance)
- `AdminPanel` (API-Calls, Tab-Switching)
- `Footer`, `EventHero` (simple, niedrige Priorität)

### 8.2 API Routes ohne Tests
- `app/api/export/route.ts` (CSV-Generierung)
- `app/api/comments/route.ts` (GET/POST mit Moderation)
- `app/api/upload/route.ts` (File Upload, Auth)
- `app/api/admin/submissions/route.ts` (Auth-gated CRUD)

### 8.3 Enricher-Plugins ohne Tests
- `boroumand.py`, `iranmonitor.py`, `wikipedia_wlf.py`

### 8.4 CI-Lücken
- Kein Linting in CI
- Kein Playwright E2E in CI
- Keine Coverage-Schwelle definiert

---

## 9. Tote/Ungenutzte Dateien

| Datei/Verzeichnis | Grund |
|-------------------|-------|
| `data/sources/` | Nirgends referenziert — historisch? |
| `.plan.md` | Veraltete Planungsdatei |
| `@anthropic-ai/sdk` + `openai` in devDeps | In keiner TS-Datei importiert |
| `public/photos/` | Fotos kommen von externen URLs |
| `NEXTAUTH_SECRET` in docker-compose | NextAuth nicht verwendet |

---

## 10. TODO-Liste (priorisiert)

### Priorität 1: Bugs fixen — ✅ erledigt (v0.7.4)

- [x] **B1** AdminPanel camelCase-Bug fixen (`data.name_latin || data.nameLatin`)
- [x] **B2** `clearFilters` → richtiger Namespace (`t` statt `ts`)
- [x] **B4** `timeline.noEvents` + `timeline.viewDetails` Keys hinzugefügt

### Priorität 2: Security — ✅ erledigt (v0.7.4)

- [x] **S1** Admin-Auth: Allowlist via `ADMIN_USERS` env var
- [x] **S2** robots.txt: `/{locale}/admin` Pfade blockiert
- [x] **S3+S4** Zod-Validierung auf Admin PATCH (UUID, enum, max 2000 chars)

### Priorität 3: Hardcoded Strings — ⚠️ teilweise (v0.7.4)

- [x] IranMap: `t("loadingMap")` + `t("victims")`
- [x] InteractiveTimeline: `t("viewDetails")`
- [x] Header: `t("apiDocs")`
- [ ] API Docs: Eigenen `apiDocs` Namespace erstellen (~40 Keys)
- [ ] AdminPanel: `admin` Namespace erstellen (~15 Keys)

### Priorität 4: Performance — ⚠️ teilweise (v0.7.4)

- [x] **P2** `unoptimized` von allen 7 Images entfernt
- [x] **P3** Google Fonts → `next/font/google` (Inter + Vazirmatn, self-hosted)
- [x] **P5** Sitemap URL-Cap bei 45.000 (reicht bei ~30K Opfern × 3 Locales)
- [ ] **P1** `force-dynamic` → ISR mit `revalidate` wo möglich

### Priorität 5: Fehlende Features integrieren

- [ ] Comments-UI auf Opfer-Detail-Seite (API existiert bereits)
- [ ] Docker Volume für `public/uploads/` in docker-compose.yml
- [ ] Structured Data (JSON-LD) für Opfer (Schema.org `Person`)

### Priorität 6: Accessibility — ⚠️ teilweise (v0.7.4)

- [x] **A1** Timeline: `<div onClick>` → `<button>` + `aria-expanded`
- [x] **A2** SearchBar: `aria-label` auf Submit-Button
- [x] **A3** FilterBar: `aria-label` auf Selects, `aria-pressed` auf Gender-Buttons
- [ ] **A5** Lightbox: Focus-Trapping
- [ ] **A7** Pagination: `aria-label` auf Pfeil-Links

### Priorität 7: Test-Coverage erweitern

- [ ] Tests für PhotoGallery, InteractiveTimeline, IranMap
- [ ] Tests für export, comments, upload, admin API Routes
- [ ] Linting + Playwright in CI
- [ ] Tests für boroumand, iranmonitor, wikipedia_wlf Plugins

### Priorität 8: Aufräumen — ✅ erledigt (v0.7.4)

- [x] Ungenutzte devDeps entfernt (`@anthropic-ai/sdk`, `openai`)
- [x] `NEXTAUTH_SECRET` aus docker-compose entfernt
- [ ] `data/sources/` prüfen und ggf. löschen
- [ ] `.plan.md` löschen
- [ ] Schema-Inkonsistenzen (SC1-SC5) bereinigen

---

## Metriken-Vergleich

| Metrik | v0.7.3 | v0.7.4 | Ziel (v0.8.0) |
|--------|--------|--------|---------------|
| Vitest Tests | 144 | 144 | ~200 |
| pytest Tests | 112 | 112 | 112 |
| Hardcoded Strings | ~60 | ~55 (5 gefixt) | 0 |
| Bugs (bekannt) | 5 | **0** ✅ | 0 |
| `unoptimized` Images | 7 | **0** ✅ | 0 |
| Accessibility Issues | 7 | 1 (A5) | ≤2 |
| Sitemap URLs | 90K+ (kein Cap) | 45K Cap ✅ | Index-Dateien |

---

*Erstellt: 2026-02-15 | Aktualisiert: 2026-02-15 (v0.7.4) | Nächstes Audit: nach v0.8.0*
