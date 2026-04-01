import { useState } from 'react'
import './Footer.css'

const footerLinks = {
  kategori: ['Digital & Teknologi', 'Pemasaran', 'Manajemen Bisnis', 'Pengembangan Diri', 'Desain'],
  perusahaan: ['Tentang Kami', 'FAQ', 'Kebijakan Privasi', 'Ketentuan Layanan', 'Bantuan'],
  komunitas: ['Tips Sukses', 'Blog'],
}

const footerSections = [
  { id: 'kategori', title: 'Kategori', items: footerLinks.kategori },
  { id: 'perusahaan', title: 'Perusahaan', items: footerLinks.perusahaan },
  { id: 'komunitas', title: 'Komunitas', items: footerLinks.komunitas },
]

function Footer() {
  const [openSection, setOpenSection] = useState(null)

  const toggleSection = (sectionId) => {
    setOpenSection((current) => (current === sectionId ? null : sectionId))
  }

  return (
    <footer className="site-footer" aria-label="Footer">
      <div className="page-container footer-top">
        <section className="footer-brand" aria-label="Informasi perusahaan">
          <img src="/assets/logo.webp" alt="videobelajar" className="footer-logo" loading="lazy" />
          <h3>Gali Potensi Anda Melalui Pembelajaran Video di hariesok.id!</h3>
          <p>Jl. Usman Effendi No. 50 Lowokwaru, Malang</p>
          <p>+62-877-7123-1234</p>
        </section>

        <nav className="footer-links" aria-label="Navigasi footer">
          {footerSections.map((section) => {
            const isOpen = openSection === section.id

            return (
              <div key={section.id} className="footer-link-group">
                <h4>
                  <button
                    type="button"
                    className="footer-section-toggle"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={isOpen}
                    aria-controls={`footer-${section.id}`}
                  >
                    {section.title}
                  </button>
                </h4>
                <ul id={`footer-${section.id}`} className={isOpen ? 'is-open' : ''}>
                  {section.items.map((item) => (
                    <li key={`${section.id}-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </nav>
      </div>

      <div className="page-container footer-bottom">
        <p>&copy; {new Date().getFullYear()} Gerobak Sayur All Rights Reserved.</p>
        <div className="footer-social" aria-label="Media sosial">
          <a href="#" aria-label="LinkedIn">in</a>
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">ig</a>
          <a href="#" aria-label="Twitter">t</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
