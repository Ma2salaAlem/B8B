import { useState } from "react";
import { Link } from "react-router-dom";
import type { Listing } from "../lib/types";
import { useStore } from "../lib/store";
import { Stars, money } from "./ui";
import { IHeart, IStar } from "./icons";

export default function StayCard({ listing, compact }: { listing: Listing; compact?: boolean }) {
  const { isFav, toggleFav } = useStore();
  const fav = isFav(listing.id);
  const [popping, setPopping] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      to={`/stay/${listing.id}`}
      className="group block outline-none"
      aria-label={`${listing.title}, ${listing.town}`}
    >
      <div className={`relative overflow-hidden rounded-xl ${compact ? "h-40" : "aspect-[4/3]"}`}>
        {!loaded && <div className="absolute inset-0 animate-pulse bg-parch" />}
        <img
          src={listing.photo}
          alt={listing.title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.06] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-pine-950/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {listing.rating >= 4.95 && listing.reviewCount > 50 && !compact && (
          <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-2.5 py-1 text-[11px] font-bold tracking-wide text-pine-800 shadow-sm">
            ★ GUEST FAVOURITE
          </span>
        )}
        {listing.status === "paused" && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-bold tracking-wide text-paper">
            PAUSED
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFav(listing.id);
            setPopping(true);
            window.setTimeout(() => setPopping(false), 450);
          }}
          aria-label={fav ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute right-3 top-3 rounded-full p-2 transition-all duration-300 hover:scale-110 ${
            fav ? "text-ember-500" : "text-paper drop-shadow-[0_1px_3px_rgb(0_0_0/0.5)]"
          } ${popping ? "heart-pop" : ""}`}
        >
          <IHeart className="h-[22px] w-[22px]" filled={fav} />
        </button>

        {!compact && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition-all duration-300 group-hover:opacity-100">
            {listing.gallery.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? "w-4 bg-paper" : "w-1.5 bg-paper/60"}`} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[17px] font-semibold leading-tight text-ink transition-colors group-hover:text-pine-700">
            {listing.title}
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
            <IStar className="h-3.5 w-3.5 text-marigold-500" />
            {listing.rating > 0 ? listing.rating.toFixed(2) : "New"}
          </span>
        </div>
        <p className="text-sm text-ink-soft">
          {listing.type} · {listing.town}
        </p>
        {!compact && (
          <p className="text-sm text-ink-soft">
            Sleeps {listing.guests} · {listing.beds} bed{listing.beds > 1 ? "s" : ""} · {listing.baths} bath{listing.baths > 1 ? "s" : ""}
          </p>
        )}
        <p className="pt-1 text-[15px]">
          <span className="font-bold text-ink">{money(listing.price)}</span>
          <span className="text-ink-soft"> night</span>
        </p>
      </div>
    </Link>
  );
}
