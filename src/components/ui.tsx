import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useStore } from "../lib/store";
import { ICheck, IInfo, IStar, IX } from "./icons";

/* ------------------------------ scroll reveal ------------------------------ */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className ?? ""}`}
      style={{ "--rd": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------ count-up number ------------------------------ */
export function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const dur = 1100;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(Math.round(value * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ---------------------------------- rating ---------------------------------- */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  const pct = (rating / 5) * 100;
  return (
    <span className={`relative inline-flex ${className ?? ""}`} aria-label={`${rating} out of 5`}>
      <span className="flex gap-0.5 text-pine-200">
        {[0, 1, 2, 3, 4].map((i) => (
          <IStar key={i} className="h-3.5 w-3.5" />
        ))}
      </span>
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <span className="flex gap-0.5 text-marigold-500">
          {[0, 1, 2, 3, 4].map((i) => (
            <IStar key={i} className="h-3.5 w-3.5 shrink-0" />
          ))}
        </span>
      </span>
    </span>
  );
}

/* ---------------------------------- avatar ---------------------------------- */
export function Avatar({ name, hue, size = "md" }: { name: string; hue: number; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  const cls = size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-sm";
  return (
    <span
      className={`${cls} inline-flex items-center justify-center rounded-full font-semibold text-pine-950 ring-2 ring-paper`}
      style={{ background: `hsl(${hue} 45% 78%)`, color: `hsl(${hue} 50% 22%)` }}
    >
      {initials}
    </span>
  );
}

/* ---------------------------------- toggle ---------------------------------- */
export function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label ?? "toggle"}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
        on ? "bg-pine-600" : "bg-pine-200"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-all duration-300 ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

/* ---------------------------------- modal ---------------------------------- */
export function Modal({
  open,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        className="absolute inset-0 bg-pine-950/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        className={`pop-in relative w-full ${wide ? "max-w-4xl" : "max-w-lg"} max-h-[90vh] overflow-auto rounded-xl bg-paper shadow-float`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full bg-paper/90 p-2 text-ink shadow transition hover:rotate-90 hover:text-ember-600"
        >
          <IX className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------- toasts ---------------------------------- */
export function ToastHost() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[80] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-in pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lift ${
            t.kind === "success"
              ? "border-pine-200 bg-pine-50 text-pine-900"
              : t.kind === "error"
              ? "border-ember-500/30 bg-[#fbeee9] text-ember-600"
              : "border-line bg-paper text-ink"
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {t.kind === "success" ? <ICheck className="h-4 w-4" /> : <IInfo className="h-4 w-4" />}
          </span>
          <p className="flex-1 text-sm font-medium leading-snug">{t.text}</p>
          <button onClick={() => dismissToast(t.id)} className="shrink-0 opacity-50 transition hover:opacity-100" aria-label="Dismiss">
            <IX className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- price formatter ------------------------------ */
export { birr as money } from "../lib/ethiopia";
