import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'
import CourseCard from '../../components/CourseCard/CourseCard.jsx'
import { courseCategories } from '../../utils/courseCatalog.js'
import { formatCompactRupiah } from '../../utils/format.js'
import CourseForm from './CourseForm.jsx'
import UserManager from './UserManager.jsx'
import './AdminDashboard.css'

function AdminDashboard({
  courses,
  isLoading,
  error,
  addCourse,
  updateCourse,
  deleteCourse,
  restoreCourse,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [lastDeleted, setLastDeleted] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [activeTab, setActiveTab] = useState('courses')

  useEffect(() => {
    if (!lastDeleted) return undefined
    const timer = window.setTimeout(() => setLastDeleted(null), 5000)
    return () => window.clearTimeout(timer)
  }, [lastDeleted])

  const totalCourses = courses.length
  const averageRating = totalCourses
    ? (courses.reduce((sum, course) => sum + course.rating, 0) / totalCourses).toFixed(1)
    : '-'
  const averagePrice = totalCourses
    ? formatCompactRupiah(Math.round(courses.reduce((sum, course) => sum + course.price, 0) / totalCourses))
    : '-'
  const filledCategories = new Set(courses.map((course) => course.category)).size

  const stats = [
    { id: 'total', label: 'Total Kelas', value: totalCourses },
    { id: 'rating', label: 'Rating Rata-rata', value: averageRating },
    { id: 'price', label: 'Harga Rata-rata', value: averagePrice },
    { id: 'categories', label: 'Kategori Terisi', value: filledCategories },
  ]

  const visibleCourses = courses.filter((course) => {
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
    return matchesCategory && matchesSearch
  })

  const openCreateForm = () => {
    setEditingCourse(null)
    setIsFormOpen(true)
  }

  const openEditForm = (course) => {
    setEditingCourse(course)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingCourse(null)
  }

  const handleFormSubmit = async (data) => {
    const saved = editingCourse
      ? await updateCourse(editingCourse.id, data)
      : await addCourse(data)
    if (saved) closeForm()
  }

  const handleDelete = async (course) => {
    const removed = await deleteCourse(course.id)
    if (removed) setLastDeleted(removed)
  }

  const handleUndo = () => {
    if (!lastDeleted) return
    restoreCourse(lastDeleted.course)
    setLastDeleted(null)
  }

  return (
    <main className="admin-page">
      <div className="page-container">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">Admin Studio</h1>
            <p className="admin-subtitle">Kelola Koleksi Video Pembelajaran Unggulan.</p>
          </div>
          {activeTab === 'courses' && (
            <button type="button" className="admin-btn-primary admin-add-btn" onClick={openCreateForm}>
              <FiPlus aria-hidden="true" /> Tambah Kelas
            </button>
          )}
        </header>

        <div className="admin-tabs" role="tablist" aria-label="Bagian admin">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'courses'}
            className={`admin-tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Kelas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'users'}
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Pengguna
          </button>
        </div>

        {activeTab === 'courses' ? (
          <>
            <div className="admin-stats">
              {stats.map((stat) => (
                <div className="admin-stat-card" key={stat.id}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="admin-toolbar">
              <label className="admin-search">
                <FiSearch aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Cari judul kelas..."
                  aria-label="Cari judul kelas"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </label>
              <select
                className="admin-filter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Filter kategori"
              >
                {courseCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </div>

            {error && <p className="admin-error" role="alert">{error}</p>}

            {isLoading ? (
              <p className="admin-empty">Memuat kelas…</p>
            ) : visibleCourses.length === 0 ? (
              <p className="admin-empty">
                {totalCourses === 0
                  ? 'Belum ada kelas. Tambahkan kelas pertama untuk mengisi koleksi.'
                  : 'Tidak ada kelas yang cocok dengan pencarian atau filter.'}
              </p>
            ) : (
              <div className="admin-grid">
                {visibleCourses.map((course) => (
                  <div className="admin-card-wrap" key={course.id}>
                    <CourseCard course={course} />
                    <div className="admin-card-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        aria-label={`Edit ${course.title}`}
                        onClick={() => openEditForm(course)}
                      >
                        <FiEdit2 aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn admin-delete-btn"
                        aria-label={`Hapus ${course.title}`}
                        onClick={() => handleDelete(course)}
                      >
                        <FiTrash2 aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <UserManager />
        )}
      </div>

      {isFormOpen && (
        <CourseForm
          key={editingCourse?.id ?? 'new'}
          initialCourse={editingCourse}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
        />
      )}

      {lastDeleted && (
        <div className="admin-toast" role="status">
          <span>Kelas &ldquo;{lastDeleted.course.title}&rdquo; dihapus.</span>
          <button type="button" onClick={handleUndo}>Undo</button>
        </div>
      )}
    </main>
  )
}

export default AdminDashboard
