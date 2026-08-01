-- ============================================================
-- misi Backend Advance 1 (Langkah 1 & 6): entitas User untuk autentikasi
-- Menambah attribute username (login/register), token verifikasi
-- email, dan penanda kapan email terverifikasi.
-- Jalankan pada database videobelajar yang sudah ada (schema BE 2).
-- ============================================================
USE videobelajar;

-- Migrasi sekali jalan (DDL MySQL auto-commit; tidak idempotent — jangan
-- dijalankan dua kali pada DB yang sama).
ALTER TABLE users
  ADD COLUMN username VARCHAR(50) NULL AFTER full_name,
  ADD COLUMN verification_token VARCHAR(36) NULL,          -- uuid v4, NULL setelah terverifikasi
  ADD COLUMN email_verified_at TIMESTAMP NULL DEFAULT NULL,
  MODIFY phone VARCHAR(20) NOT NULL DEFAULT '';            -- register Backend Advance 1 tidak memakai phone

-- Backfill DULU (sebelum unique index) supaya index tidak gagal separuh jalan.
-- Username diambil dari bagian lokal email.
UPDATE users SET username = SUBSTRING_INDEX(email, '@', 1) WHERE username IS NULL;

-- Dedup: dua email dengan local-part sama (john@a.com, john@b.com) akan bentrok
-- di unique index — bedakan yang duplikat dengan suffix id sebelum index dibuat.
UPDATE users u
  JOIN (
    SELECT username, MIN(id) AS keep_id
      FROM users GROUP BY username HAVING COUNT(*) > 1
  ) dup ON u.username = dup.username AND u.id <> dup.keep_id
  SET u.username = CONCAT(u.username, '_', u.id);

-- Unique single index: login/cek duplikat username
-- (NULL boleh banyak: user lama dari alur mockapi belum punya username).
CREATE UNIQUE INDEX uq_users_username ON users (username);
