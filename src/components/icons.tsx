import type { ReactNode } from "react";

const S = ({
  className,
  children,
  filled,
  strokeWidth = 1.7,
}: {
  className?: string;
  children: ReactNode;
  filled?: boolean;
  strokeWidth?: number;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? "h-5 w-5"}
    aria-hidden="true"
  >
    {children}
  </svg>
);

type P = { className?: string };

export const ILogo = ({ className }: P) => (
  <svg viewBox="0 0 32 32" className={className ?? "h-8 w-8"} aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#234E3D" />
    <path d="M7 17.5 16 9l9 8.5" stroke="#F2C879" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M10.5 16v7h11v-7" stroke="#F6F4ED" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const ISearch = ({ className }: P) => (
  <S className={className}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.4-3.4" /></S>
);
export const IPin = ({ className }: P) => (
  <S className={className}><path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 1 1 13 0c0 4.6-6.5 10-6.5 10Z" /><circle cx="12" cy="10.6" r="2.3" /></S>
);
export const ICalendar = ({ className }: P) => (
  <S className={className}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></S>
);
export const IStar = ({ className }: P) => (
  <S className={className} filled strokeWidth={0}><path d="m12 2.6 2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 16.9 6.3 20l1.2-6.3L2.8 9.3l6.4-.8L12 2.6Z" /></S>
);
export const IHeart = ({ className, filled }: P & { filled?: boolean }) => (
  <S className={className} filled={filled}><path d="M12 20.4S4 15.4 4 9.9A4.4 4.4 0 0 1 8.4 5.5c1.7 0 3 .9 3.6 2 .6-1.1 1.9-2 3.6-2A4.4 4.4 0 0 1 20 9.9c0 5.5-8 10.5-8 10.5Z" /></S>
);
export const IUsers = ({ className }: P) => (
  <S className={className}><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" /><path d="M15.5 5.7a3.2 3.2 0 0 1 0 5.6M17.5 14.9c1.7.7 2.7 2.3 3 4.6" /></S>
);
export const IBed = ({ className }: P) => (
  <S className={className}><path d="M3 18v-8m0 4h18v4m0-4v-2a3 3 0 0 0-3-3h-8v5" /><circle cx="6.5" cy="8.5" r="1.8" /></S>
);
export const IBath = ({ className }: P) => (
  <S className={className}><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z" /><path d="M6 12V5.6A2.1 2.1 0 0 1 8.1 3.5c1 0 1.8.6 2 1.5M7 20.5 6 22m11-1.5L18 22" /></S>
);
export const IRuler = ({ className }: P) => (
  <S className={className}><rect x="3" y="9" width="18" height="6" rx="1.5" /><path d="m7 9 0 2.5M11 9v3.5M15 9v2.5M19 9v3.5" /></S>
);
export const IWifi = ({ className }: P) => (
  <S className={className}><path d="M4 9.5a12 12 0 0 1 16 0M6.8 12.8a8 8 0 0 1 10.4 0M9.6 16a4 4 0 0 1 4.8 0" /><circle cx="12" cy="19" r="0.6" fill="currentColor" /></S>
);
export const IPot = ({ className }: P) => (
  <S className={className}><path d="M5 10h14v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-5Z" /><path d="M3 10h18M9 10V7.5M13 10V6.5M17 10V8" /></S>
);
export const IParking = ({ className }: P) => (
  <S className={className}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M10 16.5v-9h3a2.7 2.7 0 0 1 0 5.4h-3" /></S>
);
export const ISteam = ({ className }: P) => (
  <S className={className}><path d="M4.5 13.5h15V15a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5v-1.5Z" /><path d="M8 10c-.8-1 .8-2 0-3M12 10c-.8-1 .8-2 0-3M16 10c-.8-1 .8-2 0-3" /></S>
);
export const IFire = ({ className }: P) => (
  <S className={className}><path d="M12 21c3.9 0 6.5-2.4 6.5-6 0-2.6-1.6-4.4-3-6-1.1-1.3-2.1-2.6-2.3-4.5-2.6 1.5-3.6 3.7-3.3 6.2-.9-.3-1.6-1-1.9-2.2-1.4 1.4-2.5 3.6-2.5 6 0 3.6 2.6 6.5 6.5 6.5Z" /><path d="M12 21c1.8 0 3-1.3 3-3s-1.2-2.6-3-4c-1.8 1.4-3 2.3-3 4s1.2 3 3 3Z" /></S>
);
export const ISnow = ({ className }: P) => (
  <S className={className}><path d="M12 3v18M5 6.5l14 11M19 6.5l-14 11M12 3l-2 2m2-2 2 2M12 21l-2-2m2 2 2-2" /></S>
);
export const IWasher = ({ className }: P) => (
  <S className={className}><rect x="4" y="3.5" width="16" height="17" rx="2.5" /><circle cx="12" cy="13" r="4.2" /><path d="M9 13c1-1 2-1 3 0s2 1 3 0M7 6.5h.01M10 6.5h4" /></S>
);
export const IBolt = ({ className }: P) => (
  <S className={className}><path d="M13 2.5 5 13.5h5.5L11 21.5l8-11h-5.5L13 2.5Z" /></S>
);
export const IWave = ({ className }: P) => (
  <S className={className}><path d="M3 8.5c2.2 0 2.8 1.6 4.5 1.6S9.8 8.5 12 8.5s2.8 1.6 4.5 1.6S18.8 8.5 21 8.5M3 14c2.2 0 2.8 1.6 4.5 1.6S9.8 14 12 14s2.8 1.6 4.5 1.6S18.8 14 21 14" /></S>
);
export const IThermo = ({ className }: P) => (
  <S className={className}><path d="M10 4a2 2 0 1 1 4 0v9.3a4.2 4.2 0 1 1-4 0V4Z" /><circle cx="12" cy="17" r="1.4" fill="currentColor" /></S>
);
export const IDesk = ({ className }: P) => (
  <S className={className}><rect x="3.5" y="4.5" width="17" height="11" rx="1.8" /><path d="M8 20h8M12 15.5V20" /></S>
);
export const IPaw = ({ className }: P) => (
  <S className={className}><circle cx="7" cy="8.5" r="1.6" /><circle cx="12" cy="6.5" r="1.6" /><circle cx="17" cy="8.5" r="1.6" /><path d="M12 11.5c2.6 0 4.8 2 4.8 4.2 0 1.6-1.2 2.6-2.6 2.6-.9 0-1.6-.5-2.2-.5s-1.3.5-2.2.5c-1.4 0-2.6-1-2.6-2.6 0-2.2 2.2-4.2 4.8-4.2Z" /></S>
);
export const ICoffee = ({ className }: P) => (
  <S className={className}><path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" /><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 6V4.5M12 6V4.5" /></S>
);
export const IMoon = ({ className }: P) => (
  <S className={className}><path d="M20 13.6A7.6 7.6 0 0 1 10.4 4 7.8 7.8 0 1 0 20 13.6Z" /><path d="m17 4 .5 1.4L19 6l-1.5.6L17 8l-.5-1.4L15 6l1.5-.6L17 4Z" /></S>
);
export const ICompass = ({ className }: P) => (
  <S className={className}><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></S>
);
export const IPine = ({ className }: P) => (
  <S className={className}><path d="m12 2.8 4 5.4h-2.4l3.9 5.2h-2.6l4.1 5.4H5l4.1-5.4H6.5l3.9-5.2H8l4-5.4Z" /><path d="M12 18.8v2.7" /></S>
);
export const IAnchor = ({ className }: P) => (
  <S className={className}><circle cx="12" cy="5.5" r="2.5" /><path d="M12 8v12M5 13c0 4 3.1 7 7 7s7-3 7-7M3.5 13H7m10.5 0H20" /></S>
);
export const ILeaf = ({ className }: P) => (
  <S className={className}><path d="M5 19C5 10 11 5 20 4.5c.5 9-4.5 15-13.5 15" /><path d="M5 19c2.5-5 5.5-8.5 10-11" /></S>
);
export const ISun = ({ className }: P) => (
  <S className={className}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /></S>
);
export const IPen = ({ className }: P) => (
  <S className={className}><path d="m14.5 5 4.5 4.5L8.5 20H4v-4.5L14.5 5Z" /><path d="m12.5 7 4.5 4.5" /></S>
);
export const IGrid = ({ className }: P) => (
  <S className={className}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></S>
);
export const IMap = ({ className }: P) => (
  <S className={className}><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" /><path d="M9 4v14M15 6v14" /></S>
);
export const IPlus = ({ className }: P) => <S className={className}><path d="M12 5v14M5 12h14" /></S>;
export const IMinus = ({ className }: P) => <S className={className}><path d="M5 12h14" /></S>;
export const IX = ({ className }: P) => <S className={className}><path d="m6 6 12 12M18 6 6 18" /></S>;
export const ICheck = ({ className }: P) => <S className={className}><path d="m5 12.5 4.5 4.5L19 7.5" /></S>;
export const IChevL = ({ className }: P) => <S className={className}><path d="m14.5 6-6 6 6 6" /></S>;
export const IChevR = ({ className }: P) => <S className={className}><path d="m9.5 6 6 6-6 6" /></S>;
export const IChevD = ({ className }: P) => <S className={className}><path d="m6 9.5 6 6 6-6" /></S>;
export const IArrowR = ({ className }: P) => <S className={className}><path d="M4 12h16m-6-6 6 6-6 6" /></S>;
export const IEye = ({ className }: P) => (
  <S className={className}><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" /><circle cx="12" cy="12" r="2.6" /></S>
);
export const IPencil = ({ className }: P) => (
  <S className={className}><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="m14.5 7.5 3 3" /></S>
);
export const IPause = ({ className }: P) => <S className={className}><path d="M9 5v14M15 5v14" strokeWidth={2.4} /></S>;
export const IPlay = ({ className }: P) => <S className={className} filled strokeWidth={0}><path d="M8 5.5v13l10-6.5L8 5.5Z" /></S>;
export const ILogOut = ({ className }: P) => (
  <S className={className}><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 8l4 4-4 4M20 12H10" /></S>
);
export const IMail = ({ className }: P) => (
  <S className={className}><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4.5 7.5 7.5 6 7.5-6" /></S>
);
export const ILock = ({ className }: P) => (
  <S className={className}><rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></S>
);
export const IZoomIn = ({ className }: P) => (
  <S className={className}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.4-3.4M8.5 11h5M11 8.5v5" /></S>
);
export const IZoomOut = ({ className }: P) => (
  <S className={className}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.4-3.4M8.5 11h5" /></S>
);
export const ITrash = ({ className }: P) => (
  <S className={className}><path d="M5 7h14M9.5 7V5h5v2M7 7l1 12.5h8L17 7M10.2 10.5v6M13.8 10.5v6" /></S>
);
export const IInfo = ({ className }: P) => (
  <S className={className}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 7.8h.01" strokeWidth={2.2} /></S>
);
export const IGauge = ({ className }: P) => (
  <S className={className}><path d="M5 18.5a8.5 8.5 0 1 1 14 0" /><path d="m12 14 3.5-4.5" /><circle cx="12" cy="14" r="1.3" fill="currentColor" /></S>
);
export const IBanknote = ({ className }: P) => (
  <S className={className}><rect x="3" y="6.5" width="18" height="11" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6.5 10h.01M17.5 14h.01" strokeWidth={2.2} /></S>
);

export const IGoogle = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className ?? "h-5 w-5"} aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.17 3.57-8.81Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3c-1.07.72-2.45 1.14-4.06 1.14-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12 12 0 0 0 0 10.76l4-3.1Z" />
    <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
  </svg>
);

export const AMENITY_ICONS: Record<string, (p: P) => ReactNode> = {
  Wifi: IWifi,
  Kitchen: IPot,
  "Free parking": IParking,
  "Hot tub": ISteam,
  Fireplace: IFire,
  AC: ISnow,
  Washer: IWasher,
  "EV charger": IBolt,
  "Water access": IWave,
  Sauna: IThermo,
  Workspace: IDesk,
  "Pets allowed": IPaw,
  "Breakfast basket": ICoffee,
  "Stargazing deck": IMoon,
};

export const CATEGORY_ICONS: Record<string, (p: P) => ReactNode> = {
  "All stays": ICompass,
  Cabins: IPine,
  Waterfront: IAnchor,
  Treehouses: ILeaf,
  "Snow country": ISnow,
  "Farms & flats": ISun,
  Design: IPen,
};
