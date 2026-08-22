import { useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import type { Listing } from "../lib/types";
import { TOWNS } from "../lib/seed";
import { IStar, IZoomIn, IZoomOut, IX } from "./icons";
import { Stars, money } from "./ui";

/* ------------------------------------------------------------------ */
/*  The Cedar Coast — a hand-drawn survey chart reused across the app  */
/* ------------------------------------------------------------------ */
export function CedarChart({ children }: { children?: React.ReactNode }) {
  return (
    <g>
      {/* sea */}
      <rect x="0" y="0" width="1000" height="700" fill="#A9CBC4" />
      <rect x="0" y="0" width="1000" height="700" fill="url(#seaFade)" />
      <defs>
        <linearGradient id="seaFade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8FB5AE" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#A9CBC4" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* graticule */}
      <g stroke="#16312A" strokeOpacity="0.05">
        {[125, 250, 375, 500, 625, 750, 875].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="700" />
        ))}
        {[100, 200, 300, 400, 500, 600].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} />
        ))}
      </g>
      {/* shallow water band + land */}
      <path d={COAST} fill="none" stroke="#C7DEDA" strokeWidth="30" />
      <path d={`${COAST} L 1000 700 L 1000 0 Z`} fill="#EFE9DA" />
      <path d={COAST} fill="none" stroke="#DFCFA9" strokeWidth="3.5" />
      {/* contours */}
      <g fill="none" stroke="#234E3D" strokeOpacity="0.1" strokeWidth="1.2">
        <path d="M420 80c80 20 120 90 90 150s-110 70-170 40-70-110-20-150 60-50 100-40Z" />
        <path d="M450 120c50 14 76 58 57 96s-70 44-108 25-44-70-13-95 38-33 64-26Z" />
        <path d="M600 520c70-20 150 10 170 60s-30 90-100 90-130-30-120-80 20-60 50-70Z" />
        <path d="M640 550c40-12 86 6 97 35s-17 52-57 52-74-17-68-46 11-35 28-41Z" />
      </g>
      {/* lake + river */}
      <path d="M560 430c40-26 110-22 140 8s16 74-30 90-110 4-128-30 0-52 18-68Z" fill="#A9CBC4" stroke="#8FB5AE" strokeWidth="2" />
      <path d="M560 445 C 480 430 420 400 380 370 C 340 340 320 330 300 322" fill="none" stroke="#8FB5AE" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.9" />
      {/* mountains */}
      <g stroke="#51625A" strokeWidth="2" fill="none" strokeLinejoin="round">
        <path d="m700 120 30-46 22 30 14-18 34 52" />
        <path d="m770 96 26-40 20 26 12-14 30 44" />
        <path d="m860 130 20-30 16 20 10-12 24 34" />
      </g>
      {/* high desert ticks */}
      <g stroke="#B49A6B" strokeWidth="1.6" strokeLinecap="round" opacity="0.8">
        {[
          [668, 200], [690, 212], [716, 196], [742, 214], [700, 238], [730, 252], [756, 236], [680, 262],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y} l5 -8 M${x + 5} ${y} l-2 -5`} />
        ))}
      </g>
      {/* forests */}
      <g fill="#3F7A60" opacity="0.75">
        {[
          [470, 250], [492, 262], [512, 246], [536, 266], [452, 282], [556, 290], [488, 300],
          [420, 470], [444, 486], [400, 500], [466, 540], [430, 556], [392, 452], [500, 486],
          [620, 180], [644, 196], [600, 160], [660, 168], [700, 90], [724, 104],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y} l7 14 h-14 Z M${x} ${y - 9} l6 12 h-12 Z`} />
        ))}
      </g>
      {/* roads */}
      <path
        d="M250 168 C 300 220 300 260 322 305 C 340 350 420 330 528 332 C 620 334 660 290 716 232 M528 332 C 500 400 480 460 468 522 M716 232 C 740 190 760 160 782 118"
        fill="none" stroke="#234E3D" strokeOpacity="0.28" strokeWidth="2.4" strokeDasharray="7 6"
      />
      {/* towns */}
      {TOWNS.map((t) => (
        <g key={t.name}>
          <circle cx={t.x} cy={t.y} r="5" fill="#16241D" />
          <circle cx={t.x} cy={t.y} r="8.5" fill="none" stroke="#16241D" strokeOpacity="0.4" />
          <text x={t.x + 14} y={t.y + 5} fontSize="15" fontWeight={700} fill="#16241D" style={{ fontFamily: "Fraunces, serif", letterSpacing: "0.04em" }}>
            {t.name}
          </text>
          <text x={t.x + 14} y={t.y + 20} fontSize="10.5" fill="#51625A" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }}>
            {t.note}
          </text>
        </g>
      ))}
      {/* cartouche */}
      <g>
        <rect x="26" y="24" width="240" height="76" rx="6" fill="#F6F4ED" stroke="#234E3D" strokeOpacity="0.5" />
        <rect x="32" y="30" width="228" height="64" rx="3" fill="none" stroke="#234E3D" strokeOpacity="0.3" />
        <text x="46" y="58" fontSize="21" fontWeight={800} fill="#16312A" style={{ fontFamily: "Fraunces, serif", letterSpacing: "0.08em" }}>
          THE CEDAR COAST
        </text>
        <text x="46" y="78" fontSize="11" fill="#51625A" style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "0.14em" }}>
          SURVEY OF HAVEN STAYS · SCALE 1:90 000
        </text>
      </g>
      {/* compass */}
      <g transform="translate(80 618)" stroke="#16312A" fill="none">
        <circle r="26" strokeOpacity="0.5" />
        <path d="M0 -20 L5 0 L0 20 L-5 0 Z" fill="#16312A" fillOpacity="0.85" stroke="none" />
        <path d="M-20 0 L0 -5 L20 0 L0 5 Z" fill="#16312A" fillOpacity="0.3" stroke="none" />
        <text x="-4" y="-32" fontSize="12" fontWeight={700} fill="#16312A" stroke="none" style={{ fontFamily: "Fraunces, serif" }}>N</text>
      </g>
      {/* scale bar */}
      <g transform="translate(820 664)" stroke="#16312A">
        <line x1="0" y1="0" x2="120" y2="0" strokeWidth="2" />
        <line x1="0" y1="-5" x2="0" y2="5" strokeWidth="2" />
        <line x1="60" y1="-4" x2="60" y2="4" strokeWidth="1.5" />
        <line x1="120" y1="-5" x2="120" y2="5" strokeWidth="2" />
        <text x="-4" y="-10" fontSize="10" fill="#16312A" stroke="none" style={{ fontFamily: "Outfit, sans-serif" }}>0</text>
        <text x="48" y="-10" fontSize="10" fill="#16312A" stroke="none" style={{ fontFamily: "Outfit, sans-serif" }}>5</text>
        <text x="104" y="-10" fontSize="10" fill="#16312A" stroke="none" style={{ fontFamily: "Outfit, sans-serif" }}>10 mi</text>
      </g>
      {children}
    </g>
  );
}

