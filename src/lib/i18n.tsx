import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "am";

/* UI strings. Listing descriptions, reviews and the concierge stay in English. */
const AM: Record<string, string> = {
  // header & nav
  "Become a host": "አስተናጋጅ ይሁኑ",
  "Sign in": "ይግቡ",
  "Sign out": "ይውጡ",
  "Your trips": "ጉዞዎችዎ",
  "Host dashboard": "የአስተናጋጅ ገጽ",
  "Search Ethiopia": "ኢትዮጵያን ይፈልጉ",
  "Any week": "ማንኛውም ሳምንት",
  "Add nights": "ምሽቶች ይጨምሩ",
  "Guests": "እንግዶች",
  "Saved stays": "የተቀመጡ ማረፊያዎች",
  // categories
  "All stays": "ሁሉም ማረፊያዎች",
  "Highlands": "ደጋማ ቦታዎች",
  "Lakeshore": "የሐይቅ ዳርቻ",
  "Treehouses": "የዛፍ ላይ ቤቶች",
  "Heritage": "ቅርስ",
  "Timberline": "የተራራ ጫፍ",
  "Countryside": "ገጠር",
  "Design": "ዲዛይን",
  "Desert": "በረሃ",
  // filter bar
  "Dates": "ቀኖች",
  "Price": "ዋጋ",
  "Saved": "የተቀመጡ",
  "Clear": "አጽዳ",
  "Clear all": "ሁሉንም አጽዳ",
  "When are you travelling?": "መቼ ይጓዛሉ?",
  "Only stays free for your nights are shown.": "ለቀኖችዎ ክፍት የሆኑ ማረፊያዎች ብቻ ይታያሉ።",
  "Nightly price": "የአንድ ምሽት ዋጋ",
  "How many travellers?": "ስንት ተጓዦች?",
  "Any": "ማንኛውም",
  "stays across Ethiopia": "ማረፊያዎች በመላው ኢትዮጵያ",
  "Recommended": "የሚመከሩ",
  "Price · low to high": "ዋጋ · ከዝቅተኛ ወደ ከፍተኛ",
  "Price · high to low": "ዋጋ · ከከፍተኛ ወደ ዝቅተኛ",
  "Top rated": "ከፍተኛ ደረጃ",
  "MAP + GRID": "ካርታ + ዝርዝር",
  "GRID": "ዝርዝር",
  "Map": "ካርታ",
  "Grid": "ዝርዝር",
  "stays": "ማረፊያዎች",
  // browse hero
  "9.1° N — THE ETHIOPIAN HIGHLANDS": "9.1° ሰሜን — የኢትዮጵያ ደጋማ ቦታዎች",
  "Every kind of quiet,": "ሁሉም ዓይነት ጸጥታ፣",
  "one": "አንድ",
  "ancient": "ጥንታዊ",
  "land.": "ምድር።",
  "hero.body":
    "ከሰሜን ተራሮች ጫፍ እስከ ዳናኪል የጨው ሜዳ፣ ከጣና ሐይቅ ጀልባዎች እስከ ሐረር ግንብ ውስጥ ያሉ ቤቶች — በሄቨን ላይ ያለ እያንዳንዱ ማረፊያ ከመመዝገቡ በፊት ቡድናችን ጎብኝቶ አድሮበታል።",
  "STAYS": "ማረፊያዎች",
  "AVG RATING": "አማካይ ደረጃ",
  "TOWNS": "ከተሞች",
  "Nothing on the chart here": "እዚህ ምንም ማረፊያ አልተገኘም",
  "Clear all filters": "ሁሉንም ማጣሪያዎች አጽዳ",
  "Ask the concierge": "አማካሪውን ይጠይቁ",
  // stay card & stay page
  "night": "ለአንድ ምሽት",
  "New": "አዲስ",
  "GUEST FAVOURITE": "የእንግዶች ምርጫ",
  "Share": "አጋራ",
  "Save": "አስቀምጥ",
  "reviews": "ግምገማዎች",
  "About this stay": "ስለዚህ ማረፊያ",
  "What this place offers": "ይህ ቦታ የሚያቀርበው",
  "Where you'll be": "የሚያርፉበት ቦታ",
  "Hosting since": "ማስተናገድ የጀመሩት",
  "hosted by": "· አስተናጋጅ",
  "Check availability": "ክፍት ቀኖችን ይመልከቱ",
  "You won't be charged yet": "ገና ክፍያ አይፈጸምም",
  "Sign-in needed to confirm": "ለማረጋገጥ መግባት ያስፈልጋል",
  "Cleaning fee": "የጽዳት ክፍያ",
  "Haven service fee (12%)": "የሄቨን አገልግሎት ክፍያ (12%)",
  "Total": "ጠቅላላ",
  "Pay with": "የመክፈያ መንገድ",
  "Ethiopian calendar": "የኢትዮጵያ ዘመን አቆጣጠር",
  "More havens nearby": "በአቅራቢያ ያሉ ሌሎች ማረፊያዎች",
  "cancel.note": "ለ48 ሰዓታት በነጻ መሰረዝ ይቻላል። በቀን መቁጠሪያው ላይ የተሰረዙ ቀኖች ቀድመው ተይዘዋል።",
  // trips
  "YOUR TRIPS": "ጉዞዎችዎ",
  "Bags packed,": "ሻንጣዎ ተዘጋጅቷል፣",
  "Find another stay": "ሌላ ማረፊያ ይፈልጉ",
  "upcoming": "መጪ",
  "past": "ያለፉ",
  "cancelled": "የተሰረዙ",
  "Upcoming": "መጪ",
  "Stayed": "ያረፉበት",
  "Cancelled": "ተሰርዟል",
  "Cancel trip": "ጉዞውን ሰርዝ",
  "Stay again?": "እንደገና ያርፉ?",
  "View listing": "ማረፊያውን ይመልከቱ",
  "Paid with": "የተከፈለው በ",
  "No trips on the horizon": "በቅርቡ ምንም ጉዞ የለም",
  "Browse stays": "ማረፊያዎችን ይመልከቱ",
  // host
  "HOST DASHBOARD": "የአስተናጋጅ ገጽ",
  "Selam,": "ሰላም፣",
  "Add a listing": "ማረፊያ ይጨምሩ",
  "Listings live": "ንቁ ማረፊያዎች",
  "Upcoming stays": "መጪ ቆይታዎች",
  "Booking value": "የተያዙ ቦታዎች ዋጋ",
  "Listing views": "የማረፊያ እይታዎች",
  "Your listings": "ማረፊያዎችዎ",
  // footer
  "EXPLORE": "ያስሱ",
  "HOSTING": "ማስተናገድ",
  "TRAVELLERS": "ተጓዦች",
  "footer.tagline":
    "የኢትዮጵያ የማረፊያ ገበያ — ከሰሜን ተራሮች እስከ ሐረር ግንብ ድረስ በአካል የተጎበኙ ማረፊያዎች፣ ትክክለኛ ቀን መቁጠሪያዎች፣ እና በሚያርፉበት ቦታ የሚኖሩ አስተናጋጆች።",
  "Create account": "መለያ ይፍጠሩ",
  "any.note": "\"ማንኛውም\" በኢትዮጵያ ያሉ ሁሉንም ማረፊያዎች ያሳያል።",
};

