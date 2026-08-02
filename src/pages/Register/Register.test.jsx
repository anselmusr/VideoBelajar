import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '../../services/api/auth.js'
import Register from './Register.jsx'

vi.mock('../../services/api/auth.js', () => ({
  registerUser: vi.fn(),
}))

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateMock }
})

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/^Nama Lengkap/), { target: { value: 'Ana Pratiwi' } })
  fireEvent.change(screen.getByLabelText(/^E-Mail/), { target: { value: 'ana@mail.com' } })
  fireEvent.change(screen.getByLabelText(/^No\. Hp/), { target: { value: '81234567890' } })
  fireEvent.change(screen.getByLabelText(/^Kata Sandi/), { target: { value: 'rahasia1' } })
  fireEvent.change(screen.getByLabelText(/^Konfirmasi Kata Sandi/), { target: { value: 'rahasia1' } })
}

describe('Register submit', () => {
  it('memanggil POST /register lalu redirect ke login dengan flag registered', async () => {
    authApi.registerUser.mockResolvedValue({ message: 'Registrasi berhasil.', id: 1 })
    render(<Register />, { wrapper: MemoryRouter })
    fillValidForm()
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith('/login', { state: { registered: true } }),
    )
    expect(authApi.registerUser).toHaveBeenCalledWith({
      fullname: 'Ana Pratiwi',
      email: 'ana@mail.com',
      phone: '+6281234567890',
      password: 'rahasia1',
    })
  })

  it('menampilkan error di field email saat server membalas 409 (email terdaftar)', async () => {
    authApi.registerUser.mockRejectedValue(
      Object.assign(new Error("Duplicate entry 'ana@mail.com'"), { status: 409 }),
    )
    render(<Register />, { wrapper: MemoryRouter })
    fillValidForm()
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(await screen.findByText('E-Mail sudah terdaftar.')).toBeTruthy()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('menampilkan pesan error API saat register gagal karena koneksi', async () => {
    authApi.registerUser.mockRejectedValue(
      new Error('Tidak dapat terhubung ke server. Periksa koneksimu.'),
    )
    render(<Register />, { wrapper: MemoryRouter })
    fillValidForm()
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(
      await screen.findByText('Tidak dapat terhubung ke server. Periksa koneksimu.'),
    ).toBeTruthy()
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
