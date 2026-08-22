import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { DateRange } from "../lib/types";
import { iso } from "../lib/seed";
import { IChevL, IChevR } from "./icons";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function DatePicker({
  value,
  onChange,
  months = 2,
  blocked = [],
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
  months?: 1 | 2;
  blocked?: string[];
}) {
  const today = useMemo(() => startOfDayLocal(new Date()), []);
  const [offset, setOffset] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);

  const blockedSet = useMemo(() => new Set(blocked), [blocked]);
  const start = value.checkIn ? parseISO(value.checkIn) : null;
  const end = value.checkOut ? parseISO(value.checkOut) : null;
  const previewEnd = !end && start && hovered && parseISO(hovered) > start ? parseISO(hovered) : null;

  const pick = (d: Date) => {
    const dIso = iso(d);
    if (blockedSet.has(dIso)) return;
    if (!start || (start && end)) onChange({ checkIn: dIso, checkOut: null });
    else if (d > start) onChange({ checkIn: value.checkIn!, checkOut: dIso });
    else onChange({ checkIn: dIso, checkOut: null });
  };

  const monthNodes = Array.from({ length: months }, (_, m) => {
    const monthDate = addMonths(startOfMonth(today), offset + m);
    const days = eachDayOfInterval({
      start: startOfWeek(startOfMonth(monthDate)),
      end: endOfMonth(monthDate),
    });
    return (
      <div key={m} className="w-[252px]">
        <p className="mb-3 text-center font-display text-[15px] font-semibold text-pine-900">
          {format(monthDate, "MMMM yyyy")}
        </p>
        <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-bold tracking-wide text-ink-soft">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="py-1">{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((d) => {
            const dIso = iso(d);
            const past = isBefore(d, today);
            const isBlocked = blockedSet.has(dIso);
            const disabled = past || isBlocked || !isSameMonth(d, monthDate);
            const isStart = start ? isSameDay(d, start) : false;
            const isEnd = end ? isSameDay(d, end) : false;
            const effEnd = end ?? previewEnd;
            const inRange =
              !!start && !!effEnd && d > start && d < effEnd && !isBlocked;

            return (
              <button
                key={dIso}
                disabled={disabled}
                onClick={() => pick(d)}
                onMouseEnter={() => setHovered(dIso)}
                onMouseLeave={() => setHovered(null)}
                aria-label={format(d, "EEEE, MMMM do")}
                aria-pressed={isStart || isEnd}
                className={`relative mx-auto h-9 w-9 rounded-full text-[13px] font-semibold transition-all duration-150 ${
                  disabled
                    ? isBlocked
                      ? "cursor-not-allowed text-pine-300 line-through"
                      : "cursor-default text-pine-200/70"
                    : isStart || isEnd
                    ? "bg-pine-800 text-paper shadow-md scale-105"
                    : inRange
                    ? "bg-pine-100 text-pine-900 rounded-none"
                    : "text-ink hover:bg-marigold-200 hover:scale-110"
                }`}
              >
                {format(d, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          className="rounded-full border border-line p-1.5 transition hover:border-pine-500 disabled:opacity-25"
          aria-label="Previous month"
        >
          <IChevL className="h-4 w-4" />
        </button>
        <button
          onClick={() => setOffset((o) => Math.min(10, o + 1))}
          className="rounded-full border border-line p-1.5 transition hover:border-pine-500"
          aria-label="Next month"
        >
          <IChevR className="h-4 w-4" />
        </button>
      </div>
      <div className={`mt-3 flex flex-wrap justify-center gap-8 ${months === 2 ? "sm:flex-nowrap" : ""}`}>
        {monthNodes}
      </div>
      <p className="mt-3 text-center text-xs text-ink-soft">
        {start && !end
          ? "Now pick a check-out night"
          : start && end
          ? `${format(start, "MMM d")} → ${format(end, "MMM d")}`
          : "Select a check-in night"}
      </p>
    </div>
  );
}

function startOfDayLocal(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
