# Woman, Life, Freedom — Source Inventory

## Overview

Sources for documenting the victims of the 2022 Mahsa Amini protests ("Woman, Life, Freedom" movement). The protests began on September 16, 2022 after the death of Mahsa (Zhina) Amini in morality police custody. Over 551 people were killed according to human rights organizations.

---

## Primary Sources

### 1. Wikipedia — Deaths during the Mahsa Amini protests
- **URL:** https://en.wikipedia.org/wiki/Deaths_during_the_Mahsa_Amini_protests
- **Data format:** HTML wikitable (structured)
- **Fields provided:** Name, age, city, date of death, circumstances, source references
- **Coverage:** ~420+ named victims
- **Quality:** Medium — compiled from other sources (HRANA, IranWire, Amnesty, Spiegel, NCRI)
- **Language:** English
- **Parsability:** High — structured table, easily machine-readable
- **Status:** ✅ PARSED — 421 victims extracted as YAML files
- **Limitations:**
  - No Farsi names
  - No photos
  - No gender/ethnicity markers
  - Circumstances only for ~29% of entries
  - Age available for only ~30% of entries
  - Many Zahedan (Bloody Friday) victims have minimal detail
  - Some names have multiple transliteration variants

### 2. HRANA — Human Rights Activists News Agency
- **URL:** https://www.en-hrana.org/
- **Key report:** "Woman, life, freedom; Comprehensive report of 20 days of protest across Iran" (Oct 12, 2022)
- **Data format:** Web reports (unstructured), PDF
- **Fields provided:** Name, age, city, province, detailed circumstances, sometimes photos
- **Coverage:** 300+ named victims (referenced as source "1" in Wikipedia)
- **Quality:** High — on-the-ground verification from inside Iran
- **Language:** English + Farsi
- **Parsability:** Low — narrative reports, not tabular
- **Status:** ⏳ TO DO (Phase 2B enrichment)
- **Value:** Farsi names, detailed circumstances, additional victims not in Wikipedia

### 3. Iran Human Rights (IHR)
- **URL:** https://iranhr.net/
- **Key report:** "1 Year Report on Nationwide Protests" (September 2023)
- **Data format:** PDF reports + web
- **Fields provided:** Name, age, city, cause of death, verification status
- **Coverage:** 551 verified deaths total (referenced as source "5" in Wikipedia)
- **Quality:** High — systematic verification methodology
- **Language:** English
- **Parsability:** Medium — PDFs with some structure
- **Status:** ⏳ TO DO
- **Value:** Highest death toll count, verification methodology, children's reports

### 4. Amnesty International
- **URL:** https://www.amnesty.org/
- **Key reports:**
  - "Iran: Killings of Children during Youthful Anti-Establishment Protests" (Oct 2022)
  - "Iran: Lethal Response" (2023)
- **Data format:** PDF reports
- **Fields provided:** Name, age, detailed circumstances, cause of death, responsible forces
- **Coverage:** 144+ verified with detailed narratives (referenced as source "4" in Wikipedia)
- **Quality:** Very high — forensic-level verification, legal standard
- **Language:** English
- **Parsability:** Low — narrative PDFs
- **Status:** ⏳ TO DO
- **Value:** Most detailed individual accounts, legal-grade evidence, children focus

### 5. IranWire
- **URL:** https://iranwire.com/
- **Key article:** "Remembering the Victims of #IranProtests2022" (Oct 5, 2022)
- **Data format:** Web articles
- **Fields provided:** Name, age, city, circumstances, sometimes photos
- **Coverage:** Referenced as source "2" in Wikipedia
- **Quality:** High — investigative journalism
- **Language:** English + Farsi
- **Parsability:** Low — narrative articles
- **Status:** ⏳ TO DO

### 6. NCRI — National Council of Resistance of Iran
- **URL:** https://www.ncr-iran.org/
- **Data format:** Web press releases
- **Fields provided:** Names, death tolls
- **Coverage:** Referenced as source "6" in Wikipedia — many entries cite only NCRI
- **Quality:** Medium — political opposition group, some bias concerns (Wikipedia flags "Better source needed")
- **Language:** English
- **Parsability:** Low
- **Status:** ⏳ TO DO (lower priority due to quality concerns)

---

## Secondary Sources

### 7. Der Spiegel (Germany)
- **URL:** https://www.spiegel.de/
- **Key article:** "Wie Iran den Protest bekämpft. Die Blutspur des Regimes" (Oct 23, 2022)
- **Quality:** High — independent investigative journalism
- **Referenced as:** Source "3" in Wikipedia
- **Language:** German (useful for DE localization)

### 8. Hengaw Organization for Human Rights
- **URL:** https://hengaw.net/
- **Focus:** Kurdish victims specifically
- **Quality:** High for Kurdistan Province data
- **Value:** Detailed Kurdish victim information, Farsi/Kurdish names

### 9. Kurdistan Human Rights Network (KHRN)
- **URL:** https://kurdistanhumanrights.org/
- **Focus:** Kurdish regions (Sanandaj, Saqqez, Mahabad, etc.)
- **Quality:** High

---

## Future Sources (Phase 3+)

### 10. Omid Memorial (Abdorrahman Boroumand Center)
- **URL:** https://memorial.baroumand.org/
- **Coverage:** 26,244+ victims spanning all eras (1979-present)
- **Data format:** Web database (searchable)
- **Value:** Historical victims beyond WLF movement
- **Status:** Phase 4 integration candidate

### 11. Iran International — Interactive Map
- **URL:** https://www.iranintl.com/
- **Coverage:** 1,141+ with geographic mapping
- **Value:** Photo collection, geographic data

---

## Source Quality Assessment

| Source | Independence | Verification | Detail Level | Parsability | Priority |
|--------|-------------|--------------|-------------|-------------|----------|
| HRANA | High | High | High | Low | 1 |
| IHR | High | Very High | Medium | Medium | 1 |
| Amnesty | Very High | Very High | Very High | Low | 2 |
| Wikipedia | N/A (meta) | Varies | Medium | Very High | Done ✅ |
| IranWire | High | High | High | Low | 2 |
| Der Spiegel | Very High | High | High | Low | 3 |
| Hengaw | High | High | High (Kurdish) | Low | 3 |
| NCRI | Medium* | Medium | Low | Low | 4 |

*NCRI is a political opposition group; data should be cross-referenced

---

## Cross-referencing Strategy

1. **Wikipedia as skeleton** — provides structured index with names, dates, locations ✅
2. **HRANA for Farsi names** — add `name_farsi` field to existing entries
3. **IHR for verification** — confirm or update `status` field
4. **Amnesty for narratives** — enrich `circumstances`, add `responsible_forces`
5. **Hengaw for Kurdish victims** — detailed data for Kurdistan Province
6. **Photos** — HRANA, IranWire, Iran International are best photo sources

---

## Data Licensing & Ethics

- Wikipedia content: CC BY-SA 4.0 (free to use with attribution)
- NGO reports: Generally fair use for memorial/documentation purposes
- Photos: Must verify rights per image (many are family-provided via social media)
- Names of victims: Public record via human rights documentation
- Always attribute sources in each victim YAML file

---

Last updated: 2026-02-09
