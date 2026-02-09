import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { getAllEvents, localized } from "@/lib/queries";
import { formatDate, formatKilledRange } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let events: any[] = [];
  try {
    events = await getAllEvents();
  } catch {
    // DB not available
  }

  return <TimelineContent events={events} locale={locale as Locale} />;
}

function TimelineContent({ events, locale }: { events: any[]; locale: Locale }) {
  const t = useTranslations("timeline");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-memorial-50 mb-2">{t("title")}</h1>
        <p className="text-memorial-400">{t("subtitle")}</p>
      </div>

      {events.length === 0 ? (
        <p className="text-memorial-400 py-12 text-center">
          {useTranslations("common")("noResults")}
        </p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute start-4 sm:start-1/2 top-0 bottom-0 w-px timeline-line" />

          <div className="space-y-12">
            {events.map((event: any, index: number) => {
              const title = localized(event, "title", locale);
              const description = localized(event, "description", locale);
              const killed = formatKilledRange(event.estimatedKilledLow, event.estimatedKilledHigh, locale);
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={event.slug}
                  className={`relative flex items-start gap-8 ${
                    isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  {/* Dot on timeline */}
                  <div className="absolute start-4 sm:start-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blood-500 border-2 border-memorial-950 z-10 mt-2" />

                  {/* Content */}
                  <div className={`ms-12 sm:ms-0 sm:w-[calc(50%-2rem)] ${isLeft ? "sm:text-end sm:pe-8" : "sm:ps-8"}`}>
                    <Link
                      href={`/events/${event.slug}`}
                      className="group block"
                    >
                      <time className="text-xs text-memorial-500">
                        {formatDate(event.dateStart, locale)}
                      </time>
                      <h3 className="text-lg font-semibold text-memorial-100 group-hover:text-gold-400 transition-colors mt-1">
                        {title}
                      </h3>
                      {killed && (
                        <p className="text-sm text-blood-400 mt-1">
                          {killed} {t("killed")}
                        </p>
                      )}
                      {description && (
                        <p className="text-sm text-memorial-400 mt-2 line-clamp-3 leading-relaxed">
                          {description}
                        </p>
                      )}
                      {event._count?.victims > 0 && (
                        <p className="text-xs text-memorial-500 mt-2">
                          {event._count.victims} documented
                        </p>
                      )}
                    </Link>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
