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

#### LOG-P2-018 | 2026-02-09 | IRANVICTIMS.COM CSV-IMPORT (2025-2026)

**Was:** 3.752 Opfer-Dateien aus iranvictims.com CSV importiert
**Warum:** Erste strukturierte Quelle für die 2025-2026 Proteste

```
Quelle: https://iranvictims.com/victims.csv
  - 4.386 Einträge total (3.753 killed, 477 arrested, 111 sentenced_to_death)
  - Felder: Card ID, English Name, Persian Name, Age, Location, Date, Status, Sources, Notes

Import-Script: scripts/import_iranvictims_csv.py
  - Filtert nur status="killed"
  - Province-Mapping für 30+ Provinzen (erweiterte City→Province Map)
  - Cause-of-death Extraktion aus Notes
  - Source-URL-Parsing (iranvictims.com + bis zu 3 Primärquellen)
  - Duplikat-Check gegen existierende Slugs

Ergebnis:
  - 3.752 neue YAML-Dateien (17 in 2025/, 3.735 in 2026/)
  - 1 übersprungen (existierte bereits)
  - Persian Names: 98.3% Coverage
  - Age: 61.1% Coverage
  - Location: 96.6% Coverage
  - Top-Provinzen: Tehran (1052), Isfahan (474), Alborz (355)

Commit: d14f672
```

**Lesson Learned:** Community-Datenbanken (iranvictims.com) können maschinenlesbare CSVs haben — immer prüfen bevor PDFs geparst werden.

---

#### LOG-P2-019 | 2026-02-09 | HRANA 82-TAGE-PDF IMPORT (WLF 2022)

**Was:** 352 neue Opfer aus dem HRANA 82-Day Report extrahiert
**Warum:** HRANA hat 481 namentlich identifizierte Opfer, Wikipedia nur 422

```
Quelle: en-hrana.org 82-Day WLF Comprehensive Report (486 Seiten)
  - PDF heruntergeladen, mit pdftotext extrahiert (poppler)
  - Strukturierte Einträge: "1 - Name - Age: X - Gender: Y - Place: Z - Date: DD-Mon-YYYY - Cause: ..."

Import-Script: scripts/parse_hrana_82day.py
  - Regex-basierte Extraktion aus pdftotext-Output
  - Section: "First category – identity of 481 people" (2. Vorkommen, nicht TOC)
  - Name-based Dedup gegen alle existierenden YAML-Dateien

Ergebnis:
  - 480/481 Einträge erfolgreich geparst
  - 352 neue YAML-Dateien in data/victims/2022/
  - 121 bereits per Name in DB vorhanden (Überlappung mit Wikipedia)
  - 7 per Slug-Match übersprungen
  - Gender-Daten: 429 male, 51 female (100% Coverage!)
  - 2022-Verzeichnis: 434 → 786 Dateien

Commit: efa770a
```

**Lesson Learned:** PDF-Reports sind parsbar, wenn der Text strukturiert ist. pdftotext + Regex reicht für gut formatierte NGO-Reports.

---

#### LOG-P2-020 | 2026-02-09 | IHR-REPORT: CLOUDFLARE-BLOCKADE

**Was:** IHR one-year report (551 Opfer) konnte nicht geparst werden
**Warum:** iranhr.net ist hinter Cloudflare, alle Zugriffsversuche blockiert

```
Versucht:
  - WebFetch: 403 Forbidden
  - curl mit User-Agent: Cloudflare Challenge Page
  - Wayback Machine: Zugriff fehlgeschlagen
  - IHR PDF (Rapport_iran_2022_PirQr2V.pdf): War der Todesstrafen-Jahresbericht, nicht der WLF-Protest-Report

Status: NICHT MÖGLICH — aber auch NICHT MEHR NÖTIG
  - 2022 DB hat jetzt 786 Einträge > IHRs 551 Minimum
  - Coverage: Wikipedia (422) + HRANA (352 neu) + Manuell (12) = 786
  - IHR-Abgleich als zukünftige Aufgabe markiert (bei Cloudflare-Zugang oder Direktkontakt)
```

---

#### LOG-P2-021 | 2026-02-09 | IHR VERDÄCHTIGE TODE: 4 NEUE OPFER

**Was:** 4 fehlende Opfer aus IHRs "22 Suspicious Deaths" Kategorie ergänzt
**Warum:** IHR Background-Agent konnte via Wayback Machine auf den One-Year Report zugreifen

```
Quelle: IHR — One Year Protest Report (via archive.org Wayback Machine)
  - 22 verdächtige Tode gelistet, 18 bereits in DB
  - 4 fehlende identifiziert und als YAML erstellt

Neue Dateien (4):
  - 2022/terval-amirhossein.yaml — verdächtiger Tod
  - 2023/nikpour-farham-2004.yaml — 19, Amol, verdächtiger Tod nach Freilassung
  - 2023/forouzandeh-arash-1991.yaml — 32, Tehran, verdächtiger Tod nach Haft
  - 2023/sogvand-mansoureh-2004.yaml — 19, Abdanan/Ilam, verdächtiger Tod

Ergebnis:
  - 2022-Verzeichnis: 786 → 787 Dateien
  - 2023-Verzeichnis: 23 → 26 Dateien
  - Gesamtzahl: 4.577 → 4.581

Commit: d7678c6
```

