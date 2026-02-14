import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { getAllEvents, localized } from "@/lib/queries";
import { fallbackEvents } from "@/lib/fallback-data";
import { formatDate, formatKilledRange } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

export const revalidate = 3600; // ISR: revalidate every hour

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let events: any[] = fallbackEvents;
  try {
    events = await getAllEvents();
  } catch (e) {
    console.error("[Timeline] getAllEvents() failed:", e);
  }

  return <TimelineContent events={events} locale={locale as Locale} />;
}

/** Calculate proportional gap (in rem) based on years between events.
 *  Linear scaling: close events stay tight, distant ones spread out. */
function timeGapRem(yearsDiff: number): number {
  if (yearsDiff <= 0) return 1;
  return Math.min(14, 1 + yearsDiff * 1.2);
}

/** Get the fractional year difference between two dates. */
function yearsBetween(a: Date | string, b: Date | string): number {
  const da = new Date(a);
  const db = new Date(b);
  const diffMs = Math.abs(db.getTime() - da.getTime());
  return diffMs / (365.25 * 24 * 60 * 60 * 1000);
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

          <div>
            {events.map((event: any, index: number) => {
              const title = localized(event, "title", locale);
              const description = localized(event, "description", locale);
              const killed = formatKilledRange(event.estimatedKilledLow, event.estimatedKilledHigh, locale);
              const isLeft = index % 2 === 0;
              const eventPhoto = event.photos?.[0]?.url;

              // Calculate proportional spacing based on time gap between start dates
              const prevStart = index > 0 ? events[index - 1].dateStart : null;
              const gap = prevStart
                ? yearsBetween(prevStart, event.dateStart)
                : 0;
              const gapRem = index === 0 ? 0 : timeGapRem(gap);

              // Show year gap marker for gaps >= 3 years
              const showGapMarker = index > 0 && gap >= 3;
              const prevYear = prevStart ? new Date(prevStart).getFullYear() : 0;
              const currYear = new Date(event.dateStart).getFullYear();

              return (
                <div key={event.slug}>
                  {/* Year gap marker */}
                  {showGapMarker && (
                    <div
                      className="relative flex justify-center"
                      style={{ paddingTop: `${gapRem * 0.4}rem`, paddingBottom: `${gapRem * 0.4}rem` }}
                    >
                      <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-memorial-800/60 bg-memorial-900/80 backdrop-blur-sm">
                        <div className="h-px w-6 bg-memorial-700" />
                        <span className="text-xs text-memorial-500 tabular-nums whitespace-nowrap">
                          {currYear - prevYear} {locale === "de" ? "Jahre" : locale === "fa" ? "سال" : "years"}
                        </span>
                        <div className="h-px w-6 bg-memorial-700" />
                      </div>
                    </div>
                  )}

                  {/* Event entry */}
                  <div
                    className={`relative flex items-start gap-8 ${
                      isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                    }`}
                    style={{
                      marginTop: showGapMarker ? `${gapRem * 0.2}rem` : `${gapRem}rem`,
                    }}
                  >
                    {/* Dot on timeline */}
                    <div className="absolute start-4 sm:start-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blood-500 border-2 border-memorial-950 z-10 mt-2" />

                    {/* Content */}
                    <div className={`ms-12 sm:ms-0 sm:w-[calc(50%-2rem)] ${isLeft ? "sm:text-end sm:pe-8" : "sm:ps-8"}`}>
                      <Link
                        href={`/events/${event.slug}`}
                        className="group block"
                      >
                        <div className="flex items-start gap-3">
                          {eventPhoto && (
                            <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-memorial-800">
                              <Image src={eventPhoto} alt={title || ""} fill sizes="48px" className="object-cover" unoptimized />
                            </div>
                          )}
                          <div>
                            <time className="text-xs text-memorial-500">
                              {formatDate(event.dateStart, locale)}
                            </time>
                            <h3 className="text-lg font-semibold text-memorial-100 group-hover:text-gold-400 transition-colors mt-1">
                              {title}
                            </h3>
                          </div>
                        </div>
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
                            {event._count.victims} {t("documented")}
                          </p>
                        )}
                      </Link>
                    </div>

                    {/* Spacer for the other side */}
                    <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
