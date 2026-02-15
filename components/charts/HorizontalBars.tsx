import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/utils";

export function HorizontalBars({
  data,
  locale,
  color,
}: {
  data: { label: string; count: number }[];
  locale: Locale;
  color: string;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      {data.map(({ label, count }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="text-sm text-memorial-300 w-36 sm:w-44 text-end flex-shrink-0 truncate">
            {label}
          </span>
          <div className="flex-1 h-6 bg-memorial-800/50 rounded overflow-hidden">
            <div
              className={`h-full rounded ${color}`}
              style={{ width: `${(count / maxCount) * 100}%` }}
            />
          </div>
          <span className="text-xs text-memorial-400 w-14 text-end tabular-nums flex-shrink-0">
            {formatNumber(count, locale)}
          </span>
        </div>
      ))}
    </div>
  );
}