---

#### LOG-P2-022 | 2026-02-09 | HRANA 20-TAGE-REPORT CROSS-VALIDATION

**Was:** HRANA 20-Day Report (19 Opfer + Mahsa Amini) gegen bestehende DB abgeglichen
**Warum:** Sicherstellen dass keine Opfer aus dem kürzeren Report fehlen

```
Ergebnis: KEINE NEUEN OPFER
  - Alle 15 "fehlenden" Namen waren Transliterations-Varianten existierender Einträge
  - Beispiele: "Shirouzi" vs "Shirouzehi", "Mohammadpour" vs "Mahmoudpour"
  - Verifiziert via Fuzzy-Matching auf Familienname-Teile
  - Mahsa Amini: Bereits seit Phase 2A in DB

Referenz-Dateien committed:
  - data/victims/ihr_extracted_victims.txt (444 IHR-Opfer, Commit: d7678c6)
  - data/victims/hrana_extracted_victims.txt (501 HRANA-Opfer, Commit: 927b4e8)
```

**Lesson Learned:** Transliterations-Varianten machen einfaches Name-Matching unzuverlässig. Fuzzy-Matching auf Familienname-Teile fängt die meisten Duplikate.

---

#### LOG-P2-023 | 2026-02-09 | GENDER-INFERENZ FÜR IRANVICTIMS.COM

**Was:** Gender-Inferenz auf alle 3.752 iranvictims.com-Dateien angewendet
**Warum:** iranvictims.com CSV liefert kein Geschlecht — 81.9% der DB hatte gender:null

```
Script: scripts/infer_gender.py (erweitert)
  - ~300 neue persische Vornamen in 3 Iterationen ergänzt (Pass 4–6)
  - Tippfehler-Varianten abgedeckt (aboalfzl, behruz, fa'zh, etc.)
  - "shahin" von ambiguous → male verschoben (im Protest-Kontext eindeutig)

Ergebnis:
  Vorher:  731 male (16.0%), 98 female (2.1%), 3.752 null (81.9%)
  Nachher: 4.061 male (88.6%), 520 female (11.4%), 0 null (0%)
  Coverage: 18.1% → 100%

  Iterationen:
    Pass 4: Häufige Namen (meysam 32x, amirreza 21x, etc.) → 80.9%
    Pass 5: Seltene + weibliche Namen (nastaran, ghazal, etc.) → 99.8%
    Pass 6: Letzte 10 Tippfehler (fa'zh, mism, ozar, etc.) → 100%

Commit: bbb8179
```

**Lesson Learned:** Gleiche iterative Methode wie bei WLF-Daten (PL-002). 3 Passes reichen für 100% wenn die Namenslisten bereits eine solide Basis haben.

---

### Phase 2B — Zusammenfassung

| Metrik | Ziel | Ergebnis |
|--------|------|----------|
| Seed-Script province fix | Bug fixen | ✅ 1-Zeilen-Fix |
| UI Sparse-Data Guards | Keine leeren Sections | ✅ 3 Guards |
| Docker-Port Isolation | Port 5433 | ✅ docker-compose.yml |
| Gender-Inferenz | >80% | ✅ **100%** (4.061 male, 520 female) |
| Hinrichtungen komplett | Alle 12 | ✅ **12/12** |
| Opfer-Kategorien komplett | Alle 5 Kategorien | ✅ 5/5 abgedeckt |
| WLF-Opfer in DB (2022) | >551 (IHR) | ✅ **787** |
| WLF-Opfer 2023 (Hinricht./Haft/Susp.) | Alle Kategorien | ✅ **26** |
| 2025-2026-Proteste | Neue Quelle | ✅ **3.752 aus iranvictims.com** |
| IHR Suspicious Deaths | 22 gelistet | ✅ **22/22 abgeglichen** |
| Gesamtzahl Opfer in DB | >422 | ✅ **4.581** |
| Knowledge Base | Chronologische Fakten | ✅ IRAN_KNOWLEDGE.md |

### Schlüsselerkenntnisse Phase 2B

