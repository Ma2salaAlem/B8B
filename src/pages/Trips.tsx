import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useStore } from "../lib/store";
import { Avatar, Modal, Reveal, money } from "../components/ui";
import { ICalendar, IPin, IUsers, IArrowR, ITrash } from "../components/icons";

type Tab = "upcoming" | "past" | "cancelled";

export default function Trips() {
  const { currentUser, bookings, listings, cancelBooking } = useStore();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [cancelId, setCancelId] = useState<string | null>(null);

  const mine = useMemo(
    () => (currentUser ? bookings.filter((b) => b.travelerId === currentUser.id) : []),
    [bookings, currentUser]
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets: Record<Tab, typeof mine> = useMemo(
    () => ({
      upcoming: mine.filter((b) => b.status === "confirmed" && parseISO(b.checkOut) >= today),
      past: mine.filter((b) => b.status === "confirmed" && parseISO(b.checkOut) < today),
      cancelled: mine.filter((b) => b.status === "cancelled"),
    }),
    [mine, today.getTime()] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!currentUser) return <Navigate to="/auth?next=/trips" replace />;

  const rows = buckets[tab];
  const cancelling = bookings.find((b) => b.id === cancelId);

  const pill: Record<Tab, string> = {
    upcoming: "bg-pine-100 text-pine-800",
    past: "bg-parch text-ink-soft",
    cancelled: "bg-[#fbeee9] text-ember-600",
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-10">
      <p className="mask-line text-xs font-bold tracking-[0.28em] text-pine-600">
        <span>YOUR TRIPS</span>
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-pine-950">
          <span className="mask-line"><span style={{ "--d": "120ms" } as React.CSSProperties}>Bags packed, {currentUser.name.split(" ")[0]}?</span></span>
        </h1>
        <Link to="/" className="group flex items-center gap-2 text-sm font-bold text-pine-700 hover:text-pine-600">
          Find another stay <IArrowR className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* tabs */}
      <div className="mt-8 flex gap-2 border-b border-line">
        {(["upcoming", "past", "cancelled"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-3 text-sm font-bold capitalize transition ${
              tab === t ? "text-pine-800" : "text-ink-soft hover:text-ink"
            }`}
          >
            {t} <span className="ml-1 rounded-full bg-parch px-2 py-0.5 text-xs">{buckets[t].length}</span>
            {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-pine-700" />}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {rows.length === 0 ? (
          <div className="grid place-items-center rounded-xl border border-dashed border-pine-300 bg-pine-50/50 px-6 py-20 text-center">
            <IPin className="h-9 w-9 text-pine-400" />
            <h2 className="mt-4 font-display text-xl font-semibold text-pine-900">
              {tab === "upcoming" ? "No trips on the horizon" : tab === "past" ? "Nothing in the logbook yet" : "No cancellations — good"}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-ink-soft">
              {tab === "upcoming"
                ? "The coast isn't going anywhere, but the good dates do. Pick your next haven."
                : tab === "past"
                ? "Your stayed nights will collect here like sea glass."
                : "Cancelled reservations are kept here for your records."}
            </p>
            {tab === "upcoming" && (
              <Link to="/" className="mt-5 rounded-full bg-pine-800 px-6 py-2.5 text-sm font-bold text-paper transition hover:bg-pine-700">
                Browse stays
              </Link>
            )}
          </div>
        ) : (
          rows.map((b, i) => {
            const listing = listings.find((l) => l.id === b.listingId);
            if (!listing) return null;
            const isPast = parseISO(b.checkOut) < today;
            return (
              <Reveal key={b.id} delay={i * 70} as="article">
                <div className={`flex flex-col gap-5 rounded-xl border border-line bg-paper p-4 shadow-sm transition hover:shadow-lift sm:flex-row sm:items-center ${b.status === "cancelled" ? "opacity-70" : ""}`}>
                  <Link to={`/stay/${listing.id}`} className="group relative block h-44 shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-48">
                    <img src={listing.photo} alt={listing.title} className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${b.status === "cancelled" ? "grayscale" : ""}`} />
                    <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${pill[b.status === "cancelled" ? "cancelled" : isPast ? "past" : "upcoming"]}`}>
                      {b.status === "cancelled" ? "Cancelled" : isPast ? "Stayed" : "Upcoming"}
                    </span>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/stay/${listing.id}`} className="font-display text-lg font-semibold text-pine-950 transition hover:text-pine-700">
                      {listing.title}
                    </Link>
                    <p className="text-sm text-ink-soft">{listing.type} · {listing.town}</p>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-ink">
                      <span className="flex items-center gap-1.5"><ICalendar className="h-4 w-4 text-pine-600" /> {format(parseISO(b.checkIn), "MMM d")} – {format(parseISO(b.checkOut), "MMM d, yyyy")}</span>
                      <span className="flex items-center gap-1.5"><IUsers className="h-4 w-4 text-pine-600" /> {b.guests} guest{b.guests > 1 ? "s" : ""} · {b.nights} nights</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <p className="text-lg font-bold">{money(b.total)}</p>
                    {b.status === "confirmed" && !isPast ? (
                      <button onClick={() => setCancelId(b.id)} className="flex items-center gap-1.5 rounded-full border border-ember-500/40 px-4 py-2 text-xs font-bold text-ember-600 transition hover:bg-ember-500 hover:text-paper">
                        <ITrash className="h-3.5 w-3.5" /> Cancel trip
                      </button>
                    ) : (
                      <Link to={`/stay/${listing.id}`} className="text-xs font-bold text-pine-700 underline-offset-2 hover:underline">
                        {isPast ? "Stay again?" : "View listing"}
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })
        )}
      </div>

      {/* cancel confirm */}
      <Modal open={!!cancelId} onClose={() => setCancelId(null)}>
        {cancelling && (
          <div className="p-7">
            <h2 className="font-display text-2xl font-semibold text-pine-950">Cancel this trip?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              You'd give up <span className="font-bold text-ink">{cancelling.nights} nights</span> at{" "}
              {listings.find((l) => l.id === cancelling.listingId)?.title} (
              {format(parseISO(cancelling.checkIn), "MMM d")} – {format(parseISO(cancelling.checkOut), "MMM d")}).
              The dates open back up for other travellers immediately, and the {money(cancelling.total)} hold is released.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setCancelId(null)} className="rounded-full border border-line px-5 py-2.5 text-sm font-bold transition hover:bg-parch">
                Keep it
              </button>
              <button
                onClick={() => { cancelBooking(cancelling.id); setCancelId(null); }}
                className="rounded-full bg-ember-500 px-5 py-2.5 text-sm font-bold text-paper transition hover:bg-ember-600"
              >
                Cancel trip
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
