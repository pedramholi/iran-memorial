import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { prisma } from "@/lib/db";
import { IranMap } from "@/components/IranMap";
import { formatNumber } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

export const dynamic = "force-dynamic";

async function getMapData() {
  const byProvince = await prisma.$queryRaw<{ province: string; count: number }[]>`
    SELECT province, COUNT(*)::int AS count
    FROM victims
    WHERE province IS NOT NULL AND province != ''
    GROUP BY province
    ORDER BY count DESC
  `;
  return byProvince.map((r) => ({ province: r.province, count: Number(r.count) }));
}

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getMapData();
  const totalMapped = data.reduce((sum, d) => sum + d.count, 0);

  return <MapContent data={data} totalMapped={totalMapped} locale={locale as Locale} />;
}

function MapContent({
  data,
  totalMapped,
  locale,
}: {
  data: { province: string; count: number }[];
  totalMapped: number;
  locale: Locale;
}) {
  const t = useTranslations("map");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-memorial-100 tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-3 text-memorial-400">
          {t("subtitle")}
        </p>
        <p className="mt-1 text-sm text-memorial-500">
          {formatNumber(totalMapped, locale)} {t("victimsWithProvince")}
        </p>
      </div>

      <IranMap data={data} locale={locale} />

      {/* Province legend table */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gold-400 mb-4">{t("byProvince")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {data.map(({ province, count }) => (
            <div
              key={province}
              className="flex items-center justify-between px-3 py-2 rounded border border-memorial-800/60 bg-memorial-900/30"
            >
              <span className="text-sm text-memorial-300 truncate">{province}</span>
              <span className="text-sm text-gold-400 tabular-nums ms-2 flex-shrink-0">
                {formatNumber(count, locale)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
