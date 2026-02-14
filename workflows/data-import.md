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

### 2. Enricher-Plugin erstellen oder vorhandenen nutzen
- Prüfe `tools/enricher/sources/` auf existierende Plugins
- Neues Plugin mit `@register` Decorator erstellen falls nötig
- Historische Einmalskripte als Referenz in `tools/legacy/`

| Quelltyp | Aktives Tool (Enricher) | Historische Referenz (Legacy) |
|----------|------------------------|------------------------------|
| Wikipedia-Tabelle | `enricher/sources/wikipedia_wlf.py` | `legacy/parse_wikipedia_wlf.py` |
| CSV-Export | — | `legacy/import_iranvictims_csv.py` |
| PDF-Report | — | `legacy/parse_hrana_82day.py`, `legacy/parse_amnesty_children.py` |
| HTML-Scrape | `enricher/sources/boroumand.py` | `legacy/scrape_boroumand.py` |
| iranvictims.com | `enricher/sources/iranvictims.py` | `legacy/scrape_iranvictims_photos.py` |

### 3. Enrichment durchführen
```bash
python3 -m tools.enricher check -s <plugin> -v     # Dry-Run
python3 -m tools.enricher enrich -s <plugin>        # Ausführen
```

### 4. Deduplizierung
```bash
python3 -m tools.enricher dedup --dry-run -v        # Vorschau
python3 -m tools.enricher dedup --apply              # Ausführen
```
Siehe auch `workflows/dedup-pipeline.md`

### 5. Verifizierung
- `SELECT COUNT(*) FROM "Victim"` — Zahl prüfen
- Stichprobe auf der Website: `http://localhost:3000/en/victims/`

## Edge Cases
- **Cloudflare-Blockade:** Wayback Machine als Fallback (`web.archive.org/web/URL`)
- **SSL-Fehler auf macOS:** `curl` als Fallback, Cache-File speichern
- **YAML-ID als Zahl geparst:** IDs mit `-` Prefix immer in Anführungszeichen oder `String()` Coercion
- **Bezahlte API-Calls:** Vor erneutem Laufen nach Fehler immer nachfragen

## Dokumentation
- Eintrag in `docs/LEARNINGS.md` (Data Import Notes)
- Log-Eintrag in aktiver Log-Datei
- CLAUDE.md "Data Collection Status" Tabelle aktualisieren
