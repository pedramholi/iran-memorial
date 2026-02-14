import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { VictimCard } from "@/components/VictimCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { getVictimsList, getFilterOptions } from "@/lib/queries";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/utils";
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

  const [result, filterOptions] = await Promise.all([
    getVictimsList({ page, search, province, year, gender }),
    getFilterOptions(),
  ]);

  return (
    <VictimsContent
      locale={locale as Locale}
      result={result}
      search={search}
      province={province}
      year={year}
      gender={gender}
      filterOptions={filterOptions}
    />
  );
}

function VictimsContent({
  locale,
  result,
  search,
  province,
  year,
  gender,
  filterOptions,
}: {
  locale: Locale;
  result: { victims: any[]; total: number; page: number; totalPages: number };
  search: string;
  province: string;
  year: number | undefined;
  gender: string;
  filterOptions: { provinces: string[]; minYear: number; maxYear: number };
}) {
  const t = useTranslations("search");
  const tc = useTranslations("common");
  const ts = useTranslations("statistics");

  // Build query string that preserves all current filters for pagination links
  const filterQs = buildFilterQs({ search, province, year, gender });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-memorial-100 mb-2">{t("title")}</h1>
        <p className="text-memorial-400 text-sm">
          {t("showing")}{" "}
          <span className="text-memorial-200 font-medium tabular-nums">
            {formatNumber(result.total, locale)}
          </span>{" "}
          {t("results")}
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchBar defaultValue={search} />
      </div>

      {/* Filters */}
      <div className="mb-8">
        <FilterBar
          provinces={filterOptions.provinces}
          minYear={filterOptions.minYear}
          maxYear={filterOptions.maxYear}
        />
      </div>

      {result.victims.length === 0 ? (
        <div className="py-20 text-center">
          <svg className="w-12 h-12 mx-auto text-memorial-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-memorial-300 font-medium">{tc("noResults")}</p>
          <p className="text-memorial-500 text-sm mt-2">{ts("noResultsHint")}</p>
          {(search || province || year || gender) && (
            <Link
              href="/victims"
              className="inline-block mt-4 text-sm text-gold-400 hover:text-gold-300 underline underline-offset-2"
            >
              {ts("clearFilters")}
            </Link>
          )}
        </div>
      ) : (
        <>
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
                ageAtDeath={victim.ageAtDeath}
                verificationStatus={victim.verificationStatus}
              />
            ))}
          </div>

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-1">
              {/* Prev */}
              {result.page > 1 ? (
                <Link
                  href={`/victims?page=${result.page - 1}${filterQs}`}
                  className="px-3 py-2 rounded-md border border-memorial-700 text-memorial-300 hover:bg-memorial-800 text-sm"
                >
                  &larr;
                </Link>
              ) : (
                <span className="px-3 py-2 rounded-md border border-memorial-800 text-memorial-600 text-sm cursor-not-allowed">
                  &larr;
                </span>
              )}

              {/* Page numbers */}
              {generatePageNumbers(result.page, result.totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-memorial-600">
                    ...
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={`/victims?page=${p}${filterQs}`}
                    className={`px-3 py-2 rounded-md text-sm ${
                      p === result.page
                        ? "bg-gold-500/20 border border-gold-500/30 text-gold-400 font-medium"
                        : "border border-memorial-700 text-memorial-300 hover:bg-memorial-800"
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}

              {/* Next */}
              {result.page < result.totalPages ? (
                <Link
                  href={`/victims?page=${result.page + 1}${filterQs}`}
                  className="px-3 py-2 rounded-md border border-memorial-700 text-memorial-300 hover:bg-memorial-800 text-sm"
                >
                  &rarr;
                </Link>
              ) : (
                <span className="px-3 py-2 rounded-md border border-memorial-800 text-memorial-600 text-sm cursor-not-allowed">
                  &rarr;
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function buildFilterQs(params: { search: string; province: string; year: number | undefined; gender: string }): string {
  const parts: string[] = [];
  if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.province) parts.push(`province=${encodeURIComponent(params.province)}`);
  if (params.year) parts.push(`year=${params.year}`);
  if (params.gender) parts.push(`gender=${encodeURIComponent(params.gender)}`);
  return parts.length > 0 ? `&${parts.join("&")}` : "";
}

function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}
