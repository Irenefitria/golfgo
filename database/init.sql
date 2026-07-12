-- =========================================================
-- GolfGo Database Schema
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- Master data ----------

CREATE TABLE courses (
  id            VARCHAR(20) PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  location      VARCHAR(150) NOT NULL,
  rating        NUMERIC(2,1) NOT NULL DEFAULT 0,
  reviews       INTEGER NOT NULL DEFAULT 0,
  tone          VARCHAR(20) DEFAULT '#2D5F45',
  rate_weekday  BIGINT NOT NULL,
  rate_weekend  BIGINT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE player_categories (
  id          VARCHAR(20) PRIMARY KEY,
  label       VARCHAR(60) NOT NULL,
  short_label VARCHAR(30) NOT NULL,
  multiplier  NUMERIC(4,2) NOT NULL
);

CREATE TABLE membership_types (
  id       VARCHAR(20) PRIMARY KEY,
  label    VARCHAR(60) NOT NULL,
  discount NUMERIC(4,2) NOT NULL DEFAULT 0
);

CREATE TABLE caddies (
  id              VARCHAR(20) PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  experience_yrs  INTEGER NOT NULL DEFAULT 0,
  rating          NUMERIC(2,1) NOT NULL DEFAULT 0,
  fee             BIGINT NOT NULL,
  active          BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE tee_slots (
  id        SERIAL PRIMARY KEY,
  course_id VARCHAR(20) REFERENCES courses(id) ON DELETE CASCADE,
  time_slot VARCHAR(5) NOT NULL, -- '06:00'
  UNIQUE(course_id, time_slot)
);

CREATE TABLE menu_categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE menu_items (
  id          VARCHAR(20) PRIMARY KEY,
  category_id INTEGER REFERENCES menu_categories(id) ON DELETE CASCADE,
  name        VARCHAR(120) NOT NULL,
  price       BIGINT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true
);

-- ---------- Transactional data ----------

CREATE TABLE bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code     VARCHAR(20) UNIQUE NOT NULL,
  course_id        VARCHAR(20) REFERENCES courses(id),
  booking_date     DATE NOT NULL,
  time_slot        VARCHAR(5) NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending|paid|cancelled|rescheduled|completed
  payment_method   VARCHAR(20),
  slot_total       BIGINT NOT NULL DEFAULT 0,
  caddy_total      BIGINT NOT NULL DEFAULT 0,
  food_total       BIGINT NOT NULL DEFAULT 0,
  grand_total      BIGINT NOT NULL DEFAULT 0,
  contact_name     VARCHAR(120),
  contact_phone    VARCHAR(30),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE booking_players (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID REFERENCES bookings(id) ON DELETE CASCADE,
  player_index   INTEGER NOT NULL,
  name           VARCHAR(120),
  category_id    VARCHAR(20) REFERENCES player_categories(id),
  membership_id  VARCHAR(20) REFERENCES membership_types(id),
  caddy_id       VARCHAR(20) REFERENCES caddies(id),
  player_rate    BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE booking_food_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID REFERENCES bookings(id) ON DELETE CASCADE,
  menu_item_id   VARCHAR(20) REFERENCES menu_items(id),
  quantity       INTEGER NOT NULL DEFAULT 1,
  price_each     BIGINT NOT NULL
);

CREATE TABLE booking_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID REFERENCES bookings(id) ON DELETE CASCADE,
  event_type  VARCHAR(30) NOT NULL, -- created|paid|cancelled|rescheduled
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_course_date ON bookings(course_id, booking_date);
CREATE INDEX idx_bookings_code ON bookings(booking_code);
CREATE INDEX idx_booking_players_booking ON booking_players(booking_id);

-- =========================================================
-- Seed data (sesuai mock data di prototype)
-- =========================================================

INSERT INTO courses (id, name, location, rating, reviews, tone, rate_weekday, rate_weekend) VALUES
('c1', 'Sentul Highlands Golf Club', 'Sentul City, Bogor', 4.7, 386, '#2D5F45', 700000, 1800000),
('c2', 'Rainbow Hills Golf Club', 'Sentul, Bogor', 4.6, 251, '#9C3509', 850000, 2000000),
('c3', 'Royale Jakarta Golf Club', 'Halim Perdanakusuma, Jakarta Timur', 4.8, 512, '#8A6D3B', 1500000, 2800000);

INSERT INTO player_categories (id, label, short_label, multiplier) VALUES
('pria', 'Umum', 'Umum', 1.0),
('wanita', 'Ladies', 'Ladies', 0.85),
('junior', 'Junior (< 18 th)', 'Junior', 0.5),
('senior', 'Senior (60+ th)', 'Senior', 0.75);

INSERT INTO membership_types (id, label, discount) VALUES
('umum', 'Non-member', 0),
('member', 'Member Klub', 0.3),
('golfgo', 'GolfGo Member', 0.1);

INSERT INTO caddies (id, name, experience_yrs, rating, fee) VALUES
('cd1', 'Bambang S.', 8, 4.9, 150000),
('cd2', 'Rini A.', 5, 4.8, 150000),
('cd3', 'Yusuf H.', 12, 5.0, 175000),
('cd4', 'Dewi P.', 3, 4.6, 125000);

INSERT INTO tee_slots (course_id, time_slot)
SELECT c.id, s.slot
FROM courses c
CROSS JOIN (VALUES ('06:00'),('06:30'),('07:00'),('07:30'),('09:00'),('10:30'),('13:00'),('14:30')) AS s(slot);

INSERT INTO menu_categories (name) VALUES ('Minuman'), ('Makanan Berat'), ('Snack');

INSERT INTO menu_items (id, category_id, name, price) VALUES
('m1', (SELECT id FROM menu_categories WHERE name='Minuman'), 'Es Kelapa Muda', 35000),
('m2', (SELECT id FROM menu_categories WHERE name='Minuman'), 'Kopi Susu Gula Aren', 32000),
('m3', (SELECT id FROM menu_categories WHERE name='Minuman'), 'Jus Alpukat', 38000),
('m4', (SELECT id FROM menu_categories WHERE name='Makanan Berat'), 'Nasi Goreng Fairway', 65000),
('m5', (SELECT id FROM menu_categories WHERE name='Makanan Berat'), 'Sate Ayam Madura (10 tusuk)', 58000),
('m6', (SELECT id FROM menu_categories WHERE name='Makanan Berat'), 'Soto Betawi', 62000),
('m7', (SELECT id FROM menu_categories WHERE name='Snack'), 'Pisang Goreng Keju', 28000),
('m8', (SELECT id FROM menu_categories WHERE name='Snack'), 'Kentang Goreng', 30000);
