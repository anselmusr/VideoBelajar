import express from 'express'
import * as courses from './courses.service.js'
import * as users from './users.service.js'
import * as auth from './auth.service.js'
import { verifyToken } from './auth.middleware.js'
import { uploadImage, UPLOAD_DIR } from './upload.service.js'

const app = express()
app.use(express.json())

// CORS untuk Vite dev server — cukup header manual, tanpa dependency ekstra
app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

function crudRouter(service) {
  const router = express.Router()

  router.get('/', async (req, res) => {
    res.json(await service.getAll(req.query))
  })

  router.get('/:id', async (req, res) => {
    const row = await service.getById(req.params.id)
    if (!row) return res.status(404).json({ message: 'Data tidak ditemukan.' })
    res.json(row)
  })

  router.post('/', async (req, res) => {
    res.status(201).json(await service.create(req.body))
  })

  const update = async (req, res) => {
    const row = await service.update(req.params.id, req.body)
    if (!row) return res.status(404).json({ message: 'Data tidak ditemukan.' })
    res.json(row)
  }
  router.put('/:id', update)
  router.patch('/:id', update)

  router.delete('/:id', async (req, res) => {
    const row = await service.remove(req.params.id)
    if (!row) return res.status(404).json({ message: 'Data tidak ditemukan.' })
    res.json(row)
  })

  return router
}

app.get('/', (req, res) => {
  res.json({
    service: 'EduCourse REST API',
    auth: ['POST /register', 'POST /login', 'GET /verify-email?token=', 'POST /upload (Bearer token)'],
    courses: 'GET /course?category=&search=&sortBy= (Bearer token) — alias publik: /courses',
  })
})

// ---------- misi Backend Advance 1: autentikasi ----------
app.post('/register', async (req, res) => {
  const { status, body } = await auth.register(req.body)
  res.status(status).json(body)
})

app.post('/login', async (req, res) => {
  const { status, body } = await auth.login(req.body)
  res.status(status).json(body)
})

app.get('/verify-email', async (req, res) => {
  const token = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token
  const { status, body } = await auth.verifyEmail(token)
  res.status(status).json(body)
})

// ---------- misi Backend Advance 1: upload image (multer) ----------
app.post('/upload', verifyToken, (req, res) => {
  uploadImage(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message })
    if (!req.file) return res.status(400).json({ message: "File gambar wajib dikirim di field 'file'." })
    res.status(201).json({
      message: 'Upload berhasil.',
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
    })
  })
})
app.use('/uploads', express.static(UPLOAD_DIR))

// /course (singular, tabel endpoint misi) dilindungi middleware verifyToken;
// /courses (plural) tetap publik sebagai paritas mockapi.io untuk frontend.
app.use('/course', verifyToken, crudRouter(courses))
app.use('/courses', crudRouter(courses))
app.use(['/user', '/users'], crudRouter(users))

const CLIENT_DATA_ERRORS = [
  'ER_BAD_NULL_ERROR', 'ER_DATA_TOO_LONG', 'ER_WARN_DATA_OUT_OF_RANGE',
  'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD', 'ER_CHECK_CONSTRAINT_VIOLATED',
]

// Semua respons memakai key `message` (dibaca normalizeApiError di frontend).
// sqlMessage mentah sengaja hanya masuk log server: isinya nama tabel, nama
// index, dan alamat email — detail skema yang tak perlu sampai ke browser.
app.use((err, req, res, _next) => {
  console.error('[server]', err.code ?? '', err.sqlMessage ?? err.message)
  const status = err.status ?? (err.code === 'ER_DUP_ENTRY' ? 409
    : CLIENT_DATA_ERRORS.includes(err.code) ? 400
    : 500)
  res.status(status).json({
    message: err.status ? err.message // pesan yang memang kita tulis sendiri
      : status === 409 ? 'Data sudah terdaftar.'
      : status === 400 ? 'Data yang dikirim tidak valid atau terlalu panjang.'
      : 'Terjadi kesalahan di server. Coba lagi nanti.',
  })
})

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => {
  console.log(`EduCourse REST API berjalan di http://localhost:${port}`)
})
