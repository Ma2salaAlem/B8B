# Haven Concierge — Backend Architecture (Phase 1 + Phase 2 seam)

The prototype (`src/lib/concierge.ts` + `src/components/Concierge.tsx`) runs the exact UX
described here with a deterministic local parser that emits the same JSON schema the real
LLM endpoint will. Swap `parseQuery()` for a `fetch("/api/concierge/chat")` and the UI
doesn't change.

---

## 1. Where the LLM lives (and where it doesn't)

```
browser                API layer                    Postgres
───────                ─────────                    ────────
"cheap lakeside        POST /api/concierge/chat
 stay under $300"  ──► ① parse (Claude tool-use)
                        ② normalize + zod validate
                        ③ SearchProvider registry ──► properties / bookings
                        ④ template notes (no LLM)
                        ⑤ best-time KB / LLM fallback
                   ◄── { filters, results[], notes, bestTime }
```

Rules that keep this sane:

- **The LLM never writes SQL and never sees prices as output text.** It converts English →
  a strict filter JSON. Your existing filter code (same logic as `Browse.tsx`) queries
  Postgres. Hallucinations can't reach a `WHERE` clause because zod drops unknown fields.
- **Ground the model in your vocabulary.** The system prompt lists *your* towns, tags,
  amenity names and price bounds. Constrained outputs hallucinate far less and map 1:1 to
  columns.
- **Notes are templates, not LLM calls.** "Why it fits" is just structured diffs
  (`price ≤ cap → "$X under your cap"`, `month free → "free through October"`). Free,
  deterministic, and provably true. Use an LLM only if you later want a single polished
  intro sentence — one call per reply, cached.

## 2. Keeping API costs sane

| Lever | What to do | Effect |
|---|---|---|
| Parse only on submit | Enter key, or 700ms debounce — never keystroke streams. AbortController cancels in-flight parses on new input. | ~90% fewer calls vs naive typing |
| Cache parses | Redis key `concierge:parse:sha256(normalized_query)`, TTL 24h. Normalize = lowercase, collapse whitespace, strip punctuation. | Repeat queries are free |
| Small model for parsing | `claude-haiku-4-5` with forced tool use, `max_tokens: 300`. Save Sonnet for anything creative. | ~$0.0002 per parse |
| No per-result LLM | Template notes (§1). | $0 |
| Static best-time KB | A row per region in Postgres/JSON (like `BEST_TIME` in the prototype). LLM fallback only for unknown places, cached 7 days. | ~$0 for your own regions |
| Rate limits | express-rate-limit: 20 req/min per IP on `/api/concierge/*`; 1 call per user message server-side. | Abuse-proof |

Back-of-envelope: 100k traveller queries/day, 60% cache hit → 40k haiku parses ≈ **$8/day**.

## 3. The endpoint (reference implementation)

```ts
// apps/api/src/routes/concierge.ts
import { Router } from "express";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import { providers } from "../services/search-providers";
import { bestTimeFor } from "../services/best-time";
import { cache } from "../services/cache"; // Redis or lru-cache

const ParsedQuery = z.object({
  intent: z.enum(["search", "best_time", "help"]),
  place: z.string().optional(),
  towns: z.array(z.enum(["Bahir Dar", "Lalibela", "Addis Ababa", "Harar", "Arba Minch", "Semien Highlands"])),
  tags: z.array(z.string()),            // validate against CATEGORIES
  types: z.array(z.string()),
  amenities: z.array(z.string()),       // validate against AMENITIES
  minPrice: z.number().int().positive().optional(),
  maxPrice: z.number().int().positive().optional(),
  month: z.number().int().min(1).max(12).optional(),
  guests: z.number().int().min(1).max(16).optional(),
});

const SYSTEM = `You are Haven's trip parser. Emit filters using ONLY the towns, tags and
amenities listed in the tool schema. month is 1-12. If the traveller's intent is a general
question about seasons, use intent best_time. Never invent prices or dates.`;

export const conciergeRouter = Router();

conciergeRouter.post("/chat", async (req, res, next) => {
  try {
    const query = z.string().min(2).max(500).parse(req.body.message);
    const key = `concierge:parse:${hash(normalize(query))}`;

    // ①+② parse (cached)
    let parsed = await cache.get<ParsedQuery>(key);
    if (!parsed) {
      const anthropic = new Anthropic();
      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        system: SYSTEM,
        tools: [{
          name: "emit_travel_filters",
          description: "Structured travel search filters parsed from the traveller's message.",
          input_schema: zodToJsonSchema(ParsedQuery) as Anthropic.Tool.InputSchema,
        }],
        tool_choice: { type: "tool", name: "emit_travel_filters" },  // force structured output
        messages: [{ role: "user", content: query }],
      });
      const block = msg.content.find((b) => b.type === "tool_use");
      parsed = ParsedQuery.parse(block?.input ?? {});               // zod drops hallucinated fields
      await cache.set(key, parsed, 60 * 60 * 24);
    }

    // ③ providers — Phase-2 seam (§4)
    if (parsed.intent === "best_time") {
      return res.json({ kind: "bestTime", filters: parsed, bestTime: await bestTimeFor(parsed.place) });
    }
    const settled = await Promise.allSettled(
      providers.map((p) => withTimeout(p.search(parsed), 2500))
    );
    const results = settled
      .filter((r): r is PromiseFulfilledResult<ListingResult[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    // ④ template notes — no LLM (services/notes.ts, mirrors prototype's evaluate())
    res.json({
      kind: "results",
      filters: parsed,
      results: results.slice(0, 4).map((r) => ({ ...r, notes: fitNotes(r, parsed) })),
    });
  } catch (e) { next(e); }
});
```

