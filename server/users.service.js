import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { pool } from './db.js'
import { isEmailValid } from './auth.service.js'
import { sendVerificationEmail } from './mailer.js'

// password_hash tidak pernah dikirim keluar: sejak login diverifikasi di server
// (bcrypt + JWT), tidak ada klien yang perlu membacanya.
const USER_SELECT = `
  SELECT id, full_name AS fullName, email, phone,
         role, avatar_url AS avatarUrl
    FROM users`

// SELECT semua data
export async function getAll() {
  const [rows] = await pool.query(`${USER_SELECT} ORDER BY id`)
  return rows
}

// SELECT by id
export async function getById(id) {
  const [rows] = await pool.query(`${USER_SELECT} WHERE id = ?`, [id])
  return rows[0] ?? null
}

// INSERT — password di-hash dan user tetap harus verifikasi email seperti alur
// /register, supaya endpoint ini tidak jadi jalan pintas melewati verifikasi.
export async function create(data) {
  const password = String(data.password ?? '')
  if (!password.trim()) {
    throw Object.assign(new Error('Kata sandi wajib diisi.'), { status: 400 })
  }
  // sama seperti /register: alamat tak valid pasti gagal dikirimi email dan
  // menyisakan akun yang tak bisa diverifikasi
  if (!isEmailValid(data.email)) {
    throw Object.assign(new Error('Format email tidak valid.'), { status: 400 })
  }
  const token = uuidv4()
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, phone, password_hash, role, avatar_url, verification_token) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      data.fullName,
      data.email,
      String(data.phone ?? ''), // kolom NOT NULL; undefined jadi NULL tanpa ini
      await bcrypt.hash(password, 10),
      data.role ?? 'student',
      data.avatarUrl ?? null,
      token,
    ],
  )
  try {
    await sendVerificationEmail({ to: data.email, fullname: data.fullName, token })
  } catch (error) {
    console.warn('[mailer] gagal mengirim email verifikasi:', error.message)
  }
  return getById(result.insertId)
}

// UPDATE by id — password_hash hanya disentuh kalau ada password baru dikirim.
export async function update(id, data) {
  const existing = await getById(id)
  if (!existing) return null
  const merged = { ...existing, ...data }
  const newPassword = typeof data.password === 'string' && data.password.trim() ? data.password : null
  await pool.query(
    `UPDATE users SET full_name = ?, email = ?, phone = ?, role = ?, avatar_url = ?
       ${newPassword ? ', password_hash = ?' : ''}
     WHERE id = ?`,
    [
      merged.fullName,
      merged.email,
      String(merged.phone ?? ''),
      merged.role,
      merged.avatarUrl,
      ...(newPassword ? [await bcrypt.hash(newPassword, 10)] : []),
      id,
    ],
  )
  return getById(id)
}

// DELETE by id
export async function remove(id) {
  const existing = await getById(id)
  if (!existing) return null
  await pool.query('DELETE FROM users WHERE id = ?', [id])
  return existing
}
