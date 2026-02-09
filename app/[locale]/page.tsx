import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SearchBar } from "@/components/SearchBar";
import { VictimCard } from "@/components/VictimCard";
import { getStats, getRecentVictims } from "@/lib/queries";
import { formatNumber } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let stats = { victimCount: 0, eventCount: 0, yearsOfRepression: 46 };
  let recentVictims: any[] = [];

  try {
    stats = await getStats();
    recentVictims = await getRecentVictims();
  } catch {
    // DB not available yet — show static content
  }

  return <HomeContent locale={locale as Locale} stats={stats} recentVictims={recentVictims} />;
}

function HomeContent({
  locale,
  stats,
  recentVictims,
}: {
  locale: Locale;
  stats: { victimCount: number; eventCount: number; yearsOfRepression: number };
  recentVictims: any[];
}) {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 sm:py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-memorial-950 via-memorial-900/50 to-memorial-950" />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="text-4xl candle-flicker mb-6 block">🕯</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-memorial-50 mb-4">
            {t("heroTitle")}
          </h1>
          <p className="text-lg sm:text-xl text-memorial-300 mb-3">
            {t("heroSubtitle")}
          </p>
          <p className="text-sm sm:text-base text-memorial-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("heroDescription")}
          </p>

          <div className="flex justify-center mb-12">
            <SearchBar large />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gold-400">
                {formatNumber(stats.victimCount, locale)}
              </div>
              <div className="text-xs sm:text-sm text-memorial-400 mt-1">
                {t("totalVictims")}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gold-400">
                {formatNumber(stats.eventCount, locale)}
              </div>
              <div className="text-xs sm:text-sm text-memorial-400 mt-1">
                {t("totalEvents")}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gold-400">
                {formatNumber(stats.yearsOfRepression, locale)}
              </div>
              <div className="text-xs sm:text-sm text-memorial-400 mt-1">
                {t("timespan")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Buttons */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/timeline"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-memorial-700 bg-memorial-800/50 px-6 py-3 text-sm font-medium text-memorial-200 hover:bg-memorial-700 hover:text-memorial-50 transition-colors"
          >
            {t("browseTimeline")}
          </Link>
          <Link
            href="/victims"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gold-500/30 bg-gold-500/10 px-6 py-3 text-sm font-medium text-gold-400 hover:bg-gold-500/20 transition-colors"
          >
            {t("browseVictims")}
          </Link>
        </div>
      </section>

      {/* Recently Added */}
      {recentVictims.length > 0 && (
        <section className="py-16 px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-xl font-semibold text-memorial-200 mb-6">
              {t("recentlyAdded")}
            </h2>
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
          </div>
        </section>
      )}
    </div>
  );
}