`fitNotes` and `bestTimeFor` are line-for-line the prototype's `evaluate()` /
`BEST_TIME` table, ported to run over Prisma rows.

## 4. Phase-2 seam: the listing-source abstraction

Never return raw DB rows to the client. Define one normalized shape and produce it
behind a provider interface:

```ts
// packages/shared/src/listing-result.ts  (imported by web AND api)
export interface ListingResult {
  source: "haven" | "booking" | "amadeus";   // ← the field that makes Phase 2 possible
  sourceId: string;          // your UUID, or the partner's property id
  title: string;
  town: string;
  region: string;
  pricePerNightCents: number;
  currency: "USD";
  lat: number; lng: number;  // mapX/mapY in the prototype are the placeholder
  rating: number | null;
  reviewCount: number;
  imageUrl: string;
  detailPath: string;        // "/stay/:id" for haven; affiliate deep link for partners
}

// apps/api/src/services/search-providers.ts
export interface SearchProvider {
  id: ListingResult["source"];
  search(f: ParsedQuery): Promise<ListingResult[]>;
}

export const havenProvider: SearchProvider = {
  id: "haven",
  async search(f) {
    const rows = await prisma.properties.findMany({ where: toPrismaWhere(f), take: 50 });
    return rows.map((r) => ({
      source: "haven", sourceId: r.id, pricePerNightCents: r.price_cents,
      detailPath: `/stay/${r.id}`, /* …map the rest… */
    }));
  },
};

export const providers: SearchProvider[] = [havenProvider];
// Phase 2: providers.push(bookingProvider) — maps Booking.com Affiliate API responses
// into the SAME shape, tags source: "booking", sets detailPath to the affiliate deep
// link. Merge = flatMap over settled providers (§3), optionally dedupe by (lat,lng,radius),
// sort by a score. External results are never written into your tables.
```

Because `parseQuery → provider.search(filters)` is the whole pipeline, adding Expedia or
Amadeus later is: write one adapter file, push one line. The frontend already renders a
`source` badge ("HAVEN" on every concierge card) — Phase 2 cards will show "via Booking.com".

## 5. Labeling "best time to visit" (the honest way)

The UI must separate **your data** (real) from **model knowledge** (advisory). Recipe,
already implemented in `Concierge.tsx`:

1. **Badge, not footnote.** A dashed marigold callout directly under the season text:
   sparkle icon + "AI suggestion from general knowledge — not verified pricing,
   availability, or live weather." Dashed border + distinct hue = reads as advisory, not
   as a fact card.
2. **Never blend it into result cards.** Availability and price shown on cards come from
   your `bookings`/`properties` tables; the drawer footer says exactly that:
   *"Concierge notes are AI suggestions · availability and prices shown are real Haven
   listing data."*
3. **Header provenance.** The drawer header line: "AI SUGGESTIONS · SEARCHES REAL
   LISTINGS" — one phrase, both truths.
4. **Accessibility.** `role="note"` on the disclaimer, `aria-live="polite"` on the
   thinking stage, so screen-reader users get the same honesty.
5. **Upgrade path.** When you add a weather/pricing data source later, the card can say
   "verified by Open-Meteo" for that block only — the badge system already distinguishes
   sourced vs advisory content.

Legal footnote for your README/Terms: concierge season guidance is general information,
not a guarantee of climate, pricing, or booking availability.

## 6. Build order (one focused week)

1. Port `BEST_TIME` + `evaluate()` to `services/notes.ts` + `services/best-time.ts` (pure
   functions, unit-testable, zero LLM).
2. `/api/concierge/chat` with cache + rate limit; test with curl against 20 real queries.
3. Replace prototype's `parseQuery` call site with a fetch; keep the deterministic parser
   as an offline fallback (`if (llm unavailable) parseQuery(q)`) — graceful degradation
   your users never notice.
4. Ship. Then measure: cache hit rate, parse latency p95, cost/day. Only then consider an
   LLM-written intro sentence (§1) — it's a cost, not a requirement.
