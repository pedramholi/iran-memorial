import { prisma } from "@/lib/db";
import type { MetadataRoute } from "next";

const BASE_URL = "https://memorial.n8ncloud.de";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [victims, events] = await Promise.all([
    prisma.victim.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.event.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const locales = ["fa", "en", "de"];
  const staticPages = [
    "",
    "/victims",
    "/events",
    "/timeline",
    "/map",
    "/statistics",
    "/api-docs",
    "/about",
    "/submit",
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1.0 : 0.8,
      });
    }
  }

  // Victim pages for each locale
  for (const victim of victims) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/victims/${victim.slug}`,
        lastModified: victim.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // Event pages for each locale
  for (const event of events) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/events/${event.slug}`,
        lastModified: event.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
