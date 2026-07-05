import { FaRegStar, FaStar } from 'react-icons/fa'
import { resolveCourseAssets } from '../../utils/courseCatalog.js'
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
  const resolved = resolveCourseAssets(course)
  const instructorMeta = [resolved.role, resolved.company].filter(Boolean).join(' ')

  return (
    <article className="course-card" aria-label={resolved.title}>
      <img
        className="course-card-image"
        src={resolved.imageUrl}
        alt={resolved.title}
        loading="lazy"
      />

      <CourseRating
        className="mobile-rating"
        rating={resolved.rating}
        reviews={resolved.reviews}
      />

      <div className="course-card-body">
        <h3>{resolved.title}</h3>
        <p>{resolved.description}</p>

        <div className="course-card-instructor">
          <img src={resolved.avatarUrl} alt={resolved.instructor} loading="lazy" />
          <div>
            <strong>{resolved.instructor}</strong>
            <span className="course-meta">{instructorMeta}</span>
          </div>
        </div>

        <div className="course-card-footer">
          <CourseRating
            className="rating-block"
            rating={resolved.rating}
            reviews={resolved.reviews}
          />
          <strong className="price">{priceFormatter(resolved.price)}</strong>
        </div>
      </div>
    </article>
  )
}

export default CourseCard
