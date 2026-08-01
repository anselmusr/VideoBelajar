import { pool } from './db.js'

// Skema DB normalized (courses -> categories, tutors), sedangkan frontend
// memakai objek datar ala mockapi. SELECT me-JOIN lalu meng-alias kolom ke
// bentuk frontend; INSERT/UPDATE memecah balik ke tabel masing-masing.
// Satu baris tutors per course (imageId/avatarId aset lokal disimpan di
// thumbnail_url/avatar_url).
const COURSE_SELECT = `
  SELECT c.id, c.title, c.description, cat.slug AS category,
         t.full_name AS instructor, t.job_title AS role, t.company,
         c.rating_avg AS rating, c.review_count AS reviews, c.price,
         c.thumbnail_url AS imageId, t.avatar_url AS avatarId
    FROM courses c
    JOIN categories cat ON cat.id = c.category_id
    JOIN tutors t ON t.id = c.tutor_id`

function toCourse(row) {
  return {
    ...row,
    imageId: row.imageId == null ? null : Number(row.imageId),
    avatarId: row.avatarId == null ? null : Number(row.avatarId),
  }
}

// SELECT semua data (SELECT *)
export async function getAll() {
  const [rows] = await pool.query(`${COURSE_SELECT} ORDER BY c.id`)
  return rows.map(toCourse)
}

// SELECT by id
export async function getById(id) {
  const [rows] = await pool.query(`${COURSE_SELECT} WHERE c.id = ?`, [id])
  return rows.length ? toCourse(rows[0]) : null
}

async function resolveCategoryId(conn, slug) {
  const [found] = await conn.query('SELECT id FROM categories WHERE slug = ?', [slug])
  if (found.length) return found[0].id
  const name = String(slug)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  const [inserted] = await conn.query(
    'INSERT INTO categories (name, slug) VALUES (?, ?)',
    [name, slug],
  )
  return inserted.insertId
}

// INSERT: transaksi tutors + courses agar tidak ada course tanpa tutor
export async function create(data) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const categoryId = await resolveCategoryId(conn, data.category)
    const [tutor] = await conn.query(
      'INSERT INTO tutors (full_name, job_title, company, avatar_url) VALUES (?, ?, ?, ?)',
      [data.instructor, data.role, data.company ?? null, data.avatarId ?? null],
    )
    const [course] = await conn.query(
      `INSERT INTO courses
         (category_id, tutor_id, title, description, price, thumbnail_url, rating_avg, review_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryId, tutor.insertId, data.title, data.description,
        data.price, data.imageId ?? null, data.rating ?? 0, data.reviews ?? 0,
      ],
    )
    await conn.commit()
    return await getById(course.insertId)
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

// UPDATE by id (frontend mengirim objek penuh hasil merge existing + patch)
export async function update(id, data) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [rows] = await conn.query('SELECT tutor_id FROM courses WHERE id = ?', [id])
    if (!rows.length) {
      await conn.rollback()
      return null
    }
    const categoryId = await resolveCategoryId(conn, data.category)
    await conn.query(
      'UPDATE tutors SET full_name = ?, job_title = ?, company = ?, avatar_url = ? WHERE id = ?',
      [data.instructor, data.role, data.company ?? null, data.avatarId ?? null, rows[0].tutor_id],
    )
    await conn.query(
      `UPDATE courses
          SET category_id = ?, title = ?, description = ?, price = ?,
              thumbnail_url = ?, rating_avg = ?, review_count = ?
        WHERE id = ?`,
      [
        categoryId, data.title, data.description, data.price,
        data.imageId ?? null, data.rating ?? 0, data.reviews ?? 0, id,
      ],
    )
    await conn.commit()
    return await getById(id)
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

// DELETE by id (hapus juga baris tutor kalau tidak dipakai course lain)
export async function remove(id) {
  const course = await getById(id)
  if (!course) return null
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [rows] = await conn.query('SELECT tutor_id FROM courses WHERE id = ?', [id])
    const tutorId = rows[0]?.tutor_id
    await conn.query('DELETE FROM courses WHERE id = ?', [id])
    if (tutorId) {
      await conn.query(
        'DELETE FROM tutors WHERE id = ? AND NOT EXISTS (SELECT 1 FROM courses WHERE tutor_id = ?)',
        [tutorId, tutorId],
      )
    }
    await conn.commit()
    return course
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}
