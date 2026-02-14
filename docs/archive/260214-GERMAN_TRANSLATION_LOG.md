# Log: Deutsche Batch-Übersetzung (2026-02-14)

## Kontext
Die iran-memorial Website ist dreisprachig (FA/EN/DE), aber die Victim-Daten hatten **0% deutsche Texte**. Der `localized()` Helper fiel immer auf Englisch zurück. Ziel: `circumstances_en` (22.016 Einträge) nach `circumstances_de` übersetzen.

## Durchführung

### Phase 1: Schema-Erweiterung
- 7 neue `_de` Spalten im Prisma Schema hinzugefügt
- `prisma migrate dev` schlug fehl (non-interactive + will search_vector droppen)
- Lösung: Manuelles SQL + `prisma migrate resolve --applied`
- `lib/queries.ts` VICTIM_COLUMNS + mapRawVictims aktualisiert

### Phase 2: Übersetzungs-Script
- `tools/translate_de.py` erstellt (standalone async Python)
- AsyncOpenAI + asyncpg, Rate-Limit-Handling, Resume-Support
- Dry-Run mit 3 Opfern: gute Qualität bestätigt

### Phase 3: Concurrency-Optimierung
- **Erste Version:** `asyncio.gather()` mit festen 45er Batches → 1.3/s
- **Problem:** Wartet bis ALLE 45 fertig → langsamster Text bremst ganzen Batch
- **Optimierung:** `asyncio.Semaphore(45)` → 1.7/s (+30%)
- Rate-Limit-Hits treten auf, werden automatisch per Backoff gehandelt

### Phase 4: Vollständiger Batch
- ~22.000 Texte, sortiert nach Länge (längste zuerst)
- Geschätzte Kosten: ~$10 (GPT-4o-mini)
- Geschätzte Dauer: ~3h mit Concurrency 45
- Fehlerrate: <0.1% (2 Fehler bei ~4.000)

## Dateien

| Datei | Änderung |
|-------|----------|
| `prisma/schema.prisma` | +7 `_de` Felder |
| `prisma/migrations/20260214180000_add_german_victim_fields/migration.sql` | ALTER TABLE SQL |
| `lib/queries.ts` | VICTIM_COLUMNS + mapRawVictims erweitert |
| `tools/translate_de.py` | Neues Script (Semaphore-Concurrency) |

## Technische Erkenntnisse

1. **Semaphore > feste Batches** bei heterogenen Aufgaben (unterschiedlich lange API-Calls)
2. **Python `-u` Flag** nötig für unbuffered Output bei Pipe-Redirect
3. **OpenAI GPT-4o-mini Rate Limits:** Tier 1 = 500 RPM, 200K TPM — genug für Concurrency 45
4. **Prisma migrate dev** scheitert konsistent wenn DB Extra-Spalten hat (search_vector) — manuelles SQL ist der einzig zuverlässige Weg

## Ergebnis
- ~22.000 `circumstances_de` Texte übersetzt
- `localized(victim, "circumstances", "de")` liefert jetzt deutschen Text
- Weitere Felder (occupation, beliefs, etc.) können mit gleichem Script übersetzt werden
