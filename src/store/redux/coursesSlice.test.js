import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { courseCatalog } from '../../utils/courseCatalog.js'
import * as coursesApi from '../../services/api/courses.js'
import coursesReducer, {
  addCourse,
  deleteCourse,
  fetchCourses,
  restoreCourse,
  updateCourse,
} from './coursesSlice.js'

vi.mock('../../services/api/courses.js', () => ({
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

function makeStore() {
  return configureStore({ reducer: { courses: coursesReducer } })
}

async function makeReadyStore() {
  coursesApi.getCourses.mockResolvedValue(sampleCourses)
  const store = makeStore()
  await store.dispatch(fetchCourses())
  return store
}

function coursesState(store) {
  return store.getState().courses
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('fetchCourses', () => {
  it('pending -> loading, fulfilled -> items terisi dari API', async () => {
    coursesApi.getCourses.mockResolvedValue(sampleCourses)
    const store = makeStore()
    const promise = store.dispatch(fetchCourses())
    expect(coursesState(store).status).toBe('loading')
    await promise
    expect(coursesState(store).status).toBe('succeeded')
    expect(coursesState(store).items).toEqual(sampleCourses)
    expect(coursesState(store).error).toBeNull()
  })

  it('auto-seed dari courseCatalog saat API kosong', async () => {
    coursesApi.getCourses.mockResolvedValue([])
    coursesApi.addCourse.mockImplementation(async (course) => ({ ...course, id: 'seed' }))
    const store = makeStore()
    await store.dispatch(fetchCourses())
    expect(coursesApi.addCourse).toHaveBeenCalledTimes(courseCatalog.length)
    expect(coursesApi.addCourse.mock.calls[0][0]).not.toHaveProperty('id')
    expect(coursesState(store).items).toHaveLength(courseCatalog.length)
  })

  it('tidak seeding ganda saat dispatch dua kali berurutan (StrictMode)', async () => {
    coursesApi.getCourses.mockResolvedValue([])
    coursesApi.addCourse.mockImplementation(async (course) => ({ ...course, id: 'seed' }))
    const store = makeStore()
    const first = store.dispatch(fetchCourses())
    const second = store.dispatch(fetchCourses())
    await Promise.all([first, second])
    expect(coursesApi.getCourses).toHaveBeenCalledTimes(1)
    expect(coursesApi.addCourse).toHaveBeenCalledTimes(courseCatalog.length)
    expect(coursesState(store).status).toBe('succeeded')
    expect(coursesState(store).items).toHaveLength(courseCatalog.length)
    expect(coursesState(store).error).toBeNull()
  })

  it('menyimpan pesan error saat fetch gagal', async () => {
    coursesApi.getCourses.mockRejectedValue(new Error('Gagal terhubung.'))
    const store = makeStore()
    await store.dispatch(fetchCourses())
    expect(coursesState(store).status).toBe('failed')
    expect(coursesState(store).error).toBe('Gagal terhubung.')
    expect(coursesState(store).items).toEqual([])
  })
})

describe('mutasi CRUD', () => {
  it('addCourse menunggu API lalu menambah item', async () => {
    const store = await makeReadyStore()
    coursesApi.addCourse.mockResolvedValue({ ...sampleCourses[0], id: '3', title: 'Kelas C' })
    await store.dispatch(addCourse({ title: 'Kelas C' }))
    expect(coursesState(store).items).toHaveLength(3)
    expect(coursesState(store).items[2].id).toBe('3')
  })

  it('addCourse gagal menyimpan error tanpa mengubah items', async () => {
    const store = await makeReadyStore()
    coursesApi.addCourse.mockRejectedValue(new Error('Permintaan gagal (500). Coba lagi.'))
    const result = await store.dispatch(addCourse({ title: 'Kelas C' }))
    expect(result.meta.requestStatus).toBe('rejected')
    expect(coursesState(store).error).toBe('Permintaan gagal (500). Coba lagi.')
    expect(coursesState(store).items).toHaveLength(2)
  })

  it('updateCourse mengirim objek gabungan dan memakai respons API', async () => {
    const store = await makeReadyStore()
    coursesApi.updateCourse.mockImplementation(async (id, body) => body)
    await store.dispatch(updateCourse({ id: '1', patch: { title: 'Judul Baru' } }))
    expect(coursesApi.updateCourse).toHaveBeenCalledWith('1', {
      ...sampleCourses[0],
      title: 'Judul Baru',
    })
    expect(coursesState(store).items[0].title).toBe('Judul Baru')
  })

  it('updateCourse ditolak untuk id tak dikenal tanpa memanggil API', async () => {
    const store = await makeReadyStore()
    const result = await store.dispatch(updateCourse({ id: '999', patch: { title: 'X' } }))
    expect(result.meta.requestStatus).toBe('rejected')
    expect(coursesApi.updateCourse).not.toHaveBeenCalled()
  })

  it('deleteCourse menghapus via API dan mengembalikan {course, index}', async () => {
    const store = await makeReadyStore()
    coursesApi.deleteCourse.mockResolvedValue(sampleCourses[0])
    const removed = await store.dispatch(deleteCourse('1')).unwrap()
    expect(removed).toEqual({ course: sampleCourses[0], index: 0 })
    expect(coursesState(store).items).toHaveLength(1)
    expect(coursesState(store).items[0].id).toBe('2')
  })

  it('deleteCourse ditolak untuk id tak dikenal tanpa memanggil API', async () => {
    const store = await makeReadyStore()
    const result = await store.dispatch(deleteCourse('999'))
    expect(result.meta.requestStatus).toBe('rejected')
    expect(coursesApi.deleteCourse).not.toHaveBeenCalled()
  })

  it('restoreCourse mem-POST ulang tanpa id lama', async () => {
    const store = await makeReadyStore()
    coursesApi.addCourse.mockImplementation(async (course) => ({ ...course, id: '9' }))
    await store.dispatch(restoreCourse(sampleCourses[0]))
    expect(coursesApi.addCourse.mock.calls[0][0]).not.toHaveProperty('id')
    expect(coursesState(store).items).toHaveLength(3)
    expect(coursesState(store).items[2].id).toBe('9')
  })
})
