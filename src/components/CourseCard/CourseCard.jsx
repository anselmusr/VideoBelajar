import { FaRegStar, FaStar } from 'react-icons/fa'
import './CourseCard.css'

function formatCompactRupiah(value) {
  if (value >= 1000) {
    return `Rp ${Math.round(value / 1000)}K`
  }

  return `Rp ${value}`
}

function CourseRating({ rating, reviews, className = '' }) {
  const filledStars = Math.round(rating)
  const stars = Array.from({ length: 5 }, (_, index) => index < filledStars)

  return (
    <div className={`course-rating ${className}`.trim()} aria-label={`Rating ${rating} dari 5`}>
      <span className="stars" aria-hidden="true">
        {stars.map((isFilled, index) => (
          isFilled ? <FaStar key={index} /> : <FaRegStar key={index} />
        ))}
      </span>
      <span>
        {rating} ({reviews})
      </span>
    </div>
  )
}

function CourseCard({ course, priceFormatter = formatCompactRupiah }) {
  const instructorMeta = [course.role, course.company].filter(Boolean).join(' ')

  return (
    <article className="course-card" aria-label={course.title}>
      <img
        className="course-card-image"
        src={course.imageUrl}
        alt={course.title}
        loading="lazy"
      />

      <CourseRating
        className="mobile-rating"
        rating={course.rating}
        reviews={course.reviews}
      />

      <div className="course-card-body">
        <h3>{course.title}</h3>
        <p>{course.description}</p>

        <div className="course-card-instructor">
          <img src={course.avatarUrl} alt={course.instructor} loading="lazy" />
          <div>
            <strong>{course.instructor}</strong>
            <span className="course-meta">{instructorMeta}</span>
          </div>
        </div>

        <div className="course-card-footer">
          <CourseRating
            className="rating-block"
            rating={course.rating}
            reviews={course.reviews}
          />
          <strong className="price">{priceFormatter(course.price)}</strong>
        </div>
      </div>
    </article>
  )
}

export default CourseCard
