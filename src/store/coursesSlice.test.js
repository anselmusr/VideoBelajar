import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import coursesReducer, {
  addCourse,
  clearCoursesError,
  deleteCourse,
  fetchCourses,
  restoreCourse,
  updateCourse,
} from './coursesSlice.js'
import {
  createCourseApi,
  deleteCourseApi,
  fetchCoursesApi,
  restoreCourseApi,
  updateCourseApi,
} from '../services/coursesApi.js'

vi.mock('../services/coursesApi.js', () => ({
  fetchCoursesApi: vi.fn(),
  createCourseApi: vi.fn(),
  updateCourseApi: vi.fn(),
  deleteCourseApi: vi.fn(),
  restoreCourseApi: vi.fn(),
}))

const courseA = { id: 1, title: 'Kelas A', description: 'x', category: 'business', instructor: 'A', role: '', company: '', rating: 4, reviews: 10, price: 100000, imageId: 1, avatarId: 1 }
const courseB = { id: 2, title: 'Kelas B', description: 'y', category: 'design', instructor: 'B', role: '', company: '', rating: 3, reviews: 5, price: 200000, imageId: 2, avatarId: 2 }

function makeStore() {
  return configureStore({ reducer: { courses: coursesReducer } })
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('fetchCourses', () => {
  it('pending -> loading, fulfilled -> items terisi', async () => {
    fetchCoursesApi.mockResolvedValue([courseA, courseB])
    const store = makeStore()
    const promise = store.dispatch(fetchCourses())
    expect(store.getState().courses.status).toBe('loading')
    await promise
    expect(store.getState().courses.status).toBe('succeeded')
    expect(store.getState().courses.items).toEqual([courseA, courseB])
  })

  it('rejected -> status failed + pesan error tersimpan', async () => {
    fetchCoursesApi.mockRejectedValue(new Error('koneksi putus'))
    const store = makeStore()
    await store.dispatch(fetchCourses())
    expect(store.getState().courses.status).toBe('failed')
    expect(store.getState().courses.error).toBe('koneksi putus')
  })
})

describe('mutasi', () => {
  it('addCourse fulfilled menambah item terurut id', async () => {
    fetchCoursesApi.mockResolvedValue([courseB])
    createCourseApi.mockResolvedValue(courseA)
    const store = makeStore()
    await store.dispatch(fetchCourses())
    await store.dispatch(addCourse({ title: 'Kelas A' }))
    expect(store.getState().courses.items.map((c) => c.id)).toEqual([1, 2])
  })

  it('updateCourse fulfilled mengganti item yang cocok', async () => {
    fetchCoursesApi.mockResolvedValue([courseA, courseB])
    updateCourseApi.mockResolvedValue({ ...courseB, title: 'Diubah' })
    const store = makeStore()
    await store.dispatch(fetchCourses())
    await store.dispatch(updateCourse({ id: 2, patch: { title: 'Diubah' } }))
    expect(store.getState().courses.items.find((c) => c.id === 2).title).toBe('Diubah')
    expect(store.getState().courses.items).toHaveLength(2)
  })

  it('deleteCourse fulfilled menghapus item; restoreCourse mengembalikan terurut', async () => {
    fetchCoursesApi.mockResolvedValue([courseA, courseB])
    deleteCourseApi.mockResolvedValue()
    restoreCourseApi.mockResolvedValue(courseA)
    const store = makeStore()
    await store.dispatch(fetchCourses())
    await store.dispatch(deleteCourse(1))
    expect(store.getState().courses.items.map((c) => c.id)).toEqual([2])
    await store.dispatch(restoreCourse(courseA))
    expect(store.getState().courses.items.map((c) => c.id)).toEqual([1, 2])
  })

  it('mutasi rejected menyimpan error tanpa mengubah items, clearCoursesError menghapusnya', async () => {
    fetchCoursesApi.mockResolvedValue([courseA])
    deleteCourseApi.mockRejectedValue(new Error('gagal hapus'))
    const store = makeStore()
    await store.dispatch(fetchCourses())
    await store.dispatch(deleteCourse(1))
    expect(store.getState().courses.items).toEqual([courseA])
    expect(store.getState().courses.error).toBe('gagal hapus')
    store.dispatch(clearCoursesError())
    expect(store.getState().courses.error).toBeNull()
  })
})
