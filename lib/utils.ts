import type { Locale } from "@/i18n/config";

export function formatDate(date: Date | string | null, locale: Locale): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;

  const localeMap: Record<Locale, string> = {
    fa: "fa-IR",
    en: "en-US",
    de: "de-DE",
  };

  return d.toLocaleDateString(localeMap[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateRange(
  start: Date | string | null,
  end: Date | string | null,
  locale: Locale
): string {
  const s = formatDate(start, locale);
  const e = formatDate(end, locale);
  if (!s) return "";
  if (!e) return s;
  return `${s} – ${e}`;
}

export function formatNumber(n: number | null, locale: Locale): string {
  if (n === null) return "";
  const localeMap: Record<Locale, string> = {
    fa: "fa-IR",
    en: "en-US",
    de: "de-DE",
  };
  return n.toLocaleString(localeMap[locale]);
}

export function formatKilledRange(
  low: number | null | undefined,
  high: number | null | undefined,
  locale: Locale
): string {
  if (low && high && low !== high) {
    return `${formatNumber(low, locale)}–${formatNumber(high, locale)}`;
  }
  if (low) return formatNumber(low, locale);
  if (high) return formatNumber(high, locale);
  return "";
}
