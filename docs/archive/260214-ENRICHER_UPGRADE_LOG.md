# Enricher Upgrade Log — 2026-02-14

> Upgrade der Enricher-Pipeline: iranvictims CSV, iranrevolution Plugin, circumstances_fa, shared Province-Mapping, 53 Tests.

---

## Ziel

Datenqualität und -quantität der iran-memorial DB verbessern durch:
1. Umstellung des iranvictims-Plugins von HTML-Scraping auf CSV-Import (7 statt 3 Felder)
2. Neues iranrevolution.online Plugin (Supabase REST API, einzige Quelle mit Farsi-Umständen)
3. Shared Province-Mapping (72 Städte → Provinzen)
4. `circumstances_fa` als neues Feld in der gesamten Pipeline

---

## Durchgeführte Änderungen

### Phase 1: Province-Mapping extrahieren

**Datei:** `tools/enricher/utils/provinces.py` (NEU)
- 72 iranische Städte → Provinzen (von 10 in boroumand.py erweitert)
- Case-insensitive Substring-Match
- Genutzt von: boroumand, iranvictims, iranrevolution

**Datei:** `tools/enricher/sources/boroumand.py` (GEÄNDERT)
- Lokale `extract_province()` entfernt, Import aus `utils.provinces`

### Phase 2: iranvictims CSV-Umstellung

**Datei:** `tools/enricher/sources/iranvictims.py` (KOMPLETT NEU)
- CSV-Download von `iranvictims.com/victims.csv`
- 9 Felder extrahiert: Card ID, English Name, Persian Name, Age, Location, Date, Status, Source URLs, Notes
- Hilfsfunktionen: `parse_csv_rows()`, `parse_age()`, `parse_date()`, `parse_source_urls()`
- Filter: nur `status=killed` wird importiert

### Phase 3: circumstances_fa Pipeline

**Datei:** `tools/enricher/db/models.py` (GEÄNDERT)
- `circumstances_fa: Optional[str] = None` zu ExternalVictim

**Datei:** `tools/enricher/db/queries.py` (GEÄNDERT)
- LOAD_VICTIMS SELECT: +circumstances_fa
- ENRICH_VICTIM UPDATE: +circumstances_fa mit CASE-Logik (NULL-fill + 1.5× Länge)
- Parameter: $15=circumstances_fa, $16=event_context, $17=responsible_forces

**Datei:** `tools/enricher/pipeline/enricher.py` (GEÄNDERT)
- circumstances_fa in Feld-Check-Listen (Position 14 im Tuple)

### Phase 4: iranrevolution Plugin

**Datei:** `tools/enricher/sources/iranrevolution.py` (NEU)
- Supabase REST API (`umkenikezuigjqspgaub.supabase.co/rest/v1/memorials`)
- Öffentlicher Anon Key (aus Frontend-JS extrahiert)
- Paginierung: 1000er Batches via `Range` Header
- Felder: name, name_fa, city→province, date, bio, bio_fa→circumstances_fa, media.photo

**Datei:** `tools/enricher/utils/http.py` (GEÄNDERT)
- `extra_headers` Parameter für API-Key-Authentifizierung

### Phase 5: Test Suite

**Dateien:** `tools/enricher/tests/` (NEU — 4 Testdateien + __init__.py)

| Testdatei | Tests | Beschreibung |
|-----------|-------|-------------|
| test_provinces.py | 8 | Exact/case-insensitive/substring/None/empty/unknown |
| test_iranvictims.py | 26 | CSV-Parsing, Age, Date, URL-Parsing, Edge Cases |
| test_iranrevolution.py | 10 | Record-Parsing, Farsi-only, None media, Province |
| test_enricher_pipeline.py | 9 | circumstances_fa Fill/Overwrite, Tuple-Length |
| **Gesamt** | **53** | **Alle bestanden in 0.21s** |

---

## Ergebnisse

```
53 passed in 0.21s

tools/enricher/tests/test_enricher_pipeline.py::TestComputeEnrichment::test_fills_circumstances_fa PASSED
tools/enricher/tests/test_enricher_pipeline.py::TestComputeEnrichment::test_no_overwrite_circumstances_fa PASSED
tools/enricher/tests/test_enricher_pipeline.py::TestComputeEnrichment::test_replaces_longer_circumstances_fa PASSED
tools/enricher/tests/test_enricher_pipeline.py::TestComputeEnrichment::test_fills_both_circumstances PASSED
tools/enricher/tests/test_enricher_pipeline.py::TestComputeEnrichment::test_tuple_length_with_all_fields PASSED
tools/enricher/tests/test_enricher_pipeline.py::TestComputeEnrichment::test_no_new_data_returns_none PASSED
tools/enricher/tests/test_enricher_pipeline.py::TestCountNewFields::test_counts_circumstances_fa PASSED
tools/enricher/tests/test_enricher_pipeline.py::TestCountNewFields::test_counts_all_null_fields PASSED
tools/enricher/tests/test_enricher_pipeline.py::TestCountNewFields::test_doesnt_count_existing_fields PASSED
tools/enricher/tests/test_iranrevolution.py::TestParseRecord (10/10) PASSED
tools/enricher/tests/test_iranvictims.py::TestParseCsvRows (11/11) PASSED
tools/enricher/tests/test_iranvictims.py::TestParseAge (5/5) PASSED
tools/enricher/tests/test_iranvictims.py::TestParseDate (5/5) PASSED
tools/enricher/tests/test_iranvictims.py::TestParseSourceUrls (5/5) PASSED
tools/enricher/tests/test_provinces.py::TestExtractProvince (8/8) PASSED
```

---

## Bugs während Implementierung

1. **Tuple-Index-Fehler:** Tests asserteten `result[15]` für circumstances_fa, tatsächlich Position 14 (0-basiert). Fix: Korrekte Indizes in Tests.
2. **Tuple-Länge:** Test erwartete 18 Elemente, tatsächlich 17 (id + 16 Felder). Fix: `assert len(result) == 17`.
3. **Fehlender extra_headers:** iranrevolution Plugin brauchte `apikey` Header, `fetch_with_retry` unterstützte nur URL. Fix: Parameter hinzugefügt.

---

## Nächste Schritte

1. `python3 -m tools.enricher enrich -s iranvictims -m full` — CSV-Import ausführen
2. `python3 -m tools.enricher enrich -s iranrevolution -m full` — Supabase-Import ausführen
3. `python3 -m tools.enricher dedup --dry-run -v` — Duplikat-Check nach Import
4. Server-Deployment: `docker compose up -d --build app`

---

*Erstellt: 2026-02-14*
