import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { courseCatalog } from '../utils/courseCatalog.js'
import * as coursesApi from '../services/api/courses.js'
import { useCourses } from './useCourses.js'

vi.mock('../services/api/courses.js', () => ({
  getCourses: vi.fn(),
  addCourse: vi.fn(),
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
}))

const sampleCourses = [
  {
    id: '1',
    title: 'Kelas A',
    description: 'Deskripsi A',
    category: 'design',
    instructor: 'Ana',
    role: 'Designer',
    company: 'di Gojek',
    rating: 4,
    reviews: 10,
    price: 100000,
    imageId: 1,
    avatarId: 1,
  },
  {
    id: '2',
    title: 'Kelas B',
    description: 'Deskripsi B',
    category: 'business',
    instructor: 'Budi',
    role: 'Analyst',
    company: 'di Tokopedia',
    rating: 4.5,
    reviews: 20,
    price: 200000,
    imageId: 2,
    avatarId: 2,
  },
]

async function renderReadyHook() {
  coursesApi.getCourses.mockResolvedValue(sampleCourses)
  const view = renderHook(() => useCourses())
  await waitFor(() => expect(view.result.current.isLoading).toBe(false))
  return view
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useCourses inisialisasi', () => {
  it('mengambil kursus dari API saat mount', async () => {
    const { result } = await renderReadyHook()
    expect(result.current.courses).toEqual(sampleCourses)
    expect(result.current.error).toBeNull()
  })

  it('auto-seed dari courseCatalog saat API kosong', async () => {
    coursesApi.getCourses.mockResolvedValue([])
    coursesApi.addCourse.mockImplementation(async (course) => ({ ...course, id: 'seed' }))
    const { result } = renderHook(() => useCourses())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(coursesApi.addCourse).toHaveBeenCalledTimes(courseCatalog.length)
    expect(result.current.courses).toHaveLength(courseCatalog.length)
    expect(coursesApi.addCourse.mock.calls[0][0]).not.toHaveProperty('id')
  })

  it('menyimpan pesan error saat fetch gagal', async () => {
    coursesApi.getCourses.mockRejectedValue(new Error('Gagal terhubung.'))
    const { result } = renderHook(() => useCourses())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Gagal terhubung.')
    expect(result.current.courses).toEqual([])
  })
})

describe('useCourses CRUD', () => {
  it('addCourse menunggu API lalu menambah state', async () => {
    const { result } = await renderReadyHook()
    coursesApi.addCourse.mockResolvedValue({ ...sampleCourses[0], id: '3', title: 'Kelas C' })
    await act(async () => {
      await result.current.addCourse({ title: 'Kelas C' })
    })
    expect(result.current.courses).toHaveLength(3)
    expect(result.current.courses[2].id).toBe('3')
  })

  it('addCourse mengembalikan null dan menyimpan error saat API gagal', async () => {
    const { result } = await renderReadyHook()
    coursesApi.addCourse.mockRejectedValue(new Error('Permintaan gagal (500). Coba lagi.'))
    let created
    await act(async () => {
      created = await result.current.addCourse({ title: 'Kelas C' })
    })
    expect(created).toBeNull()
    expect(result.current.error).toBe('Permintaan gagal (500). Coba lagi.')
    expect(result.current.courses).toHaveLength(2)
  })

  it('updateCourse mengirim objek gabungan dan memakai respons API', async () => {
    const { result } = await renderReadyHook()
    coursesApi.updateCourse.mockImplementation(async (id, body) => body)
    await act(async () => {
      await result.current.updateCourse('1', { title: 'Judul Baru' })
    })
    expect(coursesApi.updateCourse).toHaveBeenCalledWith('1', {
      ...sampleCourses[0],
      title: 'Judul Baru',
    })
    expect(result.current.courses[0].title).toBe('Judul Baru')
  })

  it('updateCourse mengembalikan null untuk id tak dikenal tanpa memanggil API', async () => {
    const { result } = await renderReadyHook()
    let updated
    await act(async () => {
      updated = await result.current.updateCourse('999', { title: 'X' })
    })
    expect(updated).toBeNull()
    expect(coursesApi.updateCourse).not.toHaveBeenCalled()
  })

  it('deleteCourse menghapus via API dan mengembalikan {course, index}', async () => {
    const { result } = await renderReadyHook()
    coursesApi.deleteCourse.mockResolvedValue(sampleCourses[0])
    let removed
    await act(async () => {
      removed = await result.current.deleteCourse('1')
    })
    expect(removed).toEqual({ course: sampleCourses[0], index: 0 })
    expect(result.current.courses).toHaveLength(1)
    expect(result.current.courses[0].id).toBe('2')
  })

  it('deleteCourse mengembalikan null untuk id tak dikenal tanpa memanggil API', async () => {
    const { result } = await renderReadyHook()
    let removed
    await act(async () => {
      removed = await result.current.deleteCourse('999')
    })
    expect(removed).toBeNull()
    expect(coursesApi.deleteCourse).not.toHaveBeenCalled()
  })

  it('restoreCourse mem-POST ulang tanpa id lama', async () => {
    const { result } = await renderReadyHook()
    coursesApi.addCourse.mockImplementation(async (course) => ({ ...course, id: '9' }))
    await act(async () => {
      await result.current.restoreCourse(sampleCourses[0])
    })
    expect(coursesApi.addCourse.mock.calls[0][0]).not.toHaveProperty('id')
    expect(result.current.courses).toHaveLength(3)
    expect(result.current.courses[2].id).toBe('9')
  })
})
