import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addDays, areIntervalsOverlapping, differenceInDays, parseISO } from "date-fns";
import { SEED_BOOKINGS, SEED_LISTINGS, SEED_USERS, daysFromNow, hash, iso } from "./seed";
import type { Booking, DateRange, Listing, ToastMsg, User } from "./types";

const V = "haven.v4";
const LS = {
  users: `${V}.users`,
  listings: `${V}.listings`,
  bookings: `${V}.bookings`,
  session: `${V}.session`,
  favs: `${V}.favs`,
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — non-fatal in the prototype */
  }
}

export interface NewListingInput {
  title: string;
  type: string;
  town: string;
  price: number;
  cleaningFee: number;
  guests: number;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  amenities: string[];
  photo: string;
  tags: string[];
  mapX: number;
  mapY: number;
}

interface Store {
  currentUser: User | null;
  users: User[];
  listings: Listing[];
  bookings: Booking[];
  favorites: string[];
  toasts: ToastMsg[];
  signup: (name: string, email: string, pw: string) => string | null;
  login: (email: string, pw: string) => string | null;
  loginGoogle: () => void;
  logout: () => void;
  isFav: (id: string) => boolean;
  toggleFav: (id: string) => void;
  addListing: (input: NewListingInput) => Listing;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  createBooking: (input: {
    listingId: string;
    range: DateRange;
    guests: number;
  }) => { ok: true; booking: Booking } | { ok: false; error: string };
  cancelBooking: (id: string) => void;
  recordView: (id: string) => void;
  toast: (kind: ToastMsg["kind"], text: string) => void;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);

