import { apiClient } from './client.js'

export async function registerUser(payload) {
  const { data } = await apiClient.post('/register', payload)
  return data
}

export async function loginUser(credentials) {
  const { data } = await apiClient.post('/login', credentials)
  return data
}

export async function verifyEmailToken(token) {
  const { data } = await apiClient.get('/verify-email', { params: { token } })
  return data
}
