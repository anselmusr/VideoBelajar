import { useEffect, useState } from 'react'
import { courseCatalog } from '../utils/courseCatalog.js'

const STORAGE_KEY = 'videobelajar.courses'

function loadInitialCourses() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return courseCatalog
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : courseCatalog
  } catch {
    return courseCatalog
  }
}

export function useCourses() {
  const [courses, setCourses] = useState(loadInitialCourses)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
    } catch {
      // storage tidak tersedia — state tetap berjalan tanpa persistensi
    }
  }, [courses])

  const addCourse = (data) => {
    setCourses((prev) => {
      const nextId = prev.reduce((max, course) => Math.max(max, course.id), 0) + 1
      return [...prev, { ...data, id: nextId }]
    })
  }

  const updateCourse = (id, patch) => {
    setCourses((prev) =>
      prev.map((course) => (course.id === id ? { ...course, ...patch } : course)),
    )
  }

  const deleteCourse = (id) => {
    const index = courses.findIndex((course) => course.id === id)
    if (index === -1) return null
    const course = courses[index]
    setCourses((prev) => prev.filter((item) => item.id !== id))
    return { course, index }
  }

  const restoreCourse = (course, index) => {
    setCourses((prev) => {
      const next = [...prev]
      const insertAt = Math.min(Math.max(index, 0), next.length)
      next.splice(insertAt, 0, course)
      return next
    })
  }

  return { courses, addCourse, updateCourse, deleteCourse, restoreCourse }
}
