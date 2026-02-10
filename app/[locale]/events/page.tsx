import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { getAllEvents, localized } from "@/lib/queries";
import { fallbackEvents } from "@/lib/fallback-data";
import { formatDateRange, formatKilledRange } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let events: any[] = fallbackEvents;
  try {
    events = await getAllEvents();
  } catch {
    // DB not available — use fallback data
  }

  return <EventsList events={events} locale={locale as Locale} />;
}

function EventsList({ events, locale }: { events: any[]; locale: Locale }) {
  const t = useTranslations("common");
  const te = useTranslations("event");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-memorial-100 mb-8">{t("events")}</h1>

      {events.length === 0 ? (
        <p className="text-memorial-400 py-12 text-center">{t("noResults")}</p>
      ) : (
        <div className="space-y-6">
          {events.map((event: any) => {
            const title = localized(event, "title", locale);
            const description = localized(event, "description", locale);
            const killed = formatKilledRange(event.estimatedKilledLow, event.estimatedKilledHigh, locale);

            return (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className="block rounded-lg border border-memorial-800 bg-memorial-900/50 p-6 transition-all hover:border-memorial-600 hover:bg-memorial-800/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-memorial-100 hover:text-gold-400 transition-colors">
                      {title}
                    </h2>
                    <p className="text-sm text-memorial-500 mt-1">
                      {formatDateRange(event.dateStart, event.dateEnd, locale)}
                    </p>
                    {description && (
                      <p className="text-sm text-memorial-300 mt-3 line-clamp-3 leading-relaxed">
                        {description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {event.tags.map((tag: string) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded bg-memorial-800 text-memorial-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {killed && (
                    <div className="text-end flex-shrink-0">
                      <div className="text-2xl font-bold text-blood-400">{killed}</div>
                      <div className="text-xs text-memorial-500">{te("estimatedKilled")}</div>
                    </div>
                  )}
                </div>
                {event._count?.victims > 0 && (
                  <p className="text-xs text-memorial-500 mt-3">
                    {te("relatedVictims")}: {event._count.victims}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
