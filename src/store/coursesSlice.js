import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createCourseApi,
  deleteCourseApi,
  fetchCoursesApi,
  restoreCourseApi,
  updateCourseApi,
} from '../services/coursesApi.js'

export const fetchCourses = createAsyncThunk('courses/fetch', async (_, { rejectWithValue }) => {
  try {
    return await fetchCoursesApi()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const addCourse = createAsyncThunk('courses/add', async (data, { rejectWithValue }) => {
  try {
    return await createCourseApi(data)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateCourse = createAsyncThunk(
  'courses/update',
  async ({ id, patch }, { rejectWithValue }) => {
    try {
      return await updateCourseApi(id, patch)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteCourse = createAsyncThunk('courses/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteCourseApi(id)
    return id
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const restoreCourse = createAsyncThunk(
  'courses/restore',
  async (course, { rejectWithValue }) => {
    try {
      return await restoreCourseApi(course)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

function sortById(items) {
  return [...items].sort((a, b) => a.id - b.id)
}

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
  reducers: {
    clearCoursesError(state) {
      state.error = null
    },
  },
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
        state.status = 'failed'
        state.error = action.payload ?? 'Gagal memuat data kelas.'
      })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.items = sortById([...state.items, action.payload])
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.items = state.items.map((course) =>
          course.id === action.payload.id ? action.payload : course,
        )
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.items = state.items.filter((course) => course.id !== action.payload)
      })
      .addCase(restoreCourse.fulfilled, (state, action) => {
        state.items = sortById([...state.items, action.payload])
      })
      .addCase(addCourse.rejected, setMutationError)
      .addCase(updateCourse.rejected, setMutationError)
      .addCase(deleteCourse.rejected, setMutationError)
      .addCase(restoreCourse.rejected, setMutationError)
  },
})

export const { clearCoursesError } = coursesSlice.actions

export default coursesSlice.reducer
