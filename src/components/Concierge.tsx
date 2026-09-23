import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { useSearch, PRICE_MAX } from "../lib/search";
import {
  composeReply,
  parseQuery,
  SUGGESTIONS,
  type ConciergeReply,
} from "../lib/concierge";
import { ICheck, IChevR, ICompass, IMap, ISparkle, IX } from "./icons";
import { money } from "./ui";

/* --------------------------------- context --------------------------------- */
interface ConciergeCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  ask: (q: string) => void;
}
const Ctx = createContext<ConciergeCtx | null>(null);
export function useConcierge() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConcierge must be used inside ConciergeProvider");
  return ctx;
}

/* --------------------------------- messages --------------------------------- */
interface Msg {
  id: number;
  role: "user" | "concierge";
  text?: string;
  reply?: ConciergeReply;
}

const INTRO =
  "Selam! I'm the Haven concierge. Ask in plain words — a budget, a place, a month, a whim — and I'll search the chart, note why each stay fits, and tell you the best season to go. My advice is general knowledge, not live data.";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function ConciergeProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const askQueue = useRef<string | null>(null);
  const [, force] = useState(0);

  const ask = (q: string) => {
    askQueue.current = q;
    setOpen(true);
    force((x) => x + 1);
  };

  return <Ctx.Provider value={{ open, setOpen, ask }}>{children}<ConciergeHost queueRef={askQueue} /> </Ctx.Provider>;
}

