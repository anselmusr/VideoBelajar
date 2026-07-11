import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export function normalizeApiError(error) {
  if (error.response) {
    return new Error(`Permintaan gagal (${error.response.status}). Coba lagi.`)
  }
  return new Error('Tidak dapat terhubung ke server. Periksa koneksimu.')
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[api]', error.config?.method, error.config?.url, error.message)
    return Promise.reject(normalizeApiError(error))
  },
)
