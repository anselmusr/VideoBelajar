import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as usersApi from '../services/api/users.js'
import { useUsers } from './useUsers.js'

vi.mock('../services/api/users.js', () => ({
  getUsers: vi.fn(),
  addUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

const sampleUsers = [
  { id: '1', fullName: 'Ana Pratiwi', email: 'ana@mail.com', phone: '+62811111111', password: 'rahasia1' },
  { id: '2', fullName: 'Budi Santoso', email: 'budi@mail.com', phone: '+62822222222', password: 'rahasia2' },
]

async function renderReadyHook() {
  usersApi.getUsers.mockResolvedValue(sampleUsers)
  const view = renderHook(() => useUsers())
  await waitFor(() => expect(view.result.current.isLoading).toBe(false))
  return view
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useUsers', () => {
  it('mengambil users dari API saat mount', async () => {
    const { result } = await renderReadyHook()
    expect(result.current.users).toEqual(sampleUsers)
    expect(result.current.error).toBeNull()
  })

  it('menyimpan pesan error saat fetch gagal', async () => {
    usersApi.getUsers.mockRejectedValue(new Error('Gagal terhubung.'))
    const { result } = renderHook(() => useUsers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Gagal terhubung.')
    expect(result.current.users).toEqual([])
  })

  it('addUser menambah state setelah API sukses', async () => {
    const { result } = await renderReadyHook()
    usersApi.addUser.mockResolvedValue({ id: '3', fullName: 'Cici', email: 'cici@mail.com' })
    await act(async () => {
      await result.current.addUser({ fullName: 'Cici', email: 'cici@mail.com' })
    })
    expect(result.current.users).toHaveLength(3)
    expect(result.current.users[2].id).toBe('3')
  })

  it('updateUser mengirim objek gabungan dan memakai respons API', async () => {
    const { result } = await renderReadyHook()
    usersApi.updateUser.mockImplementation(async (id, body) => body)
    await act(async () => {
      await result.current.updateUser('1', { fullName: 'Ana Baru' })
    })
    expect(usersApi.updateUser).toHaveBeenCalledWith('1', {
      ...sampleUsers[0],
      fullName: 'Ana Baru',
    })
    expect(result.current.users[0].fullName).toBe('Ana Baru')
  })

  it('deleteUser menghapus dari state; mengembalikan false saat API gagal', async () => {
    const { result } = await renderReadyHook()
    usersApi.deleteUser.mockResolvedValue({})
    await act(async () => {
      await result.current.deleteUser('1')
    })
    expect(result.current.users).toHaveLength(1)

    usersApi.deleteUser.mockRejectedValue(new Error('Permintaan gagal (500). Coba lagi.'))
    let ok
    await act(async () => {
      ok = await result.current.deleteUser('2')
    })
    expect(ok).toBe(false)
    expect(result.current.users).toHaveLength(1)
    expect(result.current.error).toBe('Permintaan gagal (500). Coba lagi.')
  })
})