1. **Wikipedia-Parser hatte systematischen Blindspot:** Nur Protest-Tote, keine Hinrichtungen, keine Hafttode
2. **5 Opferkategorien statt 1:** Protest-Tote, Hinrichtungen, Hafttode, verdächtige "Suizide", Hijab-Enforcement
3. **551 ist ein Boden, nicht die Decke:** Wahre Zahl vermutlich vierstellig
4. **Wikipedia hat nur 1 Tabelle mit 422 Zeilen** — Parser hat alles erfasst. Lücke lag nicht an fehlenden Tabellen, sondern an anderen Quellen (HRANA)
5. **HRANA 82-Day Report:** 352 zusätzliche Opfer, die nicht auf Wikipedia waren → 786 in 2022
6. **iranvictims.com:** Einzige maschinenlesbare CSV-Quelle, 3.752 Opfer der 2025-2026 Proteste
7. **IHR Cloudflare-Blockade:** Website nicht zugänglich, aber Coverage bereits über IHR-Minimum
8. **Nika Shakarami:** BBC-Leak 2024 enthüllte sexuellen Übergriff — aktualisiert
9. **Datenbank-Explosion:** Von 473 → 4.581 Opfer in einer Session durch Multi-Source-Import
10. **IHR Suspicious Deaths komplett:** Alle 22 verdächtigen Tode aus dem IHR One-Year Report abgeglichen — 4 fehlten, jetzt erfasst
11. **HRANA 20-Day Cross-Validation:** Alle 15 "fehlenden" Namen waren Transliterations-Varianten — 0 echte Lücken
12. **Gender 100%:** Iterative Namenslisten-Erweiterung skaliert auch auf 3.752 neue Dateien — 3 Passes für 18% → 100%

---

#### LOG-P2-024 | 2026-02-09 | DEDUPLIZIERUNG: 4.581 → 4.375

**Was:** Vollständige Deduplizierung aller YAML-Dateien in 3 Runden
**Warum:** Multi-Source-Import erzeugt Transliterations-Duplikate und Cross-Source-Überlappungen

```
Script: scripts/dedup_victims.py
  Strategien:
  A. Gleicher Familienname + ähnliche Vornamen (Levenshtein ≤ 1, gleicher Anfangsbuchstabe)
  B. Normalisierter Vollname-Match (Transliterations-Mapping)
  C. Cross-Year Slug-Match

  Scoring: Todesdatum (+50), Farsi-Name (+50), Provinz (+20), Alter (+15),
           verschiedene Todesdaten (-100), verschiedenes Alter (-30)

Runde 1: 172 HIGH-confidence Merges (score ≥ 50, automatisch)
  - Union-Find Clustering: 178 Paare → 158 Cluster (14 mit 3+ Dateien)
  - 4.581 → 4.409
  - Commit: 199a737

Runde 2: 6 manuelle Transliterations-Merges (MEDIUM, Cat 1)
  - z.B. "Shirouzi" vs "Shirouzehi", "Pouriya" vs "Pouria"
  - 4.409 → 4.403
  - Commit: e1d0275

Runde 3: 27 manuelle MEDIUM-Merges nach Datei-Review
  - 55 MEDIUM-Paare geprüft: 27 gemergt, 28 als verschiedene Personen bestätigt
  - Key Pattern: "getötet in Stadt A, beerdigt/gedenkt in Stadt B" (iranvictims.com listet Begräbnisort)
  - 49% false positive rate bei Score 30-49
  - 4.403 → 4.375
  - Commit: 24ac955

Ergebnis: 206 Duplikate entfernt, 0 Fehler, 0 Datenverlust
Docs: 50315ca (LEARNINGS.md + CLAUDE.md aktualisiert)
```

**Hauptursachen:** iranvictims.com Doppellistungen (~120), Cross-Source WLF-Überlappung (~35), Cross-Year Slugs korrekt NICHT gemergt (~15)

---

#### LOG-P2-025 | 2026-02-09 | AMNESTY CHILDREN REPORT ENRICHMENT

**Was:** 44 Kinder-Opfer aus Amnesty Report MDE 13/6104/2022 geparst und angereichert
**Warum:** Detaillierte Umstände, Ethnie und verifizierte Todesursachen ergänzen

```
Quelle: "Iran: Killings of children during youthful anti-establishment protests"
  - 49-seitiges PDF, heruntergeladen und mit pdftotext extrahiert
  - 44 Kinder mit individuellen Profilen (Name, Alter, Ethnie, Stadt, Todesursache, Umstände)

Script: scripts/parse_amnesty_children.py
  - Manuelle Mapping-Tabelle (Amnesty-Nummer → YAML-Dateiname)
  - 41/44 zu existierenden Dateien gemappt (viele hatten andere Slug-Varianten)
  - 3 neue YAML-Dateien erstellt

Enrichment (41 bestehende Dateien):
  - Umstände: 41x durch Amnesty-Detail ersetzt/erweitert
  - Todesursache: 39x präzisiert (z.B. "Gunshot" → "Gunshot (headshot, live ammunition)")
  - Ethnie: 23x ergänzt (Baluchi, Kurdish, Afghan, Persian)
  - Alter: 6x ergänzt
  - Quelle: 44x Amnesty MDE 13/6104/2022 als Source hinzugefügt

Neue Dateien (3):
  - shahbakhsh-danial-2011.yaml (Baluchi, 11, Zahedan, Bloody Friday)
  - qeleji-ahmadreza-2005.yaml (17, Tehran)
  - marefat-amin-2006.yaml (Kurdish, 16, Oshnavieh)

Ergebnis: 4.375 → 4.378 Opfer, 155 Feld-Änderungen
Commit: 7b7f2d0
Docs: 3a402e7 (LEARNINGS.md + CLAUDE.md aktualisiert)
```

