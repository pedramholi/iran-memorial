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

export async function getVictimsList(params: {
  page?: number;
  pageSize?: number;
  province?: string;
  year?: number;
  gender?: string;
  search?: string;
}) {
  const { page = 1, pageSize = 24, province, year, gender, search } = params;

  const where: any = {};

  if (province) where.province = province;
  if (gender) where.gender = gender;
  if (year) {
    where.dateOfDeath = {
      gte: new Date(`${year}-01-01`),
      lte: new Date(`${year}-12-31`),
    };
  }
  if (search) {
    where.OR = [
      { nameLatin: { contains: search, mode: "insensitive" } },
      { nameFarsi: { contains: search } },
      { placeOfDeath: { contains: search, mode: "insensitive" } },
      { aliases: { has: search } },
    ];
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

export async function searchVictims(query: string, limit = 20) {
  return prisma.victim.findMany({
    where: {
      OR: [
        { nameLatin: { contains: query, mode: "insensitive" } },
        { nameFarsi: { contains: query } },
        { placeOfDeath: { contains: query, mode: "insensitive" } },
        { province: { contains: query, mode: "insensitive" } },
        { aliases: { has: query } },
      ],
    },
    take: limit,
    orderBy: { nameLatin: "asc" },
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
