import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addDays, differenceInDays, eachDayOfInterval, format, parseISO } from "date-fns";
import { useStore } from "../lib/store";
import { iso, SEED_REVIEWS } from "../lib/seed";
import type { DateRange } from "../lib/types";
import DatePicker from "../components/DatePicker";
import StayCard from "../components/StayCard";
import { EthiopiaChart } from "../components/MapView";
import { Avatar, Modal, Reveal, Stars, money } from "../components/ui";
import {
  AMENITY_ICONS, IBath, IBed, IChevL, IChevR, IHeart, IMinus, IPin, IPlus, IRuler, IStar, IUsers, IX, ICheck,
} from "../components/icons";

export default function Stay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings, bookings, currentUser, isFav, toggleFav, createBooking, recordView, toast, users } = useStore();
  const listing = listings.find((l) => l.id === id);

  const [range, setRange] = useState<DateRange>({ checkIn: null, checkOut: null });
  const [guests, setGuests] = useState(1);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const viewed = useRef(false);

  useEffect(() => {
    if (listing && !viewed.current) {
      viewed.current = true;
      recordView(listing.id);
    }
  }, [listing, recordView]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (!listing) return;
      if (e.key === "ArrowRight") setLightbox((v) => (v === null ? v : (v + 1) % listing.gallery.length));
      if (e.key === "ArrowLeft") setLightbox((v) => (v === null ? v : (v - 1 + listing.gallery.length) % listing.gallery.length));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, listing]);

  const blocked = useMemo(() => {
    if (!listing) return [];
    const days: string[] = [];
    bookings
      .filter((b) => b.listingId === listing.id && b.status === "confirmed")
      .forEach((b) =>
        eachDayOfInterval({ start: parseISO(b.checkIn), end: addDays(parseISO(b.checkOut), -1) }).forEach((d) =>
          days.push(iso(d))
        )
      );
    return days;
  }, [bookings, listing]);

  const rating = listing?.rating ?? 0;
  const bars = useMemo(() => {
    const p5 = Math.min(92, Math.round(52 + (rating - 4.8) * 170));
    const p4 = Math.round((100 - p5) * 0.62);
    return [
      { label: "5", w: p5 },
      { label: "4", w: p4 },
      { label: "3", w: Math.max(2, 100 - p5 - p4 - 4) },
      { label: "2", w: 3 },
      { label: "1", w: 1 },
    ];
  }, [rating]);

  if (!listing) {
    return (
      <div className="mx-auto max-w-xl px-6 py-28 text-center">
        <h1 className="font-display text-3xl font-semibold">This stay has wandered off the chart</h1>
        <p className="mt-3 text-ink-soft">The listing you're after doesn't exist (yet).</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-pine-800 px-6 py-3 text-sm font-bold text-paper hover:bg-pine-700">
          Back to the highlands
        </Link>
      </div>
    );
  }

  const host = users.find((u) => u.id === listing.hostId);
  const reviews = SEED_REVIEWS.filter((r) => r.listingId === listing.id);
  const nights = range.checkIn && range.checkOut ? differenceInDays(parseISO(range.checkOut), parseISO(range.checkIn)) : 0;
  const nightly = nights * listing.price;
  const service = Math.round(nightly * 0.12);
  const total = nightly + listing.cleaningFee + service;
  const fav = isFav(listing.id);

  const reserve = () => {
    if (!range.checkIn || !range.checkOut) {
      toast("info", "Pick your nights on the calendar first.");
      return;
    }
    if (!currentUser) {
      toast("info", "Sign in to finish reserving — it takes ten seconds.");
      navigate(`/auth?next=/stay/${listing.id}`);
      return;
    }
    const res = createBooking({ listingId: listing.id, range, guests });
    if (res.ok) {
      toast("success", `${listing.title} is booked — ${format(parseISO(range.checkIn!), "MMM d")} to ${format(parseISO(range.checkOut!), "MMM d")}.`);
      navigate("/trips");
    } else {
      toast("error", res.error);
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("success", "Link copied — send it to your travel group.");
    } catch {
      toast("info", "Copy this page's link from the address bar.");
    }
  };

  const similar = listings.filter((l) => l.id !== listing.id && l.status === "active" && (l.town === listing.town || l.tags.some((t) => listing.tags.includes(t)))).slice(0, 3);

  const shot = (i: number, cls: string, kenburns = false) => {
    const g = listing.gallery[i];
    return (
      <div className={`overflow-hidden ${cls}`}>
        <img
          src={listing.photo}
          alt={g.caption}
          className={`h-full w-full object-cover transition-transform duration-700 hover:scale-105 ${kenburns ? "kenburns" : ""}`}
          style={{ objectPosition: g.pos, transform: `scale(${g.scale})` }}
        />
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6 lg:px-10">
      {/* breadcrumb */}
      <nav className="flex items-center gap-2 py-5 text-sm text-ink-soft">
        <Link to="/" className="font-semibold text-pine-700 hover:underline">Ethiopia</Link>
        <span>/</span>
        <Link to="/" className="hover:underline">{listing.town}</Link>
        <span>/</span>
        <span className="truncate">{listing.title}</span>
      </nav>

      {/* title */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-pine-950 sm:text-4xl">
            <span className="mask-line"><span>{listing.title}</span></span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5 font-semibold">
              <IStar className="h-4 w-4 text-marigold-500" />
              {listing.rating > 0 ? listing.rating.toFixed(2) : "New"}
              <span className="font-normal text-ink-soft">· {listing.reviewCount || "no"} reviews</span>
            </span>
            <span className="flex items-center gap-1 text-ink-soft">
              <IPin className="h-4 w-4 text-pine-600" /> {listing.town}, {listing.region}
            </span>
            {host?.superhost && (
              <span className="rounded-full bg-marigold-200 px-2.5 py-0.5 text-xs font-bold text-marigold-700">SUPERHOST</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={share} className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:border-pine-400 hover:bg-parch">
            Share
          </button>
          <button
            onClick={() => toggleFav(listing.id)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              fav ? "border-ember-500/40 bg-[#fbeee9] text-ember-600" : "border-line hover:border-pine-400 hover:bg-parch"
            }`}
          >
            <IHeart className="h-4 w-4" filled={fav} /> {fav ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* gallery */}
      <div className="relative mt-6 grid grid-rows-2 gap-2 overflow-hidden rounded-2xl md:grid-cols-4 md:grid-rows-2">
        <div className="row-span-2 md:col-span-2">{shot(0, "h-64 w-full md:h-full", true)}</div>
        <div className="hidden md:block">{shot(1, "h-full w-full")}</div>
        <div className="hidden md:block">{shot(2, "h-full w-full")}</div>
        <button
          onClick={() => setLightbox(0)}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-ink/20 bg-paper px-4 py-2 text-sm font-bold shadow-lift transition hover:-translate-y-0.5 hover:shadow-float"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>
          Show all {listing.gallery.length} photos
        </button>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_390px]">
        {/* ------------ left column ------------ */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
            <div className="flex items-center gap-4">
              {host && <Avatar name={host.name} hue={host.hue} size="lg" />}
              <div>
                <p className="font-display text-lg font-semibold">
                  {listing.type} hosted by {host?.name.split(" ")[0] ?? "Haven"}
                </p>
                <p className="text-sm text-ink-soft">Hosting since {host ? format(parseISO(host.joined), "yyyy") : "—"}</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              {[
                { icon: IUsers, label: `${listing.guests} guests` },
                { icon: IBed, label: `${listing.beds} beds` },
                { icon: IBath, label: `${listing.baths} baths` },
                { icon: IRuler, label: `${listing.sqft.toLocaleString()} sq ft` },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2 font-semibold text-pine-800">
                  <Icon className="h-5 w-5 text-pine-600" /> {label}
                </span>
              ))}
            </div>
          </div>

          <section className="border-b border-line py-6">
            <h2 className="font-display text-xl font-semibold text-pine-950">About this stay</h2>
            <p className="mt-3 leading-relaxed text-ink">{listing.description}</p>
          </section>

          <section className="border-b border-line py-6">
            <h2 className="font-display text-xl font-semibold text-pine-950">What this place offers</h2>
            <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {listing.amenities.map((a) => {
                const Icon = AMENITY_ICONS[a];
                return (
                  <li key={a} className="flex items-center gap-3 text-[15px] font-medium">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-pine-100 text-pine-700">
                      {Icon ? <Icon className="h-4.5 w-4.5" /> : <ICheck className="h-4 w-4" />}
                    </span>
                    {a}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="border-b border-line py-6">
            <h2 className="font-display text-xl font-semibold text-pine-950">Where you'll be</h2>
            <p className="mt-1 text-sm text-ink-soft">{listing.town} · {listing.region}</p>
            <div className="mt-4 overflow-hidden rounded-xl border border-line">
              <svg viewBox="120 30 760 660" className="h-72 w-full" role="img" aria-label={`Map showing ${listing.title} in ${listing.town}`}>
                <EthiopiaChart>
                  <g transform={`translate(${listing.mapX} ${listing.mapY})`}>
                    <circle r="18" fill="#2C614B" opacity="0.3" className="pin-pulse" />
                    <circle r="8" fill="#E39B31" stroke="#16312A" strokeWidth="3" />
                  </g>
                </EthiopiaChart>
              </svg>
            </div>
          </section>

          {/* reviews */}
          <section className="py-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-pine-950">
              <IStar className="h-5 w-5 text-marigold-500" />
              {listing.rating > 0 ? `${listing.rating.toFixed(2)} · ${listing.reviewCount} reviews` : "New listing — no reviews yet"}
            </h2>
            {listing.rating > 0 && (
              <>
                <div className="mt-5 grid gap-8 md:grid-cols-[220px_1fr]">
                  <div className="space-y-1.5">
                    {bars.map((b) => (
                      <div key={b.label} className="flex items-center gap-3 text-xs font-bold">
                        <span className="w-3 text-ink-soft">{b.label}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-pine-100">
                          <div className="h-full rounded-full bg-marigold-500 transition-all duration-700" style={{ width: `${b.w}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {reviews.length > 0 ? (
                      reviews.map((r, i) => (
                        <Reveal key={r.id} delay={i * 70}>
                          <div className="flex items-center gap-3">
                            <Avatar name={r.author} hue={(r.author.charCodeAt(0) * 47) % 360} size="sm" />
                            <div>
                              <p className="text-sm font-bold">{r.author}</p>
                              <p className="text-xs text-ink-soft">{format(parseISO(r.date), "MMMM yyyy")}</p>
                            </div>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-ink">{r.text}</p>
                        </Reveal>
                      ))
                    ) : (
                      <p className="text-sm text-ink-soft">Be the first to stay and review this place.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        {/* ------------ booking panel ------------ */}
        <aside className="lg:sticky lg:top-[100px] lg:self-start">
          <div className="rounded-2xl border border-line bg-paper p-6 shadow-float">
            <div className="flex items-baseline justify-between">
              <p className="text-xl">
                <span className="font-display text-2xl font-bold text-pine-950">{money(listing.price)}</span>
                <span className="text-ink-soft"> night</span>
              </p>
              <span className="flex items-center gap-1 text-sm font-semibold">
                <IStar className="h-3.5 w-3.5 text-marigold-500" />
                {listing.rating > 0 ? listing.rating.toFixed(2) : "New"}
              </span>
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <DatePicker value={range} onChange={setRange} months={2} blocked={blocked} />
            </div>

            {/* guests */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-line px-4 py-3">
              <span className="text-sm font-semibold">Guests</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} className="grid h-8 w-8 place-items-center rounded-full border border-line transition hover:border-pine-500 disabled:opacity-30" aria-label="Fewer guests">
                  <IMinus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold">{guests}</span>
                <button onClick={() => setGuests((g) => Math.min(listing.guests, g + 1))} disabled={guests >= listing.guests} className="grid h-8 w-8 place-items-center rounded-full border border-line transition hover:border-pine-500 disabled:opacity-30" aria-label="More guests">
                  <IPlus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1.5 text-right text-xs text-ink-soft">This stay hosts up to {listing.guests}</p>

            <button
              onClick={reserve}
              className="mt-5 w-full rounded-xl bg-pine-800 py-3.5 text-[15px] font-bold text-paper shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-pine-700 hover:shadow-float active:translate-y-0"
            >
              {nights > 0 ? `Reserve ${nights} night${nights > 1 ? "s" : ""}` : "Check availability"}
            </button>
            <p className="mt-2 text-center text-xs text-ink-soft">{currentUser ? "You won't be charged yet" : "Sign-in needed to confirm"}</p>

            {nights > 0 && (
              <dl className="fade-in mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft underline decoration-dotted underline-offset-4">{money(listing.price)} × {nights} nights</dt>
                  <dd className="font-semibold">{money(nightly)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft underline decoration-dotted underline-offset-4">Cleaning fee</dt>
                  <dd className="font-semibold">{money(listing.cleaningFee)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft underline decoration-dotted underline-offset-4">Haven service fee (12%)</dt>
                  <dd className="font-semibold">{money(service)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
                  <dt>Total</dt>
                  <dd>{money(total)}</dd>
                </div>
              </dl>
            )}

            <p className="mt-5 flex items-start gap-2 rounded-lg bg-pine-50 p-3 text-xs leading-relaxed text-pine-800">
              <ICheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Free cancellation for 48 hours. Struck-through dates on the calendar are already booked.
            </p>
          </div>
        </aside>
      </div>

      {/* similar stays */}
      {similar.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="font-display text-2xl font-semibold text-pine-950">More havens nearby</h2>
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l, i) => (
              <Reveal key={l.id} delay={i * 90}>
                <StayCard listing={l} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* lightbox */}
      <Modal open={lightbox !== null} onClose={() => setLightbox(null)} wide>
        {lightbox !== null && (
          <div className="p-4 sm:p-6">
            <div className="relative h-[46vh] overflow-hidden rounded-xl bg-pine-950 sm:h-[58vh]">
              <img
                key={lightbox}
                src={listing.photo}
                alt={listing.gallery[lightbox].caption}
                className="fade-in h-full w-full object-cover"
                style={{ objectPosition: listing.gallery[lightbox].pos, transform: `scale(${listing.gallery[lightbox].scale})` }}
              />
              <button
                onClick={() => setLightbox((lightbox - 1 + listing.gallery.length) % listing.gallery.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-paper/95 p-2.5 shadow-lift transition hover:scale-110"
                aria-label="Previous photo"
              >
                <IChevL className="h-5 w-5" />
              </button>
              <button
                onClick={() => setLightbox((lightbox + 1) % listing.gallery.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-paper/95 p-2.5 shadow-lift transition hover:scale-110"
                aria-label="Next photo"
              >
                <IChevR className="h-5 w-5" />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-pine-950/80 px-3 py-1 text-xs font-bold text-paper">
                {lightbox + 1} / {listing.gallery.length}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
              <p className="font-display text-lg font-semibold">{listing.gallery[lightbox].caption}</p>
              <button onClick={() => setLightbox(null)} className="text-sm font-semibold text-ink-soft hover:underline">Close (Esc)</button>
            </div>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {listing.gallery.map((g, i) => (
                <button key={i} onClick={() => setLightbox(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === lightbox ? "border-pine-700" : "border-transparent opacity-60 hover:opacity-100"}`} aria-label={`Photo ${i + 1}`}>
                  <img src={listing.photo} alt="" className="h-full w-full object-cover" style={{ objectPosition: g.pos, transform: `scale(${Math.max(1, g.scale * 0.8)})` }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
