# Video Belajar

Frontend project untuk landing page dan halaman autentikasi Video Belajar, dibangun dengan React + Vite.

VideoBelajar adalah platform pembelajaran video berbasis web yang memberi pengguna akses ke beragam kursus dan tutorial berbasis video. Pengguna dapat belajar dengan kecepatan dan jadwal sendiri melalui materi yang terstruktur dan mudah diakses.

## Tech Stack

- React 19
- Vite
- React Router DOM
- React Icons
- ESLint
- Axios
- mockapi.io (fake REST API)
- Express + MySQL (`server/` — REST API misi Backend Intermediate)

## Setup API (mockapi.io)

Data kelas dan pengguna disimpan di [mockapi.io](https://mockapi.io/).

1. Buat project di mockapi.io dengan 2 resource: `courses` dan `users` (kosongkan data bawaannya — aplikasi akan mengisi katalog kelas otomatis saat pertama dijalankan).
2. Salin `.env.example` menjadi `.env.local`, lalu isi `VITE_API_BASE_URL` dengan base URL project kamu, contoh:

	```
	VITE_API_BASE_URL=https://xxxxxxxxxxxx.mockapi.io/api/v1
	```

3. Jalankan `npm install` lalu `npm run dev`.

Catatan: untuk deploy (Vercel), set env var `VITE_API_BASE_URL` di dashboard project.

> **Update:** sejak misi Backend Advance 1, form Register/Login web memakai
> endpoint `/register` + `/login` (bcrypt + JWT + verifikasi email) dari backend
> Express di `server/` — mockapi.io hanya cocok untuk katalog kelas. Arahkan
> `VITE_API_BASE_URL` ke backend Express agar seluruh fitur jalan.

## Backend Lokal (Express + MySQL)

Alternatif mockapi.io: REST API sendiri di `server/` yang terhubung ke MySQL
(skema dari `docs/database/schema.mysql.sql`, terjemahan MySQL dari desain ERD
misi sebelumnya).

1. Siapkan MySQL 8.x, lalu buat database + tabel:

	```bash
	mysql -u root -p < docs/database/schema.mysql.sql
	```

2. Salin `server/.env.example` menjadi `server/.env`, sesuaikan host, username,
	password, port, dan database name.
3. Jalankan API: `npm run server` (default `http://localhost:3001`).
4. Arahkan frontend ke API lokal di `.env.local`:

	```
	VITE_API_BASE_URL=http://localhost:3001
	```

Endpoint (tersedia sebagai `/course` maupun `/courses`, plus `/user`/`/users`):

| Endpoint | Method | Keterangan |
| --- | --- | --- |
| `/course` | GET | List semua courses/kelas |
| `/course/:id` | GET | Menampilkan satu course berdasarkan id |
| `/course` | POST | Menambahkan course |
| `/course/:id` | PUT/PATCH | Mengubah course berdasarkan id |
| `/course/:id` | DELETE | Menghapus course berdasarkan id |

Cek cepat seluruh operasi CRUD (server harus jalan): `node server/smoke.js`.

## Backend Advance 1 (Auth JWT, Email, Upload, Query Params)

Lanjutan backend di `server/` — autentikasi bcrypt + JWT, verifikasi email,
query params, dan upload gambar:

| Endpoint | Method | Keterangan |
| --- | --- | --- |
| `/register` | POST | Daftar user baru `{fullname, password, email}` (+`username`/`phone` opsional; username default dari local-part email); password di-hash bcrypt, token verifikasi dikirim via email. Mendaftar ulang dengan email yang **belum terverifikasi** membalas 200 dan mengirim ulang tautannya (email yang sudah terverifikasi tetap 409) |
| `/login` | POST | Login `{email, password}` → `{token, user}` JWT — 401 bila salah, 403 bila email belum diverifikasi |
| `/verify-email?token=` | GET | Verifikasi token dari email (sekali pakai) |
| `/course?category=&search=&sortBy=` | GET | List kelas + filter/search/sort — **butuh header `Authorization: Bearer <token>`** |
| `/upload` | POST | Upload gambar (multipart field `file`, maks 2MB) ke folder `uploads/` — butuh Bearer token |

Catatan:

- `sortBy`: `newest`, `oldest`, `title`, `price`, `price:desc`, `rating`, `reviews`.
- Endpoint `/course` (singular) dilindungi middleware JWT (`server/auth.middleware.js`);
	alias `/courses` (plural) tetap publik supaya frontend versi mockapi tidak berubah.
- Migrasi kolom user: `docs/database/migration-backend-advance-1-users-auth.sql`
	(username unik, `verification_token`, `email_verified_at`).
- **Punya database lama?** Akun yang dibuat sebelum misi ini menyimpan password
	apa adanya, sehingga selalu ditolak `bcrypt.compare` (401 walau password benar).
	Jalankan sekali: `node --env-file-if-exists=server/.env server/migrate-legacy-users.js`
	— password lama di-hash bcrypt dan akunnya ditandai terverifikasi. Aman diulang.
- Env tambahan di `server/.env`: `JWT_SECRET` (wajib), `APP_URL` (origin
	frontend — tautan email mengarah ke halaman `/verify-email` React), dan
	`SMTP_*` — tanpa SMTP, email verifikasi memakai akun uji
	[Ethereal](https://ethereal.email) dan preview URL-nya dicetak di **log server**
	(sengaja tidak dikembalikan lewat HTTP: siapa pun yang memegang URL itu bisa
	membaca emailnya dan memverifikasi alamat milik orang lain). Di produksi
	(`NODE_ENV=production`) server menolak start bila `SMTP_HOST` kosong, supaya
	deploy yang lupa mengisi SMTP gagal terang-terangan alih-alih diam-diam
	mengirim email semua user ke kotak sekali pakai.
- Uji end-to-end seluruh fitur: `node --env-file-if-exists=server/.env server/smoke-auth.js`.

### Alur akun di web

Form **Register** dan **Login** web memakai endpoint backend ini (bukan lagi
`/users` gaya mockapi): daftar → server kirim email verifikasi → login ditolak
403 sampai tautan di email dibuka (halaman `/verify-email`) → login berhasil dan
data user disimpan sebagai sesi di localStorage. Konsekuensinya frontend butuh
backend ini berjalan (`VITE_API_BASE_URL` menunjuk ke sana).

Catatan desain:

- JWT dari `/login` **tidak** ikut disimpan. Belum ada request frontend yang
	mengirim header `Authorization`, jadi menyimpannya hanya menaruh kredensial
	berumur 1 hari di localStorage tanpa manfaat. Saat nanti ada permintaan yang
	butuh token, simpan di memori (bukan localStorage).
- Panel admin (`/admin` → Data Pengguna) menulis ke tabel `users` yang sama.
	Password yang diisi di situ ikut di-hash bcrypt dan user barunya tetap
	menerima email verifikasi — jadi `POST /users` tidak bisa dipakai sebagai
	jalan pintas melewati verifikasi. Saat mengedit user, kolom kata sandi boleh
	dikosongkan untuk mempertahankan password lama (hash-nya tidak pernah
	dikirim ke browser).

## Deploy (frontend Vercel + backend Render + MySQL cloud)

Frontend statis di Vercel tidak bisa menjalankan Express/MySQL, jadi backend
`server/` di-deploy terpisah. Urutannya penting: **backend dulu**, baru arahkan
frontend ke sana — kalau `main` di-push sebelum backend hidup, login di situs
live ikut mati.

1. **Database** (mis. [Aiven](https://aiven.io) free plan, MySQL). Buat service,
	catat host/port/user/password, dan unduh `ca.pem`. Tunggu sampai statusnya
	*Running* — sebelum itu hostname-nya belum ada di DNS. Lalu jalankan
	**`docs/database/schema.mysql.sql` saja**:

	```bash
	mysql -h HOST -P PORT -u avnadmin -p --ssl-mode=VERIFY_CA --ssl-ca=ca.pem defaultdb < docs/database/schema.mysql.sql
	```

	File `migration-backend-advance-1-users-auth.sql` **tidak** dipakai di
	database baru (akan gagal "Duplicate column name") — itu khusus untuk
	menaikkan database lama dari misi Backend Intermediate yang belum punya
	kolom `username`/`verification_token`/`email_verified_at`.

	Tabel `courses` sengaja dibiarkan kosong: frontend mengisinya sendiri saat
	pertama kali dibuka.
2. **Email** (mis. [Brevo](https://brevo.com) 300 email/hari). Verifikasi satu
	alamat pengirim, lalu buat **API key** di *SMTP & API → tab API Keys* —
	nilainya jadi `BREVO_API_KEY`.

	> Pakai API HTTPS, bukan SMTP. Free tier Render **memblokir port SMTP**
	> (25/465/587) sejak September 2025, jadi `nodemailer` tidak akan pernah
	> tersambung di sana — gejalanya register tetap 201 tapi email tak pernah
	> sampai. `SMTP_*` tetap didukung untuk dev atau hosting lain.
3. **Backend** di [Render](https://render.com). Cara termudah: **New → Blueprint**
	lalu pilih repo ini — Render membaca `render.yaml` di root dan mengisi
	sendiri region, build/start command, health check, serta nama semua env
	var; kamu tinggal menempel nilai rahasianya. Kalau mau manual (New → Web
	Service): build command `npm install`, start command `npm run server`.
	Environment variables:

	| Variable | Isi |
	| --- | --- |
	| `NODE_ENV` | `production` |
	| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | dari dashboard database |
	| `DB_SSL_CA` | isi lengkap `ca.pem` (boleh multiline) |
	| `JWT_SECRET` | hex acak, mis. hasil `openssl rand -hex 32` |
	| `APP_URL` | origin **frontend**, mis. `https://videobelajar.anselmusr.com` |
	| `BREVO_API_KEY` | API key Brevo (tab *API Keys*, bukan SMTP key) |
	| `MAIL_FROM` | alamat pengirim yang sudah diverifikasi |

	Jangan set `PORT` — Render mengisinya sendiri. Server sengaja menolak start
	bila `NODE_ENV=production` tapi `BREVO_API_KEY` dan `SMTP_HOST` sama-sama
	kosong, supaya tidak ada akun yang mendaftar lalu terkunci karena email
	verifikasinya tak pernah terkirim.
4. **Cek backend sebelum menyentuh frontend** (tanpa perlu akses database):

	```bash
	node server/smoke-deploy.js https://videobelajar-api.onrender.com email-aslimu@gmail.com
	```

	Skrip ini memastikan service hidup, database tersambung, middleware JWT
	aktif, dan login benar-benar terkunci sampai email diverifikasi — lalu
	mengirim tautan verifikasi sungguhan ke alamat yang kamu isi supaya bisa
	dibuktikan bahwa SMTP produksi memang mengirim.
5. **Frontend**: set `VITE_API_BASE_URL` di dashboard Vercel ke URL Render
	(mis. `https://videobelajar-api.onrender.com`), lalu push `main`.

Catatan free tier: service Render tidur setelah ~15 menit menganggur sehingga
request pertama bisa lambat, dan folder `uploads/` bersifat sementara (isinya
hilang tiap restart/deploy) — cukup untuk demo, bukan penyimpanan permanen.

## Fitur yang Sudah Tersedia

- Landing page responsif dengan section Hero, Features (kategori course), dan Newsletter CTA.
- Routing aplikasi:
	- `/` untuk Home
	- `/login` untuk Login
	- `/register` untuk Register
	- `*` diarahkan kembali ke `/`
- Navigasi hash ke kategori (`/#kategori`) dari Navbar dan Hero CTA.
- Scroll otomatis ke atas saat pindah route agar halaman Login/Register tidak terbuka di posisi bawah.
- Form Login:
	- Toggle show/hide password
	- Placeholder aksi submit, lupa password, dan login Google
- Form Register:
	- Toggle show/hide password dan konfirmasi password
	- Validasi required saat submit
	- Validasi kecocokan konfirmasi password
	- Country code picker (REST Countries API + fallback lokal)
	- Placeholder aksi daftar dengan Google
- Footer social menggunakan React Icons.
- Newsletter CTA dengan placeholder submit action.
- Design tokens warna terpusat di `src/styles/globals.css`.

## Menjalankan Project

1. Install dependencies:

```bash
npm install
```

2. Jalankan development server:

```bash
npm run dev
```

3. Jalankan pengecekan lint:

```bash
npm run lint
```

4. Build production:

```bash
npm run build
```

5. Preview hasil build:

```bash
npm run preview
```

## Struktur Folder Ringkas

- `src/App.jsx` - Shell layout utama (Navbar, Routes, Footer)
- `src/pages/Home/Home.jsx` - Halaman Home
- `src/pages/Login/Login.jsx` - Halaman Login
- `src/pages/Register/Register.jsx` - Halaman Register
- `src/components/` - Komponen UI utama (Navbar, Hero, Features, CallToAction, Footer)
- `src/styles/globals.css` - Global styles dan color variables
- `src/utils/courseCatalog.js` - Data kategori dan katalog course
- `public/assets/favicon-videobelajar.ico` - Favicon aplikasi

## Catatan

- Beberapa aksi masih bersifat placeholder (menggunakan alert) karena belum terhubung ke backend autentikasi/newsletter.
- Jika favicon belum berubah di browser, lakukan hard refresh atau buka lewat incognito untuk menghindari cache.
