-- ============================================================
--  HAVEN — PostgreSQL schema (MVP)
--  Apply with:  psql $DATABASE_URL -f blueprint/schema.sql
--  Or feed it to Prisma:  npx prisma db push  (mirror as models)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";      -- case-insensitive email
CREATE EXTENSION IF NOT EXISTS "btree_gist";  -- required for the double-booking EXCLUDE constraint
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- crypt()/gen_salt() for the seed passwords

-- ---------- ENUMS ----------
CREATE TYPE user_role      AS ENUM ('traveler', 'host', 'admin');
CREATE TYPE auth_provider  AS ENUM ('email', 'google');
CREATE TYPE listing_status AS ENUM ('active', 'paused', 'archived');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- ---------- USERS ----------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT,                        -- NULL for OAuth-only accounts
  full_name     TEXT NOT NULL,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'traveler',
  provider      auth_provider NOT NULL DEFAULT 'email',
  google_id     TEXT UNIQUE,                 -- populated by Passport google strategy
  superhost     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OAuth account linking (Google today, more later) without touching users
CREATE TABLE oauth_accounts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider     TEXT NOT NULL,                -- 'google'
  provider_uid TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_uid)
);

CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,           -- hash it! never store raw
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- PROPERTIES ----------
CREATE TABLE properties (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 4 AND 120),
  property_type TEXT NOT NULL,               -- cabin, treehouse, houseboat...
  description   TEXT NOT NULL,
  town          TEXT NOT NULL,
  region        TEXT NOT NULL DEFAULT 'Ethiopia',
  address_line  TEXT,                        -- exact address, shown post-booking
  lat           DOUBLE PRECISION NOT NULL,   -- real maps: swap the SVG chart for these
  lng           DOUBLE PRECISION NOT NULL,
  price_cents   INTEGER NOT NULL CHECK (price_cents >= 2000),   -- store MONEY as cents
  cleaning_fee_cents INTEGER NOT NULL DEFAULT 0,
  max_guests    SMALLINT NOT NULL CHECK (max_guests > 0),
  beds          SMALLINT NOT NULL DEFAULT 1,
  baths         SMALLINT NOT NULL DEFAULT 1,
  sqft          INTEGER,
  amenities     TEXT[] NOT NULL DEFAULT '{}',-- Postgres arrays beat a join table at MVP
  status        listing_status NOT NULL DEFAULT 'active',
  view_count    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_host    ON properties(host_id);
CREATE INDEX idx_properties_status  ON properties(status);
CREATE INDEX idx_properties_geo     ON properties USING gist (ll_to_earth(lat, lng)); -- optional, needs earthdistance

-- Photos: ordered, S3/R2 keys (never store blobs in Postgres)
CREATE TABLE property_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  caption     TEXT,
  position    SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_photos_property ON property_photos(property_id, position);

-- ---------- BOOKINGS ----------
CREATE TABLE bookings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id         UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  traveler_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_in            DATE NOT NULL,
  check_out           DATE NOT NULL CHECK (check_out > check_in),
  guests              SMALLINT NOT NULL CHECK (guests > 0),
  nights              SMALLINT GENERATED ALWAYS AS (check_out - check_in) STORED,
  nightly_price_cents INTEGER NOT NULL,      -- snapshot at booking time!
  cleaning_fee_cents  INTEGER NOT NULL,
  service_fee_cents   INTEGER NOT NULL,
  total_cents         INTEGER GENERATED ALWAYS AS
                        (nightly_price_cents * (check_out - check_in)
                         + cleaning_fee_cents + service_fee_cents) STORED,
  status              booking_status NOT NULL DEFAULT 'confirmed',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- THE money shot: Postgres itself rejects double bookings
  EXCLUDE USING gist (
    property_id WITH =,
    daterange(check_in, check_out) WITH &&
  ) WHERE (status = 'confirmed')
);

CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_traveler ON bookings(traveler_id);
CREATE INDEX idx_bookings_status   ON bookings(status);

-- ---------- REVIEWS ----------
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id)                        -- one review per completed stay
);

-- ---------- materialized rating (cheap to read on every card) ----------
CREATE TABLE property_ratings (
  property_id  UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
  avg_rating   NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION refresh_property_rating() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO property_ratings (property_id, avg_rating, review_count)
  SELECT NEW.property_id, COALESCE(AVG(rating),0), COUNT(*)
  FROM reviews WHERE property_id = NEW.property_id
  ON CONFLICT (property_id) DO UPDATE
    SET avg_rating = EXCLUDED.avg_rating, review_count = EXCLUDED.review_count;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rating AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION refresh_property_rating();

-- ---------- seed (matches the prototype's demo accounts) ----------
INSERT INTO users (email, password_hash, full_name, role, superhost)
VALUES
  ('host@haven.demo',     crypt('buna-gebeta-8', gen_salt('bf')), 'Meron Tadesse', 'host', TRUE),
  ('traveler@haven.demo', crypt('teff-injera-4', gen_salt('bf')), 'Yonas Bekele',  'traveler', FALSE)
ON CONFLICT (email) DO NOTHING;
-- (needs pgcrypto extension for crypt/gen_salt in real deployments)
