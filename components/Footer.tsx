import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/config";

export function Footer({ locale }: { locale: Locale }) {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-memorial-800 bg-memorial-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-memorial-400 text-sm italic">
            {t("remembrance")}
          </p>
          <div className="flex items-center gap-6 text-xs text-memorial-500">
            <a
              href="https://github.com/pedramholi/iran-memorial"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-memorial-300 transition-colors"
            >
              {t("openSource")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
