import { useMemo, useState } from 'react'
import CourseCard from '../CourseCard/CourseCard.jsx'
import './Features.css'

function Features({ title, subtitle, categories = [], courses = [] }) {
  const defaultCategoryId = categories[0]?.id ?? 'all'
  const [selectedCategory, setSelectedCategory] = useState(defaultCategoryId)
  const activeCategory = categories.some((category) => category.id === selectedCategory)
    ? selectedCategory
    : defaultCategoryId

  const filteredCourses = useMemo(() => {
    if (activeCategory === 'all') return courses
    return courses.filter((course) => course.category === activeCategory)
  }, [activeCategory, courses])

  return (
    <section id="featured-collection" className="section-wrap featured-courses">
      <div className="page-container">
        <header className="section-header">
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </header>

        {categories.length > 0 && (
          <nav aria-label="Kategori kelas" className="category-tabs">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`tab-button ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={activeCategory === category.id}
              >
                {category.label}
              </button>
            ))}
          </nav>
        )}

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
