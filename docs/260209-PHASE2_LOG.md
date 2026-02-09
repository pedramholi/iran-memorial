# 260209 — Iran Memorial: Phase 2 Ausführungslog

> Gestartet: 2026-02-09
> Ansatz: Datengetriebene Iteration — WLF-Bewegung als Testfall

---

## Phase 2A: Daten sammeln & analysieren

### Erfolgskriterien Phase 2A

| Kriterium | Ziel | Status |
|-----------|------|--------|
| 50+ YAML-Dateien erstellt | Mindestens 50 Opfer | ✅ 421 Opfer |
| Minimaldaten pro Opfer | name, date, place, 1+ source | ✅ 99% haben alle 4 |
| Quellenverzeichnis | URLs + Qualitätsbewertung | ✅ `data/sources/wlf-sources.md` |
| Analysebericht | Feldabdeckung, Qualität, Aufwand | ✅ `docs/260209-DATA_ANALYSIS.md` |
| Schema-Anpassungen dokumentiert | Entscheidung ob Änderungen nötig | ✅ Keine Änderungen nötig (AD-010) |

---

#### LOG-P2-001 | 2026-02-09 | WIKIPEDIA DATEN ABRUFEN

**Was:** Wikipedia-Artikel "Deaths during the Mahsa Amini protests" als Datenquelle erschließen
**Warum:** Strukturierteste Quelle, leicht parsbar, ~420 Opfer in Tabellenform

```
Aktion: Wikipedia-API via WebFetch
Ergebnis: FEHLGESCHLAGEN — 403 Forbidden

Aktion: Wikipedia-API via curl mit User-Agent Header
Ergebnis: ERFOLG — vollständiger Wikitext (61.3 KB) abgerufen
  Format: MediaWiki-Wikitext mit sortable wikitable
  Inhalt: Tabelle mit Spalten: Date, Name, Age, Location, Circumstances, Ref

Aktion: Python urllib.request als Alternative
Ergebnis: FEHLGESCHLAGEN — SSL: CERTIFICATE_VERIFY_FAILED (macOS Python)
```

**Entscheidung:** curl als primäres Fetching-Tool. Cache-File-Pattern für Wiederholbarkeit.

**Lesson Learned:** macOS Python hat bekanntes SSL-Zertifikatsproblem. curl als Fallback immer einplanen. → BUG-004

---

#### LOG-P2-002 | 2026-02-09 | PARSER-SCRIPT ENTWICKELT

**Was:** Python-Script zum Parsen der Wikipedia-Wikitabelle in YAML-Dateien
**Warum:** Automatisierte Extraktion statt manueller Erfassung

```
Aktion: scripts/parse_wikipedia_wlf.py erstellt
  Features:
  - Wikitext-Parsing: rowspan-Daten, Wiki-Link-Entfernung, Ref-Tags
  - Slug-Generierung: lastname-firstname-birthyear (konsistent mit Template)
  - Provinz-Mapping: ~80 Städte → Provinzen (determine_province())
  - Todesursachen-Erkennung: Gunshot, Beating, Prison fire, etc.
  - Altersberechnung: Geburtsjahr-Schätzung aus Alter + Todesdatum
  - Duplikat-Handling: Suffix bei gleichen Slugs
  - Cache-File-Support: .wiki_cache.txt für Offline-Nutzung

Ergebnis: ERFOLG — Script funktionsfähig
  Ausführungszeit: ~2 Sekunden
  Output: 421 YAML-Dateien (+ 1 Skip für bestehende Mahsa Amini)
```

**Entscheidung:** Automatisierter Ansatz spart geschätzt 80-150h manueller Arbeit. → PL-002

---

#### LOG-P2-003 | 2026-02-09 | 421 OPFER-YAML-DATEIEN GENERIERT

**Was:** Parser ausgeführt, YAML-Dateien erstellt und verifiziert
**Warum:** Basis-Datensatz für das Gedenkportal

