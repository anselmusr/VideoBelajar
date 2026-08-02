import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '../../services/api/auth.js'
import Login from './Login.jsx'

vi.mock('../../services/api/auth.js', () => ({
  loginUser: vi.fn(),
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

function fillForm(email, password) {
  fireEvent.change(screen.getByLabelText(/^E-Mail/), { target: { value: email } })
  fireEvent.change(screen.getByLabelText(/^Kata Sandi/), { target: { value: password } })
}

const apiError = (message, status) => Object.assign(new Error(message), { status })

describe('Login submit', () => {
  it('login admin memanggil onAdminLogin, navigate ke /admin, tanpa memanggil API', async () => {
    const onAdminLogin = vi.fn()
    const onUserLogin = vi.fn()
    render(<Login onAdminLogin={onAdminLogin} onUserLogin={onUserLogin} />, {
      wrapper: MemoryRouter,
    })
    fillForm('admin@videobelajar.com', 'admin123')
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    await waitFor(() => expect(onAdminLogin).toHaveBeenCalled())
    expect(navigateMock).toHaveBeenCalledWith('/admin')
    expect(authApi.loginUser).not.toHaveBeenCalled()
  })

  it('login sukses menyimpan data user (tanpa JWT) lalu navigate ke /', async () => {
    authApi.loginUser.mockResolvedValue({
      message: 'Login berhasil.',
      token: 'jwt-token',
      user: { id: 1, fullname: 'Ana Pratiwi', username: 'ana', email: 'ana@mail.com' },
    })
    const onUserLogin = vi.fn()
    render(<Login onAdminLogin={vi.fn()} onUserLogin={onUserLogin} />, { wrapper: MemoryRouter })
    fillForm('ana@mail.com', 'rahasia1')
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    // token tidak ikut disimpan: tidak ada request frontend yang memakainya
    await waitFor(() =>
      expect(onUserLogin).toHaveBeenCalledWith({
        id: 1,
        fullName: 'Ana Pratiwi',
        email: 'ana@mail.com',
      }),
    )
    expect(authApi.loginUser).toHaveBeenCalledWith({ email: 'ana@mail.com', password: 'rahasia1' })
    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  it('respons 200 tanpa data user ditolak, tidak menulis sesi', async () => {
    // bentuk respons backend versi lama: { message, token } tanpa user
    authApi.loginUser.mockResolvedValue({ message: 'Login berhasil.', token: 'jwt-token' })
    const onUserLogin = vi.fn()
    render(<Login onAdminLogin={vi.fn()} onUserLogin={onUserLogin} />, { wrapper: MemoryRouter })
    fillForm('ana@mail.com', 'rahasia1')
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(await screen.findByText('Respons login tidak valid. Coba lagi nanti.')).toBeTruthy()
    expect(onUserLogin).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('kredensial salah (401) menampilkan pesan server tanpa memanggil onUserLogin', async () => {
    authApi.loginUser.mockRejectedValue(apiError('Email atau password yang dimasukkan salah.', 401))
    const onUserLogin = vi.fn()
    render(<Login onAdminLogin={vi.fn()} onUserLogin={onUserLogin} />, { wrapper: MemoryRouter })
    fillForm('ana@mail.com', 'salah')
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(await screen.findByText('Email atau password yang dimasukkan salah.')).toBeTruthy()
    expect(onUserLogin).not.toHaveBeenCalled()
  })

  it('akun belum verifikasi (403) menampilkan pesan verifikasi', async () => {
    authApi.loginUser.mockRejectedValue(
      apiError('Email belum diverifikasi. Cek inbox kamu untuk tautan verifikasi.', 403),
    )
    render(<Login onAdminLogin={vi.fn()} onUserLogin={vi.fn()} />, { wrapper: MemoryRouter })
    fillForm('ana@mail.com', 'rahasia1')
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(
      await screen.findByText('Email belum diverifikasi. Cek inbox kamu untuk tautan verifikasi.'),
    ).toBeTruthy()
  })

  it('menampilkan pesan koneksi saat API tidak terjangkau', async () => {
    authApi.loginUser.mockRejectedValue(
      new Error('Tidak dapat terhubung ke server. Periksa koneksimu.'),
    )
    render(<Login onAdminLogin={vi.fn()} onUserLogin={vi.fn()} />, { wrapper: MemoryRouter })
    fillForm('ana@mail.com', 'rahasia1')
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(
      await screen.findByText('Tidak dapat terhubung ke server. Periksa koneksimu.'),
    ).toBeTruthy()
  })

  it('menampilkan pesan cek email saat state.registered true', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { registered: true } }]}>
        <Login onAdminLogin={vi.fn()} onUserLogin={vi.fn()} />
      </MemoryRouter>,
    )
    expect(
      screen.getByText(/Pendaftaran berhasil\. Cek email kamu untuk tautan verifikasi/),
    ).toBeTruthy()
  })
})
