import mysql from 'mysql2/promise'

// MySQL cloud (Aiven dsb) menolak koneksi tanpa TLS dan memakai CA sendiri:
// isi DB_SSL_CA dengan isi file ca.pem dari dashboard. Untuk penyedia yang
// memakai CA publik cukup DB_SSL=true. MySQL lokal tidak perlu keduanya.
const ca = process.env.DB_SSL_CA?.replace(/\\n/g, '\n')
const ssl = ca ? { ca } : process.env.DB_SSL === 'true' ? {} : undefined

// Langkah 1 misi: konfigurasi koneksi sesuai host, username, password,
// port, dan database name (diisi lewat server/.env).
export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'videobelajar',
  decimalNumbers: true, // rating_avg DECIMAL dikembalikan sebagai number, bukan string
  ...(ssl && { ssl }),
})
