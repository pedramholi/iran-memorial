import { prisma } from "./db";
import type { Locale } from "@/i18n/config";

export async function getVictimBySlug(slug: string) {
  return prisma.victim.findUnique({
    where: { slug },
    include: {
      event: true,
      sources: true,
    },
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      victims: {
        orderBy: { dateOfDeath: "asc" },
      },
      sources: true,
    },
  });
}

export async function getAllEvents() {
  return prisma.event.findMany({
    orderBy: { dateStart: "asc" },
    include: {
      _count: {
        select: { victims: true },
      },
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
  const minYear = yearRange[0]?.min_year ?? 1988;
  const maxYear = yearRange[0]?.max_year ?? new Date().getFullYear();

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

  const where: any = {};

  if (province) where.province = province;
  if (gender) where.gender = gender;
  if (year) {
    where.dateOfDeath = {
      gte: new Date(`${year}-01-01`),
      lte: new Date(`${year}-12-31`),
    };
  }

  const [victims, total] = await Promise.all([
    prisma.victim.findMany({
      where,
      orderBy: { dateOfDeath: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.victim.count({ where }),
  ]);

  return { victims, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

async function searchVictimsList(params: {
  page: number;
  pageSize: number;
  province?: string;
  year?: number;
  gender?: string;
  search: string;
}) {
  const { page, pageSize, province, year, gender, search } = params;

  // Build tsquery: split words, join with &, add prefix matching
  const tsQuery = search
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(" & ");

  // Build WHERE clauses for filters
  const filterClauses: string[] = [];
  const filterValues: any[] = [tsQuery, search];

  let paramIdx = 3;

  if (province) {
    filterClauses.push(`v.province = $${paramIdx}`);
    filterValues.push(province);
    paramIdx++;
  }
  if (gender) {
    filterClauses.push(`v.gender = $${paramIdx}`);
    filterValues.push(gender);
    paramIdx++;
  }
  if (year) {
    filterClauses.push(`v.date_of_death >= $${paramIdx}::date AND v.date_of_death <= $${paramIdx + 1}::date`);
    filterValues.push(`${year}-01-01`, `${year}-12-31`);
    paramIdx += 2;
  }

  const filterSQL = filterClauses.length > 0 ? `AND ${filterClauses.join(" AND ")}` : "";

  // Use tsvector match + trigram similarity as fallback ranking
  const query = `
    SELECT v.*,
      ts_rank(v.search_vector, to_tsquery('simple', $1)) AS ts_score,
      GREATEST(
        similarity(v.name_latin, $2),
        similarity(coalesce(v.name_farsi, ''), $2),
        similarity(coalesce(v.place_of_death, ''), $2)
      ) AS trgm_score
    FROM victims v
    WHERE (
      v.search_vector @@ to_tsquery('simple', $1)
      OR similarity(v.name_latin, $2) > 0.15
      OR similarity(coalesce(v.name_farsi, ''), $2) > 0.15
      OR similarity(coalesce(v.place_of_death, ''), $2) > 0.15
    )
    ${filterSQL}
    ORDER BY ts_score DESC, trgm_score DESC
    LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM victims v
    WHERE (
      v.search_vector @@ to_tsquery('simple', $1)
      OR similarity(v.name_latin, $2) > 0.15
      OR similarity(coalesce(v.name_farsi, ''), $2) > 0.15
      OR similarity(coalesce(v.place_of_death, ''), $2) > 0.15
    )
    ${filterSQL}
  `;

  const [victims, countResult] = await Promise.all([
    prisma.$queryRawUnsafe(query, ...filterValues),
    prisma.$queryRawUnsafe<{ total: number }[]>(countQuery, ...filterValues),
  ]);

  const total = (countResult as any[])[0]?.total ?? 0;

  return {
    victims: mapRawVictims(victims as any[]),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function searchVictims(query: string, limit = 20) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Build tsquery with prefix matching
  const tsQuery = trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(" & ");

  const results = await prisma.$queryRawUnsafe<any[]>(
    `
    SELECT v.*,
      ts_rank(v.search_vector, to_tsquery('simple', $1)) AS ts_score,
      GREATEST(
        similarity(v.name_latin, $2),
        similarity(coalesce(v.name_farsi, ''), $2),
        similarity(coalesce(v.place_of_death, ''), $2)
      ) AS trgm_score
    FROM victims v
    WHERE (
      v.search_vector @@ to_tsquery('simple', $1)
      OR similarity(v.name_latin, $2) > 0.15
      OR similarity(coalesce(v.name_farsi, ''), $2) > 0.15
      OR similarity(coalesce(v.place_of_death, ''), $2) > 0.15
    )
    ORDER BY ts_score DESC, trgm_score DESC
    LIMIT $3
    `,
    tsQuery,
    trimmed,
    limit
  );

  return mapRawVictims(results);
}

/** Map snake_case raw SQL rows to camelCase Prisma-style objects */
function mapRawVictims(rows: any[]) {
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
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

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
