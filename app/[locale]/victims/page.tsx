import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { VictimCard } from "@/components/VictimCard";
import { SearchBar } from "@/components/SearchBar";
import { getVictimsList } from "@/lib/queries";
import { fallbackVictimsList } from "@/lib/fallback-data";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

export default async function VictimsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const page = Number(sp.page) || 1;
  const search = sp.search || "";
  const province = sp.province || "";
  const year = sp.year ? Number(sp.year) : undefined;
  const gender = sp.gender || "";

  let result: { victims: any[]; total: number; page: number; pageSize: number; totalPages: number } = fallbackVictimsList;
  try {
    result = await getVictimsList({ page, search, province, year, gender });
  } catch {
    // DB not available — use fallback data
  }

  return (
    <VictimsContent
      locale={locale as Locale}
      result={result}
      search={search}
    />
  );
}

function VictimsContent({
  locale,
  result,
  search,
}: {
  locale: Locale;
  result: { victims: any[]; total: number; page: number; totalPages: number };
  search: string;
}) {
  const t = useTranslations("search");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-memorial-100 mb-8">{t("title")}</h1>

      <div className="mb-8">
        <SearchBar defaultValue={search} />
      </div>

      {result.victims.length === 0 ? (
        <p className="text-memorial-400 py-12 text-center">
          {useTranslations("common")("noResults")}
        </p>
      ) : (
        <>
          <p className="text-sm text-memorial-500 mb-6">
            {t("showing")} {result.total} {t("results")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.victims.map((victim: any) => (
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

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {result.page > 1 && (
                <Link
                  href={`/victims?page=${result.page - 1}${search ? `&search=${search}` : ""}`}
                  className="px-4 py-2 rounded border border-memorial-700 text-memorial-300 hover:bg-memorial-800 text-sm"
                >
                  &larr;
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-memorial-400">
                {result.page} / {result.totalPages}
              </span>
              {result.page < result.totalPages && (
                <Link
                  href={`/victims?page=${result.page + 1}${search ? `&search=${search}` : ""}`}
                  className="px-4 py-2 rounded border border-memorial-700 text-memorial-300 hover:bg-memorial-800 text-sm"
                >
                  &rarr;
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
