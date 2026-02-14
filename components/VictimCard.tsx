import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { formatDate } from "@/lib/utils";
import { translateCause } from "@/lib/translate";

type VictimCardProps = {
  slug: string;
  nameLatin: string;
  nameFarsi: string | null;
  dateOfDeath: Date | string | null;
  placeOfDeath: string | null;
  causeOfDeath: string | null;
  photoUrl: string | null;
  locale: Locale;
  ageAtDeath?: number | null;
  verificationStatus?: string;
};

export function VictimCard({
  slug,
  nameLatin,
  nameFarsi,
  dateOfDeath,
  placeOfDeath,
  causeOfDeath,
  photoUrl,
  locale,
  ageAtDeath,
  verificationStatus,
}: VictimCardProps) {
  const displayName = locale === "fa" && nameFarsi ? nameFarsi : nameLatin;

  return (
    <Link
      href={`/victims/${slug}`}
      className="group block rounded-lg border border-memorial-800 bg-memorial-900/50 p-4 transition-all hover:border-memorial-600 hover:bg-memorial-800/50 shadow-sm shadow-black/10 hover:shadow-md hover:shadow-black/20"
    >
      <div className="flex items-start gap-4">
        {/* Photo placeholder */}
        <div className="relative h-16 w-16 flex-shrink-0 rounded-full bg-memorial-800/80 flex items-center justify-center overflow-hidden ring-1 ring-memorial-700/50">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={nameLatin}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <svg className="w-7 h-7 text-memorial-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-memorial-100 group-hover:text-gold-400 transition-colors truncate flex items-center gap-1.5">
            {displayName}
            {verificationStatus === "verified" && (
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title={{ en: "Verified", de: "Verifiziert", fa: "تأیید شده" }[locale]} />
            )}
          </h3>
          {locale !== "fa" && nameFarsi && (
            <p className="text-sm text-memorial-400 mt-0.5" dir="rtl">
              {nameFarsi}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-memorial-500">
            {dateOfDeath && (
              <span>{formatDate(dateOfDeath, locale)}</span>
            )}
            {ageAtDeath && <span>({ageAtDeath})</span>}
            {placeOfDeath && <span>{placeOfDeath}</span>}
          </div>
          {causeOfDeath && (
            <p className="mt-1 text-xs text-blood-400">{translateCause(causeOfDeath, locale)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
