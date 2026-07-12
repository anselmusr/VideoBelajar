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

## Setup API (mockapi.io)

Data kelas dan pengguna disimpan di [mockapi.io](https://mockapi.io/).

1. Buat project di mockapi.io dengan 2 resource: `courses` dan `users` (kosongkan data bawaannya — aplikasi akan mengisi katalog kelas otomatis saat pertama dijalankan).
2. Salin `.env.example` menjadi `.env.local`, lalu isi `VITE_API_BASE_URL` dengan base URL project kamu, contoh:

	```
	VITE_API_BASE_URL=https://xxxxxxxxxxxx.mockapi.io/api/v1
	```

3. Jalankan `npm install` lalu `npm run dev`.

Catatan: untuk deploy (Vercel), set env var `VITE_API_BASE_URL` di dashboard project. Password user tersimpan apa adanya di mockapi (kebutuhan tugas) — jangan gunakan password sungguhan.

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
