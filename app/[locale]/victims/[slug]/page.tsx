import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { getVictimBySlug, localized } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import type { Metadata } from "next";

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const victim = await getVictimBySlug(slug);
    if (!victim) return { title: "Not Found" };
    return {
      title: `${victim.nameLatin}${victim.nameFarsi ? ` — ${victim.nameFarsi}` : ""}`,
      description: victim.circumstancesEn?.slice(0, 160) || `Memorial page for ${victim.nameLatin}`,
    };
  } catch {
    return { title: "Victim" };
  }
}

export default async function VictimPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let victim: any;
  try {
    victim = await getVictimBySlug(slug);
  } catch {
    notFound();
  }
  if (!victim) notFound();

  return <VictimDetail victim={victim} locale={locale as Locale} />;
}

function VictimDetail({ victim, locale }: { victim: any; locale: Locale }) {
  const t = useTranslations("victim");

  const name = locale === "fa" && victim.nameFarsi ? victim.nameFarsi : victim.nameLatin;
  const secondaryName = locale === "fa" ? victim.nameLatin : victim.nameFarsi;
  const circumstances = localized(victim, "circumstances", locale);
  const dreams = localized(victim, "dreams", locale);
  const beliefs = localized(victim, "beliefs", locale);
  const personality = localized(victim, "personality", locale);
  const occupation = localized(victim, "occupation", locale);
  const burialCircumstances = localized(victim, "burialCircumstances", locale);
  const familyPersecution = localized(victim, "familyPersecution", locale);

  const statusColors: Record<string, string> = {
    verified: "text-green-400 border-green-400/30 bg-green-400/10",
    unverified: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    disputed: "text-red-400 border-red-400/30 bg-red-400/10",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-12 rounded-xl bg-gradient-to-b from-memorial-900/60 to-transparent p-6 sm:p-8">
        <div className="flex items-start gap-6 mb-6">
          {/* Photo */}
          <div className="h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 rounded-full bg-memorial-800/80 flex items-center justify-center overflow-hidden ring-2 ring-memorial-700/50">
            {victim.photoUrl ? (
              <img src={victim.photoUrl} alt={victim.nameLatin} className="h-full w-full object-cover" />
            ) : (
              <svg className="w-12 h-12 text-memorial-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
              </svg>
            )}
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-memorial-50">{name}</h1>
            {secondaryName && (
              <p className={`text-lg text-memorial-400 mt-1 ${locale !== "fa" ? "dir-rtl" : ""}`} dir={locale !== "fa" ? "rtl" : undefined}>
                {secondaryName}
              </p>
            )}
            {victim.aliases.length > 0 && (
              <p className="text-sm text-memorial-500 mt-1">
                {victim.aliases.join(", ")}
              </p>
            )}
            <span className={`inline-block mt-3 text-xs px-2 py-1 rounded border ${statusColors[victim.verificationStatus] || statusColors.unverified}`}>
              {t(victim.verificationStatus as any)}
            </span>
          </div>
        </div>

        {/* Dates bar */}
        {(victim.dateOfBirth || victim.dateOfDeath) && (
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-memorial-300 border-b border-memorial-800 pb-4">
            {victim.dateOfBirth && (
              <span>
                <span className="text-memorial-500">{t("born")}:</span>{" "}
                {formatDate(victim.dateOfBirth, locale)}
                {victim.placeOfBirth && `, ${victim.placeOfBirth}`}
              </span>
            )}
            {victim.dateOfDeath && (
              <span>
                <span className="text-memorial-500">{t("died")}:</span>{" "}
                {formatDate(victim.dateOfDeath, locale)}
                {victim.ageAtDeath && ` (${victim.ageAtDeath})`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Life Section */}
      {(occupation || dreams || beliefs || personality || victim.quotes.length > 0) && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gold-400 mb-6 flex items-center gap-2">
            <span className="h-px flex-1 bg-memorial-800" />
            {t("life")}
            <span className="h-px flex-1 bg-memorial-800" />
          </h2>
          <div className="rounded-lg border border-memorial-800/60 bg-memorial-900/30 p-6 space-y-6">
            {occupation && <Field label={t("occupation")} value={occupation} />}
            {victim.education && <Field label={t("education")} value={victim.education} />}
            {victim.familyInfo && formatFamily(victim.familyInfo) && (
              <Field label={t("family")} value={formatFamily(victim.familyInfo)} />
            )}
            {dreams && <Field label={t("dreams")} value={dreams} />}
            {beliefs && <Field label={t("beliefs")} value={beliefs} />}
            {personality && <Field label={t("personality")} value={personality} />}
            {victim.quotes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-memorial-400 mb-2">{t("quotes")}</h3>
                <div className="space-y-2">
                  {victim.quotes.map((q: string, i: number) => (
                    <blockquote key={i} className="border-s-2 border-gold-500/50 ps-4 text-memorial-200 italic">
                      &ldquo;{q}&rdquo;
                    </blockquote>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Death Section */}
      {(victim.placeOfDeath || victim.causeOfDeath || victim.responsibleForces || circumstances || victim.event) && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-blood-400 mb-6 flex items-center gap-2">
            <span className="h-px flex-1 bg-memorial-800" />
            {t("death")}
            <span className="h-px flex-1 bg-memorial-800" />
          </h2>
          <div className="rounded-lg border border-memorial-800/60 bg-gradient-to-b from-blood-600/5 to-memorial-900/30 p-6 space-y-6">
            {victim.placeOfDeath && <Field label={t("placeOfDeath")} value={victim.placeOfDeath} />}
            {victim.causeOfDeath && <Field label={t("causeOfDeath")} value={victim.causeOfDeath} />}
            {victim.responsibleForces && <Field label={t("responsibleForces")} value={victim.responsibleForces} />}
            {circumstances && (
              <div>
                <h3 className="text-sm font-medium text-memorial-400 mb-2">{t("circumstances")}</h3>
                <p className="text-memorial-200 leading-relaxed whitespace-pre-line">{circumstances}</p>
              </div>
            )}
            {victim.event && (
              <div>
                <h3 className="text-sm font-medium text-memorial-400 mb-1">{t("relatedEvent")}</h3>
                <Link
                  href={`/events/${victim.event.slug}`}
                  className="text-gold-400 hover:text-gold-300 underline underline-offset-2"
                >
                  {localized(victim.event, "title", locale)}
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Aftermath Section */}
      {(victim.burialLocation || familyPersecution || victim.legalProceedings || victim.tributes.length > 0) && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-memorial-300 mb-6 flex items-center gap-2">
            <span className="h-px flex-1 bg-memorial-800" />
            {t("aftermath")}
            <span className="h-px flex-1 bg-memorial-800" />
          </h2>
          <div className="rounded-lg border border-memorial-800/60 bg-memorial-900/30 p-6 space-y-6">
            {victim.burialLocation && (
              <div>
                <h3 className="text-sm font-medium text-memorial-400 mb-2">{t("burial")}</h3>
                <p className="text-memorial-200">{victim.burialLocation}</p>
                {victim.burialDate && (
                  <p className="text-sm text-memorial-400 mt-1">{formatDate(victim.burialDate, locale)}</p>
                )}
                {burialCircumstances && (
                  <p className="text-memorial-300 mt-2 leading-relaxed whitespace-pre-line">{burialCircumstances}</p>
                )}
              </div>
            )}
            {familyPersecution && (
              <div>
                <h3 className="text-sm font-medium text-memorial-400 mb-2">{t("familyPersecution")}</h3>
                <p className="text-memorial-200 leading-relaxed whitespace-pre-line">{familyPersecution}</p>
              </div>
            )}
            {victim.legalProceedings && (
              <div>
                <h3 className="text-sm font-medium text-memorial-400 mb-2">{t("legalProceedings")}</h3>
                <p className="text-memorial-200 leading-relaxed whitespace-pre-line">{victim.legalProceedings}</p>
              </div>
            )}
            {victim.tributes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-memorial-400 mb-2">{t("tributes")}</h3>
                <ul className="list-disc list-inside space-y-1 text-memorial-200">
                  {victim.tributes.map((tribute: string, i: number) => (
                    <li key={i}>{tribute}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Sources */}
      {victim.sources.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-memorial-300 mb-6 flex items-center gap-2">
            <span className="h-px flex-1 bg-memorial-800" />
            {t("sources")}
            <span className="h-px flex-1 bg-memorial-800" />
          </h2>
          <ul className="rounded-lg border border-memorial-800/60 bg-memorial-900/30 p-6 space-y-3">
            {victim.sources.map((source: any) => (
              <li key={source.id} className="text-sm">
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 hover:text-gold-300 underline underline-offset-2"
                  >
                    {source.name}
                  </a>
                ) : (
                  <span className="text-memorial-200">{source.name}</span>
                )}
                {source.sourceType && (
                  <span className="text-memorial-500 ms-2 text-xs">({source.sourceType})</span>
                )}
                {source.publishedDate && (
                  <span className="text-memorial-500 ms-2 text-xs">
                    {formatDate(source.publishedDate, locale)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-memorial-400 mb-1">{label}</h3>
      <p className="text-memorial-200">{value}</p>
    </div>
  );
}

function formatFamily(info: any): string {
  if (!info) return "";
  const parts: string[] = [];
  if (info.marital_status) parts.push(info.marital_status);
  if (info.children) parts.push(`${info.children} children`);
  if (info.notes) parts.push(info.notes);
  return parts.join(". ");
}
