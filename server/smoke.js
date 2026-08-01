// Cek CRUD penuh REST API terhadap MySQL: node server/smoke.js
// (server harus sudah jalan: npm run server)
// Memakai alias publik /courses; permukaan ber-JWT /course diuji di smoke-auth.js
const BASE = process.env.API_URL ?? 'http://localhost:3001'

const assert = (cond, msg) => {
  if (!cond) throw new Error(`GAGAL: ${msg}`)
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}

const payload = {
  title: 'Smoke Test Course',
  description: 'Uji CRUD end-to-end terhadap MySQL.',
  category: 'business',
  instructor: 'Tester',
  role: 'QA Engineer',
  company: 'di VideoBelajar',
  rating: 4.5,
  reviews: 10,
  price: 150000,
  imageId: 2,
  avatarId: 3,
}

// INSERT
const created = (await req('POST', '/courses', payload)).data
assert(created?.id, 'POST /courses mengembalikan id')
assert(created.title === payload.title && created.category === 'business', 'POST round-trip data')
assert(created.rating === 4.5 && created.imageId === 2, 'tipe angka ikut kembali utuh')

// SELECT semua
const all = (await req('GET', '/courses')).data
assert(Array.isArray(all) && all.some((c) => c.id === created.id), 'GET /courses memuat data baru')

// SELECT by id
const one = (await req('GET', `/courses/${created.id}`)).data
assert(one.instructor === 'Tester', 'GET /course/:id')

// UPDATE by id
const updated = (await req('PUT', `/courses/${created.id}`, { ...created, title: 'Updated Course', price: 200000 })).data
assert(updated.title === 'Updated Course' && updated.price === 200000, 'PUT /course/:id mengubah data')

// DELETE by id
const deleted = (await req('DELETE', `/courses/${created.id}`)).data
assert(deleted.id === created.id, 'DELETE /course/:id')
assert((await req('GET', `/courses/${created.id}`)).status === 404, '404 setelah delete')

console.log('SMOKE OK — SELECT / INSERT / UPDATE / DELETE /course semua berhasil')
