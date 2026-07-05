import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { courseCatalog } from '../utils/courseCatalog.js'
import { useCourses } from './useCourses.js'

const STORAGE_KEY = 'videobelajar.courses'

const sampleCourse = {
  title: 'Kelas Baru',
  description: 'Deskripsi kelas baru.',
  category: 'design',
  instructor: 'Budi Santoso',
  role: 'Lead Designer',
  company: 'di Tokopedia',
  rating: 4.5,
  reviews: 12,
  price: 250000,
  imageId: 2,
  avatarId: 3,
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('useCourses inisialisasi', () => {
  it('memakai courseCatalog saat localStorage kosong', () => {
    const { result } = renderHook(() => useCourses())
    expect(result.current.courses).toEqual(courseCatalog)
  })

  it('memakai data localStorage jika ada', () => {
    const saved = [{ ...sampleCourse, id: 42 }]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    const { result } = renderHook(() => useCourses())
    expect(result.current.courses).toEqual(saved)
  })

  it('fallback ke courseCatalog saat JSON korup atau bukan array', () => {
    window.localStorage.setItem(STORAGE_KEY, '{json rusak')
    const { result: corrupt } = renderHook(() => useCourses())
    expect(corrupt.current.courses).toEqual(courseCatalog)

    window.localStorage.setItem(STORAGE_KEY, '"bukan array"')
    const { result: notArray } = renderHook(() => useCourses())
    expect(notArray.current.courses).toEqual(courseCatalog)
  })
})

describe('useCourses CRUD', () => {
  it('addCourse menambah kursus dengan id max+1 dan persist ke localStorage', () => {
    const { result } = renderHook(() => useCourses())
    act(() => {
      result.current.addCourse(sampleCourse)
    })
    expect(result.current.courses).toHaveLength(10)
    expect(result.current.courses[9]).toEqual({ ...sampleCourse, id: 10 })
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toHaveLength(10)
  })

  it('updateCourse mem-patch kursus secara immutable', () => {
    const { result } = renderHook(() => useCourses())
    const before = result.current.courses
    act(() => {
      result.current.updateCourse(3, { title: 'Judul Diubah', price: 99000 })
    })
    const updated = result.current.courses.find((course) => course.id === 3)
    expect(updated.title).toBe('Judul Diubah')
    expect(updated.price).toBe(99000)
    expect(updated.description).toBe(before.find((c) => c.id === 3).description)
    expect(result.current.courses).not.toBe(before)
    expect(result.current.courses).toHaveLength(9)
  })

  it('deleteCourse menghapus dan mengembalikan {course, index}', () => {
    const { result } = renderHook(() => useCourses())
    let removed
    act(() => {
      removed = result.current.deleteCourse(3)
    })
    expect(removed.course.id).toBe(3)
    expect(removed.index).toBe(2)
    expect(result.current.courses).toHaveLength(8)
    expect(result.current.courses.some((course) => course.id === 3)).toBe(false)
  })

  it('deleteCourse mengembalikan null untuk id yang tidak ada', () => {
    const { result } = renderHook(() => useCourses())
    let removed
    act(() => {
      removed = result.current.deleteCourse(999)
    })
    expect(removed).toBeNull()
    expect(result.current.courses).toHaveLength(9)
  })

  it('restoreCourse mengembalikan kursus ke posisi semula', () => {
    const { result } = renderHook(() => useCourses())
    let removed
    act(() => {
      removed = result.current.deleteCourse(3)
    })
    act(() => {
      result.current.restoreCourse(removed.course, removed.index)
    })
    expect(result.current.courses).toEqual(courseCatalog)
  })
})
