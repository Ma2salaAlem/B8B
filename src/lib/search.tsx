import { createContext, useContext, useState, type ReactNode } from "react";
import type { DateRange } from "./types";

export interface SearchState {
  query: string;
  setQuery: (v: string) => void;
  range: DateRange;
  setRange: (v: DateRange) => void;
  guests: number;
  setGuests: (v: number) => void;
  category: string;
  setCategory: (v: string) => void;
  price: [number, number];
  setPrice: (v: [number, number]) => void;
  savedOnly: boolean;
  setSavedOnly: (v: boolean) => void;
  sort: string;
  setSort: (v: string) => void;
  viewMode: "split" | "grid";
  setViewMode: (v: "split" | "grid") => void;
  reset: () => void;
  activeCount: number;
}

const Ctx = createContext<SearchState | null>(null);

const PRICE_CAP = 450;

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<DateRange>({ checkIn: null, checkOut: null });
  const [guests, setGuests] = useState(0);
  const [category, setCategory] = useState("All stays");
  const [price, setPrice] = useState<[number, number]>([0, PRICE_CAP]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState("recommended");
  const [viewMode, setViewMode] = useState<"split" | "grid">("split");

  const activeCount =
    (query ? 1 : 0) +
    (range.checkIn && range.checkOut ? 1 : 0) +
    (guests ? 1 : 0) +
    (category !== "All stays" ? 1 : 0) +
    (price[0] > 0 || price[1] < PRICE_CAP ? 1 : 0) +
    (savedOnly ? 1 : 0);

  const reset = () => {
    setQuery("");
    setRange({ checkIn: null, checkOut: null });
    setGuests(0);
    setCategory("All stays");
    setPrice([0, PRICE_CAP]);
    setSavedOnly(false);
    setSort("recommended");
  };

  return (
    <Ctx.Provider
      value={{
        query, setQuery, range, setRange, guests, setGuests,
        category, setCategory, price, setPrice, savedOnly, setSavedOnly,
        sort, setSort, viewMode, setViewMode, reset, activeCount,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSearch must be used inside SearchProvider");
  return ctx;
}

export const PRICE_MAX = PRICE_CAP;
