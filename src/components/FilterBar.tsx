import { useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { CATEGORIES } from "../lib/seed";
import { PRICE_MAX, useSearch } from "../lib/search";
import { CATEGORY_ICONS, IChevD, IHeart, IMinus, IPlus, IUsers, IX } from "./icons";
import DatePicker from "./DatePicker";
import { money } from "./ui";
import { useLang } from "../lib/i18n";

type Pop = "price" | "dates" | "guests" | null;

export default function FilterBar({ count: resultCount }: { count: number }) {
  const s = useSearch();
  const { t, count } = useLang();
  const [open, setOpen] = useState<Pop>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pill = (active: boolean) =>
    `flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
      active
        ? "border-pine-800 bg-pine-800 text-paper shadow-sm"
        : "border-line bg-paper text-ink hover:border-pine-400 hover:-translate-y-px"
    }`;

  return (
    <div id="filter-bar" className="sticky top-16 z-30 border-b border-line bg-paper/95 backdrop-blur-md lg:top-[72px]">
      <div ref={ref} className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        {/* categories */}
        <div className="no-scrollbar -mb-px flex gap-2 overflow-x-auto pt-3">
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c];
            const active = s.category === c;
            return (
              <button key={c} onClick={() => s.setCategory(c)} className={`${pill(active)} shrink-0`}>
                {Icon && <Icon className="h-4 w-4" />}
                {t(c)}
              </button>
            );
          })}
        </div>

        {/* controls */}
        <div className="flex flex-wrap items-center gap-2 py-2.5">
          {/* dates */}
          <div className="relative">
            <button onClick={() => setOpen(open === "dates" ? null : "dates")} className={pill(!!s.range.checkIn)}>
              {s.range.checkIn && s.range.checkOut
                ? `${format(parseISO(s.range.checkIn), "MMM d")} – ${format(parseISO(s.range.checkOut), "MMM d")}`
                : t("Dates")}
              <IChevD className={`h-3.5 w-3.5 transition-transform ${open === "dates" ? "rotate-180" : ""}`} />
            </button>
            {open === "dates" && (
              <div className="pop-in absolute left-0 top-[calc(100%+8px)] z-40 rounded-xl border border-line bg-paper p-4 shadow-float">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold">{t("When are you travelling?")}</p>
                  {(s.range.checkIn || s.range.checkOut) && (
                    <button onClick={() => s.setRange({ checkIn: null, checkOut: null })} className="flex items-center gap-1 text-xs font-semibold text-ember-600 hover:underline">
                      <IX className="h-3 w-3" /> {t("Clear")}
                    </button>
                  )}
                </div>
                <DatePicker value={s.range} onChange={s.setRange} months={2} />
                <p className="mt-2 text-xs text-ink-soft">{t("Only stays free for your nights are shown.")}</p>
              </div>
            )}
          </div>

          {/* price */}
          <div className="relative">
            <button onClick={() => setOpen(open === "price" ? null : "price")} className={pill(s.price[0] > 0 || s.price[1] < PRICE_MAX)}>
              {s.price[0] > 0 || s.price[1] < PRICE_MAX
                ? `${money(s.price[0])} – ${s.price[1] >= PRICE_MAX ? `${money(PRICE_MAX)}+` : money(s.price[1])}`
                : t("Price")}
              <IChevD className={`h-3.5 w-3.5 transition-transform ${open === "price" ? "rotate-180" : ""}`} />
            </button>
            {open === "price" && (
              <div className="pop-in absolute left-0 top-[calc(100%+8px)] z-40 w-72 rounded-xl border border-line bg-paper p-5 shadow-float">
                <p className="text-sm font-bold">{t("Nightly price")}</p>
                <div className="relative mt-5 h-8">
                  <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-pine-100" />
                  <div
                    className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-pine-600"
                    style={{
                      left: `${(s.price[0] / PRICE_MAX) * 100}%`,
                      width: `${((s.price[1] - s.price[0]) / PRICE_MAX) * 100}%`,
                    }}
                  />
                  <input
                    type="range" min={0} max={PRICE_MAX} step={500} value={s.price[0]}
                    aria-label="Minimum price"
                    onChange={(e) => s.setPrice([Math.min(+e.target.value, s.price[1] - 1000), s.price[1]])}
                    className="range-dual"
                  />
                  <input
                    type="range" min={0} max={PRICE_MAX} step={500} value={s.price[1]}
                    aria-label="Maximum price"
                    onChange={(e) => s.setPrice([s.price[0], Math.max(+e.target.value, s.price[0] + 1000)])}
                    className="range-dual"
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs font-semibold text-ink-soft">
                  <span>{money(s.price[0])}</span>
                  <span>{s.price[1] >= PRICE_MAX ? `${money(PRICE_MAX)}+` : money(s.price[1])}</span>
                </div>
              </div>
            )}
          </div>

          {/* guests */}
          <div className="relative">
            <button onClick={() => setOpen(open === "guests" ? null : "guests")} className={pill(s.guests > 0)}>
              <IUsers className="h-4 w-4" />
              {s.guests > 0 ? `${count(s.guests, "guest", "guests")}+` : t("Guests")}
              <IChevD className={`h-3.5 w-3.5 transition-transform ${open === "guests" ? "rotate-180" : ""}`} />
            </button>
            {open === "guests" && (
              <div className="pop-in absolute left-0 top-[calc(100%+8px)] z-40 w-64 rounded-xl border border-line bg-paper p-5 shadow-float">
                <p className="text-sm font-bold">{t("How many travellers?")}</p>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => s.setGuests(Math.max(0, s.guests - 1))}
                    className="grid h-9 w-9 place-items-center rounded-full border border-line transition hover:border-pine-500 disabled:opacity-30"
                    disabled={s.guests === 0}
                    aria-label="Fewer guests"
                  >
                    <IMinus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-bold">{s.guests === 0 ? t("Any") : s.guests}</span>
                  <button
                    onClick={() => s.setGuests(Math.min(12, s.guests + 1))}
                    className="grid h-9 w-9 place-items-center rounded-full border border-line transition hover:border-pine-500 disabled:opacity-30"
                    disabled={s.guests === 12}
                    aria-label="More guests"
                  >
                    <IPlus className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-xs text-ink-soft">{t("any.note")}</p>
              </div>
            )}
          </div>

          {/* saved */}
          <button onClick={() => s.setSavedOnly(!s.savedOnly)} className={pill(s.savedOnly)}>
            <IHeart className="h-4 w-4" filled={s.savedOnly} />
            {t("Saved")}
          </button>

          {s.activeCount > 0 && (
            <button onClick={s.reset} className="flex items-center gap-1 px-2 py-1 text-sm font-semibold text-pine-700 underline-offset-2 transition hover:underline">
              <IX className="h-3.5 w-3.5" /> {t("Clear all")} ({s.activeCount})
            </button>
          )}

          <p className="ml-auto hidden text-sm text-ink-soft md:block">
            <span className="font-bold text-ink">{resultCount}</span> {t("stays across Ethiopia")}
          </p>

          {/* sort + view */}
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <select
              value={s.sort}
              onChange={(e) => s.setSort(e.target.value)}
              aria-label="Sort stays"
              className="cursor-pointer rounded-full border border-line bg-paper px-3.5 py-2 text-sm font-semibold text-ink outline-none transition hover:border-pine-400"
            >
              <option value="recommended">{t("Recommended")}</option>
              <option value="price-asc">{t("Price · low to high")}</option>
              <option value="price-desc">{t("Price · high to low")}</option>
              <option value="rating">{t("Top rated")}</option>
            </select>
            <div className="hidden overflow-hidden rounded-full border border-line lg:flex">
              <button
                onClick={() => s.setViewMode("split")}
                className={`px-3 py-2 text-xs font-bold tracking-wide transition ${s.viewMode === "split" ? "bg-pine-800 text-paper" : "bg-paper text-ink hover:bg-parch"}`}
              >
                {t("MAP + GRID")}
              </button>
              <button
                onClick={() => s.setViewMode("grid")}
                className={`px-3 py-2 text-xs font-bold tracking-wide transition ${s.viewMode === "grid" ? "bg-pine-800 text-paper" : "bg-paper text-ink hover:bg-parch"}`}
              >
                {t("GRID")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
