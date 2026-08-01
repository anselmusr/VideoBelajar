import jwt from 'jsonwebtoken'
import { JWT_SECRET } from './auth.service.js'

// Langkah 4 misi: middleware yang memeriksa token pada endpoint tertentu.
// Token dibaca dari req.headers.authorization (dengan atau tanpa "Bearer ").
export function verifyToken(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : header
  if (!token) {
    return res.status(401).json({ message: 'Autentikasi gagal: token tidak ditemukan.' })
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Autentikasi gagal: token tidak valid.' })
  }
}
