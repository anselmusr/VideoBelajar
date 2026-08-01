import express from 'express'
import * as courses from './courses.service.js'
import * as users from './users.service.js'

const app = express()
app.use(express.json())

// CORS untuk Vite dev server — cukup header manual, tanpa dependency ekstra
app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

function crudRouter(service) {
  const router = express.Router()

  router.get('/', async (req, res) => {
    res.json(await service.getAll())
  })

  router.get('/:id', async (req, res) => {
    const row = await service.getById(req.params.id)
    if (!row) return res.status(404).json({ error: 'Data tidak ditemukan.' })
    res.json(row)
  })

  router.post('/', async (req, res) => {
    res.status(201).json(await service.create(req.body))
  })

  const update = async (req, res) => {
    const row = await service.update(req.params.id, req.body)
    if (!row) return res.status(404).json({ error: 'Data tidak ditemukan.' })
    res.json(row)
  }
  router.put('/:id', update)
  router.patch('/:id', update)

  router.delete('/:id', async (req, res) => {
    const row = await service.remove(req.params.id)
    if (!row) return res.status(404).json({ error: 'Data tidak ditemukan.' })
    res.json(row)
  })

  return router
}

app.get('/', (req, res) => {
  res.json({
    service: 'EduCourse REST API',
    endpoints: ['GET /course', 'GET /course/:id', 'POST /course', 'PUT|PATCH /course/:id', 'DELETE /course/:id'],
  })
})

// /course sesuai tabel endpoint misi; /courses agar kompatibel dengan
// frontend yang sudah ada (paritas resource mockapi.io)
app.use(['/course', '/courses'], crudRouter(courses))
app.use(['/user', '/users'], crudRouter(users))

const CLIENT_DATA_ERRORS = [
  'ER_BAD_NULL_ERROR', 'ER_DATA_TOO_LONG', 'ER_WARN_DATA_OUT_OF_RANGE',
  'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD', 'ER_CHECK_CONSTRAINT_VIOLATED',
]

app.use((err, req, res, _next) => {
  console.error('[server]', err.code ?? '', err.message)
  const status = err.code === 'ER_DUP_ENTRY' ? 409
    : CLIENT_DATA_ERRORS.includes(err.code) ? 400
    : 500
  res.status(status).json({ error: err.sqlMessage ?? err.message })
})

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => {
  console.log(`EduCourse REST API berjalan di http://localhost:${port}`)
})
