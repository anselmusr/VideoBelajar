export function rowToCourse(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    instructor: row.instructor,
    role: row.role,
    company: row.company,
    rating: Number(row.rating),
    reviews: row.reviews,
    price: row.price,
    imageId: row.image_id,
    avatarId: row.avatar_id,
  }
}

export function courseToRow(course) {
  const row = {
    title: course.title,
    description: course.description,
    category: course.category,
    instructor: course.instructor,
    role: course.role,
    company: course.company,
    rating: course.rating,
    reviews: course.reviews,
    price: course.price,
    image_id: course.imageId,
    avatar_id: course.avatarId,
  }

  if (course.id !== undefined) {
    row.id = course.id
  }

  return row
}
