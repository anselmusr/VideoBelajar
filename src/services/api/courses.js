import { apiClient } from './client.js'

export async function getCourses() {
  const { data } = await apiClient.get('/courses')
  return data
}

export async function addCourse(course) {
  const { data } = await apiClient.post('/courses', course)
  return data
}

export async function updateCourse(id, course) {
  const { data } = await apiClient.put(`/courses/${id}`, course)
  return data
}

export async function deleteCourse(id) {
  const { data } = await apiClient.delete(`/courses/${id}`)
  return data
}
