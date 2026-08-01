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

Catatan: untuk deploy (Vercel), set env var `VITE_API_BASE_URL` di dashboard project. Password user tersimpan apa adanya di mockapi (kebutuhan tugas) — jangan gunakan password sungguhan.

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
| `/register` | POST | Daftar user baru `{fullname, username, password, email}`; password di-hash bcrypt, token verifikasi dikirim via email |
| `/login` | POST | Login `{email, password}` → `{token}` JWT (401 bila salah) |
| `/verify-email?token=` | GET | Verifikasi token dari email (sekali pakai) |
| `/course?category=&search=&sortBy=` | GET | List kelas + filter/search/sort — **butuh header `Authorization: Bearer <token>`** |
| `/upload` | POST | Upload gambar (multipart field `file`, maks 2MB) ke folder `uploads/` — butuh Bearer token |

Catatan:

- `sortBy`: `newest`, `oldest`, `title`, `price`, `price:desc`, `rating`, `reviews`.
- Endpoint `/course` (singular) dilindungi middleware JWT (`server/auth.middleware.js`);
	alias `/courses` (plural) tetap publik supaya frontend versi mockapi tidak berubah.
- Migrasi kolom user: `docs/database/migration-backend-advance-1-users-auth.sql`
	(username unik, `verification_token`, `email_verified_at`).
- Env tambahan di `server/.env`: `JWT_SECRET` (wajib), `APP_URL`, dan `SMTP_*`
	opsional — tanpa SMTP, email verifikasi memakai akun uji [Ethereal](https://ethereal.email)
	dan preview URL-nya muncul di log server + respons register.
- Uji end-to-end seluruh fitur: `node --env-file-if-exists=server/.env server/smoke-auth.js`.

> **Dua alur akun berbeda (sengaja).** Endpoint misi `/register` + `/login`
> menyimpan password sebagai **hash bcrypt** dan memverifikasi di server (JWT).
> Sementara frontend versi mockapi memakai `/users` + perbandingan password di
> sisi client (plaintext) sebagai paritas mockapi. Keduanya berbagi tabel `users`
> tapi **tidak saling interoperable**: akun yang dibuat lewat `/register` tidak
> bisa login di UI web, dan sebaliknya. Ini konsekuensi menjaga frontend lama
> tetap jalan tanpa perubahan; untuk menyatukannya, frontend perlu dipindah ke
> alur `/login` (JWT).

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
