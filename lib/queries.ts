import { prisma } from "./db";
import { Prisma } from "@prisma/client";
import type { Locale } from "@/i18n/config";

const VICTIM_COLUMNS = `
  v.id, v.slug, v.name_latin, v.name_farsi, v.aliases,
  v.date_of_birth, v.place_of_birth, v.gender, v.ethnicity, v.religion, v.photo_url,
  v.occupation_en, v.occupation_fa, v.education, v.family_info,
  v.dreams_en, v.dreams_fa, v.beliefs_en, v.beliefs_fa,
  v.personality_en, v.personality_fa, v.quotes,
  v.date_of_death, v.age_at_death, v.place_of_death, v.province,
  v.cause_of_death, v.circumstances_en, v.circumstances_fa,
  v.event_id, v.event_context, v.responsible_forces, v.witnesses, v.last_seen,
  v.burial_location, v.burial_date, v.burial_circumstances_en, v.burial_circumstances_fa,
  v.grave_status, v.family_persecution_en, v.family_persecution_fa,
  v.legal_proceedings, v.tributes,
  v.verification_status, v.data_source, v.notes, v.created_at, v.updated_at
`.trim();

export async function getVictimBySlug(slug: string) {
  return prisma.victim.findUnique({
    where: { slug },
    include: {
      event: true,
      sources: true,
      photos: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
    },
  });
}

export async function getEventBySlug(slug: string, page = 1, pageSize = 50) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      victims: {
        select: {
          slug: true,
          nameLatin: true,
          nameFarsi: true,
          dateOfDeath: true,
          placeOfDeath: true,
          causeOfDeath: true,
          photoUrl: true,
        },
        orderBy: { dateOfDeath: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      },
      sources: true,
      photos: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      _count: { select: { victims: true } },
    },
  });
  if (!event) return null;
  const totalVictims = event._count.victims;
  return {
    ...event,
    totalVictims,
    totalPages: Math.ceil(totalVictims / pageSize),
    page,
  };
}

export async function getAllEvents() {
  return prisma.event.findMany({
    orderBy: { dateStart: "asc" },
    include: {
      _count: {
        select: { victims: true },
      },
      photos: { where: { isPrimary: true }, take: 1 },
    },
  });
}

export async function getFilterOptions() {
  const [provinceRows, yearRange] = await Promise.all([
    prisma.$queryRaw<{ province: string }[]>`
      SELECT DISTINCT province FROM victims
      WHERE province IS NOT NULL AND province != ''
      ORDER BY province
    `,
    prisma.$queryRaw<{ min_year: number; max_year: number }[]>`
      SELECT
        EXTRACT(YEAR FROM MIN(date_of_death))::int AS min_year,
        EXTRACT(YEAR FROM MAX(date_of_death))::int AS max_year
      FROM victims
      WHERE date_of_death IS NOT NULL
    `,
  ]);

  const provinces = provinceRows.map((r) => r.province);
  const minYear = Number(yearRange[0]?.min_year) || 1988;
  const maxYear = Number(yearRange[0]?.max_year) || new Date().getFullYear();

  return { provinces, minYear, maxYear };
}

export async function getVictimsList(params: {
  page?: number;
  pageSize?: number;
  province?: string;
  year?: number;
  gender?: string;
  search?: string;
}) {
  const { page = 1, pageSize = 24, province, year, gender, search } = params;

  // If we have a search query, use raw SQL for tsvector + trigram
  if (search && search.trim()) {
    return searchVictimsList({ page, pageSize, province, year, gender, search: search.trim() });
  }

  const where: Prisma.VictimWhereInput = {};

  if (province) where.province = province;
  if (gender) where.gender = gender;
  if (year) {
    where.dateOfDeath = {
      gte: new Date(`${year}-01-01`),
      lte: new Date(`${year}-12-31`),
    };
  }

  // Use raw SQL to sort photos-first
  const safePageSize = Math.min(100, Math.max(1, Math.floor(Number(pageSize) || 24)));
  const safePage = Math.max(1, Math.floor(Number(page) || 1));
  const safeOffset = (safePage - 1) * safePageSize;
  const filterFrag = buildFilterFragment({ province, year, gender });
  const columns = Prisma.raw(VICTIM_COLUMNS);

  const [victims, countResult] = await Promise.all([
    prisma.$queryRaw<any[]>`
      SELECT ${columns}
      FROM victims v
      WHERE 1=1 ${filterFrag}
      ORDER BY (v.photo_url IS NOT NULL) DESC, v.date_of_death DESC NULLS LAST
      LIMIT ${safePageSize} OFFSET ${safeOffset}
    `,
    prisma.$queryRaw<{ total: number }[]>`
      SELECT COUNT(*)::int AS total FROM victims v WHERE 1=1 ${filterFrag}
    `,
  ]);

  const total = Number(countResult[0]?.total) || 0;
  return { victims: mapRawVictims(victims), total, page: safePage, pageSize: safePageSize, totalPages: Math.ceil(total / safePageSize) };
}

