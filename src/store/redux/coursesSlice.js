import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { courseCatalog } from '../../utils/courseCatalog.js'
import * as coursesApi from '../../services/api/courses.js'

export const fetchCourses = createAsyncThunk(
  'courses/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await coursesApi.getCourses()
      if (data.length > 0) return data
      const seeded = []
      for (const { id: _id, ...payload } of courseCatalog) {
        seeded.push(await coursesApi.addCourse(payload))
      }
      return seeded
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
  {
    // cegah fetch + seeding ganda saat StrictMode menjalankan effect dua kali
    condition: (_, { getState }) => getState().courses.status !== 'loading',
  },
)

export const addCourse = createAsyncThunk('courses/add', async (data, { rejectWithValue }) => {
  try {
    return await coursesApi.addCourse(data)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateCourse = createAsyncThunk(
  'courses/update',
  async ({ id, patch }, { getState, rejectWithValue }) => {
    const existing = getState().courses.items.find((course) => course.id === id)
    if (!existing) return rejectWithValue('Kelas tidak ditemukan.')
    try {
      return await coursesApi.updateCourse(id, { ...existing, ...patch })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (id, { getState, rejectWithValue }) => {
    const items = getState().courses.items
    const index = items.findIndex((course) => course.id === id)
    if (index === -1) return rejectWithValue('Kelas tidak ditemukan.')
    try {
      await coursesApi.deleteCourse(id)
      return { course: items[index], index }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const restoreCourse = createAsyncThunk(
  'courses/restore',
  async (course, { rejectWithValue }) => {
    const { id: _id, ...payload } = course
    try {
      return await coursesApi.addCourse(payload)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

function setMutationError(state, action) {
  state.error = action.payload ?? 'Operasi gagal. Coba lagi.'
}

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        // dispatchConditionRejection memancarkan rejected juga saat dibatalkan
        // condition (StrictMode); itu bukan kegagalan fetch
        if (action.meta.condition) return
        state.status = 'failed'
        state.error = action.payload ?? 'Gagal memuat data kelas.'
      })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.items.push(action.payload)
        state.error = null
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.items = state.items.map((course) =>
          course.id === action.payload.id ? action.payload : course,
        )
        state.error = null
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.items = state.items.filter((course) => course.id !== action.payload.course.id)
        state.error = null
      })
      .addCase(restoreCourse.fulfilled, (state, action) => {
        state.items.push(action.payload)
        state.error = null
      })
      .addCase(addCourse.rejected, setMutationError)
      .addCase(updateCourse.rejected, setMutationError)
      .addCase(deleteCourse.rejected, setMutationError)
      .addCase(restoreCourse.rejected, setMutationError)
  },
})

export default coursesSlice.reducer
