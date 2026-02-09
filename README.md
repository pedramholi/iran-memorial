# Iran Memorial — یادبود قربانیان

**A living memorial for the victims of the Islamic Republic of Iran (1979–present)**

This project is dedicated to preserving the memory of every person who lost their life at the hands of the Islamic Republic of Iran. From the earliest executions after the 1979 revolution to the massacres of 2026 — their names, their stories, their dreams must not be forgotten.

---

## Mission | ماموریت

- **Remember every victim by name** — not as a statistic, but as a human being
- **Document their lives** — who they were, what they dreamed of, what they believed in
- **Record how they died** — the circumstances, locations, and responsible forces
- **Track what happened after** — burials, families threatened, graves destroyed
- **Make it visible** — a transparent, searchable, chronological record for the world

## Structure

### Timeline (1979–present)

A chronological record of major events and individual deaths, organized by era:

| Era | Period | Key Events |
|-----|--------|------------|
| Post-Revolution Purges | 1979–1981 | Summary executions of Shah-era officials and dissidents |
| Reign of Terror | 1981–1985 | 7,900+ political prisoners executed |
| Iran-Iraq War Era | 1980–1988 | War casualties, child soldiers, political repression |
| 1988 Massacre | Summer 1988 | 5,000–30,000 political prisoners executed by "Death Commissions" |
| Chain Murders | 1988–1998 | Serial assassinations of intellectuals and dissidents |
| Student Uprising | July 1999 | Dormitory raids, killings, mass arrests |
| Green Movement | 2009 | Post-election protests, Neda Agha-Soltan killed |
| Bloody November | Nov 2019 | 1,500+ killed in less than 5 days |
| Woman, Life, Freedom | Sep 2022 | Mahsa Amini killed; 500+ protesters killed |
| 2026 Massacres | Jan 2026 | Thousands killed in nationwide crackdown |

### Victim Database

Every known victim gets their own page with:

- **Identity**: Name (Farsi + Latin), date of birth, place of birth, photo
- **Life**: Occupation, education, family, dreams, beliefs, personality
- **Death**: Date, location, circumstances, responsible forces, witnesses
- **Aftermath**: Burial location, family persecution, legal proceedings, tributes
- **Sources**: Links to verified reports, news articles, human rights documentation

### Data Format

Victim data is stored as structured YAML files in `/data/victims/` for easy processing:

```
data/
  victims/
    1979/
    1981-1985/
    1988/
    1999/
    2009/
    2019/
    2022/
    2026/
  events/
    timeline.yaml
  sources/
    organizations.yaml
```

## Tech Stack (Planned)

- **Data**: YAML files → processed into a searchable database
- **Website**: Static site generator (Astro/Next.js) for individual victim pages
- **Search**: Full-text search across all victims and events
- **Timeline**: Interactive chronological visualization
- **Maps**: Geographic visualization of events and burial sites
- **i18n**: Farsi (primary), English, German

## Contributing

This is an open-source project. We need:

- **Researchers**: To verify and document victim information
- **Translators**: Farsi, English, German, Arabic, Kurdish
- **Developers**: Frontend, data processing, search
- **Designers**: UI/UX for the memorial and timeline
- **Human rights organizations**: For verified data partnerships

## Ethics & Principles

- Every entry must be **verified** by at least one credible source
- We treat every victim with **dignity and respect**
- Family privacy is **paramount** — sensitive details only with consent
- This is a **non-partisan** memorial — all victims deserve remembrance
- No political agenda beyond **truth and accountability**

## Data Sources

- [Amnesty International](https://www.amnesty.org/)
- [Human Rights Watch](https://www.hrw.org/)
- [Iran Human Rights (IHR)](https://iranhr.net/)
- [Human Rights Activists News Agency (HRANA)](https://www.hra-news.org/)
- [Boroumand Foundation](https://www.iranrights.org/)
- [Center for Human Rights in Iran](https://iranhumanrights.org/)
- [Justice for Iran](https://justiceforiran.org/)

## License

This project is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — share and adapt with attribution.

---

> *"Those who cannot remember the past are condemned to repeat it."*
> — George Santayana

> *«کسانی که نمی‌توانند گذشته را به یاد آورند، محکوم به تکرار آن هستند.»*

---

**Repository**: [github.com/pedramholi/iran-memorial](https://github.com/pedramholi/iran-memorial)
