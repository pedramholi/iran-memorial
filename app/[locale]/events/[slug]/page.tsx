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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-memorial-50 mb-2">{title}</h1>
      <p className="text-memorial-400 mb-6">
        {formatDateRange(event.dateStart, event.dateEnd, locale)}
      </p>

      {killed && (
        <div className="mb-8 inline-flex items-baseline gap-2 rounded-lg border border-blood-600/30 bg-blood-600/10 px-4 py-2">
          <span className="text-2xl font-bold text-blood-400">{killed}</span>
          <span className="text-sm text-memorial-400">{t("estimatedKilled")}</span>
        </div>
      )}

      {description && (
        <div className="mb-8">
          <p className="text-memorial-200 leading-relaxed whitespace-pre-line">{description}</p>
        </div>
      )}

      {event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {event.tags.map((tag: string) => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-memorial-800 text-memorial-400 border border-memorial-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Linked Victims */}
      {event.victims.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-memorial-200 mb-6">
            {t("relatedVictims")} ({event.victims.length})
          </h2>
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
          <h2 className="text-xl font-semibold text-memorial-200 mb-4">
            {tv("sources")}
          </h2>
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
  );
}
