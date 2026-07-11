import { describe, expect, it } from 'vitest'
import { normalizeApiError } from './client.js'

describe('normalizeApiError', () => {
  it('memakai status HTTP saat server merespons error', () => {
    const error = { response: { status: 404 }, message: 'Request failed' }
    expect(normalizeApiError(error).message).toBe('Permintaan gagal (404). Coba lagi.')
  })

  it('memberi pesan koneksi saat tidak ada respons dari server', () => {
    const error = { message: 'Network Error' }
    expect(normalizeApiError(error).message).toBe('Tidak dapat terhubung ke server. Periksa koneksimu.')
  })
})
