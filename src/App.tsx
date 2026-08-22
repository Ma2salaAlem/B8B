import { useEffect } from "react";
import { HashRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { StoreProvider } from "./lib/store";
import { SearchProvider } from "./lib/search";
import Header from "./components/Header";
import { ToastHost } from "./components/ui";
import { ILogo } from "./components/icons";
import Browse from "./pages/Browse";
import Stay from "./pages/Stay";
import Auth from "./pages/Auth";
import Host from "./pages/Host";
import Trips from "./pages/Trips";
import { TOWNS } from "./lib/seed";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-28 text-center">
      <p className="font-display text-[80px] font-bold leading-none text-pine-200">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-pine-950">Off the chart, friend.</h1>
      <p className="mt-3 text-ink-soft">That page isn't on our survey of Ethiopia. Let's get you back on the trail.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-pine-800 px-7 py-3 text-sm font-bold text-paper transition hover:bg-pine-700">
        Back to Haven
      </Link>
    </div>
  );
}

function Footer() {
  return (
    <footer className="topo relative mt-16 bg-pine-950 text-pine-100">
      <div className="mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <ILogo className="h-9 w-9" />
              <span className="font-display text-2xl font-semibold text-paper">Haven</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-pine-200">
              A rental marketplace for Ethiopia — hand-surveyed stays from the Semien rim to the
              Harar walls, honest calendars, hosts who live where you're sleeping.
            </p>
            <p className="mt-5 rounded-lg border border-pine-800 bg-pine-900/70 px-4 py-3 text-xs leading-relaxed text-pine-300">
              <span className="font-bold text-marigold-300">Working prototype.</span> Data lives in your browser's localStorage,
              standing in for the PostgreSQL schema in <code className="font-mono text-[11px]">blueprint/schema.sql</code>.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-[0.2em] text-marigold-300">EXPLORE</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {TOWNS.map((t) => (
                <li key={t.name}>
                  <Link to="/" className="transition hover:text-paper hover:underline underline-offset-4">{t.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-[0.2em] text-marigold-300">HOSTING</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/host" className="transition hover:text-paper hover:underline underline-offset-4">Become a host</Link></li>
              <li><Link to="/host" className="transition hover:text-paper hover:underline underline-offset-4">Host dashboard</Link></li>
              <li><Link to="/" className="transition hover:text-paper hover:underline underline-offset-4">Survey standards</Link></li>
              <li><Link to="/" className="transition hover:text-paper hover:underline underline-offset-4">Host guarantee</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-[0.2em] text-marigold-300">TRAVELLERS</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/trips" className="transition hover:text-paper hover:underline underline-offset-4">Your trips</Link></li>
              <li><Link to="/auth" className="transition hover:text-paper hover:underline underline-offset-4">Create account</Link></li>
              <li><Link to="/" className="transition hover:text-paper hover:underline underline-offset-4">Cancellation policy</Link></li>
              <li><Link to="/" className="transition hover:text-paper hover:underline underline-offset-4">Trail conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-pine-800 pt-6 text-xs text-pine-300">
          <p>© 2026 Haven Stays Cooperative · 9.1° N, on the roof of Africa</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-marigold-400" />
            All systems charted · React + TS + Tailwind, PostgreSQL-ready
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <SearchProvider>
        <HashRouter>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Browse />} />
                <Route path="/stay/:id" element={<Stay />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/host" element={<Host />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
          <ToastHost />
        </HashRouter>
      </SearchProvider>
    </StoreProvider>
  );
}