const galleryFor = (src: string, noun: string) => [
  { caption: `${noun} — main view`, scale: 1, pos: "50% 50%" },
  { caption: "Living area", scale: 1.9, pos: "18% 62%" },
  { caption: "Morning light", scale: 1.7, pos: "78% 30%" },
  { caption: "The details", scale: 2.3, pos: "55% 78%" },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => load(LS.users, SEED_USERS));
  const [listings, setListings] = useState<Listing[]>(() => load(LS.listings, SEED_LISTINGS));
  const [bookings, setBookings] = useState<Booking[]>(() => load(LS.bookings, SEED_BOOKINGS));
  const [sessionId, setSessionId] = useState<string | null>(() => load<string | null>(LS.session, null));
  const [favorites, setFavorites] = useState<string[]>(() => load(LS.favs, ["l-tree", "l-beach"]));
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  useEffect(() => save(LS.users, users), [users]);
  useEffect(() => save(LS.listings, listings), [listings]);
  useEffect(() => save(LS.bookings, bookings), [bookings]);
  useEffect(() => save(LS.session, sessionId), [sessionId]);
  useEffect(() => save(LS.favs, favorites), [favorites]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === sessionId) ?? null,
    [users, sessionId]
  );

  const toast = useCallback((kind: ToastMsg["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, kind, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  /* ------------------------------ auth (mirrors API contract in blueprint/) ------------------------------ */
  const signup = useCallback(
    (name: string, email: string, pw: string): string | null => {
      const cleanEmail = email.trim().toLowerCase();
      if (users.some((u) => u.email === cleanEmail))
        return "An account with that email already exists — try signing in.";
      const user: User = {
        id: `u-${Date.now().toString(36)}`,
        name: name.trim(),
        email: cleanEmail,
        passHash: hash(pw),
        provider: "email",
        hue: Math.floor(Math.random() * 360),
        joined: daysFromNow(0),
      };
      setUsers((u) => [...u, user]);
      setSessionId(user.id);
      toast("success", `Welcome to Haven, ${user.name.split(" ")[0]}!`);
      return null;
    },
    [users, toast]
  );

  const login = useCallback(
    (email: string, pw: string): string | null => {
      const user = users.find((u) => u.email === email.trim().toLowerCase());
      if (!user) return "No account found for that email.";
      if (user.provider === "google") return "That account uses Google sign-in — use the button below.";
      if (user.passHash !== hash(pw)) return "Incorrect password — try again.";
      setSessionId(user.id);
      toast("success", `Welcome back, ${user.name.split(" ")[0]}.`);
      return null;
    },
    [users, toast]
  );

  const loginGoogle = useCallback(() => {
    const email = "liya.mengistu@gmail.com";
    let user = users.find((u) => u.email === email);
    if (!user) {
      user = {
        id: "u-google-sasha",
        name: "Liya Mengistu",
        email,
        passHash: hash(`google:${Date.now()}`),
        provider: "google",
        hue: 200,
        joined: daysFromNow(0),
      };
      setUsers((u) => [...u, user!]);
    }
    setSessionId(user.id);
    toast("success", `Signed in with Google as ${user.name}.`);
  }, [users, toast]);

  const logout = useCallback(() => {
    setSessionId(null);
    toast("info", "Signed out. The highlands will be here when you get back.");
  }, [toast]);

  /* ------------------------------ favorites ------------------------------ */
  const isFav = useCallback((id: string) => favorites.includes(id), [favorites]);
  const toggleFav = useCallback(
    (id: string) => {
      setFavorites((f) => {
        const on = f.includes(id);
        if (!on) toast("success", "Saved to your wishlist.");
        return on ? f.filter((x) => x !== id) : [...f, id];
      });
    },
    [toast]
  );

  /* ------------------------------ listings ------------------------------ */
  const addListing = useCallback(
    (input: NewListingInput): Listing => {
      const noun = input.title.replace(/^The\s+/, "");
      const listing: Listing = {
        id: `l-${Date.now().toString(36)}`,
        hostId: currentUser?.id ?? "u-maya",
        title: input.title,
        type: input.type,
        town: input.town,
        region: "Ethiopia",
        price: input.price,
        cleaningFee: input.cleaningFee,
        guests: input.guests,
        beds: input.beds,
        baths: input.baths,
        sqft: input.sqft,
        description: input.description,
        amenities: input.amenities,
        photo: input.photo,
        gallery: galleryFor(input.photo, noun),
        mapX: input.mapX,
        mapY: input.mapY,
        rating: 0,
        reviewCount: 0,
        tags: input.tags,
        status: "active",
        views: 0,
        createdAt: iso(new Date()),
      };
      setListings((l) => [listing, ...l]);
      toast("success", `"${listing.title}" is live on Haven.`);
      return listing;
    },
    [currentUser, toast]
  );

  const updateListing = useCallback(
    (id: string, patch: Partial<Listing>) => {
      setListings((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    },
    []
  );

  const recordView = useCallback((id: string) => {
    setListings((ls) => ls.map((l) => (l.id === id ? { ...l, views: l.views + 1 } : l)));
  }, []);

  /* ------------------------------ bookings ------------------------------ */
  const createBooking = useCallback(
    (input: { listingId: string; range: DateRange; guests: number }) => {
      const listing = listings.find((l) => l.id === input.listingId);
      if (!listing) return { ok: false as const, error: "That stay no longer exists." };
      if (!currentUser) return { ok: false as const, error: "Sign in to reserve." };
      const { checkIn, checkOut } = input.range;
      if (!checkIn || !checkOut) return { ok: false as const, error: "Pick your check-in and check-out dates." };
      const nights = differenceInDays(parseISO(checkOut), parseISO(checkIn));
      if (nights < 1) return { ok: false as const, error: "Check-out must be after check-in." };
      if (input.guests > listing.guests)
        return { ok: false as const, error: `This stay hosts up to ${listing.guests} guests.` };

      const requested = { start: parseISO(checkIn), end: addDays(parseISO(checkOut), -1) };
      const clash = bookings.some(
        (b) =>
          b.listingId === listing.id &&
          b.status === "confirmed" &&
          areIntervalsOverlapping(requested, {
            start: parseISO(b.checkIn),
            end: addDays(parseISO(b.checkOut), -1),
          })
      );
      if (clash)
        return { ok: false as const, error: "Those dates overlap an existing booking — try different nights." };

      const nightly = nights * listing.price;
      const service = Math.round(nightly * 0.12);
      const booking: Booking = {
        id: `b-${Date.now().toString(36)}`,
        listingId: listing.id,
        travelerId: currentUser.id,
        travelerName: currentUser.name,
        checkIn,
        checkOut,
        guests: input.guests,
        nights,
        total: nightly + listing.cleaningFee + service,
        breakdown: { nightly, cleaning: listing.cleaningFee, service },
        status: "confirmed",
        createdAt: daysFromNow(0),
      };
      setBookings((b) => [booking, ...b]);
      return { ok: true as const, booking };
    },
    [listings, bookings, currentUser]
  );

  const cancelBooking = useCallback(
    (id: string) => {
      setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b)));
      toast("info", "Booking cancelled — those dates are open again.");
    },
    [toast]
  );

  const value: Store = {
    currentUser,
    users,
    listings,
    bookings,
    favorites,
    toasts,
    signup,
    login,
    loginGoogle,
    logout,
    isFav,
    toggleFav,
    addListing,
    updateListing,
    createBooking,
    cancelBooking,
    recordView,
    toast,
    dismissToast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
