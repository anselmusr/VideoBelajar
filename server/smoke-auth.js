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
assert(!('emailPreview' in reg.data), 'respons register tidak membocorkan URL preview email')
assert((await req('POST', '/register', { body: { fullname: 'X' } })).status === 400, 'register tanpa field wajib -> 400')
assert((await req('POST', '/register', { body: { ...akun, email: 'bukanemail' } })).status === 400, 'register format email tak valid -> 400 (sebelum INSERT)')
// username diturunkan dari local-part email: harus dipotong agar muat varchar(50)
const panjang = 'p'.repeat(60)
const emailPanjang = await req('POST', '/register', { body: { fullname: 'Email Panjang', password: 'rahasia123', email: `${panjang}${unik}@test.local` } })
assert(emailPanjang.status === 201, `email dengan local-part panjang -> 201 (dapat ${emailPanjang.status})`)
// email terdaftar tapi BELUM terverifikasi -> tautan dikirim ulang, bukan buntu 409
const ulang = await req('POST', '/register', { body: akun })
assert(ulang.status === 200, `daftar ulang email belum terverifikasi -> 200 kirim ulang (dapat ${ulang.status})`)
const [[samaToken]] = await pool.query('SELECT verification_token FROM users WHERE email = ?', [akun.email])
assert(samaToken.verification_token === row.verification_token, 'kirim ulang memakai token lama, tidak menerbitkan yang baru')
assert((await req('POST', '/register', { body: { ...akun, email: `x${unik}@t.local`, username: `x${unik}`, password: 12345678 } })).status === 400, 'register password non-string -> 400 (bukan 500)')
// alur web: tanpa username -> diturunkan dari local-part email
const noUname = await req('POST', '/register', { body: { fullname: 'Tanpa Uname', password: 'rahasia123', email: `nouname${unik}@test.local`, phone: '+62811' } })
assert(noUname.status === 201, 'register tanpa username (alur web) -> 201')

// --- Langkah 3: login (jsonwebtoken) ---
assert((await req('POST', '/login', { body: { email: akun.email, password: akun.password } })).status === 403, 'login sebelum verifikasi email -> 403')
assert((await req('POST', '/login', { body: { email: akun.email, password: 'salah' } })).status === 401, 'password salah -> 401')
assert((await req('POST', '/login', { body: { email: 'tidakada@test.local', password: 'x' } })).status === 401, 'email tak terdaftar -> 401')

// --- Langkah 6: verifikasi email (duluan — login butuh akun terverifikasi) ---
assert((await req('GET', '/verify-email?token=bukan-token')).status === 400, 'token verifikasi palsu -> 400 Invalid')
const verify = await req('GET', `/verify-email?token=${row.verification_token}`)
assert(verify.status === 200 && verify.data.message === 'Email Verified Successfully', 'verify-email sukses')
assert((await req('GET', `/verify-email?token=${row.verification_token}`)).status === 400, 'token sekali pakai: verifikasi ulang -> 400')
const [[after]] = await pool.query('SELECT email_verified_at FROM users WHERE email = ?', [akun.email])
assert(after.email_verified_at !== null, 'email_verified_at terisi setelah verifikasi')

// setelah terverifikasi, daftar ulang bukan lagi kirim ulang melainkan 409
assert((await req('POST', '/register', { body: akun })).status === 409, 'register email sudah terverifikasi -> 409')

const login = await req('POST', '/login', { body: { email: akun.email, password: akun.password } })
assert(login.status === 200 && login.data.token, 'login benar (setelah verifikasi) -> 200 + token JWT')
assert(login.data.user?.email === akun.email, 'respons login menyertakan data user')
const token = login.data.token

// --- Langkah 4: middleware verifyToken di /course ---
assert((await req('GET', '/course')).status === 401, 'GET /course tanpa token -> 401')
assert((await req('GET', '/course', { token: 'token-palsu' })).status === 401, 'token palsu -> 401')
const list = await req('GET', '/course', { token })
assert(list.status === 200 && Array.isArray(list.data), 'GET /course dengan token -> 200 + list')