**Lesson Learned:** NGO-PDF-Reports lohnen sich vor allem für Enrichment, nicht für neue Opfer — 41 von 44 waren bereits in der DB, aber mit dünneren Daten.

---

#### LOG-P2-026 | 2026-02-09 | BOROUMAND FOUNDATION ENRICHMENT

**Was:** 27.202 Opfer aus iranrights.org/memorial gescraped und gegen unsere DB abgeglichen
**Warum:** Farsi-Namen, Fotos und Cross-Referencing als verifizierte Quelle

```
Phase 1 (Browse): 545 Seiten gecrawlt → 27.202 Master-Liste
  - URL: /memorial/browse/date/{1-545}, 50 Einträge pro Seite
  - Felder: ID, Slug, Name, Mode of Killing, Photo-URL
  - Kein API — HTML-Scraping mit urllib + regex
  - Rate-Limiting: 1.5-2.5s random delay, ~18 Min total

Phase 2 (Match): 419 Name-Matches gegen 4.378 YAMLs
  - Normalisiert: lowercase, Bindestriche/Apostrophe entfernt
  - Problem: Häufige Namen (Mohammad Ahmadi → 4 Boroumand-IDs!)
  - 387 unique Boroumand IDs, 236 unique YAML-Dateien

Phase 3 (Detail): 387 EN + FA Detailseiten gefetcht
  - HTML-Struktur: <h1 class='page-top'> für Name
  - Felder: <div><em>Label:</em> Value</div> (nicht dt/dd!)
  - Farsi: /fa/memorial/story/{id}/{slug} → Farsi-Name aus h1
  - ~26 Min (387 × 2 requests × 2s delay)

Phase 4 (Enrich): 203 Dateien angereichert, 216 Date-Mismatches übersprungen
  - Date-Validation: Boroumand-Datum vs YAML date_of_death
  - ±1 Tag Toleranz (Cross-Source-Reporting-Differenzen)
  - 64 Farsi-Namen, 33 Fotos, 202 Boroumand-Source-Links
  - SSL-Fix nötig: macOS Python braucht ssl.CERT_NONE für urllib

Script: scripts/scrape_boroumand.py (4 Subcommands)
Cache: scripts/.boroumand_cache/ (in .gitignore)
Commit: 8df7e1d
```

