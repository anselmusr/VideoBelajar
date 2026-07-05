import { configureStore } from '@reduxjs/toolkit'
import coursesReducer from './coursesSlice.js'

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
  },
})
