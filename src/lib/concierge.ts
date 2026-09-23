import { addDays, endOfMonth, format, parseISO } from "date-fns";
import type { Booking, Listing } from "./types";
import { birr } from "./ethiopia";

/* ------------------------------------------------------------------ */
/*  The concierge engine.                                              */
/*  In production this parse step is a single Claude tool-use call     */
/*  (see blueprint/concierge.md). Here we run a deterministic parser   */
/*  that emits the exact same schema, so the UI is production-faithful.*/
/* ------------------------------------------------------------------ */

export interface ParsedFilters {
  towns: string[];
  tags: string[]; // subset of CATEGORIES
  types: string[];
  amenities: string[];
  minPrice?: number;
  maxPrice?: number;
  month?: number; // 1–12
  guests?: number;
}

export interface ParseResult {
  intent: "search" | "bestTime" | "help";
  place?: string;
  filters: ParsedFilters;
}

export interface ConciergeResult {
  listing: Listing;
  source: "haven"; // Phase 2: "booking" | "amadeus" ...
  notes: string[];
}

export interface BestTimeInfo {
  place: string;
  headline: string;
  text: string;
  months: number[];
}

export interface ConciergeReply {
  kind: "results" | "bestTime" | "help";
  intro: string;
  filters: ParsedFilters;
  results: ConciergeResult[];
  bestTime?: BestTimeInfo;
  relaxed?: string; // what was loosened to find matches
}

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const TOWN_KEYWORDS: Record<string, string[]> = {
  "Bahir Dar": ["bahar", "bahir", "tana", "blue nile", "abay", "tis"],
  "Lalibela": ["lalibela", "rock church", "rock-hewn", "lasta"],
  "Addis Ababa": ["addis", "capital", "entoto", "piassa", "merkato"],
  "Harar": ["harar", "jugol", "hyena"],
  "Arba Minch": ["arba", "minch", "chamo", "abaya", "nechisar"],
  "Semien Highlands": ["semien", "simien", "ras dashen", "escarpment", "gelada"],
  Gondar: ["gondar", "gonder", "fasil", "castle"],
  Axum: ["axum", "aksum", "obelisk", "stelae", "stele", "queen of sheba"],
  "Danakil Depression": ["danakil", "dallol", "erta ale", "afar", "salt flat", "lava"],
  "Bale Mountains": ["bale", "sanetti", "harenna", "wolf", "wolves"],
  "Omo Valley": [" omo", "jinka", "turmi", "mursi", "hamer"],
};

const TAG_KEYWORDS: Record<string, string[]> = {
  Lakeshore: ["lake", "lakeside", "shore", "beach", "waterfront", "water", "boat"],
  Highlands: ["highland", "mountain", "trek", "cabin", "a-frame", "aframe", "ridge", "escarpment"],
  Treehouses: ["treehouse", "tree house", "canopy"],
  Heritage: ["heritage", "historic", "walled", "castle", "church", "old town", "ancient"],
  Timberline: ["chalet", "snow", "frost", "timberline"],
  Countryside: ["farm", "farmhouse", "countryside", "village", "rural"],
  Design: ["design", "modern", "architect", "loft", "glass", "courtyard", "villa"],
  Desert: ["desert", "salt", "volcano", "lava", "danakil"],
};

const TYPE_KEYWORDS: Record<string, string[]> = {
  Treehouse: ["treehouse", "tree house"],
  "Courtyard house": ["courtyard"],
  "Glass house": ["glass"],
  "A-frame": ["a-frame", "aframe"],
  Loft: ["loft"],
  "Shore house": ["shore house", "beach house"],
  Villa: ["villa"],
  Chalet: ["chalet"],
  Lakeboat: ["boat", "houseboat", "lakeboat", "floating"],
  Farmhouse: ["farmhouse", "farm"],
  Tukul: ["tukul", " hut"],
  "Gojo house": ["gojo"],
  "Stone house": ["stone house"],
  "Desert camp": ["camp"],
};

