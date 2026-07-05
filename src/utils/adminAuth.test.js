import { describe, expect, it } from 'vitest'
import { ADMIN_CREDENTIALS, isAdminCredentials } from './adminAuth.js'

describe('isAdminCredentials', () => {
  it('true untuk kredensial admin yang benar', () => {
    expect(isAdminCredentials(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password)).toBe(true)
  })

  it('mengabaikan kapitalisasi dan spasi pada email', () => {
    expect(isAdminCredentials('  Admin@VideoBelajar.com ', 'admin123')).toBe(true)
  })

  it('false untuk password salah', () => {
    expect(isAdminCredentials(ADMIN_CREDENTIALS.email, 'salah123')).toBe(false)
  })

  it('false untuk email yang bukan admin', () => {
    expect(isAdminCredentials('user@videobelajar.com', ADMIN_CREDENTIALS.password)).toBe(false)
  })

  it('password case-sensitive', () => {
    expect(isAdminCredentials(ADMIN_CREDENTIALS.email, 'ADMIN123')).toBe(false)
  })
})