```
Aktion: python3 scripts/parse_wikipedia_wlf.py
Ergebnis: ERFOLG

  Feldabdeckung:
  - name_latin:     422/422 (100%)
  - date_of_death:  418/422 (99%)
  - place_of_death: 418/422 (99%)
  - province:       408/422 (96%) — auto-gemappt
  - age_at_death:   127/422 (30%)
  - cause_of_death: 115/422 (27%)
  - circumstances:  122/422 (29%)
  - name_farsi:       0/422 (0%) — nicht in Wikipedia
  - gender:           0/422 (0%) — nicht in Wikipedia
  - photo:            0/422 (0%) — nicht in Wikipedia

  Top-Orte: Zahedan (129), Tehran (45), Sanandaj (16), Karaj (15)
  Altersverteilung: Ø 21.8 Jahre, 57 Kinder (<18), jüngstes Opfer: 2 Jahre

Aktion: Manuelle Stichproben-Prüfung
  - shakarami-nika-2006.yaml ✓ (16, Tehran, Beating, detailliert)
  - pirfalak-kian-2013.yaml ✓ (9, Izeh, Khuzestan)
  - najafi-hadis-2000.yaml ✓ (22, Karaj, Gunshot)
  - esmailzadeh-sarina-2006.yaml ✓ (16, Karaj, Beating, detailliert)
  - ghaderi-nasrin-1987.yaml ✓ (35, Marivan, Kurdish doctoral student)

Aktion: Fehlerhafte Datei entfernt
  - Tabellen-Header wurde als Opfer geparst → gelöscht
  - Finale Zahl: 422 YAML-Dateien (421 neu + 1 bestehend)
```

**Entscheidung:** Datensatz ist solide als Skeleton. Enrichment aus HRANA/IHR nötig für Tiefe.

---

#### LOG-P2-004 | 2026-02-09 | QUELLENVERZEICHNIS ERSTELLT

**Was:** Inventar aller relevanten Quellen für WLF-Opfer
**Warum:** Übersicht über verfügbare Daten und deren Qualität

```
Aktion: data/sources/wlf-sources.md erstellt
  Inhalt:
  - 11 Quellen dokumentiert (Wikipedia, HRANA, IHR, Amnesty, IranWire, NCRI, etc.)
  - Qualitätsbewertung pro Quelle (Independence, Verification, Detail, Parsability)
  - Cross-Referencing-Strategie: Wikipedia → HRANA → IHR → Amnesty
  - Data Licensing & Ethics Hinweise
  - Priorisierung: HRANA + IHR zuerst, NCRI niedrigste Priorität

Ergebnis: ERFOLG — umfassendes Quellenverzeichnis
```

**Entscheidung:** HRANA und IHR sind die wichtigsten Anreicherungsquellen für Phase 2B.

---

#### LOG-P2-005 | 2026-02-09 | DATENANALYSE-BERICHT ERSTELLT

**Was:** Vollständiger Analysebericht über die gesammelten Daten
**Warum:** Grundlage für alle weiteren Entscheidungen

```
Aktion: docs/260209-DATA_ANALYSIS.md erstellt
  Inhalt:
  - Feldabdeckung: Tabelle mit % pro Feld
  - Geografie: Top-Orte + Provinz-Breakdown
  - Altersverteilung: 45% Kinder unter 18
  - Todesursachen: 86% Gunshot
  - Zeitlicher Verlauf: Peak am 30. September (Bloody Friday)
  - 3-Tier Qualitätssystem: Tier 1 (~30), Tier 2 (~90), Tier 3 (~300)
  - Schema-Empfehlung: Keine Änderungen nötig
  - Aufwandsschätzung: 80-150h für vollständige Anreicherung
  - Import-Pipeline-Bewertung
  - 5 Entscheidungspunkte für Phase 2B

Ergebnis: ERFOLG — datengetriebene Grundlage für nächste Schritte
```

**Entscheidung:** Deploy mit 422 Opfern (auch mit dünnen Daten) — besser Namen listen als auf Perfektion warten.

---

#### LOG-P2-006 | 2026-02-09 | LEARNINGS DOKUMENTIERT

