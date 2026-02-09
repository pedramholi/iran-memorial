"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-1">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            l === locale
              ? "bg-memorial-700 text-gold-400 font-medium"
              : "text-memorial-400 hover:text-memorial-200 hover:bg-memorial-800"
          }`}
        >
          {localeNames[l]}
        </button>
      ))}
    </div>
  );
}
