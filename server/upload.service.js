import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'

// Langkah 7 misi: konfigurasi multer — file masuk ke folder uploads/ di root.
export const UPLOAD_DIR = path.resolve('uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
  },
})

// Whitelist ekstensi + mimetype: mimetype dari client bisa dipalsukan, jadi
// ekstensi asli juga harus gambar raster (SVG sengaja ditolak — bisa memuat script).
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp'])

export const uploadImage = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (file.mimetype.startsWith('image/') && ALLOWED_EXT.has(ext)) return cb(null, true)
    cb(new Error('Hanya file gambar (png, jpg, jpeg, gif, webp) yang diizinkan.'))
  },
}).single('file')
