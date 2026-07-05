export const ADMIN_CREDENTIALS = {
  email: 'admin@videobelajar.com',
  password: 'admin123',
}

export function isAdminCredentials(email, password) {
  return (
    email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
    password === ADMIN_CREDENTIALS.password
  )
}
