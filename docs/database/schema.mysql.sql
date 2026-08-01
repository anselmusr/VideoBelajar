-- ============================================================
-- VideoBelajar - Database Schema (MySQL 8.x)
-- Terjemahan dari schema.sql (PostgreSQL) untuk misi BE 2:
-- koneksi Node.js + Express + MySQL.
-- Perbedaan dialek: IDENTITY -> AUTO_INCREMENT,
-- TIMESTAMPTZ -> TIMESTAMP, NUMERIC -> DECIMAL,
-- updated_at memakai ON UPDATE CURRENT_TIMESTAMP (fitur native MySQL).
-- ============================================================

CREATE DATABASE IF NOT EXISTS videobelajar;
USE videobelajar;

-- ---------- Master / referensi ----------

CREATE TABLE categories (
  id    SMALLINT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(50) NOT NULL,
  slug  VARCHAR(50) NOT NULL
);

-- Unique single index: lookup kategori dari URL/filter (?category=slug)
-- sekaligus menjamin slug tidak ganda.
CREATE UNIQUE INDEX uq_categories_slug ON categories (slug);

CREATE TABLE tutors (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name   VARCHAR(100) NOT NULL,
  job_title   VARCHAR(100) NOT NULL,
  company     VARCHAR(100),
  avatar_url  TEXT,
  bio         TEXT
);

-- Single index: pencarian tutor berdasarkan nama di halaman admin.
CREATE INDEX idx_tutors_full_name ON tutors (full_name);

CREATE TABLE users (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name      VARCHAR(100) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  phone          VARCHAR(20)  NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  role           VARCHAR(10)  NOT NULL DEFAULT 'student'
                 CHECK (role IN ('student', 'admin')),
  avatar_url     TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP
);

-- Unique single index: login & cek duplikat saat register (WHERE email = ?).
CREATE UNIQUE INDEX uq_users_email ON users (email);

-- ---------- Katalog kelas ----------

CREATE TABLE courses (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  category_id    SMALLINT NOT NULL,
  tutor_id       BIGINT   NOT NULL,
  title          VARCHAR(150) NOT NULL,
  description    TEXT NOT NULL,
  price          INT NOT NULL CHECK (price >= 0),
  thumbnail_url  TEXT,
  rating_avg     DECIMAL(2,1) NOT NULL DEFAULT 0,  -- cache agregat dari reviews
  review_count   INT          NOT NULL DEFAULT 0,  -- cache agregat dari reviews
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories (id),
  FOREIGN KEY (tutor_id)    REFERENCES tutors (id)
);

-- Composite index: tab filter kategori di Home + urut kelas terbaru.
-- Leftmost prefix (category_id) tetap terpakai saat filter tanpa sorting.
CREATE INDEX idx_courses_category_created ON courses (category_id, created_at DESC);

-- Single index: join/lookup daftar kelas per tutor.
CREATE INDEX idx_courses_tutor ON courses (tutor_id);

CREATE TABLE course_modules (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  course_id  BIGINT NOT NULL,
  title      VARCHAR(150) NOT NULL,
  position   SMALLINT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);

-- Unique composite index: ambil semua modul satu kelas sudah terurut,
-- sekaligus mencegah dua modul menempati posisi yang sama.
CREATE UNIQUE INDEX uq_course_modules_course_position
  ON course_modules (course_id, position);

CREATE TABLE materials (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  module_id         BIGINT NOT NULL,
  material_type     VARCHAR(10) NOT NULL
                    CHECK (material_type IN ('rangkuman', 'video', 'quiz')),
  title             VARCHAR(150) NOT NULL,
  content_url       TEXT,       -- URL video / dokumen
  body              TEXT,       -- isi rangkuman / soal quiz
  duration_seconds  INT,        -- durasi video
  position          SMALLINT NOT NULL,
  FOREIGN KEY (module_id) REFERENCES course_modules (id) ON DELETE CASCADE
);

-- Unique composite index: ambil materi satu modul terurut + cegah posisi ganda.
CREATE UNIQUE INDEX uq_materials_module_position
  ON materials (module_id, position);

