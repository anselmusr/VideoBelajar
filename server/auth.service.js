import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { pool } from './db.js'
import { sendVerificationEmail } from './mailer.js'

// Jangan pakai konstanta tebakan sebagai fallback (bisa dipakai memalsukan
// token). Kalau JWT_SECRET tak diset, pakai secret acak sekali-proses +
// peringatan — token tidak bertahan lintas restart, tapi tak bisa ditebak.
export const JWT_SECRET =
  process.env.JWT_SECRET ||
  (() => {
    console.warn(
      '[auth] JWT_SECRET belum diset di server/.env — memakai secret acak sementara. ' +
        'Token akan invalid setelah server restart.',
    )
    return crypto.randomBytes(32).toString('hex')
  })()

// Langkah 2 misi: register — hash password dengan bcrypt sebelum INSERT,
// generate token verifikasi (uuid) lalu kirim via email.
export async function register({ fullname, username, password, email } = {}) {
  if (![fullname, username, password, email].every((v) => typeof v === 'string' && v.trim())) {
    return {
      status: 400,
      body: { message: 'fullname, username, password, dan email wajib diisi (berupa teks).' },
    }
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const token = uuidv4()
  const [result] = await pool.query(
    'INSERT INTO users (full_name, username, email, password_hash, verification_token) VALUES (?, ?, ?, ?, ?)',
    [fullname, username, email, passwordHash, token],
  )
  let emailPreview = null
  try {
    emailPreview = await sendVerificationEmail({ to: email, fullname, token })
  } catch (error) {
    // registrasi tetap sah walau pengiriman email gagal (mis. tanpa internet)
    console.warn('[mailer] gagal mengirim email verifikasi:', error.message)
  }
  return {
    status: 201,
    body: {
      message: 'Registrasi berhasil. Cek email untuk verifikasi akun.',
      id: result.insertId,
      ...(emailPreview && { emailPreview }),
    },
  }
}

// Langkah 3 misi: login — cari user by email, cocokkan password dengan
// bcrypt.compare, lalu terbitkan JWT. Pesan error sengaja sama untuk
// email tak terdaftar maupun password salah.
export async function login({ email, password } = {}) {
  const [rows] = await pool.query(
    'SELECT id, full_name AS fullname, username, email, password_hash FROM users WHERE email = ?',
    [email ?? ''],
  )
  const user = rows[0]
  if (!user || !(await bcrypt.compare(String(password ?? ''), user.password_hash))) {
    return { status: 401, body: { message: 'Email atau password yang dimasukkan salah.' } }
  }
  const token = jwt.sign(
    { id: user.id, fullname: user.fullname, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '1d' },
  )
  return { status: 200, body: { message: 'Login berhasil.', token } }
}

// Langkah 6 misi: verifikasi email — cari token di database; kalau ketemu,
// tandai terverifikasi dan hapus token (sekali pakai).
export async function verifyEmail(token) {
  if (!token) return { status: 400, body: { message: 'Invalid Verification Token' } }
  const [result] = await pool.query(
    'UPDATE users SET email_verified_at = NOW(), verification_token = NULL WHERE verification_token = ?',
    [token],
  )
  return result.affectedRows
    ? { status: 200, body: { message: 'Email Verified Successfully' } }
    : { status: 400, body: { message: 'Invalid Verification Token' } }
}
