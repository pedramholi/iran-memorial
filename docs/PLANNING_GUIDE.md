# Planning & Implementation Guide

> How to plan and implement efficiently for the Iran Memorial project.

---

## Overview

Every non-trivial change follows two documents:

| Document | Format | Purpose |
|----------|--------|---------|
| `YYMMDD-PLAN_NAME.md` | Plan | WAS wollen wir, WARUM, WIE, welche RISIKEN |
| `YYMMDD-LOG_NAME.md` | Log | WAS wurde gemacht, ENTSCHEIDUNGEN, ERGEBNISSE |

Kleine Changes (Bugfix, Config-Änderung, einzelner Datenimport) brauchen keine eigene Plandatei — ein Eintrag in `LEARNINGS.md` reicht.

---

## Teil 1: Der Plan

### 1.1 Aktueller Stand (Baseline)

Beginne immer mit dem IST-Zustand. Ohne Baseline kann man Fortschritt nicht messen.

```markdown
## Aktueller Stand

| Metrik | Wert |
|--------|------|
| Opfer in DB | 3 |
| Seiten | 8 |
| Test Coverage | 0% |
| Build-Zeit | 831ms |
```

### 1.2 Ziel-Definition mit Erfolgskriterien

Messbare Ziele. Keine vagen Aussagen wie "verbessern" oder "optimieren".

```markdown
## Erfolgskriterien

| Kriterium | Vorher | Ziel | Status |
|-----------|--------|------|--------|
| Opfer in DB | 3 | 1.000+ | ⏳ |
| Test Coverage | 0% | >60% | ⏳ |
| Lighthouse Performance | ? | >90 | ⏳ |
```

### 1.3 Constraints identifizieren

Was sind harte Grenzen? Was geht NICHT? Vor dem Planen klären.

```markdown
## Constraints

┌─────────────────────────────────────────────────┐
│  ⚠️  CONSTRAINT-TITEL                            │
│                                                   │
│  Beschreibung des Problems.                       │
│  Optionen:                                        │
│  A) Option 1                                      │
│  B) Option 2                                      │
│                                                   │
│  → Gewählte Option mit Begründung                 │
└─────────────────────────────────────────────────┘
```

### 1.4 Optionen mit Aufwand/Risiko

Nie nur eine Lösung präsentieren. Mindestens 2 Optionen, maximal 3.

```markdown
| Option | Aufwand | Risiko | Empfehlung |
|--------|---------|--------|------------|
| A: Minimal | 1-2 Tage | Niedrig | ✅ Empfohlen |
| B: Mittel | 1 Woche | Mittel | Bei Bedarf |
| C: Maximal | 2+ Wochen | Hoch | Nur wenn nötig |
```

### 1.5 Phasen-basierter Aktionsplan

Große Änderungen in Phasen aufteilen. Jede Phase ist eigenständig deploybar.

```markdown
┌────────────────────────────────────┐
│  PHASE 1: Beschreibung              │
│  Aufwand: Xh | Risiko: Niedrig     │
├────────────────────────────────────┤
│  □ Schritt 1                        │
│  □ Schritt 2                        │
│  □ Schritt 3                        │
└──────────────┬─────────────────────┘
               ▼
         [BEWERTUNG]
  Lohnt sich Phase 2? → Entscheidung
```

**Regel:** Nach jeder Phase: Bewerten ob die nächste Phase nötig ist. Nicht blind weiter.

### 1.6 Was NICHT gemacht wird

Explizit aufschreiben was out-of-scope ist. Verhindert Scope Creep.

```markdown
| Element | Grund |
|---------|-------|
| Feature X | Zu komplex für diesen Scope |
| Feature Y | Kein Nutzen ohne Voraussetzung Z |
```

### 1.7 Risiko-Analyse

```markdown
| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Datenverlust | Niedrig | Kritisch | Tägliche Backups |
| DDoS | Mittel | Hoch | Cloudflare |
```

### 1.8 Rollback-Strategie

Immer VOR der Implementierung definieren. Nicht erst wenn es brennt.

```markdown
Phase 1: git revert (nur Inline-Änderungen)
Phase 2: git branch backup-pre-phase2 VOR Start + DB-Dump
Phase 3: Feature-Branches, einzeln revertbar
```

---

## Teil 2: Das Ausführungslog

### 2.1 Log-Entry Format

```markdown
#### LOG-XXX | YYYY-MM-DD | TITEL

**Was:** Was wird gemacht (1 Satz)
**Warum:** Begründung

Aktion: Konkrete Schritte
Ergebnis: Was kam raus (mit Zahlen)

**Entscheidung:** Nächster Schritt basierend auf Ergebnis
```

