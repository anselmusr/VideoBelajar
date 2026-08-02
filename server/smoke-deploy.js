// Cek backend yang sudah di-deploy, murni lewat HTTP (tanpa akses database).
// Dipakai setelah deploy ke Render untuk memastikan auth + verifikasi email hidup.
//
// Jalankan: node server/smoke-deploy.js https://api-kamu.onrender.com [email-asli@kamu.com]
// Kalau email diisi, tautan verifikasi sungguhan dikirim ke sana — buka inboxnya
// untuk membuktikan SMTP produksi benar-benar mengirim.
const [BASE, emailAsli] = process.argv.slice(2)

if (!BASE?.startsWith('http')) {
  console.error('Pakai: node server/smoke-deploy.js <url-backend> [email-asli]')
  process.exit(1)
}

const assert = (cond, msg) => {
  if (!cond) throw new Error(`GAGAL: ${msg}`)
  console.log(`  ok — ${msg}`)
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}

const unik = Date.now()
const email = emailAsli ?? `smoke_deploy${unik}@example.com`
const akun = { fullname: 'Smoke Deploy', password: `rahasia${unik}`, email }

console.log(`Menguji ${BASE}\n`)

// Render free tier tidur saat menganggur — request pertama bisa lambat sekali.
console.log('Membangunkan service (bisa sampai ~60 detik di free tier)…')
assert((await req('GET', '/')).status === 200, 'service merespons')

console.log('\nKatalog & middleware:')
const katalog = await req('GET', '/courses')
assert(katalog.status === 200 && Array.isArray(katalog.data), 'GET /courses publik -> 200 + list (database tersambung)')
// Kosong bukan kegagalan: frontend mengisi katalog sendiri saat pertama dibuka.
console.log(katalog.data.length > 0
  ? `  ok — katalog berisi ${katalog.data.length} kelas`
  : '  catatan — katalog masih kosong; akan terisi otomatis saat frontend pertama kali dibuka')
assert((await req('GET', '/course')).status === 401, 'GET /course tanpa token -> 401 (middleware JWT aktif)')
const bocor = await req('GET', '/users')
assert(bocor.status === 200 && bocor.data.every((u) => !('password' in u)), 'GET /users tidak membocorkan password')

console.log('\nRegistrasi & verifikasi email:')
assert((await req('POST', '/register', { ...akun, email: 'bukanemail' })).status === 400, 'email tak valid -> 400')
const daftar = await req('POST', '/register', akun)
assert(daftar.status === 201, `register -> 201 (dapat ${daftar.status}: ${daftar.data?.message ?? ''})`)
assert(!('emailPreview' in (daftar.data ?? {})), 'respons register tidak membocorkan URL preview email')
assert((await req('POST', '/login', { email, password: akun.password })).status === 403,
  'login sebelum verifikasi -> 403 (verifikasi email benar-benar mengunci akses)')
assert((await req('POST', '/login', { email, password: 'salah' })).status === 401, 'password salah -> 401')
assert((await req('POST', '/register', akun)).status === 200, 'daftar ulang email belum terverifikasi -> 200 kirim ulang')

const duplikat = await req('POST', '/users', { fullName: 'X', email, phone: '', password: 'rahasia123' })
assert(duplikat.status === 409 && !/Duplicate entry|uq_users/.test(duplikat.data?.message ?? ''),
  'error database tidak membocorkan SQL mentah ke klien')

console.log(`
SMOKE DEPLOY OK — backend hidup, database tersambung, dan verifikasi email mengunci login.

Langkah manual terakhir (membuktikan SMTP produksi sungguhan):
  1. Buka inbox ${email}${emailAsli ? '' : ' — alamat contoh, ulangi dengan email aslimu untuk cek ini'}
  2. Klik tautan verifikasinya, halaman web harus menampilkan "Email berhasil diverifikasi"
  3. Login dengan password: ${akun.password}
`)