const COAST =
  "M350 0 C332 58 302 96 292 148 C282 200 304 240 288 290 C272 340 240 382 254 432 C268 482 300 520 290 570 C281 618 300 660 296 700";

/* ------------------------------------------------------------------ */
/*  Interactive map with pan, zoom and price-chip pins                 */
/* ------------------------------------------------------------------ */
export default function MapView({
  listings,
  hoveredId,
  onHover,
  onSelect,
  selectedId,
}: {
  listings: Listing[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  selectedId: string | null;
}) {
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const drag = useRef<{ px: number; py: number; x: number; y: number; moved: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    drag.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y, moved: false };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.px;
    const dy = e.clientY - drag.current.py;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.current.moved = true;
    const rect = svgRef.current?.getBoundingClientRect();
    const scale = rect ? 1000 / rect.width : 1;
    setView((v) => ({ ...v, x: drag.current!.x + dx * scale, y: drag.current!.y + dy * scale }));
  };
  const onPointerUp = () => {
    if (drag.current && !drag.current.moved) onSelect(null);
    drag.current = null;
  };

  const zoom = (dir: 1 | -1) => setView((v) => ({ ...v, k: Math.min(2.6, Math.max(0.8, +(v.k + dir * 0.35).toFixed(2))) }));

  const selected = listings.find((l) => l.id === selectedId) ?? null;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-line shadow-lift">
      <svg
        ref={svgRef}
        viewBox={`${-view.x} ${-view.y} ${1000 / view.k} ${700 / view.k}`}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="application"
        aria-label="Map of Cedar Coast stays"
      >
        <CedarChart>
          <g style={{ transition: "transform 0.2s ease" }}>
            {listings.map((l) => {
              const hot = l.id === hoveredId || l.id === selectedId;
              const label = `$${l.price}`;
              const w = label.length * 7.4 + 18;
              return (
                <g
                  key={l.id}
                  transform={`translate(${l.mapX} ${l.mapY})`}
                  className="cursor-pointer"
                  onPointerEnter={() => onHover(l.id)}
                  onPointerLeave={() => onHover(null)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onSelect(l.id === selectedId ? null : l.id)}
                >
                  {hot && <circle r="16" fill="#2C614B" opacity="0.35" className="pin-pulse" />}
                  {hot ? (
                    <g className="fade-in">
                      <rect x={-w / 2} y={-34} width={w} height={26} rx={13} fill="#16312A" stroke="#F6F4ED" strokeWidth="1.6" />
                      <text x={0} y={-16.5} textAnchor="middle" fontSize="13.5" fontWeight={700} fill="#F6F4ED" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {label}
                      </text>
                      <path d="M-5 -9 L0 -2 L5 -9" fill="#16312A" stroke="#F6F4ED" strokeWidth="1.6" />
                      <circle r="6.5" fill="#E39B31" stroke="#16312A" strokeWidth="2.4" />
                    </g>
                  ) : (
                    <circle r="7" fill="#F6F4ED" stroke="#16312A" strokeWidth="2.6" style={{ transition: "r .2s" }} />
                  )}
                </g>
              );
            })}
          </g>
        </CedarChart>
      </svg>

      {/* zoom controls */}
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-line bg-paper shadow-lift">
        <button onClick={() => zoom(1)} className="p-2.5 transition hover:bg-parch" aria-label="Zoom in"><IZoomIn className="h-4 w-4" /></button>
        <div className="h-px bg-line" />
        <button onClick={() => zoom(-1)} className="p-2.5 transition hover:bg-parch" aria-label="Zoom out"><IZoomOut className="h-4 w-4" /></button>
      </div>

      <p className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1.5 text-[11px] font-bold tracking-widest text-pine-800 shadow-sm">
        DRAG TO PAN · {listings.length} PINS
      </p>

      {/* selected mini card */}
      {selected && (
        <div className="pop-in absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-xl border border-line bg-paper p-2.5 pr-3 shadow-float sm:right-auto sm:w-[340px]">
          <img src={selected.photo} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[15px] font-semibold leading-tight">{selected.title}</p>
            <p className="text-xs text-ink-soft">{selected.type} · {selected.town}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Stars rating={selected.rating} />
              <span className="text-xs font-semibold">{selected.rating > 0 ? selected.rating.toFixed(2) : "New"}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <p className="text-sm font-bold">{money(selected.price)}<span className="font-normal text-ink-soft"> /nt</span></p>
            <Link to={`/stay/${selected.id}`} className="rounded-full bg-pine-800 px-3 py-1.5 text-xs font-bold text-paper transition hover:bg-pine-700">
              View stay
            </Link>
          </div>
          <button onClick={() => onSelect(null)} className="absolute -right-2 -top-2 rounded-full border border-line bg-paper p-1 shadow" aria-label="Close">
            <IX className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* legend */}
      <div className="absolute bottom-3 right-3 hidden items-center gap-2 rounded-full bg-paper/90 px-3 py-1.5 text-[11px] font-semibold text-ink-soft shadow-sm sm:flex">
        <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-pine-950 bg-paper" /> available stay
        <span className="ml-1 inline-flex items-center gap-1"><IStar className="h-3 w-3 text-marigold-500" /> 4.9+ favourite</span>
      </div>
    </div>
  );
}
