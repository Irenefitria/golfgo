-- Migration: tambah kolom member_code (ID member) & jejak member_code di booking_players
-- Jalankan di database yang sudah ada sebelumnya, karena init.sql hanya jalan
-- otomatis saat volume Postgres pertama kali dibuat.

ALTER TABLE members ADD COLUMN IF NOT EXISTS member_code VARCHAR(20);

-- backfill member_code untuk baris lama yang belum punya
UPDATE members SET member_code = 'MBR-' || lpad((floor(random() * 90000) + 10000)::text, 5, '0')
WHERE member_code IS NULL;

ALTER TABLE members ALTER COLUMN member_code SET NOT NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'members_member_code_key'
  ) THEN
    ALTER TABLE members ADD CONSTRAINT members_member_code_key UNIQUE (member_code);
  END IF;
END $$;

ALTER TABLE booking_players ADD COLUMN IF NOT EXISTS member_code VARCHAR(20);
