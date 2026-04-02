# Video Belajar

Frontend project untuk landing page dan halaman autentikasi Video Belajar, dibangun dengan React + Vite.

VideoBelajar adalah platform pembelajaran video berbasis web yang memberi pengguna akses ke beragam kursus dan tutorial berbasis video. Pengguna dapat belajar dengan kecepatan dan jadwal sendiri melalui materi yang terstruktur dan mudah diakses.

## Tech Stack

- React 19
- Vite
- React Router DOM
- React Icons
- ESLint

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
