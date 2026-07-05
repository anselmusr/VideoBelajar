const kelasImages = Object.entries(
  import.meta.glob('../assets/kelas/*.jpg', { eager: true, import: 'default' }),
)
  .sort(([pathA], [pathB]) => {
    const numberA = Number(pathA.match(/(\d+)\.jpg$/)?.[1] ?? 0)
    const numberB = Number(pathB.match(/(\d+)\.jpg$/)?.[1] ?? 0)
    return numberA - numberB
  })
  .map(([, image]) => image)

const avatarImages = Object.entries(
  import.meta.glob('../assets/avatar/*.png', { eager: true, import: 'default' }),
)
  .sort(([pathA], [pathB]) => {
    const numberA = Number(pathA.match(/(\d+)\.png$/)?.[1] ?? 0)
    const numberB = Number(pathB.match(/(\d+)\.png$/)?.[1] ?? 0)
    return numberA - numberB
  })
  .map(([, image]) => image)

export const courseCategories = [
  { id: 'all', label: 'Semua Kelas' },
  { id: 'marketing', label: 'Pemasaran' },
  { id: 'design', label: 'Desain' },
  { id: 'self-development', label: 'Pengembangan Diri' },
  { id: 'business', label: 'Bisnis' },
]

const baseCourseCatalog = [
  {
    id: 1,
    title: 'Big 4 Auditor Financial Analyst',
    description: 'Mulai transformasi dengan instruktur profesional, harga yang terjangkau, dan materi berkualitas.',
    category: 'business',
    instructor: 'Jenna Ortega',
    role: 'Senior Accountant',
    company: 'di Gojek',
    rating: 3.5,
    reviews: 86,
    price: 300000,
  },
  {
    id: 2,
    title: 'Big 4 Auditor Financial Analyst',
    description: 'Pelajari strategi analisis laporan keuangan dengan studi kasus perusahaan nyata.',
    category: 'business',
    instructor: 'Jenna Ortega',
    role: 'Senior Accountant',
    company: 'di Gojek',
    rating: 3.5,
    reviews: 86,
    price: 300000,
  },
  {
    id: 3,
    title: 'Big 4 Auditor Financial Analyst',
    description: 'Bangun fondasi akuntansi modern dengan pendekatan yang mudah dipahami pemula.',
    category: 'self-development',
    instructor: 'Jenna Ortega',
    role: 'Senior Accountant',
    company: 'di Gojek',
    rating: 3.5,
    reviews: 86,
    price: 300000,
  },
  {
    id: 4,
    title: 'Big 4 Auditor Financial Analyst',
    description: 'Optimalkan performa kerja dengan teknik budgeting dan forecasting yang aplikatif.',
    category: 'marketing',
    instructor: 'Jenna Ortega',
    role: 'Senior Accountant',
    company: 'di Gojek',
    rating: 3.5,
    reviews: 86,
    price: 300000,
  },
  {
    id: 5,
    title: 'Big 4 Auditor Financial Analyst',
    description: 'Kuasai teknik audit berbasis data untuk menghasilkan insight bisnis yang tepat.',
    category: 'design',
    instructor: 'Jenna Ortega',
    role: 'Senior Accountant',
    company: 'di Gojek',
    rating: 3.5,
    reviews: 86,
    price: 300000,
  },
  {
    id: 6,
    title: 'Big 4 Auditor Financial Analyst',
    description: 'Pelajari cara mengevaluasi risiko finansial dengan framework yang dipakai industri.',
    category: 'business',
    instructor: 'Jenna Ortega',
    role: 'Senior Accountant',
    company: 'di Gojek',
    rating: 3.5,
    reviews: 86,
    price: 300000,
  },
  {
    id: 7,
    title: 'Big 4 Auditor Financial Analyst',
    description: 'Dapatkan panduan praktis membangun dashboard keuangan untuk pengambilan keputusan.',
    category: 'marketing',
    instructor: 'Jenna Ortega',
    role: 'Senior Accountant',
    company: 'di Gojek',
    rating: 3.5,
    reviews: 86,
    price: 300000,
  },
  {
    id: 8,
    title: 'Big 4 Auditor Financial Analyst',
    description: 'Meningkatkan produktivitas tim melalui perencanaan finansial yang lebih sistematis.',
    category: 'self-development',
    instructor: 'Jenna Ortega',
    role: 'Senior Accountant',
    company: 'di Gojek',
    rating: 3.5,
    reviews: 86,
    price: 300000,
  },
  {
    id: 9,
    title: 'Big 4 Auditor Financial Analyst',
    description: 'Pahami proses pelaporan keuangan end-to-end dari data mentah sampai presentasi.',
    category: 'design',
    instructor: 'Jenna Ortega',
    role: 'Senior Accountant',
    company: 'di Gojek',
    rating: 3.5,
    reviews: 86,
    price: 300000,
  },
]

export const courseCatalog = baseCourseCatalog.map((course, index) => ({
  ...course,
  imageId: index + 1,
  avatarId: index + 1,
}))

export function resolveCourseAssets(course) {
  const imageUrl = kelasImages[(course.imageId ?? 1) - 1] ?? kelasImages[0]
  const avatarUrl = avatarImages[(course.avatarId ?? 1) - 1] ?? avatarImages[0]
  return { ...course, imageUrl, avatarUrl }
}

export const courseImageOptions = kelasImages.map((src, index) => ({ id: index + 1, src }))

export const courseAvatarOptions = avatarImages.map((src, index) => ({ id: index + 1, src }))
