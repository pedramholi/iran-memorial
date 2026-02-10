"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function FilterBar({
  provinces,
  minYear,
  maxYear,
}: {
  provinces: string[];
  minYear: number;
  maxYear: number;
}) {
  const t = useTranslations("search");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentProvince = searchParams.get("province") || "";
  const currentYear = searchParams.get("year") || "";
  const currentGender = searchParams.get("gender") || "";
  const currentSearch = searchParams.get("search") || "";

  const hasFilters = currentProvince || currentYear || currentGender;

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      // Always reset to page 1 on filter change
      params.delete("page");

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [searchParams, router, pathname]
  );

  function clearFilters() {
    const params = new URLSearchParams();
    if (currentSearch) params.set("search", currentSearch);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const selectClasses =
    "rounded-md border border-memorial-700 bg-memorial-900/80 text-memorial-200 text-sm px-3 py-2 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 appearance-none cursor-pointer";
  const genderBtnBase =
    "px-3 py-2 rounded-md text-sm border transition-colors cursor-pointer";
  const genderBtnActive =
    "bg-gold-500/20 border-gold-500/30 text-gold-400 font-medium";
  const genderBtnInactive =
    "border-memorial-700 text-memorial-400 hover:bg-memorial-800 hover:text-memorial-200";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Province dropdown */}
      <select
        value={currentProvince}
        onChange={(e) => updateParams({ province: e.target.value })}
        className={selectClasses}
      >
        <option value="">{t("allProvinces")}</option>
        {provinces.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {/* Year dropdown */}
      <select
        value={currentYear}
        onChange={(e) => updateParams({ year: e.target.value })}
        className={selectClasses}
      >
        <option value="">{t("allYears")}</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {/* Gender buttons */}
      <div className="flex gap-1">
        <button
          onClick={() => updateParams({ gender: "" })}
          className={`${genderBtnBase} ${!currentGender ? genderBtnActive : genderBtnInactive}`}
        >
          {t("allGenders")}
        </button>
        <button
          onClick={() => updateParams({ gender: "male" })}
          className={`${genderBtnBase} ${currentGender === "male" ? genderBtnActive : genderBtnInactive}`}
        >
          {t("male")}
        </button>
        <button
          onClick={() => updateParams({ gender: "female" })}
          className={`${genderBtnBase} ${currentGender === "female" ? genderBtnActive : genderBtnInactive}`}
        >
          {t("female")}
        </button>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-sm text-memorial-500 hover:text-memorial-300 transition-colors cursor-pointer"
        >
          {t("clearFilters")}
        </button>
      )}
    </div>
  );
}
