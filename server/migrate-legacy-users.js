// Migrasi sekali jalan: akun lama dibuat lewat alur mockapi (POST /users) yang
// menyimpan password apa adanya di kolom password_hash, sementara login baru
// memakai bcrypt.compare + wajib email terverifikasi. Tanpa migrasi ini akun
// lama selalu ditolak 401 meski passwordnya benar.
//
// Jalankan sekali: node --env-file-if-exists=server/.env server/migrate-legacy-users.js
// Aman diulang: baris yang sudah berformat bcrypt ($2...) dilewati.
import bcrypt from 'bcrypt'
import { pool } from './db.js'

const [rows] = await pool.query(
  "SELECT id, email, password_hash FROM users WHERE password_hash NOT LIKE '$2%'",
)

if (rows.length === 0) {
  console.log('Tidak ada akun lama berpassword plaintext — tidak ada yang diubah.')
} else {
  for (const user of rows) {
    // Akun lama sudah dipakai sebelum fitur verifikasi ada, jadi sekalian
    // ditandai terverifikasi supaya pemiliknya tidak terkunci di luar.
    await pool.query(
      'UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = ?',
      [await bcrypt.hash(user.password_hash, 10), user.id],
    )
    console.log(`  #${user.id} ${user.email} — password di-hash bcrypt + ditandai terverifikasi`)
  }
  console.log(`Selesai: ${rows.length} akun lama dimigrasi.`)
}

await pool.end()
