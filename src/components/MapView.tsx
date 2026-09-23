import { useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import type { Listing } from "../lib/types";
import { TOWNS } from "../lib/seed";
import { IStar, IZoomIn, IZoomOut, IX } from "./icons";
import { Stars, money } from "./ui";
import { birrShort } from "../lib/ethiopia";

/* ------------------------------------------------------------------ */
/*  Ethiopia — a hand-drawn survey chart reused across the app         */
/* ------------------------------------------------------------------ */
export function EthiopiaChart({ children }: { children?: React.ReactNode }) {
  return (
    <g>
      <defs>
        <linearGradient id="landFade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F6F0DF" />
          <stop offset="100%" stopColor="#EDE5CF" />
        </linearGradient>
      </defs>
      {/* neighbouring territories */}
      <rect x="0" y="0" width="1000" height="720" fill="#DBDFD0" />
      {/* graticule */}
      <g stroke="#16312A" strokeOpacity="0.05">
        {[125, 250, 375, 500, 625, 750, 875].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="720" />
        ))}
        {[120, 240, 360, 480, 600].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} />
        ))}
      </g>
      {/* country outline */}
      <path d={ETHIOPIA} fill="url(#landFade)" stroke="#8A7A52" strokeWidth="14" strokeOpacity="0.18" />
      <path d={ETHIOPIA} fill="url(#landFade)" stroke="#A08B5C" strokeWidth="2.6" strokeLinejoin="round" />
      {/* country watermark */}
      <text x="352" y="308" fontSize="58" fontWeight={800} fill="#234E3D" opacity="0.07" style={{ fontFamily: "Fraunces, serif", letterSpacing: "0.32em" }}>
        ETHIOPIA
      </text>
      {/* neighbour labels */}
      <g fill="#51625A" opacity="0.55" style={{ fontFamily: "Fraunces, serif", fontStyle: "italic" }} fontSize="12" letterSpacing="0.24em">
        <text x="292" y="13">ERITREA</text>
        <text x="905" y="300">SOMALIA</text>
        <text x="398" y="714">KENYA</text>
        <text x="28" y="286">SUDAN</text>
        <text x="735" y="205">DJIBOUTI</text>
        <text x="830" y="470" opacity="0.8">SOMALI REGION</text>
      </g>

      {/* Lake Tana */}
      <path
        d="M258 176 C 262 156 288 146 310 154 C 330 161 340 178 332 196 C 324 214 300 224 278 218 C 260 213 254 194 258 176 Z"
        fill="#A9CBC4" stroke="#8FB5AE" strokeWidth="2"
      />
      <text x="268" y="192" fontSize="10" fill="#2C614B" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }}>L. Tana</text>

      {/* rivers */}
      <g fill="none" stroke="#8FB5AE" strokeLinecap="round">
        <path d="M276 218 C 258 250 240 285 224 318 C 208 352 190 388 168 418 C 152 440 120 452 96 458" strokeWidth="3.6" />
        <path d="M392 376 C 428 362 462 344 494 320 C 526 296 556 268 582 240 C 606 214 626 186 644 158 C 654 142 662 128 668 116" strokeWidth="3" />
        <path d="M322 420 C 316 452 312 478 308 502 C 304 524 301 546 299 570 C 296 594 288 616 276 636" strokeWidth="3" />
      </g>
      <text x="176" y="388" fontSize="9.5" fill="#2C614B" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }} transform="rotate(-62 176 388)">Blue Nile (Abay)</text>
      <text x="540" y="252" fontSize="9.5" fill="#2C614B" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }} transform="rotate(-40 540 252)">Awash R.</text>
      <text x="290" y="500" fontSize="9.5" fill="#2C614B" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }} transform="rotate(-83 290 500)">Omo R.</text>

      {/* Great Rift Valley escarpments */}
      <g fill="none" stroke="#B49A6B" strokeWidth="1.4" strokeOpacity="0.55">
        <path d="M512 96 C 486 170 468 240 448 310 C 430 372 408 430 386 480 C 366 524 344 566 318 612" />
        <path d="M556 100 C 532 176 512 248 492 316 C 474 378 452 438 428 490 C 408 534 386 576 360 620" />
      </g>
      <text x="452" y="336" fontSize="9.5" fill="#8A7A52" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }} transform="rotate(-68 452 336)">Great Rift Valley</text>

      {/* rift lakes */}
      <g fill="#A9CBC4" stroke="#8FB5AE" strokeWidth="1.5">
        <ellipse cx="393" cy="441" rx="15" ry="9" transform="rotate(-25 393 441)" />
        <ellipse cx="381" cy="466" rx="13" ry="7" transform="rotate(-25 381 466)" />
        <ellipse cx="368" cy="496" rx="10" ry="6" transform="rotate(-25 368 496)" />
        <ellipse cx="307" cy="544" rx="24" ry="10" transform="rotate(-35 307 544)" />
        <ellipse cx="299" cy="572" rx="16" ry="8" transform="rotate(-35 299 572)" />
      </g>
      <text x="410" y="446" fontSize="9" fill="#2C614B" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }}>Ziway</text>
      <text x="380" y="504" fontSize="9" fill="#2C614B" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }}>Awasa</text>
      <text x="252" y="538" fontSize="9" fill="#2C614B" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }}>L. Abaya</text>
      <text x="248" y="586" fontSize="9" fill="#2C614B" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }}>L. Chamo</text>

      {/* highlands contours */}
      <g fill="none" stroke="#234E3D" strokeOpacity="0.12" strokeWidth="1.2">
        <path d="M300 100c30-22 80-26 110-6s34 52 10 74-66 26-96 8-44-58-24-76Z" />
        <path d="M330 112c20-14 52-16 72-3s22 34 6 48-44 17-64 5-29-38-14-50Z" />
        <path d="M410 480c34-20 86-16 112 8s22 58-12 76-78 16-102-10-22-58 2-74Z" />
        <path d="M440 498c20-11 50-9 65 5s13 34-7 45-46 9-60-6-13-35 2-44Z" />
      </g>

      {/* mountains */}
      <g stroke="#51625A" strokeWidth="2" fill="none" strokeLinejoin="round">
        <path d="m318 122 26-42 19 26 12-16 30 46" />
        <path d="m368 112 22-36 17 23 10-13 26 38" />
        <path d="m432 520 24-38 17 24 11-15 27 41" />
      </g>
      <g fontSize="9.5" fill="#51625A" style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "0.12em" }}>
        <text x="312" y="140">SEMEN MTNS · RAS DASHEN 4,550 M</text>
        <text x="428" y="544">BALE MTNS · TULLU DEEMTU 4,377 M</text>
      </g>

      {/* Erta Ale volcano + Danakil salt flats */}
      <path d="M500 96 L513 72 L526 96 Z" fill="none" stroke="#51625A" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="513" cy="79" r="3" fill="#C0563B" />
      <text x="497" y="112" fontSize="9.5" fill="#51625A" style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "0.12em" }}>ERTA ALE</text>
      <g stroke="#C9B36B" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
        {[
          [540, 130], [562, 142], [588, 128], [610, 148], [570, 166], [596, 178], [622, 164], [552, 190], [600, 200],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y} l6 -8 M${x + 6} ${y} l-2 -5`} />
        ))}
      </g>
      <text x="548" y="216" fontSize="9" fill="#8A7A52" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }}>Danakil salt flats</text>

      {/* juniper & coffee forests */}
      <g fill="#3F7A60" opacity="0.75">
        {[
          [300, 152], [322, 166], [286, 170], [336, 150],
          [440, 542], [462, 550], [420, 554], [478, 538],
          [330, 402], [350, 392], [316, 414],
          [322, 232], [338, 246], [228, 430], [214, 446], [244, 462],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y} l7 14 h-14 Z M${x} ${y - 9} l6 12 h-12 Z`} />
        ))}
      </g>
      <text x="176" y="480" fontSize="9.5" fill="#51625A" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }}>coffee forests of Kaffa</text>

      {/* roads */}
      <path
        d="M293 214 C 296 190 298 170 300 149 C 306 138 312 128 319 118 M293 214 C 330 210 372 198 405 186 M405 186 C 402 240 396 300 383 371 M383 371 C 450 356 530 350 607 354 M383 371 C 356 430 330 490 303 556"
        fill="none" stroke="#234E3D" strokeOpacity="0.26" strokeWidth="2.2" strokeDasharray="7 6"
      />

      {/* minor towns */}
      <g>
        {[
          ["Gondar", 300, 149], ["Aksum", 380, 56], ["Mekelle", 433, 93],
          ["Dire Dawa", 593, 335], ["Jimma", 253, 453], ["Jinka", 240, 571],
        ].map(([name, x, y]) => (
          <g key={name as string}>
            <circle cx={x as number} cy={y as number} r="3.2" fill="#51625A" />
            <text x={(x as number) + 8} y={(y as number) + 3.5} fontSize="10.5" fill="#51625A" style={{ fontFamily: "Outfit, sans-serif", fontStyle: "italic" }}>
              {name as string}
            </text>
          </g>
        ))}
      </g>

      {/* haven towns */}
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
        <rect x="698" y="36" width="270" height="76" rx="6" fill="#F6F4ED" stroke="#234E3D" strokeOpacity="0.5" />
        <rect x="704" y="42" width="258" height="64" rx="3" fill="none" stroke="#234E3D" strokeOpacity="0.3" />
        <text x="718" y="70" fontSize="20" fontWeight={800} fill="#16312A" style={{ fontFamily: "Fraunces, serif", letterSpacing: "0.07em" }}>
          THE ETHIOPIAN HIGHLANDS
        </text>
        <text x="718" y="90" fontSize="11" fill="#51625A" style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "0.14em" }}>
          SURVEY OF HAVEN STAYS · 1:4,500,000
        </text>
      </g>

      {/* compass */}
      <g transform="translate(925 642)" stroke="#16312A" fill="none">
        <circle r="26" strokeOpacity="0.5" />
        <path d="M0 -20 L5 0 L0 20 L-5 0 Z" fill="#16312A" fillOpacity="0.85" stroke="none" />
        <path d="M-20 0 L0 -5 L20 0 L0 5 Z" fill="#16312A" fillOpacity="0.3" stroke="none" />
        <text x="-4" y="-32" fontSize="12" fontWeight={700} fill="#16312A" stroke="none" style={{ fontFamily: "Fraunces, serif" }}>N</text>
      </g>

      {/* scale bar */}
      <g transform="translate(60 694)" stroke="#16312A">
        <line x1="0" y1="0" x2="120" y2="0" strokeWidth="2" />
        <line x1="0" y1="-5" x2="0" y2="5" strokeWidth="2" />
        <line x1="60" y1="-4" x2="60" y2="4" strokeWidth="1.5" />
        <line x1="120" y1="-5" x2="120" y2="5" strokeWidth="2" />
        <text x="-4" y="-10" fontSize="10" fill="#16312A" stroke="none" style={{ fontFamily: "Outfit, sans-serif" }}>0</text>
        <text x="42" y="-10" fontSize="10" fill="#16312A" stroke="none" style={{ fontFamily: "Outfit, sans-serif" }}>100</text>
        <text x="100" y="-10" fontSize="10" fill="#16312A" stroke="none" style={{ fontFamily: "Outfit, sans-serif" }}>200 km</text>
      </g>
      {children}
    </g>
  );
}