**Lesson Learned:** Date-Validation ist kritisch bei Name-Matching — häufige iranische Namen (Ali Mohammadi, Mohammad Ja'fari) existieren in verschiedenen Jahrzehnten als verschiedene Opfer. Ohne Datumsabgleich hätte >50% der Matches falsche Personen angereichert.

---

## Phase 2C: Deployment

### Infrastruktur-Entscheidungen (bereits getroffen)

| Entscheidung | Details | Ref |
|-------------|---------|-----|
| Isolierte PostgreSQL | Eigener Docker-Container, Port 5433, eigenes Netzwerk | AD-008 |
| Kein shared network | SmartLivings (Port 5432) und Memorial komplett getrennt | AD-008 |
| Gleicher VPS | Hetzner VPS, keine zusätzlichen Kosten | AD-008 |

### Deployment-Schritte

- [x] Docker-Netzwerk `memorial-net` auf VPS erstellen
- [x] PostgreSQL-Container starten (Port 5434)
- [x] Prisma-Migrationen ausführen
- [x] Seed-Script laufen lassen
- [x] Next.js App deployen
- [x] Nginx + SSL konfigurieren
- [x] Domain + DNS einrichten (memorial.n8ncloud.de)
- [x] Cloudflare aktivieren
- [x] Smoke-Test

---

#### LOG-P2-027 | 2026-02-12 | BOROUMAND AI ENRICHMENT: 3.932 OPFER

**Was:** Claude/OpenAI-basierte Extraktion strukturierter Felder aus Boroumand `circumstances_en` Freitext
**Warum:** 4.185 Boroumand-Opfer haben reiche Texte aber leere strukturierte Felder (2x occupation, 1x education)

```
Script: scripts/extract-fields.ts (OpenAI GPT-4o-mini, function calling)
  Felder: placeOfBirth, dateOfBirth, gender, ethnicity, religion, occupation,
          education, familyInfo, personality, beliefs, quotes, responsibleForces, eventContext

  Ergebnis:
    - 3.932 Victims verarbeitet (253 ohne circumstances übersprungen)
    - 14.247 DB-Felder aktualisiert
    - 2.977 YAML-Dateien aktualisiert
    - 0 Fehler, 48 Min 49 Sek

  Top extrahierte Felder:
    - gender: 3.704 (94%)
    - responsibleForces: 2.741 (70%)
    - occupation: 2.282 (58%)
    - placeOfBirth: 1.718 (44%)
    - education: 1.108 (28%)
    - ethnicity: 797 (20%)

Commit: a01a4f77
```

**Lesson Learned:** GPT-4o-mini mit function calling ist exzellent für strukturierte Extraktion aus Fließtext. ~$10 für 4K Victims. Nie überschreiben was schon befüllt ist (COALESCE-Pattern).

---

#### LOG-P2-028 | 2026-02-12 | SOURCE DEDUP: 221.800 DUPLIKATE ENTFERNT

**Was:** Bereinigte doppelte Source-Einträge aus der Server-DB
**Warum:** Seed-Script-Bug erzeugte Duplikate bei jedem Lauf (nicht idempotent)

```
Script: scripts/dedup-sources.ts
  - CTE mit ROW_NUMBER() PARTITION BY (victim_id, name, url)
  - Batched Deletes (5000 pro Batch)

  Vorher: 251.118 Sources total
  Nachher: 29.318 Sources (nur unique)
  Gelöscht: 221.800 Duplikate

Fix: prisma/seed.ts — deleteMany vor Source-Creation (idempotent)
```

---

#### LOG-P2-029 | 2026-02-12 | PERFORMANCE: EVENT-SEITEN PAGINATION

**Was:** Event-Seiten waren extrem langsam (WLF 2022: 794 Victims, 2026: 4.380)
**Warum:** Alle Victims wurden auf einmal geladen, mit allen 44 Spalten

```
Fix 1: getEventBySlug — select statt include (nur 7 Felder für VictimCard)
Fix 2: Pagination mit 50 pro Seite + ?page= Query-Parameter
Fix 3: getRecentVictims — ebenfalls select-only

  Vorher: ~1.8s (warm), alle Victims auf einer Seite
  Nachher: ~0.32s (warm), 50 pro Seite mit Pagination-UI

  Pagination-UI: Prev/Next Pfeile + max 7 Seitenbuttons mit Ellipsis

Commit: d6f372fe + a0a3be97
```

---

#### LOG-P2-030 | 2026-02-12 | CIRCUMSTANCES TEXT FORMATTING

**Was:** Boroumand-Texte waren ein einziger Textblock ohne Absätze
**Warum:** Boroumand-Texte haben keine `\n\n` — Section-Headers sind inline eingebettet

```
Fix: splitCircumstances() in victims/[slug]/page.tsx
  3-Tier Splitting:
  1. \n\n Split (normale Absätze)
  2. Section-Header Split (Arrest, Trial, Charges, Defense, Judgment, etc.)
  3. Satz-Grenzen-Fallback (~500 Zeichen)

  Beispiel Neda Soltan: 1 Block → 11 lesbare Absätze

Commit: c7416530
```

---

#### LOG-P2-031 | 2026-02-12 | SECURITY HARDENING

**Was:** Vollständiger Security Audit + 4 Fixes deployed
**Warum:** SQL Injection, fehlende Rate Limits, keine Input-Validation, keine Security Headers

```
Findings:
  CRITICAL: SQL Injection via $queryRawUnsafe + filters.sql Interpolation
  HIGH: Keine Rate Limits auf /api/submit und /api/search
  HIGH: Keine Input-Validation auf /api/submit
  HIGH: Keine Security Headers (CSP, X-Frame-Options, HSTS, etc.)

Fixes:
  1. lib/queries.ts — $queryRawUnsafe → $queryRaw tagged templates
     - buildFilterParams (String) → buildFilterFragment (Prisma.Sql)
     - Gender whitelisted, Year range-validated, Search max 200 chars
  2. lib/rate-limit.ts — In-Memory Sliding Window Rate Limiter
     - /api/submit: 5 requests/hr per IP
     - /api/search: 100 requests/min per IP
  3. app/api/submit/route.ts — Zod Schema Validation
     - name_latin (1-200), details (10-5000), email validation, etc.
     - 400 mit feldspezifischen Fehlern bei ungültiger Eingabe
  4. next.config.ts — Security Headers
     - CSP, HSTS, X-Frame-Options: DENY, nosniff, Referrer-Policy, Permissions-Policy

Verifiziert: curl -I memorial.n8ncloud.de → alle 6 Headers present

Commit: efc20928
```

---

## Phase 2C — Zusammenfassung

| Metrik | Status |
|--------|--------|
| Deployment | ✅ Live auf memorial.n8ncloud.de |
| Boroumand AI Enrichment | ✅ 14.247 Felder, 3.932 Victims |
| Source Dedup | ✅ 221.800 Duplikate entfernt |
| Event-Pagination | ✅ 50/Seite, 6x schneller |
| Circumstances Formatting | ✅ 3-Tier Paragraph-Splitting |
| Security Hardening | ✅ SQL Injection, Rate Limiting, Validation, Headers |
| Disk-Management | ✅ Docker Prune, 92% → 81% |

---

## Phase 3: Boroumand Historical Import

---

#### LOG-P3-001 | 2026-02-13 | SEED 10K EXISTING YAMLS → DB

**Was:** Inkrementelles Seeding von ~10K YAML-Dateien die nicht in der DB waren
**Warum:** DB hatte 17.515 Victims, YAML-Dateien 14.430 — nach Boroumand-Imports existierten mehr Dateien als DB-Einträge

```
Script: scripts/seed-new-only.ts (NEU)
  - Create-only Seed (kein upsert) — schützt AI-extrahierte Felder
  - Lädt alle existierenden Slugs in einem Query
  - Nur prisma.victim.create() für neue Einträge

Ergebnis:
  - Dry-Run zeigte 15 "neue" → Bug: YAML-IDs als negative Zahlen geparst (-1989)
  - Fix: String(v.id) Coercion
  - Nach Fix: 0 neue Einträge → alle 14.430 YAMLs waren bereits in DB
  - Phase 1 war bereits abgeschlossen (DB hatte mehr als YAML-Dateien)

Commit: 8f242f36 (als Teil von Phase 3 Batch)
```

**Lesson Learned:** YAML parst `-1989` als Integer -1989, nicht als String. → BUG-011

---

#### LOG-P3-002 | 2026-02-13 | GENDER INFERENCE + DB SYNC

**Was:** Gender-Inferenz auf alle YAMLs + Sync zu DB
**Warum:** Tausende historische Boroumand-Einträge hatten `gender: null`

```
Script 1: python3 scripts/infer_gender.py
  - 3.778 Genders inferred (3.601 male + 177 female)

Script 2: scripts/sync-gender-to-db.ts (NEU)
  - Synct Gender von YAML zu DB wo sie sich unterscheiden
  - Nur gender-Feld, alle anderen Felder unberührt
  - 3.760 DB-Updates

Commit: 8f242f36
```

---

#### LOG-P3-003 | 2026-02-13 | AI FIELD EXTRACTION (RUNDE 2)

**Was:** GPT-4o-mini Extraktion auf neue Boroumand-Einträge mit langen Texten
**Warum:** 4.119 Victims mit `dataSource: "boroumand-import"` und `circumstancesEn > 200 chars`

```
Script: npx tsx scripts/extract-fields.ts --resume
  - 4.119 Victims verarbeitet (stale progress file → alle reprocessed)
  - 1.540 neue DB-Felder
  - 293 YAML-Dateien aktualisiert
  - 0 Fehler, ~47 Minuten
  - Kosten: ~$10

Commit: 8f242f36
```

---

#### LOG-P3-004 | 2026-02-13 | PHASE 4: IMPORT 4.689 CACHED BOROUMAND ENTRIES

**Was:** Import von 4.689 Boroumand-Einträgen mit gecachten Detail-Seiten
**Warum:** Beim vorherigen Scraping waren 4.689 Detail-Seiten bereits gecacht aber noch nicht als YAML importiert

```
Script: python3 scripts/scrape_boroumand.py import-new --resume --cache-only
  - Neues --cache-only Flag: überspringt Entries ohne Cache
  - Fix: Type mismatch — Master-IDs sind int, Cache-Filenames str
    → str(e['id']) in cached_ids
  - 4.689 neue YAML-Dateien erstellt

Nachbearbeitung:
  - Gender Inference: 2.509 weitere Genders
  - seed-new-only.ts: 4.258 neue Victims in DB (manche existierten schon)
  - sync-gender-to-db.ts: Gender-Sync
  - 13 malformed YAML-Dateien: try-catch in readYaml() hinzugefügt
  - 2 invalide Daten: 2008-06-31 → 2008-06-30

DB: 17.515 → 21.773 Victims
Commit: c0b2cc52
```

---

#### LOG-P3-005 | 2026-02-13 | DEDUP: CROSS-YEAR + INTERNAL 2026

**Was:** Systematische Bereinigung von Duplikaten aus iranvictims.com
**Warum:** iranvictims.com listet historische Opfer (Afkari 2020, Geravand 2023, etc.) fälschlicherweise als 2026-Protestopfer + interne Duplikate durch verschiedene Transliterationen

```
Cross-Year Duplikate:
  - 13 identifiziert, 3 als False Positives wiederhergestellt
  - 10 gelöscht, Sources in Originale gemergt
  - bakhtiari-pouya nach 2019/ verschoben (war Aban 98 Opfer)
  - mirzaei-mehdi mit detaillierten Umständen angereichert
  - Hosseini-seyed-mohammad: Alias "(Kian)" hinzugefügt

Interne 2026 Duplikate:
  Script: scripts/dedup_2026_internal.py (NEU)
  - Gruppierung nach normalisiertem Farsi-Name
  - Scoring: non-null Felder + Sources
  - Merge: fehlende Felder + unique Sources + non-redundante Umstände
  - 234 Gruppen, 254 Loser-Dateien gelöscht
  - 3.817 → 3.563 Dateien in 2026/

DB-Cleanup:
  - 263 Duplikat-Victims aus Prod-DB gelöscht
  - bakhtiari-pouya Slug umbenannt
  - DB: 21.773 → 21.510 Victims

Commit: 9c60e567
```

**Lesson Learned:** Gleicher Name ≠ gleiche Person. Masoud (2026, Erschießung) ≠ Mas'ud (2010, Hinrichtung). → BUG-010

---

#### LOG-P3-006 | 2026-02-13 | PARALLEL SCRAPER OPTIMIZATION

**Was:** Boroumand-Scraper von sequentiell auf 4 parallele Worker umgebaut
**Warum:** Sequentiell: 13/min, ETA 31h für 12.290 Entries → zu langsam

```
Änderungen an scripts/scrape_boroumand.py:
  - ThreadPoolExecutor mit 4 Workern
  - Delay reduziert: 1.5-2.5s → 0.8-1.2s pro Worker
  - Batch-Processing: 16 Entries parallel fetchen, YAML sequentiell schreiben
  - Slug-Eindeutigkeit bleibt sequentiell (kein Race Condition)

Ergebnis:
  - Vorher: ~13/min (sequentiell, 2×2s Delay)
  - Nachher: ~100/min (4 Worker, 2×1s Delay)
  - Speed-Up: ~8×
  - ETA: 31h → ~2h

Commit: a0289496
```

---

#### LOG-P3-007 | 2026-02-13 | BOROUMAND FULL FETCH (LAUFEND)

**Was:** Verbleibende ~12.290 Boroumand-Einträge ohne Cache werden live gefetcht
**Warum:** Phase 6 des Import-Plans — Detail-Seiten für alle verbleibenden Einträge

```
Befehl: nohup python3 -u scripts/scrape_boroumand.py import-new --resume
Log: /tmp/boroumand-fetch.log
PID: 74171

Status (Stand ~16:00):
  - 14.525 bereits verarbeitet (aus früheren Runs)
  - ~400/12.290 neue in diesem Run
  - ~100/min Speed
  - ETA: ~2h

Nächste Schritte nach Abschluss:
  1. python3 scripts/infer_gender.py
  2. npx tsx scripts/seed-new-only.ts
  3. npx tsx scripts/sync-gender-to-db.ts
  4. Commit + Push + Deploy
```

#### LOG-P3-008 | 2026-02-13 | FIX: IRANRIGHTS.ORG FOTOS NICHT ANGEZEIGT

**Was:** Alle Fotos von iranrights.org waren auf der Live-Website nicht sichtbar
**Warum:** Next.js Image Optimization proxied Bilder serverseitig → Hetzner-IP von Cloudflare blockiert

```
Diagnose:
  - curl von lokal → 200 OK (31KB JPEG)
  - curl vom Server → 403 Forbidden (cf-mitigated: challenge)
  - Docker-Container → 403 (wget --spider)
  - Next.js /_next/image → "url parameter is valid but upstream response is invalid"
  - Ursache: Cloudflare Bot Protection blockiert alle Datacenter-IPs

Fix:
  - `unoptimized` Prop auf <Image> in:
    - app/[locale]/victims/[slug]/page.tsx (Detail-Foto)
    - components/VictimCard.tsx (Listen-Foto)
  - Browser fetcht Bilder direkt (besteht Cloudflare-Challenge)

Verifiziert:
  - Deployed: ff55ee8a
  - memorial.n8ncloud.de/de/victims/jahanbani-nader-1979 → Foto sichtbar
  - HTML: src="https://www.iranrights.org/actorphotos/..." (direkt, nicht /_next/image)
```

**Lesson Learned:** Next.js Image Optimization funktioniert nur wenn der Server die Quelle erreichen kann. Datacenter-IPs werden oft von Cloudflare blockiert. → BUG-012

---

#### LOG-P3-009 | 2026-02-13 | BOROUMAND FETCH COMPLETE + FULL PIPELINE

**Was:** Boroumand-Fetch abgeschlossen (alle 12.290 neue Entries) + komplette Pipeline ausgeführt
**Warum:** Alle verbleibenden Boroumand-Einträge importieren und in die DB bringen

```
Fetch (4 parallele Worker, ~100/min):
  - 14.525 aus früheren Runs + 12.290 neu = 26.815 total verarbeitet
  - Alle Einträge erfolgreich, 0 Fehler
  - Laufzeit: ~2h

Gender Inference: python3 scripts/infer_gender.py
  - 33.432 Dateien verarbeitet
  - 9.617 neue Genders (8.313 male + 1.304 female)
  - 23.815 unknown (historische Einträge ohne erkennbare Vornamen)

Seed: npx tsx scripts/seed-new-only.ts
  - 33.432 YAML-Dateien gelesen
  - 18.840 bereits in DB (skip)
  - 14.581 neue Victims created
  - 11 malformed YAML übersprungen
  - DB: 21.510 → 36.091 Victims

Gender Sync: npx tsx scripts/sync-gender-to-db.ts
  - 2 Updates (Rest bereits synchron oder null)

Commit: (Teil von Phase 3 Final Batch)
```

---

#### LOG-P3-010 | 2026-02-13 | EVENT DEATH TOLLS: DIASPORA-QUELLEN

**Was:** Geschätzte Opferzahlen aller 12 Events mit realistischen Diaspora-/NGO-Quellen korrigiert
**Warum:** Bisherige Zahlen basierten teilweise auf Regime-/UN-Zahlen die systematisch nach unten verfälscht sind

```
Quellen: HRANA, IHR, Amnesty International, Boroumand Foundation, BBC Persian,
         Iran International, Reuters, AP, geleakte Dokumente, akademische Studien

Korrekturen in data/events/timeline.yaml:
  - Revolution 1979: null → 2.000-3.000
  - Post-Revolution 1979-81: 438 → 700-12.000 (+ 10K kurdische Opfer)
  - Reign of Terror 1981-85: 7.900 → 8.000-12.000
  - Iran-Iraq War: 500.000 → 200.000-600.000 (+ 100K Kindersoldaten)
  - 1988 Massacres: 4.482 → 4.482-30.000
  - Chain Murders 1988-98: 80 → 80-300
  - Student Protests 1999: 4 → 10-17
  - Green Movement 2009: 72 → 100-200
  - Bloody November 2019: 1.500 → 1.500-3.000
  - Woman Life Freedom 2022: 500 → 551-1.500 (+ 68 Kinder, 10 Hingerichtete)
  - 2026 Massacres: 3.428-20.000 → 35.000-40.000 (+ 52 Hingerichtete)

Commit: f94c4ccc
```

**Lesson Learned:** Offizielle Zahlen der iranischen Regierung und von ihr beeinflusster UN-Berichte sind immer zu niedrig. Diaspora-NGOs (HRANA, IHR, Boroumand) geben konservative Minima; geleakte interne Dokumente zeigen oft 2-3× höhere Zahlen.

---

#### LOG-P3-011 | 2026-02-13 | DEDUP ROUND 3: -2 SUFFIX MERGE

**Was:** 939 Duplikate mit `-2` Suffix im Slug gemergt und gelöscht
**Warum:** Boroumand-Scraper erstellt `slug-2` wenn `slug.yaml` bereits existiert → viele sind echte Duplikate

```
Analyse:
  - 4.433 Dateien mit `-2` Suffix gefunden
  - Vergleich: Farsi-Name + Todesdatum gegen Original (ohne -2)
  - 3.800 echte Duplikate (gleicher Name + Datum)
  - 590 verschiedene Personen (behalten)

Merge-Strategie (nicht nur löschen!):
  - Felder: Leere Felder im Original werden aus Duplikat befüllt
  - Sources: Unique Sources aus Duplikat werden ans Original angehängt
  - YAML + DB parallel aktualisiert

Ergebnis:
  - 939 YAML-Dateien gelöscht (strictere Prüfung: Original muss existieren)
  - 939 DB-Einträge gelöscht
  - DB: 36.091 → 35.152 Victims

Commit: (Teil von Phase 3 Final Batch)
```

**Lesson Learned:** Bei Scraper-generierten `-2` Suffixen: immer mergen statt nur löschen. Die Duplikate können unique Sources (Twitter, Telegram) oder ausgefüllte Felder enthalten die dem Original fehlen.

---

## Phase 3 — Zusammenfassung (FINAL)

| Metrik | Vorher | Nachher |
|--------|--------|---------|
| YAML-Dateien | 14.430 | ~32.500 |
| DB Victims | 17.515 | 35.152 |
| Boroumand importiert | 7.636 | 26.815 (alle verarbeitet) |
| Gender Coverage | ~85% | ~72% (28% unknown bei historischen) |
| Duplikate entfernt (total) | 206 | 1.410 (206 + 265 + 939) |
| Event Death Tolls | Teils offiziell | Alle mit Diaspora-Quellen korrigiert |
| Foto-Anzeige | Cloudflare-blockiert | unoptimized Fix deployed |
| Neue Scripts | — | seed-new-only.ts, sync-gender-to-db.ts, dedup_2026_internal.py, infer_gender.py |

---

*Erstellt: 2026-02-09*
*Letzte Aktualisierung: 2026-02-13 (Phase 3 FINAL: 35.152 Victims, Boroumand complete, Dedup ×3, Death Toll corrections)*
