# Workflow: Deduplizierung nach Batch-Import

## Ziel
Duplikate nach einem Datenimport erkennen und mergen, ohne echte verschiedene Personen zu verlieren.

## Voraussetzungen
- Datenimport abgeschlossen (YAML + DB)
- Lokale PostgreSQL läuft

## Pipeline (Reihenfolge einhalten!)

### Schritt 1: YAML-Level Dedup
```bash
python tools/dedup_victims.py --dry-run     # Vorschau
python tools/dedup_victims.py               # Ausführen
```
- 3 Matching-Strategien: Familienname + Vorname, normalisierter Vollname, Cross-Year-Slug
- Scoring: Gleiches Todesdatum (+50), gleicher Farsi-Name (+50), verschiedenes Datum (-100)
- Score >= 50: automatisch mergen, 30-49: manuell prüfen

### Schritt 2: Internes Dedup (Farsi-basiert)
```bash
python tools/dedup_2026_internal.py --dry-run
python tools/dedup_2026_internal.py
```
- Farsi-Normalisierung (ZWNJ, Kaf/Yeh-Varianten, Diacritics)
- Nur für Einträge mit Farsi-Namen

### Schritt 3: DB-Level Dedup
```bash
npx tsx tools/dedup-db.ts --dry-run
npx tsx tools/dedup-db.ts
```
- Scoring: Non-null-Felder (+1), Photo (+10), Circumstances-Länge (+0-10), Event-Link (+5)
- Bester Eintrag = Keeper, Rest wird gelöscht
- Sources werden in den Keeper gemergt

### Schritt 4: Farsi-Normalisierung Dedup
```bash
npx tsx tools/dedup-round5.ts --dry-run
npx tsx tools/dedup-round5.ts
```
- Unsichtbare Unicode-Varianten normalisieren
- NULL-Datum Matches nur mit identischem Text

## Wichtige Regeln
- **Merge statt Delete:** Immer Felder + Sources aus dem Duplikat ins Original kopieren
- **Verschiedenes Todesdatum = verschiedene Person** (Score -100)
- **Unknown/ناشناس:** Nur dedupen wenn `circumstances_en` Text identisch ist
- **Score 30-49:** IMMER manuell prüfen (~50% False Positive Rate)
- **Verschiedener normalisierter Farsi-Name:** Verschiedene Person, auch bei gleichem Latin-Namen

## Nach der Deduplizierung
- `lib/fallback-data.ts` aktualisieren (Gesamtzahlen)
- CLAUDE.md "Data Collection Status" Tabelle aktualisieren
- Eintrag in `docs/LEARNINGS.md`
