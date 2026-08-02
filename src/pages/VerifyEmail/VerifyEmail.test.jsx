import { cleanup, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '../../services/api/auth.js'
import VerifyEmail from './VerifyEmail.jsx'

vi.mock('../../services/api/auth.js', () => ({
  verifyEmailToken: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

function renderAt(path) {
  // StrictMode meniru dev: efek jalan dua kali — verifikasi tetap harus sekali
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </MemoryRouter>
    </StrictMode>,
  )
}

describe('VerifyEmail', () => {
  it('token valid: memanggil API sekali lalu menampilkan sukses + tautan login', async () => {
    authApi.verifyEmailToken.mockResolvedValue({ message: 'Email Verified Successfully' })
    renderAt('/verify-email?token=abc-123')
    expect(await screen.findByText(/Email berhasil diverifikasi/)).toBeTruthy()
    expect(authApi.verifyEmailToken).toHaveBeenCalledTimes(1)
    expect(authApi.verifyEmailToken).toHaveBeenCalledWith('abc-123')
    expect(screen.getByRole('link', { name: 'Masuk Sekarang' }).getAttribute('href')).toBe('/login')
  })

  it('token tidak valid (400): mengarahkan ke login, bukan cuma daftar ulang', async () => {
    authApi.verifyEmailToken.mockRejectedValue(
      Object.assign(new Error('Invalid Verification Token'), { status: 400 }),
    )
    renderAt('/verify-email?token=salah')
    expect(await screen.findByText(/Tautan ini tidak berlaku lagi/)).toBeTruthy()
    // kasus paling umum: token sudah dipakai = akun sudah aktif, jadi user perlu Masuk
    expect(screen.getByRole('link', { name: 'Masuk' }).getAttribute('href')).toBe('/login')
  })

  it('tanpa token: langsung error tanpa memanggil API', () => {
    renderAt('/verify-email')
    expect(screen.getByText(/Tautan verifikasi tidak lengkap/)).toBeTruthy()
    expect(authApi.verifyEmailToken).not.toHaveBeenCalled()
  })
})