**Was:** Alle Erkenntnisse aus Phase 2A in LEARNINGS.md aufgenommen
**Warum:** Wissen sichern für spätere Phasen und Contributors

```
Neue Einträge:
  - PL-002: Datengetriebener Ansatz > Feature-getrieben
  - PL-003: Schema-Validierung durch echte Daten
  - AD-008: Isolierte Docker-PostgreSQL für Gedenkportal (Port 5433)
  - AD-009: UI muss für Sparse Data designt werden
  - AD-010: Aspirational Fields bewusst beibehalten
  - BUG-004: macOS Python SSL-Fix
  - Data Import Notes: Transliteration, Zahedan-Dominanz, Feldabdeckung
```

**Entscheidung:** Wissensbasis aktuell. Weiter mit Phase 2B.

---

#### LOG-P2-007 | 2026-02-09 | GIT COMMIT + PUSH

**Was:** Phase 2A committen und pushen
**Warum:** Fortschritt sichern und veröffentlichen

```
Aktion: git add + commit
Ergebnis: ERFOLG
  Commit: ead6a0c
  Dateien: 425 geändert
  Änderungen: +13.028 Zeilen
  Message: "data(victims): Add 421 WLF victims from Wikipedia, complete Phase 2A"

Aktion: git push origin main
Ergebnis: ERFOLG
```

---

## Phase 2A — Zusammenfassung

| Metrik | Ziel | Ergebnis |
|--------|------|----------|
| YAML-Dateien | 50+ | ✅ **422** (8.4x über Ziel) |
| Minimaldaten | name, date, place | ✅ 99% komplett |
| Quellenverzeichnis | URLs + Bewertung | ✅ 11 Quellen dokumentiert |
| Analysebericht | Feldabdeckung | ✅ 10 Kapitel, vollständig |
| Schema-Entscheidung | Änderung ja/nein | ✅ Keine Änderungen nötig |
| Zeitaufwand | — | ~3 Stunden (Script + Analyse + Docs) |

### Schlüsselerkenntnisse

1. **422 Opfer statt angestrebter 50-100** — Wikipedia enthielt deutlich mehr als erwartet
2. **70/30-Regel:** 70% haben nur Minimaldaten, 30% haben verwertbare Details
3. **Zahedan-Dominanz:** 30.6% der Opfer stammen von einem einzigen Tag (Bloody Friday)
4. **Schema ist valide:** Kein Feld muss geändert werden nach Kontakt mit echten Daten
5. **Automatisierung lohnt sich:** 2h Script → 421 Dateien vs. geschätzt 150h manuell

---

## Phase 2B: Plan schärfen — Pipeline & UI Fixes

### Erfolgskriterien Phase 2B

| Kriterium | Ziel | Status |
|-----------|------|--------|
| Seed-Script province fix | `province` korrekt gemappt | ✅ 1 Zeile gefixt |
| UI Sparse-Data Guards | Keine leeren Sections | ✅ 3 Guards implementiert |
| Docker-Port Isolation | Port 5433, eigenes Netzwerk | ✅ docker-compose.yml + .env.example |
| Gender-Inferenz | >80% der YAML-Dateien | ✅ **99.8%** (424/425) |
| Phase 2B Log | Dokumentation | ✅ Dieser Eintrag |

---

#### LOG-P2-008 | 2026-02-09 | SEED-SCRIPT FIX: PROVINCE-FELD

**Was:** `prisma/seed.ts` Zeile 128 hatte `province: null` hardcoded
**Warum:** 408 YAML-Dateien mit Province-Daten verloren diese Information beim Import

```
Aktion: province: null → province: v.province || null
Ergebnis: ERFOLG — 1-Zeilen-Fix
Dateien: prisma/seed.ts
```

**Lesson Learned:** Immer alle YAML-Felder im Seed-Script prüfen, nicht nur die offensichtlichen. → BUG-005

---

#### LOG-P2-009 | 2026-02-09 | UI SPARSE-DATA GUARDS

