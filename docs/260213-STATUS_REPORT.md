# Iran Memorial — Statusbericht 2026-02-13

> Snapshot des Projektstands nach Abschluss von Phase 3.
> Dient als Referenz für alle weiteren Planungen.

---

## 1. Projekt-Steckbrief

| Eigenschaft | Wert |
|-------------|------|
| **Name** | Iran Memorial |
| **URL** | memorial.n8ncloud.de |
| **Zweck** | Digitale Gedenkseite für Opfer der Islamischen Republik Iran (1979–heute) |
| **Sprachen** | Farsi, English, Deutsch |
| **Repository** | github.com/pedramholi/iran-memorial |
| **Version** | v0.4.0 |
| **Gestartet** | 2026-02-09 |
| **Commits** | 99 |
| **Tech Stack** | Next.js 16, TypeScript, Prisma 6, PostgreSQL 16, Tailwind v4, Docker |

---

## 2. Datenbank-Kennzahlen

| Tabelle | Einträge |
|---------|----------|
| **Victims** | **31.203** |
| Sources | 42.924 |
| Events | 12 |
| Submissions | 0 |

### 2.1 Opfer nach Datenquelle

| Quelle | Anzahl | Anteil |
|--------|--------|--------|
| Boroumand Foundation (historisch) | 25.961 | 83,2% |
| iranvictims.com (CSV) | 3.639 | 11,7% |
| Boroumand Foundation (Foto-Enrichment) | 622 | 2,0% |
| Wikipedia WLF | 346 | 1,1% |
| HRANA 82-Day Report | 318 | 1,0% |
| Telegram RTN | 266 | 0,9% |
| Manuell recherchiert | 45 | 0,1% |
| IHR (Suspicious Deaths) | 4 | <0,1% |
| Amnesty International | 2 | <0,1% |

### 2.2 Opfer nach Jahrzehnt

| Jahrzehnt | Opfer | Hauptereignisse |
|-----------|-------|-----------------|
| 1970er | 780 | Revolution, Post-Revolution |
| **1980er** | **13.408** | Reign of Terror, Iran-Irak-Krieg, 1988-Massaker |
| 1990er | 1.120 | Chain Murders, allgemeine Hinrichtungen |
| 2000er | 2.358 | Hinrichtungen (Drogen, politisch) |
| 2010er | 6.039 | Green Movement, Aban 98, Hinrichtungen |
| 2020er | 4.813 | WLF 2022, 2026-Massaker |

### 2.3 Opfer nach Top-Todesjahren

| Jahr | Opfer | Kontext |
|------|-------|---------|
| 1981 | 4.225 | Reign of Terror (Mojahedin, Linke, Kurden) |
| 1988 | 3.683 | Gefängnismassaker + Iran-Irak-Krieg |
| 2026 | 3.066 | Aktuelle Proteste / Massaker |
| 1982 | 1.594 | Reign of Terror |
| 1983 | 1.241 | Reign of Terror |
| 2022 | 1.140 | Woman, Life, Freedom |
| 1984 | 1.029 | Reign of Terror |
| 1979 | 780 | Revolution + Post-Revolution |

### 2.4 Event-Verknüpfungen

| Event | Verlinkte Opfer | Zeitraum |
|-------|-----------------|----------|
| Reign of Terror (1981–1985) | 8.645 | 1981–1985 |
| 2026 Massacres | 3.982 | 2026 |
| 1988 Prison Massacres | 3.272 | Jul–Dez 1988 |
| Woman, Life, Freedom | 921 | 2022–2023 |
| Post-Revolution Executions | 769 | 1979–1981 |
| Iran-Iraq War | 405 | 1980–1988 |
| Green Movement | 368 | 2009–2010 |
| Bloody November (Aban 98) | 66 | Nov 2019 |
| Islamic Revolution | 33 | 1979 |
| 1999 Student Protests | 10 | Jul 1999 |
| Chain Murders | 8 | 1988–1998 |
| Cultural Revolution | 5 | 1980 |
| **Nicht verlinkt** | **12.719** | Allgemeine Hinrichtungen ohne spezifischen Event |

**Event-Link-Coverage:** 18.484 / 31.203 = **59,2%**

### 2.5 Geschlechterverteilung

| Gender | Anzahl | Anteil |
|--------|--------|--------|
| Male | 21.468 | 68,8% |
| Unknown | 6.774 | 21,7% |
| Female | 2.961 | 9,5% |

### 2.6 Verifizierungsstatus

| Status | Anzahl | Anteil |
|--------|--------|--------|
| Unverified | 31.013 | 99,4% |
| Verified | 190 | 0,6% |

---

## 3. Feldabdeckung

### 3.1 Alle Felder mit Coverage