### 2.2 Beispiel-Einträge

**Erfolgreicher Schritt:**
```markdown
#### LOG-003 | 2026-02-09 | SEED IMPORTIERT

**Was:** 3 Opfer + 12 Events aus YAML importieren
**Warum:** Erste Daten in der Datenbank für Testing

Aktion: npx prisma db seed
Ergebnis: ERFOLG
  Opfer: 3 (Amini, Agha-Soltan, Kazemi)
  Events: 12
  Sources: 8

**Entscheidung:** Seed funktioniert. Weiter mit Bulk-Import Pipeline.
```

**Fehlgeschlagener Schritt:**
```markdown
#### LOG-007 | 2026-02-10 | PRISMA v7 MIGRATION

**Was:** Upgrade von Prisma 6 auf 7
**Fehler:** "datasource url no longer supported in schema files"

Analyse: Prisma v7 erfordert prisma.config.ts statt url in schema
→ Breaking Change, nicht abwärtskompatibel

**Entscheidung:** Rollback auf v6. Migration als eigenes Ticket.
```

### 2.3 Phasen-Zusammenfassung

Nach jeder Phase: Vorher/Nachher-Tabelle.

```markdown
## PHASE 2 ABGESCHLOSSEN

| Metrik | Vorher | Nachher | Diff |
|--------|--------|---------|------|
| Opfer in DB | 3 | 1.247 | +1.244 |
| Test Coverage | 0% | 62% | +62% |
| Deployment | Lokal | Produktiv | ✅ |
```

---

## Teil 3: Prinzipien

### Die 9 Regeln

```
1. MESSEN VOR UND NACH
   Keine Änderung ohne Baseline und Erfolgskriterien.

2. CONSTRAINTS ZUERST
   Harte Grenzen identifizieren bevor Lösungen entworfen werden.

3. OPTIONEN STATT EINE LÖSUNG
   Mindestens 2 Optionen mit Trade-offs präsentieren.

4. PHASEN MIT CHECKPOINTS
   Nach jeder Phase bewerten: Lohnt sich die nächste?

5. EXPLICIT OUT-OF-SCOPE
   Aufschreiben was NICHT gemacht wird.

6. ROLLBACK VORHER PLANEN
   Immer wissen wie man zurückkommt.

7. EHRLICH DOKUMENTIEREN
   Fehler, Rollbacks, gescheiterte Ansätze gehören ins Log.

8. FUNKTIONIEREND > THEORETISCH OPTIMAL
   Wenn es läuft und die Metriken stimmen: aufhören.

9. FORTSCHRITT LIVE DOKUMENTIEREN
   Erfolgskriterien-Status (⏳/✅/❌) und Aktionsplan-Checkboxen (□/✓)
   im Plan-Dokument aktualisieren. Jeder Schritt wird im Log festgehalten.
```

### Fortschritt festhalten

| Dokument | Was aktualisieren | Wann |
|----------|-------------------|------|
| Plan | Erfolgskriterien Status (⏳ → ✅/❌) | Nach jeder Phase |
| Plan | Aktionsplan Checkboxen (□ → ✓) | Nach jedem Schritt |
| Log | Neuer LOG-XXX Eintrag | Nach jedem Schritt |
| Log | Phasen-Zusammenfassung (Vorher/Nachher) | Nach jeder Phase |

### Wann brauche ich Plan + Log?

| Situation | Plan + Log? | Stattdessen |
|-----------|-------------|-------------|
| Neue Feature-Entwicklung | ✅ Ja | — |
| Refactoring (>100 Zeilen) | ✅ Ja | — |
| Bulk-Datenimport (neue Quelle) | ✅ Ja | — |
| Multi-Phase-Projekt | ✅ Ja | — |
| Bugfix (Root Cause klar) | ❌ Nein | LEARNINGS.md Eintrag |
| Config-Änderung | ❌ Nein | Commit-Message |
| Einzelnen Opfer-Eintrag hinzufügen | ❌ Nein | Commit-Message |
| Dependency Update | ❌ Nein | LEARNINGS.md falls Breaking Change |
| Übersetzung ergänzen | ❌ Nein | Commit-Message |

---

## Referenz

Aktuelle Plan/Log-Dateien für dieses Projekt:
- `docs/260209-PHASE1_PLAN.md` — Gesamtplan Phase 1–4
- `docs/260209-PHASE1_LOG.md` — Phase 1 Ausführungslog (14 Einträge)

---

*Erstellt: 2026-02-09*
*Basiert auf: Housekeeping System PLANNING_GUIDE.md, adaptiert für Iran Memorial*