/* ----------------------------------- host ----------------------------------- */
function ConciergeHost({ queueRef }: { queueRef: MutableRefObject<string | null> }) {
  const { open, setOpen } = useConcierge();
  const { listings, bookings, toast } = useStore();
  const search = useSearch();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Msg[]>([{ id: 0, role: "concierge", text: INTRO }]);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<string | null>(null);
  const [hint, setHint] = useState(() => !sessionStorage.getItem("haven.concierge.hint"));
  const idRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms: number) => new Promise((r) => window.setTimeout(r, reduced ? Math.min(ms, 160) : ms));

  useEffect(() => {
    if (open) sessionStorage.setItem("haven.concierge.hint", "1");
    setHint(false);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, stage, reduced]);

  /* consume queued ask() calls once mounted + open */
  useEffect(() => {
    if (!open) return;
    if (queueRef.current) {
      const q = queueRef.current;
      queueRef.current = null;
      send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, queueRef.current]);

  const applyFilters = (reply: ConciergeReply) => {
    const f = reply.filters;
    if (f.maxPrice !== undefined || f.minPrice !== undefined)
      search.setPrice([f.minPrice ?? 0, Math.min(PRICE_MAX, f.maxPrice ?? PRICE_MAX)]);
    if (f.tags.length) search.setCategory(f.tags[0]);
    if (f.guests) search.setGuests(f.guests);
    if (f.towns.length) search.setQuery(f.towns[0]);
    setOpen(false);
    navigate("/");
    toast("success", "Concierge filters applied to the map.");
  };

  const send = async (raw: string) => {
    const q = raw.trim();
    if (!q || stage) return;
    setMessages((m) => [...m, { id: idRef.current++, role: "user", text: q }]);
    setInput("");

    const parse = parseQuery(q);
    const steps =
      parse.intent === "bestTime"
        ? ["Reading your question…", "Consulting the season ledger…"]
        : ["Reading your request…", "Searching the chart…", "Writing concierge notes…"];

    let reply: ConciergeReply | null = null;
    for (let i = 0; i < steps.length; i++) {
      setStage(steps[i]);
      await wait(i === 0 ? 650 : 850);
      if (i === steps.length - 1) reply = composeReply(parse, listings, bookings);
    }
    setStage(null);
    if (reply) setMessages((m) => [...m, { id: idRef.current++, role: "concierge", reply }]);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const filterChips = (reply: ConciergeReply) => {
    const f = reply.filters;
    const chips: string[] = [];
    if (f.towns.length) chips.push(...f.towns);
    if (f.types.length) chips.push(...f.types);
    else if (f.tags.length) chips.push(...f.tags);
    if (f.maxPrice !== undefined) chips.push(`≤ ${money(f.maxPrice)}/night`);
    if (f.minPrice !== undefined) chips.push(`≥ ${money(f.minPrice)}/night`);
    if (f.month !== undefined) chips.push(MONTH_NAMES[f.month - 1]);
    if (f.guests !== undefined) chips.push(`${f.guests} guests`);
    chips.push(...f.amenities);
    return chips;
  };

  return (
    <>
      {/* floating trigger */}
      {!open && (
        <div className="fixed bottom-5 right-5 z-[60]">
          {hint && (
            <div className="pop-in absolute bottom-full right-0 mb-3 w-64 rounded-xl border border-line bg-paper p-3.5 shadow-float">
              <p className="text-[13px] font-semibold leading-snug text-ink">
                Try asking: <span className="text-pine-700">"a lakeside stay under $300 in October"</span>
              </p>
              <span className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 border-b border-r border-line bg-paper" />
            </div>
          )}
          <button
            onClick={() => setOpen(true)}
            className="group flex items-center gap-2.5 rounded-full bg-pine-900 py-3 pl-4 pr-5 text-paper shadow-float transition-all duration-300 hover:-translate-y-1 hover:bg-pine-800"
            aria-label="Open the AI concierge"
          >
            <span className="relative">
              <ICompass className="h-5 w-5 text-marigold-300 transition-transform duration-500 group-hover:rotate-45" />
              <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-marigold-400" />
            </span>
            <span className="text-sm font-bold tracking-wide">Concierge</span>
            <ISparkle className="h-3.5 w-3.5 text-marigold-400" />
          </button>
        </div>
      )}

      {/* backdrop */}
      {open && (
        <button
          className="fixed inset-0 z-[74] bg-pine-950/45 backdrop-blur-[1.5px]"
          onClick={() => setOpen(false)}
          aria-label="Close concierge"
        />
      )}

      {/* drawer */}
      <aside
        className={`fixed right-0 top-0 z-[75] flex h-full w-[min(96vw,430px)] flex-col bg-paper shadow-float transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Haven concierge"
        aria-hidden={!open}
      >
        {/* header */}
        <div className="flex items-center gap-3 border-b border-line bg-pine-900 px-5 py-4 text-paper">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-pine-800">
            <ICompass className="h-5 w-5 text-marigold-300" />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold leading-tight">Haven Concierge</h2>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-pine-200">
              <ISparkle className="h-3 w-3 text-marigold-400" />
              AI SUGGESTIONS · SEARCHES REAL LISTINGS
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-full p-2 transition hover:bg-pine-800" aria-label="Close">
            <IX className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="topo flex-1 space-y-5 overflow-y-auto px-4 py-5">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="fade-in flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-pine-800 px-4 py-2.5 text-sm font-medium leading-relaxed text-paper">
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={m.id} className="fade-in max-w-[95%] space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pine-100 text-pine-700">
                    <ICompass className="h-4 w-4" />
                  </span>
                  <p className="rounded-2xl rounded-tl-md border border-line bg-paper px-4 py-2.5 text-sm leading-relaxed text-ink shadow-sm">
                    {m.text ?? m.reply?.intro}
                  </p>
                </div>

                {m.reply && m.reply.kind !== "help" && filterChips(m.reply).length > 0 && (
                  <div className="ml-9">
                    <p className="mb-1.5 text-[10px] font-bold tracking-[0.18em] text-ink-soft">I READ THIS AS</p>
                    <div className="flex flex-wrap gap-1.5">
                      {filterChips(m.reply).map((c) => (
                        <span key={c} className="rounded-full border border-pine-300 bg-pine-50 px-2.5 py-1 text-xs font-semibold text-pine-800">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* best time card */}
                {m.reply?.bestTime && (
                  <div className="ml-9 overflow-hidden rounded-xl border border-line bg-paper shadow-sm">
                    <div className="border-b border-line bg-parch/60 px-4 py-3">
                      <p className="text-[11px] font-bold tracking-wide text-ink-soft">{m.reply.bestTime.place.toUpperCase()}</p>
                      <p className="font-display text-2xl font-semibold text-pine-900">{m.reply.bestTime.headline}</p>
                    </div>
                    <p className="px-4 py-3 text-[13px] leading-relaxed text-ink-soft">{m.reply.bestTime.text}</p>
                    <div className="mx-4 mb-4 flex items-start gap-2 rounded-lg border border-dashed border-marigold-600/50 bg-marigold-100/60 px-3 py-2.5">
                      <ISparkle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-marigold-600" />
                      <p className="text-[11px] font-semibold leading-snug text-marigold-700">
                        AI suggestion from general knowledge — not verified pricing, availability, or live weather.
                      </p>
                    </div>
                  </div>
                )}

                {/* result cards */}
                {m.reply && m.reply.results.length > 0 && (
                  <div className="ml-9 space-y-2.5">
                    <div className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
                      {m.reply.results.map((r) => (
                        <button
                          key={r.listing.id}
                          onClick={() => { setOpen(false); navigate(`/stay/${r.listing.id}`); }}
                          className="group w-[240px] shrink-0 snap-start overflow-hidden rounded-xl border border-line bg-paper text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-pine-400 hover:shadow-lift"
                        >
                          <div className="relative h-28 overflow-hidden">
                            <img src={r.listing.photo} alt={r.listing.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <span className="absolute left-2 top-2 rounded-full bg-paper/95 px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] text-pine-800">
                              HAVEN · {r.source.toUpperCase()}
                            </span>
                          </div>
                          <div className="p-3">
                            <p className="truncate font-display text-[15px] font-semibold leading-tight text-ink group-hover:text-pine-700">
                              {r.listing.title}
                            </p>
                            <p className="mt-0.5 text-xs text-ink-soft">
                              {r.listing.town} · <span className="font-bold text-ink">{money(r.listing.price)}</span>/night
                            </p>
                            <ul className="mt-2 space-y-1">
                              {r.notes.slice(0, 2).map((n) => (
                                <li key={n} className="flex items-start gap-1.5 text-[11.5px] font-medium leading-snug text-ink-soft">
                                  <ICheck className="mt-0.5 h-3 w-3 shrink-0 text-pine-600" /> {n}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => applyFilters(m.reply!)}
                        className="flex items-center gap-1.5 rounded-full bg-pine-800 px-4 py-2 text-xs font-bold text-paper transition hover:bg-pine-700"
                      >
                        <IMap className="h-3.5 w-3.5" /> Show these filters on the map
                      </button>
                      <span className="text-[11px] text-ink-soft">{m.reply.results.length} match{m.reply.results.length > 1 ? "es" : ""}</span>
                    </div>
                  </div>
                )}

                {/* help suggestions */}
                {m.reply?.kind === "help" && (
                  <div className="ml-9 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => void send(s)} className="rounded-full border border-pine-300 bg-paper px-3.5 py-2 text-xs font-semibold text-pine-800 transition hover:bg-pine-800 hover:text-paper">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {/* thinking indicator */}
          {stage && (
            <div className="fade-in flex items-center gap-2.5" aria-live="polite">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-pine-100 text-pine-700">
                <ICompass className="h-4 w-4 animate-spin [animation-duration:2.4s]" />
              </span>
              <div className="rounded-2xl rounded-tl-md border border-line bg-paper px-4 py-2.5 shadow-sm">
                <span className="flex items-center gap-2 text-sm font-medium text-ink-soft">
                  {stage}
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-pine-400" style={{ animationDelay: `${i * 140}ms` }} />
                    ))}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* suggestion chips + input */}
        <div className="border-t border-line bg-paper px-4 pb-4 pt-3">
          <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => void send(s)}
                disabled={!!stage}
                className="shrink-0 rounded-full border border-line bg-parch px-3 py-1.5 text-[11px] font-semibold text-ink-soft transition hover:border-pine-400 hover:text-pine-800 disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g. "chalet with a hot tub for 6, under $400"'
              className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-3 text-sm font-medium outline-none transition focus:border-pine-600 focus:ring-2 focus:ring-pine-200"
              aria-label="Ask the concierge"
            />
            <button
              type="submit"
              disabled={!input.trim() || !!stage}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pine-800 text-paper transition-all hover:bg-pine-700 disabled:opacity-40"
              aria-label="Send"
            >
              <IChevR className="h-5 w-5" />
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] font-medium tracking-wide text-ink-soft">
            Concierge notes are AI suggestions · availability and prices shown are real Haven listing data
          </p>
        </div>
      </aside>
    </>
  );
}
