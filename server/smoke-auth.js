// Cek end-to-end fitur misi Backend Advance 1: register (bcrypt) -> login (JWT) ->
// middleware -> query params -> verify-email -> upload (multer).
// Jalankan: node --env-file-if-exists=server/.env server/smoke-auth.js
// (server harus sudah jalan: npm run server)
import { pool } from './db.js'

const BASE = process.env.API_URL ?? 'http://localhost:3001'
const assert = (cond, msg) => {
  if (!cond) throw new Error(`GAGAL: ${msg}`)
}

async function req(method, path, { body, token, form } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}

const unik = Date.now()
const akun = {
  fullname: 'Smoke Auth Tester',
  username: `smoke${unik}`,
  password: 'rahasia123',
  email: `smoke${unik}@test.local`,
}

// --- Langkah 2: register (bcrypt) ---
const reg = await req('POST', '/register', { body: akun })
assert(reg.status === 201, `POST /register -> 201 (dapat ${reg.status})`)
const [[row]] = await pool.query(
  'SELECT password_hash, verification_token FROM users WHERE email = ?', [akun.email])
assert(row.password_hash.startsWith('$2'), 'password tersimpan sebagai hash bcrypt, bukan plaintext')
assert(row.verification_token?.length === 36, 'token verifikasi (uuid) tersimpan di database')
assert((await req('POST', '/register', { body: { fullname: 'X' } })).status === 400, 'register tanpa field wajib -> 400')
assert((await req('POST', '/register', { body: akun })).status === 409, 'register email duplikat -> 409')
assert((await req('POST', '/register', { body: { ...akun, email: `x${unik}@t.local`, username: `x${unik}`, password: 12345678 } })).status === 400, 'register password non-string -> 400 (bukan 500)')

// --- Langkah 3: login (jsonwebtoken) ---
assert((await req('POST', '/login', { body: { email: akun.email, password: 'salah' } })).status === 401, 'password salah -> 401')
assert((await req('POST', '/login', { body: { email: 'tidakada@test.local', password: 'x' } })).status === 401, 'email tak terdaftar -> 401')
const login = await req('POST', '/login', { body: { email: akun.email, password: akun.password } })
assert(login.status === 200 && login.data.token, 'login benar -> 200 + token JWT')
const token = login.data.token

// --- Langkah 4: middleware verifyToken di /course ---
assert((await req('GET', '/course')).status === 401, 'GET /course tanpa token -> 401')
assert((await req('GET', '/course', { token: 'token-palsu' })).status === 401, 'token palsu -> 401')
const list = await req('GET', '/course', { token })
assert(list.status === 200 && Array.isArray(list.data), 'GET /course dengan token -> 200 + list')

// --- Langkah 5: query params filter, sort, search ---
const filter = (await req('GET', '/course?category=business', { token })).data
assert(filter.length > 0 && filter.every((c) => c.category === 'business'), 'filter ?category=business')
const search = (await req('GET', '/course?search=fullstack', { token })).data
assert(search.length > 0 && search.every((c) => /fullstack/i.test(c.title + c.description)), 'search ?search=fullstack')
const sorted = (await req('GET', '/course?sortBy=price:desc', { token })).data
assert(sorted.every((c, i) => i === 0 || sorted[i - 1].price >= c.price), 'sort ?sortBy=price:desc menurun')
// sortBy tak dikenal / key prototype tidak boleh 500 (fallback ke default)
assert((await req('GET', '/course?sortBy=constructor', { token })).status === 200, '?sortBy=constructor -> 200 (fallback, bukan 500)')
assert((await req('GET', '/course?category=a&category=b', { token })).status === 200, 'query param berulang -> 200 (bukan 500)')

// --- Langkah 6: verifikasi email ---
assert((await req('GET', '/verify-email?token=bukan-token')).status === 400, 'token verifikasi palsu -> 400 Invalid')
const verify = await req('GET', `/verify-email?token=${row.verification_token}`)
assert(verify.status === 200 && verify.data.message === 'Email Verified Successfully', 'verify-email sukses')
assert((await req('GET', `/verify-email?token=${row.verification_token}`)).status === 400, 'token sekali pakai: verifikasi ulang -> 400')
const [[after]] = await pool.query('SELECT email_verified_at FROM users WHERE email = ?', [akun.email])
assert(after.email_verified_at !== null, 'email_verified_at terisi setelah verifikasi')

// --- Langkah 7: upload image (multer) ---
const pngBytes = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
const makeForm = (type, name) => {
  const form = new FormData()
  form.append('file', new Blob([pngBytes], { type }), name)
  return form
}
assert((await req('POST', '/upload', { form: makeForm('image/png', 'tes.png') })).status === 401, 'upload tanpa token -> 401')
const up = await req('POST', '/upload', { token, form: makeForm('image/png', 'tes.png') })
assert(up.status === 201 && up.data.url?.startsWith('/uploads/'), 'upload gambar -> 201 + url')
assert((await fetch(`${BASE}${up.data.url}`)).status === 200, 'file terunggah bisa diakses via /uploads')
assert((await req('POST', '/upload', { token, form: makeForm('text/plain', 'tes.txt') })).status === 400, 'file non-gambar ditolak -> 400')
// mimetype gambar palsu + ekstensi .html harus ditolak (whitelist ekstensi)
assert((await req('POST', '/upload', { token, form: makeForm('image/png', 'evil.html') })).status === 400, 'mimetype gambar palsu + ekstensi .html ditolak -> 400')
assert((await req('POST', '/upload', { token, form: makeForm('image/svg+xml', 'evil.svg') })).status === 400, 'SVG ditolak -> 400')

// bersih-bersih data uji
await pool.query('DELETE FROM users WHERE email = ?', [akun.email])
await pool.end()
console.log('SMOKE AUTH OK — register, login, middleware, query params, verify-email, upload semua berhasil')
