"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { localized } from "@/lib/queries";
import { formatDate, formatKilledRange } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

function timeGapRem(yearsDiff: number, zoom: number): number {
  if (yearsDiff <= 0) return 0.5 * zoom;
  return Math.min(12 * zoom, (0.5 + yearsDiff * 0.6) * zoom);
}

function yearsBetween(a: Date | string, b: Date | string): number {
  const da = new Date(a);
  const db = new Date(b);
  const diffMs = Math.abs(db.getTime() - da.getTime());
  return diffMs / (365.25 * 24 * 60 * 60 * 1000);
}

function truncateText(text: string, maxChars = 250): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  if (!sentences) {
    return text.length > maxChars ? text.slice(0, maxChars).trimEnd() + "…" : text;
  }
  let result = "";
  for (const s of sentences) {
    if (result.length + s.length > maxChars) break;
    result += s;
  }
  if (!result) {
    return text.slice(0, maxChars).trimEnd() + "…";
  }
  return result.trim();
}

export function InteractiveTimeline({
  events,
  locale,
}: {
  events: any[];
  locale: Locale;
}) {
  const t = useTranslations("timeline");
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.5));
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.5));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-memorial-50 mb-2">
          {t("title")}
        </h1>
        <p className="text-memorial-400">{t("subtitle")}</p>
      </div>

      {/* Zoom controls */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={zoomOut}
          disabled={zoom <= 0.5}
          className="px-3 py-1.5 rounded border border-memorial-700 text-sm text-memorial-300 hover:bg-memorial-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {t("zoomOut")}
        </button>
        <span className="px-3 py-1.5 text-sm text-memorial-500 tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          disabled={zoom >= 3}
          className="px-3 py-1.5 rounded border border-memorial-700 text-sm text-memorial-300 hover:bg-memorial-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {t("zoomIn")}
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-memorial-400 py-12 text-center">
          {t("noEvents")}
        </p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute start-4 sm:start-1/2 top-0 bottom-0 w-px timeline-line" />

          <div>
            {events.map((event: any, index: number) => {
              const title = localized(event, "title", locale);
              const killed = formatKilledRange(
                event.estimatedKilledLow,
                event.estimatedKilledHigh,
                locale
              );
              const isLeft = index % 2 === 0;
              const eventPhoto = event.photos?.[0]?.url;
              const description = localized(event, "description", locale);
              const shortDesc = description ? truncateText(description) : null;

              const prevStart =
                index > 0 ? events[index - 1].dateStart : null;
              const gap = prevStart
                ? yearsBetween(prevStart, event.dateStart)
                : 0;
              const gapRem = index === 0 ? 0 : timeGapRem(gap, zoom);

              return (
                <div key={event.slug}>
                  <div
                    className={`relative flex items-start gap-8 ${
                      isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                    }`}
                    style={{ marginTop: `${gapRem}rem` }}
                  >
                    {/* Dot on timeline */}
                    <div className="absolute start-4 sm:start-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blood-500 border-2 border-memorial-950 z-10 mt-2" />

                    {/* Content */}
                    <div
                      className={`ms-12 sm:ms-0 sm:w-[calc(50%-2rem)] ${
                        isLeft ? "sm:text-end sm:pe-8" : "sm:ps-8"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {eventPhoto && (
                          <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-memorial-800">
                            <Image
                              src={eventPhoto}
                              alt={title || ""}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <time className="text-xs text-memorial-500">
                            {formatDate(event.dateStart, locale)}
                          </time>
                          <h3 className="text-lg font-semibold mt-1">
                            <Link
                              href={`/events/${event.slug}`}
                              className="text-memorial-100 hover:text-gold-400 transition-colors"
                            >
                              {title}
                            </Link>
                          </h3>
                        </div>
                      </div>
                      {killed && (
                        <p className="text-sm text-blood-400 mt-1">
                          {killed} {t("killed")}
                        </p>
                      )}
                      {shortDesc && (
                        <p className="text-sm text-memorial-400 leading-relaxed mt-2">
                          {shortDesc}
                        </p>
                      )}
                      {event._count?.victims > 0 && (
                        <p className="text-xs text-memorial-500 mt-1">
                          {event._count.victims} {t("documented")}
                        </p>
                      )}
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
