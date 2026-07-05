import { describe, expect, it } from 'vitest'
import { courseToRow, rowToCourse } from './courseMapping.js'

const sampleRow = {
  id: 7,
  title: 'Kelas React',
  description: 'Belajar dari nol.',
  category: 'design',
  instructor: 'Budi',
  role: 'Engineer',
  company: 'di Tokopedia',
  rating: 4.5,
  reviews: 12,
  price: 250000,
  image_id: 3,
  avatar_id: 5,
  created_at: '2026-07-06T00:00:00Z',
}

describe('rowToCourse', () => {
  it('memetakan snake_case ke camelCase tanpa created_at', () => {
    expect(rowToCourse(sampleRow)).toEqual({
      id: 7,
      title: 'Kelas React',
      description: 'Belajar dari nol.',
      category: 'design',
      instructor: 'Budi',
      role: 'Engineer',
      company: 'di Tokopedia',
      rating: 4.5,
      reviews: 12,
      price: 250000,
      imageId: 3,
      avatarId: 5,
    })
  })

  it('memaksa rating menjadi number', () => {
    expect(rowToCourse({ ...sampleRow, rating: '3.5' }).rating).toBe(3.5)
  })
})

describe('courseToRow', () => {
  const course = rowToCourse(sampleRow)

  it('memetakan camelCase ke snake_case dengan id', () => {
    expect(courseToRow(course)).toEqual({
      id: 7,
      title: 'Kelas React',
      description: 'Belajar dari nol.',
      category: 'design',
      instructor: 'Budi',
      role: 'Engineer',
      company: 'di Tokopedia',
      rating: 4.5,
      reviews: 12,
      price: 250000,
      image_id: 3,
      avatar_id: 5,
    })
  })

  it('tidak menyertakan id jika undefined', () => {
    const { id, ...tanpaId } = course
    expect(courseToRow(tanpaId)).not.toHaveProperty('id')
  })

  it('round-trip row -> course -> row konsisten', () => {
    const roundTrip = courseToRow(rowToCourse(sampleRow))
    expect(rowToCourse({ ...roundTrip, created_at: 'x' })).toEqual(rowToCourse(sampleRow))
  })
})
