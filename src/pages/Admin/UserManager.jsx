import { useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { useUsers } from '../../hooks/useUsers.js'

const emptyDraft = { fullName: '', email: '', phone: '', password: '' }

function validateDraft(draft, users, editingId) {
  const errors = {}
  if (!draft.fullName.trim()) errors.fullName = 'Nama lengkap wajib diisi.'
  if (!draft.email.trim()) errors.email = 'E-Mail wajib diisi.'
  if (!draft.password.trim()) errors.password = 'Kata sandi wajib diisi.'
  const email = draft.email.trim().toLowerCase()
  if (email && users.some((user) => user.id !== editingId && user.email.toLowerCase() === email)) {
    errors.email = 'E-Mail sudah terdaftar.'
  }
  return errors
}

function UserForm({ initialUser, users, onSubmit, onClose }) {
  const [draft, setDraft] = useState(() => ({ ...emptyDraft, ...initialUser }))
  const [errors, setErrors] = useState({})

  const setField = (field) => (event) =>
    setDraft((prev) => ({ ...prev, [field]: event.target.value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateDraft(draft, users, initialUser?.id)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit({
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      password: draft.password,
    })
  }

  return (
    <div className="admin-drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        className="admin-drawer"
        onClick={(event) => event.stopPropagation()}
        aria-label={initialUser ? 'Edit pengguna' : 'Tambah pengguna'}
      >
        <header className="admin-drawer-header">
          <h2>{initialUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
          <button type="button" className="admin-icon-btn" aria-label="Tutup form" onClick={onClose}>
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="admin-drawer-body">
          <form className="admin-form" onSubmit={handleSubmit} noValidate>
            <label className="admin-field">
              <span>Nama Lengkap *</span>
              <input type="text" value={draft.fullName} onChange={setField('fullName')} />
              {errors.fullName && <em className="admin-field-error">{errors.fullName}</em>}
            </label>

            <label className="admin-field">
              <span>E-Mail *</span>
              <input type="email" value={draft.email} onChange={setField('email')} />
              {errors.email && <em className="admin-field-error">{errors.email}</em>}
            </label>

            <label className="admin-field">
              <span>No. Hp</span>
              <input type="tel" value={draft.phone} onChange={setField('phone')} />
            </label>

            <label className="admin-field">
              <span>Kata Sandi *</span>
              <input type="text" value={draft.password} onChange={setField('password')} />
              {errors.password && <em className="admin-field-error">{errors.password}</em>}
            </label>

            <div className="admin-form-actions">
              <button type="button" className="admin-btn-secondary" onClick={onClose}>Batal</button>
              <button type="submit" className="admin-btn-primary">
                {initialUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  )
}

function UserManager() {
  const { users, isLoading, error, addUser, updateUser, deleteUser } = useUsers()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const openCreateForm = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  const openEditForm = (user) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingUser(null)
  }

  const handleFormSubmit = async (data) => {
    const saved = editingUser ? await updateUser(editingUser.id, data) : await addUser(data)
    if (saved) closeForm()
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Hapus pengguna "${user.fullName}"?`)) return
    await deleteUser(user.id)
  }

  return (
    <section className="admin-users">
      <div className="admin-users-header">
        <h2>Data Pengguna</h2>
        <button type="button" className="admin-btn-primary" onClick={openCreateForm}>
          <FiPlus aria-hidden="true" /> Tambah Pengguna
        </button>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      {isLoading ? (
        <p className="admin-empty">Memuat pengguna…</p>
      ) : users.length === 0 ? (
        <p className="admin-empty">Belum ada pengguna terdaftar.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>E-Mail</th>
                <th>No. Hp</th>
                <th><span className="sr-only-admin">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td className="admin-table-actions">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      aria-label={`Edit ${user.fullName}`}
                      onClick={() => openEditForm(user)}
                    >
                      <FiEdit2 aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn admin-delete-btn"
                      aria-label={`Hapus ${user.fullName}`}
                      onClick={() => handleDelete(user)}
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <UserForm
          key={editingUser?.id ?? 'new'}
          initialUser={editingUser}
          users={users}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
        />
      )}
    </section>
  )
}

export default UserManager