const AMENITY_KEYWORDS: Record<string, string[]> = {
  "Hot tub": ["hot tub", "jacuzzi", "soaking tub"],
  Wifi: ["wifi", "internet"],
  Fireplace: ["fireplace", "wood stove", "fire"],
  Workspace: ["workspace", "desk", "remote work", "work from"],
  "Pets allowed": ["pet", "dog", "puppy"],
  "Water access": ["swim", "water access", "kayak", "rowboat"],
  "Coffee ceremony": ["coffee", "buna", "jebena"],
  "Injera breakfast": ["breakfast", "injera"],
  "Stargazing deck": ["stargaz", "stars"],
  "Free parking": ["parking"],
  Kitchen: ["kitchen", "cook"],
  Washer: ["washer", "laundry"],
  "Backup generator": ["generator", "power cut", "backup power"],
  AC: ["air con", " a/c", " ac "],
};

/* ------------------------------- parser ------------------------------- */
function parseAmount(raw: string) {
  const s = raw.replace(/,/g, "").trim();
  return /k$/.test(s) ? Math.round(parseFloat(s) * 1000) : parseInt(s, 10);
}

export function parseQuery(raw: string): ParseResult {
  const q = ` ${raw.toLowerCase().trim()} `;
  const filters: ParsedFilters = { towns: [], tags: [], types: [], amenities: [] };

  for (const [town, kws] of Object.entries(TOWN_KEYWORDS))
    if (kws.some((k) => q.includes(k))) filters.towns.push(town);
  for (const [tag, kws] of Object.entries(TAG_KEYWORDS))
    if (kws.some((k) => q.includes(k))) filters.tags.push(tag);
  for (const [type, kws] of Object.entries(TYPE_KEYWORDS))
    if (kws.some((k) => q.includes(k))) filters.types.push(type);
  for (const [amenity, kws] of Object.entries(AMENITY_KEYWORDS))
    if (kws.some((k) => q.includes(k))) filters.amenities.push(amenity);

  MONTHS.forEach((m, i) => {
    if (q.includes(m)) filters.month = i + 1;
  });

  // Amounts are Birr: "under 20000", "below 20,000 birr", "max ETB 25k", "from 30k br"
  const AMOUNT = String.raw`(?:etb|br\.?|birr)?\s*(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?\s*k\b|\d{3,6})`;
  const under = q.match(new RegExp(String.raw`(?:under|below|less than|max(?:imum)?|up to|cheaper than|no more than)\s*` + AMOUNT));
  if (under) filters.maxPrice = parseAmount(under[1]);
  const over = q.match(new RegExp(String.raw`(?:over|above|at least|min(?:imum)?|from)\s*` + AMOUNT));
  if (over) filters.minPrice = parseAmount(over[1]);
  if (!filters.maxPrice && /\bcheap|budget|affordable|inexpensive\b/.test(q)) filters.maxPrice = 20_000;
  if (!filters.minPrice && /\bluxur|splurge|high[- ]end|premium\b/.test(q)) filters.minPrice = 40_000;

  const guests = q.match(/(\d{1,2})\s*(?:guests?|people|friends|persons?|travell?ers|of us)/) ?? q.match(/for\s+(\d{1,2})\b/);
  if (guests) filters.guests = parseInt(guests[1], 10);
  else if (/\bfamily\b/.test(q)) filters.guests = 4;
  else if (/\bcouple|two of us|romantic\b/.test(q)) filters.guests = 2;

  const wantsBestTime = /(best time|best month|best season|good season|when(?:'s| is)? the best|when should i|when to visit|what season)/.test(q);

  const place =
    filters.towns[0] ??
    (/\blakes?\b/.test(q) ? "Ethiopian lakes" : null) ??
    (/\bmountain|highland|trek\b/.test(q) ? "Semien Highlands" : null) ??
    (/\bcity\b/.test(q) ? "Addis Ababa" : null) ??
    undefined;

  if (wantsBestTime) return { intent: "bestTime", place, filters };

  const hasAnything =
    filters.towns.length || filters.tags.length || filters.types.length || filters.amenities.length ||
    filters.maxPrice !== undefined || filters.minPrice !== undefined || filters.month !== undefined ||
    filters.guests !== undefined;
  if (!hasAnything) return { intent: "help", filters };
  return { intent: "search", filters };
}

/* --------------------------- availability ----------------------------- */
function monthRangeISO(month: number) {
  const now = new Date();
  const year = month - 1 >= now.getMonth() ? now.getFullYear() : now.getFullYear() + 1;
  const start = new Date(year, month - 1, 1);
  const end = endOfMonth(start);
  return { start: format(start, "yyyy-MM-dd"), end: format(end, "yyyy-MM-dd") };
}

function isFreeInMonth(listingId: string, month: number, bookings: Booking[]) {
  const { start, end } = monthRangeISO(month);
  return !bookings.some(
    (b) =>
      b.listingId === listingId &&
      b.status === "confirmed" &&
      start <= format(addDays(parseISO(b.checkOut), -1), "yyyy-MM-dd") &&
      end >= b.checkIn
  );
}

/* ----------------------------- matching ------------------------------- */
function evaluate(l: Listing, f: ParsedFilters, bookings: Booking[]): { score: number; notes: string[]; ok: boolean } {
  let score = 0;
  const notes: string[] = [];
  let ok = true;

  if (f.towns.length) {
    if (f.towns.includes(l.town)) {
      score += 3;
      notes.push(`In ${l.town} — right where you asked.`);
    } else ok = false;
  }
  const tagHits = f.tags.filter((t) => l.tags.includes(t));
  if (f.tags.length) {
    if (tagHits.length) {
      score += 2 * tagHits.length;
      if (!notes.length || !f.towns.length) {
        const tagLine: Record<string, string> = {
          Lakeshore: "On the water, as requested.",
          Highlands: "Up in the highlands, as requested.",
          Treehouses: "A proper treehouse, as requested.",
          Heritage: "Steeped in heritage, as requested.",
          Timberline: "High, cold and timber-lined, as requested.",
          Countryside: "Deep countryside, as requested.",
          Design: "Architecture-first, as requested.",
          Desert: "Out in the desert, as requested.",
        };
        notes.push(tagLine[tagHits[0]] ?? "Matches the style you asked for.");
      }
    } else if (!f.towns.length && !f.types.length) ok = false;
  }
  if (f.types.length) {
    if (f.types.includes(l.type)) {
      score += 2;
      notes.push(`A ${l.type.toLowerCase()}, as requested.`);
    } else if (!f.towns.length && !tagHits.length) ok = false;
  }
  if (f.maxPrice !== undefined) {
    if (l.price <= f.maxPrice) {
      score += 2;
      const diff = f.maxPrice - l.price;
      notes.push(diff >= 2000 ? `${birr(l.price)}/night — ${birr(diff)} under your ${birr(f.maxPrice)} cap.` : `${birr(l.price)}/night — right at your budget.`);
    } else ok = false;
  }
  if (f.minPrice !== undefined) {
    if (l.price >= f.minPrice) {
      score += 1;
      notes.push(`${birr(l.price)}/night — in your premium band.`);
    } else ok = false;
  }
  if (f.guests !== undefined) {
    if (l.guests >= f.guests) {
      score += 1;
      notes.push(`Sleeps ${l.guests} — room for your ${f.guests}.`);
    } else ok = false;
  }
  if (f.amenities.length) {
    const have = f.amenities.filter((a) => l.amenities.includes(a));
    const missing = f.amenities.filter((a) => !l.amenities.includes(a));
    if (have.length) {
      score += have.length;
      notes.push(`Has the ${have[0].toLowerCase()} you asked for.`);
    }
    if (missing.length === f.amenities.length) ok = false;
  }
  if (f.month !== undefined) {
    if (isFreeInMonth(l.id, f.month, bookings)) {
      score += 2;
      notes.push(`Free through ${MONTHS[f.month - 1][0].toUpperCase() + MONTHS[f.month - 1].slice(1)}.`);
    } else ok = false;
  }
  if (l.rating >= 4.9 && l.reviewCount > 50) {
    score += 1;
    notes.push(`Guest favourite — ${l.rating.toFixed(2)}★ across ${l.reviewCount} reviews.`);
  }
  return { score, notes: notes.slice(0, 3), ok };
}

export function searchListings(listings: Listing[], f: ParsedFilters, bookings: Booking[]) {
  const scored = listings
    .filter((l) => l.status === "active")
    .map((l) => ({ l, ...evaluate(l, f, bookings) }))
    .filter((x) => x.ok)
    .sort((a, b) => b.score - a.score || b.l.rating - a.l.rating);
  return scored.slice(0, 4).map(({ l, notes }) => ({ listing: l, source: "haven" as const, notes }));
}

/* ------------------------- best-time knowledge ------------------------- */
const BEST_TIME: Record<string, BestTimeInfo> = {
  Ethiopia: {
    place: "Ethiopia",
    headline: "October – March",
    text: "The long dry season after the June–September rains: clear skies on the plateaus, green valleys, and every festival season at once (Meskel in late September, Timkat in January). Roads to the north are at their most passable.",
    months: [10, 11, 12, 1, 2, 3],
  },
  "Bahir Dar": {
    place: "Bahir Dar & Lake Tana",
    headline: "November – February",
    text: "Sunny lake days with cool evenings. The Blue Nile Falls roar hardest just after the rains (September–November), and the coffee harvest keeps the peninsula buzzing through winter.",
    months: [11, 12, 1, 2],
  },
  Lalibela: {
    place: "Lalibela",
    headline: "October – March",
    text: "Dry, bright days for exploring the rock-hewn churches. Come for Timkat (Ethiopian Epiphany, 19 January) if you can — the courtyards fill with white-robed pilgrims and drumming.",
    months: [10, 11, 12, 1, 2, 3],
  },
  "Addis Ababa": {
    place: "Addis Ababa",
    headline: "October – February",
    text: "At 2,355 m the capital is mild year-round, but these months are rain-free with jacaranda-bright mornings. July–September afternoons tend to soak the sidewalks.",
    months: [10, 11, 12, 1, 2],
  },
  Harar: {
    place: "Harar",
    headline: "October – February",
    text: "Warm days, cool nights, and dry lanes through the Jugol walls. The hyena feeding happens year-round at dusk, but winter evenings are the comfortable ones.",
    months: [10, 11, 12, 1, 2],
  },
  "Arba Minch": {
    place: "Arba Minch & the lakes",
    headline: "November – April",
    text: "Hot, dry lowland weather over Abaya and Chamo. Best light on the water is October–February; crocodiles sunbathe reliably, and the Nechisar plains stay golden.",
    months: [11, 12, 1, 2, 3, 4],
  },
  "Semien Highlands": {
    place: "Semien Highlands",
    headline: "October – March",
    text: "Clear trekking skies after the rains and before the spring haze. Nights drop below freezing above 3,000 m — geladas don't mind, you'll want the wood stove.",
    months: [10, 11, 12, 1, 2, 3],
  },
  Gondar: {
    place: "Gondar",
    headline: "October – March",
    text: "Dry, sunny days for the Fasil Ghebbi castles and Debre Birhan Selassie's painted ceiling. Timket (19–20 January) is the showpiece: Fasilides' Bath is filled and pilgrims leap into the water at dawn.",
    months: [10, 11, 12, 1, 2, 3],
  },
  Axum: {
    place: "Axum",
    headline: "October – March",
    text: "Clear skies over the stelae fields after the rains. Hidar Tsion (Hidar 21, around 30 November) brings pilgrims from across the country to the Church of St Mary of Zion.",
    months: [10, 11, 12, 1, 2, 3],
  },
  "Danakil Depression": {
    place: "the Danakil Depression",
    headline: "November – February",
    text: "The only sensible window: days still reach the mid-30s °C, while summer passes 45 °C. Always travel with a licensed operator, Afar guides and a convoy — it's part of the stay here.",
    months: [11, 12, 1, 2],
  },
  "Bale Mountains": {
    place: "the Bale Mountains",
    headline: "November – March",
    text: "Dry season on the Sanetti Plateau means the best odds of seeing Ethiopian wolves hunting at dawn. Nights drop below freezing up high; the Harenna forest stays mild.",
    months: [11, 12, 1, 2, 3],
  },
  "Omo Valley": {
    place: "the Omo Valley",
    headline: "December – February",
    text: "Between the short and long rains, roads to Jinka, Turmi and the river villages are passable and markets are busy. June–September is a second dry window in the south.",
    months: [12, 1, 2, 6, 7, 8],
  },
  "Ethiopian lakes": {
    place: "the Ethiopian lakes",
    headline: "November – April",
    text: "Calm, dry months across the Rift Valley lakes — good for rowboats, birdlife and pink evening light. The June–September rains can make shore tracks muddy.",
    months: [11, 12, 1, 2, 3, 4],
  },
};

export function bestTimeFor(place?: string): BestTimeInfo {
  if (place && BEST_TIME[place]) return BEST_TIME[place];
  return BEST_TIME.Ethiopia;
}

/* ------------------------------ composer ------------------------------- */
function filterPhrase(f: ParsedFilters): string {
  const parts: string[] = [];
  if (f.towns.length) parts.push(`in ${f.towns[0]}`);
  if (f.types.length) parts.push(`a ${f.types[0].toLowerCase()}`);
  else if (f.tags.length) parts.push(f.tags[0].toLowerCase() === "design" ? "something with design pedigree" : `somewhere ${f.tags[0].toLowerCase()}`);
  if (f.maxPrice !== undefined) parts.push(`under ${birr(f.maxPrice)}/night`);
  if (f.minPrice !== undefined) parts.push(`from ${birr(f.minPrice)}/night`);
  if (f.month !== undefined) parts.push(`in ${MONTHS[f.month - 1]}`);
  if (f.guests !== undefined) parts.push(`for ${f.guests} guest${f.guests > 1 ? "s" : ""}`);
  if (f.amenities.length) parts.push(`with ${f.amenities.slice(0, 2).join(" and ").toLowerCase()}`);
  return parts.join(" · ");
}

export function composeReply(parse: ParseResult, listings: Listing[], bookings: Booking[]): ConciergeReply {
  const { filters } = parse;

  if (parse.intent === "help") {
    return {
      kind: "help",
      intro:
        "Tell me what you're after in plain words — price, place, month, amenities — and I'll search the chart. A few things travellers ask:",
      filters,
      results: [],
    };
  }

  if (parse.intent === "bestTime") {
    const info = bestTimeFor(parse.place);
    let text = info.text;
    if (filters.month !== undefined) {
      const good = info.months.includes(filters.month);
      text = good
        ? `You picked well — ${MONTHS[filters.month - 1]} sits right inside prime season. ${text}`
        : `${MONTHS[filters.month - 1][0].toUpperCase() + MONTHS[filters.month - 1].slice(1)} is outside the usual sweet spot (${info.headline}), though trips happen year-round. ${text}`;
    }
    return {
      kind: "bestTime",
      intro: `Here's the general picture for ${info.place}:`,
      filters,
      results: [],
      bestTime: { ...info, text },
    };
  }

  let results = searchListings(listings, filters, bookings);
  let relaxed: string | undefined;
  if (!results.length) {
    if (filters.month !== undefined) {
      const { month, ...rest } = filters;
      results = searchListings(listings, rest as ParsedFilters, bookings);
      relaxed = "the month";
    }
    if (!results.length && filters.amenities.length) {
      const { amenities, month, ...rest } = filters;
      results = searchListings(listings, rest as ParsedFilters, bookings);
      relaxed = month !== undefined ? "the month and amenities" : "the amenities";
    }
    if (!results.length && filters.maxPrice !== undefined) {
      const rest = { ...filters, maxPrice: Math.round(filters.maxPrice * 1.4) };
      results = searchListings(listings, rest, bookings);
      relaxed = "your price cap";
    }
  }

  const intro = results.length
    ? relaxed
      ? `Nothing fit everything, so I loosened ${relaxed}. Closest matches to ${filterPhrase(filters) || "your request"}:`
      : `I read that as ${filterPhrase(filters)}. Found ${results.length} ${results.length === 1 ? "stay" : "stays"} that fit:`
    : `I couldn't match ${filterPhrase(filters) || "that"} to anything on the chart — try a wider price range or another town.`;

  return { kind: "results", intro, filters, results, relaxed };
}

export const SUGGESTIONS = [
  "A lakeside stay under 40,000 birr in October",
  "Treehouse for two with a fireplace",
  "Best time to visit the Danakil",
  "Somewhere with a coffee ceremony in Gondar",
];