**Was:** Victim-Detailseite renderte leere Sections wenn alle Felder null
**Warum:** 70% der Opfer haben nur Minimaldaten (Name, Datum, Ort)

```
Aktion: 3 Guards in app/[locale]/victims/[slug]/page.tsx implementiert
  1. Dates-Bar: nur rendern wenn dateOfBirth || dateOfDeath
  2. Death-Section: nur rendern wenn placeOfDeath || causeOfDeath || responsibleForces || circumstances || event
  3. familyInfo-Guard: formatFamily() muss truthy String zurückgeben
Ergebnis: ERFOLG — keine leeren Sections mehr bei sparse data
```

**Lesson Learned:** UI für den Worst Case (leerer Datensatz) designen, nicht für den Best Case. → AD-009

---

#### LOG-P2-010 | 2026-02-09 | DOCKER-COMPOSE ISOLATION

**Was:** Port 5432 → 5433, eigenes Docker-Netzwerk `memorial-net`
**Warum:** Verhindert Kollision mit SmartLivings-PostgreSQL auf dem VPS

```
Aktion: docker-compose.yml aktualisiert
  - Port: 5432:5432 → 5433:5432
  - Netzwerk: memorial-net (neu definiert)
  - Beide Services (db + app) im gleichen Netzwerk
  - App-interne DATABASE_URL bleibt @db:5432 (Container-intern)
Aktion: .env.example aktualisiert
  - DATABASE_URL Port: 5432 → 5433
Ergebnis: ERFOLG
```

**Entscheidung:** App-Service nutzt intern weiterhin Port 5432 (Container-zu-Container), nur Host-Mapping auf 5433. → AD-008

---

#### LOG-P2-011 | 2026-02-09 | GENDER-INFERENZ

**Was:** Python-Script `scripts/infer_gender.py` für automatische Geschlechts-Inferenz aus Vornamen
**Warum:** 0% der YAML-Dateien hatten ein Gender-Feld gesetzt

```
Aktion: scripts/infer_gender.py erstellt
  Features:
  - ~200 bekannte persische/kurdische/baluchische Vornamen (männlich + weiblich)
  - "son of" / "Sohn von" Pattern-Erkennung
  - In-place YAML-Update (nur gender: null → gender: male/female)
  - Ambiguous-Namen-Handling (z.B. "Shahin" → skip)

Aktion: 4 iterative Durchläufe
  Lauf 1: 64.4% Coverage (Basis-Namensliste)
  Lauf 2: 78.8% Coverage (+30 Namen aus Datenanalyse)
  Lauf 3: 99.5% Coverage (+70 weitere Namen)
  Lauf 4: 99.8% Coverage (Kabdani-Komma-Fix + "son of" Pattern)

Ergebnis: ERFOLG
  372 male, 52 female, 0 null (+ 1 Template)
  Coverage: 99.8% (Ziel war >80%)
```

**Lesson Learned:** Iteratives Vorgehen bei Namenslisten — erst Basis, dann aus den Unknowns ergänzen. 3 Iterationen reichten für 99.8%.

---

### Offene Entscheidungspunkte (aus Phase 2A)

| # | Frage | Status |
|---|-------|--------|
| 1 | Deploy mit 422 Opfern oder warten auf Enrichment? | ⏳ Offen |
| 2 | Farsi-Namen-Enrichment: manuell oder semi-automatisch? | ⏳ Offen |
| 3 | Geschlechter-Inferenz aus Namen automatisieren? | ✅ Erledigt (99.8%) |
| 4 | Zahedan: Sammel-Narrativ oder nur Einzelseiten? | ⏳ Offen |
| 5 | Seed-Script mit 422 Dateien testen (braucht PostgreSQL) | ⏳ Offen |

---

#### LOG-P2-012 | 2026-02-09 | LEARNINGS NACHARBEIT

**Was:** 3 fehlende Learnings in LEARNINGS.md ergänzt
**Warum:** BUG-005, Gender-Pattern und Feldabdeckung waren noch nicht dokumentiert