/** Build safe parameterized filter fragment for raw SQL */
function buildFilterFragment(params: { province?: string; year?: number; gender?: string }): Prisma.Sql {
  const clauses: Prisma.Sql[] = [];

  if (params.province && typeof params.province === "string") {
    clauses.push(Prisma.sql`v.province = ${params.province}`);
  }
  if (params.gender && typeof params.gender === "string") {
    // Whitelist valid genders
    const valid = ["male", "female", "unknown"];
    if (valid.includes(params.gender.toLowerCase())) {
      clauses.push(Prisma.sql`v.gender = ${params.gender}`);
    }
  }
  if (params.year && Number.isInteger(params.year) && params.year >= 1900 && params.year <= 2100) {
    const yearStart = `${params.year}-01-01`;
    const yearEnd = `${params.year}-12-31`;
    clauses.push(Prisma.sql`v.date_of_death >= ${yearStart}::date AND v.date_of_death <= ${yearEnd}::date`);
  }

  if (clauses.length === 0) return Prisma.empty;
  return Prisma.sql`AND ${Prisma.join(clauses, " AND ")}`;
}

async function searchVictimsList(params: {
  page: number;
  pageSize: number;
  province?: string;
  year?: number;
  gender?: string;
  search: string;
}) {
  const { page, province, year, gender, search } = params;
  // Sanitize pagination
  const safePageSize = Math.min(100, Math.max(1, Math.floor(Number(params.pageSize) || 24)));
  const safePage = Math.max(1, Math.floor(Number(page) || 1));
  const safeOffset = (safePage - 1) * safePageSize;
  const MIN_TSVECTOR_RESULTS = 5;

  // Sanitize search: limit length, strip control characters
  const cleanSearch = search.slice(0, 200).replace(/[^\p{L}\p{N}\s\-'.]/gu, "");
  if (!cleanSearch.trim()) return { victims: [], total: 0, page: safePage, pageSize: safePageSize, totalPages: 0 };

  // Build tsquery: split words, join with &, add prefix matching
  const tsQuery = cleanSearch
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(" & ");

  const filterFrag = buildFilterFragment({ province, year, gender });
  const columns = Prisma.raw(VICTIM_COLUMNS);

  // Step 1: Fast tsvector search (uses GIN index, ~1ms)
  const tsResults = await prisma.$queryRaw<any[]>`
    SELECT ${columns},
      ts_rank(v.search_vector, to_tsquery('simple', ${tsQuery})) AS ts_score
    FROM victims v
    WHERE v.search_vector @@ to_tsquery('simple', ${tsQuery})
    ${filterFrag}
    ORDER BY ts_score DESC
    LIMIT ${safePageSize} OFFSET ${safeOffset}
  `;

  const tsCount = await prisma.$queryRaw<{ total: number }[]>`
    SELECT COUNT(*)::int AS total FROM victims v
    WHERE v.search_vector @@ to_tsquery('simple', ${tsQuery}) ${filterFrag}
  `;

  const tsTotal = Number(tsCount[0]?.total) || 0;

  // Step 2: If tsvector found enough results, return them
  if (tsTotal >= MIN_TSVECTOR_RESULTS) {
    return {
      victims: mapRawVictims(tsResults),
      total: tsTotal,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.ceil(tsTotal / safePageSize),
    };
  }

  // Step 3: Trigram fallback for fuzzy/typo matches (slower, ~50ms)
  const [victims, countResult] = await Promise.all([
    prisma.$queryRaw<any[]>`
      SELECT ${columns},
        ts_rank(v.search_vector, to_tsquery('simple', ${tsQuery})) AS ts_score,
        GREATEST(
          similarity(v.name_latin, ${cleanSearch}),
          similarity(coalesce(v.name_farsi, ''), ${cleanSearch})
        ) AS trgm_score
      FROM victims v
      WHERE v.search_vector @@ to_tsquery('simple', ${tsQuery})
        OR similarity(v.name_latin, ${cleanSearch}) > 0.15
        OR similarity(coalesce(v.name_farsi, ''), ${cleanSearch}) > 0.15
      ${filterFrag}
      ORDER BY ts_score DESC, trgm_score DESC
      LIMIT ${safePageSize} OFFSET ${safeOffset}
    `,
    prisma.$queryRaw<{ total: number }[]>`
      SELECT COUNT(*)::int AS total FROM victims v
      WHERE v.search_vector @@ to_tsquery('simple', ${tsQuery})
        OR similarity(v.name_latin, ${cleanSearch}) > 0.15
        OR similarity(coalesce(v.name_farsi, ''), ${cleanSearch}) > 0.15
      ${filterFrag}
    `,
  ]);

  const total = Number(countResult[0]?.total) || 0;

  return {
    victims: mapRawVictims(victims),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  };
}

export async function searchVictims(query: string, limit = 20) {
  // Sanitize: limit length, strip control characters
  const trimmed = query.trim().slice(0, 200).replace(/[^\p{L}\p{N}\s\-'.]/gu, "");
  if (!trimmed) return [];

  const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit) || 20)));
  const MIN_TSVECTOR_RESULTS = 5;
  const columns = Prisma.raw(VICTIM_COLUMNS);

  // Build tsquery with prefix matching
  const tsQuery = trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(" & ");

  // Step 1: Fast tsvector search (~1ms with GIN index)
  const tsResults = await prisma.$queryRaw<any[]>`
    SELECT ${columns},
      ts_rank(v.search_vector, to_tsquery('simple', ${tsQuery})) AS ts_score
    FROM victims v
    WHERE v.search_vector @@ to_tsquery('simple', ${tsQuery})
    ORDER BY ts_score DESC
    LIMIT ${safeLimit}
  `;

  if (tsResults.length >= MIN_TSVECTOR_RESULTS) {
    return mapRawVictims(tsResults);
  }

  // Step 2: Trigram fallback for fuzzy/typo matches
  const results = await prisma.$queryRaw<any[]>`
    SELECT ${columns},
      ts_rank(v.search_vector, to_tsquery('simple', ${tsQuery})) AS ts_score,
      GREATEST(
        similarity(v.name_latin, ${trimmed}),
        similarity(coalesce(v.name_farsi, ''), ${trimmed})
      ) AS trgm_score
    FROM victims v
    WHERE v.search_vector @@ to_tsquery('simple', ${tsQuery})
      OR similarity(v.name_latin, ${trimmed}) > 0.15
      OR similarity(coalesce(v.name_farsi, ''), ${trimmed}) > 0.15
    ORDER BY ts_score DESC, trgm_score DESC
    LIMIT ${safeLimit}
  `;

  return mapRawVictims(results);
}

