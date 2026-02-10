import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getStats } from "@/lib/queries";
import { fallbackStats } from "@/lib/fallback-data";
import { formatNumber } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let stats = fallbackStats;
  try {
    stats = await getStats();
  } catch {}

  return <AboutContent locale={locale as Locale} stats={stats} />;
}

function AboutContent({
  locale,
  stats,
}: {
  locale: Locale;
  stats: { victimCount: number; eventCount: number; yearsOfRepression: number };
}) {
  const t = useTranslations("about");
  const tc = useTranslations("home");

  const sources = [
    { key: "source_hrana", icon: "📋" },
    { key: "source_amnesty", icon: "🕊" },
    { key: "source_ihr", icon: "⚖" },
    { key: "source_boroumand", icon: "📚" },
    { key: "source_wikipedia", icon: "🌐" },
    { key: "source_community", icon: "👥" },
  ] as const;

  const helpItems = [
    "howToHelpSubmit",
    "howToHelpCorrect",
    "howToHelpTranslate",
    "howToHelpDev",
    "howToHelpShare",
  ] as const;

  return (
    <div>
      {/* Hero / Quote */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-memorial-950 via-memorial-900/30 to-memorial-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-gold-500)_0%,_transparent_70%)] opacity-[0.03]" />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="text-4xl candle-flicker inline-block mb-6">🕯</span>
          <blockquote className="text-2xl sm:text-3xl font-light text-memorial-200 italic leading-relaxed">
            {t("quote")}
          </blockquote>

          {/* Stats inline */}
          <div className="mt-12 grid grid-cols-3 max-w-md mx-auto">
            <div className="py-3 border-e border-memorial-800">
              <div className="text-2xl sm:text-3xl font-bold text-gold-400 tabular-nums">
                {formatNumber(stats.victimCount, locale)}
              </div>
              <div className="text-xs text-memorial-500 mt-1">
                {tc("totalVictims")}
              </div>
            </div>
            <div className="py-3 border-e border-memorial-800">
              <div className="text-2xl sm:text-3xl font-bold text-gold-400 tabular-nums">
                {formatNumber(stats.eventCount, locale)}
              </div>
              <div className="text-xs text-memorial-500 mt-1">
                {tc("totalEvents")}
              </div>
            </div>
            <div className="py-3">
              <div className="text-2xl sm:text-3xl font-bold text-gold-400 tabular-nums">
                {formatNumber(stats.yearsOfRepression, locale)}
              </div>
              <div className="text-xs text-memorial-500 mt-1">
                {tc("timespan")}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-20 space-y-16">
        {/* Mission */}
        <section>
          <SectionHeading>{t("mission")}</SectionHeading>
          <p className="text-memorial-300 leading-relaxed text-lg">
            {t("missionText")}
          </p>
        </section>

        {/* Why */}
        <section>
          <SectionHeading>{t("whyTitle")}</SectionHeading>
          <p className="text-memorial-300 leading-relaxed">
            {t("whyText")}
          </p>
        </section>

        {/* Data Sources */}
        <section>
          <SectionHeading>{t("dataSources")}</SectionHeading>
          <p className="text-memorial-400 mb-6">{t("dataSourcesText")}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {sources.map(({ key, icon }) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-lg border border-memorial-800/60 bg-memorial-900/40 px-4 py-3"
              >
                <span className="text-lg flex-shrink-0">{icon}</span>
                <span className="text-sm text-memorial-200">{t(key)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Methodology */}
        <section>
          <SectionHeading>{t("methodology")}</SectionHeading>
          <p className="text-memorial-300 leading-relaxed">
            {t("methodologyText")}
          </p>
        </section>

        {/* How to Help */}
        <section>
          <SectionHeading>{t("howToHelp")}</SectionHeading>
          <ul className="space-y-3">
            {helpItems.map((key) => (
              <li key={key} className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-400" />
                <span className="text-memorial-300">{t(key)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href="/submit"
              className="inline-flex items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/10 px-6 py-3 text-sm font-medium text-gold-400 hover:bg-gold-500/20 transition-colors"
            >
              {tc("submitInfo")}
            </Link>
          </div>
        </section>

        {/* Ethics & Privacy */}
        <section>
          <SectionHeading>{t("privacy")}</SectionHeading>
          <p className="text-memorial-300 leading-relaxed">
            {t("privacyText")}
          </p>
        </section>

        {/* Open Source */}
        <section>
          <SectionHeading>{t("openSource")}</SectionHeading>
          <p className="text-memorial-300 leading-relaxed">
            {t("openSourceText")}
          </p>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <h2 className="text-lg font-semibold text-gold-400 flex-shrink-0">
        {children}
      </h2>
      <div className="h-px flex-1 bg-memorial-800" />
    </div>
  );
}
