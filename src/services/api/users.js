import { apiClient } from './client.js'

export async function getUsers() {
  const { data } = await apiClient.get('/users')
  return data
}

export async function addUser(user) {
  const { data } = await apiClient.post('/users', user)
  return data
}

export async function updateUser(id, user) {
  const { data } = await apiClient.put(`/users/${id}`, user)
  return data
}

export async function deleteUser(id) {
  const { data } = await apiClient.delete(`/users/${id}`)
  return data
}
