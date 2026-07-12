-- Migration: tambah tabel admins & members
-- Jalankan ini di database yang sudah ada sebelumnya (volume lama),
-- karena init.sql hanya otomatis jalan saat volume Postgres pertama kali dibuat.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(60) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS members (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(150),
  phone          VARCHAR(30),
  membership_id  VARCHAR(20) REFERENCES membership_types(id),
  joined_at      DATE NOT NULL DEFAULT CURRENT_DATE,
  active         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