/** Map snake_case raw SQL rows to camelCase Prisma-style objects */
export function mapRawVictims(rows: any[]) {
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameLatin: r.name_latin,
    nameFarsi: r.name_farsi,
    aliases: r.aliases,
    dateOfBirth: r.date_of_birth,
    placeOfBirth: r.place_of_birth,
    gender: r.gender,
    ethnicity: r.ethnicity,
    religion: r.religion,
    photoUrl: r.photo_url,
    occupationEn: r.occupation_en,
    occupationFa: r.occupation_fa,
    education: r.education,
    familyInfo: r.family_info,
    dreamsEn: r.dreams_en,
    dreamsFa: r.dreams_fa,
    beliefsEn: r.beliefs_en,
    beliefsFa: r.beliefs_fa,
    personalityEn: r.personality_en,
    personalityFa: r.personality_fa,
    quotes: r.quotes,
    dateOfDeath: r.date_of_death,
    ageAtDeath: r.age_at_death,
    placeOfDeath: r.place_of_death,
    province: r.province,
    causeOfDeath: r.cause_of_death,
    circumstancesEn: r.circumstances_en,
    circumstancesFa: r.circumstances_fa,
    eventId: r.event_id,
    eventContext: r.event_context,
    responsibleForces: r.responsible_forces,
    witnesses: r.witnesses,
    lastSeen: r.last_seen,
    burialLocation: r.burial_location,
    burialDate: r.burial_date,
    burialCircumstancesEn: r.burial_circumstances_en,
    burialCircumstancesFa: r.burial_circumstances_fa,
    graveStatus: r.grave_status,
    familyPersecutionEn: r.family_persecution_en,
    familyPersecutionFa: r.family_persecution_fa,
    legalProceedings: r.legal_proceedings,
    tributes: r.tributes,
    verificationStatus: r.verification_status,
    dataSource: r.data_source,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function getStats() {
  const [victimCount, eventCount, sourceCount] = await Promise.all([
    prisma.victim.count(),
    prisma.event.count(),
    prisma.source.count(),
  ]);

  return {
    victimCount,
    eventCount,
    sourceCount,
    yearsOfRepression: new Date().getFullYear() - 1979,
  };
}

export async function getRecentVictims(limit = 6) {
  return prisma.victim.findMany({
    select: {
      slug: true,
      nameLatin: true,
      nameFarsi: true,
      dateOfDeath: true,
      placeOfDeath: true,
      causeOfDeath: true,
      photoUrl: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getStatistics() {
  const [
    totalVictims,
    deathsByYear,
    deathsByProvince,
    deathsByCause,
    ageDistribution,
    genderBreakdown,
    dataSources,
    verifiedCount,
  ] = await Promise.all([
    prisma.victim.count(),

    prisma.$queryRaw<{ year: number; count: number }[]>`
      SELECT EXTRACT(YEAR FROM date_of_death)::int AS year, COUNT(*)::int AS count
      FROM victims WHERE date_of_death IS NOT NULL
      GROUP BY year ORDER BY year
    `,

    prisma.$queryRaw<{ province: string; count: number }[]>`
      SELECT province, COUNT(*)::int AS count
      FROM victims WHERE province IS NOT NULL AND province != ''
      GROUP BY province ORDER BY count DESC LIMIT 15
    `,

    prisma.$queryRaw<{ cause: string; count: number }[]>`
      SELECT cause_of_death AS cause, COUNT(*)::int AS count
      FROM victims WHERE cause_of_death IS NOT NULL AND cause_of_death != ''
      GROUP BY cause_of_death ORDER BY count DESC LIMIT 10
    `,

    prisma.$queryRaw<{ bucket: string; count: number }[]>`
      SELECT
        CASE
          WHEN age_at_death < 18 THEN 'Under 18'
          WHEN age_at_death BETWEEN 18 AND 25 THEN '18-25'
          WHEN age_at_death BETWEEN 26 AND 35 THEN '26-35'
          WHEN age_at_death BETWEEN 36 AND 50 THEN '36-50'
          WHEN age_at_death > 50 THEN 'Over 50'
        END AS bucket, COUNT(*)::int AS count
      FROM victims WHERE age_at_death IS NOT NULL
      GROUP BY bucket ORDER BY MIN(age_at_death)
    `,

    prisma.$queryRaw<{ gender: string; count: number }[]>`
      SELECT COALESCE(gender, 'unknown') AS gender, COUNT(*)::int AS count
      FROM victims GROUP BY gender ORDER BY count DESC
    `,

    prisma.$queryRaw<{ source: string; count: number }[]>`
      SELECT data_source AS source, COUNT(*)::int AS count
      FROM victims WHERE data_source IS NOT NULL
      GROUP BY data_source ORDER BY count DESC
    `,

    prisma.victim.count({ where: { verificationStatus: "verified" } }),
  ]);

  const yearMap = new Map(deathsByYear.map((r) => [Number(r.year), Number(r.count)]));
  const years = [...yearMap.keys()].filter(Boolean);
  const minYear = years.length > 0 ? Math.min(...years) : 0;
  const maxYear = years.length > 0 ? Math.max(...years) : 0;
  const fullYears: { year: number; count: number }[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    fullYears.push({ year: y, count: yearMap.get(y) || 0 });
  }
  const provinceCount = new Set(
    deathsByProvince.map((r) => r.province)
  ).size;

  return {
    totalVictims,
    deathsByYear: fullYears,
    deathsByProvince: deathsByProvince.map((r) => ({ label: r.province, count: Number(r.count) })),
    deathsByCause: deathsByCause.map((r) => ({ label: r.cause, count: Number(r.count) })),
    ageDistribution: ageDistribution.map((r) => ({ label: r.bucket, count: Number(r.count) })),
    genderBreakdown: genderBreakdown.map((r) => ({ label: r.gender, count: Number(r.count) })),
    dataSources: dataSources.map((r) => ({ label: r.source, count: Number(r.count) })),
    verifiedCount,
    yearsCovered: years.length > 0 ? `${Math.min(...years)}–${Math.max(...years)}` : "–",
    provincesAffected: provinceCount,
  };
}

export type Statistics = Awaited<ReturnType<typeof getStatistics>>;
export type VictimDetail = NonNullable<Awaited<ReturnType<typeof getVictimBySlug>>>;
export type EventDetail = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;
export type EventWithCount = Awaited<ReturnType<typeof getAllEvents>>[number];
export type VictimListItem = Awaited<ReturnType<typeof getRecentVictims>>[number];
export type PhotoItem = VictimDetail["photos"][number];
export type StatsResult = Awaited<ReturnType<typeof getStats>>;

// Helper to get localized field
export function localized<T extends Record<string, any>>(
  item: T,
  field: string,
  locale: Locale
): string | null {
  const suffixMap: Record<Locale, string> = { en: "En", fa: "Fa", de: "De" };
  const localizedKey = `${field}${suffixMap[locale]}`;
  const fallbackKey = `${field}En`;

  return (item[localizedKey] as string) || (item[fallbackKey] as string) || null;
}
