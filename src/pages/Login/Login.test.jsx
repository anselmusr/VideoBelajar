import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '../../services/api/users.js'
import Login from './Login.jsx'

vi.mock('../../services/api/users.js', () => ({
  getUsers: vi.fn(),
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

describe('Login submit', () => {
  it('login admin memanggil onAdminLogin, navigate ke /admin, tanpa memanggil getUsers', async () => {
    const onAdminLogin = vi.fn()
    const onUserLogin = vi.fn()
    render(<Login onAdminLogin={onAdminLogin} onUserLogin={onUserLogin} />, {
      wrapper: MemoryRouter,
    })
    fillForm('admin@videobelajar.com', 'admin123')
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    await waitFor(() => expect(onAdminLogin).toHaveBeenCalled())
    expect(navigateMock).toHaveBeenCalledWith('/admin')
    expect(usersApi.getUsers).not.toHaveBeenCalled()
  })

  it('login user cocok via API memanggil onUserLogin tanpa password lalu navigate ke /', async () => {
    usersApi.getUsers.mockResolvedValue([
      { id: '1', fullName: 'Ana Pratiwi', email: 'ana@mail.com', password: 'rahasia1' },
    ])
    const onAdminLogin = vi.fn()
    const onUserLogin = vi.fn()
    render(<Login onAdminLogin={onAdminLogin} onUserLogin={onUserLogin} />, {
      wrapper: MemoryRouter,
    })
    fillForm('ana@mail.com', 'rahasia1')
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    await waitFor(() =>
      expect(onUserLogin).toHaveBeenCalledWith({
        id: '1',
        fullName: 'Ana Pratiwi',
        email: 'ana@mail.com',
      }),
    )
    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  it('password salah menampilkan error tanpa memanggil onUserLogin', async () => {
    usersApi.getUsers.mockResolvedValue([
      { id: '1', fullName: 'Ana Pratiwi', email: 'ana@mail.com', password: 'rahasia1' },
    ])
    const onUserLogin = vi.fn()
    render(<Login onAdminLogin={vi.fn()} onUserLogin={onUserLogin} />, { wrapper: MemoryRouter })
    fillForm('ana@mail.com', 'salah')
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(await screen.findByText('Email atau kata sandi salah.')).toBeTruthy()
    expect(onUserLogin).not.toHaveBeenCalled()
  })

  it('menampilkan pesan error API saat getUsers gagal', async () => {
    usersApi.getUsers.mockRejectedValue(
      new Error('Tidak dapat terhubung ke server. Periksa koneksimu.'),
    )
    render(<Login onAdminLogin={vi.fn()} onUserLogin={vi.fn()} />, { wrapper: MemoryRouter })
    fillForm('ana@mail.com', 'rahasia1')
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(
      await screen.findByText('Tidak dapat terhubung ke server. Periksa koneksimu.'),
    ).toBeTruthy()
  })

  it('menampilkan pesan sukses pendaftaran saat location.state.registered true', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { registered: true } }]}>
        <Login onAdminLogin={vi.fn()} onUserLogin={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Pendaftaran berhasil. Silakan masuk.')).toBeTruthy()
  })
})