| Feld | Befüllt | Coverage | Bewertung |
|------|---------|----------|-----------|
| name_latin | 31.203 | 100,0% | Perfekt |
| place_of_death | 31.057 | 99,5% | Perfekt |
| gender | 31.203 | 100,0% | (21,7% = "unknown") |
| name_farsi | 29.899 | 95,8% | Sehr gut |
| cause_of_death | 28.785 | 92,2% | Sehr gut |
| date_of_death | 28.518 | 91,4% | Sehr gut |
| province | 28.069 | 89,9% | Sehr gut |
| religion | 26.164 | 83,9% | Gut |
| circumstances_en | 22.016 | 70,6% | OK |
| event_id | 18.484 | 59,2% | Mittel |
| event_context | 18.062 | 57,9% | Mittel |
| responsible_forces | 14.608 | 46,8% | Mittel |
| age_at_death | 13.344 | 42,8% | Mittel |
| family_info | 31.203 | 100,0% | (JSON, oft leer-Objekt) |
| photo_url | 4.981 | 16,0% | Schwach |
| beliefs_en | 3.842 | 12,3% | Schwach |
| occupation_en | 3.084 | 9,9% | Schwach |
| place_of_birth | 1.690 | 5,4% | Schwach |
| education | 1.427 | 4,6% | Schwach |
| date_of_birth | 1.364 | 4,4% | Schwach |
| quotes | 1.162 | 3,7% | Schwach |
| personality_en | 444 | 1,4% | Minimal |
| burial_location | 5 | <0,1% | Minimal |
| **circumstances_fa** | **0** | **0,0%** | **Fehlt komplett** |
| **Alle *_fa/*_de Felder** | **0** | **0,0%** | **Fehlt komplett** |

### 3.2 Datenqualitäts-Tiers

| Tier | Kriterium | Victims | Anteil |
|------|-----------|---------|--------|
| Sehr reich | 15+ befüllte Felder | 849 | 2,7% |
| Reich | 10–14 Felder | 17.114 | 54,8% |
| Mittel | 5–9 Felder | 13.226 | 42,4% |
| Dünn | 3–4 Felder | 14 | <0,1% |

**57,5% der Opfer haben "reiche" Daten (10+ Felder).**

### 3.3 Text-Qualität (circumstances_en)

| Qualität | Victims | Anteil | Beschreibung |
|----------|---------|--------|--------------|
| Detailliert | 9.400 | 30,1% | >2.000 Zeichen — vollständige Biographie |
| Gut | 8.962 | 28,7% | 500–2.000 Zeichen — mehrere Absätze |
| Kurz | 2.118 | 6,8% | 100–500 Zeichen — 1–2 Sätze |
| Minimal | 1.536 | 4,9% | <100 Zeichen — nur Stichworte |
| Kein Text | 9.187 | 29,4% | Nur Name + Metadaten |

**58,8% haben substanzielle Texte (500+ Zeichen).**

### 3.4 Quellen pro Opfer

| Quellen-Anzahl | Victims | Anteil |
|----------------|---------|--------|
| 1 Quelle | 26.426 | 84,7% |
| 2 Quellen | 2.066 | 6,6% |
| 3+ Quellen | 2.711 | 8,7% |

---

## 4. Infrastruktur

### 4.1 Server (Hetzner VPS)

| Metrik | Wert | Status |
|--------|------|--------|
| IP | 188.245.96.212 | |
| OS | Linux | |
| Disk | 34 GB / 38 GB (**95%**) | KRITISCH |
| Docker reclaimable | ~6,2 GB (Images 2,4 GB + Build Cache 3,9 GB) | Prune steht aus |
| Domain | memorial.n8ncloud.de | Via Cloudflare |
| SSL | Cloudflare | |

### 4.2 Container

| Container | Status | Port |
|-----------|--------|------|
| iran-memorial-app-1 | Running | 127.0.0.1:5555 → 3000 |
| iran-memorial-db-1 | Healthy | 127.0.0.1:5434 → 5432 |

### 4.3 Lokale Entwicklung

| Eigenschaft | Wert |
|-------------|------|
| DB | PostgreSQL lokal, Port 5432, DB: iran_memorial |
| DB-Sync | Identisch mit Produktion (via pg_dump) |
| YAML-Dateien | 28.288 |
| Node.js | Dev-Server via `npm run dev` (Turbopack) |

---

## 5. Codebase

### 5.1 Struktur

| Bereich | Dateien | Beschreibung |
|---------|---------|--------------|
| App (pages, API) | 24 .ts/.tsx | Next.js App Router |
| Components | (in app/) | Header, Footer, VictimCard, SearchBar, etc. |
| Scripts (Pipeline) | 20 .py/.ts | Scraping, Parsing, Inferenz, Extraktion, Dedup |
| Prisma Schema | 128 Zeilen | 4 Models: Victim (48 Felder), Event, Source, Submission |
| i18n Messages | 3 Dateien | fa.json, en.json, de.json (~102 Keys je) |
| Documentation | 9 Dokumente | CLAUDE.md, VISION.md, LEARNINGS.md, Logs, etc. |

### 5.2 Data Pipeline Scripts

| Script | Sprache | Zweck |
|--------|---------|-------|
| `parse_wiki_wlf.py` | Python | Wikipedia WLF-Tabelle → YAML |
| `parse_hrana_82day.py` | Python | HRANA PDF → YAML |
| `import_iranvictims_csv.py` | Python | iranvictims.com CSV → YAML |
| `parse_amnesty_children.py` | Python | Amnesty PDF → Enrichment |
| `scrape_boroumand.py` | Python | Boroumand Foundation Scraper (4 Worker) |
| `infer_gender.py` | Python | Gender-Inferenz aus Vornamen |
| `dedup_victims.py` | Python | Dedup Runde 1 (3 Strategien) |
| `dedup_2026_internal.py` | Python | Interne iranvictims.com Dedup |
| `seed-new-only.ts` | TypeScript | Create-only DB Seed (kein Upsert) |
| `sync-gender-to-db.ts` | TypeScript | Gender YAML → DB Sync |
| `extract-fields.ts` | TypeScript | AI-Extraktion (Claude Haiku / GPT-4o-mini) |
| `extract-fields-regex.ts` | TypeScript | Regex-basierte Feld-Extraktion |
| `dedup-sources.ts` | TypeScript | Source-Deduplizierung |
| `dedup-db.ts` | TypeScript | DB-Level Dedup (Named + Unknown) |
| `dedup-round5.ts` | TypeScript | Farsi-Normalisierung Dedup |

### 5.3 Seiten

| Route | Beschreibung | ISR |
|-------|--------------|-----|
| `/[locale]` | Homepage (Stats, Events, Recent Victims) | 3600s |
| `/[locale]/victims` | Suche + paginierte Liste | 3600s |
| `/[locale]/victims/[slug]` | Opfer-Detailseite | 3600s |
| `/[locale]/events` | Alle Events | 3600s |
| `/[locale]/events/[slug]` | Event-Detail + verlinkte Opfer (paginiert) | 3600s |
| `/[locale]/timeline` | Chronologische Timeline | 3600s |
| `/[locale]/submit` | Community-Einreichung | — |
| `/[locale]/about` | Über das Projekt | — |

### 5.4 API-Routen

| Route | Methode | Zweck |
|-------|---------|-------|
| `/api/search` | GET | Volltextsuche (tsvector + trgm) |
| `/api/submit` | POST | Einreichung (Zod-validiert, Rate-Limited) |

---

## 6. Sicherheit

| Maßnahme | Status |
|----------|--------|
| SQL Injection | Behoben (Prisma tagged templates) |
| Rate Limiting | /api/submit: 5/h, /api/search: 100/min |
| Input Validation | Zod Schema auf /api/submit |
| Security Headers | CSP, HSTS, X-Frame-Options, nosniff |
| Cloudflare | Aktiv (SSL, DDoS, Caching) |

---

## 7. Abgeschlossene Arbeitsphasen

| Phase | Zeitraum | Highlights |
|-------|----------|------------|
| **Phase 1** | 09.02.2026 | Projekt-Setup: Next.js 16, Prisma, i18n, Docker, 8 Seiten, Seed-Script |
| **Phase 2A** | 09.02.2026 | Datensammlung: 7 Quellen, 4.378 Opfer, Quellenverzeichnis |
| **Phase 2B** | 09.02.2026 | Pipeline: Gender-Inferenz (100%), Dedup Runde 1+2, UI Guards |
| **Phase 2C** | 12.02.2026 | Deployment, AI Enrichment (14.247 Felder), Source Dedup, Security |
| **Phase 3** | 13.02.2026 | Boroumand Historical: 26.815 Entries, 6× Dedup (5.318 entfernt), AI+Regex (35.764 Felder), Event-Links (59,2%) |

### 7.1 Deduplizierung — Zusammenfassung

| Runde | Methode | Entfernt | Ergebnis |
|-------|---------|----------|----------|
| 1 | Name-Similarity + Date | 172 | 4.581 → 4.409 |
| 2 | Transliterations-Mapping | 34+6+27 = 67 | 4.409 → 4.375 |
| 3 | -2 Suffix Merge | 939 | 36.091 → 35.152 |
| 4 | DB-Level (Named + Unknown) | 3.786 | 35.152 → 31.366 |
| 5 | Farsi-Normalisierung + NULL-Date | 102 | 31.366 → 31.223 |
| 6 | -2 Suffix (final) | 20 | 31.223 → 31.203 |
| **Gesamt** | | **5.318** | |

### 7.2 AI/Regex-Extraktion — Zusammenfassung

| Runde | Methode | Victims | Felder | Kosten |
|-------|---------|---------|--------|--------|
| AI R1 | GPT-4o-mini | 3.932 | 14.247 | ~$10 |
| AI R2 | GPT-4o-mini | 12.200 | 31.600 | ~$20 |
| Regex | Pattern-Matching | 1.980 | 4.164 | $0 |
| **Gesamt** | | | **~50.000 Felder** | **~$30** |

---

## 8. Identifizierte Lücken (priorisiert)

### 8.1 Kritisch

| # | Lücke | Impact | Aufwand |
|---|-------|--------|---------|
| 1 | **Server Disk 95%** | Website kann crashen | 5 Min (Docker Prune) |
| 2 | **Farsi Texte 0%** | Farsi-Nutzer sehen leere Seiten | Hoch (Übersetzung/Scraping) |
| 3 | **Deutsch 0%** | Deutsche Version funktional leer | Hoch (Übersetzung) |

### 8.2 Hoch

| # | Lücke | Impact | Aufwand |
|---|-------|--------|---------|
| 4 | 9.187 Victims ohne Text (29%) | Leere Detailseiten | Mittel (weitere Quellen) |
| 5 | Fotos nur 16% | Opfer bleiben anonym | Mittel (Scraping) |
| 6 | Tests 0% | Kein Sicherheitsnetz | Mittel |
| 7 | Backup-Strategie fehlt | Datenverlust-Risiko | Niedrig |

### 8.3 Mittel

| # | Lücke | Impact | Aufwand |
|---|-------|--------|---------|
| 8 | Occupation/Education ~5–10% | Opfer nicht als Personen greifbar | Mittel (AI-Extraktion) |
| 9 | 84,7% nur 1 Quelle | Geringe Cross-Referenzierung | Hoch |
| 10 | Verification 0,6% | Vertrauenswürdigkeit | Hoch (manuell) |
| 11 | Event-Links 59% | 41% nicht zugeordnet | Niedrig (korrekt unverlinkt) |
| 12 | Gender "unknown" 21,7% | Unvollständige Statistiken | Mittel |

### 8.4 Niedrig / Feature-Wünsche

| # | Lücke | Beschreibung |
|---|-------|--------------|
| 13 | Statistik-Seite | Diagramme, Karten, Zeitverläufe |
| 14 | Erweiterte Suche | Filter nach Event, Jahr, Provinz, Gender |
| 15 | SEO | Sitemap, Meta-Tags, Open Graph |
| 16 | Mobile-Optimierung | Responsive Design Feinschliff |
| 17 | Dark Mode | |
| 18 | CI/CD Pipeline | Automatisches Deployment |
| 19 | Weitere Quellen | HRANA 20-Day, Amnesty Reports, IHR, KHRN |

---

## 9. Offene Datenquellen

| Quelle | Geschätzte neue Opfer | Schwierigkeit | Status |
|--------|----------------------|---------------|--------|
| HRANA 20-Day Report | 0–20 | Niedrig | Offen |
| Amnesty (weitere Reports) | 10–30 | Mittel | Offen |
| IHR (Direktkontakt) | 50–200 | Hoch (Cloudflare) | Offen |
| KHRN 2025/2026 | Unbekannt | Mittel | Offen |
| UN-Berichte | Enrichment | Mittel | Offen |

---

## 10. Metriken-Dashboard

```
DATEN
  Victims:          31.203        ████████████████████ 100%
  Mit Farsi-Name:   29.899        ███████████████████▌ 95,8%
  Mit Todesdatum:   28.518        ██████████████████▎  91,4%
  Mit EN-Text:      22.016        ██████████████       70,6%
  Mit Event-Link:   18.484        ███████████▊         59,2%
  Mit Foto:          4.981        ███▏                 16,0%
  Mit Beruf:         3.084        ██                    9,9%
  Mit FA-Text:           0                              0,0%

QUALITÄT
  10+ Felder:       17.963        ███████████▌         57,5%
  500+ chars Text:  18.362        ███████████▊         58,8%
  3+ Quellen:        2.711        █▋                    8,7%
  Verifiziert:         190        ▏                     0,6%

INFRASTRUKTUR
  Server Disk:      34/38 GB      ███████████████████▎ 95% ⚠️
  Docker reclaimable: 6,2 GB
  Uptime:           Running
  Tests:            0
```

---

*Erstellt: 2026-02-13*
*Nächstes Review: Bei Beginn von Phase 4*
