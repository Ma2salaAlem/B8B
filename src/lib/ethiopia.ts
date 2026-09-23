/* ------------------------------------------------------------------ */
/*  Ethiopia-specific helpers: Birr, the Ethiopian calendar, payments. */
/* ------------------------------------------------------------------ */

/* ----------------------------- currency ----------------------------- */
// All prices in the app are stored as whole Ethiopian Birr (ETB).
export const birr = (n: number) => `ETB ${Math.round(n).toLocaleString("en-US")}`;
export const birrShort = (n: number) =>
  n >= 1000 ? `ETB ${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : birr(n);

/* -------------------------- Ethiopian calendar ----------------------- */
// 13 months: twelve of 30 days plus Pagume (5 days, 6 in a leap year).
// The year starts on Meskerem 1 (11 September, or 12 September before a
// Gregorian leap year) and runs 7–8 years behind the Gregorian count.
export const ETH_MONTHS_EN = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit", "Megabit",
  "Miyazya", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume",
];
export const ETH_MONTHS_AM = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት", "መጋቢት",
  "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ",
];

export interface EthDate {
  year: number;
  month: number; // 1–13
  day: number;
}

const ETH_EPOCH_OFFSET = 1723856; // JDN of Meskerem 1, year 1 (Amete Mihret) minus 365

/** Convert an ISO yyyy-MM-dd Gregorian date to the Ethiopian calendar. */
export function toEthiopian(isoDate: string): EthDate {
  const [y, m, d] = isoDate.split("-").map(Number);
  const jdn = Math.floor(Date.UTC(y, m - 1, d) / 86400000) + 2440588;
  const r = (jdn - ETH_EPOCH_OFFSET) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - ETH_EPOCH_OFFSET) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  return { year, month: Math.floor(n / 30) + 1, day: (n % 30) + 1 };
}

/** e.g. "Meskerem 13, 2019" / "መስከረም 13 2019" */
export function formatEth(isoDate: string, lang: "en" | "am" = "en") {
  const e = toEthiopian(isoDate);
  return lang === "am"
    ? `${ETH_MONTHS_AM[e.month - 1]} ${e.day} ${e.year}`
    : `${ETH_MONTHS_EN[e.month - 1]} ${e.day}, ${e.year}`;
}

/** e.g. "Tahsas 3 – 7, 2019 E.C." — collapses shared month / year. */
export function formatEthRange(checkIn: string, checkOut: string, lang: "en" | "am" = "en") {
  const a = toEthiopian(checkIn);
  const b = toEthiopian(checkOut);
  const M = lang === "am" ? ETH_MONTHS_AM : ETH_MONTHS_EN;
  const era = lang === "am" ? "ዓ.ም." : "E.C.";
  const left = `${M[a.month - 1]} ${a.day}`;
  const right = a.month === b.month && a.year === b.year ? `${b.day}` : `${M[b.month - 1]} ${b.day}`;
  return a.year === b.year ? `${left} – ${right}, ${b.year} ${era}` : `${left}, ${a.year} – ${right}, ${b.year} ${era}`;
}

/* ------------------------------ payments ----------------------------- */
export type PaymentMethod = "telebirr" | "cbebirr" | "card";

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; note: string; noteAm: string }[] = [
  { id: "telebirr", label: "telebirr", note: "Pay from your Ethio telecom wallet", noteAm: "ከኢትዮ ቴሌኮም ዋሌትዎ ይክፈሉ" },
  { id: "cbebirr", label: "CBE Birr", note: "Commercial Bank of Ethiopia mobile money", noteAm: "የኢትዮጵያ ንግድ ባንክ የሞባይል ገንዘብ" },
  { id: "card", label: "Visa / Mastercard", note: "For travellers paying from abroad", noteAm: "ከውጭ ሀገር ለሚከፍሉ ተጓዦች" },
];

export const paymentLabel = (id?: PaymentMethod) => PAYMENT_METHODS.find((p) => p.id === id)?.label ?? "—";
