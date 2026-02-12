import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { getStatistics, type Statistics } from "@/lib/queries";
import { formatNumber } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function StatisticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let stats: Statistics | null = null;
  try {
    stats = await getStatistics();
  } catch {}

  if (!stats) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-memorial-400">
        Statistics are currently unavailable.
      </div>
    );
  }

  return <StatisticsContent stats={stats} locale={locale as Locale} />;
}

function StatisticsContent({
  stats,
  locale,
}: {
  stats: Statistics;
  locale: Locale;
}) {
  const t = useTranslations("statistics");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-memorial-100 tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-3 text-memorial-400 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Hero Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        <StatCard
          value={formatNumber(stats.totalVictims, locale)}
          label={t("totalVictims")}
          highlight
        />
        <StatCard
          value={stats.yearsCovered}
          label={t("yearsCovered")}
        />
        <StatCard
          value={formatNumber(stats.provincesAffected, locale)}
          label={t("provincesAffected")}
        />
        <StatCard
          value={formatNumber(stats.verifiedCount, locale)}
          label={t("verifiedRecords")}
        />
      </div>

      {/* Deaths by Year */}
      <Section title={t("deathsByYear")}>
        <YearlyBarChart data={stats.deathsByYear} locale={locale} />
      </Section>

      {/* Deaths by Province */}
      <Section title={t("deathsByProvince")}>
        <HorizontalBars
          data={stats.deathsByProvince}
          locale={locale}
          color="bg-gold-500/80"
        />
      </Section>

      {/* Cause of Death */}
      <Section title={t("causeOfDeath")}>
        <HorizontalBars
          data={stats.deathsByCause}
          locale={locale}
          color="bg-blood-500"
        />
      </Section>

      {/* Age Distribution */}
      <Section title={t("ageDistribution")}>
        <p className="text-sm text-memorial-500 mb-4">
          {formatNumber(
            stats.ageDistribution.reduce((s, d) => s + d.count, 0),
            locale
          )}{" "}
          {t("withKnownAge")}
        </p>
        <HorizontalBars
          data={stats.ageDistribution}
          locale={locale}
          color="bg-gold-500"
        />
      </Section>

      {/* Gender + Data Sources side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mt-12 sm:mt-16">
        <div>
          <Section title={t("genderBreakdown")}>
            <div className="grid grid-cols-3 gap-3">
              {stats.genderBreakdown.map((g) => (
                <div
                  key={g.label}
                  className="rounded-lg border border-memorial-800/60 bg-memorial-900/30 p-4 text-center"
                >
                  <div className="text-xl sm:text-2xl font-bold text-gold-400 tabular-nums">
                    {formatNumber(g.count, locale)}
                  </div>
                  <div className="text-xs text-memorial-500 mt-1">
                    {g.label === "male"
                      ? t("male")
                      : g.label === "female"
                        ? t("female")
                        : t("unknown")}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div>
          <Section title={t("dataSources")}>
            <HorizontalBars
              data={stats.dataSources}
              locale={locale}
              color="bg-memorial-500"
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable sub-components ---------- */

function StatCard({
  value,
  label,
  highlight,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-memorial-800/60 bg-memorial-900/30 p-4 sm:p-6 text-center">
      <div
        className={`text-2xl sm:text-3xl font-bold tabular-nums ${
          highlight ? "text-gold-400" : "text-memorial-100"
        }`}
      >
        {value}
      </div>
      <div className="text-xs sm:text-sm text-memorial-500 mt-1">{label}</div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-12 sm:mt-16 first:mt-0">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gold-400 flex-shrink-0">
          {title}
        </h2>
        <div className="h-px flex-1 bg-memorial-800" />
      </div>
      {children}
    </div>
  );
}

function YearlyBarChart({
  data,
  locale,
}: {
  data: { year: number; count: number }[];
  locale: Locale;
}) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div dir="ltr" className="flex items-end gap-px min-w-[700px] h-64 sm:h-72">
        {data.map(({ year, count }) => {
          const heightPercent = (count / maxCount) * 100;
          const isPeak = count > 1000;
          return (
            <div
              key={year}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-memorial-800 text-memorial-100 text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                {year}: {formatNumber(count, locale)}
              </div>
              {/* Bar */}
              <div
                className={`w-full min-w-[4px] rounded-t-sm transition-colors ${
                  isPeak
                    ? "bg-blood-500 group-hover:bg-blood-400"
                    : "bg-memorial-600 group-hover:bg-memorial-500"
                }`}
                style={{ height: `${Math.max(heightPercent, 0.5)}%` }}
              />
              {/* Year label every 5 years */}
              {year % 5 === 0 && (
                <span className="text-[10px] text-memorial-500 mt-1.5 whitespace-nowrap">
                  {year}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HorizontalBars({
  data,
  locale,
  color,
}: {
  data: { label: string; count: number }[];
  locale: Locale;
  color: string;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      {data.map(({ label, count }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="text-sm text-memorial-300 w-36 sm:w-44 text-end flex-shrink-0 truncate">
            {label}
          </span>
          <div className="flex-1 h-6 bg-memorial-800/50 rounded overflow-hidden">
            <div
              className={`h-full rounded ${color}`}
              style={{ width: `${(count / maxCount) * 100}%` }}
            />
          </div>
          <span className="text-xs text-memorial-400 w-14 text-end tabular-nums flex-shrink-0">
            {formatNumber(count, locale)}
          </span>
        </div>
      ))}
    </div>
  );
}
