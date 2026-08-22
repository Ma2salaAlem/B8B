# Haven — Architecture Blueprint

This folder is the lift-and-drop backend plan for the prototype you just clicked through.
The prototype's `src/lib/store.tsx` deliberately mirrors these contracts, so swapping
localStorage for HTTP calls is a file-by-file job, not a rewrite.

---

## 1. Monorepo — yes, and here's why

**Recommendation: one repo, pnpm workspaces + Turborepo.**

A marketplace's hardest bugs are *contract drift*: the frontend thinks `Booking.total`
is a float, the backend thinks it's cents; the frontend expects `checkIn`, the API sends
`check_in`. One repo with a shared types package makes that class of bug a compile error.

You don't need Nx-level machinery at MVP — Turborepo gives you cached builds and
`pnpm --filter` task running with one `turbo.json`.

```
haven/
├─ apps/
│  ├─ web/                  # Next.js 14 App Router, TypeScript, Tailwind
│  │  ├─ app/
│  │  │  ├─ (browse)/       # route groups: /, /stay/[id]
│  │  │  ├─ auth/           # login, callback
│  │  │  ├─ dashboard/
│  │  │  │  ├─ host/        # host dashboard (server components + mutations)
│  │  │  │  └─ trips/       # traveler bookings
│  │  │  ├─ api/            # thin: only image-upload presign + webhooks
│  │  │  └─ layout.tsx
│  │  └─ components/        # mirrors src/components in the prototype
│  └─ api/                  # Express + Prisma (see §2)
│     ├─ src/
│     │  ├─ routes/         # auth.ts, properties.ts, bookings.ts, reviews.ts
│     │  ├─ middleware/     # requireAuth, validate (zod), errors
│     │  ├─ services/       # booking-service.ts (conflict logic lives here)
│     │  └─ index.ts
│     └─ prisma/schema.prisma   # generated from blueprint/schema.sql
├─ packages/
│  ├─ shared/               # Booking, Property, User types + zod schemas
│  │  └─ src/index.ts       # imported by BOTH apps — the contract
│  ├─ config-tailwind/      # one tailwind preset, both apps
│  └─ config-eslint/
├─ docker-compose.yml       # postgres:16 + adminer for local dev
├─ turbo.json
└─ pnpm-workspace.yaml
```

**When separate repos make sense instead:** different deploy cadences with different
teams owning each side. For a solo/small-team MVP, that's ceremony you don't need.

---

## 2. Backend: Express + Prisma (not NestJS — yet)

| Concern          | Express + Prisma                        | NestJS                            |
|------------------|------------------------------------------|-----------------------------------|
| Learning curve   | You already know the shape of it         | DI containers, decorators, modules |
| Lines for MVP    | ~600 for full CRUD + auth                | ~2,000+ with the same coverage     |
| Type safety      | Prisma generates it from schema.sql      | Same, via Prisma                   |
| Structure        | You impose it with `routes/services`     | Imposed for you                    |
| Migrate later?   | NestJS can wrap the same services        | —                                  |

The services layer (`booking-service.ts`) is framework-agnostic business logic —
if NestJS becomes attractive at 10+ engineers, the services move unchanged.

### Key API surface (what the prototype calls today)

```
POST   /api/auth/register        → { access, user }            + Set-Cookie: refresh (httpOnly)
POST   /api/auth/login           → same
GET    /api/auth/google          → Passport redirect
GET    /api/auth/google/callback → sets cookies, redirects web
POST   /api/auth/refresh         → rotates refresh token
GET    /api/properties?town=&min=&max=&in=&out=&guests=   → paginated list
POST   /api/properties           → host creates listing (multer → S3 presigned for photos)
PATCH  /api/properties/:id       → price, status
GET    /api/properties/:id       → detail + reviews + blocked dates
POST   /api/bookings             → the double-booking check happens in a transaction:
                                     1. SELECT ... FOR UPDATE on the property row
                                     2. overlap query against bookings
                                     3. INSERT (the EXCLUDE constraint in schema.sql
                                        is the final backstop — Postgres itself refuses)
DELETE /api/bookings/:id         → soft cancel (status), frees the daterange
GET    /api/me/bookings          → trips dashboard
GET    /api/me/listings          → host dashboard + per-listing stats
```

Prices in **integer cents**, dates as **DATE columns** (not timestamps) — bookings are
calendar days, and `daterange(check_in, check_out)` gives you overlap algebra for free.

---

## 3. Auth — built first, deliberately

Everything hangs off `users.id`: bookings, listings, reviews. Sequence:

1. **`schema.sql` first** — users, oauth_accounts, refresh_tokens (in this folder).
2. **Register/login** — bcrypt (cost 12), 15-minute JWT access token in memory,
   refresh token (opaque, hashed) in an `httpOnly; Secure; SameSite=Lax` cookie.
   Rotation on every refresh; reuse detection revokes the family.
3. **Google OAuth** — Passport `google` strategy. On callback: look up
   `oauth_accounts(provider='google', uid)` → attach to session user if signed in,
   else find-or-create the user, then issue the same token pair. One code path,
   two doors in.
4. **`requireAuth` middleware** decodes the JWT, attaches `req.user`, and every
   route below it trusts `req.user.id` — never a client-sent user id.

The prototype implements the *same state machine* client-side (sign up → session →
role-aware dashboards → guarded routes), so the UX flows you tested are exactly the
ones the real tokens will drive. `loginGoogle()` in the prototype stands in for the
Passport callback redirect.

---

## 4. Suggested build order (auth-first, two-week rhythm)

1. **Week 1:** docker-compose Postgres → `prisma db push` of schema.sql →
   auth routes + middleware → `/api/properties` list/detail with a seed script.
   Frontend: point the prototype's `store.tsx` fetchers at these four endpoints.
2. **Week 2:** bookings (transaction + constraint) → trips + host dashboards →
   property creation with presigned photo uploads → reviews + rating trigger.
3. **Hardening:** rate limiting on auth, zod validation on every body, structured
   logging (pino), Playwright tests around the booking-conflict path — that's the
   one flow where a bug costs real money.

---

## 5. What the prototype already proves out

- Browse + filter + sort + availability filtering (date-overlap math in
  `src/pages/Browse.tsx` is the same interval logic the API will run)
- Map ↔ grid bidirectional hover/selection sync
- Booking flow with conflict rejection, price breakdown, cancellation freeing dates
- Host listing CRUD, pausing, inline price edits, click-to-place geolocation
- Auth-guarded routes with `?next=` redirects

Treat `src/lib/store.tsx` as your API client interface: each method there
(`createBooking`, `addListing`, …) becomes one fetch wrapper against the routes above.
