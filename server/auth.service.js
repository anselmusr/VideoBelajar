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

// Cukup untuk menolak alamat yang pasti gagal dikirimi email (tanpa @ atau
// tanpa domain); validasi sesungguhnya tetap tautan verifikasi itu sendiri.
export const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim())

// Langkah 2 misi: register — hash password dengan bcrypt sebelum INSERT,
// generate token verifikasi (uuid) lalu kirim via email.
// username opsional (form web tidak memilikinya) — diturunkan dari local-part
// email; phone opsional untuk paritas form register web.
export async function register({ fullname, username, password, email, phone } = {}) {
  if (![fullname, password, email].every((v) => typeof v === 'string' && v.trim())) {
    return {
      status: 400,
      body: { message: 'fullname, password, dan email wajib diisi (berupa teks).' },
    }
  }
  // Tolak alamat tak valid SEBELUM INSERT: pengiriman emailnya pasti gagal dan
  // ditelan catch di bawah, menyisakan akun yang selamanya tak bisa diverifikasi.
  if (!isEmailValid(email)) {
    return { status: 400, body: { message: 'Format email tidak valid.' } }
  }
  const derived = !(typeof username === 'string' && username.trim())
  // varchar(50); sisakan 5 karakter untuk suffix `_xxxx` pada retry di bawah
  const uname = derived ? email.split('@')[0].slice(0, 45) : username.trim()
  const passwordHash = await bcrypt.hash(password, 10)
  const token = uuidv4()
  const insert = (name) =>
    pool.query(
      'INSERT INTO users (full_name, username, email, phone, password_hash, verification_token) VALUES (?, ?, ?, ?, ?, ?)',
      [fullname, name, email, String(phone ?? ''), passwordHash, token],
    )
  let result
  try {
    ;[result] = await insert(uname)
  } catch (error) {
    if (error.code !== 'ER_DUP_ENTRY') throw error
    // Email sudah terdaftar tapi belum terverifikasi (email tak sampai / masuk
    // spam): kirim ulang tautan lama tanpa mengubah akun sedikit pun. Tanpa ini
    // akunnya buntu permanen — login 403, daftar ulang 409, tanpa jalan keluar.
    // Akun yang sudah terverifikasi tetap dibalas 409.
    if (error.sqlMessage?.includes('uq_users_email')) {
      const [[pending]] = await pool.query(
        'SELECT id, full_name AS fullname, verification_token AS token FROM users WHERE email = ? AND email_verified_at IS NULL',
        [email],
      )
      if (!pending?.token) throw error
      try {
        await sendVerificationEmail({ to: email, fullname: pending.fullname, token: pending.token })
      } catch (mailError) {
        // ini satu-satunya jalan keluar user; gagalkan dengan jujur, jangan 500 mentah
        console.warn('[mailer] gagal mengirim ulang email verifikasi:', mailError.message)
        return {
          status: 502,
          body: { message: 'Gagal mengirim email verifikasi. Coba lagi beberapa saat lagi.' },
        }
      }
      return {
        status: 200,
        body: { message: 'Tautan verifikasi dikirim ulang. Cek email kamu.', id: pending.id },
      }
    }
    // Username turunan bisa bentrok (ana@a.com vs ana@b.com) — coba sekali lagi
    // dengan suffix acak. Username kiriman user yang bentrok tetap 409.
    if (!derived || !error.sqlMessage?.includes('uq_users_username')) throw error
    ;[result] = await insert(`${uname}_${Math.random().toString(36).slice(2, 6)}`)
  }
  try {
    // Preview URL Ethereal sengaja tidak dikembalikan lewat HTTP: siapa pun bisa
    // membukanya dan memverifikasi email milik orang lain. Lihat log server.
    await sendVerificationEmail({ to: email, fullname, token })
  } catch (error) {
    // registrasi tetap sah walau pengiriman email gagal (mis. tanpa internet);
    // user bisa memicu kirim ulang dengan mendaftar lagi memakai email yang sama
    console.warn('[mailer] gagal mengirim email verifikasi:', error.message)
  }
  return {
    status: 201,
    body: {
      message: 'Registrasi berhasil. Cek email untuk verifikasi akun.',
      id: result.insertId,
    },
  }
}

// Langkah 3 misi: login — cari user by email, cocokkan password dengan
// bcrypt.compare, lalu terbitkan JWT. Pesan error sengaja sama untuk
// email tak terdaftar maupun password salah.
export async function login({ email, password } = {}) {
  const [rows] = await pool.query(
    'SELECT id, full_name AS fullname, username, email, password_hash, email_verified_at FROM users WHERE email = ?',
    [email ?? ''],
  )
  const user = rows[0]
  if (!user || !(await bcrypt.compare(String(password ?? ''), user.password_hash))) {
    return { status: 401, body: { message: 'Email atau password yang dimasukkan salah.' } }
  }
  if (!user.email_verified_at) {
    return {
      status: 403,
      body: { message: 'Email belum diverifikasi. Cek inbox kamu untuk tautan verifikasi.' },
    }
  }
  const token = jwt.sign(
    { id: user.id, fullname: user.fullname, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '1d' },
  )
  return {
    status: 200,
    body: {
      message: 'Login berhasil.',
      token,
      user: { id: user.id, fullname: user.fullname, username: user.username, email: user.email },
    },
  }
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