// --- Langkah 5: query params filter, sort, search ---
const filter = (await req('GET', '/course?category=business', { token })).data
assert(filter.length > 0 && filter.every((c) => c.category === 'business'), 'filter ?category=business')
// Kata kunci diambil dari judul kelas yang benar-benar ada, supaya tes ini
// jalan di database mana pun (lokal maupun cloud yang baru diisi seed).
assert(list.data.length > 0, 'ada kelas untuk diuji pencariannya')
const kata = list.data[0].title.split(' ').find((w) => w.length > 3) ?? list.data[0].title
const cocok = new RegExp(kata.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
const search = (await req('GET', `/course?search=${encodeURIComponent(kata)}`, { token })).data
assert(search.length > 0 && search.every((c) => cocok.test(c.title + c.description)), `search ?search=${kata}`)
const sorted = (await req('GET', '/course?sortBy=price:desc', { token })).data
assert(sorted.every((c, i) => i === 0 || sorted[i - 1].price >= c.price), 'sort ?sortBy=price:desc menurun')
// sortBy tak dikenal / key prototype tidak boleh 500 (fallback ke default)
assert((await req('GET', '/course?sortBy=constructor', { token })).status === 200, '?sortBy=constructor -> 200 (fallback, bukan 500)')
assert((await req('GET', '/course?category=a&category=b', { token })).status === 200, 'query param berulang -> 200 (bukan 500)')

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

// --- CRUD /users (panel admin) menulis ke tabel kredensial yang sama ---
const adminEmail = `admin_buat${unik}@test.local`
const dibuat = await req('POST', '/users', {
  body: { fullName: 'Dibuat Admin', email: adminEmail, phone: '+62811', password: 'rahasia123' },
})
assert(dibuat.status === 201, 'POST /users -> 201')
assert(!('password' in dibuat.data), 'respons /users tidak membocorkan password/hash')
const daftarUser = await req('GET', '/users')
assert(daftarUser.data.every((u) => !('password' in u)), 'GET /users tidak membocorkan password/hash')
const [[dbUser]] = await pool.query('SELECT password_hash, email_verified_at FROM users WHERE email = ?', [adminEmail])
assert(dbUser.password_hash.startsWith('$2'), 'user buatan admin disimpan sebagai hash bcrypt')
assert(dbUser.email_verified_at === null, 'user buatan admin tetap wajib verifikasi email (bukan jalan pintas)')
const tanpaSandi = await req('POST', '/users', { body: { fullName: 'Tanpa Sandi', email: `x2${unik}@t.local` } })
assert(tanpaSandi.status === 400, 'POST /users tanpa password -> 400')
// phone opsional: kolom NOT NULL punya default, jangan sampai dikirim NULL
const tanpaPhone = await req('POST', '/users', { body: { fullName: 'Tanpa Phone', email: `x3${unik}@t.local`, password: 'rahasia123' } })
assert(tanpaPhone.status === 201, `POST /users tanpa phone -> 201 (dapat ${tanpaPhone.status})`)
assert(tanpaSandi.data.message === 'Kata sandi wajib diisi.', 'pesan error kita sendiri diteruskan lewat key message')
// error database tidak boleh membocorkan sqlMessage mentah (nama tabel/index) ke klien
const duplikat = await req('POST', '/users', { body: { fullName: 'Duplikat', email: adminEmail, phone: '+62811', password: 'rahasia123' } })
assert(duplikat.status === 409, 'POST /users email duplikat -> 409')
assert(duplikat.data.message && !('error' in duplikat.data), 'respons error memakai key message, bukan error')
assert(!/Duplicate entry|uq_users|users\./.test(duplikat.data.message), 'sqlMessage mentah tidak bocor ke klien')
// edit tanpa mengirim password baru tidak boleh merusak hash yang tersimpan
assert((await req('PUT', `/users/${dibuat.data.id}`, { body: { ...dibuat.data, phone: '+62899', password: '' } })).status === 200, 'PUT /users tanpa password baru -> 200')
const [[setelahEdit]] = await pool.query('SELECT password_hash FROM users WHERE email = ?', [adminEmail])
assert(setelahEdit.password_hash === dbUser.password_hash, 'edit tanpa password baru mempertahankan hash lama')

// bersih-bersih data uji
await pool.query('DELETE FROM users WHERE email IN (?, ?, ?, ?, ?)', [
  akun.email, `nouname${unik}@test.local`, adminEmail,
  `${panjang}${unik}@test.local`, `x3${unik}@t.local`,
])
await pool.end()
console.log('SMOKE AUTH OK — register, login, middleware, query params, verify-email, upload semua berhasil')
