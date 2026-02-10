import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SearchBar } from "@/components/SearchBar";
import { VictimCard } from "@/components/VictimCard";
import { getStats, getRecentVictims, getAllEvents, localized } from "@/lib/queries";
import {
  fallbackStats,
  fallbackRecentVictims,
  fallbackEvents,
} from "@/lib/fallback-data";
import { formatNumber, formatKilledRange } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let stats = fallbackStats;
  let recentVictims: any[] = fallbackRecentVictims;
  let events: any[] = fallbackEvents;

  try {
    stats = await getStats();
    recentVictims = await getRecentVictims();
    events = await getAllEvents();
  } catch {
    // DB not available — use fallback data
  }

  return (
    <HomeContent
      locale={locale as Locale}
      stats={stats}
      recentVictims={recentVictims}
      events={events}
    />
  );
}

function HomeContent({
  locale,
  stats,
  recentVictims,
  events,
}: {
  locale: Locale;
  stats: { victimCount: number; eventCount: number; sourceCount: number; yearsOfRepression: number };
  recentVictims: any[];
  events: any[];
}) {
  const t = useTranslations("home");
  const te = useTranslations("timeline");

  // Pick 4 most significant events for homepage preview
  const keyEvents = events
    .filter(
      (e: any) => e.estimatedKilledLow || e.estimatedKilledHigh
    )
    .slice(-5);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-28 sm:py-40 px-4 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-memorial-950 via-memorial-900/30 to-memorial-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-blood-600)_0%,_transparent_70%)] opacity-[0.04]" />

        {/* Decorative top line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-memorial-700 to-transparent" />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Candle */}
          <div className="mb-8">
            <span className="text-5xl candle-flicker inline-block">🕯</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-memorial-50 mb-5 leading-[1.1]">
            {t("heroTitle")}
          </h1>

          <p className="text-lg sm:text-xl text-memorial-300 mb-3 font-light">
            {t("heroSubtitle")}
          </p>

          <p className="text-sm sm:text-base text-memorial-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            {t("heroDescription")}
          </p>

          {/* Search */}
          <div className="flex justify-center mb-16">
            <SearchBar large />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 max-w-xl mx-auto">
            <div className="py-4 border-e border-memorial-800">
              <div className="text-3xl sm:text-4xl font-bold text-gold-400 tabular-nums">
                {formatNumber(stats.victimCount, locale)}
              </div>
              <div className="text-xs sm:text-sm text-memorial-500 mt-1.5">
                {t("totalVictims")}
              </div>
            </div>
            <div className="py-4 border-e border-memorial-800">
              <div className="text-3xl sm:text-4xl font-bold text-gold-400 tabular-nums">
                {formatNumber(stats.eventCount, locale)}
              </div>
              <div className="text-xs sm:text-sm text-memorial-500 mt-1.5">
                {t("totalEvents")}
              </div>
            </div>
            <div className="py-4">
              <div className="text-3xl sm:text-4xl font-bold text-gold-400 tabular-nums">
                {formatNumber(stats.yearsOfRepression, locale)}
              </div>
              <div className="text-xs sm:text-sm text-memorial-500 mt-1.5">
                {t("timespan")}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/victims"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gold-500/30 bg-gold-500/10 px-6 py-3 text-sm font-medium text-gold-400 hover:bg-gold-500/20 transition-colors"
            >
              {t("browseVictims")}
            </Link>
            <Link
              href="/timeline"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-memorial-700 bg-memorial-800/50 px-6 py-3 text-sm font-medium text-memorial-300 hover:bg-memorial-700 hover:text-memorial-50 transition-colors"
            >
              {t("browseTimeline")}
            </Link>
          </div>
        </div>

        {/* Decorative bottom line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-t from-transparent via-memorial-700 to-transparent" />
      </section>

      {/* Key Events */}
      {keyEvents.length > 0 && (
        <section className="py-20 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-memorial-800" />
              <h2 className="text-lg font-semibold text-memorial-200 tracking-wide">
                {t("keyEvents")}
              </h2>
              <div className="h-px flex-1 bg-memorial-800" />
            </div>

            <div className="space-y-3">
              {keyEvents.map((event: any) => {
                const title = localized(event, "title", locale);
                const killed = formatKilledRange(
                  event.estimatedKilledLow,
                  event.estimatedKilledHigh,
                  locale
                );

                return (
                  <Link
                    key={event.slug}
                    href={`/events/${event.slug}`}
                    className="group flex items-center justify-between gap-4 rounded-lg border border-memorial-800/60 bg-memorial-900/30 px-5 py-4 transition-all hover:border-memorial-600 hover:bg-memorial-800/40"
                  >
                    <div className="min-w-0">
                      <h3 className="font-medium text-memorial-200 group-hover:text-gold-400 transition-colors truncate">
                        {title}
                      </h3>
                      <p className="text-xs text-memorial-500 mt-0.5">
                        {new Date(event.dateStart).getFullYear()}
                        {event.dateEnd && event.dateEnd !== event.dateStart
                          ? `–${new Date(event.dateEnd).getFullYear()}`
                          : ""}
                      </p>
                    </div>
                    {killed && (
                      <div className="flex-shrink-0 text-end">
                        <span className="text-lg font-bold text-blood-400">
                          {killed}
                        </span>
                        <span className="text-xs text-memorial-500 ms-1.5">
                          {te("killed")}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/timeline"
                className="text-sm text-memorial-400 hover:text-gold-400 transition-colors"
              >
                {t("viewTimeline")} &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why This Matters */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-memorial-800/60 bg-gradient-to-br from-memorial-900/60 to-memorial-950 p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-semibold text-memorial-100 mb-4">
                  {t("whyMatters")}
                </h2>
                <p className="text-memorial-400 leading-relaxed mb-6">
                  {t("whyMattersText")}
                </p>
                <Link
                  href="/about"
                  className="text-sm text-gold-400 hover:text-gold-300 transition-colors"
                >
                  {t("learnMore")} &rarr;
                </Link>
              </div>
              <div className="flex-shrink-0 grid grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold-400 tabular-nums">
                    {formatNumber(stats.victimCount, locale)}
                  </div>
                  <div className="text-xs text-memorial-500 mt-1">{t("totalVictims")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold-400 tabular-nums">
                    {formatNumber(stats.sourceCount, locale)}
                  </div>
                  <div className="text-xs text-memorial-500 mt-1">{t("documentedSources")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Victims */}
      {recentVictims.length > 0 && (
        <section className="py-20 px-4 bg-memorial-900/20">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-memorial-800" />
              <h2 className="text-lg font-semibold text-memorial-200 tracking-wide">
                {t("recentlyAdded")}
              </h2>
              <div className="h-px flex-1 bg-memorial-800" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentVictims.map((victim: any) => (
                <VictimCard
                  key={victim.slug}
                  slug={victim.slug}
                  nameLatin={victim.nameLatin}
                  nameFarsi={victim.nameFarsi}
                  dateOfDeath={victim.dateOfDeath}
                  placeOfDeath={victim.placeOfDeath}
                  causeOfDeath={victim.causeOfDeath}
                  photoUrl={victim.photoUrl}
                  locale={locale}
                />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/victims"
                className="text-sm text-memorial-400 hover:text-gold-400 transition-colors"
              >
                {t("browseVictims")} &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA: Submit Information */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-gold-500)_0%,_transparent_70%)] opacity-[0.03]" />
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="rounded-xl border border-gold-500/20 bg-memorial-900/40 p-10 sm:p-14">
            <span className="text-4xl candle-flicker inline-block mb-5">🕯</span>
            <h2 className="text-xl sm:text-2xl font-semibold text-memorial-100 mb-3">
              {t("submitInfo")}
            </h2>
            <p className="text-memorial-400 text-sm mb-8 leading-relaxed max-w-lg mx-auto">
              {t("submitInfoDescription")}
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/10 px-8 py-3.5 text-sm font-medium text-gold-400 hover:bg-gold-500/20 transition-colors"
            >
              {t("submitInfo")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
