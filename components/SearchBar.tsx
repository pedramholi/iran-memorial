"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";

export function SearchBar({
  defaultValue = "",
  large = false,
}: {
  defaultValue?: string;
  large?: boolean;
}) {
  const t = useTranslations("home");
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/victims?search=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className={`w-full rounded-lg border border-memorial-700 bg-memorial-900/80 text-memorial-100 placeholder:text-memorial-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 ${
          large ? "px-5 py-4 text-lg" : "px-4 py-2.5 text-sm"
        }`}
      />
      <button
        type="submit"
        aria-label={t("searchPlaceholder")}
        className={`absolute end-2 rounded-md bg-memorial-700 text-memorial-300 hover:bg-memorial-600 hover:text-memorial-100 transition-colors ${
          large ? "top-2.5 px-4 py-2" : "top-1.5 px-3 py-1.5 text-sm"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
