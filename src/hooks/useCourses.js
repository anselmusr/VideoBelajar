import { useEffect, useState } from 'react'
import { courseCatalog } from '../utils/courseCatalog.js'
import * as coursesApi from '../services/api/courses.js'

async function seedCourses() {
  const seeded = []
  for (const { id: _id, ...payload } of courseCatalog) {
    seeded.push(await coursesApi.addCourse(payload))
  }
  return seeded
}

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const data = await coursesApi.getCourses()
        const initial = data.length > 0 ? data : await seedCourses()
        if (isMounted) setCourses(initial)
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [])

  const addCourse = async (data) => {
    try {
      const created = await coursesApi.addCourse(data)
      setCourses((prev) => [...prev, created])
      setError(null)
      return created
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const updateCourse = async (id, patch) => {
    const existing = courses.find((course) => course.id === id)
    if (!existing) return null
    try {
      const updated = await coursesApi.updateCourse(id, { ...existing, ...patch })
      setCourses((prev) => prev.map((course) => (course.id === id ? updated : course)))
      setError(null)
      return updated
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const deleteCourse = async (id) => {
    const index = courses.findIndex((course) => course.id === id)
    if (index === -1) return null
    try {
      await coursesApi.deleteCourse(id)
      setCourses((prev) => prev.filter((course) => course.id !== id))
      setError(null)
      return { course: courses[index], index }
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const restoreCourse = (course) => {
    const { id: _id, ...payload } = course
    return addCourse(payload)
  }

  return { courses, isLoading, error, addCourse, updateCourse, deleteCourse, restoreCourse }
}
