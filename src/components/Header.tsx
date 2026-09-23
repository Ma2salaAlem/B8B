import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useStore } from "../lib/store";
import { useSearch } from "../lib/search";
import { useLang } from "../lib/i18n";
import { Avatar } from "./ui";
import { ICalendar, IChevD, IHeart, ILogOut, ILogo, IPin, ISearch, IUsers } from "./icons";

export default function Header() {
  const { currentUser, logout, favorites } = useStore();
  const { query, setQuery, range, guests } = useSearch();
  const { t, lang, setLang, count } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isBrowse = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const dateLabel =
    range.checkIn && range.checkOut
      ? `${format(parseISO(range.checkIn), "MMM d")} – ${format(parseISO(range.checkOut), "MMM d")}`
      : range.checkIn
      ? `${format(parseISO(range.checkIn), "MMM d")} – ${t("Add nights")}`
      : t("Any week");

  const goSearch = () => {
    if (!isBrowse) navigate("/");
    window.setTimeout(
      () => document.getElementById("filter-bar")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      isBrowse ? 0 : 120
    );
  };

  return (
    <header
      className={`flag-stripe sticky top-0 z-50 border-b bg-paper/92 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "border-line shadow-[0_4px_20px_-8px_rgb(22_36_29/0.15)]" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-10">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="Haven home">
          <ILogo className="h-9 w-9 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="font-display text-[26px] font-semibold tracking-tight text-pine-800">
            Haven
          </span>
        </Link>

        {/* search pill */}
        <button
          onClick={goSearch}
          className="mx-auto hidden max-w-[480px] flex-1 items-center rounded-full border border-line bg-paper py-2 pl-5 pr-2 text-left shadow-sm transition-all duration-300 hover:border-pine-300 hover:shadow-lift md:flex"
          aria-label="Search stays"
        >
          <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-ink">
            <ISearch className="h-4 w-4 shrink-0 text-pine-600" />
            <span className="truncate">{query.trim() ? query.trim() : t("Search Ethiopia")}</span>
          </span>
          <span className="mx-3 h-5 w-px shrink-0 bg-line" />
          <span className="flex shrink-0 items-center gap-1.5 text-sm text-ink-soft">
            <ICalendar className="h-4 w-4 text-pine-600" />
            {dateLabel}
          </span>
          <span className="mx-3 h-5 w-px shrink-0 bg-line" />
          <span className="flex shrink-0 items-center gap-1.5 text-sm text-ink-soft">
            <IUsers className="h-4 w-4 text-pine-600" />
            {guests ? count(guests, "guest", "guests") : t("Guests")}
          </span>
          <span className="ml-3 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pine-700 text-paper transition-colors group-hover:bg-pine-600">
            <ISearch className="h-4 w-4" />
          </span>
        </button>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Link
            to="/host"
            className={`hidden rounded-full px-4 py-2 text-sm font-semibold transition-colors lg:block ${
              location.pathname === "/host" ? "bg-pine-100 text-pine-800" : "text-ink hover:bg-parch"
            }`}
          >
            {t("Become a host")}
          </Link>

          <button
            onClick={() => setLang(lang === "en" ? "am" : "en")}
            className="rounded-full border border-line px-3 py-1.5 text-sm font-bold text-pine-800 transition hover:border-pine-400 hover:bg-parch"
            aria-label={lang === "en" ? "Switch to Amharic" : "Switch to English"}
            title={lang === "en" ? "አማርኛ" : "English"}
          >
            {lang === "en" ? "አማ" : "EN"}
          </button>

          <button
            onClick={() => {
              navigate("/");
              window.setTimeout(() => document.getElementById("filter-bar")?.scrollIntoView({ behavior: "smooth" }), 80);
            }}
            className="relative hidden rounded-full p-2.5 text-ink transition hover:bg-parch sm:block"
            aria-label={t("Saved stays")}
            title={t("Saved stays")}
          >
            <IHeart className="h-5 w-5" filled={favorites.length > 0} />
            {favorites.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ember-500 px-1 text-[10px] font-bold text-paper">
                {favorites.length}
              </span>
            )}
          </button>

          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className={`flex items-center gap-2 rounded-full border border-line bg-paper py-1 pl-1.5 pr-2 shadow-sm transition hover:border-pine-300 ${
                  menuOpen ? "border-pine-300" : ""
                }`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Avatar name={currentUser.name} hue={currentUser.hue} size="sm" />
                <IChevD className={`h-3.5 w-3.5 text-ink-soft transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`} />
              </button>
              {menuOpen && (
                <div className="pop-in absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-paper shadow-float" role="menu">
                  <div className="border-b border-line px-4 py-3">
                    <p className="text-sm font-bold">{currentUser.name}</p>
                    <p className="truncate text-xs text-ink-soft">{currentUser.email}</p>
                  </div>
                  <nav className="py-1.5 text-sm">
                    <Link to="/trips" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 font-medium transition hover:bg-parch" role="menuitem">
                      <IPin className="h-4 w-4 text-pine-600" /> {t("Your trips")}
                    </Link>
                    <Link to="/host" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 font-medium transition hover:bg-parch" role="menuitem">
                      <ILogo className="h-4 w-4" /> {t("Host dashboard")}
                    </Link>
                    <button onClick={() => { logout(); setMenuOpen(false); navigate("/"); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-medium text-ember-600 transition hover:bg-parch" role="menuitem">
                      <ILogOut className="h-4 w-4" /> {t("Sign out")}
                    </button>
                  </nav>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="rounded-full bg-pine-800 px-5 py-2.5 text-sm font-semibold text-paper shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-pine-700 hover:shadow-lift"
            >
              {t("Sign in")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
