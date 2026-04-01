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
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=120&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=120&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=120&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    rating: 3.5,
    reviews: 86,
    price: 300000,
  },
]

export const courseCatalog = baseCourseCatalog.map((course, index) => ({
  ...course,
  imageUrl: kelasImages[index] ?? kelasImages[0],
  avatarUrl: avatarImages[index] ?? avatarImages[0],
}))
