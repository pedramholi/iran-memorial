/**
 * Static fallback data for when PostgreSQL is not available.
 * Uses real data from YAML seed files to show representative content.
 */

export const fallbackStats = {
  victimCount: 31203,
  eventCount: 12,
  sourceCount: 29000,
  yearsOfRepression: new Date().getFullYear() - 1979,
};

export const fallbackEvents = [
  {
    slug: "revolution-1979",
    titleEn: "Islamic Revolution",
    titleFa: "انقلاب اسلامی",
    titleDe: "Islamische Revolution",
    descriptionEn:
      "The Iranian Revolution overthrew the Pahlavi dynasty. Ayatollah Ruhollah Khomeini established the Islamic Republic, which immediately began consolidating power through systematic repression.",
    descriptionFa: null,
    descriptionDe:
      "Die Iranische Revolution stürzte die Pahlavi-Dynastie. Ayatollah Chomeini errichtete die Islamische Republik, die sofort begann, ihre Macht durch systematische Unterdrückung zu festigen.",
    dateStart: "1979-02-11",
    dateEnd: null,
    estimatedKilledLow: 2000,
    estimatedKilledHigh: 3000,
    tags: ["revolution", "regime-change"],
    _count: { victims: 0 },
  },
  {
    slug: "post-revolution-executions",
    titleEn: "Post-Revolution Summary Executions",
    titleFa: "اعدام‌های پس از انقلاب",
    titleDe: "Hinrichtungen nach der Revolution",
    descriptionEn:
      "Mass summary executions of former Shah officials, military officers, and perceived enemies of the revolution. Trials lasted minutes. Sadegh Khalkhali, known as the 'Hanging Judge,' oversaw many executions.",
    descriptionFa: null,
    descriptionDe:
      "Standrechtliche Massenhinrichtungen ehemaliger Beamter des Schahs, Militäroffiziere und vermeintlicher Feinde der Revolution. Verhandlungen dauerten Minuten. Sadegh Chalchali, der ‚Hängerichter', leitete viele Hinrichtungen.",
    dateStart: "1979-02-15",
    dateEnd: "1979-12-31",
    estimatedKilledLow: 700,
    estimatedKilledHigh: 12000,
    tags: ["executions", "political-prisoners"],
    _count: { victims: 0 },
  },
  {
    slug: "iran-iraq-war",
    titleEn: "Iran-Iraq War",
    titleFa: "جنگ ایران و عراق",
    titleDe: "Iran-Irak-Krieg",
    descriptionEn:
      "Eight-year war with Iraq. The regime sent waves of poorly equipped soldiers, including child soldiers (basiji), to the front. Children as young as 12 were given plastic 'keys to paradise' and sent to clear minefields.",
    descriptionFa: null,
    descriptionDe:
      "Achtjähriger Krieg mit dem Irak. Das Regime schickte Wellen schlecht ausgerüsteter Soldaten, darunter Kindersoldaten (Basidschi), an die Front. Kinder ab 12 Jahren erhielten ‚Schlüssel zum Paradies' und wurden zum Minenräumen geschickt.",
    dateStart: "1980-09-22",
    dateEnd: "1988-08-20",
    estimatedKilledLow: 200000,
    estimatedKilledHigh: 600000,
    tags: ["war", "child-soldiers"],
    _count: { victims: 0 },
  },
  {
    slug: "reign-of-terror-1981-1985",
    titleEn: "Reign of Terror (1981–1985)",
    titleFa: "سلطه وحشت",
    titleDe: "Schreckensherrschaft (1981–1985)",
    descriptionEn:
      "Following the power struggle with the MEK and other opposition groups, the regime launched a campaign of mass executions. Over 7,900 political prisoners were executed in this period.",
    descriptionFa: null,
    descriptionDe:
      "Nach dem Machtkampf mit der MEK und anderen Oppositionsgruppen startete das Regime eine Kampagne von Massenhinrichtungen. Über 7.900 politische Gefangene wurden in dieser Zeit hingerichtet.",
    dateStart: "1981-06-20",
    dateEnd: "1985-12-31",
    estimatedKilledLow: 8000,
    estimatedKilledHigh: 12000,
    tags: ["executions", "political-prisoners", "mass-killing"],
    _count: { victims: 0 },
  },
  {
    slug: "chain-murders",
    titleEn: "Chain Murders of Intellectuals",
    titleFa: "قتل‌های زنجیره‌ای",
    titleDe: "Kettenmorde an Intellektuellen",
    descriptionEn:
      "Systematic assassination of Iranian dissident intellectuals, writers, poets, and political activists by agents of the Ministry of Intelligence.",
    descriptionFa: null,
    descriptionDe:
      "Systematische Ermordung iranischer Dissidenten, Intellektueller, Schriftsteller, Dichter und politischer Aktivisten durch Agenten des Geheimdienstministeriums.",
    dateStart: "1988-01-01",
    dateEnd: "1998-12-31",
    estimatedKilledLow: 80,
    estimatedKilledHigh: 300,
    tags: ["assassinations", "intellectuals", "writers"],
    _count: { victims: 0 },
  },
  {
    slug: "massacre-1988",
    titleEn: "1988 Prison Massacres",
    titleFa: "کشتار ۶۷",
    titleDe: "Gefängnismassaker 1988",
    descriptionEn:
      "On Khomeini's orders, 'Death Commissions' were formed across Iran. Political prisoners were brought before three-member panels and asked if they renounced their beliefs. Those who refused were executed — often within hours.",
    descriptionFa: null,
    descriptionDe:
      "Auf Chomeinis Befehl wurden im ganzen Iran ‚Todeskommissionen' gebildet. Politische Gefangene wurden vor dreiköpfige Gremien gebracht und gefragt, ob sie ihrem Glauben abschwören. Wer sich weigerte, wurde hingerichtet — oft innerhalb von Stunden.",
    dateStart: "1988-07-19",
    dateEnd: "1988-12-31",
    estimatedKilledLow: 5000,
    estimatedKilledHigh: 30000,
    tags: ["massacre", "political-prisoners", "genocide", "mass-graves"],
    _count: { victims: 0 },
  },
  {
    slug: "student-protests-1999",
    titleEn: "1999 Student Protests (18 Tir)",
    titleFa: "۱۸ تیر ۱۳۷۸",
    titleDe: "Studentenproteste 1999 (18. Tir)",
    descriptionEn:
      "Peaceful student protests against newspaper closures were met with violent raids on Tehran University dormitories by Basij and Ansar-e Hezbollah.",
    descriptionFa: null,
    descriptionDe:
      "Friedliche Studentenproteste gegen Zeitungsschließungen wurden mit gewaltsamen Überfällen auf Wohnheime der Universität Teheran durch Basidsch und Ansar-e Hisbollah beantwortet.",
    dateStart: "1999-07-08",
    dateEnd: "1999-07-13",
    estimatedKilledLow: 10,
    estimatedKilledHigh: 17,
    tags: ["students", "protests", "university"],
    _count: { victims: 0 },
  },
  {
    slug: "green-movement-2009",
    titleEn: "Green Movement",
    titleFa: "جنبش سبز",
    titleDe: "Grüne Bewegung",
    descriptionEn:
      "Millions protested the disputed re-election of Mahmoud Ahmadinejad. Security forces killed dozens, including Neda Agha-Soltan, whose death was filmed and shared worldwide.",
    descriptionFa: null,
    descriptionDe:
      "Millionen protestierten gegen die umstrittene Wiederwahl von Mahmud Ahmadinedschad. Sicherheitskräfte töteten Dutzende, darunter Neda Agha-Soltan, deren Tod gefilmt und weltweit geteilt wurde.",
    dateStart: "2009-06-13",
    dateEnd: "2010-02-11",
    estimatedKilledLow: 100,
    estimatedKilledHigh: 200,
    tags: ["protests", "election-fraud", "green-movement"],
    _count: { victims: 0 },
  },
  {
    slug: "bloody-november-2019",
    titleEn: "Bloody November (Aban 98)",
    titleFa: "آبان خونین",
    titleDe: "Blutiger November (Aban 98)",
    descriptionEn:
      "Protests triggered by fuel price hikes were crushed in less than five days with live ammunition. The internet was shut down nationwide for six days. Most victims were young people from working-class neighborhoods.",
    descriptionFa: null,
    descriptionDe:
      "Proteste ausgelöst durch Benzinpreiserhöhungen wurden in weniger als fünf Tagen mit scharfer Munition niedergeschlagen. Das Internet wurde landesweit für sechs Tage abgeschaltet. Die meisten Opfer waren junge Menschen aus Arbeitervierteln.",
    dateStart: "2019-11-15",
    dateEnd: "2019-11-19",
    estimatedKilledLow: 1500,
    estimatedKilledHigh: 3000,
    tags: ["massacre", "protests", "internet-shutdown"],
    _count: { victims: 0 },
  },
  {
    slug: "woman-life-freedom-2022",
    titleEn: "Woman, Life, Freedom Movement",
    titleFa: "زن، زندگی، آزادی",
    titleDe: "Frau, Leben, Freiheit",
    descriptionEn:
      "The death of 22-year-old Mahsa (Zhina) Amini in morality police custody sparked the largest protests since 1979. The UN found crimes against humanity including murder, torture, rape, and sexual violence.",
    descriptionFa: null,
    descriptionDe:
      "Der Tod der 22-jährigen Mahsa (Zhina) Amini im Gewahrsam der Sittenpolizei löste die größten Proteste seit 1979 aus. Die UN stellten Verbrechen gegen die Menschlichkeit fest, darunter Mord, Folter, Vergewaltigung und sexuelle Gewalt.",
    dateStart: "2022-09-16",
    dateEnd: "2023-03-01",
    estimatedKilledLow: 551,
    estimatedKilledHigh: 1500,
    tags: ["protests", "women-rights", "children", "crimes-against-humanity"],
    _count: { victims: 0 },
  },
  {
    slug: "massacres-2026",
    titleEn: "2026 Massacres",
    titleFa: "کشتار ۱۴۰۴",
    titleDe: "Massaker 2026",
    descriptionEn:
      "Nationwide protests met with the deadliest crackdown since 1979. Security forces used live ammunition against protesters across 31 provinces and 110 cities. At least 153 identified children among the dead.",
    descriptionFa: null,
    descriptionDe:
      "Landesweite Proteste trafen auf die tödlichste Niederschlagung seit 1979. Sicherheitskräfte setzten scharfe Munition gegen Demonstranten in 31 Provinzen und 110 Städten ein. Mindestens 153 identifizierte Kinder unter den Toten.",
    dateStart: "2026-01-05",
    dateEnd: null,
    estimatedKilledLow: 35000,
    estimatedKilledHigh: 40000,
    tags: ["massacre", "protests", "children", "internet-shutdown"],
    _count: { victims: 0 },
  },
];

