import type { PaymentMethod } from "./ethiopia";

export interface User {
  id: string;
  name: string;
  email: string;
  passHash: string; // demo-only hash — production uses bcrypt (see blueprint/schema.sql)
  provider: "email" | "google";
  hue: number; // avatar tint
  superhost?: boolean;
  joined: string;
}

export interface GalleryShot {
  caption: string;
  scale: number; // crop factor for pseudo-multi-photo galleries
  pos: string; // css object-position
}

export interface Listing {
  id: string;
  hostId: string;
  title: string;
  type: string;
  town: string;
  region: string;
  price: number; // per night, whole Ethiopian Birr
  cleaningFee: number;
  guests: number;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  amenities: string[];
  photo: string;
  gallery: GalleryShot[];
  mapX: number; // 0–1000 on the Ethiopia chart
  mapY: number; // 0–700
  rating: number;
  reviewCount: number;
  tags: string[];
  status: "active" | "paused";
  views: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  listingId: string;
  travelerId: string;
  travelerName: string;
  checkIn: string; // ISO yyyy-MM-dd
  checkOut: string;
  guests: number;
  nights: number;
  total: number;
  breakdown: { nightly: number; cleaning: number; service: number };
  status: "confirmed" | "cancelled";
  payment?: PaymentMethod;
  createdAt: string;
}

export interface Review {
  id: string;
  listingId: string;
  author: string;
  date: string;
  rating: number;
  text: string;
}

export interface ToastMsg {
  id: number;
  kind: "success" | "error" | "info";
  text: string;
}

export interface DateRange {
  checkIn: string | null;
  checkOut: string | null;
}
