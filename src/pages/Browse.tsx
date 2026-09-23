import { useMemo, useState } from "react";
import { addDays, areIntervalsOverlapping, parseISO } from "date-fns";
import { useStore } from "../lib/store";
import { useSearch, PRICE_MAX } from "../lib/search";
import FilterBar from "../components/FilterBar";
import StayCard from "../components/StayCard";
import MapView from "../components/MapView";
import { Reveal } from "../components/ui";
import { ICompass, IGrid, IMap, IPin, ISparkle } from "../components/icons";
import { useConcierge } from "../components/Concierge";
import { useLang } from "../lib/i18n";
import { TOWNS } from "../lib/seed";

export default function Browse() {
  const { listings, bookings, favorites } = useStore();
  const s = useSearch();
  const concierge = useConcierge();
  const { t } = useLang();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileMap, setMobileMap] = useState(false);

  const results = useMemo(() => {
    const q = s.query.trim().toLowerCase();
    let out = listings.filter((l) => l.status === "active");

    if (q)
      out = out.filter((l) =>
        [l.title, l.town, l.type, l.region, ...l.tags].join(" ").toLowerCase().includes(q)
      );
    if (s.category !== "All stays") out = out.filter((l) => l.tags.includes(s.category));
    out = out.filter((l) => l.price >= s.price[0] && (s.price[1] >= PRICE_MAX || l.price <= s.price[1]));
    if (s.guests > 0) out = out.filter((l) => l.guests >= s.guests);
    if (s.savedOnly) out = out.filter((l) => favorites.includes(l.id));
    if (s.range.checkIn && s.range.checkOut) {
      const req = { start: parseISO(s.range.checkIn), end: addDays(parseISO(s.range.checkOut), -1) };
      out = out.filter(
        (l) =>
          !bookings.some(
            (b) =>
              b.listingId === l.id &&
              b.status === "confirmed" &&
              areIntervalsOverlapping(req, {
                start: parseISO(b.checkIn),
                end: addDays(parseISO(b.checkOut), -1),
              })
          )
      );
    }

    switch (s.sort) {
      case "price-asc":
        out = [...out].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        out = [...out].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        out = [...out].sort((a, b) => b.rating - a.rating);
        break;
      default:
        out = [...out].sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return out;
  }, [listings, bookings, favorites, s.query, s.category, s.price, s.guests, s.savedOnly, s.range, s.sort]);

  const avgRating = useMemo(() => {
    const rated = listings.filter((l) => l.rating > 0);
    return rated.reduce((a, l) => a + l.rating, 0) / Math.max(1, rated.length);
  }, [listings]);

  return (
    <div>
      {/* ---- opening band: the highlands themselves ---- */}
      <section className="topo relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-pine-100/60 via-transparent to-marigold-100/50" />
        <div className="relative mx-auto max-w-[1500px] px-4 pb-8 pt-10 sm:px-6 lg:px-10 lg:pb-10 lg:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="mask-line text-xs font-bold tracking-[0.28em] text-pine-600">
                <span style={{ "--d": "80ms" } as React.CSSProperties}>{t("9.1° N — THE ETHIOPIAN HIGHLANDS")}</span>
              </p>
              <h1 className="mt-3 font-display text-[40px] font-semibold leading-[1.02] tracking-tight text-pine-950 sm:text-5xl lg:text-[56px]">
                <span className="mask-line"><span style={{ "--d": "140ms" } as React.CSSProperties}>{t("Every kind of quiet,")}</span></span>
                <span className="mask-line"><span style={{ "--d": "260ms" } as React.CSSProperties}>{t("one")} <em className="not-italic text-pine-600">{t("ancient")}</em> {t("land.")}</span></span>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                {t("hero.body")}
              </p>
            </div>
            <dl className="flex gap-8 border-l-2 border-pine-700/30 pl-6">
              <div>
                <dt className="text-[11px] font-bold tracking-[0.18em] text-ink-soft">{t("STAYS")}</dt>
                <dd className="font-display text-3xl font-semibold text-pine-800">{listings.filter((l) => l.status === "active").length}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold tracking-[0.18em] text-ink-soft">{t("AVG RATING")}</dt>
                <dd className="font-display text-3xl font-semibold text-pine-800">{avgRating.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold tracking-[0.18em] text-ink-soft">{t("TOWNS")}</dt>
                <dd className="font-display text-3xl font-semibold text-pine-800">{TOWNS.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="tibeb" aria-hidden="true" />

      <FilterBar count={results.length} />

      {/* mobile map toggle */}
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 pt-4 sm:px-6 lg:hidden">
        <p className="text-sm text-ink-soft"><span className="font-bold text-ink">{results.length}</span> {t("stays")}</p>
        <div className="flex overflow-hidden rounded-full border border-line">
          <button onClick={() => setMobileMap(false)} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold ${!mobileMap ? "bg-pine-800 text-paper" : "bg-paper"}`}>
            <IGrid className="h-3.5 w-3.5" /> {t("Grid")}
          </button>
          <button onClick={() => setMobileMap(true)} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold ${mobileMap ? "bg-pine-800 text-paper" : "bg-paper"}`}>
            <IMap className="h-3.5 w-3.5" /> {t("Map")}
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10">
        <div className={`gap-8 lg:flex ${mobileMap ? "hidden lg:flex" : ""}`}>
          {/* grid */}
          <div className={`min-w-0 flex-1 ${mobileMap ? "hidden lg:block" : ""}`}>
            {results.length === 0 ? (
              <div className="grid place-items-center rounded-xl border border-dashed border-pine-300 bg-pine-50/50 px-6 py-24 text-center">
                <ICompass className="h-10 w-10 text-pine-400" />
                <h2 className="mt-4 font-display text-2xl font-semibold text-pine-900">{t("Nothing on the chart here")}</h2>
                <p className="mt-2 max-w-sm text-sm text-ink-soft">
                  No stays match that combination of filters. Loosen the price range or clear your dates — the highlands are patient.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                  <button onClick={s.reset} className="rounded-full bg-pine-800 px-6 py-2.5 text-sm font-bold text-paper transition hover:bg-pine-700">
                    {t("Clear all filters")}
                  </button>
                  <button
                    onClick={() => { s.reset(); concierge.setOpen(true); }}
                    className="flex items-center gap-1.5 rounded-full border border-pine-300 bg-paper px-5 py-2.5 text-sm font-bold text-pine-800 transition hover:bg-pine-50"
                  >
                    <ISparkle className="h-3.5 w-3.5 text-marigold-600" /> {t("Ask the concierge")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((l, i) => (
                  <Reveal key={l.id} delay={(i % 3) * 80} as="div">
                    <div onMouseEnter={() => setHoveredId(l.id)} onMouseLeave={() => setHoveredId(null)}>
                      <StayCard listing={l} />
                    </div>
                  </Reveal>
                ))}
              </div>
            )}

            {/* survey note */}
            <Reveal className="mt-14">
              <div className="flex flex-col items-start gap-4 rounded-xl border border-line bg-parch/60 p-6 sm:flex-row sm:items-center">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pine-800 text-paper">
                  <IPin className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-pine-900">Every pin is a place we've slept</h3>
                  <p className="text-sm text-ink-soft">
                    Listings are surveyed in person — water pressure tested, mattresses judged, sunsets logged. Hosts you meet here are neighbours, not portfolios.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* map */}
          {s.viewMode === "split" && (
            <div className={`lg:sticky lg:top-[132px] lg:h-[calc(100vh-156px)] lg:w-[44%] lg:shrink-0 ${mobileMap ? "block h-[70vh] lg:h-[calc(100vh-156px)]" : "hidden lg:block"}`}>
              <MapView
                listings={results}
                hoveredId={hoveredId}
                onHover={setHoveredId}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