CREATE TABLE pretests (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  course_id         BIGINT NOT NULL,
  title             VARCHAR(150) NOT NULL,
  question_count    SMALLINT NOT NULL,
  duration_minutes  SMALLINT NOT NULL,
  passing_score     SMALLINT CHECK (passing_score BETWEEN 0 AND 100),
  FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);

-- Unique single index: menjamin relasi 1:1 (satu kelas maksimal satu
-- pretest) sekaligus mempercepat join dari halaman kelas.
CREATE UNIQUE INDEX uq_pretests_course ON pretests (course_id);

-- ---------- Transaksi ----------

CREATE TABLE orders (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_number  VARCHAR(30) NOT NULL,           -- cth: HEL/VI/10062023
  user_id         BIGINT NOT NULL,
  course_id       BIGINT NOT NULL,
  price           INT NOT NULL CHECK (price >= 0),          -- snapshot harga kelas
  admin_fee       INT NOT NULL DEFAULT 0 CHECK (admin_fee >= 0),
  total_amount    INT NOT NULL CHECK (total_amount >= 0),
  status          VARCHAR(10) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'paid', 'failed', 'canceled')),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at      TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (user_id)   REFERENCES users (id),
  FOREIGN KEY (course_id) REFERENCES courses (id)
);

-- Unique single index: lookup invoice dari halaman detail pesanan.
CREATE UNIQUE INDEX uq_orders_invoice ON orders (invoice_number);

-- Composite index: halaman "Pesanan Saya" yang difilter tab status
-- (Semua/Menunggu/Berhasil/Gagal). Leftmost prefix (user_id) melayani
-- tab "Semua Pesanan".
CREATE INDEX idx_orders_user_status ON orders (user_id, status);

-- Single index: laporan penjualan per kelas + mempercepat join ke courses.
CREATE INDEX idx_orders_course ON orders (course_id);

CREATE TABLE payments (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id        BIGINT NOT NULL,
  payment_method  VARCHAR(20) NOT NULL,  -- bca_va, bni_va, mandiri_va, gopay, credit_card, ...
  amount          INT NOT NULL CHECK (amount >= 0),
  status          VARCHAR(10) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'success', 'failed')),
  paid_at         TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (order_id) REFERENCES orders (id)
);

-- Unique single index: menjamin relasi 1:1 (satu order satu pembayaran)
-- sekaligus mempercepat join order <-> payment.
CREATE UNIQUE INDEX uq_payments_order ON payments (order_id);

-- ---------- Kelas Saya & Review ----------

CREATE TABLE enrollments (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT NOT NULL,
  course_id         BIGINT NOT NULL,
  order_id          BIGINT,  -- NULL utk kelas gratis
  progress_percent  SMALLINT NOT NULL DEFAULT 0
                    CHECK (progress_percent BETWEEN 0 AND 100),
  pretest_score     SMALLINT CHECK (pretest_score BETWEEN 0 AND 100),
  completed_at      TIMESTAMP NULL DEFAULT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users (id),
  FOREIGN KEY (course_id) REFERENCES courses (id),
  FOREIGN KEY (order_id)  REFERENCES orders (id)
);

-- Unique composite index: satu user hanya sekali enroll per kelas;
-- leftmost prefix (user_id) melayani listing halaman "Kelas Saya".
CREATE UNIQUE INDEX uq_enrollments_user_course ON enrollments (user_id, course_id);

-- Single index: hitung jumlah peserta per kelas.
CREATE INDEX idx_enrollments_course ON enrollments (course_id);

-- Unique single index (NULL boleh banyak di MySQL):
-- satu order menghasilkan maksimal satu enrollment.
CREATE UNIQUE INDEX uq_enrollments_order ON enrollments (order_id);

CREATE TABLE reviews (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  course_id   BIGINT NOT NULL,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users (id),
  FOREIGN KEY (course_id) REFERENCES courses (id)
);

-- Unique composite index: satu user satu review per kelas.
CREATE UNIQUE INDEX uq_reviews_user_course ON reviews (user_id, course_id);

-- Composite index: daftar review di halaman detail kelas, urut terbaru;
-- juga dipakai agregasi rating per kelas (leftmost course_id).
CREATE INDEX idx_reviews_course_created ON reviews (course_id, created_at DESC);
