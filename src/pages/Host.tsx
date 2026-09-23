import { useMemo, useState, type MouseEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useStore, type NewListingInput } from "../lib/store";
import { AMENITIES, PHOTO_POOL, TOWNS, townCoords } from "../lib/seed";
import { EthiopiaChart } from "../components/MapView";
import { Avatar, Counter, Reveal, Stars, Toggle, money } from "../components/ui";
import {
  IArrowR, IBanknote, ICalendar, IEye, IGauge, ILogo, IPencil, IPin, IPlus, IStar, IX, ICheck,
} from "../components/icons";

// Keys double as the listing types offered in the form; values must be CATEGORIES from seed.ts.
const TYPE_TAGS: Record<string, string[]> = {
  "A-frame": ["Highlands"],
  Chalet: ["Timberline", "Highlands"],
  Treehouse: ["Treehouses", "Highlands"],
  "Courtyard house": ["Heritage", "Design"],
  "Glass house": ["Design"],
  Loft: ["Design"],
  "Shore house": ["Lakeshore"],
  Villa: ["Lakeshore", "Design"],
  Lakeboat: ["Lakeshore"],
  Farmhouse: ["Countryside"],
};

export default function Host() {
  const { currentUser, listings, bookings, updateListing, toast } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mine = useMemo(
    () => (currentUser ? listings.filter((l) => l.hostId === currentUser.id) : []),
    [listings, currentUser]
  );
  const myBookings = useMemo(
    () =>
      bookings
        .filter((b) => mine.some((l) => l.id === b.listingId))
        .sort((a, b) => (a.checkIn < b.checkIn ? 1 : -1)),
    [bookings, mine]
  );

  if (!currentUser) return <Navigate to="/auth?next=/host" replace />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeCount = mine.filter((l) => l.status === "active").length;
  const upcoming = myBookings.filter((b) => b.status === "confirmed" && parseISO(b.checkOut) >= today);
  const revenue = myBookings.filter((b) => b.status === "confirmed").reduce((a, b) => a + b.total, 0);
  const rated = mine.filter((l) => l.rating > 0);
  const avgRating = rated.length ? rated.reduce((a, l) => a + l.rating, 0) / rated.length : 0;
  const totalViews = mine.reduce((a, l) => a + l.views, 0);

  const stats = [
    { icon: IPin, label: "Listings live", value: activeCount, suffix: "" },
    { icon: ICalendar, label: "Upcoming stays", value: upcoming.length, suffix: "" },
    { icon: IBanknote, label: "Booking value", value: revenue, prefix: "$", suffix: "" },
    { icon: IGauge, label: "Listing views", value: totalViews, suffix: "" },
  ];

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mask-line text-xs font-bold tracking-[0.28em] text-pine-600"><span>HOST DASHBOARD</span></p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-pine-950">
            <span className="mask-line"><span style={{ "--d": "120ms" } as React.CSSProperties}>Ahoy, {currentUser.name.split(" ")[0]}.</span></span>
          </h1>
          <p className="mt-2 text-[15px] text-ink-soft">
            {mine.length > 0
              ? `Your ${mine.length} listing${mine.length > 1 ? "s" : ""} hosted ${myBookings.filter((b) => b.status === "confirmed").length} bookings all-time.`
              : "You're one listing away from your first booking."}
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 rounded-full bg-pine-800 px-6 py-3 text-sm font-bold text-paper shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-pine-700 hover:shadow-float"
        >
          <IPlus className="h-4 w-4" /> Add a listing
        </button>
      </div>

      {/* stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 80}>
            <div className="group rounded-xl border border-line bg-paper p-5 transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-lift">
              <s.icon className="h-5 w-5 text-pine-600 transition-transform duration-300 group-hover:scale-110" />
              <p className="mt-3 font-display text-[32px] font-bold leading-none text-pine-950">
                <Counter value={s.value} prefix={"prefix" in s ? (s as { prefix?: string }).prefix ?? "" : ""} suffix={s.suffix} />
              </p>
              <p className="mt-1.5 text-xs font-bold tracking-[0.14em] text-ink-soft uppercase">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {mine.length === 0 && (
        <Reveal className="mt-8">
          <div className="topo relative overflow-hidden rounded-2xl border border-pine-200 bg-pine-900 p-8 text-paper sm:p-12">
            <div className="relative z-10 max-w-xl">
              <ILogo className="h-10 w-10" />
              <h2 className="mt-5 font-display text-3xl font-semibold leading-tight">
                Your spare cabin, boat or bizarre building is somebody's dream Tuesday.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-pine-100">
                Haven hosts keep 88% of every booking. You set the price, the calendar and the house rules —
                we bring the travellers, the payments and the 4.9-star standards.
              </p>
              <ul className="mt-5 space-y-2 text-sm font-medium text-pine-100">
                {["Survey team verifies your place in person", "Payments held safely until check-in", "Cancel-safe calendar sync"].map((x) => (
                  <li key={x} className="flex items-center gap-2.5">
                    <ICheck className="h-4 w-4 text-marigold-400" /> {x}
                  </li>
                ))}
              </ul>
              <button onClick={() => setDrawerOpen(true)} className="mt-7 rounded-full bg-marigold-400 px-7 py-3 text-sm font-bold text-pine-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-marigold-300 hover:shadow-float">
                List your first stay
              </button>
            </div>
          </div>
        </Reveal>
      )}

      {/* listings table */}
      {mine.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-pine-950">Your listings</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-paper">
            {mine.map((l, i) => (
              <div key={l.id} className={`flex flex-col gap-4 p-4 transition hover:bg-pine-50/50 sm:flex-row sm:items-center ${i > 0 ? "border-t border-line" : ""}`}>
                <Link to={`/stay/${l.id}`} className="group h-24 w-full shrink-0 overflow-hidden rounded-lg sm:w-36">
                  <img src={l.photo} alt={l.title} className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${l.status === "paused" ? "grayscale" : ""}`} />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/stay/${l.id}`} className="font-display text-[17px] font-semibold text-pine-950 hover:text-pine-700">{l.title}</Link>
                    {l.status === "paused" && <span className="rounded-full bg-parch px-2 py-0.5 text-[10px] font-bold tracking-wide text-ink-soft">PAUSED</span>}
                  </div>
                  <p className="text-sm text-ink-soft">{l.type} · {l.town}</p>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-ink-soft">
                    <span className="flex items-center gap-1"><IEye className="h-3.5 w-3.5" /> {l.views.toLocaleString()} views</span>
                    <span className="flex items-center gap-1"><ICalendar className="h-3.5 w-3.5" /> {myBookings.filter((b) => b.listingId === l.id && b.status === "confirmed").length} bookings</span>
                    <span className="flex items-center gap-1">
                      <IStar className="h-3.5 w-3.5 text-marigold-500" />
                      {l.rating > 0 ? l.rating.toFixed(2) : "New"}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-5">
                  <PriceCell price={l.price} onCommit={(p) => { updateListing(l.id, { price: p }); toast("success", `${l.title} is now ${money(p)} a night.`); }} />
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold ${l.status === "active" ? "text-pine-700" : "text-ink-soft"}`}>
                      {l.status === "active" ? "Live" : "Paused"}
                    </span>
                    <Toggle
                      on={l.status === "active"}
                      label={`Toggle ${l.title}`}
                      onChange={() => {
                        const next = l.status === "active" ? "paused" : "active";
                        updateListing(l.id, { status: next });
                        toast("info", next === "paused" ? `${l.title} is hidden from search.` : `${l.title} is back in search.`);
                      }}
                    />
                  </div>
                  <Link to={`/stay/${l.id}`} className="group flex items-center gap-1.5 text-xs font-bold text-pine-700 hover:text-pine-600">
                    View page <IArrowR className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* incoming bookings */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-pine-950">Bookings across your stays</h2>
        {myBookings.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-pine-300 bg-pine-50/50 px-6 py-10 text-center text-sm text-ink-soft">
            No bookings yet — they'll land here the moment a traveller reserves.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-paper">
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.8fr_0.6fr] gap-4 border-b border-line bg-parch/70 px-5 py-3 text-[11px] font-bold tracking-[0.14em] text-ink-soft sm:grid">
              <span>GUEST</span><span>STAY</span><span>DATES</span><span>TOTAL</span><span>STATUS</span>
            </div>
            {myBookings.slice(0, 8).map((b) => {
              const l = listings.find((x) => x.id === b.listingId);
              const isPast = parseISO(b.checkOut) < today;
              return (
                <div key={b.id} className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-b border-line px-5 py-3.5 text-sm last:border-0 sm:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.6fr] sm:items-center">
                  <span className="flex items-center gap-2.5 font-semibold">
                    <Avatar name={b.travelerName} hue={(b.travelerName.charCodeAt(0) * 31) % 360} size="sm" />
                    {b.travelerName}
                  </span>
                  <span className="truncate text-ink-soft">{l?.title}</span>
                  <span className="text-ink-soft">{format(parseISO(b.checkIn), "MMM d")} – {format(parseISO(b.checkOut), "MMM d")}</span>
                  <span className="font-bold">{money(b.total)}</span>
                  <span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${
                      b.status === "cancelled" ? "bg-[#fbeee9] text-ember-600" : isPast ? "bg-parch text-ink-soft" : "bg-pine-100 text-pine-800"
                    }`}>
                      {b.status === "cancelled" ? "CANCELLED" : isPast ? "STAYED" : "CONFIRMED"}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {avgRating > 0 && (
        <p className="mt-8 flex items-center gap-2 text-sm text-ink-soft">
          <Stars rating={avgRating} /> Your portfolio averages <span className="font-bold text-ink">{avgRating.toFixed(2)}</span> across {rated.length} rated listing{rated.length > 1 ? "s" : ""}.
        </p>
      )}

      <AddListingDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

/* ------------------------------ inline price edit ------------------------------ */
function PriceCell({ price, onCommit }: { price: number; onCommit: (p: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(price));

  const commit = () => {
    const n = parseInt(val, 10);
    setEditing(false);
    if (!Number.isNaN(n) && n >= 20 && n <= 2000 && n !== price) onCommit(n);
    else setVal(String(price));
  };

  if (!editing)
    return (
      <button onClick={() => { setVal(String(price)); setEditing(true); }} className="group flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-bold transition hover:border-pine-400" title="Edit nightly price">
        {money(price)}<span className="text-xs font-normal text-ink-soft">/night</span>
        <IPencil className="h-3.5 w-3.5 text-pine-600 opacity-0 transition group-hover:opacity-100" />
      </button>
    );
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-bold text-ink-soft">$</span>
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className="w-20 rounded-lg border border-pine-400 bg-paper px-2 py-1.5 text-sm font-bold outline-none ring-2 ring-pine-200"
        aria-label="Nightly price"
      />
    </div>
  );
}

/* ------------------------------ add listing drawer ------------------------------ */
function AddListingDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addListing } = useStore();
  const [form, setForm] = useState({
    title: "", type: "A-frame", town: TOWNS[0].name, price: 180, cleaningFee: 60,
    guests: 2, beds: 1, baths: 1, sqft: 500, description: "", photo: "",
  });
  const [amenities, setAmenities] = useState<string[]>(["Wifi"]);
  const [pin, setPin] = useState(() => ({ ...townCoords(TOWNS[0].name), x: TOWNS[0].x + 26, y: TOWNS[0].y + 30 }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const pickTown = (name: string) => {
    set("town", name);
    const c = townCoords(name);
    setPin({ x: c.x + 18 + Math.round(Math.random() * 36), y: c.y + 14 + Math.round(Math.random() * 36) });
  };

  const placePin = (e: MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 720);
    if (x < 300) return; // that's the sea — nice try
    setPin({ x, y });
  };

  const submit = () => {
    const errs: Record<string, string> = {};
    if (form.title.trim().length < 4) errs.title = "Give it a proper name (4+ characters).";
    if (form.price < 20 || form.price > 2000) errs.price = "Nightly price must be $20–$2000.";
    if (form.description.trim().length < 40) errs.description = "Travellers want the texture — at least 40 characters.";
    if (!form.photo) errs.photo = "Pick a photo for the listing.";
    if (amenities.length === 0) errs.amenities = "Select at least one amenity.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const tags = [...(TYPE_TAGS[form.type] ?? ["Design"])];
    const input: NewListingInput = {
      ...form,
      title: form.title.trim(),
      amenities,
      tags,
      mapX: pin.x,
      mapY: pin.y,
    };
    addListing(input);
    onClose();
    setForm({ title: "", type: "A-frame", town: TOWNS[0].name, price: 180, cleaningFee: 60, guests: 2, beds: 1, baths: 1, sqft: 500, description: "", photo: "" });
    setAmenities(["Wifi"]);
    setErrors({});
  };

  const label = "mb-1.5 block text-xs font-bold tracking-wide text-ink-soft";
  const input = "w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-pine-600 focus:ring-2 focus:ring-pine-200";

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        onClick={onClose}
        className={`absolute inset-0 bg-pine-950/55 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        aria-label="Close drawer"
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-[560px] overflow-y-auto border-l border-line bg-paper shadow-float transition-transform duration-400 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Add a listing"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/95 px-7 py-5 backdrop-blur">
          <div>
            <h2 className="font-display text-2xl font-semibold text-pine-950">List a new stay</h2>
            <p className="text-xs text-ink-soft">Takes about four minutes. Our survey team does the rest.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 transition hover:rotate-90 hover:bg-parch" aria-label="Close">
            <IX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-7 py-6">
          {/* photo */}
          <div>
            <span className={label}>PHOTO {errors.photo && <span className="text-ember-600">— {errors.photo}</span>}</span>
            <div className="grid grid-cols-5 gap-2">
              {PHOTO_POOL.map((p) => (
                <button
                  key={p.src}
                  onClick={() => set("photo", p.src)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                    form.photo === p.src ? "border-pine-700 shadow-lift scale-[1.03]" : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                  title={p.label}
                >
                  <img src={p.src} alt={p.label} className="h-full w-full object-cover" />
                  {form.photo === p.src && (
                    <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-pine-700 text-paper"><ICheck className="h-3 w-3" /></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* basics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={label}>TITLE {errors.title && <span className="text-ember-600">— {errors.title}</span>}</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="The Saltbox at Gull Cove" className={input} />
            </div>
            <div>
              <label className={label}>TYPE</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={input}>
                {Object.keys(TYPE_TAGS).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>TOWN</label>
              <select value={form.town} onChange={(e) => pickTown(e.target.value)} className={input}>
                {TOWNS.map((t) => <option key={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>NIGHTLY PRICE ($) {errors.price && <span className="text-ember-600">— {errors.price}</span>}</label>
              <input value={form.price} onChange={(e) => set("price", parseInt(e.target.value || "0", 10))} type="number" min={20} max={2000} className={input} />
            </div>
            <div>
              <label className={label}>CLEANING FEE ($)</label>
              <input value={form.cleaningFee} onChange={(e) => set("cleaningFee", parseInt(e.target.value || "0", 10))} type="number" min={0} className={input} />
            </div>
          </div>

          {/* capacity */}
          <div>
            <span className={label}>CAPACITY</span>
            <div className="grid grid-cols-4 gap-3">
              {([["guests", "Guests", 12], ["beds", "Beds", 8], ["baths", "Baths", 6], ["sqft", "Sq ft", 9000]] as const).map(([k, lbl, max]) => (
                <div key={k}>
                  <p className="mb-1 text-center text-[11px] font-bold text-ink-soft">{lbl}</p>
                  <input
                    value={form[k]}
                    onChange={(e) => set(k, Math.max(k === "sqft" ? 80 : 1, Math.min(max, parseInt(e.target.value || "1", 10))))}
                    type="number"
                    className={`${input} text-center`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* description */}
          <div>
            <label className={label}>DESCRIPTION {errors.description && <span className="text-ember-600">— {errors.description}</span>}</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="What does morning feel like here? What will travellers tell their friends?"
              className={`${input} resize-none leading-relaxed`}
            />
            <p className={`mt-1 text-right text-xs ${form.description.trim().length >= 40 ? "text-pine-600" : "text-ink-soft"}`}>{form.description.trim().length}/40 characters min</p>
          </div>

          {/* amenities */}
          <div>
            <span className={label}>AMENITIES {errors.amenities && <span className="text-ember-600">— {errors.amenities}</span>}</span>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES.map((a) => {
                const on = amenities.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => setAmenities((cur) => (on ? cur.filter((x) => x !== a) : [...cur, a]))}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] font-semibold transition ${
                      on ? "border-pine-700 bg-pine-800 text-paper" : "border-line bg-paper hover:border-pine-400"
                    }`}
                  >
                    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${on ? "border-marigold-400 bg-marigold-400 text-pine-950" : "border-pine-300"}`}>
                      {on && <ICheck className="h-3 w-3" />}
                    </span>
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          {/* pin placement */}
          <div>
            <span className={label}>DROP A PIN ON THE CHART — click near your town</span>
            <div className="overflow-hidden rounded-xl border border-line">
              <svg viewBox="0 0 1000 720" preserveAspectRatio="none" className="h-56 w-full cursor-crosshair" onClick={placePin} role="img" aria-label="Place your listing on the map">
                <EthiopiaChart>
                  <g transform={`translate(${pin.x} ${pin.y})`} className="pointer-events-none">
                    <circle r="16" fill="#E39B31" opacity="0.35" className="pin-pulse" />
                    <circle r="7.5" fill="#E39B31" stroke="#16312A" strokeWidth="3" />
                  </g>
                </EthiopiaChart>
              </svg>
            </div>
            <p className="mt-1.5 text-xs text-ink-soft">Approximate is fine — exact addresses are shared after booking.</p>
          </div>

          <button onClick={submit} className="w-full rounded-xl bg-pine-800 py-3.5 text-[15px] font-bold text-paper shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-pine-700 hover:shadow-float">
            Publish listing
          </button>
        </div>
      </aside>
    </div>
  );
}