export const fallbackRecentVictims = [
  {
    slug: "amini-mahsa-2000",
    nameLatin: "Mahsa Amini",
    nameFarsi: "مهسا امینی",
    dateOfDeath: "2022-09-16",
    placeOfDeath: "Kasra Hospital, Tehran",
    causeOfDeath: "Head injuries sustained in morality police custody",
    photoUrl: null,
  },
  {
    slug: "agha-soltan-neda-1983",
    nameLatin: "Neda Agha-Soltan",
    nameFarsi: "ندا آقاسلطان",
    dateOfDeath: "2009-06-20",
    placeOfDeath: "Kargar Avenue, Tehran",
    causeOfDeath: "Gunshot wound to the chest",
    photoUrl: null,
  },
  {
    slug: "aminian-rubina-2003",
    nameLatin: "Rubina Aminian",
    nameFarsi: "روبینا امینیان",
    dateOfDeath: "2026-01-08",
    placeOfDeath: "Tehran",
    causeOfDeath: "Shot in the head from close range from behind",
    photoUrl: null,
  },
  {
    slug: "fallahpour-shahab-2007",
    nameLatin: "Shahab Fallahpour",
    nameFarsi: "شهاب فلاح‌پور",
    dateOfDeath: "2026-01-09",
    placeOfDeath: "Andimeshk",
    causeOfDeath: "Sniper fire from rooftop",
    photoUrl: null,
  },
  {
    slug: "zareh-gholamreza",
    nameLatin: "Gholamreza Zareh",
    nameFarsi: "غلامرضا زارع",
    dateOfDeath: "2026-01-08",
    placeOfDeath: "Shiraz",
    causeOfDeath: "Killed during protests",
    photoUrl: null,
  },
  {
    slug: "kazemi-maryam-1965",
    nameLatin: "Maryam Golestani-Kazemi",
    nameFarsi: "مریم گلستانی کاظمی",
    dateOfDeath: "1988-08-01",
    placeOfDeath: "Evin Prison, Tehran",
    causeOfDeath: "Execution by hanging",
    photoUrl: null,
  },
];

export const fallbackVictimsList = {
  victims: fallbackRecentVictims,
  total: 31203,
  page: 1,
  pageSize: 24,
  totalPages: Math.ceil(31203 / 24),
};
