import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'
import heroImage from '../assets/hero-image.jpg'

export const navbarContent = {
  logo: {
    src: '/assets/logo.webp',
    alt: 'Video Belajar',
    ariaLabel: 'Video Belajar Home',
  },
  links: [
    { id: 'kategori', label: 'Kategori', to: '/#kategori' },
  ],
  actions: [
    { id: 'login', label: 'Login', to: '/login', variant: 'login' },
    { id: 'register', label: 'Register', to: '/register', variant: 'register' },
  ],
}

export const heroContent = {
  ariaLabel: 'Hero section',
  title: 'Revolusi Pembelajaran: Temukan Ilmu Baru melalui Platform Video Interaktif!',
  description:
    'Temukan ilmu baru yang menarik dan mendalam melalui koleksi video pembelajaran berkualitas tinggi. Tidak hanya itu, Anda juga dapat berpartisipasi dalam latihan interaktif yang akan meningkatkan pemahaman Anda.',
  backgroundImage: heroImage,
  cta: {
    label: 'Temukan Video Course untuk Dipelajari!',
    to: '/#kategori',
  },
}

export const featuredCoursesContent = {
  title: 'Koleksi Video Pembelajaran Unggulan',
  subtitle: 'Jelajahi Dunia Pengetahuan Melalui Pilihan Kami!',
}

export const newsletterContent = {
  ariaLabel: 'Newsletter',
  label: 'NEWSLETTER',
  title: 'Mau Belajar Lebih Banyak?',
  description:
    'Daftarkan dirimu untuk mendapatkan informasi terbaru dan penawaran spesial dari program-program terbaik hariesok.id',
  emailLabel: 'Email',
  placeholder: 'Masukkan Emailmu',
  buttonLabel: 'Subscribe',
  unavailableMessage: 'Fitur belum bisa digunakan saat ini.',
}

export const footerContent = {
  brand: {
    logo: '/assets/logo.webp',
    logoAlt: 'videobelajar',
    title: 'Gali Potensi Anda Melalui Pembelajaran Video di hariesok.id!',
    address: 'Jl. Usman Effendi No. 50 Lowokwaru, Malang',
    phone: '+62-877-7123-1234',
  },
  sections: [
    {
      id: 'kategori',
      title: 'Kategori',
      items: ['Digital & Teknologi', 'Pemasaran', 'Manajemen Bisnis', 'Pengembangan Diri', 'Desain'],
    },
    {
      id: 'perusahaan',
      title: 'Perusahaan',
      items: ['Tentang Kami', 'FAQ', 'Kebijakan Privasi', 'Ketentuan Layanan', 'Bantuan'],
    },
    {
      id: 'komunitas',
      title: 'Komunitas',
      items: ['Tips Sukses', 'Blog'],
    },
  ],
  socialLinks: [
    { id: 'linkedin', label: 'LinkedIn', href: '#', icon: FaLinkedinIn },
    { id: 'facebook', label: 'Facebook', href: '#', icon: FaFacebookF },
    { id: 'instagram', label: 'Instagram', href: '#', icon: FaInstagram },
    { id: 'twitter', label: 'Twitter / X', href: '#', icon: FaXTwitter },
  ],
  copyright: 'videobelajar All Rights Reserved.',
}
