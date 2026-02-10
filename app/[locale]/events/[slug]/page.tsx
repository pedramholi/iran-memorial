import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { getEventBySlug, localized } from "@/lib/queries";
import { formatDateRange, formatKilledRange } from "@/lib/utils";
import { VictimCard } from "@/components/VictimCard";
import type { Locale } from "@/i18n/config";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await getEventBySlug(slug);
    if (!event) return { title: "Not Found" };
    return {
      title: event.titleEn,
      description: event.descriptionEn?.slice(0, 160),
    };
  } catch {
    return { title: "Event" };
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let event: any;
  try {
    event = await getEventBySlug(slug);
  } catch {
    notFound();
  }
  if (!event) notFound();

  return <EventDetail event={event} locale={locale as Locale} />;
}

function EventDetail({ event, locale }: { event: any; locale: Locale }) {
  const t = useTranslations("event");
  const tv = useTranslations("victim");

  const title = localized(event, "title", locale);
  const description = localized(event, "description", locale);
  const killed = formatKilledRange(event.estimatedKilledLow, event.estimatedKilledHigh, locale);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-16 sm:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-memorial-950 via-memorial-900/30 to-memorial-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-blood-600)_0%,_transparent_70%)] opacity-[0.04]" />

        <div className="relative mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-memorial-50 mb-3">{title}</h1>
          <p className="text-memorial-400 mb-6">
            {formatDateRange(event.dateStart, event.dateEnd, locale)}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {killed && (
              <div className="inline-flex items-baseline gap-2 rounded-lg border border-blood-600/30 bg-blood-600/10 px-4 py-2.5">
                <span className="text-2xl font-bold text-blood-400 tabular-nums">{killed}</span>
                <span className="text-sm text-memorial-400">{t("estimatedKilled")}</span>
              </div>
            )}
            {event.victims.length > 0 && (
              <div className="inline-flex items-baseline gap-2 rounded-lg border border-memorial-700/50 bg-memorial-800/30 px-4 py-2.5">
                <span className="text-2xl font-bold text-gold-400 tabular-nums">{event.victims.length}</span>
                <span className="text-sm text-memorial-400">{t("relatedVictims")}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-16">
        {/* Description */}
        {description && (
          <section className="py-8 mb-4">
            <p className="text-memorial-200 leading-relaxed whitespace-pre-line text-lg">{description}</p>
          </section>
        )}

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {event.tags.map((tag: string) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-memorial-800 text-memorial-400 border border-memorial-700">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Linked Victims */}
        {event.victims.length > 0 && (
          <section className="mt-4">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-lg font-semibold text-memorial-200 flex-shrink-0">
                {t("relatedVictims")}
              </h2>
              <div className="h-px flex-1 bg-memorial-800" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {event.victims.map((victim: any) => (
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
          </section>
        )}

        {/* Sources */}
        {event.sources.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold text-memorial-200 flex-shrink-0">
                {tv("sources")}
              </h2>
              <div className="h-px flex-1 bg-memorial-800" />
            </div>
            <ul className="space-y-2">
              {event.sources.map((source: any) => (
                <li key={source.id} className="text-sm">
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
                      {source.name}
                    </a>
                  ) : (
                    <span className="text-memorial-200">{source.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