```
Einträge hinzugefügt:
  - BUG-005: Seed-Script province: null hardcoded
  - Pattern: Iterative Namenslisten (64% → 99.8%)
  - Data Import: Gender 0% → 99.8%
Commit: 496d556
```

---

#### LOG-P2-013 | 2026-02-09 | 4 HINGERICHTETE WLF-PROTESTLER ERGÄNZT

**Was:** YAML-Dateien für die 4 bekanntesten Hingerichteten der WLF-Bewegung erstellt
**Warum:** Wikipedia-Parser erfasst nur Protest-Tote, keine juristischen Hinrichtungen

```
Neue Dateien:
  - 2022/shekari-mohsen-2000.yaml (erster Hingerichteter, 08.12.2022)
  - 2022/rahnavard-majidreza-1999.yaml (öffentlich erhängt, 12.12.2022)
  - 2023/karami-mohammad-mehdi-2001.yaml (Karate-Champion, 07.01.2023)
  - 2023/hosseini-seyyed-mohammad-1983.yaml (Kampfsport-Trainer, 07.01.2023)
Verzeichnis: data/victims/2023/ neu erstellt
Commit: 5f063d8
```

**Lesson Learned:** Wikipedia-Parser hat systematischen Blindspot — separate Seite für Hinrichtungen. → LEARNINGS.md aktualisiert

---

#### LOG-P2-014 | 2026-02-09 | SYSTEMATISCHE OPFER-RECHERCHE

**Was:** 3 parallele Recherche-Agents für fehlende WLF-Opfer
**Warum:** Lückenanalyse zeigte 5 bisher nicht erfasste Opferkategorien

```
Recherche-Ergebnisse:
  1. Tode in Haft/Folter: 7 Fälle identifiziert (Rouhi, Rigi, Fuladiwanda, etc.)
  2. Verdächtige "Suizide" nach Haft: 10+ Fälle (Aghafazli, Emamgholizadeh, etc.)
  3. Weitere Hinrichtungen: 8 fehlende (Mirhashemi, Kazemi, Yaghoubi, etc.)
  4. Hijab-Enforcement: 1 Fall (Armita Geravand)
  5. 2025/2026-Proteste: 9 namentlich identifizierte Opfer
  6. BBC-Leak zu Nika Shakarami: Sexueller Übergriff vor Ermordung
```

---

#### LOG-P2-015 | 2026-02-09 | 35 NEUE OPFER + 2 UPDATES

**Was:** YAML-Dateien für alle recherchierten Opfer erstellt
**Warum:** Datenbank muss alle identifizierbaren Opferkategorien abdecken

```
Neue Dateien (35):
  2022/: 10 verdächtige Tode (Aghafazli, Emamgholizadeh, Na'ami, etc.)
  2023/: 18 (Hinrichtungen: Mirhashemi, Kazemi, Yaghoubi + Hafttode:
         Rouhi, Rigi + Geravand + weitere)
  2024/: 2 (Ghobadlou, Rasaei — Hinrichtungen)
  2025/: 3 (Kourkour, Bahramian — Hinrichtungen + Khodayarifard)
  2026/: 9 (Aminian, Fallahpour, Ghanbari, etc. — neue Proteste)

Aktualisierte Dateien (2):
  - shakarami-nika-2006.yaml: BBC-Leak 2024, Täternamen, sexueller Übergriff
  - zohrevand-milad-2002.yaml: Hinrichtungsdetails, Farsi-Name, Bestattung

Verzeichnisse neu erstellt: data/victims/2024/, data/victims/2025/

Alle 12 bestätigten WLF-Hinrichtungen jetzt komplett erfasst.
48 Dateien geändert, +1.707 Zeilen
Commit: f74d30a
```

**Lesson Learned:** Einzelne Quelle = systematische Blindspots. 5-Kategorien-Checkliste eingeführt. → LEARNINGS.md

---

#### LOG-P2-016 | 2026-02-09 | DUNKELZIFFER-KONTEXT DOKUMENTIERT