const EN_OVERRIDES: Record<string, string> = {
  "hero.body":
    "Juniper treehouses on the Semien rim, salt-flat camps in the Danakil, lakeboats on Tana, courtyard houses inside Harar's walls — every stay on Haven is walked, slept in and sketched by our survey team before it's listed.",
  "hosted by": "hosted by",
  "any.note": "\"Any\" shows every stay in Ethiopia.",
  "cancel.note": "Free cancellation for 48 hours. Struck-through dates on the calendar are already booked.",
  "footer.tagline":
    "A rental marketplace for Ethiopia — hand-surveyed stays from the Semien rim to the Harar walls, honest calendars, hosts who live where you're sleeping.",
};

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  /** simple plural helper: count(n, "guest", "guests") → "3 guests" / "3 እንግዶች" */
  count: (n: number, one: string, many: string) => string;
}

const AM_NOUNS: Record<string, string> = {
  guest: "እንግዳ", guests: "እንግዶች",
  night: "ምሽት", nights: "ምሽቶች",
  bed: "አልጋ", beds: "አልጋዎች",
  bath: "መታጠቢያ", baths: "መታጠቢያዎች",
  stay: "ማረፊያ", stays: "ማረፊያዎች",
};

const Ctx = createContext<LangState | null>(null);
const KEY = "haven.lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return localStorage.getItem(KEY) === "am" ? "am" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* non-fatal */
    }
  }, [lang]);

  const t = useCallback(
    (key: string) => (lang === "am" ? AM[key] ?? EN_OVERRIDES[key] ?? key : EN_OVERRIDES[key] ?? key),
    [lang]
  );

  const count = useCallback(
    (n: number, one: string, many: string) => {
      const word = n === 1 ? one : many;
      return `${n} ${lang === "am" ? AM_NOUNS[word] ?? word : word}`;
    },
    [lang]
  );

  return <Ctx.Provider value={{ lang, setLang: setLangState, t, count }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
