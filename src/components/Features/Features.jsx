import { useMemo, useState } from 'react'
import { courseCatalog, courseCategories } from '../../utils/courseCatalog'
import './Features.css'

function formatCompactRupiah(value) {
  if (value >= 1000) {
    return `Rp ${Math.round(value / 1000)}K`
  }
  return `Rp ${value}`
}

function CourseCard({ course }) {
  const filledStars = Math.round(course.rating)

  return (
    <article className="course-card" aria-label={course.title}>
      <img
        className="course-card-image"
        src={course.imageUrl}
        alt={course.title}
        loading="lazy"
      />

      <div className="mobile-rating" aria-label={`Rating ${course.rating} dari 5`}>
        <span className="stars" aria-hidden="true">
          {'★'.repeat(filledStars)}
          {'☆'.repeat(5 - filledStars)}
        </span>
        <span>
          {course.rating} ({course.reviews})
        </span>
      </div>

      <div className="course-card-body">
        <h3>{course.title}</h3>
        <p>{course.description}</p>

        <div className="course-card-instructor">
          <img src={course.avatarUrl} alt={course.instructor} loading="lazy" />
          <div>
            <strong>{course.instructor}</strong>
            <span className="course-meta">{course.role}</span>
          </div>
        </div>

        <div className="course-card-footer">
          <div className="rating-block" aria-label={`Rating ${course.rating} dari 5`}>
            <span className="stars" aria-hidden="true">
              {'★'.repeat(filledStars)}
              {'☆'.repeat(5 - filledStars)}
            </span>
            <span>
              {course.rating} ({course.reviews})
            </span>
          </div>
          <strong className="price">{formatCompactRupiah(course.price)}</strong>
        </div>
      </div>
    </article>
  )
}

function Features() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredCourses = useMemo(() => {
    if (activeCategory === 'all') return courseCatalog
    return courseCatalog.filter((course) => course.category === activeCategory)
  }, [activeCategory])

  return (
    <section id="featured-collection" className="section-wrap featured-courses">
      <div className="page-container">
        <header className="section-header">
          <h2 className="section-title">Koleksi Video Pembelajaran Unggulan</h2>
          <p className="section-subtitle">Jelajahi Dunia Pengetahuan Melalui Pilihan Kami!</p>
        </header>

        <nav aria-label="Kategori kelas" className="category-tabs">
          {courseCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`tab-button ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={activeCategory === category.id}
            >
              {category.label}
            </button>
          ))}
        </nav>

        <div className="course-grid">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
