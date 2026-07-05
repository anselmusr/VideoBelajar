import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import CourseCard from '../../components/CourseCard/CourseCard.jsx'
import {
  courseAvatarOptions,
  courseCategories,
  courseImageOptions,
} from '../../utils/courseCatalog.js'

const emptyDraft = {
  title: '',
  description: '',
  category: 'business',
  instructor: '',
  role: '',
  company: '',
  price: '',
  rating: '',
  reviews: '',
  imageId: 1,
  avatarId: 1,
}

const categoryOptions = courseCategories.filter((category) => category.id !== 'all')

function draftFromCourse(course) {
  return {
    ...emptyDraft,
    ...course,
    price: String(course.price ?? ''),
    rating: String(course.rating ?? ''),
    reviews: String(course.reviews ?? ''),
  }
}

function validateDraft(draft) {
  const errors = {}
  if (!draft.title.trim()) errors.title = 'Judul wajib diisi.'
  if (!draft.description.trim()) errors.description = 'Deskripsi wajib diisi.'
  const price = Number(draft.price)
  if (draft.price === '' || Number.isNaN(price) || price < 0) {
    errors.price = 'Harga wajib diisi dan tidak boleh negatif.'
  }
  const rating = Number(draft.rating)
  if (draft.rating !== '' && (Number.isNaN(rating) || rating < 0 || rating > 5)) {
    errors.rating = 'Rating harus di antara 0 dan 5.'
  }
  const reviews = Number(draft.reviews)
  if (draft.reviews !== '' && (Number.isNaN(reviews) || reviews < 0)) {
    errors.reviews = 'Jumlah ulasan tidak boleh negatif.'
  }
  return errors
}

function courseFromDraft(draft) {
  return {
    ...draft,
    title: draft.title.trim(),
    description: draft.description.trim(),
    instructor: draft.instructor.trim(),
    role: draft.role.trim(),
    company: draft.company.trim(),
    price: Number(draft.price) || 0,
    rating: Number(draft.rating) || 0,
    reviews: Number(draft.reviews) || 0,
  }
}

function CourseForm({ initialCourse, onSubmit, onClose, isSaving = false }) {
  const [draft, setDraft] = useState(() =>
    initialCourse ? draftFromCourse(initialCourse) : emptyDraft,
  )
  const [errors, setErrors] = useState({})

  const setField = (field) => (event) =>
    setDraft((prev) => ({ ...prev, [field]: event.target.value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateDraft(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(courseFromDraft(draft))
  }

  const previewCourse = {
    ...courseFromDraft(draft),
    id: initialCourse?.id ?? 0,
    title: draft.title.trim() || 'Judul Kelas',
    description: draft.description.trim() || 'Deskripsi singkat kelas akan tampil di sini.',
    instructor: draft.instructor.trim() || 'Nama Instruktur',
  }

  return (
    <div className="admin-drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        className="admin-drawer"
        onClick={(event) => event.stopPropagation()}
        aria-label={initialCourse ? 'Edit kelas' : 'Tambah kelas'}
      >
        <header className="admin-drawer-header">
          <h2>{initialCourse ? 'Edit Kelas' : 'Tambah Kelas'}</h2>
          <button type="button" className="admin-icon-btn" aria-label="Tutup form" onClick={onClose}>
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="admin-drawer-body">
          <form className="admin-form" onSubmit={handleSubmit} noValidate>
            <label className="admin-field">
              <span>Judul *</span>
              <input type="text" value={draft.title} onChange={setField('title')} />
              {errors.title && <em className="admin-field-error">{errors.title}</em>}
            </label>

            <label className="admin-field">
              <span>Deskripsi *</span>
              <textarea rows={3} value={draft.description} onChange={setField('description')} />
              {errors.description && <em className="admin-field-error">{errors.description}</em>}
            </label>

            <label className="admin-field">
              <span>Kategori</span>
              <select value={draft.category} onChange={setField('category')}>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </label>

            <div className="admin-field-row">
              <label className="admin-field">
                <span>Instruktur</span>
                <input type="text" value={draft.instructor} onChange={setField('instructor')} />
              </label>
              <label className="admin-field">
                <span>Role</span>
                <input type="text" value={draft.role} onChange={setField('role')} />
              </label>
            </div>

            <label className="admin-field">
              <span>Perusahaan</span>
              <input type="text" value={draft.company} onChange={setField('company')} placeholder="mis. di Gojek" />
            </label>

            <div className="admin-field-row">
              <label className="admin-field">
                <span>Harga (Rp) *</span>
                <input type="number" min="0" value={draft.price} onChange={setField('price')} />
                {errors.price && <em className="admin-field-error">{errors.price}</em>}
              </label>
              <label className="admin-field">
                <span>Rating (0-5)</span>
                <input type="number" min="0" max="5" step="0.1" value={draft.rating} onChange={setField('rating')} />
                {errors.rating && <em className="admin-field-error">{errors.rating}</em>}
              </label>
              <label className="admin-field">
                <span>Ulasan</span>
                <input type="number" min="0" value={draft.reviews} onChange={setField('reviews')} />
                {errors.reviews && <em className="admin-field-error">{errors.reviews}</em>}
              </label>
            </div>

            <fieldset className="admin-picker">
              <legend>Gambar Kelas</legend>
              <div className="admin-picker-grid">
                {courseImageOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`admin-thumb ${draft.imageId === option.id ? 'selected' : ''}`}
                    aria-pressed={draft.imageId === option.id}
                    onClick={() => setDraft((prev) => ({ ...prev, imageId: option.id }))}
                  >
                    <img src={option.src} alt={`Gambar kelas ${option.id}`} />
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="admin-picker">
              <legend>Avatar Instruktur</legend>
              <div className="admin-picker-grid">
                {courseAvatarOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`admin-thumb round ${draft.avatarId === option.id ? 'selected' : ''}`}
                    aria-pressed={draft.avatarId === option.id}
                    onClick={() => setDraft((prev) => ({ ...prev, avatarId: option.id }))}
                  >
                    <img src={option.src} alt={`Avatar ${option.id}`} />
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="admin-form-actions">
              <button type="button" className="admin-btn-secondary" onClick={onClose}>Batal</button>
              <button type="submit" className="admin-btn-primary" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : initialCourse ? 'Simpan Perubahan' : 'Tambah Kelas'}
              </button>
            </div>
          </form>

          <div className="admin-preview">
            <p className="admin-preview-label">Live Preview</p>
            <CourseCard course={previewCourse} />
          </div>
        </div>
      </aside>
    </div>
  )
}

export default CourseForm
