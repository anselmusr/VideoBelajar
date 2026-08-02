import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export function normalizeApiError(error) {
  if (error.response) {
    // pakai pesan dari server (backend Express mengirim { message }) bila ada
    const serverMessage = error.response.data?.message
    const normalized = new Error(
      serverMessage || `Permintaan gagal (${error.response.status}). Coba lagi.`,
    )
    normalized.status = error.response.status
    return normalized
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
