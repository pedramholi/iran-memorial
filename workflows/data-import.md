# Workflow: Datenimport neuer Opfer-Quellen

## Ziel
Opferdaten aus einer neuen Quelle importieren, deduplizieren und in die Produktions-DB einfügen.

## Voraussetzungen
- Quelle identifiziert (URL, CSV, PDF, API)
- Lokale PostgreSQL läuft (`docker compose up -d db`)

## Schritte

### 1. Quelle analysieren
- Format bestimmen (HTML-Tabelle, CSV, PDF, API)
- Erwartete Felder und Opferzahl schätzen
- Gegen 5 Opferkategorien prüfen (Protest-Tote, Hingerichtete, Hafttode, verdächtige Tode, Hijab-Enforcement)

### 2. Parser/Scraper erstellen oder vorhandenen nutzen
- Prüfe `tools/` auf existierende Scripts für ähnliche Quellen
- Neues Script in `tools/` erstellen falls nötig
- Output: YAML-Dateien in `data/victims/{year}/`

| Quelltyp | Vorhandenes Tool |
|----------|-----------------|
| Wikipedia-Tabelle | `tools/parse_wikipedia_wlf.py` |
| CSV-Export | `tools/import_iranvictims_csv.py` |
| PDF-Report | `tools/parse_hrana_82day.py`, `tools/parse_amnesty_children.py` |
| HTML-Scrape | `tools/scrape_boroumand.py` |

### 3. Gender-Inferenz
```bash
python tools/infer_gender.py
```
- Prüfe ob neue Vornamen in die Namensliste aufgenommen werden müssen

### 4. Seed in DB
```bash
npx tsx tools/seed-new-only.ts --dry-run    # Erst testen
npx tsx tools/seed-new-only.ts              # Dann importieren
```

### 5. Gender in DB synchronisieren
```bash
npx tsx tools/sync-gender-to-db.ts
```

### 6. Deduplizierung
Siehe `workflows/dedup-pipeline.md`

### 7. Verifizierung
- `SELECT COUNT(*) FROM "Victim"` — Zahl prüfen
- Stichprobe auf der Website: `http://localhost:3000/en/victims/`
- `lib/fallback-data.ts` aktualisieren falls sich Gesamtzahlen ändern

## Edge Cases
- **Cloudflare-Blockade:** Wayback Machine als Fallback (`web.archive.org/web/URL`)
- **SSL-Fehler auf macOS:** `curl` als Fallback, Cache-File speichern
- **YAML-ID als Zahl geparst:** IDs mit `-` Prefix immer in Anführungszeichen oder `String()` Coercion
- **Bezahlte API-Calls:** Vor erneutem Laufen nach Fehler immer nachfragen

## Dokumentation
- Eintrag in `docs/LEARNINGS.md` (Data Import Notes)
- Log-Eintrag in aktiver Log-Datei
- CLAUDE.md "Data Collection Status" Tabelle aktualisieren