const ETHIOPIA =
  "M233 31 C 258 24 282 20 307 19 C 328 22 348 26 367 31 C 398 33 430 34 460 37 " +
  "C 505 52 550 70 587 99 C 602 118 616 136 627 155 C 638 176 650 196 660 217 " +
  "C 670 230 680 240 693 248 C 708 262 720 275 733 291 C 757 308 777 324 800 341 " +
  "C 830 358 858 377 887 397 C 925 412 960 425 993 438 C 970 460 948 480 920 503 " +
  "C 878 535 835 566 793 596 C 758 618 724 632 687 646 C 655 657 624 670 593 686 " +
  "C 572 679 554 670 533 664 C 505 676 480 690 453 701 C 435 697 417 692 400 689 " +
  "C 350 678 301 666 253 655 C 235 633 218 611 200 590 C 183 565 168 540 153 515 " +
  "C 130 496 108 478 87 459 C 78 438 71 417 67 397 C 78 373 92 350 107 329 " +
  "C 118 304 128 279 140 254 C 152 236 165 220 180 205 C 195 186 210 167 227 149 " +
  "C 236 128 243 107 247 87 C 243 68 238 49 233 31 Z";

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
        viewBox={`${-view.x} ${-view.y} ${1000 / view.k} ${720 / view.k}`}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="application"
        aria-label="Map of stays across Ethiopia"
      >
        <EthiopiaChart>
          <g style={{ transition: "transform 0.2s ease" }}>
            {listings.map((l) => {
              const hot = l.id === hoveredId || l.id === selectedId;
              const label = birrShort(l.price);
              const w = label.length * 7.6 + 18;
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
        </EthiopiaChart>
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
