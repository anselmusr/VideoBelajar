import mysql from 'mysql2/promise'

// Langkah 1 misi: konfigurasi koneksi sesuai host, username, password,
// port, dan database name (diisi lewat server/.env).
export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'videobelajar',
  decimalNumbers: true, // rating_avg DECIMAL dikembalikan sebagai number, bukan string
})
