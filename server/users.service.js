import { pool } from './db.js'

// Kolom password_hash ikut dikirim sebagai "password" karena login app
// membandingkan password di client (paritas perilaku mockapi.io).
const USER_SELECT = `
  SELECT id, full_name AS fullName, email, phone,
         password_hash AS password, role, avatar_url AS avatarUrl
    FROM users`

// SELECT semua data
export async function getAll() {
  const [rows] = await pool.query(`${USER_SELECT} ORDER BY id`)
  return rows
}

// SELECT by id
export async function getById(id) {
  const [rows] = await pool.query(`${USER_SELECT} WHERE id = ?`, [id])
  return rows[0] ?? null
}

// INSERT
export async function create(data) {
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, phone, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
    [data.fullName, data.email, data.phone, data.password, data.role ?? 'student', data.avatarUrl ?? null],
  )
  return getById(result.insertId)
}

// UPDATE by id
export async function update(id, data) {
  const existing = await getById(id)
  if (!existing) return null
  const merged = { ...existing, ...data }
  await pool.query(
    'UPDATE users SET full_name = ?, email = ?, phone = ?, password_hash = ?, role = ?, avatar_url = ? WHERE id = ?',
    [merged.fullName, merged.email, merged.phone, merged.password, merged.role, merged.avatarUrl, id],
  )
  return getById(id)
}

// DELETE by id
export async function remove(id) {
  const existing = await getById(id)
  if (!existing) return null
  await pool.query('DELETE FROM users WHERE id = ?', [id])
  return existing
}