**Was:** Einordnung der IHR-Zahl von 551 als verifiziertes Minimum
**Warum:** Interne Quellen sprechen von 1.500–3.000, wahre Zahl vermutlich vierstellig

```
Dokumentiert in LEARNINGS.md:
  - 551 = Boden, nicht Decke
  - 5 Gründe für hohe Dunkelziffer
  - Konsequenz: "Mindestens X verifiziert" statt absolute Zahlen
Commit: 85b02d1
```

---

#### LOG-P2-017 | 2026-02-09 | IRAN KNOWLEDGE BASE ERSTELLT

**Was:** Neues Dokument `docs/IRAN_KNOWLEDGE.md` — chronologische Faktenbasis
**Warum:** Strukturierte Wissensdatenbank für alle Zeiträume der Islamischen Republik

```
Inhalt:
  - 11 chronologische Abschnitte (1979–2026)
  - Pro Abschnitt: Verifizierte Zahlen + Schätzungen + Quellen
  - Gesamtbilanz: 21.000+ verifiziert, 60.000–90.000+ geschätzt
  - Vertrauenshierarchie der Quellen (5 Stufen)
  - Methodik-Hinweise für Zahlen-Darstellung auf der Website
  - 10 Schlüsselorganisationen dokumentiert
Commit: 437348c
```

---

### Phase 2B — Zusammenfassung

| Metrik | Ziel | Ergebnis |
|--------|------|----------|
| Seed-Script province fix | Bug fixen | ✅ 1-Zeilen-Fix |
| UI Sparse-Data Guards | Keine leeren Sections | ✅ 3 Guards |
| Docker-Port Isolation | Port 5433 | ✅ docker-compose.yml |
| Gender-Inferenz | >80% | ✅ **99.8%** |
| Hinrichtungen komplett | Alle 12 | ✅ **12/12** |
| Opfer-Kategorien komplett | Alle 5 Kategorien | ✅ 5/5 abgedeckt |
| Gesamtzahl Opfer in DB | >422 | ✅ **473** |
| Knowledge Base | Chronologische Fakten | ✅ IRAN_KNOWLEDGE.md |

### Schlüsselerkenntnisse Phase 2B

1. **Wikipedia-Parser hatte systematischen Blindspot:** Nur Protest-Tote, keine Hinrichtungen, keine Hafttode
2. **5 Opferkategorien statt 1:** Protest-Tote, Hinrichtungen, Hafttode, verdächtige "Suizide", Hijab-Enforcement
3. **551 ist ein Boden, nicht die Decke:** Wahre Zahl vermutlich vierstellig
4. **~100 Opfer noch auf Wikipedia-Seite, aber nicht im Parser:** Re-Parse steht aus
5. **Nika Shakarami:** BBC-Leak 2024 enthüllte sexuellen Übergriff — aktualisiert

---

## Phase 2C: Deployment

### Infrastruktur-Entscheidungen (bereits getroffen)

| Entscheidung | Details | Ref |
|-------------|---------|-----|
| Isolierte PostgreSQL | Eigener Docker-Container, Port 5433, eigenes Netzwerk | AD-008 |
| Kein shared network | SmartLivings (Port 5432) und Memorial komplett getrennt | AD-008 |
| Gleicher VPS | Hetzner VPS, keine zusätzlichen Kosten | AD-008 |

### Deployment-Schritte (noch nicht begonnen)

- [ ] Docker-Netzwerk `memorial-net` auf VPS erstellen
- [ ] PostgreSQL-Container starten (Port 5433)
- [ ] Prisma-Migrationen ausführen
- [ ] Seed-Script mit 473 YAML-Dateien laufen lassen
- [ ] Next.js App deployen
- [ ] Nginx + SSL konfigurieren
- [ ] Domain + DNS einrichten
- [ ] Cloudflare Free Tier aktivieren
- [ ] Smoke-Test: Alle Seiten in 3 Sprachen prüfen

---

*Erstellt: 2026-02-09*
*Letzte Aktualisierung: 2026-02-09*
